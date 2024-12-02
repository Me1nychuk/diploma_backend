import { Expose, Type } from 'class-transformer';
import { Comment as PrismaComment } from '@prisma/client';
import { NewsResponse } from 'src/news/responses/news.response';
import { UserResponse } from 'src/users/responses';

export class CommentResponse implements PrismaComment {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  newsId: string;

  @Expose()
  @Type(() => NewsResponse)
  news: NewsResponse;

  @Expose()
  authorId: string;

  @Expose()
  @Type(() => UserResponse)
  author: UserResponse;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(comment: PrismaComment) {
    Object.assign(this, comment);
  }
}
