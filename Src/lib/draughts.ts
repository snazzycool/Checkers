// International Draughts (10x10 Checkers) Game Engine

export type PieceType = 'white' | 'black' | null;
export type Piece = {
  type: PieceType;
  isKing: boolean;
};

export type Position = {
  row: number;
  col: number;
};

export type Move = {
  from: Position;
  to: Position;
  captures: Position[];
  promotes: boolean;
};

export type BoardState = Piece[][];

// Initialize a new 10x10 board with pieces
export function createInitialBoard(): BoardState {
  const board: BoardState = [];
  
  for (let row = 0; row < 10; row++) {
    board[row] = [];
    for (let col = 0; col < 10; col++) {
      // Only dark squares are playable (where (row + col) is odd)
      if ((row + col) % 2 === 1) {
        // Top 4 rows: black pieces
        if (row < 4) {
          board[row][col] = { type: 'black', isKing: false };
        }
        // Bottom 4 rows: white pieces
        else if (row > 5) {
          board[row][col] = { type: 'white', isKing: false };
        }
        // Middle rows: empty
        else {
          board[row][col] = { type: null, isKing: false };
        }
      } else {
        board[row][col] = { type: null, isKing: false };
      }
    }
  }
  
  return board;
}

// Check if a position is valid on the board
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 10 && pos.col >= 0 && pos.col < 10;
}

// Check if a position is a dark (playable) square
export function isDarkSquare(pos: Position): boolean {
  return (pos.row + pos.col) % 2 === 1;
}

// Get piece at position
export function getPiece(board: BoardState, pos: Position): Piece | null {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
}

// Set piece at position
export function setPiece(board: BoardState, pos: Position, piece: Piece): BoardState {
  const newBoard = board.map(row => [...row]);
  newBoard[pos.row][pos.col] = piece;
  return newBoard;
}

// Get all diagonal directions for a piece
function getDiagonalDirections(piece: Piece): Position[] {
  // In International Draughts:
  // - Men can only move forward (but can capture backwards)
  // - Kings can move in all 4 diagonal directions
  
  if (piece.isKing) {
    return [
      { row: -1, col: -1 }, { row: -1, col: 1 },
      { row: 1, col: -1 }, { row: 1, col: 1 }
    ];
  }
  
  // For men, forward depends on color
  // White moves up (negative row), Black moves down (positive row)
  if (piece.type === 'white') {
    return [
      { row: -1, col: -1 }, { row: -1, col: 1 } // Forward
    ];
  } else {
    return [
      { row: 1, col: -1 }, { row: 1, col: 1 } // Forward
    ];
  }
}

// Get all capture directions for a piece (includes backwards for men)
function getCaptureDirections(piece: Piece): Position[] {
  if (piece.isKing) {
    return [
      { row: -1, col: -1 }, { row: -1, col: 1 },
      { row: 1, col: -1 }, { row: 1, col: 1 }
    ];
  }
  
  // Men can capture in ALL 4 directions (including backwards)
  return [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ];
}

// Get regular (non-capture) moves for a piece
export function getRegularMoves(board: BoardState, pos: Position): Position[] {
  const piece = getPiece(board, pos);
  if (!piece || !piece.type) return [];
  
  const moves: Position[] = [];
  const directions = getDiagonalDirections(piece);
  
  for (const dir of directions) {
    if (piece.isKing) {
      // Kings can move multiple squares in any diagonal direction
      let currentPos = { row: pos.row + dir.row, col: pos.col + dir.col };
      
      while (isValidPosition(currentPos) && isDarkSquare(currentPos)) {
        const targetPiece = getPiece(board, currentPos);
        if (targetPiece && targetPiece.type) break; // Blocked by a piece
        
        moves.push({ ...currentPos });
        currentPos = { row: currentPos.row + dir.row, col: currentPos.col + dir.col };
      }
    } else {
      // Men move one square forward diagonally
      const newPos = { row: pos.row + dir.row, col: pos.col + dir.col };
      
      if (isValidPosition(newPos) && isDarkSquare(newPos)) {
        const targetPiece = getPiece(board, newPos);
        if (!targetPiece || !targetPiece.type) {
          moves.push(newPos);
        }
      }
    }
  }
  
  return moves;
}

