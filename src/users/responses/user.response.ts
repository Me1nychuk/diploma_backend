import { Discussion, Opinion, Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponse implements User {
  id: string;
  fullname: string;
  email: string;

  @Exclude()
  password: string;

  phone: string;
  bio: string;
  role: Role;

  @Exclude()
  verificationToken: string;

  isVerified: boolean;
  isBlocked: boolean;
  comments: Comment[];
  discussions: Discussion[];
  opinions: Opinion[];
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User) {
    Object.assign(this, user);
  }
}
