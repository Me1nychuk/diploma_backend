import { Expose, Type } from 'class-transformer';
import { Opinion as PrismaOpinion } from '@prisma/client';
import { UserResponse } from 'src/users/responses';
import { DiscussionResponse } from 'src/discussions/responses';

export class OpinionResponse implements PrismaOpinion {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  discussionId: string;

  @Expose()
  @Type(() => DiscussionResponse)
  discussion: DiscussionResponse;

  @Expose()
  authorId: string;

  @Expose()
  @Type(() => UserResponse)
  author: UserResponse;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(opinion: PrismaOpinion) {
    Object.assign(this, opinion);
  }
}
