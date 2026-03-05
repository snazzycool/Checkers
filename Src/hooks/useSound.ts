'use client';

import { useEffect, useCallback, useRef } from 'react';
import { soundManager } from '@/lib/sounds';

export function useSound() {
  const initialized = useRef(false);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!initialized.current) {
        // Touch the audio context to initialize it
        try {
          soundManager.playClick();
        } catch (e) {
          // Audio context might not be ready
        }
        initialized.current = true;
      }
    };

    // Add listener for first interaction
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  const playClick = useCallback(() => soundManager.playClick(), []);
  const playMove = useCallback(() => soundManager.playMove(), []);
  const playCapture = useCallback(() => soundManager.playCapture(), []);
  const playMultiCapture = useCallback(() => soundManager.playMultiCapture(), []);
  const playKing = useCallback(() => soundManager.playKing(), []);
  const playVictory = useCallback(() => soundManager.playVictory(), []);
  const playDefeat = useCallback(() => soundManager.playDefeat(), []);
  const playGameStart = useCallback(() => soundManager.playGameStart(), []);
  const playSelect = useCallback(() => soundManager.playSelect(), []);
  const playError = useCallback(() => soundManager.playError(), []);
  const playTick = useCallback(() => soundManager.playTick(), []);
  const playLowTime = useCallback(() => soundManager.playLowTime(), []);
  const startBackgroundMusic = useCallback(() => soundManager.startBackgroundMusic(), []);
  const stopBackgroundMusic = useCallback(() => soundManager.stopBackgroundMusic(), []);
  const toggleMute = useCallback(() => soundManager.toggleMute(), []);
  const setMusicEnabled = useCallback((enabled: boolean) => soundManager.setMusicEnabled(enabled), []);
  const getMuteState = useCallback(() => soundManager.getMuteState(), []);
  const getMusicEnabled = useCallback(() => soundManager.getMusicEnabled(), []);
  const setMusicVolume = useCallback((v: number) => soundManager.setMusicVolume(v), []);
  const setSfxVolume = useCallback((v: number) => soundManager.setSfxVolume(v), []);

  return {
    playClick,
    playMove,
    playCapture,
    playMultiCapture,
    playKing,
    playVictory,
    playDefeat,
    playGameStart,
    playSelect,
    playError,
    playTick,
    playLowTime,
    startBackgroundMusic,
    stopBackgroundMusic,
    toggleMute,
    setMusicEnabled,
    getMuteState,
    getMusicEnabled,
    setMusicVolume,
    setSfxVolume
  };
}
