/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, Sparkles } from 'lucide-react';

interface MobileControlsProps {
  onLeftPress: () => void;
  onLeftRelease: () => void;
  onRightPress: () => void;
  onRightRelease: () => void;
  onJumpPress: () => void;
  onJumpRelease: () => void;
  onAttackPress: () => void;
  onAttackRelease: () => void;
  hasPower: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeftPress,
  onLeftRelease,
  onRightPress,
  onRightRelease,
  onJumpPress,
  onJumpRelease,
  onAttackPress,
  onAttackRelease,
  hasPower,
}) => {
  return (
    <div className="fixed inset-x-0 bottom-0 pointer-events-none z-20 flex justify-between items-end p-4 sm:p-6 select-none touch-none pb-6 sm:pb-8">
      {/* Directional Pad (Left & Right) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Left Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onLeftPress();
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
            onLeftRelease();
          }}
          onPointerCancel={onLeftRelease}
          className="w-16 h-16 rounded-full bg-slate-900/80 border-2 border-slate-600/80 active:bg-blue-600 active:border-blue-400 active:scale-95 flex items-center justify-center text-slate-100 shadow-xl transition-transform cursor-pointer"
          aria-label="Mover para a Esquerda"
        >
          <ChevronLeft className="w-9 h-9" />
        </button>

        {/* Right Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onRightPress();
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
            onRightRelease();
          }}
          onPointerCancel={onRightRelease}
          className="w-16 h-16 rounded-full bg-slate-900/80 border-2 border-slate-600/80 active:bg-blue-600 active:border-blue-400 active:scale-95 flex items-center justify-center text-slate-100 shadow-xl transition-transform cursor-pointer"
          aria-label="Mover para a Direita"
        >
          <ChevronRight className="w-9 h-9" />
        </button>
      </div>

      {/* Action Buttons (Attack / Power & Jump) */}
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* Special Power Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onAttackPress();
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
            onAttackRelease();
          }}
          onPointerCancel={onAttackRelease}
          className={`w-16 h-16 rounded-full border-2 active:scale-95 flex flex-col items-center justify-center shadow-xl transition-all cursor-pointer ${
            hasPower
              ? 'bg-cyan-600/90 border-cyan-300 text-white animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.6)]'
              : 'bg-slate-900/80 border-slate-600 text-slate-400'
          }`}
          aria-label="Usar Poder Especial"
        >
          <Sparkles className="w-6 h-6" />
          <span className="text-[10px] font-bold font-pixel mt-0.5">PODER</span>
        </button>

        {/* Jump Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onJumpPress();
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
            onJumpRelease();
          }}
          onPointerCancel={onJumpRelease}
          className="w-18 h-18 rounded-full bg-emerald-600/90 border-2 border-emerald-300 active:bg-emerald-500 active:scale-95 flex flex-col items-center justify-center text-white shadow-2xl shadow-emerald-950/60 transition-transform cursor-pointer"
          aria-label="Pular"
        >
          <ArrowUp className="w-8 h-8 stroke-[3]" />
          <span className="text-[10px] font-bold font-pixel">PULO</span>
        </button>
      </div>
    </div>
  );
};
