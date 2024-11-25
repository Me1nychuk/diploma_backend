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
import { OpinionsService } from './opinions.service';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { Opinion } from '@prisma/client';
import { PaginatedResponse } from 'src/types/types';
import { CurrentUser, Public } from 'libs/common/src/decorators';
import { AuthGuard } from '@nestjs/passport';
import { JWTPayload } from 'src/auth/interfaces';

@Public()
@Controller('opinions')
export class OpinionsController {
  constructor(private readonly opinionsService: OpinionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body(new ValidationPipe()) createOpinionDto: CreateOpinionDto,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Opinion | null> {
    return this.opinionsService.create(createOpinionDto, currentUser);
  }

  @Get()
  findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
    @Query('discussion-id') discussionId: string,
  ): Promise<PaginatedResponse<Opinion> | null> {
    return this.opinionsService.findAll(per_page, page, discussionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Opinion | null> {
    isValidUUID(id);
    return this.opinionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateOpinionDto: UpdateOpinionDto,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Opinion | null> {
    isValidUUID(id);
    return this.opinionsService.update(id, updateOpinionDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  // add logic
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<Opinion | null> {
    isValidUUID(id);
    return this.opinionsService.remove(id, currentUser);
  }
}
