import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Line98Service } from './line98/line98.module';
import { SuggestProvider } from './line98/providers/suggest.provider';
import { CaroService } from './caro/providers/caro.service';

enum GameType {
  LINE98 = 'line98',
  CARO = 'caro',
}

@WebSocketGateway({
  cors: {
    origin: true, 
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type'],  
    credentials: true,
  },
})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private games: { [key: string]: any } = {}; 

  constructor( 
    private readonly line98Service: Line98Service,
    private readonly suggestProvider: SuggestProvider,
    private readonly caroService: CaroService
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway đã được khởi tạo');
  }

  handleConnection(socket: Socket) {
    console.log('Người chơi đã kết nối:', socket.id);
  }

  handleDisconnect(socket: Socket) {
    try {
      const gameId = socket.id; 
      const game = this.games[gameId];
      if (game.gameType= GameType.CARO) {  
        // Xóa người chơi khỏi game
        game.players = game.players.filter(player => player.socketId !== socket.id);
  
        // Nếu không còn người chơi nào, xóa game
        if (game.players.length <= 1) {
          delete this.games[gameId];
          this.server.to(gameId).emit('gameEnded', 'Trò chơi đã kết thúc do ngắt kết nối.');
        } else {
          this.server.to(gameId).emit('playerDisconnected', { playerId: socket.id });
        }
      }
    } catch (error) {

    }

  }

  @SubscribeMessage('initializeGame')
  async handleInitializeGame(@ConnectedSocket() socket: Socket, @MessageBody() data: { gameType: string, user: { id: number, age: number, username: string, firstName: string, lastName: string, email: string } }) {
    const gameId = socket.id;
    this.games[gameId] = this.initializeGame(data.gameType);
    this.games[gameId].user = data.user;
    console.log(`Khởi tạo game ${data.gameType} cho người chơi:`, socket.id);
    this.server.to(socket.id).emit('gameInit', this.games[gameId]);
  }

  private initializeGame(gameType: string) {
    if (gameType === GameType.LINE98) {
      return { type: GameType.LINE98, matrix: this.line98Service.initializeRandomMatrix() };
    } 
  }

  @SubscribeMessage('getSuggestMove')
  async suggestMove(@ConnectedSocket() socket: Socket) {
    const gameId = socket.id;
    const game = this.games[gameId];
    game.suggestMove = this.suggestProvider.suggestMove(game.matrix);
    this.server.to(socket.id).emit('suggestMoveUpdate', game);
  }

  @SubscribeMessage('gameAction')
  async handleGameAction(@ConnectedSocket() socket: Socket, @MessageBody() data: { action: string, position: { from: { x: number, y: number }, to: { x: number, y: number } } }) {
    console.log("Nhận hành động game");
    try {
      const gameId = socket.id;
      const game = this.games[gameId];

      if (!game) {
        return this.sendGameError(socket, 'Chưa khởi tạo game');
      }

      if (data.action === 'move') {
        await this.handleLine98Move(socket, game, data.position);
      }
    } catch (error) {
      console.error('Lỗi khi xử lý hành động game:', error);
      this.sendGameError(socket, 'Đã có lỗi xảy ra trong quá trình chơi');
    }
  }
  // Caro
  @SubscribeMessage('createGame')
  async handleCreateGame(@ConnectedSocket() socket: Socket, @MessageBody() data: { userId: number, username: string }) {
    const gameId = socket.id;
    
    this.games[gameId] = {
      gameType: GameType.CARO,
      players: [{ socketId: socket.id, userId: data.userId, username: data.username }],
      matrix: Array.from({ length: 30 }, () => Array(30).fill(0)),
    };
    socket.join(gameId); // vào room
    this.server.to(socket.id).emit('gameCreated', { gameId, players: this.games[gameId].players });
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(@ConnectedSocket() socket: Socket, @MessageBody() data: { gameId: string, userId: number, username: string }) {
    const game = this.games[data.gameId];
    if (game && game.players.length < 2) {
      game.players.push({ socketId: socket.id, userId: data.userId, username: data.username });
      socket.join(data.gameId);
      // Người tạo game join vào phòng trước index là 0
      game.currentTurn = 0; // Người tạo game đi trước đi trước / join game đi sau
      this.server.to(data.gameId).emit('gameStart', { players: game.players, matrix: game.matrix });
    } else {
      socket.emit('error', 'Không thể tham gia game này.');
    }
  }

  @SubscribeMessage('getCaroRooms')
  async handleGetCaroRooms(@ConnectedSocket() socket: Socket) {
    try {
      console.log("Lấy phòng Caro");
  
      const caroRooms = Object.keys(this.games)
        .filter(gameId => this.games[gameId] && this.games[gameId].gameType === GameType.CARO)
        .map(gameId => ({
          gameId,
          players: this.games[gameId].players?.map(player => player.username) || [], // Kiểm tra players có tồn tại
        }));
  
      this.server.to(socket.id).emit('caroRooms', caroRooms);
    } catch (error) {
      console.log("Không có phòng nào: ", error);
    }
  }
  

  @SubscribeMessage('gameCaroAction')
  async handleGameCaroAction(@ConnectedSocket() socket: Socket, @MessageBody() data: { gameId: string, position: { row: number, col: number } }) {
    const game = this.games[data.gameId];
    const player = game.players.find(p => p.socketId === socket.id);
    const currentPlayerIndex = game.players.indexOf(player);
    console.log("\nNgười chơi: ",currentPlayerIndex);
    console.log("Lượt đi: ", game.currentTurn);
    if (game.matrix[data.position.row][data.position.col] === 0 && game.currentTurn === currentPlayerIndex) {
      game.matrix[data.position.row][data.position.col] = currentPlayerIndex + 1;
      game.currentTurn = (currentPlayerIndex + 1) % 2; // Đổi lượt
      console.log("Đổi lượt: ", game.currentTurn);
      this.server.to(data.gameId).emit('gameUpdate', {
        matrix: game.matrix,
        currentTurn: game.currentTurn  
      });

      const check = this.caroService.checkWin(game.matrix);
      if (check.isLine) {
        
        delete this.games[data.gameId];   // Xóa game
        return this.server.to(data.gameId).emit('gameOver', { winner: player.username });
       
      }

    } else {
      socket.emit('error', 'Chưa đến lượt của bạn');
    }
  }

  @SubscribeMessage('playAgain')
  async handlePlayAgain(@ConnectedSocket() socket: Socket, @MessageBody() data: { gameId: string }) {
    const game = this.games[data.gameId];
    if (!game) {
      socket.emit('error', 'Không tìm thấy game.');
      return;
    }
    game.matrix = Array.from({ length: 30 }, () => Array(30).fill(0));
    game.currentTurn = 0; 
    this.server.to(data.gameId).emit('gameRestart', {
      matrix: game.matrix,
      currentTurn: game.currentTurn
    });
  }



  private async handleLine98Move(socket: Socket, game: any, position: { from: { x: number, y: number }, to: { x: number, y: number } }) {
    const result = this.line98Service.moveBall(game.matrix, [position.from.x, position.from.y], [position.to.x, position.to.y]);

    // Kiểm tra nếu chỉ còn 1 ô trống thì game over
    const emptyCells = this.line98Service.countEmptyCells(result.matrix);
    if (emptyCells <= 2) {
      this.server.to(socket.id).emit('gameOver', game);
      delete this.games[socket.id]; // Xóa game sau khi game over
      return;
    }

    // Kiểm tra kết quả từ moveBall
    if (result && result.found && result.path) {
      game.found = result.found;
      game.path = result.path;
      game.matrix = result.matrix;
      this.games[socket.id] = game;

      this.server.to(socket.id).emit('gameUpdate', game);
    } else {
      console.error('Không tìm thấy đường đi hoặc không thể di chuyển');
      this.sendGameError(socket, 'Không thể di chuyển hoặc không có đường đi');
    }
  }

  private sendGameError(socket: Socket, message: string) {
    this.server.to(socket.id).emit('gameError', message);
  }
}
