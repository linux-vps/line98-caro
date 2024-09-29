import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import {environmentValidationSchema} from './config/environment.validation';
import { Line98Module } from './line98/line98.module';
import jwtConfig from './auth/config/jwt.config';
import { EventGateway } from './event.gateway';
import { CaroModule } from './caro/caro.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validationSchema: environmentValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        // host: '47.84.81.252',
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: configService.get('database.autoLoad'),
        // entities: [User],
        synchronize: configService.get('database.sync'),
      }),
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    Line98Module,
    CaroModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    EventGateway,
  ],
})
export class AppModule {}
