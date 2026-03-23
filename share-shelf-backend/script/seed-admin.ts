import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const nanoid = customAlphabet('1234567890abcdef', 21);

async function main() {
  try {
    console.log('🌱 Truncating DashboardUser table...');
    await prisma.dashboardUser.deleteMany({});

    console.log('🌱 Seeding Admin User...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.dashboardUser.create({
      data: {
        id: nanoid(),
        email: 'admin@shareshelf.com',
        password: hashedPassword,
        name: 'Super Admin',
        avatar: null,
      },
    });

    console.log(`🎉 SEEDING COMPLETE!
Admin Email: ${admin.email}
Admin Password: admin123 🔑`);
  } catch (error) {
    console.error('💥 Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
