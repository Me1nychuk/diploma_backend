import { PartialType } from '@nestjs/mapped-types';
import { RegisterAuthDto } from './register-auth.dto';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAuthDto extends PartialType(RegisterAuthDto) {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
