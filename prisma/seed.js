// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Seed the database with initial users
 */
async function main() {
  console.log('Starting database seeding...');
  
  try {
    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const userPasswordHash = await bcrypt.hash('user123', 12);
    
    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@admin.de' },
      update: {},
      create: {
        email: 'admin@admin.de',
        name: 'Administrator',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    });
    
    console.log(`Admin user ${admin.id} (${admin.email}) ${admin.createdAt ? 'created' : 'already exists'}`);
    
    // Create or update regular user
    const user = await prisma.user.upsert({
      where: { email: 'user@user.de' },
      update: {},
      create: {
        email: 'user@user.de',
        name: 'Test User',
        passwordHash: userPasswordHash,
        role: 'USER',
      },
    });
    
    console.log(`Regular user ${user.id} (${user.email}) ${user.createdAt ? 'created' : 'already exists'}`);
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seed function
main()
  .then(() => {
    console.log('Seeding completed, disconnecting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error during seeding:', error);
    process.exit(1);
  });
