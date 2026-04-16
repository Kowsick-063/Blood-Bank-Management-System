const prisma = require('./src/prisma/client');

async function testInsert() {
  try {
    const user = await prisma.user.create({
      data: {
        name: 'Prisma Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'hashed_password',
        role: 'donor',
        is_verified: true
      }
    });
    console.log('✅ Successfully inserted user:', user.email);
    
    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✅ Successfully cleaned up.');
    
  } catch (err) {
    console.error('❌ Insert failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testInsert();
