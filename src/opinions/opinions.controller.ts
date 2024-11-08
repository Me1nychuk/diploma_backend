import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OpinionsService } from './opinions.service';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';

@Controller('opinions')
export class OpinionsController {
  constructor(private readonly opinionsService: OpinionsService) {}

  @Post()
  create(@Body() createOpinionDto: CreateOpinionDto) {
    return this.opinionsService.create(createOpinionDto);
  }

  @Get()
  findAll() {
    return this.opinionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opinionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOpinionDto: UpdateOpinionDto) {
    return this.opinionsService.update(+id, updateOpinionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.opinionsService.remove(+id);
  }
}
