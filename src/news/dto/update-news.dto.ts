import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsDto } from './create-news.dto';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  content?: string;

  @IsArray()
  @IsOptional()
  imageUrl?: string[];
}
