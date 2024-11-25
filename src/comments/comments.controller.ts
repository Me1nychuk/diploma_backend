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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { AuthGuard } from '@nestjs/passport';
import { Public, CurrentUser } from 'libs/common/src/decorators';
import { JWTPayload } from 'src/auth/interfaces';

@Public()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body(new ValidationPipe()) createCommentDto: CreateCommentDto,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.commentsService.create(createCommentDto, currentUser);
  }

  @Get()
  findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
    @Query('news-id') newsId: string,
  ) {
    return this.commentsService.findAll(per_page, page, newsId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    isValidUUID(id);
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateCommentDto: UpdateCommentDto,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    isValidUUID(id);
    return this.commentsService.update(id, updateCommentDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @CurrentUser() currentUser: JWTPayload) {
    isValidUUID(id);
    return this.commentsService.remove(id, currentUser);
  }
}
