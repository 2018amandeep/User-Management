import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ThrottlerGuard } from '@nestjs/throttler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,           // Remove fields not defined in DTO
    forbidNonWhitelisted: true, // Throw error for extra fields
    transform: true            // Transform payload to match DTO types
  }));
  // app.useGlobalGuards(new ThrottlerGuard({
  //   keyGenerator: (req) => req.ip,
  //   ttl: 60, // 1 minute
  //   limit: 100, // 100 requests per minute
  //   windowMs: 60 * 1000 // 1 minute window
  // }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
