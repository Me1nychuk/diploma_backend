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
import { OpinionsService } from './opinions.service';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { Opinion } from '@prisma/client';
import { PaginatedResponse } from 'src/types/types';
import { CurrentUser, Public } from 'libs/common/src/decorators';
import { AuthGuard } from '@nestjs/passport';
import { JWTPayload } from 'src/auth/interfaces';
import { OpinionResponse } from './responses';

@Public()
@Controller('opinions')
export class OpinionsController {
  constructor(private readonly opinionsService: OpinionsService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body(new ValidationPipe()) createOpinionDto: CreateOpinionDto,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Opinion | null> {
    const opinion = await this.opinionsService.create(
      createOpinionDto,
      currentUser,
    );
    return new OpinionResponse(opinion);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
    @Query('discussion-id') discussionId: string,
    @Query('order') order: 'asc' | 'desc' = 'asc',
    @Query('author-id') authorId: string = '',
  ): Promise<PaginatedResponse<Opinion> | null> {
    const opinions = await this.opinionsService.findAll(
      per_page,
      page,
      discussionId,
      order,
      authorId,
    );
    return {
      ...opinions,
      data: opinions.data.map((opinion) => new OpinionResponse(opinion)),
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Opinion | null> {
    isValidUUID(id);
    const opinion = await this.opinionsService.findOne(id);
    return new OpinionResponse(opinion);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateOpinionDto: UpdateOpinionDto,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Opinion | null> {
    isValidUUID(id);
    const opinion = await this.opinionsService.update(
      id,
      updateOpinionDto,
      currentUser,
    );
    return new OpinionResponse(opinion);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Opinion | null> {
    isValidUUID(id);
    const opinion = await this.opinionsService.remove(id, currentUser);
    return new OpinionResponse(opinion);
  }
}
