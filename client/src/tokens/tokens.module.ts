import { Module } from '@nestjs/common';
import { TokensController } from './tokens.controller';
import { TokensService } from './providers/tokens.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}