const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client with query logging (optional)
const prisma = new PrismaClient({
  errorFormat: 'pretty',
});

// Create reusable connection function using async/await
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully via Prisma');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Handle graceful disconnects
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Prisma disconnected on app termination');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Prisma disconnected on app termination');
  process.exit(0);
});

prisma.connectDB = connectDB;
module.exports = prisma;
