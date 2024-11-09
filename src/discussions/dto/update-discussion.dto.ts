import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscussionDto } from './create-discussion.dto';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateDiscussionDto extends PartialType(CreateDiscussionDto) {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;
}
