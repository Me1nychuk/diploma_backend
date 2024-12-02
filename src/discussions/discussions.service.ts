import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { PrismaService } from 'src/prisma.service';
import { Discussion, Role } from '@prisma/client';
import { handleError } from 'libs/common/src/helpers/handleError';
import { PrepareResponse } from 'libs/common/src/helpers/prepareResponse';
import { PaginatedResponse } from 'src/types/types';
import { JWTPayload } from 'src/auth/interfaces';

@Injectable()
export class DiscussionsService {
  constructor(private readonly prisma: PrismaService) {}
  async checkDiscussionExists(id: string): Promise<Discussion | null> {
    try {
      const discussion = await this.prisma.discussion.findFirst({
        where: {
          id: id,
        },
        include: {
          opinions: true,
          author: true,
        },
      });

      if (!discussion) {
        throw new HttpException(`Discussion not found`, HttpStatus.NOT_FOUND);
      }

      return discussion;
    } catch (error: unknown) {
      handleError(error, 'Error checking if news exists');
    }
  }
  async create(
    createDiscussionDto: CreateDiscussionDto,
    currentUser: JWTPayload,
  ): Promise<Discussion | null> {
    try {
      const newDiscussion = await this.prisma.discussion.create({
        data: {
          title: createDiscussionDto.title,
          content: createDiscussionDto.content ?? undefined,
          authorId: currentUser.id,
        },
        include: {
          opinions: true,
          author: true,
        },
      });
      if (!newDiscussion) {
        throw new HttpException(
          `Discussion not created`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return newDiscussion;
    } catch (error) {
      handleError(error, 'Error creating discussion');
    }
  }

  async findAll(
    per_page: string,
    page: string,
    search: string,
    sortBy: 'title' | 'date' = 'title',
    order: 'asc' | 'desc' = 'asc',
    authorId: string = '',
  ): Promise<PaginatedResponse<Discussion> | null> {
    try {
      const discussions = await this.prisma.discussion.findMany({
        skip: Number(per_page) * (Number(page) - 1),
        take: Number(per_page),
        where: {
          title: {
            contains: search,
          },
          ...(authorId && { authorId: authorId }),
        },
        include: {
          opinions: true,
          author: true,
        },
        orderBy: {
          [sortBy == 'title' ? 'title' : 'createdAt']: order,
        },
      });
      if (discussions.length === 0) {
        throw new HttpException(`No discussions found`, HttpStatus.NOT_FOUND);
      }
      const allDiscussions = await this.prisma.discussion.findMany({
        where: {
          title: {
            contains: search,
          },
          ...(authorId && { authorId: authorId }),
        },
        include: {
          opinions: true,
          author: true,
        },
      });
      return PrepareResponse(
        discussions,
        allDiscussions.length,
        Math.ceil(allDiscussions.length / Number(per_page)),
        Number(page),
      );
    } catch (error) {
      handleError(error, 'Error getting discussions');
    }
  }

  async findOne(id: string): Promise<Discussion | null> {
    try {
      await this.checkDiscussionExists(id);
      const discussion = await this.prisma.discussion.findFirst({
        where: {
          id: id,
        },
        include: {
          opinions: true,
          author: true,
        },
      });
      if (!discussion) {
        throw new HttpException(`Discussion not found`, HttpStatus.NOT_FOUND);
      }
      return discussion;
    } catch (error) {
      handleError(error, 'Error getting discussion');
    }
  }

  async update(
    id: string,
    updateDiscussionDto: UpdateDiscussionDto,
    currentUser: JWTPayload,
  ): Promise<Discussion | null> {
    try {
      const discussion = await this.checkDiscussionExists(id);
      if (
        discussion.authorId !== currentUser.id &&
        currentUser.role !== Role.ADMIN
      ) {
        throw new HttpException(
          `You can't update this discussion`,
          HttpStatus.FORBIDDEN,
        );
      }

      const updatedDiscussion = this.prisma.discussion.update({
        where: {
          id: id,
        },
        data: {
          title: updateDiscussionDto.title ?? undefined,
          content: updateDiscussionDto.content ?? undefined,
        },
        include: {
          opinions: true,
        },
      });

      return updatedDiscussion;
    } catch (error) {
      handleError(error, 'Error updating discussion');
    }
  }

  async remove(
    id: string,
    currentUser: JWTPayload,
  ): Promise<Discussion | null> {
    try {
      const discussion = await this.checkDiscussionExists(id);
      if (
        discussion.authorId !== currentUser.id &&
        currentUser.role !== Role.ADMIN
      ) {
        throw new HttpException(
          `You can't delete this discussion`,
          HttpStatus.FORBIDDEN,
        );
      }
      const deletedDiscussion = this.prisma.discussion.delete({
        where: {
          id: id,
        },
        include: {
          opinions: true,
          author: true,
        },
      });
      return deletedDiscussion;
    } catch (error) {
      handleError(error, 'Error deleting discussion');
    }
  }
}
