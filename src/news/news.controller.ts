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

@Public()
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body(new ValidationPipe()) createNewsDto: CreateNewsDto,
  ): Promise<News | null> {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
    @Query('search') search: string = '',
    @Query('sort') sortType: string = '',
  ): Promise<PaginatedResponse<News> | null> {
    return this.newsService.findAll(per_page, page, search, sortType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<News | null> {
    isValidUUID(id);
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateNewsDto: UpdateNewsDto,
  ): Promise<News | null> {
    isValidUUID(id);

    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string): Promise<News | null> {
    isValidUUID(id);

    return this.newsService.remove(id);
  }
}
