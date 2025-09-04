// Create test users for development
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('🔐 Creating test users...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const userPasswordHash = await bcrypt.hash('test123', 12);

  try {
    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@admin.com' },
      update: {},
      create: {
        email: 'admin@admin.com',
        name: 'Administrator',
        passwordHash: adminPasswordHash,
        role: 'ADMIN'
      }
    });

    // Create regular user
    const user = await prisma.user.upsert({
      where: { email: 'user@test.com' },
      update: {},
      create: {
        email: 'user@test.com',
        name: 'Test User',
        passwordHash: userPasswordHash,
        role: 'USER'
      }
    });

    console.log('✅ Test users created successfully:');
    console.log('👤 Admin User:');
    console.log('   Email: admin@admin.com');
    console.log('   Password: admin123');
    console.log('   Role: ADMIN');
    console.log('');
    console.log('👤 Test User:');
    console.log('   Email: user@test.com');
    console.log('   Password: test123');
    console.log('   Role: USER');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();