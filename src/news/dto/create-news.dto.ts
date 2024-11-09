import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  imageUrl?: string[];
}
