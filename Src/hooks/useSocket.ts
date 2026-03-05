'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';

// WebSocket server port
const GAME_SERVICE_PORT = 3003;

interface GameStartedData {
  gameId: string;
  whitePlayer: { id: string; name: string; rating: number };
  blackPlayer: { id: string; name: string; rating: number };
  boardState: string;
  currentTurn: 'white' | 'black';
  timeControl: number;
}

interface MoveData {
  from: { row: number; col: number };
  to: { row: number; col: number };
  captures: Array<{ row: number; col: number }>;
  currentTurn: 'white' | 'black';
  moveNumber: number;
}

interface ChatMessageData {
  sender: string;
  content: string;
  time: Date;
}

interface GameEndedData {
  winner: 'white' | 'black' | 'draw';
  reason?: string;
  moves?: any[];
  resignedBy?: string;
  disconnectedPlayer?: string;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<{ name: string; rating: number } | null>(null);
  
  const {
    playerName,
    playerStats,
    selectedTimeControl,
    setMode,
    setPlayerColor,
    setTimeControl,
    resetGame,
    board,
    currentTurn,
    selectedPiece,
    validMoves,
    makeMove,
    selectPiece,
    addChatMessage,
    gameOver,
    mode
  } = useGameStore();
  
  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    
    const socket = io('/?XTransformPort=' + GAME_SERVICE_PORT, {
      path: '/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('🔌 Connected to game server');
      setIsConnected(true);
      
      // Register user
      socket.emit('register', {
        name: playerName || 'Player',
        rating: playerStats?.rating || 1500
      });
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from game server');
      setIsConnected(false);
      setIsFindingMatch(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });
    
    // Match found
    socket.on('waiting-for-opponent', () => {
      console.log('⏳ Waiting for opponent...');
      setIsFindingMatch(true);
    });
    
    // Game started
    socket.on('game-started', (data: GameStartedData) => {
      console.log('🎮 Game started:', data);
      setIsFindingMatch(false);
      setCurrentGameId(data.gameId);
      
      // Determine player color
      const myColor = data.whitePlayer.name === playerName ? 'white' : 'black';
      const opponentData = myColor === 'white' ? data.blackPlayer : data.whitePlayer;
      
      setPlayerColor(myColor);
      setOpponent({ name: opponentData.name, rating: opponentData.rating });
      setTimeControl(data.timeControl);
      resetGame();
      setMode('playing');
      
      // Add welcome message
      addChatMessage('System', `Game started! You are playing as ${myColor} against ${opponentData.name} (${opponentData.rating})`);
    });
    
    // Move received from opponent
    socket.on('move-made', (data: MoveData) => {
      console.log('♟️ Opponent move received:', data);
      
      // The opponent made a move - we need to apply it to our board
      // The game store already handles this when we receive the move
      // We just need to update our local state
      if (selectedPiece) {
        selectPiece(null);
      }
      
      // We need to apply the opponent's move
      // The board update comes from the opponent's update-board event
    });
    
    // Board state update
    socket.on('board-update', (data: { boardState: string; currentTurn: 'white' | 'black' }) => {
      // This is a full board sync
      console.log('🔄 Board update received');
    });
    
    // Chat message received
    socket.on('chat-message', (data: ChatMessageData) => {
      console.log('💬 Chat message:', data);
      addChatMessage(data.sender, data.content);
    });
    
    // Game ended
    socket.on('game-ended', (data: GameEndedData) => {
      console.log('🏆 Game ended:', data);
      setCurrentGameId(null);
      
      let reason = '';
      if (data.reason === 'resignation') {
        reason = `${data.resignedBy} resigned`;
      } else if (data.reason === 'disconnect') {
        reason = `${data.disconnectedPlayer} disconnected`;
      } else if (data.reason === 'timeout') {
        reason = 'Time out';
      }
      
      addChatMessage('System', `Game over! ${data.winner === 'draw' ? 'Draw' : data.winner + ' wins'}.${reason ? ' ' + reason : ''}`);
    });
    
    // Error handling
    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      setIsFindingMatch(false);
    });
    
    return socket;
  }, [playerName, playerStats, setMode, setPlayerColor, setTimeControl, resetGame, addChatMessage, selectPiece, selectedPiece]);
  
  // Disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setCurrentGameId(null);
      setOpponent(null);
    }
  }, []);
  
  // Find a game
  const findGame = useCallback((timeControl?: number) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      console.error('Socket not connected');
      return;
    }
    
    const tc = timeControl || selectedTimeControl;
    console.log('🔍 Finding game with time control:', tc);
    
    socket.emit('find-game', {
      name: playerName || 'Player',
      rating: playerStats?.rating || 1500,
      timeControl: tc
    });
    
    setIsFindingMatch(true);
  }, [playerName, playerStats, selectedTimeControl]);
  
  // Cancel finding game
  const cancelFind = useCallback(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit('cancel-find');
      setIsFindingMatch(false);
    }
  }, []);
  
  // Send a move
  const sendMove = useCallback((from: { row: number; col: number }, to: { row: number; col: number }, captures: Array<{ row: number; col: number }>) => {
    const socket = socketRef.current;
    if (!socket || !currentGameId) {
      console.error('Cannot send move: not in a game');
      return;
    }
    
    socket.emit('move', {
      gameId: currentGameId,
      from,
      to,
      captures
    });
    
    // Also send board update for sync
    socket.emit('update-board', {
      gameId: currentGameId,
      boardState: JSON.stringify(board),
      currentTurn
    });
  }, [currentGameId, board, currentTurn]);
  
  // Send chat message
  const sendChat = useCallback((message: string) => {
    const socket = socketRef.current;
    if (!socket) {
      console.error('Socket not connected');
      return;
    }
    
    socket.emit('chat-message', {
      gameId: currentGameId,
      message
    });
  }, [currentGameId]);
  
  // Resign game
  const resign = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !currentGameId) {
      console.error('Cannot resign: not in a game');
      return;
    }
    
    socket.emit('resign', { gameId: currentGameId });
    setCurrentGameId(null);
    setOpponent(null);
  }, [currentGameId]);
  
  // Auto-connect on mount if in playing mode
  useEffect(() => {
    if (mode === 'playing' && !socketRef.current) {
      connect();
    }
    
    return () => {
      // Don't disconnect on unmount, let the component handle it
    };
  }, [mode, connect]);
  
  return {
    isConnected,
    isFindingMatch,
    currentGameId,
    opponent,
    connect,
    disconnect,
    findGame,
    cancelFind,
    sendMove,
    sendChat,
    resign
  };
}
