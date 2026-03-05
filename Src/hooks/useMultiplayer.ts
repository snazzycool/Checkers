'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';

// Types
interface GameStartedEvent {
  gameId: string;
  whitePlayer: { id: string; name: string; rating: number };
  blackPlayer: { id: string; name: string; rating: number };
  boardState: string;
  currentTurn: 'white' | 'black';
  timeControl: number;
}

interface MoveMadeEvent {
  from: { row: number; col: number };
  to: { row: number; col: number };
  captures: Array<{ row: number; col: number }>;
  currentTurn: 'white' | 'black';
  moveNumber: number;
}

interface GameEndedEvent {
  winner: 'white' | 'black' | 'draw';
  reason?: string;
  resignedBy?: string;
  disconnectedPlayer?: string;
  moves?: any[];
}

interface ChatMessageEvent {
  sender: string;
  content: string;
  time: Date;
}

// Backend API URL (port 3001)
const API_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'http://localhost:3000';

// WebSocket server port (3003)
const WS_PORT = 3003;

export function useMultiplayer() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const {
    playerName,
    playerStats,
    selectedTimeControl,
    setMode,
    setIsOnline,
    setIsFindingMatch,
    setCurrentGameId,
    setOpponent,
    setPlayerColor,
    setTimeControl,
    resetGame,
    currentGameId,
    playerColor,
    board,
    currentTurn,
    gameOver,
    addChatMessage,
    setPlayerStats
  } = useGameStore();

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    // Use the gateway's XTransformPort parameter
    const socket = io('/?XTransformPort=' + WS_PORT, {
      path: '/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('✅ Connected to game server');
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      setIsOnline(true);
      
      // Register user
      socket.emit('register', {
        name: playerName,
        rating: playerStats.rating
      });
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
      setIsConnected(false);
      setIsOnline(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError('Failed to connect to game server');
      setIsConnecting(false);
    });
    
    // Matchmaking events
    socket.on('waiting-for-opponent', () => {
      console.log('⏳ Waiting for opponent...');
      setIsFindingMatch(true);
    });
    
    socket.on('game-started', (data: GameStartedEvent) => {
      console.log('🎮 Game started!', data);
      
      setIsFindingMatch(false);
      setCurrentGameId(data.gameId);
      setTimeControl(data.timeControl);
      
      // Determine player's color
      const myColor = data.whitePlayer.name === playerName ? 'white' : 'black';
      setPlayerColor(myColor);
      
      // Set opponent info
      const opponent = myColor === 'white' ? data.blackPlayer : data.whitePlayer;
      setOpponent({
        id: opponent.id,
        name: opponent.name,
        rating: opponent.rating
      });
      
      // Reset and start game
      resetGame();
      setMode('playing');
    });
    
    // Move events
    socket.on('move-made', (data: MoveMadeEvent) => {
      console.log('♟️ Move made:', data);
      // The opponent made a move - the board will be synced via update-board
    });
    
    socket.on('board-sync', (data: { boardState: string; currentTurn: 'white' | 'black' }) => {
      console.log('🔄 Board sync:', data);
      // Sync board state from server
    });
    
    // Chat events
    socket.on('chat-message', (data: ChatMessageEvent) => {
      console.log('💬 Chat:', data);
      addChatMessage(data.sender, data.content);
    });
    
    // Game end events
    socket.on('game-ended', (data: GameEndedEvent) => {
      console.log('🏆 Game ended:', data);
      
      // Update stats based on result
      const myColor = playerColor;
      const won = data.winner === myColor;
      const draw = data.winner === 'draw';
      
      // Update local stats
      const currentStats = playerStats;
      setPlayerStats({
        gamesPlayed: currentStats.gamesPlayed + 1,
        gamesWon: currentStats.gamesWon + (won ? 1 : 0),
        gamesLost: currentStats.gamesLost + (!won && !draw ? 1 : 0),
        rating: Math.max(100, currentStats.rating + (won ? 15 : draw ? 0 : -10))
      });
    });
    
    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      setConnectionError(error.message);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [playerName, playerStats.rating, setIsOnline, setIsFindingMatch, setCurrentGameId, setOpponent, setPlayerColor, setTimeControl, resetGame, setMode, addChatMessage, playerColor, playerStats, setPlayerStats]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsOnline(false);
    }
  }, [setIsOnline]);

  // Find a game
  const findGame = useCallback(() => {
    if (!socketRef.current?.connected) {
      connect();
      // Wait for connection then find game
      setTimeout(() => {
        socketRef.current?.emit('find-game', {
          name: playerName,
          rating: playerStats.rating,
          timeControl: selectedTimeControl
        });
      }, 500);
    } else {
      socketRef.current.emit('find-game', {
        name: playerName,
        rating: playerStats.rating,
        timeControl: selectedTimeControl
      });
    }
  }, [playerName, playerStats.rating, selectedTimeControl, connect]);

  // Cancel matchmaking
  const cancelFind = useCallback(() => {
    socketRef.current?.emit('cancel-find');
    setIsFindingMatch(false);
  }, [setIsFindingMatch]);

  // Send a move
  const sendMove = useCallback((from: { row: number; col: number }, to: { row: number; col: number }, captures: Array<{ row: number; col: number }>) => {
    if (!socketRef.current || !currentGameId) return;
    
    socketRef.current.emit('move', {
      gameId: currentGameId,
      from,
      to,
      captures
    });
    
    // Also send board state for sync
    socketRef.current.emit('update-board', {
      gameId: currentGameId,
      boardState: JSON.stringify(board),
      currentTurn
    });
  }, [currentGameId, board, currentTurn]);

  // Send chat message
  const sendChat = useCallback((message: string) => {
    if (!socketRef.current || !currentGameId) return;
    
    socketRef.current.emit('chat-message', {
      gameId: currentGameId,
      message
    });
    
    // Add to local chat
    addChatMessage(playerName, message);
  }, [currentGameId, addChatMessage, playerName]);

  // Resign
  const resign = useCallback(() => {
    if (!socketRef.current || !currentGameId) return;
    
    socketRef.current.emit('resign', {
      gameId: currentGameId
    });
  }, [currentGameId]);

  // Report game over
  const reportGameOver = useCallback((winner: 'white' | 'black' | 'draw') => {
    if (!socketRef.current || !currentGameId) return;
    
    socketRef.current.emit('game-over', {
      gameId: currentGameId,
      winner
    });
  }, [currentGameId]);

  // Auto-connect on mount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    
    // Actions
    connect,
    disconnect,
    findGame,
    cancelFind,
    sendMove,
    sendChat,
    resign,
    reportGameOver,
  };
}
