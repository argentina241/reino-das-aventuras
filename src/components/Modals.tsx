/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameSaveData } from '../game/types.ts';
import { Play, RotateCcw, Home, Sparkles, Shield, Zap, Heart, Trophy, Award, HelpCircle, X, ChevronRight, Lock } from 'lucide-react';

// ----------------------------------------------------
// TITLE SCREEN
// ----------------------------------------------------
interface TitleScreenProps {
  onStartGame: () => void;
  onContinueGame: () => void;
  onOpenLevelSelect: () => void;
  saveData: GameSaveData;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onContinueGame,
  onOpenLevelSelect,
  saveData,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const canContinue = saveData.unlockedLevel > 1 || saveData.highScore > 0;

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-between p-6 sm:p-10 select-none bg-gradient-to-b from-slate-950/60 via-slate-900/40 to-slate-950/80">
      {/* Top Header / Badges */}
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-pixel text-amber-300 shadow-md">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>RECORDE: {saveData.highScore} PTS</span>
        </div>

        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer shadow-md"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Como Jogar</span>
        </button>
      </div>

      {/* Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* Title Logo SVG */}
        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300">
          <svg className="w-72 sm:w-96 md:w-[480px] h-auto drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]" viewBox="0 0 500 130">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="60%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            {/* Crown / Star crest */}
            <path
              d="M 235,10 L 250,2 L 265,10 L 258,24 L 242,24 Z"
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth="2"
            />
            {/* Upper text */}
            <text
              x="250"
              y="58"
              textAnchor="middle"
              className="font-game"
              fill="url(#cyanGrad)"
              stroke="#0f172a"
              strokeWidth="6"
              paintOrder="stroke fill"
              fontSize="34"
              fontWeight="900"
              letterSpacing="6"
            >
              REINO DAS
            </text>
            {/* Main title */}
            <text
              x="250"
              y="115"
              textAnchor="middle"
              className="font-game"
              fill="url(#goldGrad)"
              stroke="#451a03"
              strokeWidth="8"
              paintOrder="stroke fill"
              fontSize="52"
              fontWeight="900"
              letterSpacing="4"
            >
              AVENTURAS
            </text>
          </svg>
        </div>

        <p className="text-sm sm:text-base text-sky-200 font-semibold tracking-wide drop-shadow-md max-w-md">
          A Jornada dos Cristais Estelares e a Fortaleza Vulcânica
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full max-w-sm">
          <button
            data-start="true"
            onClick={onStartGame}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-extrabold text-lg font-game py-3.5 px-8 rounded-xl shadow-xl shadow-green-950/60 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-emerald-300"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>JOGAR</span>
          </button>

          {canContinue && (
            <button
              onClick={onContinueGame}
              className="w-full flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 font-extrabold text-base font-game py-3.5 px-6 rounded-xl shadow-lg border border-amber-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>CONTINUAR (FASE {saveData.unlockedLevel})</span>
            </button>
          )}

          <button
            onClick={onOpenLevelSelect}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm py-3 px-5 rounded-xl border border-slate-700 hover:border-slate-500 transition-all cursor-pointer"
          >
            <span>FASES</span>
          </button>
        </div>
      </div>

      {/* Flat Non-Interactive Control Hint */}
      <footer className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide bg-slate-950/60 border border-slate-800/80 px-4 py-1.5 rounded-full" aria-label="Game controls">
        WASD ou ◀ ▶ Mover · Espaço Pular · X Poder · Esc Pausa
      </footer>

