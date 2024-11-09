import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsDto } from './create-news.dto';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @IsOptional()
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @IsOptional()
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  imageUrl?: string[];
}
