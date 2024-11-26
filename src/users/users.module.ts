import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';
import { CacheModule } from '@nestjs/cache-manager';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [CacheModule.register()],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, MailService],
  exports: [UsersService],
})
export class UsersModule {}