      {/* Help Modal */}
      {showHelp && <HowToPlayModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

// ----------------------------------------------------
// LEVEL SELECT MODAL
// ----------------------------------------------------
interface LevelSelectModalProps {
  unlockedLevel: number;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  unlockedLevel,
  onSelectLevel,
  onClose,
}) => {
  const levels = [
    {
      id: 1,
      title: 'Fase 1',
      name: 'Pradaria Encantada',
      desc: 'Colinas verdejantes, blocos misteriosos e criaturas da floresta.',
      color: 'from-emerald-900/80 to-green-950/90 border-emerald-500/40',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 2,
      title: 'Fase 2',
      name: 'Caverna dos Cristais',
      desc: 'Cavernas profundas com espinhos, plataformas móveis e morcegos.',
      color: 'from-purple-900/80 to-slate-950/90 border-purple-500/40',
      badgeColor: 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 3,
      title: 'Fase 3',
      name: 'Fortaleza Vulcânica',
      desc: 'Lava ardente, armadilhas e o temível Guardião Ignis no final!',
      color: 'from-red-900/80 to-stone-950/90 border-red-500/40',
      badgeColor: 'bg-red-500/20 text-red-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold font-game text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Selecionar Fase</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {levels.map((lvl) => {
            const isUnlocked = lvl.id <= unlockedLevel;
            return (
              <div
                key={lvl.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all bg-gradient-to-r ${lvl.color} ${
                  isUnlocked ? 'opacity-100' : 'opacity-50 grayscale'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-pixel px-2 py-0.5 rounded ${lvl.badgeColor}`}>
                      {lvl.title}
                    </span>
                    <h3 className="font-bold text-slate-100 font-game">{lvl.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm">{lvl.desc}</p>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => onSelectLevel(lvl.id)}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>JOGAR</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <Lock className="w-4 h-4" />
                    <span>Bloqueada</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// PAUSE MODAL
// ----------------------------------------------------
interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
  score: number;
  coins: number;
  levelTitle: string;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onReturnTitle,
  score,
  coins,
  levelTitle,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-5">
        <h2 className="text-2xl font-extrabold font-game text-amber-400 tracking-wider">
          JOGO PAUSADO
        </h2>

        <div className="flex justify-around w-full bg-slate-950/60 border border-slate-800 py-3 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Moedas</span>
            <span className="text-lg font-pixel text-amber-400 tabular-nums">{coins}</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Pontuação</span>
            <span className="text-lg font-pixel text-emerald-400 tabular-nums">{score}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onResume}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base font-game rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            Continuar Jogo
          </button>
          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm font-game rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Reiniciar Fase
          </button>
          <button
            onClick={onReturnTitle}
            className="w-full py-2.5 bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Menu Principal
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// GAME OVER MODAL
// ----------------------------------------------------
interface GameOverModalProps {
  score: number;
  coins: number;
  levelTitle: string;
  onTryAgain: () => void;
  onReturnTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  coins,
  levelTitle,
  onTryAgain,
  onReturnTitle,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border-2 border-red-700/80 w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500/60 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          <Heart className="w-8 h-8 fill-red-500/40" />
        </div>

        <div>
          <h2 className="text-2xl font-black font-game text-red-500 tracking-wider">
            FIM DE JOGO
          </h2>
          <p className="text-xs text-slate-400 mt-1">Não desista! O reino ainda precisa de você.</p>
        </div>

        <div className="flex justify-around w-full bg-slate-950/80 border border-slate-800 py-3 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Fase</span>
            <span className="text-sm font-bold text-slate-200">{levelTitle}</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Pontuação</span>
            <span className="text-base font-pixel text-emerald-400 tabular-nums">{score}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            data-start="true"
            onClick={onTryAgain}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-extrabold text-base font-game rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer border border-emerald-300"
          >
            Tentar Novamente
          </button>
          <button
            onClick={onReturnTitle}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Menu Principal
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// VICTORY MODAL (End of Game Triumph)
// ----------------------------------------------------
interface VictoryModalProps {
  score: number;
  coins: number;
  onPlayAgain: () => void;
  onResetProgress: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  coins,
  onPlayAgain,
  onResetProgress,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border-2 border-amber-400 w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-6">
        {/* Crown Trophy icon */}
        <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-bounce">
          <Trophy className="w-10 h-10 fill-amber-400/30" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-game text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-wider">
            REINO SALVO!
          </h2>
          <p className="text-sm text-sky-200 mt-2 font-medium">
            Você derrotou o Guardião Ignis e restaurou a paz no Reino das Aventuras!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Pontos Finais</span>
            <span className="text-xl font-pixel text-emerald-400 mt-1 tabular-nums">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Moedas Coletadas</span>
            <span className="text-xl font-pixel text-amber-400 mt-1 tabular-nums">{coins}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            data-start="true"
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg font-game rounded-xl shadow-xl shadow-amber-950/60 transition-transform active:scale-95 cursor-pointer border-2 border-amber-200"
          >
            Jogar Novamente
          </button>
          <button
            onClick={onResetProgress}
            className="w-full py-2 text-xs text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer"
          >
            Apagar Progresso Salvo
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// HOW TO PLAY MODAL
// ----------------------------------------------------
export const HowToPlayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold font-game text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            <span>Instruções & Poderes</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-xs sm:text-sm text-slate-300">
          <div>
            <h3 className="font-bold text-amber-300 mb-1 font-game">Controles</h3>
            <p className="text-slate-400 leading-relaxed">
              • <strong>Teclado:</strong> Setas ou A/D para mover, Espaço para pular, X ou K para disparar projétil estelar, Esc para pausar.<br />
              • <strong>Celular / Toque:</strong> Botões direcionais na esquerda e botões de Pulo e Poder na direita.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-amber-300 mb-2 font-game">Poderes Especiais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-950/60 border border-cyan-500/30 p-2.5 rounded-lg flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-cyan-300">Cristal de Energia</h4>
                  <p className="text-[11px] text-slate-400">Permite disparar projéteis de estelares contra inimigos e chefões.</p>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-amber-500/30 p-2.5 rounded-lg flex items-start gap-2">
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300">Escudo Mágico</h4>
                  <p className="text-[11px] text-slate-400">Protege você contra um golpe mortal de inimigo ou armadilha.</p>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-emerald-500/30 p-2.5 rounded-lg flex items-start gap-2">
                <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300">Bota Veloz</h4>
                  <p className="text-[11px] text-slate-400">Aumenta temporariamente sua velocidade e altura de pulo.</p>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-rose-500/30 p-2.5 rounded-lg flex items-start gap-2">
                <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-300">Coração Sagrado</h4>
                  <p className="text-[11px] text-slate-400">Recupera uma vida extra (limite máximo de 5 corações).</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-amber-300 mb-1 font-game">Dicas de Sobrevivência</h3>
            <p className="text-slate-400 leading-relaxed">
              Pule sobre a cabeça dos inimigos para derrotá-los! Atinja blocos misteriosos por baixo para coletar moedas e poderes. Passe pela bandeira de checkpoint para salvar sua posição na fase.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm rounded-xl transition-colors cursor-pointer mt-2"
        >
          Entendi, vamos jogar!
        </button>
      </div>
    </div>
  );
};
