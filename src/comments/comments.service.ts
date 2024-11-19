import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { handleError } from 'libs/common/src/helpers/handleError';
import { PrismaService } from 'src/prisma.service';
import { Comment, News, User } from '@prisma/client';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { PrepareResponse } from 'libs/common/src/helpers/prepareResponse';
import { PaginatedResponse } from 'src/types/types';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAuthorExists(id: string): Promise<User | null> {
    try {
      isValidUUID(id);

      const author = await this.prisma.user.findFirst({
        where: {
          id: id,
        },
      });
      if (!author) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      return author;
    } catch (error) {
      handleError(error, 'Error checking author existence');
    }
  }

  async checkNewsExists(id: string): Promise<News | null> {
    try {
      isValidUUID(id);

      const news = await this.prisma.news.findFirst({
        where: {
          id: id,
        },
      });
      if (!news) {
        throw new HttpException(`News not found`, HttpStatus.NOT_FOUND);
      }
      return news;
    } catch (error) {
      handleError(error, 'Error checking news existence');
    }
  }
  async checkCommentExists(id: string): Promise<Comment | null> {
    try {
      isValidUUID(id);

      const comment = await this.prisma.comment.findFirst({
        where: {
          id: id,
        },
        include: {
          author: true,
          news: true,
        },
      });
      if (!comment) {
        throw new HttpException(`News not found`, HttpStatus.NOT_FOUND);
      }
      return comment;
    } catch (error) {
      handleError(error, 'Error checking news existence');
    }
  }

  async create(createCommentDto: CreateCommentDto): Promise<Comment | null> {
    try {
      await this.checkAuthorExists(createCommentDto.authorId);
      await this.checkNewsExists(createCommentDto.newsId);
      const newComment = await this.prisma.comment.create({
        data: { ...createCommentDto },
        include: {
          author: true,
          news: true,
        },
      });
      if (!newComment) {
        throw new HttpException(`Comment not created `, HttpStatus.NOT_FOUND);
      }
      return newComment;
    } catch (error) {
      handleError(error, 'Error creating a new comment');
    }
  }

  async findAll(
    per_page: string,
    page: string,
  ): Promise<PaginatedResponse<Comment> | null> {
    try {
      const comments = await this.prisma.comment.findMany({
        skip: Number(per_page) * (Number(page) - 1),
        take: Number(per_page),
        include: {
          author: true,
          news: true,
        },
      });
      if (comments.length === 0) {
        throw new HttpException(
          `No comments found for the given news`,
          HttpStatus.NOT_FOUND,
        );
      }
      const allComments = await this.prisma.comment.findMany();
      return PrepareResponse(
        comments,
        allComments.length,
        Math.ceil(allComments.length / Number(per_page)),
        Number(page),
      );
    } catch (error) {
      handleError(error, 'Error finding all comments for a news');
    }
  }

  async findOne(id: string): Promise<Comment | null> {
    try {
      return await this.checkCommentExists(id);
    } catch (error) {
      handleError(error, 'Error finding a comment');
    }
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment | null> {
    try {
      await this.checkCommentExists(id);
      const updatedComment = await this.prisma.comment.update({
        where: {
          id: id,
        },
        data: {
          content: updateCommentDto.content ?? undefined,
          authorId: updateCommentDto.authorId ?? undefined,
          newsId: updateCommentDto.newsId ?? undefined,
        },
        include: {
          author: true,
          news: true,
        },
      });
      if (!updatedComment) {
        throw new HttpException(`Comment not updated`, HttpStatus.NOT_FOUND);
      }
      return updatedComment;
    } catch (error) {
      handleError(error, 'Error updating comment');
    }
  }

  async remove(id: string): Promise<Comment | null> {
    try {
      await this.checkCommentExists(id);
      const deletedComment = await this.prisma.comment.delete({
        where: {
          id: id,
        },
        include: {
          author: true,
          news: true,
        },
      });
      if (!deletedComment) {
        throw new HttpException(`Comment not deleted`, HttpStatus.NOT_FOUND);
      }
      return deletedComment;
    } catch (error) {
      handleError(error, 'Error deleting comment');
    }
  }
}
