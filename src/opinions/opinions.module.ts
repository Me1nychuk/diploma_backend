import { Module } from '@nestjs/common';
import { OpinionsService } from './opinions.service';
import { OpinionsController } from './opinions.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [OpinionsController],
  providers: [OpinionsService, PrismaService],
})
export class OpinionsModule {}
