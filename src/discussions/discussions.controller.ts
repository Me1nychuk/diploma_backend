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
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { PaginatedResponse } from 'src/types/types';
import { Discussion } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, Public } from 'libs/common/src/decorators';
import { JWTPayload } from 'src/auth/interfaces';
import { DiscussionResponse } from './responses';

@Public()
@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body(new ValidationPipe()) createDiscussionDto: CreateDiscussionDto,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Discussion | null> {
    const discussion = await this.discussionsService.create(
      createDiscussionDto,
      currentUser,
    );
    return new DiscussionResponse(discussion);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
    @Query('search') search: string = '',
    @Query('sortBy') sortBy: 'title' | 'date' = 'title',
    @Query('order') order: 'asc' | 'desc' = 'asc',
    @Query('author-id') authorId: string = '',
    @Query('verified')
    isVerified: 'all' | 'approved' | 'unapproved' = 'unapproved',
  ): Promise<PaginatedResponse<Discussion> | null> {
    const discussions = await this.discussionsService.findAll(
      per_page,
      page,
      search,
      sortBy,
      order,
      authorId,
      isVerified,
    );

    const discussionsResponse = discussions.data.map((discussion) => {
      return new DiscussionResponse(discussion);
    });
    return { ...discussions, data: discussionsResponse };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Discussion | null> {
    isValidUUID(id);
    const discussion = await this.discussionsService.findOne(id);
    return new DiscussionResponse(discussion);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateDiscussionDto: UpdateDiscussionDto,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Discussion | null> {
    isValidUUID(id);
    const discussion = await this.discussionsService.update(
      id,
      updateDiscussionDto,
      currentUser,
    );
    return new DiscussionResponse(discussion);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Discussion | null> {
    isValidUUID(id);
    const discussion = await this.discussionsService.remove(id, currentUser);
    return new DiscussionResponse(discussion);
  }
}
