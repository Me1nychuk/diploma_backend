import { Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';

@Injectable()
export class AuthService {
  async register(RegisterAuthDto: RegisterAuthDto) {
    return RegisterAuthDto;
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
