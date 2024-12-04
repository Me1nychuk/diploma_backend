import { Provider } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsEnum(Provider)
  provider?: Provider;
}
