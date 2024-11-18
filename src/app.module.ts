import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { NewsModule } from './news/news.module';
import { OpinionsModule } from './opinions/opinions.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    NewsModule,
    CommentsModule,
    DiscussionsModule,
    OpinionsModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
