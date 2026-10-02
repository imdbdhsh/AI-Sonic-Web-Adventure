import React, { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

export interface VirtualJoystickState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  special: boolean;
}

interface VirtualControlsOverlayProps {
  onChange: (state: VirtualJoystickState) => void;
  onJumpJustPressed?: () => void;
  onTurnTrigger?: (dir: -1 | 1) => void;
  onSpecialTrigger?: () => void;
  showSuperButton?: boolean;
  superLabel?: string;
}

export const VirtualControlsOverlay: React.FC<VirtualControlsOverlayProps> = ({
  onChange,
  onJumpJustPressed,
  onTurnTrigger,
  onSpecialTrigger,
  showSuperButton = false,
  superLabel = 'SUPER',
}) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const stateRef = useRef<VirtualJoystickState>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    special: false,
  });

  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingStick, setIsDraggingStick] = useState(false);
  const [isJumpPressed, setIsJumpPressed] = useState(false);

  const emitState = (partial: Partial<VirtualJoystickState>) => {
    const prev = stateRef.current;
    const next: VirtualJoystickState = { ...prev, ...partial };
    if (onTurnTrigger) {
      if (next.left && !prev.left) onTurnTrigger(-1);
      if (next.right && !prev.right) onTurnTrigger(1);
    }
    stateRef.current = next;
    onChange(next);
  };

  const updateStickFromPointer = (clientX: number, clientY: number) => {
    const baseEl = baseRef.current;
    if (!baseEl) return;
    const rect = baseEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;
    const dist = Math.hypot(rawDx, rawDy);
    const maxRadius = 38;

    const clampedX = dist > maxRadius ? (rawDx / dist) * maxRadius : rawDx;
    const clampedY = dist > maxRadius ? (rawDy / dist) * maxRadius : rawDy;

    setKnobOffset({ x: clampedX, y: clampedY });

    const deadzoneX = 11;
    const deadzoneY = 13;
    emitState({
      left: rawDx < -deadzoneX,
      right: rawDx > deadzoneX,
      up: rawDy < -deadzoneY,
      down: rawDy > deadzoneY,
    });
  };

  const resetStick = () => {
    activePointerIdRef.current = null;
    setIsDraggingStick(false);
    setKnobOffset({ x: 0, y: 0 });
    emitState({
      left: false,
      right: false,
      up: false,
      down: false,
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none touch-none">
      {/* Bottom-Left IN-SCREEN Virtual Analog Joystick */}
      <div
        ref={baseRef}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activePointerIdRef.current = e.pointerId;
          setIsDraggingStick(true);
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // Ignore pointer capture errors
          }
          updateStickFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (activePointerIdRef.current !== e.pointerId) return;
          e.preventDefault();
          updateStickFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (activePointerIdRef.current !== e.pointerId) return;
          e.preventDefault();
          resetStick();
        }}
        onPointerCancel={(e) => {
          if (activePointerIdRef.current !== e.pointerId) return;
          resetStick();
        }}
        className="pointer-events-auto absolute bottom-5 left-5 w-28 h-28 rounded-full bg-slate-950/55 border-2 border-slate-400/45 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing backdrop-blur-[2px]"
        title="Drag Virtual Joystick to Move, Crouch, or Aim"
      >
        {/* Crosshair guide rings inside joystick well */}
        <div className="w-16 h-16 rounded-full border border-slate-500/30 pointer-events-none" />
        <div className="absolute top-2 text-[9px] font-mono font-bold text-slate-400/70 pointer-events-none">
          ▲
        </div>
        <div className="absolute bottom-2 text-[9px] font-mono font-bold text-slate-400/70 pointer-events-none">
          ▼
        </div>
        <div className="absolute left-2.5 text-[9px] font-mono font-bold text-slate-400/70 pointer-events-none">
          ◀
        </div>
        <div className="absolute right-2.5 text-[9px] font-mono font-bold text-slate-400/70 pointer-events-none">
          ▶
        </div>

        {/* Draggable Thumbstick Knob */}
        <div
          style={{
            transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
          }}
          className={`w-12 h-12 rounded-full border-2 shadow-xl flex items-center justify-center pointer-events-none transition-colors ${
            isDraggingStick
              ? 'bg-blue-500/90 border-white text-white'
              : 'bg-blue-600/75 border-blue-200/80 text-blue-100'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Bottom-Right IN-SCREEN Jump Button (& Optional Super/Hyper Button) */}
      <div className="pointer-events-auto absolute bottom-5 right-5 flex items-end gap-3.5">
        {showSuperButton && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              emitState({ special: true });
              if (onSpecialTrigger) onSpecialTrigger();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              emitState({ special: false });
            }}
            onPointerCancel={() => {
              emitState({ special: false });
            }}
            className="w-14 h-14 rounded-full bg-amber-500/80 active:bg-amber-400 border-2 border-amber-200 shadow-xl flex flex-col items-center justify-center text-slate-950 font-extrabold text-[10px] cursor-pointer backdrop-blur-[2px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{superLabel}</span>
          </button>
        )}

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsJumpPressed(true);
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // Ignore
            }
            emitState({ jump: true });
            if (onJumpJustPressed) onJumpJustPressed();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            setIsJumpPressed(false);
            emitState({ jump: false });
          }}
          onPointerCancel={() => {
            setIsJumpPressed(false);
            emitState({ jump: false });
          }}
          className={`w-22 h-22 rounded-full border-2 shadow-2xl flex flex-col items-center justify-center text-white font-extrabold cursor-pointer backdrop-blur-[2px] transition-transform ${
            isJumpPressed
              ? 'scale-95 bg-blue-500/95 border-white'
              : 'bg-blue-600/80 border-blue-200/85 hover:bg-blue-500/85'
          }`}
        >
          <span className="text-sm tracking-wide">JUMP</span>
          <span className="text-[9px] font-mono text-blue-100/90">ACTION</span>
        </button>
      </div>
    </div>
  );
};
