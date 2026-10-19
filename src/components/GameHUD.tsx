/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HudState } from '../game/engine.ts';
import { Volume2, VolumeX, Pause, Sparkles, Shield, Zap, Heart } from 'lucide-react';

interface GameHUDProps {
  hud: HudState;
  onToggleMute: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ hud, onToggleMute, onPause }) => {
  return (
    <header className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-5 select-none" aria-label="Game HUD">
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Left Status: Lives & Active Powers */}
        <div className="flex flex-col gap-2">
          {/* Hearts / Lives */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg pointer-events-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-transform duration-200 ${
                  i < hud.lives
                    ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                    : 'text-slate-600 fill-slate-800 scale-90 opacity-60'
                }`}
              />
            ))}
            <span className="text-xs font-bold font-pixel text-slate-300 ml-1.5 tabular-nums">
              x{hud.lives}
            </span>
          </div>

          {/* Active Power Indicators */}
          <div className="flex flex-col gap-1.5 items-start">
            {hud.hasShield && (
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/60 px-2.5 py-1 rounded-lg text-amber-300 text-xs font-bold tracking-wide shadow-md animate-pulse">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>ESCUDO MÁGICO</span>
              </div>
            )}

            {hud.hasCrystal && (
              <div className="flex items-center gap-1.5 bg-cyan-500/20 border border-cyan-400/60 px-2.5 py-1 rounded-lg text-cyan-300 text-xs font-bold tracking-wide shadow-md">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>CRISTAL: {Math.ceil(hud.crystalTimer)}s</span>
              </div>
            )}

            {hud.hasBoots && (
              <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/60 px-2.5 py-1 rounded-lg text-emerald-300 text-xs font-bold tracking-wide shadow-md">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>VELOZ: {Math.ceil(hud.bootsTimer)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Boss Health Bar (When in Boss Battle) */}
        {hud.bossHp !== null && hud.bossMaxHp !== null && (
          <div className="flex flex-col items-center max-w-xs sm:max-w-md w-full mx-2 sm:mx-6 bg-slate-950/85 border border-red-900/60 p-2 sm:p-3 rounded-xl shadow-2xl pointer-events-auto animate-fade-in">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-extrabold text-red-400 uppercase tracking-widest font-game">
                {hud.bossName}
              </span>
              <span className="text-xs font-pixel text-amber-400 tabular-nums">
                {hud.bossHp} / {hud.bossMaxHp} HP
              </span>
            </div>
            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-red-700/50 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 via-red-500 to-amber-400 transition-all duration-300 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                style={{ width: `${Math.max(0, (hud.bossHp / hud.bossMaxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Right Status: Level Name, Coins, Score, & Controls */}
        <div className="flex flex-col items-end gap-2">
          {/* Level Badge & Score Cluster */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg pointer-events-auto">
            {/* Coins */}
            <div className="flex items-center gap-1 text-amber-400 font-bold text-xs sm:text-sm font-pixel">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 border border-amber-200 flex items-center justify-center text-[9px] sm:text-[10px] text-slate-900 font-extrabold">
                $
              </div>
              <span className="tabular-nums">{hud.coins}</span>
            </div>

            <div className="w-px h-3.5 sm:h-4 bg-slate-700" />

            {/* Score */}
            <div className="flex items-center gap-1 text-slate-200 font-bold text-[10px] sm:text-xs font-pixel">
              <span className="text-slate-400 text-[9px] sm:text-[10px]">PTS</span>
              <span className="tabular-nums text-emerald-400">{hud.score.toString().padStart(5, '0')}</span>
            </div>

            <div className="w-px h-3.5 sm:h-4 bg-slate-700" />

            {/* Utility Buttons: Mute & Pause */}
            <button
              onClick={onToggleMute}
              className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={hud.isMuted ? 'Ativar Som (M)' : 'Silenciar Som (M)'}
              aria-label={hud.isMuted ? 'Ativar Som' : 'Silenciar Som'}
            >
              {hud.isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onPause}
              className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Pausar Jogo (Esc)"
              aria-label="Pausar Jogo"
            >
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Level Subtitle tag (hidden on very small screens to keep HUD clean) */}
          <div className="hidden sm:block bg-slate-900/60 border border-slate-800 text-[11px] font-semibold text-slate-400 px-2.5 py-0.5 rounded-md">
            {hud.levelTitle} — {hud.levelSubtitle}
          </div>
        </div>
      </div>
    </header>
  );
};
