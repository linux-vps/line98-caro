import { Injectable } from '@nestjs/common';
import { DijkstraProvider } from './dijkstra.provider';
import { MatrixProvider } from './matrix.provider';
import { SuggestProvider } from './suggest.provider';


@Injectable()
export class Line98Service {
  private rows: number;
  private cols: number; 
  private colors: string[]; 

  constructor(
    private readonly dijkstraProvider: DijkstraProvider,
    private readonly matrixProvider: MatrixProvider,
    private readonly suggestProvider: SuggestProvider
) {
    this.rows = 9; 
    this.cols = 9; 
    this.colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];
  }

  initializeRandomMatrix(): (number | { type: number; color: string })[][] {
    const matrix = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(0)); // Khởi tạo ô trống

    // Đặt 7 quả bóng lớn (2)
    this.generateBigBalls(matrix, 7);

    // Đặt 3 quả bóng nhỏ (1)
    this.generateSmallBalls(matrix, 3);
    return matrix;
  }

  private generateSmallBalls(
    matrix: (number | { type: number; color: string })[][],
    count: number,
  ): void {
    let smallBallsPlaced = 0;
    while (smallBallsPlaced < count) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      if (matrix[row][col] === 0) {
        const colorIndex = Math.floor(Math.random() * this.colors.length);
        matrix[row][col] = { type: 1, color: this.colors[colorIndex] }; 
        smallBallsPlaced++;
      }
    }
    
  }
  private generateBigBalls(
    matrix: (number | { type: number; color: string })[][],
    count: number,
  ): void {
    let smallBallsPlaced = 0;
    while (smallBallsPlaced < count) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      if (matrix[row][col] === 0) {
        const colorIndex = Math.floor(Math.random() * this.colors.length);
        matrix[row][col] = { type: 2, color: this.colors[colorIndex] }; 
        smallBallsPlaced++;
      }
    }
  }

    // type 1 thành type 2
    private convertSmallBallsToLarge(matrix: (number | { type: number, color: string })[][]): void {
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.cols; col++) {
            const cell = matrix[row][col];
            if (typeof cell === 'object' && 'type' in cell && cell.type === 1) {
                cell.type = 2; 
            }
          }
        }
      }

    countEmptyCells(matrix: (number | { type: number, color: string })[][]): number {
      let emptyCount = 0;
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          if (matrix[row][col] === 0) {
            emptyCount++;
          }
        }
      }
      return emptyCount;
    }
      
  moveBall(receivedMatrix: (number | { type: number, color: string })[][], start: [number, number], end: [number, number]): { found: boolean, path: [number, number][], matrix: any[][] } {
    try {
      let matrix = receivedMatrix;
      const { found, path } = this.dijkstraProvider.findPath(matrix, start, end);
      if (!found) {
        return { found: false, path: [], matrix };
      }
  
      const startBall = matrix[start[0]][start[1]];
      matrix[start[0]][start[1]] = 0; 
      matrix[end[0]][end[1]] = startBall; 
      const { isLine, matrix: updatedMatrix } = this.matrixProvider.checkAndRemoveLines(matrix,'line98');
      
      if (!isLine) {
      this.convertSmallBallsToLarge(updatedMatrix);
      }
  
      this.convertSmallBallsToLarge(matrix);
  
      this.generateSmallBalls(matrix, 3);
  
      return { found: true, path, matrix };
    } catch (error) {
      console.error('Lỗi khi di chuyển bóng:', error);
      throw error;

    }

  }


}
