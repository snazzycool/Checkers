'use client';

import { useGameStore } from '@/store/gameStore';
import { GameLobby } from '@/components/game/Lobby';
import { GamePlay } from '@/components/game/GamePlay';
import { Leaderboard } from '@/components/game/Leaderboard';

export default function Home() {
  const { mode, setMode } = useGameStore();
  
  return (
    <main className="min-h-screen pb-16 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto py-2 sm:py-4">
        {mode === 'lobby' ? (
          <GameLobby />
        ) : mode === 'leaderboard' ? (
          <Leaderboard />
        ) : (
          <GamePlay />
        )}
      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-2 sm:py-3 text-center text-xs sm:text-sm text-muted-foreground bg-background/90 backdrop-blur-sm border-t z-40">
        <p>
          🎮 International Draughts • 10x10 Checkers • 
          <span className="ml-1 sm:ml-2">Free & Open Source</span>
        </p>
      </footer>
    </main>
  );
}