// Find all capture sequences (multi-captures) from a position
export function findCaptureSequences(
  board: BoardState,
  pos: Position,
  capturedSoFar: Position[] = []
): Position[][] {
  const piece = getPiece(board, pos);
  if (!piece || !piece.type) return capturedSoFar.length > 0 ? [capturedSoFar] : [];
  
  const sequences: Position[][] = [];
  const directions = getCaptureDirections(piece);
  let foundCapture = false;
  
  for (const dir of directions) {
    if (piece.isKing) {
      // King can capture at any distance
      let currentPos = { row: pos.row + dir.row, col: pos.col + dir.col };
      let foundEnemy = false;
      let enemyPos: Position | null = null;
      
      while (isValidPosition(currentPos) && isDarkSquare(currentPos)) {
        const targetPiece = getPiece(board, currentPos);
        
        if (targetPiece && targetPiece.type) {
          if (!foundEnemy) {
            // Found first piece
            if (targetPiece.type !== piece.type && 
                !capturedSoFar.some(c => c.row === currentPos.row && c.col === currentPos.col)) {
              foundEnemy = true;
              enemyPos = { ...currentPos };
            } else {
              break; // Blocked by own piece or already captured piece
            }
          } else {
            break; // Second piece in this direction
          }
        } else if (foundEnemy && enemyPos) {
          // Empty square after enemy - can land here
          const newCaptures = [...capturedSoFar, enemyPos];
          const tempBoard = simulateCapture(board, pos, currentPos, enemyPos);
          
          // Check for continuation of capture
          const continuations = findCaptureSequences(tempBoard, currentPos, newCaptures);
          
          if (continuations.length > 0 && continuations[0].length > newCaptures.length) {
            sequences.push(...continuations);
          } else {
            sequences.push(newCaptures);
          }
          foundCapture = true;
        }
        
        currentPos = { row: currentPos.row + dir.row, col: currentPos.col + dir.col };
      }
    } else {
      // Men capture by jumping one square
      const enemyPos = { row: pos.row + dir.row, col: pos.col + dir.col };
      const landingPos = { row: pos.row + dir.row * 2, col: pos.col + dir.col * 2 };
      
      if (isValidPosition(enemyPos) && isValidPosition(landingPos) && 
          isDarkSquare(enemyPos) && isDarkSquare(landingPos)) {
        const enemyPiece = getPiece(board, enemyPos);
        const landingPiece = getPiece(board, landingPos);
        
        if (enemyPiece && enemyPiece.type && enemyPiece.type !== piece.type &&
            (!landingPiece || !landingPiece.type) &&
            !capturedSoFar.some(c => c.row === enemyPos.row && c.col === enemyPos.col)) {
          
          foundCapture = true;
          const newCaptures = [...capturedSoFar, enemyPos];
          const tempBoard = simulateCapture(board, pos, landingPos, enemyPos);
          
          // Check for continuation
          const continuations = findCaptureSequences(tempBoard, landingPos, newCaptures);
          
          if (continuations.length > 0 && continuations[0].length > newCaptures.length) {
            sequences.push(...continuations);
          } else {
            sequences.push(newCaptures);
          }
        }
      }
    }
  }
  
  if (!foundCapture && capturedSoFar.length > 0) {
    return [capturedSoFar];
  }
  
  return sequences;
}

// Simulate a capture on the board
function simulateCapture(
  board: BoardState,
  from: Position,
  to: Position,
  captured: Position
): BoardState {
  let newBoard = [...board.map(row => [...row])];
  const piece = getPiece(newBoard, from);
  
  // Remove the captured piece
  newBoard[captured.row][captured.col] = { type: null, isKing: false };
  
  // Move the piece
  newBoard[from.row][from.col] = { type: null, isKing: false };
  if (piece) {
    newBoard[to.row][to.col] = piece;
  }
  
  return newBoard;
}

// Get all valid captures for a player
export function getAllCaptures(board: BoardState, player: 'white' | 'black'): Map<string, Position[][]> {
  const captures = new Map<string, Position[][]>();
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = getPiece(board, { row, col });
      if (piece && piece.type === player) {
        const sequences = findCaptureSequences(board, { row, col });
        if (sequences.length > 0 && sequences[0].length > 0) {
          captures.set(`${row}-${col}`, sequences);
        }
      }
    }
  }
  
  return captures;
}

// Get all valid moves for a player
export function getAllValidMoves(board: BoardState, player: 'white' | 'black'): Map<string, Position[]> {
  const allCaptures = getAllCaptures(board, player);
  const moves = new Map<string, Position[]>();
  
  // If captures exist, player must capture (mandatory capture rule)
  if (allCaptures.size > 0) {
    // Convert captures to landing positions
    allCaptures.forEach((sequences, key) => {
      const [row, col] = key.split('-').map(Number);
      const landingPositions: Position[] = [];
      
      sequences.forEach(seq => {
        // Calculate final landing position
        const lastCapture = seq[seq.length - 1];
        const directions = getCaptureDirections(getPiece(board, { row, col })!);
        
        for (const dir of directions) {
          if (Math.abs(lastCapture.row - row) > 1 || Math.abs(lastCapture.col - col) > 1) {
            // King move - need to find exact landing position
            // For simplicity, we'll just mark the captures
          }
        }
        
        // For now, just indicate this piece has captures available
        landingPositions.push({ row: -1, col: -1 }); // Placeholder
      });
      
      moves.set(key, landingPositions);
    });
    
    return moves;
  }
  
  // No captures - get regular moves
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = getPiece(board, { row, col });
      if (piece && piece.type === player) {
        const pieceMoves = getRegularMoves(board, { row, col });
        if (pieceMoves.length > 0) {
          moves.set(`${row}-${col}`, pieceMoves);
        }
      }
    }
  }
  
  return moves;
}

