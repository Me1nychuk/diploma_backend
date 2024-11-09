import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDiscussionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;
}
