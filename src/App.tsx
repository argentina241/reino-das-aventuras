/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, HudState } from './game/engine.ts';
import { GameState, GameSaveData } from './game/types.ts';
import { GameHUD } from './components/GameHUD.tsx';
import { MobileControls } from './components/MobileControls.tsx';
import {
  TitleScreen,
  LevelSelectModal,
  PauseModal,
  GameOverModal,
  VictoryModal,
} from './components/Modals.tsx';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('title');
  const [saveData, setSaveData] = useState<GameSaveData>({
    unlockedLevel: 1,
    highScore: 0,
    totalCoins: 0,
    soundMuted: false,
  });
  const [hudState, setHudState] = useState<HudState>({
    lives: 3,
    score: 0,
    coins: 0,
    hasShield: false,
    hasCrystal: false,
    crystalTimer: 0,
    hasBoots: false,
    bootsTimer: 0,
    levelTitle: 'Fase 1',
    levelSubtitle: 'Pradaria Encantada',
    isMuted: false,
    bossHp: null,
    bossMaxHp: null,
    bossName: null,
  });

  const [showLevelSelect, setShowLevelSelect] = useState(false);

  // Initialize game engine once
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(
      canvasRef.current,
      (state) => {
        setGameState(state);
      },
      (hud) => {
        setHudState(hud);
      },
      (save) => {
        setSaveData({ ...save });
      }
    );

    engineRef.current = engine;
    engine.startLoop();

    // Check for ?autostart=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      engine.startLevel(1);
    }

    return () => {
      engine.stopLoop();
    };
  }, []);

  // Handlers
  const handleStartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startLevel(1);
    }
  }, []);

  const handleContinueGame = useCallback(() => {
    if (engineRef.current) {
      const targetLevel = engineRef.current.saveData.unlockedLevel || 1;
      engineRef.current.startLevel(targetLevel);
    }
  }, []);

  const handleSelectLevel = useCallback((levelId: number) => {
    setShowLevelSelect(false);
    if (engineRef.current) {
      engineRef.current.startLevel(levelId);
    }
  }, []);

  const handleResumeGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setState('playing');
    }
  }, []);

  const handleRestartLevel = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.restartCurrentLevel();
    }
  }, []);

  const handleReturnToTitle = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setState('title');
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.toggleMute();
    }
  }, []);

  const handlePause = useCallback(() => {
    if (engineRef.current && gameState === 'playing') {
      engineRef.current.setState('paused');
    }
  }, [gameState]);

  const handleResetProgress = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resetProgress();
      engineRef.current.setState('title');
    }
  }, []);

  // Mobile virtual inputs
  const handleLeftPress = useCallback(() => {
    if (engineRef.current) engineRef.current.keys.left = true;
  }, []);

  const handleLeftRelease = useCallback(() => {
    if (engineRef.current) engineRef.current.keys.left = false;
  }, []);

  const handleRightPress = useCallback(() => {
    if (engineRef.current) engineRef.current.keys.right = true;
  }, []);

  const handleRightRelease = useCallback(() => {
    if (engineRef.current) engineRef.current.keys.right = false;
  }, []);

  const handleJumpPress = useCallback(() => {
    if (engineRef.current) engineRef.current.triggerJumpPress();
  }, []);

  const handleJumpRelease = useCallback(() => {
    if (engineRef.current) engineRef.current.triggerJumpRelease();
  }, []);

  const handleAttackPress = useCallback(() => {
    if (engineRef.current) engineRef.current.triggerAttackPress();
  }, []);

  const handleAttackRelease = useCallback(() => {
    if (engineRef.current) engineRef.current.triggerAttackRelease();
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-game select-none" aria-label="Game Screen">
      {/* 1. Isolated Canvas Surface */}
      <div className="absolute inset-0 z-0">
        <canvas
          ref={canvasRef}
          data-testid="game-canvas"
          className="w-full h-full block touch-none"
        />
      </div>

      {/* 2. In-Game HUD (Visible during active gameplay) */}
      {gameState === 'playing' && (
        <GameHUD
          hud={hudState}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
        />
      )}

      {/* 3. On-Screen Touch Controls (Active when playing) */}
      {gameState === 'playing' && (
        <MobileControls
          onLeftPress={handleLeftPress}
          onLeftRelease={handleLeftRelease}
          onRightPress={handleRightPress}
          onRightRelease={handleRightRelease}
          onJumpPress={handleJumpPress}
          onJumpRelease={handleJumpRelease}
          onAttackPress={handleAttackPress}
          onAttackRelease={handleAttackRelease}
          hasPower={hudState.hasCrystal}
        />
      )}

      {/* 4. Game Shell Modals */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onContinueGame={handleContinueGame}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          saveData={saveData}
        />
      )}

      {showLevelSelect && (
        <LevelSelectModal
          unlockedLevel={saveData.unlockedLevel}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResumeGame}
          onRestart={handleRestartLevel}
          onReturnTitle={handleReturnToTitle}
          score={hudState.score}
          coins={hudState.coins}
          levelTitle={hudState.levelTitle}
        />
      )}

      {gameState === 'gameover' && (
        <GameOverModal
          score={hudState.score}
          coins={hudState.coins}
          levelTitle={hudState.levelTitle}
          onTryAgain={handleRestartLevel}
          onReturnTitle={handleReturnToTitle}
        />
      )}

      {gameState === 'victory' && (
        <VictoryModal
          score={hudState.score}
          coins={hudState.coins}
          onPlayAgain={handleStartGame}
          onResetProgress={handleResetProgress}
        />
      )}
    </main>
  );
}
