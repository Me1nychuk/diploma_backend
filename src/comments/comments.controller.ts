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
import { Public } from 'libs/common/src/decorators';

@Public()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body(new ValidationPipe()) createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
  ) {
    return this.commentsService.findAll(per_page, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    isValidUUID(id);
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  // add logic
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateCommentDto: UpdateCommentDto,
  ) {
    isValidUUID(id);
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  // add logic
  remove(@Param('id') id: string) {
    isValidUUID(id);
    return this.commentsService.remove(id);
  }
}
