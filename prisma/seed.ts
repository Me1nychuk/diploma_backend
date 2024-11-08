import { PrismaService } from '../src/prisma.service';
import { users, news, comments } from './constants';

const prisma = new PrismaService();

// !TODO: add more basic data, and more variables - with normal relations and don't forget to delete old data.
async function up() {
  // Створення користувачів
  const createdUsers = await prisma.user.createMany({
    data: users,
  });

  // Створення новин
  const createdNews = await prisma.news.createMany({
    data: news,
  });
  // отримання користвачів
  const newUsers = await prisma.user.findMany();
  // отримання новин
  const newNews = await prisma.news.findMany();
  // Створення коментарів
  const createdComments = await prisma.comment.createMany({
    data: [
      {
        authorId: newUsers[0].id,
        newsId: newNews[0].id,
        content: 'Test comment 1',
      },
      {
        authorId: newUsers[1].id,
        newsId: newNews[0].id,
        content: 'Test comment 2',
      },
    ],
  });

  console.log('Seed complete!');
}

async function down() {
  // Очищення таблиць з перезапуском ідентифікаторів
  await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "News" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Comment" RESTART IDENTITY CASCADE`;

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