// Check if a move is valid
export function isValidMove(
  board: BoardState,
  from: Position,
  to: Position,
  player: 'white' | 'black'
): { valid: boolean; captures: Position[] } {
  const piece = getPiece(board, from);
  if (!piece || piece.type !== player) {
    return { valid: false, captures: [] };
  }
  
  // Check for mandatory captures
  const allCaptures = getAllCaptures(board, player);
  
  if (allCaptures.size > 0) {
    // Must capture
    const pieceCaptures = allCaptures.get(`${from.row}-${from.col}`);
    if (!pieceCaptures) {
      return { valid: false, captures: [] };
    }
    
    // Check if this specific capture sequence leads to 'to'
    for (const sequence of pieceCaptures) {
      // Simulate the captures and check if we end at 'to'
      let currentPos = from;
      let tempBoard = board;
      let valid = true;
      
      for (const capture of sequence) {
        const dir = {
          row: capture.row > currentPos.row ? 1 : -1,
          col: capture.col > currentPos.col ? 1 : -1
        };
        
        // Find landing position after this capture
        let landingPos: Position;
        if (piece.isKing) {
          // King lands on first empty square after captured piece
          landingPos = { row: capture.row + dir.row, col: capture.col + dir.col };
          while (isValidPosition(landingPos) && getPiece(tempBoard, landingPos)?.type) {
            landingPos = { row: landingPos.row + dir.row, col: landingPos.col + dir.col };
          }
        } else {
          landingPos = { row: capture.row + dir.row, col: capture.col + dir.col };
        }
        
        if (!isValidPosition(landingPos)) {
          valid = false;
          break;
        }
        
        tempBoard = simulateCapture(tempBoard, currentPos, landingPos, capture);
        currentPos = landingPos;
      }
      
      if (valid && currentPos.row === to.row && currentPos.col === to.col) {
        return { valid: true, captures: sequence };
      }
    }
    
    return { valid: false, captures: [] };
  }
  
  // Regular move (no captures)
  const regularMoves = getRegularMoves(board, from);
  const isRegularMove = regularMoves.some(m => m.row === to.row && m.col === to.col);
  
  return { valid: isRegularMove, captures: [] };
}

// Execute a move on the board
export function executeMove(
  board: BoardState,
  from: Position,
  to: Position,
  captures: Position[]
): BoardState {
  let newBoard = [...board.map(row => [...row])];
  const piece = getPiece(newBoard, from);
  
  if (!piece || !piece.type) return newBoard;
  
  // Remove captured pieces
  for (const capture of captures) {
    newBoard[capture.row][capture.col] = { type: null, isKing: false };
  }
  
  // Move the piece
  newBoard[from.row][from.col] = { type: null, isKing: false };
  
  // Check for promotion
  let isKing = piece.isKing;
  if (!isKing) {
    if ((piece.type === 'white' && to.row === 0) || 
        (piece.type === 'black' && to.row === 9)) {
      isKing = true;
    }
  }
  
  newBoard[to.row][to.col] = { type: piece.type, isKing };
  
  return newBoard;
}

// Check if the game is over
export function checkGameOver(board: BoardState): { over: boolean; winner: 'white' | 'black' | 'draw' | null } {
  let whitePieces = 0;
  let blackPieces = 0;
  let whiteMoves = 0;
  let blackMoves = 0;
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = getPiece(board, { row, col });
      if (piece && piece.type) {
        if (piece.type === 'white') {
          whitePieces++;
          whiteMoves += getRegularMoves(board, { row, col }).length;
          whiteMoves += findCaptureSequences(board, { row, col }).length > 0 ? 1 : 0;
        } else {
          blackPieces++;
          blackMoves += getRegularMoves(board, { row, col }).length;
          blackMoves += findCaptureSequences(board, { row, col }).length > 0 ? 1 : 0;
        }
      }
    }
  }
  
  if (whitePieces === 0) {
    return { over: true, winner: 'black' };
  }
  if (blackPieces === 0) {
    return { over: true, winner: 'white' };
  }
  
  // Check if current player has no moves
  // This would need to be checked in the game logic with the current turn
  
  return { over: false, winner: null };
}

