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
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { Tokens } from './interfaces';
import { Response } from 'express';
import { handleError } from 'libs/common/src/helpers/handleError';
import { ConfigService } from '@nestjs/config';
import { Cookie } from 'libs/common/src/decorators/cookies.decorator';
import { Public, UserAgent } from 'libs/common/src/decorators';
import { AuthGuard } from '@nestjs/passport';
import { UserResponse } from 'src/users/responses';

const REFRESH_TOKEN = 'refreshToken';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/register')
  async register(@Body(new ValidationPipe()) RegisterAuthDto: RegisterAuthDto) {
    return new UserResponse(await this.authService.register(RegisterAuthDto));
  }
  @Post('/login')
  async login(
    @Body(new ValidationPipe()) loginAuthDto: LoginAuthDto,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    try {
      const tokens = await this.authService.login(loginAuthDto, agent);
      this.setRefreshToken(tokens, res);
    } catch (error) {
      handleError(error);
    }
  }

  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  logout() {
    return 'This action logs out the user';
  }

  @Post('forgot-password')
  forgotPassword(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Get('/refresh-tokens')
  @UseGuards(AuthGuard('jwt'))
  async refreshTokens(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    if (!refreshToken) {
      throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
    }
    const tokens = await this.authService.refreshTokens(refreshToken, agent);

    this.setRefreshToken(tokens, res);
  }

  @Get('/verify/:verificationToken')
  verify(@Param('verificationToken') verificationToken: string) {
    isValidUUID(verificationToken);
    return 'This action verifies - ' + verificationToken;
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
    res.status(HttpStatus.CREATED).json({
      accessToken: tokens.accessToken,
    });
  }
}
