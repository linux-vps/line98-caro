import { Module } from '@nestjs/common';
import { CaroService } from './providers/caro.service';
import { MatrixProvider } from 'src/line98/providers/matrix.provider';

@Module({
  imports: [],
  providers: [CaroService, MatrixProvider],
  exports: [CaroService]
})
export class CaroModule {}
