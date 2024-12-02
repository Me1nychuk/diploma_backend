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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { AuthGuard } from '@nestjs/passport';
import { Public, CurrentUser } from 'libs/common/src/decorators';
import { JWTPayload } from 'src/auth/interfaces';
import { CommentResponse } from './responses/comment.response';

@Public()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body(new ValidationPipe()) createCommentDto: CreateCommentDto,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<CommentResponse | null> {
    const comment = await this.commentsService.create(
      createCommentDto,
      currentUser,
    );
    return new CommentResponse(comment);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(
    @Query('per_page') per_page: string = '5',
    @Query('page') page: string = '1',
    @Query('news-id') newsId: string,
    @Query('order') order: 'asc' | 'desc' = 'asc',
    @Query('author-id') authorId: string = '',
  ) {
    const comments = await this.commentsService.findAll(
      per_page,
      page,
      newsId,
      order,
      authorId,
    );
    const commentsResponse = comments.data.map(
      (comment) => new CommentResponse(comment),
    );

    return { ...comments, data: commentsResponse };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    isValidUUID(id);
    const comment = await this.commentsService.findOne(id);
    return new CommentResponse(comment);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateCommentDto: UpdateCommentDto,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    isValidUUID(id);
    const comment = await this.commentsService.update(
      id,
      updateCommentDto,
      currentUser,
    );
    return new CommentResponse(comment);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    isValidUUID(id);
    const comment = await this.commentsService.remove(id, currentUser);
    return new CommentResponse(comment);
  }
}
