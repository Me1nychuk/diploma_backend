import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { PrismaService } from 'src/prisma.service';
import { Discussion } from '@prisma/client';
import { handleError } from 'libs/common/src/helpers/handleError';
import { PrepareResponse } from 'libs/common/src/helpers/prepareResponse';
import { PaginatedResponse } from 'src/types/types';

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
  ): Promise<Discussion | null> {
    try {
      const newDiscussion = await this.prisma.discussion.create({
        data: {
          title: createDiscussionDto.title,
          content: createDiscussionDto.content ?? undefined,
          authorId: createDiscussionDto.authorId,
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
    sortType: string, // add sort logic
  ): Promise<PaginatedResponse<Discussion> | null> {
    try {
      const discussions = await this.prisma.discussion.findMany({
        skip: Number(per_page) * (Number(page) - 1),
        take: Number(per_page),
        where: {
          title: {
            contains: search,
          },
        },
        include: {
          opinions: true,
        },
      });
      if (discussions.length === 0) {
        throw new HttpException(`No discussions found`, HttpStatus.NOT_FOUND);
      }
      const allDiscussions = await this.prisma.discussion.findMany();
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
  ): Promise<Discussion | null> {
    try {
      await this.checkDiscussionExists(id);

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

  async remove(id: string): Promise<Discussion | null> {
    try {
      await this.checkDiscussionExists(id);

      const deletedDiscussion = this.prisma.discussion.delete({
        where: {
          id: id,
        },
        include: {
          opinions: true,
        },
      });
      return deletedDiscussion;
    } catch (error) {
      handleError(error, 'Error deleting discussion');
    }
  }
}
