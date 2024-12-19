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
  Req,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { Tokens } from './interfaces';
import { Request, Response } from 'express';
import { handleError } from 'libs/common/src/helpers/handleError';
import { ConfigService } from '@nestjs/config';
import { Cookie } from 'libs/common/src/decorators/cookies.decorator';
import { Public, UserAgent } from 'libs/common/src/decorators';
import { AuthGuard } from '@nestjs/passport';
import { UserResponse } from 'src/users/responses';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { HttpService } from '@nestjs/axios';
import { map, mergeMap } from 'rxjs';
import { handleTimeoutAndErrors } from 'libs/common/src/helpers/timeout-error.helper';

const REFRESH_TOKEN = 'refreshToken';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/register')
  async register(
    @Body(new ValidationPipe()) RegisterAuthDto: RegisterAuthDto,
  ): Promise<UserResponse | null> {
    return new UserResponse(await this.authService.register(RegisterAuthDto));
  }
  @Post('/login')
  async login(
    @Body(new ValidationPipe()) loginAuthDto: LoginAuthDto,
    @Res() res: Response,
    @UserAgent() agent: string,
  ): Promise<void> {
    try {
      const tokens = await this.authService.login(loginAuthDto, agent);
      this.setRefreshToken(tokens, res);
    } catch (error) {
      handleError(error);
    }
  }

  @Post('/logout')
  // @UseGuards(AuthGuard('jwt'))
  async logout(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
  ) {
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);
      return;
    }
    await this.authService.logout(refreshToken);
    res.cookie(REFRESH_TOKEN, '', {
      httpOnly: true,
      secure: true,
      expires: new Date(),
    });
    res.sendStatus(HttpStatus.OK);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('/reset-password/:token') // !TODO: replace link
  async resetPassword(
    @Param('token') resetToken: string,
    @Body(new ValidationPipe()) password: ResetPasswordDto,
  ) {
    if (!resetToken) {
      throw new HttpException(`Reset token not found`, HttpStatus.BAD_REQUEST);
    }
    await this.authService.resetPassword(resetToken, password);
    return {
      status: 'success',
      message: 'Password reset successfully.',
    };
  }

  @Get('/refresh-tokens')
  async refreshTokens(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    if (!refreshToken) {
      throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
    }
    const tokens = await this.authService.refreshTokens(refreshToken, agent);

    return this.setRefreshToken(tokens, res);
  }

  @Get('/verify/:verificationToken') // !TODO: replace link
  async verify(@Param('verificationToken') verificationToken: string) {
    isValidUUID(verificationToken);
    await this.authService.verify(verificationToken);
    return {
      status: 'success',
      message: 'Verification completed successfully.',
    };
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

  @UseGuards(AuthGuard('google'))
  @Get('/google')
  googleAuth() {}

  @UseGuards(AuthGuard('google')) // TODO: remove this route, and add similar route at front
  @Get('/google/callback')
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const token = req.user['accessToken'];
    return res.redirect(
      'http://localhost:8080/api/auth/google/success?token=' + token,
    );
  }

  @Get('/google/success')
  async googleSuccess(
    @Query('token') token: string,
    @UserAgent() userAgent: string,
    @Res() res: Response,
  ) {
    return this.httpService
      .get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`,
      )
      .pipe(
        mergeMap(({ data: { email } }) =>
          this.authService.googleAuth(email, userAgent),
        ),
        map((tokens) => {
          return this.setRefreshToken(tokens, res);
        }),
        handleTimeoutAndErrors(),
      );
  }
}
