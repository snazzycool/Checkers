'use client';

import { useGameStore } from '@/store/gameStore';
import { Position } from '@/lib/draughts';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

export function GameBoard() {
  const { board, currentTurn, selectedPiece, validMoves, selectPiece, makeMove, playerColor } = useGameStore();
  
  // Flip the board if player is black
  const displayRows = playerColor === 'black' ? [...Array(10).keys()].reverse() : [...Array(10).keys()];
  const displayCols = playerColor === 'black' ? [...Array(10).keys()].reverse() : [...Array(10).keys()];
  
  const handleSquareClick = (row: number, col: number) => {
    const pos: Position = { row, col };
    
    // Check if clicking on a valid move destination
    if (selectedPiece && validMoves.some(m => m.row === row && m.col === col)) {
      makeMove(pos);
      return;
    }
    
    // Select a piece
    selectPiece(pos);
  };
  
  const isSelected = (row: number, col: number) => 
    selectedPiece?.row === row && selectedPiece?.col === col;
  
  const isValidMove = (row: number, col: number) =>
    validMoves.some(m => m.row === row && m.col === col);
  
  return (
    <div className="relative w-full max-w-[min(90vw,500px)] mx-auto">
      {/* Board coordinates - Top */}
      <div className="flex justify-around text-[10px] sm:text-xs text-muted-foreground font-medium mb-1 px-1">
        {displayCols.map(col => (
          <div key={col} className="w-[9%] text-center">
            {String.fromCharCode(97 + col)}
          </div>
        ))}
      </div>
      
      <div className="flex">
        {/* Left coordinates */}
        <div className="flex flex-col justify-around text-[10px] sm:text-xs text-muted-foreground font-medium mr-1">
          {displayRows.map(row => (
            <div key={row} className="h-[9vw] sm:h-9 flex items-center justify-center max-h-10">
              {row + 1}
            </div>
          ))}
        </div>
        
        {/* Board */}
        <div className="flex-1 border-2 sm:border-4 border-amber-900 rounded-lg overflow-hidden shadow-2xl">
          <div className="grid grid-cols-10 aspect-square">
            {displayRows.map(row => 
              displayCols.map(col => {
                const isDark = (row + col) % 2 === 1;
                const piece = board[row]?.[col];
                const selected = isSelected(row, col);
                const valid = isValidMove(row, col);
                
                return (
                  <div
                    key={`${row}-${col}`}
                    onClick={() => handleSquareClick(row, col)}
                    className={cn(
                      "aspect-square flex items-center justify-center relative cursor-pointer transition-all duration-150 touch-manipulation",
                      isDark ? "bg-amber-700" : "bg-amber-200",
                      selected && "ring-2 sm:ring-4 ring-yellow-400 ring-inset z-10",
                      valid && !piece?.type && "after:absolute after:w-[30%] after:h-[30%] after:bg-green-500/70 after:rounded-full",
                      valid && piece?.type && "ring-2 sm:ring-4 ring-red-500 ring-inset"
                    )}
                  >
                    {piece?.type && (
                      <div
                        className={cn(
                          "w-[75%] h-[75%] rounded-full flex items-center justify-center shadow-lg transition-transform",
                          piece.type === 'white' 
                            ? "bg-gradient-to-br from-gray-100 to-gray-300 border border-gray-400" 
                            : "bg-gradient-to-br from-gray-700 to-gray-950 border border-gray-600",
                          selected && "scale-110"
                        )}
                      >
                        {piece.isKing && (
                          <Crown className={cn(
                            "w-[50%] h-[50%]",
                            piece.type === 'white' ? "text-amber-600" : "text-amber-400"
                          )} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Right coordinates */}
        <div className="flex flex-col justify-around text-[10px] sm:text-xs text-muted-foreground font-medium ml-1">
          {displayRows.map(row => (
            <div key={row} className="h-[9vw] sm:h-9 flex items-center justify-center max-h-10">
              {row + 1}
            </div>
          ))}
        </div>
      </div>
      
      {/* Board coordinates - Bottom */}
      <div className="flex justify-around text-[10px] sm:text-xs text-muted-foreground font-medium mt-1 px-1">
        {displayCols.map(col => (
          <div key={col} className="w-[9%] text-center">
            {String.fromCharCode(97 + col)}
          </div>
        ))}
      </div>
    </div>
  );
}
