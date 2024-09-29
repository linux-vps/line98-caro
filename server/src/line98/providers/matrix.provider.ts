import { Injectable } from '@nestjs/common';

@Injectable()
export class MatrixProvider {

  checkAndRemoveLines(
    matrix: (number | { type: number; color: string })[][], 
    gameType: 'line98' | 'caro'
  ): { isLine: boolean; matrix: any[][] } {
    const toRemove: Set<string> = new Set();
    const rows = matrix.length;
    const cols = matrix[0].length;

    function checkDirection(x: number, y: number, dx: number, dy: number) {
      const line = [{ x, y }];
      const startCell = matrix[x][y];


      if (gameType === 'line98') {
        // color
        if (typeof startCell !== 'object' || !('color' in startCell)) return;
        while (true) {
          x += dx;
          y += dy;
          if (x < 0 || x >= rows || y < 0 || y >= cols) break;
          const cell = matrix[x][y];
          if (typeof cell !== 'object' || cell.color !== startCell.color) break;
          line.push({ x, y });
        }
      } else if (gameType === 'caro') {
        // x o
        if (typeof startCell !== 'number' || (startCell !== 1 && startCell !== 2)) return;
        while (true) {
          x += dx;
          y += dy;
          if (x < 0 || x >= rows || y < 0 || y >= cols) break;
          const cell = matrix[x][y];
          if (cell !== startCell) break;
          line.push({ x, y });
        }
      }
      // đủ 5 trở lên thì thêm vào set
      if (line.length >= 5) {
        line.forEach(({ x, y }) => toRemove.add(`${x},${y}`));
      }
    }


    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (gameType === 'line98' && typeof matrix[row][col] === 'object') {
          checkDirection(row, col, 1, 0);  // Dọc
          checkDirection(row, col, 0, 1);  // Ngang
          checkDirection(row, col, 1, 1);  // Chéo phải
          checkDirection(row, col, 1, -1); // Chéo trái
        } else if (gameType === 'caro' && typeof matrix[row][col] === 'number') {
          checkDirection(row, col, 1, 0); 
          checkDirection(row, col, 0, 1);  
          checkDirection(row, col, 1, 1);  
          checkDirection(row, col, 1, -1); 
        }
      }
    }

    // Xóa bóng
    if (toRemove.size > 0 && gameType === 'line98') {
      toRemove.forEach((pos) => {
        const [x, y] = pos.split(',').map(Number);
        matrix[x][y] = 0;
      });
      return { isLine: true, matrix };
    }

    if (gameType === 'caro' && toRemove.size > 0) {
      return { isLine: true, matrix };
    }

    return { isLine: false, matrix };
  }
}
