'use client';

import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MoveHistory() {
  const { moveHistory } = useGameStore();
  
  const formatPosition = (row: number, col: number) => {
    return `${String.fromCharCode(97 + col)}${10 - row}`;
  };
  
  const formatMove = (move: typeof moveHistory[0]) => {
    const from = formatPosition(move.from.row, move.from.col);
    const to = formatPosition(move.to.row, move.to.col);
    const captures = move.captures.length > 0 ? `x${move.captures.length}` : '';
    
    return `${from}-${to}${captures}`;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-2 px-3 border-b">
        <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
          <History className="h-3 w-3 sm:h-4 sm:w-4" />
          Moves ({moveHistory.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-24 sm:h-32">
          {moveHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No moves yet
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 p-2 text-xs sm:text-sm">
              {moveHistory.map((move, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-1 px-1 py-0.5 rounded",
                    move.player === 'white' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500'
                  )}
                >
                  <span className="text-[10px] sm:text-xs text-muted-foreground w-4">
                    {Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '...'}
                  </span>
                  <span className={cn(
                    "font-mono",
                    move.captures.length > 0 && 'text-red-500 font-medium'
                  )}>
                    {formatMove(move)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
