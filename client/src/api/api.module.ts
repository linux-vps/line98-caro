import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './providers/api.service';
import { HttpModule } from '@nestjs/axios';
import { ApiProvider } from './providers/api.provider';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  imports: [HttpModule, TokensModule],
  controllers: [ApiController],
  providers: [ApiService, ApiProvider],
  exports: [ApiService],
})
export class ApiModule {}
