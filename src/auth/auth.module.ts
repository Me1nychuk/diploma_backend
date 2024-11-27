import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { options } from './config';
import { PrismaService } from 'src/prisma.service';
import { STRATEGIES } from './strategies';
import { GUARDS } from './guards';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    MailService,
    ...STRATEGIES,
    ...GUARDS,
  ],
  imports: [PassportModule, JwtModule.registerAsync(options()), UsersModule],
})
export class AuthModule {}
