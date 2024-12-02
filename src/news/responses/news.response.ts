import { Expose, Type } from 'class-transformer';
import { News as PrismaNews } from '@prisma/client';
import { CommentResponse } from 'src/comments/responses';

export class NewsResponse implements PrismaNews {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  imageUrl: string[];

  @Expose()
  @Type(() => CommentResponse)
  comments?: CommentResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(news: PrismaNews) {
    Object.assign(this, news);
  }
}
