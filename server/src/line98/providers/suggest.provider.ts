import { Injectable } from '@nestjs/common';
import { DijkstraProvider } from './dijkstra.provider';
import { MatrixProvider } from './matrix.provider';

@Injectable()
export class SuggestProvider {
  private rows = 9; 
  private cols = 9; 

  constructor(
    private readonly dijkstraProvider: DijkstraProvider,
    private readonly matrixProvider: MatrixProvider
  ) {}

  suggestMove(matrix: (number | { type: number; color: string })[][]): { start: [number, number]; end: [number, number] } | null {
    const movesWithCounts = this.getMovesWithCounts(matrix);
    movesWithCounts.sort((a, b) => b.count - a.count); // Sắp xếp giảm dần
    return movesWithCounts.length > 0 ? movesWithCounts[0].move : null; // lấy ra pt đầu
  }

  private getMovesWithCounts(matrix: (number | { type: number; color: string })[][]) {
    const movesWithCounts = [];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = matrix[row][col]; 
        if (typeof cell === 'object' && cell.type === 2 && !this.isInFourLine(matrix, row, col, cell.color)) {
          const possibleMoves = this.findPossibleMoves(matrix, row, col);
          for (const move of possibleMoves) {
            const count = this.countLines(matrix, move.end[0], move.end[1], cell.color);
            movesWithCounts.push({ move, count }); // lưu vào
          }
        }
      }
    }
    return movesWithCounts;
  }

  private findPossibleMoves(matrix: (number | { type: number; color: string })[][], row: number, col: number) {
    return Array.from({ length: this.rows * this.cols }, (_, i) => { // mảng 1 chiều

      const r = Math.floor(i / this.cols); // chia lấy phần nguyên
      const c = i % this.cols; // chia lấy phần dư
      const cell = matrix[r][c]; // Lấy ô đích
      return (cell === 0 || (typeof cell === 'object' && cell.type === 1)) && this.dijkstraProvider.findPath(matrix, [row, col], [r, c]).found
        ? { start: [row, col], end: [r, c] } 
        : null; 
    }).filter(Boolean); // Lọc các giá trị null
  }

  private countLines(matrix: (number | { type: number; color: string })[][], row: number, col: number, color: string): number {
    let maxCount = 0; 

    // từ 2 đến 5 quả 
    for (let requiredCount = 2; requiredCount <= 5; requiredCount++) {
      if (this.canCreateLine(matrix, row, col, color, requiredCount)) {
        maxCount = Math.max(maxCount, requiredCount); 
      }
    }
    return maxCount; 
  }

  private isInFourLine(matrix: (number | { type: number; color: string })[][], row: number, col: number, color: string): boolean {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]; 
    return directions.some(([dx, dy]) => {
      let count = 1;
      count += this.countDirection(matrix, row, col, dx, dy, color); 
      count += this.countDirection(matrix, row, col, -dx, -dy, color); // ngược lại
      return count >= 4;
    });
  }

  private countDirection(matrix: (number | { type: number; color: string })[][], row: number, col: number, dx: number, dy: number, color: string): number {
    let count = 0; 
    for (let r = row + dx, c = col + dy; r >= 0 && r < this.rows && c >= 0 && c < this.cols; r += dx, c += dy) {
      const cell = matrix[r][c];
      if (cell === 0 || (typeof cell === 'object' && cell.color !== color)) break;
      count++;
    }
    return count; 
  }
  private canCreateLine(matrix: (number | { type: number; color: string })[][], row: number, col: number, color: string, requiredCount: number): boolean {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]]; 
    return directions.some(([dx, dy]) => {
      let count = 0; // Khởi tạo bộ đếm
      count += this.countDirection(matrix, row, col, dx, dy, color); 
      count += this.countDirection(matrix, row, col, -dx, -dy, color); // ngược lại
      return count >= requiredCount;
    });
  }
}
