import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { News, Role } from '@prisma/client';
import { PaginatedResponse } from 'src/types/types';
import { Public, Roles } from 'libs/common/src/decorators';
import { AuthGuard } from '@nestjs/passport';
import {} from 'src/auth/interfaces';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { NewsResponse } from './responses';

@Public()
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async create(
    @Body(new ValidationPipe()) createNewsDto: CreateNewsDto,
  ): Promise<News | null> {
    const news = await this.newsService.create(createNewsDto);
    return new NewsResponse(news);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
    @Query('search') search: string = '',
    @Query('sortBy') sortBy: 'title' | 'date' = 'title',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ): Promise<PaginatedResponse<News> | null> {
    const news = await this.newsService.findAll(
      per_page,
      page,
      search,
      sortBy,
      order,
    );
    return { ...news, data: news.data.map((news) => new NewsResponse(news)) };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<News | null> {
    isValidUUID(id);
    const news = await this.newsService.findOne(id);
    return new NewsResponse(news);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateNewsDto: UpdateNewsDto,
  ): Promise<News | null> {
    isValidUUID(id);

    const news = await this.newsService.update(id, updateNewsDto);
    return new NewsResponse(news);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<News | null> {
    isValidUUID(id);

    const news = await this.newsService.remove(id);
    return new NewsResponse(news);
  }
}