// Get the number of pieces for each player
export function getPieceCount(board: BoardState): { white: number; black: number; whiteKings: number; blackKings: number } {
  let white = 0, black = 0, whiteKings = 0, blackKings = 0;
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = getPiece(board, { row, col });
      if (piece && piece.type) {
        if (piece.type === 'white') {
          white++;
          if (piece.isKing) whiteKings++;
        } else {
          black++;
          if (piece.isKing) blackKings++;
        }
      }
    }
  }
  
  return { white, black, whiteKings, blackKings };
}

// Serialize board for storage
export function serializeBoard(board: BoardState): string {
  return JSON.stringify(board);
}

// Deserialize board from storage
export function deserializeBoard(data: string): BoardState {
  return JSON.parse(data);
}

// Get valid destination squares for a piece (for UI highlighting)
export function getValidDestinations(
  board: BoardState,
  from: Position,
  player: 'white' | 'black'
): Position[] {
  const allCaptures = getAllCaptures(board, player);
  const destinations: Position[] = [];
  
  // If captures exist for any piece, check if this piece has captures
  if (allCaptures.size > 0) {
    const pieceCaptures = allCaptures.get(`${from.row}-${from.col}`);
    if (pieceCaptures) {
      // This piece has captures available
      // Calculate all possible landing positions
      for (const sequence of pieceCaptures) {
        const finalDest = calculateFinalDestination(board, from, sequence);
        if (finalDest && !destinations.some(d => d.row === finalDest.row && d.col === finalDest.col)) {
          destinations.push(finalDest);
        }
      }
    }
    return destinations;
  }
  
  // No captures - return regular moves
  return getRegularMoves(board, from);
}

// Calculate final destination after a capture sequence
function calculateFinalDestination(
  board: BoardState,
  from: Position,
  captures: Position[]
): Position | null {
  const piece = getPiece(board, from);
  if (!piece) return null;
  
  let currentPos = from;
  let tempBoard = board;
  
  for (const capture of captures) {
    const dir = {
      row: capture.row > currentPos.row ? 1 : -1,
      col: capture.col > currentPos.col ? 1 : -1
    };
    
    let landingPos: Position;
    if (piece.isKing || (tempBoard[currentPos.row]?.[currentPos.col]?.isKing)) {
      landingPos = { row: capture.row + dir.row, col: capture.col + dir.col };
      while (isValidPosition(landingPos) && 
             isDarkSquare(landingPos) && 
             getPiece(tempBoard, landingPos)?.type) {
        landingPos = { row: landingPos.row + dir.row, col: landingPos.col + dir.col };
      }
    } else {
      landingPos = { row: capture.row + dir.row, col: capture.col + dir.col };
    }
    
    if (!isValidPosition(landingPos)) return null;
    
    tempBoard = simulateCapture(tempBoard, currentPos, landingPos, capture);
    currentPos = landingPos;
  }
  
  return currentPos;
}

// Simple AI: Evaluate board position
export function evaluateBoard(board: BoardState): number {
  const counts = getPieceCount(board);
  return (counts.white + counts.whiteKings * 3) - (counts.black + counts.blackKings * 3);
}

// Simple AI: Get best move for computer
export function getComputerMove(board: BoardState, player: 'white' | 'black'): { from: Position; to: Position; captures: Position[] } | null {
  const allCaptures = getAllCaptures(board, player);
  
  // If captures available, prioritize them
  if (allCaptures.size > 0) {
    let bestMove: { from: Position; to: Position; captures: Position[] } | null = null;
    let maxCaptures = 0;
    
    allCaptures.forEach((sequences, key) => {
      const [row, col] = key.split('-').map(Number);
      const from: Position = { row, col };
      
      for (const sequence of sequences) {
        if (sequence.length > maxCaptures || !bestMove) {
          const to = calculateFinalDestination(board, from, sequence);
          if (to) {
            maxCaptures = sequence.length;
            bestMove = { from, to, captures: sequence };
          }
        }
      }
    });
    
    return bestMove;
  }
  
  // No captures - find best regular move
  let bestMove: { from: Position; to: Position; captures: Position[] } | null = null;
  let bestScore = player === 'white' ? -Infinity : Infinity;
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = getPiece(board, { row, col });
      if (piece && piece.type === player) {
        const moves = getRegularMoves(board, { row, col });
        
        for (const to of moves) {
          const newBoard = executeMove(board, { row, col }, to, []);
          const score = evaluateBoard(newBoard);
          
          if ((player === 'white' && score > bestScore) || 
              (player === 'black' && score < bestScore)) {
            bestScore = score;
            bestMove = { from: { row, col }, to, captures: [] };
          }
        }
      }
    }
  }
  
  return bestMove;
}
