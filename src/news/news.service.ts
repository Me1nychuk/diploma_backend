import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News } from '@prisma/client';
import { handleError } from 'libs/common/src/helpers/handleError';
import { PrismaService } from 'src/prisma.service';
import { PaginatedResponse } from 'src/types/types';
import { PrepareResponse } from 'libs/common/src/helpers/prepareResponse';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkNewsExists(id: string): Promise<News | null> {
    try {
      const news = await this.prisma.news.findFirst({
        where: {
          id: id,
        },
        include: {
          comments: {
            include: {
              author: true,
            },
          },
        },
      });

      if (!news) {
        throw new HttpException(`News not found`, HttpStatus.NOT_FOUND);
      }

      return news;
    } catch (error: unknown) {
      handleError(error, 'Error checking if news exists');
    }
  }

  async create(createNewsDto: CreateNewsDto): Promise<News | null> {
    try {
      const news = await this.prisma.news.create({
        data: {
          title: createNewsDto.title,
          content: createNewsDto.content,
          imageUrl: createNewsDto.imageUrl,
        },
        include: {
          comments: {
            include: {
              author: true,
            },
          },
        },
      });
      if (!news) {
        throw new HttpException(`News not created`, HttpStatus.BAD_REQUEST);
      }
      return news;
    } catch (error) {
      handleError(error, 'Error creating a news');
    }
  }

  async findAll(
    per_page: string,
    page: string,
    search: string,
    sortBy: 'title' | 'date' = 'title',
    order: 'asc' | 'desc' = 'asc',
  ): Promise<PaginatedResponse<News> | null> {
    try {
      const news = await this.prisma.news.findMany({
        skip: Number(per_page) * (Number(page) - 1),
        take: Number(per_page),
        where: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        include: {
          comments: {
            include: {
              author: true,
            },
          },
        },
        orderBy: {
          [sortBy == 'title' ? 'title' : 'createdAt']: order,
        },
      });

      if (news.length === 0) {
        throw new HttpException(`News not found`, HttpStatus.NOT_FOUND);
      }
      const allNews = await this.prisma.news.findMany({
        where: {
          title: {
            contains: search,
          },
        },
        include: {
          comments: true,
        },
      });
      return PrepareResponse(
        news,
        allNews.length,
        Math.ceil(allNews.length / Number(per_page)),
        Number(page),
      );
    } catch (error) {
      handleError(error, 'Error getting news');
    }
  }

  async findOne(id: string): Promise<News | null> {
    try {
      const news = await this.prisma.news.findFirst({
        where: {
          id: id,
        },
        include: {
          comments: {
            include: {
              author: true,
            },
          },
        },
      });
      if (!news) {
        throw new HttpException(`News not found`, HttpStatus.NOT_FOUND);
      }
      return news;
    } catch (error) {
      handleError(error, 'Error getting news');
    }
  }

  async update(id: string, updateNewsDto: UpdateNewsDto): Promise<News | null> {
    try {
      await this.checkNewsExists(id);

      const updatedNews = await this.prisma.news.update({
        where: {
          id: id,
        },
        data: {
          title: updateNewsDto.title ?? undefined,
          content: updateNewsDto.content ?? undefined,
          imageUrl: updateNewsDto.imageUrl ?? undefined,
        },
        include: {
          comments: {
            include: {
              author: true,
            },
          },
        },
      });

      return updatedNews;
    } catch (error) {
      handleError(error, 'Error updating news');
    }
  }

  async remove(id: string): Promise<News | null> {
    try {
      await this.checkNewsExists(id);
      return this.prisma.news.delete({
        where: {
          id: id,
        },
        include: {
          comments: {
            include: {
              author: true,
            },
          },
        },
      });
    } catch (error) {
      handleError(error, 'Error deleting news');
    }
  }
}
