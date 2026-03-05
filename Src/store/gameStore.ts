import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type GameMode = 'lobby' | 'playing' | 'vs-computer' | 'game-over' | 'leaderboard';
export type PlayerColor = 'white' | 'black';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface Position {
  row: number;
  col: number;
}

interface Piece {
  type: PlayerColor | null;
  isKing: boolean;
}

type Board = Piece[][];

interface MoveHistory {
  from: Position;
  to: Position;
  captures: Position[];
  player: PlayerColor;
}

interface GameState {
  mode: GameMode;
  board: Board;
  currentTurn: PlayerColor;
  playerColor: PlayerColor;
  selectedPiece: Position | null;
  validMoves: Position[];
  moveHistory: MoveHistory[];
  capturedPieces: { white: number; black: number };
  gameOver: { over: boolean; winner: PlayerColor | 'draw' | null; reason?: string };
  isThinking: boolean;
  
  // Timer
  timeControl: number;
  whiteTime: number;
  blackTime: number;
  timerActive: boolean;
  
  // Player info (persisted)
  playerName: string;
  playerCountry: string;
  playerAvatar: string;
  playerStats: { gamesPlayed: number; gamesWon: number; gamesLost: number; rating: number };
  
  // Multiplayer
  isOnline: boolean;
  isFindingMatch: boolean;
  currentGameId: string | null;
  opponent: { id: string; name: string; rating: number; avatar?: string } | null;
  
  // Game settings
  difficulty: DifficultyLevel;
  selectedTimeControl: number;
  
  // Auth
  isLoggedIn: boolean;
  userId: string | null;
  userEmail: string | null;
  token: string | null;
  
  // Chat
  chatMessages: { sender: string; content: string; time: Date }[];
  chatOpen: boolean;
  
  // Sound settings (persisted)
  soundEnabled: boolean;
  musicEnabled: boolean;
  
  // Leaderboard
  leaderboard: Array<{ name: string; rating: number; country: string; avatar: string }>;
  
  // Actions
  setMode: (mode: GameMode) => void;
  selectPiece: (pos: Position | null) => void;
  makeMove: (to: Position) => boolean;
  resetGame: () => void;
  setPlayerColor: (color: PlayerColor) => void;
  setPlayerName: (name: string) => void;
  setPlayerCountry: (country: string) => void;
  setPlayerAvatar: (avatar: string) => void;
  addChatMessage: (sender: string, content: string) => void;
  setChatOpen: (open: boolean) => void;
  setTimeControl: (seconds: number) => void;
  decrementTimer: () => void;
  setLoggedIn: (loggedIn: boolean, userId?: string, email?: string, token?: string) => void;
  logout: () => void;
  setDifficulty: (difficulty: DifficultyLevel) => void;
  setSelectedTimeControl: (seconds: number) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  setIsThinking: (thinking: boolean) => void;
  // Multiplayer actions
  setIsOnline: (online: boolean) => void;
  setIsFindingMatch: (finding: boolean) => void;
  setCurrentGameId: (gameId: string | null) => void;
  setOpponent: (opponent: { id: string; name: string; rating: number; avatar?: string } | null) => void;
  updateFromServer: (boardState: Board, turn: PlayerColor) => void;
  setPlayerStats: (stats: { gamesPlayed: number; gamesWon: number; gamesLost: number; rating: number }) => void;
}

// Create initial board
function createInitialBoard(): Board {
  const board: Board = [];
  for (let row = 0; row < 10; row++) {
    board[row] = [];
    for (let col = 0; col < 10; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 4) {
          board[row][col] = { type: 'black', isKing: false };
        } else if (row > 5) {
          board[row][col] = { type: 'white', isKing: false };
        } else {
          board[row][col] = { type: null, isKing: false };
        }
      } else {
        board[row][col] = { type: null, isKing: false };
      }
    }
  }
  return board;
}

// Check if position is valid
function isValidPos(row: number, col: number): boolean {
  return row >= 0 && row < 10 && col >= 0 && col < 10;
}

