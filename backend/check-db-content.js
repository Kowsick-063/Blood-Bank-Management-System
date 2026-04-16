const prisma = require('./src/prisma/client');

async function checkDB() {
  try {
    const usersCount = await prisma.user.count();
    console.log(`Total users in DB: ${usersCount}`);
    
    const users = await prisma.user.findMany({ take: 5 });
    console.log('Sample users:', users.map(u => u.email));
    
    const otpsCount = await prisma.otp.count();
    console.log(`Total OTPs in DB: ${otpsCount}`);
    
  } catch (err) {
    console.error('❌ Query failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
