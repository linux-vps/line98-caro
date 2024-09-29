import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true, 
    transform: true,
  }));


  /**
   * Swagger configuration
   */

  const config = new DocumentBuilder()
  .setTitle('NestJS API')
  .setDescription('API description')
  .setVersion('1.0')
  .build();
  // Instanciate Document
  const document = SwaggerModule.createDocument(app, config);
  // Setup Swagger
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
