import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { isValidUUID } from 'src/helpers/isValidUUID';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body(new ValidationPipe()) RegisterAuthDto: RegisterAuthDto) {
    return this.authService.register(RegisterAuthDto);
  }
  @Post('/login')
  login(@Body(new ValidationPipe()) loginAuthDto: LoginAuthDto) {
    console.log(loginAuthDto);
    return this.authService.login(loginAuthDto);
  }

  @Post('/logout')
  logout() {
    return 'This action logs out the user';
  }

  @Post('forgot-password')
  forgotPassword(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Get('/verify/:verificationToken')
  verify(@Param('verificationToken') verificationToken: string) {
    isValidUUID(verificationToken);
    return 'This action verifies - ' + verificationToken;
  }

  @Get('/refresh')
  refreshTokens() {
    return 'This action returns tokens';
  }
}
