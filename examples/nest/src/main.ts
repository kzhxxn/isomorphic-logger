import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  initLogger,
  Logger,
  ConsoleAdapter,
  LogLevel,
} from 'isomorphic-logger-ts';

async function bootstrap() {
  initLogger([new ConsoleAdapter(LogLevel.Info)], 'server');
  Logger.info('NestJS 서버가 시작됩니다!', {
    env: process.env.NODE_ENV,
    ts: Date.now(),
  });

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
