import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://diploma-backend-zvf0.onrender.com',
    ],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
