import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { handleError } from 'src/helpers/handleError';
import { PrismaService } from 'src/prisma.service';
import { News, User } from '@prisma/client';
import { isValidUUID } from 'src/helpers/isValidUUID';

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
  async checkCommentExists(id: string): Promise<News | null> {
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

  async create(createCommentDto: CreateCommentDto) {
    try {
      await this.checkAuthorExists(createCommentDto.authorId);
      const newComment = await this.prisma.comment.create({
        data: { ...createCommentDto },
      });
      if (!newComment) {
        throw new HttpException(`Comment not created `, HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      handleError(error, 'Error creating a new comment');
    }
  }

  async findAll(newsId: string) {
    try {
      const news = await this.prisma.comment.findMany({
        where: {
          newsId: newsId,
        },
      });
      if (!news) {
        throw new HttpException(
          `No comments found for the given news`,
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      handleError(error, 'Error finding all comments for a news');
    }
  }

  async findOne(id: string) {
    try {
      return await this.checkCommentExists(id);
    } catch (error) {
      handleError(error, 'Error finding a comment');
    }
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
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
      });
      if (!updatedComment) {
        throw new HttpException(`Comment not updated`, HttpStatus.NOT_FOUND);
      }
      return updatedComment;
    } catch (error) {
      handleError(error, 'Error updating comment');
    }
  }

  async remove(id: string) {
    try {
      await this.checkCommentExists(id);
      const deletedComment = await this.prisma.comment.delete({
        where: {
          id: id,
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
