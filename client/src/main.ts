import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cấu hình thư mục views và sử dụng EJS làm engine
  // view engine
  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views')); 
  app.useStaticAssets(join(__dirname, '..', 'src', 'views', 'assets'));
  app.enableCors(); //CORS
  await app.listen(3004);
}
bootstrap();