// Get valid moves for a piece
function getValidMoves(board: Board, from: Position, player: PlayerColor): Position[] {
  const piece = board[from.row]?.[from.col];
  if (!piece?.type || piece.type !== player) return [];
  
  const moves: Position[] = [];
  const directions = piece.isKing 
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : player === 'white' 
      ? [[-1, -1], [-1, 1]] 
      : [[1, -1], [1, 1]];
  
  // Check for captures first
  const captures = findCaptures(board, from, player, []);
  if (captures.length > 0) {
    return captures;
  }
  
  // Regular moves
  for (const [dr, dc] of directions) {
    if (piece.isKing) {
      let r = from.row + dr;
      let c = from.col + dc;
      while (isValidPos(r, c) && !board[r][c].type) {
        moves.push({ row: r, col: c });
        r += dr;
        c += dc;
      }
    } else {
      const newRow = from.row + dr;
      const newCol = from.col + dc;
      if (isValidPos(newRow, newCol) && !board[newRow][newCol].type) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }
  
  return moves;
}

// Find capture moves
function findCaptures(board: Board, from: Position, player: PlayerColor, captured: Position[]): Position[] {
  const piece = board[from.row]?.[from.col];
  if (!piece?.type) return [];
  
  const captures: Position[] = [];
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // All directions for capturing
  
  for (const [dr, dc] of directions) {
    if (piece.isKing) {
      let r = from.row + dr;
      let c = from.col + dc;
      let foundEnemy = false;
      let enemyPos: Position | null = null;
      
      while (isValidPos(r, c)) {
        const target = board[r][c];
        
        if (target.type) {
          if (!foundEnemy && target.type !== player && !captured.some(cap => cap.row === r && cap.col === c)) {
            foundEnemy = true;
            enemyPos = { row: r, col: c };
          } else {
            break;
          }
        } else if (foundEnemy && enemyPos) {
          captures.push({ row: r, col: c });
        }
        
        r += dr;
        c += dc;
      }
    } else {
      const midRow = from.row + dr;
      const midCol = from.col + dc;
      const endRow = from.row + dr * 2;
      const endCol = from.col + dc * 2;
      
      if (isValidPos(endRow, endCol)) {
        const midPiece = board[midRow][midCol];
        const endPiece = board[endRow][endCol];
        
        if (midPiece.type && midPiece.type !== player && 
            !endPiece.type && 
            !captured.some(cap => cap.row === midRow && cap.col === midCol)) {
          captures.push({ row: endRow, col: endCol });
        }
      }
    }
  }
  
  return captures;
}

// Execute a move
function executeMoveOnBoard(board: Board, from: Position, to: Position): { newBoard: Board; captures: Position[] } {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const piece = { ...newBoard[from.row][from.col] };
  const captures: Position[] = [];
  
  // Find captured pieces
  const dr = to.row > from.row ? 1 : -1;
  const dc = to.col > from.col ? 1 : -1;
  
  if (piece.isKing) {
    let r = from.row + dr;
    let c = from.col + dc;
    while (r !== to.row || c !== to.col) {
      if (newBoard[r][c].type && newBoard[r][c].type !== piece.type) {
        captures.push({ row: r, col: c });
        newBoard[r][c] = { type: null, isKing: false };
      }
      r += dr;
      c += dc;
    }
  } else {
    const midRow = (from.row + to.row) / 2;
    const midCol = (from.col + to.col) / 2;
    
    if (Math.abs(to.row - from.row) === 2) {
      if (newBoard[midRow][midCol].type) {
        captures.push({ row: midRow, col: midCol });
        newBoard[midRow][midCol] = { type: null, isKing: false };
      }
    }
  }
  
  // Move piece
  newBoard[from.row][from.col] = { type: null, isKing: false };
  
  // Check for promotion
  if (piece.type === 'white' && to.row === 0) {
    piece.isKing = true;
  } else if (piece.type === 'black' && to.row === 9) {
    piece.isKing = true;
  }
  
  newBoard[to.row][to.col] = piece;
  
  return { newBoard, captures };
}

// Check game over
function checkGameOver(board: Board): { over: boolean; winner: PlayerColor | 'draw' | null } {
  let whiteCount = 0;
  let blackCount = 0;
  let whiteMoves = false;
  let blackMoves = false;
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      if (piece.type === 'white') {
        whiteCount++;
        if (getValidMoves(board, { row, col }, 'white').length > 0) {
          whiteMoves = true;
        }
      } else if (piece.type === 'black') {
        blackCount++;
        if (getValidMoves(board, { row, col }, 'black').length > 0) {
          blackMoves = true;
        }
      }
    }
  }
  
  if (whiteCount === 0 || !whiteMoves) {
    return { over: true, winner: 'black' };
  }
  if (blackCount === 0 || !blackMoves) {
    return { over: true, winner: 'white' };
  }
  
  return { over: false, winner: null };
}

