import { PrismaService } from '../src/prisma.service';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaService();

async function up() {
  // Створення користувачів
  const adminUser = await prisma.user.create({
    data: {
      fullname: 'Test Administrator',
      email: 'admin@example.com',
      password: await bcrypt.hash('password', 10),
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      fullname: 'Test User',
      email: 'user@example.com',
      password: await bcrypt.hash('password', 10),
      isVerified: true,
    },
  });

  // Створення новин
  const news1 = await prisma.news.create({
    data: {
      title: 'Test news 1',
      content: 'Test news 1 content',
    },
  });

  const news2 = await prisma.news.create({
    data: {
      title: 'Test news 2',
      content: 'Test news 2 content',
    },
  });

  // Створення коментарів
  const comment1 = await prisma.comment.create({
    data: {
      authorId: adminUser.id,
      newsId: news1.id,
      content: 'Test comment 1',
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      authorId: normalUser.id,
      newsId: news1.id,
      content: 'Test comment 2',
    },
  });

  console.log('Seed complete!');
}

async function down() {
  // Очищення таблиць з перезапуском ідентифікаторів і каскадними операціями
  await prisma.$executeRaw`TRUNCATE TABLE "opinions" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "discussions" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "comments" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "news" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`;

  console.log('Database reset complete!');
}

async function main() {
  try {
    await down(); // Спочатку очищаємо базу даних
    await up(); // Потім додаємо нові дані
  } catch (error) {
    console.error('Error running the seeder:', error);
  }
}

main()
  .then(() => {
    console.log('Seeding complete');
    prisma.$disconnect();
  })
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
