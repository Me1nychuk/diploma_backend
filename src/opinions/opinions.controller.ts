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
import { Public } from 'libs/common/src/decorators';
import { AuthGuard } from '@nestjs/passport';

@Public()
@Controller('opinions')
export class OpinionsController {
  constructor(private readonly opinionsService: OpinionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body(new ValidationPipe()) createOpinionDto: CreateOpinionDto,
  ): Promise<Opinion | null> {
    return this.opinionsService.create(createOpinionDto);
  }

  @Get()
  findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
  ): Promise<PaginatedResponse<Opinion> | null> {
    return this.opinionsService.findAll(per_page, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Opinion | null> {
    isValidUUID(id);
    return this.opinionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  // add logic
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateOpinionDto: UpdateOpinionDto,
  ): Promise<Opinion | null> {
    isValidUUID(id);
    return this.opinionsService.update(id, updateOpinionDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  // add logic
  remove(@Param('id') id: string): Promise<Opinion | null> {
    isValidUUID(id);
    return this.opinionsService.remove(id);
  }
}
