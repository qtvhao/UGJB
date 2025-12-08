import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Enable CORS
  if (configService.get('ENABLE_CORS', 'true') === 'true') {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Port configuration
  const port = configService.get('PORT', 8042);

  await app.listen(port);

  console.log(`
    ╔═══════════════════════════════════════════════════════════════╗
    ║  🎯 KeyResultTracker Microservice                            ║
    ║  Goal Management - Track Key Result Progress                 ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Status: RUNNING                                              ║
    ║  Port: ${port.toString().padEnd(56)}║
    ║  Environment: ${configService.get('NODE_ENV', 'development').padEnd(49)}║
    ║  API Prefix: /${apiPrefix.padEnd(50)}║
    ║  Database: ${configService.get('DB_DATABASE', 'N/A').padEnd(52)}║
    ╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
