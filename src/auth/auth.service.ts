import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { UsersService } from 'src/users/users.service';
import { Tokens } from './interfaces';
import { handleError } from 'src/helpers/handleError';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async register(RegisterAuthDto: RegisterAuthDto) {
    return await this.usersService.create(RegisterAuthDto);
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

      const accessToken = this.jwtService.sign({});

      return {
        accessToken: '',
        refreshToken: {
          token: 'token',
          exp: new Date(),
          userId: 'token',
          userAgent: 'token',
        },
      };
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
