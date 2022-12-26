import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Application } from './Application';

async function bootstrap() {
  const app = await NestFactory.create(Application);
  await app.listen(3000);

  app.useGlobalPipes(new ValidationPipe({ always: true, transform: true }));
}

bootstrap();
