import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { UsersService } from 'src/users/users.service';
import { Tokens } from './interfaces';
import { handleError } from 'src/helpers/handleError';
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

  private async getRefreshToken(userId: string): Promise<Token> {
    return await this.prismaService.token.create({
      data: {
        token: v4(),
        exp: add(new Date(), { months: 2 }),
        userId,
        userAgent: 'test',
      },
    });
  }

  async login(LoginAuthDto: LoginAuthDto): Promise<Tokens | null> {
    try {
      let user: User | null = null;
      await this.usersService
        .checkUserExists(LoginAuthDto.email)
        .then((u) => (user = u))
        .catch(() => null);
      if (!user || !bcrypt.compareSync(LoginAuthDto.password, user.password)) {
        throw new HttpException(
          `User with this email does not exist or credentials are incorrect`,
          HttpStatus.UNAUTHORIZED,
        );
      }

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

      const refreshToken = await this.getRefreshToken(user.id);

      return { accessToken, refreshToken };
    } catch (error: unknown) {
      handleError(error, 'Login failed');
    }
  }
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return forgotPasswordDto;
  }
  async verify(verificationToken: string) {
    return verificationToken;
  }
  async refreshTokens() {}
}
