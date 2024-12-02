import { Expose, Type } from 'class-transformer';
import { Discussion as PrismaDiscussion } from '@prisma/client';
import { UserResponse } from 'src/users/responses';
import { OpinionResponse } from 'src/opinions/responses';

export class DiscussionResponse implements PrismaDiscussion {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => OpinionResponse)
  opinions: OpinionResponse[];

  @Expose()
  authorId: string;

  @Expose()
  @Type(() => UserResponse)
  author: UserResponse;

  @Expose()
  isApproved: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(discussion: PrismaDiscussion) {
    Object.assign(this, discussion);
  }
}
