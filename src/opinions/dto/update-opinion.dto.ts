import { PartialType } from '@nestjs/mapped-types';
import { CreateOpinionDto } from './create-opinion.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOpinionDto extends PartialType(CreateOpinionDto) {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  discussionId: string;
}
