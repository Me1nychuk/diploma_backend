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
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { PaginatedResponse } from 'src/types/types';
import { Discussion } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, Public } from 'libs/common/src/decorators';
import { JWTPayload } from 'src/auth/interfaces';

@Public()
@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body(new ValidationPipe()) createDiscussionDto: CreateDiscussionDto,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Discussion | null> {
    return this.discussionsService.create(createDiscussionDto, currentUser);
  }

  @Get()
  findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
    @Query('search') search: string = '',
    @Query('sortBy') sortBy: 'title' | 'date' = 'title',
    @Query('order') order: 'asc' | 'desc' = 'asc',
    @Query('author-id') authorId: string = '',
  ): Promise<PaginatedResponse<Discussion> | null> {
    return this.discussionsService.findAll(
      per_page,
      page,
      search,
      sortBy,
      order,
      authorId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Discussion | null> {
    isValidUUID(id);
    return this.discussionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateDiscussionDto: UpdateDiscussionDto,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Discussion | null> {
    isValidUUID(id);
    return this.discussionsService.update(id, updateDiscussionDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Discussion | null> {
    isValidUUID(id);
    return this.discussionsService.remove(id, currentUser);
  }
}
