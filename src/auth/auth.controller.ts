import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  Param,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { isValidUUID } from 'src/helpers/isValidUUID';
import { Tokens } from './interfaces';
import { Response } from 'express';
import { handleError } from 'src/helpers/handleError';
import { ConfigService } from '@nestjs/config';

const REFRESH_TOKEN = 'refreshToken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/register')
  register(@Body(new ValidationPipe()) RegisterAuthDto: RegisterAuthDto) {
    return this.authService.register(RegisterAuthDto);
  }
  @Post('/login')
  async login(
    @Body(new ValidationPipe()) loginAuthDto: LoginAuthDto,
    @Res() res: Response,
  ) {
    try {
      const tokens = await this.authService.login(loginAuthDto);
      this.setRefreshToken(tokens, res);
    } catch (error) {
      handleError(error);
    }
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

  private setRefreshToken(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
    }
    res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.exp),
      secure:
        this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    res.status(HttpStatus.CREATED).json(tokens);
  }
}
