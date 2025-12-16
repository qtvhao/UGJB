/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (projectApi.tasks - lines 124-128)
 *   - web/app/src/pages/Dashboard.tsx
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  // Create HTTP application for REST API
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Connect gRPC microservice
  const grpcPort = process.env.GRPC_PORT || '50053';
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'taskdispatcher',
      protoPath: join(__dirname, '../proto/task-dispatcher.proto'),
      url: `0.0.0.0:${grpcPort}`,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  // Start all microservices
  await app.startAllMicroservices();

  // Start HTTP server
  const port = process.env.PORT || 8052;
  await app.listen(port);

  console.log(`🚀 Task Dispatcher Service`);
  console.log(`📡 REST API running on: http://localhost:${port}`);
  console.log(`🔌 gRPC running on: localhost:${grpcPort}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
}

bootstrap();
