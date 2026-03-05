'use client';

import { useGameStore } from '@/store/gameStore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Country flags mapping
const COUNTRY_FLAGS: Record<string, string> = {
  'NG': '🇳🇬', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
  'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱', 'BR': '🇧🇷', 'RU': '🇷🇺',
  'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'IN': '🇮🇳', 'AU': '🇦🇺',
  'CA': '🇨🇦', 'MX': '🇲🇽', 'AR': '🇦🇷', 'ZA': '🇿🇦', 'EG': '🇪🇬',
  'KE': '🇰🇪', 'GH': '🇬🇭', 'ET': '🇪🇹', 'TZ': '🇹🇿',
  '': '🌍'
};

interface PlayerCardProps {
  color: 'white' | 'black';
  isCurrentTurn: boolean;
}

export function PlayerCard({ color, isCurrentTurn }: PlayerCardProps) {
  const { 
    playerName, 
    playerColor, 
    playerStats, 
    playerCountry,
    playerAvatar,
    board,
    capturedPieces,
    whiteTime,
    blackTime,
    mode,
    opponent,
    isThinking
  } = useGameStore();
  
  const isPlayer = playerColor === color;
  
  // Determine player info based on mode
  const name = isPlayer 
    ? playerName 
    : (mode === 'vs-computer' ? 'Computer' : (opponent?.name || 'Opponent'));
  
  const rating = isPlayer 
    ? playerStats.rating 
    : (opponent?.rating || 1500);
  
  const country = isPlayer ? playerCountry : '';
  const avatar = isPlayer ? playerAvatar : (opponent?.avatar || '🤖');
  const piecesCaptured = color === 'white' ? capturedPieces.black : capturedPieces.white;
  
  // Get the time for this player
  const playerTime = color === 'white' ? whiteTime : blackTime;
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Check if time is low (less than 1 minute)
  const isTimeLow = playerTime < 60;
  
  // Count pieces on board
  const piecesOnBoard = { white: 0, black: 0 };
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const piece = board[r]?.[c];
      if (piece?.type) {
        piecesOnBoard[piece.type]++;
      }
    }
  }
  
  // Show thinking indicator for computer
  const showThinking = !isPlayer && mode === 'vs-computer' && isThinking && isCurrentTurn;
  
  return (
    <Card className={cn(
      "transition-all duration-300",
      isCurrentTurn && "ring-2 ring-green-500 shadow-lg"
    )}>
      <CardContent className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
        {/* Avatar with country flag */}
        <div className="relative">
          <Avatar className={cn(
            "h-10 w-10 sm:h-12 sm:w-12",
            color === 'white' ? "bg-gray-200" : "bg-gray-800"
          )}>
            <AvatarFallback className={cn(
              color === 'white' ? "text-gray-800" : "text-gray-200",
              "text-lg sm:text-xl"
            )}>
              {avatar}
            </AvatarFallback>
          </Avatar>
          {/* Country flag */}
          <span className="absolute -bottom-1 -right-1 text-sm sm:text-base">
            {COUNTRY_FLAGS[country] || '🌍'}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="font-semibold truncate text-sm sm:text-base">{name}</span>
            <span className="text-xs sm:text-sm text-muted-foreground">({rating})</span>
            {showThinking && (
              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="text-muted-foreground">
              ♛ {piecesOnBoard[color]}
            </span>
            {piecesCaptured > 0 && (
              <span className="text-green-500 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                +{piecesCaptured}
              </span>
            )}
          </div>
        </div>
        
        {/* Timer */}
        <div className={cn(
          "flex flex-col items-center px-2 sm:px-3 py-1 rounded-lg font-mono text-lg sm:text-2xl font-bold",
          isCurrentTurn ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-muted",
          isTimeLow && isCurrentTurn && "bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse"
        )}>
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mb-1" />
          <span>{formatTime(playerTime)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
