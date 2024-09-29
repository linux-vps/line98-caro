import { Injectable } from '@nestjs/common';

@Injectable()
export class DijkstraProvider {
    private rows: number; 
    private cols: number; 

    constructor() {
        this.rows = 9; 
        this.cols = 9; 
    }

    // 0 là ô trống, 1 là quả bóng nhỏ
    private canMove(cell: number | { type: number, color: string }): boolean {
        return cell === 0 || (typeof cell === 'object' && cell.type === 1);
    }

    findPath(matrix: (number | { type: number, color: string })[][], start: [number, number], end: [number, number]): { found: boolean, path: [number, number][] } {
        const distances: { [key: string]: number } = {}; // Khoảng cách từ điểm bắt đầu
        const previous: { [key: string]: string | null } = {}; // Ô trước đó
        const visited = new Set<string>();

        // khởi tạo khoảng cách cho tất cả các ô
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                distances[`${r},${c}`] = Infinity; //  vô cực
                previous[`${r},${c}`] = null; // không có ô trước
            }
        }

        // từ điểm bắt đầu đến chính nó là 0
        distances[`${start[0]},${start[1]}`] = 0; 

        const queue = [{ pos: start, distance: 0 }];

        while (queue.length > 0) {
            queue.sort((a, b) => a.distance - b.distance);
            const { pos } = queue.shift(); // Lấy ô đầu tiên
            const [x, y] = pos; // Tách tọa độ

            // Nếu đã đến đích, trả về đường đi
            if (x === end[0] && y === end[1]) {
                return { found: true, path: this.getPath(previous, end) };
            }

            visited.add(`${x},${y}`); // Đánh dấu ô đã được xác định

            // Các hướng di chuyển: lên, xuống, trái, phải
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

            // Lặp qua các hướng
            for (const [dx, dy] of directions) {
                const newX = x + dx; // Tính tọa độ mới theo hàng
                const newY = y + dy; // Tính tọa độ mới theo cột

                // Kiểm tra tọa độ mới có hợp lệ và có thể di chuyển không
                if (this.isValidMove(newX, newY, matrix, visited)) {
                    const newDistance = distances[`${x},${y}`] + 1; // Tính khoảng cách mới
                    // Nếu khoảng cách mới ngắn hơn khoảng cách đã biết
                    if (newDistance < distances[`${newX},${newY}`]) {
                        distances[`${newX},${newY}`] = newDistance; // Cập nhật khoảng cách
                        previous[`${newX},${newY}`] = `${x},${y}`; // Cập nhật ô trước
                        queue.push({ pos: [newX, newY], distance: newDistance }); // Thêm ô mới vào hàng đợi
                    }
                }
            }
        }

        return { found: false, path: [] }; // Không tìm thấy đường đi
    }

    // Kiểm tra xem ô mới có hợp lệ để di chuyển không
    private isValidMove(x: number, y: number, matrix: (number | { type: number, color: string })[][], visited: Set<string>): boolean {
        return (
            x >= 0 && x < this.rows && // Kiểm tra hàng
            y >= 0 && y < this.cols && // Kiểm tra cột
            this.canMove(matrix[x][y]) && // Kiểm tra ô có thể di chuyển
            !visited.has(`${x},${y}`) // Kiểm tra ô đã được xác định chưa
        );
    }

    // Tái tạo đường đi từ ô nguồn đến ô đích
    private getPath(previous: { [key: string]: string | null }, target: [number, number]): [number, number][] {
        const path: [number, number][] = []; // Mảng để lưu trữ đường đi
        let current = `${target[0]},${target[1]}`; // Bắt đầu từ ô đích

        while (current) {
            const [x, y] = current.split(",").map(Number); // Tách tọa độ
            path.unshift([x, y]); // Thêm tọa độ vào đầu mảng
            current = previous[current]; // Lên ô trước
        }

        return path; // Trả về đường đi
    }
}
