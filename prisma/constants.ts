import { Role } from '../src/types/types';
export const users = [
  {
    fullname: 'John Doe',
    email: 'john.doe@example.com',
    nickname: 'johnd',
    password: 'hashedPassword123',
    phone: '123-456-7890',
    bio: 'Avid reader and writer.',
    isTeacher: false,
  },
  {
    fullname: 'Jane Smith',
    email: 'jane.smith@example.com',
    nickname: 'janes',
    password: 'hashedPassword456',
    phone: '987-654-3210',
    bio: 'Passionate educator and researcher.',
    role: Role.TEACHER,
    isTeacher: true,
  },
];

export const news = [
  {
    title: 'New School Policies Announced',
    content:
      'The school administration has announced new policies for the upcoming semester...',
    imageUrl: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  },
  {
    title: 'Upcoming Sports Events',
    content:
      'The sports department has released the schedule for the next season...',
  },
];

export const comments = [
  {
    content: 'This is really helpful, thanks for sharing!',
    authorId: '1', // Refers to John Doe
    newsId: '1', // Refers to "New School Policies Announced"
  },
  {
    content: 'I’m looking forward to the new semester!',
    authorId: '2', // Refers to Jane Smith
    newsId: '1', // Refers to "New School Policies Announced"
  },
];
