import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ApiModule } from './api/api.module';
import { GameModule } from './game/game.module';
import { TokensModule } from './tokens/tokens.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Để có thể sử dụng biến môi trường ở mọi nơi trong ứng dụng
    }),
    ApiModule, 
    GameModule, TokensModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
