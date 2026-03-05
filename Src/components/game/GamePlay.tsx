'use client';

import { useGameStore, getComputerMove } from '@/store/gameStore';
import { GameBoard } from './GameBoard';
import { PlayerCard } from './PlayerCard';
import { FloatingChat } from './FloatingChat';
import { MoveHistory } from './MoveHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  RotateCcw, 
  Flag,
  Trophy,
  Frown,
  Handshake,
  History,
  Volume2,
  VolumeX,
  Music,
  Loader2,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/utils';
import { gameApi } from '@/lib/api';

export function GamePlay() {
  const { 
    mode, 
    currentTurn, 
    playerColor, 
    gameOver, 
    board,
    selectPiece,
    makeMove,
    resetGame,
    setMode,
    capturedPieces,
    whiteTime,
    blackTime,
    decrementTimer,
    moveHistory,
    soundEnabled,
    toggleSound,
    musicEnabled,
    toggleMusic,
    isThinking,
    setIsThinking,
    playerName,
    difficulty,
    opponent,
    currentGameId,
    isOnline,
    userId,
    isLoggedIn,
    token
  } = useGameStore();
  
  const [showMoves, setShowMoves] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [musicVolume, setMusicVolume] = useState(15);
  const [sfxVolume, setSfxVolume] = useState(60);
  const lastCaptureCount = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeWarning = useRef(0);
  
  // Sound hooks
  const {
    playMove,
    playCapture,
    playMultiCapture,
    playKing,
    playVictory,
    playDefeat,
    playGameStart,
    playSelect,
    playLowTime,
    startBackgroundMusic,
    stopBackgroundMusic,
    setMusicVolume: setMusicVol,
    setSfxVolume: setSfxVol
  } = useSound();
  
  // Update volumes
  useEffect(() => {
    setMusicVol(musicVolume / 100);
    setSfxVol(sfxVolume / 100);
  }, [musicVolume, sfxVolume, setMusicVol, setSfxVol]);
  
  // Timer effect
  useEffect(() => {
    if ((mode === 'playing' || mode === 'vs-computer') && !gameOver.over) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          decrementTimer();
        }, 1000);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mode, gameOver.over, decrementTimer]);
  
  // Game start sound and music
  useEffect(() => {
    if ((mode === 'playing' || mode === 'vs-computer') && !gameOver.over) {
      playGameStart();
      
      // Start background music if enabled
      if (musicEnabled) {
        // Small delay to let game start sound finish
        setTimeout(() => {
          startBackgroundMusic();
        }, 500);
      }
    }
    
    return () => {
      stopBackgroundMusic();
    };
  }, [mode, musicEnabled, playGameStart, startBackgroundMusic, stopBackgroundMusic]);
  
  // Stop music on game over
  useEffect(() => {
    if (gameOver.over) {
      stopBackgroundMusic();
      
      if (gameOver.winner === playerColor) {
        playVictory();
      } else if (gameOver.winner !== 'draw') {
        playDefeat();
      }
    }
  }, [gameOver.over, gameOver.winner, playerColor, playVictory, playDefeat, stopBackgroundMusic]);
  
  // Check for captures
  useEffect(() => {
    const totalCaptured = capturedPieces.white + capturedPieces.black;
    const newCaptures = totalCaptured - lastCaptureCount.current;
    
    if (newCaptures > 0) {
      if (newCaptures > 1) {
        playMultiCapture();
      } else {
        playCapture();
      }
    }
    lastCaptureCount.current = totalCaptured;
  }, [capturedPieces.white, capturedPieces.black, playCapture, playMultiCapture]);
  
  // Low time warning (under 30 seconds)
  useEffect(() => {
    const myTime = playerColor === 'white' ? whiteTime : blackTime;
    const now = Date.now();
    
    if (myTime <= 30 && myTime > 0 && now - lastTimeWarning.current > 10000) {
      playLowTime();
      lastTimeWarning.current = now;
    }
  }, [whiteTime, blackTime, playerColor, playLowTime]);
  
  // Computer move logic
  useEffect(() => {
    if (mode !== 'vs-computer') return;
    if (currentTurn === playerColor) return;
    if (gameOver.over) return;
    
    setIsThinking(true);
    
    const timer = setTimeout(() => {
      const computerColor = playerColor === 'white' ? 'black' : 'white';
      const move = getComputerMove(board, computerColor);
      
      if (move) {
        selectPiece(move.from);
        
        setTimeout(() => {
          makeMove(move.to);
          playMove();
          setIsThinking(false);
        }, 300);
      } else {
        setIsThinking(false);
      }
    }, 500 + Math.random() * 1000);
    
    return () => clearTimeout(timer);
  }, [currentTurn, mode, playerColor, gameOver.over, board, setIsThinking, selectPiece, makeMove, playMove]);
  
  // Multiplayer WebSocket event handling
  useEffect(() => {
    if (mode !== 'playing') return;
    
    const socket = (window as any).gameSocket;
    if (!socket) return;
    
    // Handle opponent's move
    const handleMoveMade = (data: { 
      from: { row: number; col: number }; 
      to: { row: number; col: number }; 
      captures: Array<{ row: number; col: number }>;
      currentTurn: 'white' | 'black';
      moveNumber: number;
    }) => {
      console.log('♟️ Received opponent move:', data);
      
      // Apply opponent's move to local board
      // This assumes the opponent sent the move and we need to sync
      selectPiece(data.from);
      setTimeout(() => {
        makeMove(data.to);
        playMove();
      }, 100);
    };
    
    // Handle game ended
    const handleGameEnded = (data: { 
      winner: 'white' | 'black' | 'draw'; 
      reason?: string;
      moves?: any[];
    }) => {
      console.log('🏆 Game ended:', data);
      // The store will handle the game over state
    };
    
    socket.on('move-made', handleMoveMade);
    socket.on('game-ended', handleGameEnded);
    
    return () => {
      socket.off('move-made', handleMoveMade);
      socket.off('game-ended', handleGameEnded);
    };
  }, [mode, selectPiece, makeMove, playMove]);
  
  // Send move to opponent via WebSocket
  const sendMoveToOpponent = useCallback((from: { row: number; col: number }, to: { row: number; col: number }, captures: Array<{ row: number; col: number }>) => {
    const socket = (window as any).gameSocket;
    if (!socket || !currentGameId || mode !== 'playing') return;
    
    socket.emit('move', {
      gameId: currentGameId,
      from,
      to,
      captures
    });
  }, [currentGameId, mode]);
  
  // Save game result to backend when game ends
  useEffect(() => {
    const saveGameResult = async () => {
      if (!gameOver.over || mode === 'vs-computer' || !opponent || !isLoggedIn) return;
      
      try {
        await gameApi.submitGame(token, {
          opponentId: opponent.id || '',
          winner: gameOver.winner,
          resultReason: gameOver.reason,
          timeControl: useGameStore.getState().timeControl,
          movesCount: moveHistory.length,
          moves: moveHistory
        });
        console.log('Game result saved');
      } catch (error) {
        console.error('Failed to save game result:', error);
      }
    };
    
    saveGameResult();
  }, [gameOver.over, mode, opponent, isLoggedIn, gameOver.winner, gameOver.reason, moveHistory]);
  
  const handlePieceSelect = (pos: { row: number; col: number } | null) => {
    selectPiece(pos);
    if (pos && soundEnabled) {
      playSelect();
    }
  };
  
  const handleMakeMove = (to: { row: number; col: number }) => {
    const result = makeMove(to);
    if (result && soundEnabled) {
      playMove();
    }
    
    // Send move to opponent in multiplayer mode
    if (mode === 'playing' && currentGameId) {
      const selectedPiece = useGameStore.getState().selectedPiece;
      if (selectedPiece) {
        sendMoveToOpponent(selectedPiece, to, []);
      }
    }
    
    return result;
  };
  
  const handleResign = () => {
    stopBackgroundMusic();
    setMode('lobby');
  };
  
  const handleNewGame = () => {
    resetGame();
    lastCaptureCount.current = 0;
  };
  
  const handleToggleMusic = () => {
    toggleMusic();
    if (!musicEnabled) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  };
  
  const getResultMessage = () => {
    if (gameOver.reason === 'timeout') {
      return gameOver.winner === playerColor 
        ? "Your opponent ran out of time!" 
        : "You ran out of time!";
    }
    if (gameOver.winner === 'draw') {
      return "The game ended in a draw";
    }
    return gameOver.winner === playerColor
      ? "Congratulations! You played great!"
      : "Better luck next time!";
  };
  
  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-4 gap-2">
        <Button variant="ghost" size="sm" onClick={() => setMode('lobby')} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Leave</span>
        </Button>
        
        <div className="flex items-center gap-2">
          {mode === 'vs-computer' && (
            <Badge variant="secondary" className="text-xs">
              vs Computer ({difficulty})
            </Badge>
          )}
          {isThinking && (
            <Badge variant="outline" className="text-xs animate-pulse text-blue-500">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Thinking...
            </Badge>
          )}
          <Badge variant={currentTurn === playerColor ? "default" : "outline"} className="text-xs">
            {currentTurn === playerColor ? "Your turn" : "Opponent's turn"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleSound}
            className="h-8 w-8 p-0"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleToggleMusic}
            className="h-8 w-8 p-0"
            title={musicEnabled ? "Stop music" : "Play music"}
          >
            <Music className={cn("h-4 w-4", musicEnabled ? "text-amber-500" : "text-muted-foreground")} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(true)}
            className="h-8 w-8 p-0"
            title="Sound settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowMoves(!showMoves)}
            className="hidden sm:flex h-8 w-8 p-0"
            title="Move history"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={handleResign} className="gap-1">
            <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Resign</span>
          </Button>
        </div>
      </div>
      
      {/* Game Layout */}
      <div className="space-y-2 sm:space-y-3">
        {/* Top Player */}
        <PlayerCard 
          color={playerColor === 'white' ? 'black' : 'white'} 
          isCurrentTurn={currentTurn !== playerColor}
        />
        
        {/* Board */}
        <div className="flex justify-center py-2 sm:py-4">
          <GameBoard />
        </div>
        
        {/* Bottom Player */}
        <PlayerCard 
          color={playerColor} 
          isCurrentTurn={currentTurn === playerColor}
        />
        
        {/* Captured Pieces */}
        <Card className="overflow-hidden">
          <CardContent className="p-2 sm:p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Captured:</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(capturedPieces.white, 5) }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-gray-800" />
                  ))}
                  {capturedPieces.white > 5 && (
                    <span className="text-xs text-muted-foreground">+{capturedPieces.white - 5}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(capturedPieces.black, 5) }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-gray-200 border border-gray-400" />
                  ))}
                  {capturedPieces.black > 5 && (
                    <span className="text-xs text-muted-foreground">+{capturedPieces.black - 5}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Move History */}
        {(showMoves || moveHistory.length > 0) && (
          <div className={cn(
            "sm:block",
            showMoves ? "block" : "hidden"
          )}>
            <MoveHistory />
          </div>
        )}
      </div>
      
      {/* Floating Chat */}
      <FloatingChat />
      
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sound Settings</DialogTitle>
            <DialogDescription>
              Adjust volume levels for sounds and music
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Sound Effects</Label>
                <span className="text-sm text-muted-foreground">{sfxVolume}%</span>
              </div>
              <Slider
                value={[sfxVolume]}
                onValueChange={([v]) => setSfxVolume(v)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Background Music</Label>
                <span className="text-sm text-muted-foreground">{musicVolume}%</span>
              </div>
              <Slider
                value={[musicVolume]}
                onValueChange={([v]) => setMusicVolume(v)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                🎵 Background music is generated programmatically.
                <br />You can replace it with your own music file later.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Game Over Dialog */}
      <Dialog open={gameOver.over}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {gameOver.winner === 'draw' ? (
                <>
                  <Handshake className="h-6 w-6 text-yellow-500" />
                  Draw!
                </>
              ) : gameOver.winner === playerColor ? (
                <>
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  You Win!
                </>
              ) : (
                <>
                  <Frown className="h-6 w-6 text-red-500" />
                  You Lost
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {getResultMessage()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button className="flex-1 gap-1" onClick={handleNewGame}>
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
            <Button variant="outline" className="flex-1 gap-1" onClick={() => setMode('lobby')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Lobby
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add missing import
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