// Get computer move
function getComputerMove(board: Board, player: PlayerColor): { from: Position; to: Position } | null {
  const allMoves: { from: Position; to: Position; score: number }[] = [];
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      if (piece.type === player) {
        const moves = getValidMoves(board, { row, col }, player);
        for (const move of moves) {
          const { newBoard, captures } = executeMoveOnBoard(board, { row, col }, move);
          const result = checkGameOver(newBoard);
          
          let score = captures.length * 10;
          if (result.over && result.winner === player) {
            score += 1000;
          }
          // Prefer center control
          score += (4.5 - Math.abs(move.col - 4.5)) * 0.5;
          // Prefer king moves
          if (piece.isKing) {
            score += 1;
          }
          
          allMoves.push({ from: { row, col }, to: move, score });
        }
      }
    }
  }
  
  if (allMoves.length === 0) return null;
  
  // Sort by score and pick best
  allMoves.sort((a, b) => b.score - a.score);
  
  // Add some randomness for lower difficulties
  return allMoves[0];
}

// Create store
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      mode: 'lobby',
      board: createInitialBoard(),
      currentTurn: 'white',
      playerColor: 'white',
      selectedPiece: null,
      validMoves: [],
      moveHistory: [],
      capturedPieces: { white: 0, black: 0 },
      gameOver: { over: false, winner: null },
      isThinking: false,
      
      timeControl: 600,
      whiteTime: 600,
      blackTime: 600,
      timerActive: false,
      
      playerName: '',
      playerCountry: '',
      playerAvatar: '👤',
      playerStats: { gamesPlayed: 0, gamesWon: 0, gamesLost: 0, rating: 1500 },
      
      // Multiplayer state
      isOnline: false,
      isFindingMatch: false,
      currentGameId: null,
      opponent: null,
      
      difficulty: 'medium',
      selectedTimeControl: 600,
      
      isLoggedIn: false,
      userId: null,
      userEmail: null,
      token: null,
      
      chatMessages: [],
      chatOpen: false,
      
      soundEnabled: true,
      musicEnabled: false,
      
      leaderboard: [
        { name: 'GrandMaster', rating: 2450, country: 'RU', avatar: '👑' },
        { name: 'DraughtsKing', rating: 2380, country: 'NL', avatar: '🏆' },
        { name: 'CheckerChamp', rating: 2320, country: 'BR', avatar: '⭐' },
        { name: 'BoardMaster', rating: 2280, country: 'US', avatar: '🎯' },
        { name: 'PieceTaker', rating: 2240, country: 'NG', avatar: '🔥' },
      ],
      
      setMode: (mode) => set({ mode }),
      
      selectPiece: (pos) => {
        const state = get();
        if (!pos) {
          set({ selectedPiece: null, validMoves: [] });
          return;
        }
        
        const piece = state.board[pos.row]?.[pos.col];
        if (!piece?.type || piece.type !== state.currentTurn) {
          return;
        }
        
        const validMoves = getValidMoves(state.board, pos, state.currentTurn);
        set({ selectedPiece: pos, validMoves });
      },
      
      makeMove: (to) => {
        const state = get();
        if (!state.selectedPiece) return false;
        
        const isValid = state.validMoves.some(m => m.row === to.row && m.col === to.col);
        if (!isValid) return false;
        
        const { newBoard, captures } = executeMoveOnBoard(state.board, state.selectedPiece, to);
        
        const newCaptured = { ...state.capturedPieces };
        if (state.currentTurn === 'white') {
          newCaptured.black += captures.length;
        } else {
          newCaptured.white += captures.length;
        }
        
        const newHistory: MoveHistory = {
          from: state.selectedPiece,
          to,
          captures,
          player: state.currentTurn
        };
        
        const gameOver = checkGameOver(newBoard);
        const nextTurn = state.currentTurn === 'white' ? 'black' : 'white';
        
        if (gameOver.over) {
          const won = gameOver.winner === state.playerColor;
          const currentStats = state.playerStats;
          set({
            board: newBoard,
            selectedPiece: null,
            validMoves: [],
            moveHistory: [...state.moveHistory, newHistory],
            capturedPieces: newCaptured,
            gameOver,
            mode: 'game-over',
            playerStats: {
              gamesPlayed: currentStats.gamesPlayed + 1,
              gamesWon: currentStats.gamesWon + (won ? 1 : 0),
              gamesLost: currentStats.gamesLost + (won ? 0 : 1),
              rating: Math.max(100, currentStats.rating + (won ? 15 : -10))
            }
          });
        } else {
          set({
            board: newBoard,
            currentTurn: nextTurn,
            selectedPiece: null,
            validMoves: [],
            moveHistory: [...state.moveHistory, newHistory],
            capturedPieces: newCaptured,
          });
        }
        
        return true;
      },
      
      resetGame: () => {
        const state = get();
        set({
          board: createInitialBoard(),
          currentTurn: 'white',
          selectedPiece: null,
          validMoves: [],
          moveHistory: [],
          capturedPieces: { white: 0, black: 0 },
          gameOver: { over: false, winner: null },
          whiteTime: state.timeControl,
          blackTime: state.timeControl,
          timerActive: false,
          chatMessages: []
        });
      },
      
      setPlayerColor: (color) => set({ playerColor: color }),
      setPlayerName: (name) => set({ playerName: name }),
      setPlayerCountry: (country) => set({ playerCountry: country }),
      setPlayerAvatar: (avatar) => set({ playerAvatar: avatar }),
      
      addChatMessage: (sender, content) => set(state => ({
        chatMessages: [...state.chatMessages, { sender, content, time: new Date() }]
      })),
      
      setChatOpen: (open) => set({ chatOpen: open }),
      
      setTimeControl: (seconds) => set({ 
        timeControl: seconds,
        whiteTime: seconds,
        blackTime: seconds
      }),
      
      decrementTimer: () => {
        const state = get();
        if (state.gameOver.over) return;
        
        if (state.currentTurn === 'white') {
          const newTime = state.whiteTime - 1;
          if (newTime <= 0) {
            set({
              whiteTime: 0,
              gameOver: { over: true, winner: 'black', reason: 'timeout' },
              mode: 'game-over'
            });
          } else {
            set({ whiteTime: newTime });
          }
        } else {
          const newTime = state.blackTime - 1;
          if (newTime <= 0) {
            set({
              blackTime: 0,
              gameOver: { over: true, winner: 'white', reason: 'timeout' },
              mode: 'game-over'
            });
          } else {
            set({ blackTime: newTime });
          }
        }
      },
      
      setLoggedIn: (loggedIn, userId, email, token) => set({ 
        isLoggedIn: loggedIn, 
        userId: userId || null,
        userEmail: email || null,
        token: token || null
      }),
      
      logout: () => set({ 
        isLoggedIn: false, 
        userId: null, 
        userEmail: null, 
        token: null,
        isOnline: false,
        currentGameId: null,
        opponent: null
      }),
      
      setDifficulty: (difficulty) => set({ difficulty }),
      setSelectedTimeControl: (seconds) => set({ selectedTimeControl: seconds }),
      
      toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
      toggleMusic: () => set(state => ({ musicEnabled: !state.musicEnabled })),
      setIsThinking: (thinking) => set({ isThinking: thinking }),
      
      // Multiplayer actions
      setIsOnline: (online) => set({ isOnline: online }),
      setIsFindingMatch: (finding) => set({ isFindingMatch: finding }),
      setCurrentGameId: (gameId) => set({ currentGameId: gameId }),
      setOpponent: (opponent) => set({ opponent }),
      updateFromServer: (boardState, turn) => set({ 
        board: boardState, 
        currentTurn: turn,
        selectedPiece: null,
        validMoves: []
      }),
      setPlayerStats: (stats) => set({ playerStats: stats }),
    }),
    {
      name: 'draughts-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        playerName: state.playerName,
        playerCountry: state.playerCountry,
        playerAvatar: state.playerAvatar,
        playerStats: state.playerStats,
        isLoggedIn: state.isLoggedIn,
        userId: state.userId,
        difficulty: state.difficulty,
        selectedTimeControl: state.selectedTimeControl,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        leaderboard: state.leaderboard
      })
    }
  )
);

// Export helper for computer moves
export { getComputerMove };
