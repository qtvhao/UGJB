import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for cross-origin requests
  app.enableCors();

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 8051;
  await app.listen(port);

  console.log(`Sprint Coordinator microservice is running on: http://localhost:${port}`);
  console.log(`Health check available at: http://localhost:${port}/health`);
}

bootstrap();
