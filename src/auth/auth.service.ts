import { Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  async register(RegisterAuthDto: RegisterAuthDto) {
    return await this.usersService.create(RegisterAuthDto);
  }

  async login(LoginAuthDto: LoginAuthDto) {
    return LoginAuthDto;
  }
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return forgotPasswordDto;
  }
  async verify(verificationToken: string) {
    return verificationToken;
  }
  async refreshTokens() {}
}
