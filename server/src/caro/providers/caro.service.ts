import { Injectable } from '@nestjs/common';
import { MatrixProvider } from 'src/line98/providers/matrix.provider';

@Injectable()
export class CaroService {
  constructor(private readonly matrixProvider: MatrixProvider) { }

  checkWin(matrix: number[][]) {
    return this.matrixProvider.checkAndRemoveLines(matrix, 'caro');
  }
}
