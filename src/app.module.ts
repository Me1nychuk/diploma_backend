import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { NewsModule } from './news/news.module';
import { OpinionsModule } from './opinions/opinions.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    UsersModule,
    NewsModule,
    CommentsModule,
    DiscussionsModule,
    OpinionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
