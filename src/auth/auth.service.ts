import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { UsersService } from 'src/users/users.service';
import { Tokens } from './interfaces';
import { handleError } from 'libs/common/src/helpers/handleError';
import * as bcrypt from 'bcrypt';
import { Token, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}
  async register(RegisterAuthDto: RegisterAuthDto) {
    return await this.usersService.create(RegisterAuthDto);
  }

  private async getRefreshToken(userId: string, agent: string): Promise<Token> {
    const _token = await this.prismaService.token.findFirst({
      where: {
        userId: userId,
        userAgent: agent,
      },
    });
    const token = _token?.token ? _token.token : '';
    return await this.prismaService.token.upsert({
      where: {
        token,
      },
      update: {
        token: v4(),
        exp: add(new Date(), { months: 2 }),
      },
      create: {
        token: v4(),
        exp: add(new Date(), { months: 2 }),
        userId,
        userAgent: agent,
      },
    });
  }
  private async generateTokens(user: User, agent: string): Promise<Tokens> {
    const accessToken =
      'Bearer ' +
      this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        fullname: user.fullname,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
      });

    const refreshToken = await this.getRefreshToken(user.id, agent);

    return { accessToken, refreshToken };
  }

  async login(
    LoginAuthDto: LoginAuthDto,
    agent: string,
  ): Promise<Tokens | null> {
    try {
      let user: User | null = null;
      await this.usersService
        .findOne(LoginAuthDto.email, true)
        .then((u) => (user = u))
        .catch(() => null);
      if (!user || !bcrypt.compareSync(LoginAuthDto.password, user.password)) {
        throw new HttpException(
          `User with this email does not exist or credentials are incorrect`,
          HttpStatus.UNAUTHORIZED,
        );
      }
      return await this.generateTokens(user, agent);
    } catch (error: unknown) {
      handleError(error, 'Login failed');
    }
  }
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return forgotPasswordDto;
  }
  async verify(verificationToken: string) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          verificationToken: verificationToken,
        },
      });
      if (!user) {
        throw new HttpException(
          'User with this token not found or token does not exist',
          HttpStatus.UNAUTHORIZED,
        );
      }
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationToken: '' },
      });
    } catch (error) {
      handleError(error, 'Error verifying token');
    }
  }
  async refreshTokens(refreshToken: string, agent: string) {
    try {
      const token = await this.prismaService.token.findFirst({
        where: { token: refreshToken },
      });

      if (!token) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      await this.prismaService.token.delete({
        where: { token: refreshToken },
      });

      if (new Date(token.exp) < new Date()) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.usersService.findOne(token.userId, true);

      return await this.generateTokens(user, agent);
    } catch (error) {
      handleError(error, 'Error refreshing tokens');
    }
  }

  async logout(token: string) {
    try {
      await this.prismaService.token.delete({
        where: { token },
      });
    } catch (error) {
      handleError(error, 'Error logging out');
    }
  }
}
