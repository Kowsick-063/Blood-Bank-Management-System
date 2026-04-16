-- 1. Enable PostGIS (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Function to register a blood bank with coordinates
CREATE OR REPLACE FUNCTION register_blood_bank(
  p_name TEXT,
  p_contact_number TEXT,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION
) RETURNS JSON AS $$
DECLARE
  v_bank_id UUID;
BEGIN
  INSERT INTO blood_banks (name, contact_number, location)
  VALUES (p_name, p_contact_number, ST_GeogFromText('POINT(' || p_longitude || ' ' || p_latitude || ')'))
  RETURNING id INTO v_bank_id;
  
  RETURN json_build_object('id', v_bank_id, 'status', 'success');
END;
$$ LANGUAGE plpgsql;

-- 3. Function to create a blood request with coordinates
CREATE OR REPLACE FUNCTION create_blood_request(
  p_user_id UUID,
  p_patient_name TEXT,
  p_blood_type TEXT,
  p_units INT,
  p_hospital TEXT,
  p_urgency TEXT,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION
) RETURNS JSON AS $$
DECLARE
  v_request_id UUID;
BEGIN
  INSERT INTO blood_requests (
    "userId", 
    patient_name, 
    blood_type, 
    units, 
    hospital, 
    urgency, 
    location,
    status
  )
  VALUES (
    p_user_id, 
    p_patient_name, 
    p_blood_type, 
    p_units, 
    p_hospital, 
    p_urgency, 
    ST_GeogFromText('POINT(' || p_longitude || ' ' || p_latitude || ')'),
    'pending'
  )
  RETURNING id INTO v_request_id;
  
  RETURN json_build_object('id', v_request_id, 'status', 'success');
END;
$$ LANGUAGE plpgsql;

-- 4. Function to find nearest blood banks for a specific request
CREATE OR REPLACE FUNCTION find_nearest_blood_banks(
  p_request_id UUID,
  p_radius_meters DOUBLE PRECISION DEFAULT 50000 -- 50km default
) RETURNS TABLE (
  bank_id UUID,
  bank_name TEXT,
  contact_number TEXT,
  distance_meters DOUBLE PRECISION,
  available_units INT,
  blood_type TEXT
) AS $$
DECLARE
  v_request_location GEOGRAPHY;
  v_request_blood_type TEXT;
BEGIN
  -- Get request location and blood type
  SELECT location, blood_type INTO v_request_location, v_request_blood_type
  FROM blood_requests 
  WHERE id = p_request_id;

  RETURN QUERY
  SELECT 
    bb.id AS bank_id,
    bb.name AS bank_name,
    bb.contact_number,
    ST_Distance(bb.location, v_request_location) AS distance_meters,
    COALESCE(bs.units, 0) AS available_units,
    v_request_blood_type
  FROM blood_banks bb
  LEFT JOIN blood_stock bs ON bs."bankId" = bb.id AND bs.blood_type = v_request_blood_type
  WHERE ST_DWithin(bb.location, v_request_location, p_radius_meters)
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
