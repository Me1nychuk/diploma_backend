import { Injectable } from '@nestjs/common';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';

@Injectable()
export class OpinionsService {
  create(createOpinionDto: CreateOpinionDto) {
    return 'This action adds a new opinion';
  }

  findAll() {
    return `This action returns all opinions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} opinion`;
  }

  update(id: number, updateOpinionDto: UpdateOpinionDto) {
    return `This action updates a #${id} opinion`;
  }

  remove(id: number) {
    return `This action removes a #${id} opinion`;
  }
}
