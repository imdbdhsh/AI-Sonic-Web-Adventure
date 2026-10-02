import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Award,
  Edit3,
  Gamepad2,
  Play,
  Smartphone,
  Sparkles,
  Undo2,
} from 'lucide-react';
import { soundFX } from '../audio/soundEngine';
import {
  CHAOS_EMERALD_INFO,
  CHARACTER_SPECS,
  SUPER_EMERALD_INFO,
} from '../data/presets';
import {
  CharacterId,
  SpecialStageData,
  SpecialStageType,
  SpecialTileType,
} from '../types/engine';
import { VirtualControlsOverlay } from './VirtualControlsOverlay';

interface SpecialStageStudioProps {
  specialStages: SpecialStageData[];
  activeStageNumber: number; // 1 to 7
  specialStageType: SpecialStageType;
  chaosEmeralds: boolean[]; // length 7
  superEmeralds: boolean[]; // length 7
  activeCharacter: CharacterId;
  noCheatsMode?: boolean;
  onSelectStageNumber: (n: number) => void;
  onChangeStageType: (t: SpecialStageType) => void;
  onUpdateSpecialStage: (updated: SpecialStageData) => void;
  onEarnEmerald: (stageIndex: number) => void;
  onToggleAllEmeralds: () => void;
  onReturnToZone: () => void;
}

const S1_TILE_SIZE = 28;

const S1_PALETTE: Array<{ type: SpecialTileType; label: string; color: string }> = [
  { type: SpecialTileType.WALL_BLUE, label: 'Blue Gem Wall', color: '#3B82F6' },
  { type: SpecialTileType.WALL_YELLOW, label: 'Yellow Gem Wall', color: '#FACC15' },
  { type: SpecialTileType.WALL_PINK, label: 'Pink Gem Wall', color: '#EC4899' },
  { type: SpecialTileType.GEM_BREAKABLE, label: 'Breakable Crystal', color: '#38BDF8' },
  { type: SpecialTileType.BUMPER, label: 'Pinball Bumper', color: '#EF4444' },
  { type: SpecialTileType.GOAL_EXIT, label: 'GOAL Exit Hazard', color: '#F97316' },
  { type: SpecialTileType.REVERSE_ROT, label: 'Reverse Rotation (R)', color: '#10B981' },
  { type: SpecialTileType.SPEED_UP, label: 'Rotation Speed Up', color: '#A855F7' },
  { type: SpecialTileType.RING, label: 'Golden Ring', color: '#FDE047' },
  { type: SpecialTileType.CHAOS_EMERALD, label: 'Chaos / Super Emerald', color: '#22C55E' },
  { type: SpecialTileType.PLAYER_START, label: 'Player Spawn', color: '#60A5FA' },
  { type: SpecialTileType.EMPTY, label: 'Eraser (Empty)', color: '#1E293B' },
];

const S3_PALETTE: Array<{ type: SpecialTileType; label: string; color: string }> = [
  { type: SpecialTileType.BLUE_SPHERE, label: 'Blue Sphere (Target)', color: '#2563EB' },
  { type: SpecialTileType.RED_SPHERE, label: 'Red Sphere (Hazard)', color: '#DC2626' },
  { type: SpecialTileType.BUMPER_SPHERE, label: 'Star Bumper Sphere', color: '#E2E8F0' },
  { type: SpecialTileType.YELLOW_SPRING_SPHERE, label: 'Yellow Spring Sphere', color: '#FACC15' },
  { type: SpecialTileType.RING, label: 'Golden Ring', color: '#FDE047' },
  { type: SpecialTileType.PLAYER_START, label: 'Player Spawn', color: '#38BDF8' },
  { type: SpecialTileType.EMPTY, label: 'Eraser (Empty)', color: '#1E293B' },
];

export const SpecialStageStudio: React.FC<SpecialStageStudioProps> = ({
  specialStages,
  activeStageNumber,
  specialStageType,
  chaosEmeralds,
  superEmeralds,
  activeCharacter,
  noCheatsMode = false,
  onSelectStageNumber,
  onChangeStageType,
  onUpdateSpecialStage,
  onEarnEmerald,
  onToggleAllEmeralds,
  onReturnToZone,
}) => {
  const stageData =
    specialStages.find((s) => s.stageNumber === activeStageNumber) ||
    specialStages[0];

  const allChaosCollected = chaosEmeralds.every(Boolean);
  const allSuperCollected = superEmeralds.every(Boolean);
  const activeEmeraldInfo = allChaosCollected
    ? SUPER_EMERALD_INFO[stageData.stageNumber - 1]
    : CHAOS_EMERALD_INFO[stageData.stageNumber - 1];

  const [mode, setMode] = useState<'play' | 'edit'>('play');
  const [showTouchControls, setShowTouchControls] = useState<boolean>(true);
  const [selectedBrush, setSelectedBrush] = useState<SpecialTileType>(
    SpecialTileType.WALL_BLUE
  );
  const [runKey, setRunKey] = useState(0);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'playing' | 'won' | 'failed';
    message: string;
    rings: number;
    blueRemaining: number;
  }>({
    type: 'playing',
    message: `Collect the ${activeEmeraldInfo.name}!`,
    rings: 0,
    blueRemaining: 0,
  });

  const playCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const touchInputRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
  });
  const jumpJustPressedRef = useRef<boolean>(false);
  const turnQueueRef = useRef<-1 | 0 | 1>(0);
  const prevPadRef = useRef<{
    jump: boolean;
    left: boolean;
    right: boolean;
  }>({ jump: false, left: false, right: false });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code
        )
      ) {
        e.preventDefault();
      }
      if (!keysRef.current.has(e.code)) {
        if (e.code === 'Space' || e.code === 'KeyJ' || e.code === 'KeyZ') {
          jumpJustPressedRef.current = true;
        }
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
          turnQueueRef.current = -1;
        } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
          turnQueueRef.current = 1;
        }
      }
      keysRef.current.add(e.code);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Automatically teleport back to the player's newest checkpoint when Special Stage ends!
  useEffect(() => {
    if (statusBanner.type === 'playing') return;
    const timer = window.setTimeout(() => {
      onReturnToZone();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [statusBanner.type, onReturnToZone]);

  const resetForStageChange = useCallback(() => {
    setRunKey((k) => k + 1);
  }, []);

  // Poll Gamepad 1 or any connected controller inside the 60FPS Special Stage loop
  const pollSpecialGamepad = () => {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads[0] || pads[1] || pads[2] || pads[3] || null;
    if (!pad) {
      prevPadRef.current = { jump: false, left: false, right: false };
      return { left: false, right: false, up: false, down: false };
    }

    const left = Boolean(pad.axes[0] < -0.38 || pad.buttons[14]?.pressed);
    const right = Boolean(pad.axes[0] > 0.38 || pad.buttons[15]?.pressed);
    const up = Boolean(pad.axes[1] < -0.38 || pad.buttons[12]?.pressed);
    const down = Boolean(pad.axes[1] > 0.38 || pad.buttons[13]?.pressed);
    const jump = Boolean(
      pad.buttons[0]?.pressed ||
        pad.buttons[1]?.pressed ||
        pad.buttons[2]?.pressed
    );

    if (jump && !prevPadRef.current.jump) {
      jumpJustPressedRef.current = true;
    }
    if (left && !prevPadRef.current.left) {
      turnQueueRef.current = -1;
    }
    if (right && !prevPadRef.current.right) {
      turnQueueRef.current = 1;
    }

    prevPadRef.current = { jump, left, right };
    return { left, right, up, down };
  };

  // Main 60FPS Loop for Sonic 1 OR Sonic 3 Special Stage
  useEffect(() => {
    if (mode !== 'play') return;

    let animId = 0;
    let tick = 0;
    const spec = CHARACTER_SPECS[activeCharacter];

    if (specialStageType === 'sonic1') {
      // --- SONIC 1 ROTATING 360 MAZE ENGINE (NO AIR JUMP BUG!) ---
      const grid = stageData.s1Grid.map((r) => [...r]);
      const rows = stageData.s1Height;
      const cols = stageData.s1Width;

      let startX = 2.5 * S1_TILE_SIZE;
      let startY = 2.5 * S1_TILE_SIZE;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] === SpecialTileType.PLAYER_START) {
            startX = (c + 0.5) * S1_TILE_SIZE;
            startY = (r + 0.5) * S1_TILE_SIZE;
          }
        }
      }

      let px = startX;
      let py = startY;
      let vx = 0;
      let vy = 0;
      let mazeAngle = 0;
      let rotDir = 1;
      let rotSpeed = 0.011;
      let rings = 0;
      let groundCoyoteTimer = 0; // Strictly prevents mid-air jumping!
      let finished: 'playing' | 'won' | 'failed' = 'playing';

      setStatusBanner({
        type: 'playing',
        message: `Navigate the Rotating Maze! Break Crystal Gems to grab the ${activeEmeraldInfo.name} — avoid GOAL spheres!`,
        rings: 0,
        blueRemaining: 1,
      });

      const loopS1 = () => {
        tick++;
        const canvas = playCanvasRef.current;
        if (canvas && finished === 'playing') {
          const padState = pollSpecialGamepad();
          mazeAngle += rotSpeed * rotDir;
          if (groundCoyoteTimer > 0) groundCoyoteTimer--;

          // Screen-space gravity always pulls downward on screen -> transform into maze space!
          const gScreenY = 0.22;
          const k = keysRef.current;
          const t = touchInputRef.current;
          let moveScreenX = 0;
          if (
            k.has('KeyA') ||
            k.has('ArrowLeft') ||
            t.left ||
            padState.left
          ) {
            moveScreenX = -0.25;
          }
          if (
            k.has('KeyD') ||
            k.has('ArrowRight') ||
            t.right ||
            padState.right
          ) {
            moveScreenX = 0.25;
          }

          // Only allow jump when grounded on a maze wall/floor (NO AIR JUMP!)
          if (jumpJustPressedRef.current) {
            jumpJustPressedRef.current = false;
            if (groundCoyoteTimer > 0) {
              groundCoyoteTimer = 0;
              // Jump Impulse upward in screen space
              vx += Math.sin(mazeAngle) * -6.2;
              vy += Math.cos(mazeAngle) * -6.2;
              soundFX.playJump();
            }
          }

          // Convert screen-space forces into maze-local coordinates
          const cosA = Math.cos(mazeAngle);
          const sinA = Math.sin(mazeAngle);
          const ax = moveScreenX * cosA + gScreenY * sinA;
          const ay = -moveScreenX * sinA + gScreenY * cosA;

          vx = (vx + ax) * 0.985;
          vy = (vy + ay) * 0.985;
          const spd = Math.hypot(vx, vy);
          if (spd > 6.5) {
            vx = (vx / spd) * 6.5;
            vy = (vy / spd) * 6.5;
          }

          // Step X & Y in maze coordinates
          px += vx;
          py += vy;

          // Screen-space downward gravity direction in maze coordinates
          const gravDirX = sinA;
          const gravDirY = cosA;

          const rad = 9;
          const minC = Math.max(0, Math.floor((px - rad) / S1_TILE_SIZE));
          const maxC = Math.min(cols - 1, Math.floor((px + rad) / S1_TILE_SIZE));
          const minR = Math.max(0, Math.floor((py - rad) / S1_TILE_SIZE));
          const maxR = Math.min(rows - 1, Math.floor((py + rad) / S1_TILE_SIZE));

          for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              const tile = grid[r][c] as SpecialTileType;
              if (
                tile === SpecialTileType.EMPTY ||
                tile === SpecialTileType.PLAYER_START
              )
                continue;

              const cx = (c + 0.5) * S1_TILE_SIZE;
              const cy = (r + 0.5) * S1_TILE_SIZE;
              const dx = px - cx;
              const dy = py - cy;

              if (tile === SpecialTileType.RING) {
                grid[r][c] = SpecialTileType.EMPTY;
                rings++;
                soundFX.playRing();
                setStatusBanner((prev) => ({ ...prev, rings }));
              } else if (tile === SpecialTileType.CHAOS_EMERALD) {
                grid[r][c] = SpecialTileType.EMPTY;
                finished = 'won';
                soundFX.playGoalPost();
                onEarnEmerald(stageData.stageNumber - 1);
                setStatusBanner({
                  type: 'won',
                  message: `GOT AN EMERALD! You earned the ${activeEmeraldInfo.name}! Teleporting to Checkpoint...`,
                  rings,
                  blueRemaining: 0,
                });
              } else if (tile === SpecialTileType.GOAL_EXIT) {
                finished = 'failed';
                soundFX.playSpring(false);
                setStatusBanner({
                  type: 'failed',
                  message: 'Touched a GOAL Sphere — Teleporting back to Checkpoint!',
                  rings,
                  blueRemaining: 1,
                });
              } else if (tile === SpecialTileType.REVERSE_ROT) {
                rotDir *= -1;
                vx = -vx * 1.1;
                vy = -vy * 1.1;
                px += Math.sign(dx || 1) * 4;
                py += Math.sign(dy || 1) * 4;
                soundFX.playSpring(false);
              } else if (tile === SpecialTileType.SPEED_UP) {
                rotSpeed = rotSpeed > 0.015 ? 0.011 : 0.022;
                vx = -vx * 1.1;
                vy = -vy * 1.1;
                soundFX.playSpring(true);
              } else if (tile === SpecialTileType.BUMPER) {
                const dist = Math.max(1, Math.hypot(dx, dy));
                vx = (dx / dist) * 5.8;
                vy = (dy / dist) * 5.8;
                px = cx + (dx / dist) * (S1_TILE_SIZE * 0.75);
                py = cy + (dy / dist) * (S1_TILE_SIZE * 0.75);
                soundFX.playSpring(true);
              } else if (
                tile === SpecialTileType.WALL_BLUE ||
                tile === SpecialTileType.WALL_YELLOW ||
                tile === SpecialTileType.WALL_PINK ||
                tile === SpecialTileType.GEM_BREAKABLE
              ) {
                if (tile === SpecialTileType.GEM_BREAKABLE) {
                  grid[r][c] = SpecialTileType.EMPTY;
                  soundFX.playPop();
                }
                let nx = 0;
                let ny = 0;
                if (Math.abs(dx) > Math.abs(dy)) {
                  nx = Math.sign(dx || 1);
                  px = cx + nx * (S1_TILE_SIZE * 0.5 + rad);
                  vx = -vx * 0.65;
                } else {
                  ny = Math.sign(dy || 1);
                  py = cy + ny * (S1_TILE_SIZE * 0.5 + rad);
                  vy = -vy * 0.65;
                }
                // Check if this surface supports the player against screen-space gravity
                const dotWithUp = -(nx * gravDirX + ny * gravDirY);
                if (dotWithUp > 0.25) {
                  groundCoyoteTimer = 10;
                }
              }
            }
          }
        }

        // Render Sonic 1 Rotating Maze
        const canvas2 = playCanvasRef.current;
        if (canvas2) {
          const ctx = canvas2.getContext('2d');
          if (ctx) {
            const w = canvas2.width;
            const h = canvas2.height;

            const hueShift = (tick * 0.8) % 360;
            ctx.fillStyle = `hsl(${hueShift}, 55%, 14%)`;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = `hsla(${(hueShift + 60) % 360}, 70%, 50%, 0.16)`;
            ctx.lineWidth = 2;
            for (let gx = (tick % 48) - 48; gx < w + 48; gx += 48) {
              for (let gy = (tick % 48) - 48; gy < h + 48; gy += 48) {
                ctx.strokeRect(gx, gy, 24, 24);
              }
            }

            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(mazeAngle);
            ctx.translate(-px, -py);

            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const t = grid[r][c] as SpecialTileType;
                if (t === SpecialTileType.EMPTY || t === SpecialTileType.PLAYER_START)
                  continue;
                const wx = c * S1_TILE_SIZE;
                const wy = r * S1_TILE_SIZE;

                if (
                  t === SpecialTileType.WALL_BLUE ||
                  t === SpecialTileType.WALL_YELLOW ||
                  t === SpecialTileType.WALL_PINK
                ) {
                  ctx.fillStyle =
                    t === SpecialTileType.WALL_BLUE
                      ? '#2563EB'
                      : t === SpecialTileType.WALL_YELLOW
                      ? '#EAB308'
                      : '#DB2777';
                  ctx.fillRect(wx + 1, wy + 1, S1_TILE_SIZE - 2, S1_TILE_SIZE - 2);
                  ctx.strokeStyle = '#FFFFFF';
                  ctx.lineWidth = 1.5;
                  ctx.strokeRect(wx + 3, wy + 3, S1_TILE_SIZE - 6, S1_TILE_SIZE - 6);
                } else if (t === SpecialTileType.GEM_BREAKABLE) {
                  ctx.fillStyle = tick % 10 < 5 ? '#38BDF8' : '#A855F7';
                  ctx.beginPath();
                  ctx.arc(wx + 14, wy + 14, 11, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.strokeStyle = '#FFFFFF';
                  ctx.stroke();
                } else if (t === SpecialTileType.BUMPER) {
                  ctx.fillStyle = '#EF4444';
                  ctx.beginPath();
                  ctx.arc(wx + 14, wy + 14, 12, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.strokeStyle = '#FACC15';
                  ctx.lineWidth = 3;
                  ctx.stroke();
                } else if (t === SpecialTileType.GOAL_EXIT) {
                  ctx.fillStyle = '#EA580C';
                  ctx.beginPath();
                  ctx.arc(wx + 14, wy + 14, 13, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.fillStyle = '#FFFFFF';
                  ctx.font = 'bold 7px "JetBrains Mono", monospace';
                  ctx.fillText('GOAL', wx + 4, wy + 17);
                } else if (t === SpecialTileType.REVERSE_ROT) {
                  ctx.fillStyle = '#10B981';
                  ctx.beginPath();
                  ctx.arc(wx + 14, wy + 14, 11, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.fillStyle = '#FFFFFF';
                  ctx.font = 'bold 10px "JetBrains Mono", monospace';
                  ctx.fillText('R', wx + 10, wy + 18);
                } else if (t === SpecialTileType.SPEED_UP) {
                  ctx.fillStyle = '#A855F7';
                  ctx.beginPath();
                  ctx.arc(wx + 14, wy + 14, 11, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.fillStyle = '#FFFFFF';
                  ctx.font = 'bold 8px "JetBrains Mono", monospace';
                  ctx.fillText('UP', wx + 8, wy + 17);
                } else if (t === SpecialTileType.RING) {
                  ctx.strokeStyle = '#FACC15';
                  ctx.lineWidth = 3;
                  ctx.beginPath();
                  ctx.arc(wx + 14, wy + 14, 7, 0, Math.PI * 2);
                  ctx.stroke();
                } else if (t === SpecialTileType.CHAOS_EMERALD) {
                  ctx.fillStyle = activeEmeraldInfo.color;
                  ctx.beginPath();
                  ctx.moveTo(wx + 14, wy + 2);
                  ctx.lineTo(wx + 26, wy + 12);
                  ctx.lineTo(wx + 14, wy + 26);
                  ctx.lineTo(wx + 2, wy + 12);
                  ctx.closePath();
                  ctx.fill();
                  ctx.strokeStyle = '#FFFFFF';
                  ctx.lineWidth = 2;
                  ctx.stroke();
                }
              }
            }
            ctx.restore();

            // Draw Spinning Player Ball in Center of Viewport
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(tick * 0.35);
            ctx.fillStyle = spec.primaryColor;
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = spec.secondaryColor;
            ctx.beginPath();
            ctx.arc(3, -3, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        animId = requestAnimationFrame(loopS1);
      };

      animId = requestAnimationFrame(loopS1);
      return () => cancelAnimationFrame(animId);
    } else {
      // --- SONIC 3 & KNUCKLES "GET BLUE SPHERES!" 3D SPHERICAL PLANET ENGINE ---
      const size = stageData.s3Size;
      const grid = stageData.s3Grid.map((r) => [...r]);

      let startC = 8;
      let startR = 13;
      let totalBlue = 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] === SpecialTileType.PLAYER_START) {
            startC = c;
            startR = r;
          } else if (grid[r][c] === SpecialTileType.BLUE_SPHERE) {
            totalBlue++;
          }
        }
      }

      let gx = startC;
      let gy = startR;
      // Directions: 0 = North (dy = -1), 1 = East (dx = 1), 2 = South (dy = 1), 3 = West (dx = -1)
      let dir = 0;
      let subProgress = 0; // 0.0 to 1.0 between grid intersections
      let moveGear = 1; // 1 = forward, -1 = reverse bumper bounce
      let zHeight = 0;
      let vz = 0;
      let rings = 0;
      let blueRemaining = totalBlue;
      let visualTurnLean = 0;
      let finished: 'playing' | 'won' | 'failed' = 'playing';

      setStatusBanner({
        type: 'playing',
        message: `GET BLUE SPHERES ON THE 3D PLANET! Turn Left/Right and Jump over Red Spheres!`,
        rings: 0,
        blueRemaining,
      });

      const wrap = (v: number) => ((v % size) + size) % size;

      const loopS3 = () => {
        tick++;
        const canvas = playCanvasRef.current;
        if (canvas && finished === 'playing') {
          const padState = pollSpecialGamepad();
          if (
            (padState.up ||
              keysRef.current.has('KeyW') ||
              keysRef.current.has('ArrowUp') ||
              touchInputRef.current.up) &&
            moveGear === -1
          ) {
            moveGear = 1;
          }

          // Smooth visual lean when turning left/right
          const targetLean =
            turnQueueRef.current !== 0
              ? turnQueueRef.current * 0.22
              : keysRef.current.has('KeyA') ||
                keysRef.current.has('ArrowLeft') ||
                touchInputRef.current.left ||
                padState.left
              ? -0.15
              : keysRef.current.has('KeyD') ||
                keysRef.current.has('ArrowRight') ||
                touchInputRef.current.right ||
                padState.right
              ? 0.15
              : 0;
          visualTurnLean += (targetLean - visualTurnLean) * 0.25;

          // Jump physics (Strictly grounded check zHeight === 0)
          if (jumpJustPressedRef.current && zHeight === 0) {
            jumpJustPressedRef.current = false;
            vz = 4.6;
            soundFX.playJump();
          } else {
            jumpJustPressedRef.current = false;
          }

          if (zHeight > 0 || vz > 0) {
            zHeight += vz;
            vz -= 0.34;
            if (zHeight <= 0) {
              zHeight = 0;
              vz = 0;
            }
          }

          const stepSpeed = 0.055;
          subProgress += stepSpeed * moveGear;

          if (subProgress >= 1 || subProgress < 0) {
            const stepSign = subProgress >= 1 ? 1 : -1;
            subProgress = subProgress >= 1 ? subProgress - 1 : subProgress + 1;
            if (moveGear === -1) moveGear = 1;

            const dxs = [0, 1, 0, -1];
            const dys = [-1, 0, 1, 0];
            gx = wrap(gx + dxs[dir] * stepSign);
            gy = wrap(gy + dys[dir] * stepSign);

            // Apply queued 90-degree turn at grid intersection!
            if (turnQueueRef.current !== 0) {
              dir = (dir + turnQueueRef.current + 4) % 4;
              turnQueueRef.current = 0;
            }

            // Check Sphere at current grid intersection (if on ground!)
            const cell = grid[gy][gx] as SpecialTileType;
            if (zHeight < 6) {
              if (cell === SpecialTileType.BLUE_SPHERE) {
                grid[gy][gx] = SpecialTileType.RED_SPHERE;
                blueRemaining = Math.max(0, blueRemaining - 1);
                soundFX.playRing();
                setStatusBanner((prev) => ({ ...prev, blueRemaining }));

                if (blueRemaining === 0) {
                  // Spawn Chaos/Super Emerald 2 steps ahead on the planet!
                  const ex = wrap(gx + dxs[dir] * 2);
                  const ey = wrap(gy + dys[dir] * 2);
                  grid[ey][ex] = SpecialTileType.CHAOS_EMERALD;
                  soundFX.playCheckpoint();
                }
              } else if (cell === SpecialTileType.RING) {
                grid[gy][gx] = SpecialTileType.EMPTY;
                rings++;
                soundFX.playRing();
                setStatusBanner((prev) => ({ ...prev, rings }));
              } else if (cell === SpecialTileType.CHAOS_EMERALD) {
                grid[gy][gx] = SpecialTileType.EMPTY;
                finished = 'won';
                soundFX.playGoalPost();
                onEarnEmerald(stageData.stageNumber - 1);
                setStatusBanner({
                  type: 'won',
                  message: `PERFECT! You earned the ${activeEmeraldInfo.name}! Teleporting to Checkpoint...`,
                  rings,
                  blueRemaining: 0,
                });
              } else if (cell === SpecialTileType.BUMPER_SPHERE) {
                moveGear = -1;
                soundFX.playSpring(false);
              } else if (cell === SpecialTileType.YELLOW_SPRING_SPHERE) {
                vz = 7.4;
                zHeight = 2;
                soundFX.playSpring(true);
              } else if (cell === SpecialTileType.RED_SPHERE) {
                finished = 'failed';
                soundFX.playRingLoss();
                setStatusBanner({
                  type: 'failed',
                  message: 'Stepped on a Red Sphere — Teleporting back to Checkpoint!',
                  rings,
                  blueRemaining,
                });
              }
            }
          }

          // Render 3D Spherical Planet Checkerboard & Spheres
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const w = canvas.width;
            const h = canvas.height;

            // 1. Deep Space Starry Nebula Sky
            const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, '#030612');
            skyGrad.addColorStop(0.55, '#0F172A');
            skyGrad.addColorStop(1, '#020617');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, h);

            for (let s = 0; s < 36; s++) {
              const sx = ((s * 137 + dir * 180) % w + w) % w;
              const sy = (s * 43) % Math.floor(h * 0.65);
              ctx.fillStyle = (s + Math.floor(tick / 12)) % 3 === 0 ? '#FACC15' : '#E2E8F0';
              ctx.fillRect(sx, sy, 2, 2);
            }

            // 2. 3D Spherical Planet Projection Helper
            const projectPlanetPoint = (
              lat: number,
              relZ: number,
              heightOffset: number = 0
            ) => {
              const angleZ = (relZ - 0.15) * 0.17;
              const angleX = lat * 0.17;
              const r = 1 + heightOffset * 0.0028;

              const x3d = r * Math.sin(angleX) * Math.cos(angleZ);
              const y3d = r * Math.cos(angleX) * Math.cos(angleZ);
              const z3d = r * Math.sin(angleZ);

              const tilt = 0.56;
              const cy = y3d * Math.cos(tilt) - z3d * Math.sin(tilt);
              const cz = y3d * Math.sin(tilt) + z3d * Math.cos(tilt);

              const camDist = 2.35;
              const persp = 1 / Math.max(0.4, camDist - cz * 0.85);
              const sx = w / 2 + x3d * 760 * persp;
              const sy = h * 0.94 - (cy - 0.42) * 640 * persp;
              const scale = persp * 1.52;
              return { sx, sy, scale, cy, cz };
            };

            // 3. Unique Planetary Theme per Stage (1 to 7)
            const STAGE_PLANET_THEMES = [
              { core: '#064E3B', rim: '#38BDF8', lightR: 226, lightG: 242, lightB: 238, darkR: 16, darkG: 135, darkB: 78 },
              { core: '#1E1B4B', rim: '#60A5FA', lightR: 245, lightG: 230, lightB: 175, darkR: 37, darkG: 70, darkB: 185 },
              { core: '#451A03', rim: '#FACC15', lightR: 254, lightG: 240, lightB: 195, darkR: 180, darkG: 75, darkB: 28 },
              { core: '#3B0764', rim: '#E879F9', lightR: 243, lightG: 222, lightB: 255, darkR: 118, darkG: 38, darkB: 165 },
              { core: '#083344', rim: '#22D3EE', lightR: 230, lightG: 248, lightB: 255, darkR: 20, darkG: 115, darkB: 155 },
              { core: '#0F172A', rim: '#2DD4BF', lightR: 204, lightG: 251, lightB: 241, darkR: 15, darkG: 98, darkB: 120 },
              { core: '#450A0A', rim: '#F87171', lightR: 254, lightG: 226, lightB: 226, darkR: 155, darkG: 28, darkB: 48 },
            ];
            const pTheme =
              STAGE_PLANET_THEMES[(stageData.stageNumber - 1) % STAGE_PLANET_THEMES.length];

            ctx.save();
            const planetCenterX = w / 2;
            const planetCenterY = h + 165;
            const planetRadius = 450;

            const atmoGrad = ctx.createRadialGradient(
              planetCenterX,
              planetCenterY,
              planetRadius - 18,
              planetCenterX,
              planetCenterY,
              planetRadius + 28
            );
            atmoGrad.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
            atmoGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.32)');
            atmoGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = atmoGrad;
            ctx.beginPath();
            ctx.arc(planetCenterX, planetCenterY, planetRadius + 28, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(planetCenterX, planetCenterY, planetRadius, 0, Math.PI * 2);
            ctx.fillStyle = pTheme.core;
            ctx.fill();
            ctx.strokeStyle = pTheme.rim;
            ctx.lineWidth = 3;
            ctx.stroke();

            const dxs = [0, 1, 0, -1];
            const dys = [-1, 0, 1, 0];
            const fwdX = dxs[dir];
            const fwdY = dys[dir];
            const rightX = -fwdY;
            const rightY = fwdX;

            // 4. Render Curved Spherical Checkerboard Quads from Horizon (depth = 8) to Foreground (depth = -1)
            for (let depth = 8; depth >= -1; depth--) {
              const relZ0 = depth - subProgress;
              const relZ1 = depth + 1 - subProgress;
              if (relZ1 < -0.6 || relZ0 > 7.8) continue;

              for (let lat = -6; lat <= 6; lat++) {
                const cellX = wrap(gx + fwdX * depth + rightX * lat);
                const cellY = wrap(gy + fwdY * depth + rightY * lat);

                const p00 = projectPlanetPoint(lat - 0.5, relZ0);
                const p10 = projectPlanetPoint(lat + 0.5, relZ0);
                const p11 = projectPlanetPoint(lat + 0.5, relZ1);
                const p01 = projectPlanetPoint(lat - 0.5, relZ1);

                if (p00.cy < 0.04 && p11.cy < 0.04) continue;

                const isLight = (cellX + cellY) % 2 === 0;
                const shade = Math.max(0.35, Math.min(1, p00.cy * 1.25));
                if (isLight) {
                  ctx.fillStyle = `rgb(${Math.round(pTheme.lightR * shade)}, ${Math.round(
                    pTheme.lightG * shade
                  )}, ${Math.round(pTheme.lightB * shade)})`;
                } else {
                  ctx.fillStyle = `rgb(${Math.round(pTheme.darkR * shade)}, ${Math.round(
                    pTheme.darkG * shade
                  )}, ${Math.round(pTheme.darkB * shade)})`;
                }

                ctx.beginPath();
                ctx.moveTo(p00.sx, p00.sy);
                ctx.lineTo(p10.sx, p10.sy);
                ctx.lineTo(p11.sx, p11.sy);
                ctx.lineTo(p01.sx, p01.sy);
                ctx.closePath();
                ctx.fill();
              }
            }

            // 5. Render 3D Spheres & Rings Mounted on the Curved Planet Surface (Back to Front)
            for (let depth = 8; depth >= 0; depth--) {
              const relZ = depth - subProgress;
              if (relZ < -0.3 || relZ > 7.5) continue;

              const latOrder = [-6, 6, -5, 5, -4, 4, -3, 3, -2, 2, -1, 1, 0];
              for (const lat of latOrder) {
                const cellX = wrap(gx + fwdX * depth + rightX * lat);
                const cellY = wrap(gy + fwdY * depth + rightY * lat);
                const tile = grid[cellY][cellX] as SpecialTileType;
                if (
                  tile === SpecialTileType.EMPTY ||
                  tile === SpecialTileType.PLAYER_START
                )
                  continue;

                const pt = projectPlanetPoint(lat, relZ, 18);
                if (pt.cy < 0.08) continue;

                const radius = Math.max(4, 21 * pt.scale);
                const sx = pt.sx;
                const sy = pt.sy;

                ctx.save();
                if (tile === SpecialTileType.CHAOS_EMERALD) {
                  ctx.fillStyle = activeEmeraldInfo.color;
                  ctx.beginPath();
                  ctx.moveTo(sx, sy - radius * 1.25);
                  ctx.lineTo(sx + radius * 1.25, sy);
                  ctx.lineTo(sx, sy + radius * 1.25);
                  ctx.lineTo(sx - radius * 1.25, sy);
                  ctx.closePath();
                  ctx.fill();
                  ctx.strokeStyle = '#FFFFFF';
                  ctx.lineWidth = 2;
                  ctx.stroke();
                } else {
                  ctx.fillStyle =
                    tile === SpecialTileType.BLUE_SPHERE
                      ? '#2563EB'
                      : tile === SpecialTileType.RED_SPHERE
                      ? '#DC2626'
                      : tile === SpecialTileType.YELLOW_SPRING_SPHERE
                      ? '#EAB308'
                      : tile === SpecialTileType.BUMPER_SPHERE
                      ? '#F8FAFC'
                      : '#FACC15';
                  ctx.beginPath();
                  ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                  ctx.fill();

                  ctx.fillStyle = 'rgba(255,255,255,0.6)';
                  ctx.beginPath();
                  ctx.arc(
                    sx - radius * 0.3,
                    sy - radius * 0.3,
                    radius * 0.32,
                    0,
                    Math.PI * 2
                  );
                  ctx.fill();
                }
                ctx.restore();
              }
            }
            ctx.restore();

            // 6. Draw Character from BEHIND Facing Forward Toward the Horizon!
            const playerGroundPt = projectPlanetPoint(0, 0, 0);
            const charY = playerGroundPt.sy - 24 - zHeight * 2.3;
            ctx.save();
            // Ground shadow on the planet
            ctx.fillStyle = 'rgba(0,0,0,0.48)';
            ctx.beginPath();
            ctx.ellipse(
              w / 2,
              playerGroundPt.sy - 2,
              Math.max(10, 20 - zHeight * 0.25),
              6,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();

            ctx.translate(w / 2, charY);
            ctx.rotate(visualTurnLean);

            if (zHeight > 2) {
              // Airborne Forward-Spinning 3D Roll Ball (away from camera!)
              ctx.fillStyle = spec.primaryColor;
              ctx.beginPath();
              ctx.arc(0, 2, 18, 0, Math.PI * 2);
              ctx.fill();
              // Vertical spinning stripes rolling forward over the top
              const stripeOffset = (tick * 3.5) % 18;
              ctx.fillStyle = spec.secondaryColor;
              ctx.fillRect(-13, -12 + stripeOffset, 26, 5);
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(0, 2, 18, 0, Math.PI * 2);
              ctx.stroke();
            } else {
              // Rear-View Running Character Facing Forward Toward the Horizon!
              const stride = Math.sin(tick * 0.48);

              // Pumping Arms on Left & Right Sides (viewed from behind)
              ctx.fillStyle =
                activeCharacter === 'sonic' ? '#FDE68A' : spec.primaryColor;
              ctx.fillRect(-19, -2 - stride * 4, 6, 11);
              ctx.fillRect(13, -2 + stride * 4, 6, 11);
              // White Gloves at forward ends of arms
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.arc(-16, -4 - stride * 5, 5, 0, Math.PI * 2);
              ctx.arc(16, -4 + stride * 5, 5, 0, Math.PI * 2);
              ctx.fill();

              // Rear Torso / Back
              ctx.fillStyle = spec.primaryColor;
              ctx.beginPath();
              ctx.ellipse(0, 4, 11, 10, 0, 0, Math.PI * 2);
              ctx.fill();

              // Back of Head & Iconic Rear Quills / Ears Facing Away from Camera
              if (activeCharacter === 'sonic') {
                // Ears on top-left and top-right of head
                ctx.fillStyle = '#1D4ED8';
                ctx.beginPath();
                ctx.moveTo(-12, -14);
                ctx.lineTo(-8, -24);
                ctx.lineTo(-3, -16);
                ctx.moveTo(12, -14);
                ctx.lineTo(8, -24);
                ctx.lineTo(3, -16);
                ctx.fill();

                // Back of Sonic's Blue Head
                ctx.fillStyle = spec.primaryColor;
                ctx.beginPath();
                ctx.arc(0, -9, 15, 0, Math.PI * 2);
                ctx.fill();

                // 3 Rear Dorsal Quills pointing back/down toward camera!
                ctx.fillStyle = '#1D4ED8';
                ctx.strokeStyle = '#0F172A';
                ctx.lineWidth = 1.5;
                // Left rear quill
                ctx.beginPath();
                ctx.moveTo(-14, -10);
                ctx.lineTo(-21, 3);
                ctx.lineTo(-6, 1);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Right rear quill
                ctx.beginPath();
                ctx.moveTo(14, -10);
                ctx.lineTo(21, 3);
                ctx.lineTo(6, 1);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Center dorsal quill pointing straight back/down
                ctx.beginPath();
                ctx.moveTo(-7, -6);
                ctx.lineTo(0, 9);
                ctx.lineTo(7, -6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              } else if (activeCharacter === 'tails') {
                // Tails' Fox Ears from behind
                ctx.fillStyle = spec.primaryColor;
                ctx.beginPath();
                ctx.moveTo(-13, -13);
                ctx.lineTo(-9, -25);
                ctx.lineTo(-2, -15);
                ctx.moveTo(13, -13);
                ctx.lineTo(9, -25);
                ctx.lineTo(2, -15);
                ctx.fill();
                // Back of Head
                ctx.beginPath();
                ctx.arc(0, -9, 14, 0, Math.PI * 2);
                ctx.fill();
                // Twin Swirling Tails on lower back facing the camera!
                const tailWag = Math.sin(tick * 0.55) * 5;
                ctx.fillStyle = '#F59E0B';
                ctx.beginPath();
                ctx.ellipse(-8, 6 + tailWag * 0.5, 9, 5, -0.3, 0, Math.PI * 2);
                ctx.ellipse(8, 6 - tailWag * 0.5, 9, 5, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(-13, 7 + tailWag * 0.5, 4, 0, Math.PI * 2);
                ctx.arc(13, 7 - tailWag * 0.5, 4, 0, Math.PI * 2);
                ctx.fill();
              } else {
                // Knuckles' Rear Head & Dreadlock Spines hanging down his back
                ctx.fillStyle = spec.primaryColor;
                ctx.beginPath();
                ctx.arc(0, -9, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#B91C1C';
                for (let d = -12; d <= 12; d += 6) {
                  ctx.fillRect(d - 2, -6, 4, 15);
                }
              }

              // Running Shoes Kicking Back Toward the Camera (showing shoe soles when lifted!)
              const leftFootY = 15 + stride * 6;
              const rightFootY = 15 - stride * 6;

              // Left Shoe
              ctx.fillStyle = '#EF4444';
              ctx.fillRect(-13, leftFootY, 10, 8);
              ctx.fillStyle = stride > 0 ? '#94A3B8' : '#FFFFFF'; // Grey sole visible when kicking back toward camera!
              ctx.fillRect(-12, leftFootY + 3, 8, 4);

              // Right Shoe
              ctx.fillStyle = '#EF4444';
              ctx.fillRect(3, rightFootY, 10, 8);
              ctx.fillStyle = stride < 0 ? '#94A3B8' : '#FFFFFF';
              ctx.fillRect(4, rightFootY + 3, 8, 4);
            }
            ctx.restore();
          }
        }
        animId = requestAnimationFrame(loopS3);
      };

      animId = requestAnimationFrame(loopS3);
      return () => cancelAnimationFrame(animId);
    }
  }, [
    mode,
    specialStageType,
    stageData,
    activeCharacter,
    activeEmeraldInfo,
    runKey,
    onEarnEmerald,
  ]);

  const handleEditGridClick = (r: number, c: number) => {
    if (specialStageType === 'sonic1') {
      const nextGrid = stageData.s1Grid.map((row) => [...row]);
      if (selectedBrush === SpecialTileType.PLAYER_START) {
        for (let y = 0; y < stageData.s1Height; y++) {
          for (let x = 0; x < stageData.s1Width; x++) {
            if (nextGrid[y][x] === SpecialTileType.PLAYER_START) {
              nextGrid[y][x] = SpecialTileType.EMPTY;
            }
          }
        }
      }
      nextGrid[r][c] = selectedBrush;
      onUpdateSpecialStage({ ...stageData, s1Grid: nextGrid });
    } else {
      const nextGrid = stageData.s3Grid.map((row) => [...row]);
      if (selectedBrush === SpecialTileType.PLAYER_START) {
        for (let y = 0; y < stageData.s3Size; y++) {
          for (let x = 0; x < stageData.s3Size; x++) {
            if (nextGrid[y][x] === SpecialTileType.PLAYER_START) {
              nextGrid[y][x] = SpecialTileType.EMPTY;
            }
          }
        }
      }
      nextGrid[r][c] = selectedBrush;
      onUpdateSpecialStage({ ...stageData, s3Grid: nextGrid });
    }
  };

  const activePalette = specialStageType === 'sonic1' ? S1_PALETTE : S3_PALETTE;
  const activeEditGrid =
    specialStageType === 'sonic1' ? stageData.s1Grid : stageData.s3Grid;

  return (
    <div className="max-w-[1420px] mx-auto px-6 py-5 space-y-5">
      {/* Top Bar: 7 Chaos Emeralds & 7 Super Emeralds Tracker */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-white">
              {allChaosCollected
                ? 'Hidden Palace: 7 Super Emeralds (Hyper Forms Unlocked!)'
                : 'Special Stages & 7 Chaos Emeralds'}
            </h1>
            <button
              onClick={onReturnToZone}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Return to Checkpoint
            </button>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <Gamepad2 className="w-3.5 h-3.5" />
              Gamepad & In-Screen Joystick Ready
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {allChaosCollected
              ? 'All 7 Chaos Emeralds collected! Complete Special Stages 1–7 to awaken the 7 Super Emeralds and unlock HYPER SONIC, HYPER TAILS, & HYPER KNUCKLES!'
              : 'Collect all 7 Chaos Emeralds to unlock Super Forms and awaken the 7 Super Emeralds for Hyper Sonic!'}
          </p>
        </div>

        {/* Chaos Emeralds & Super Emeralds Visual Row */}
        <div className="flex flex-wrap items-center gap-3 bg-[#0B0F19] px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            {(allChaosCollected ? SUPER_EMERALD_INFO : CHAOS_EMERALD_INFO).map(
              (em, idx) => {
                const collected = allChaosCollected
                  ? superEmeralds[idx]
                  : chaosEmeralds[idx];
                return (
                  <button
                    key={em.number}
                    onClick={() => {
                      if (noCheatsMode) return;
                      onSelectStageNumber(em.number);
                      resetForStageChange();
                    }}
                    className={`w-7 h-7 flex items-center justify-center border transition-transform ${
                      noCheatsMode ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      allChaosCollected ? 'rotate-45 rounded-md' : 'rounded-lg'
                    } ${
                      activeStageNumber === em.number
                        ? 'scale-110 border-white'
                        : 'border-slate-700'
                    }`}
                    style={{
                      backgroundColor: collected ? em.color : '#1E293B',
                      opacity: collected ? 1 : 0.45,
                    }}
                    title={`${em.name} (${collected ? 'Collected' : 'Not Collected'})`}
                  >
                    <span
                      className={`text-[10px] font-mono font-bold text-slate-950 ${
                        allChaosCollected ? '-rotate-45' : ''
                      }`}
                    >
                      {em.number}
                    </span>
                  </button>
                );
              }
            )}
          </div>
          {noCheatsMode ? (
            <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md whitespace-nowrap">
              PLAY GAME MODE • NO CHEATS
            </span>
          ) : (
            <button
              onClick={onToggleAllEmeralds}
              className="px-2.5 py-1 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              {!allChaosCollected
                ? 'Unlock 7 Chaos Emeralds'
                : !allSuperCollected
                ? 'Unlock 7 Super Emeralds (Hyper)'
                : 'Reset All Emeralds'}
            </button>
          )}
        </div>
      </div>

      {/* Stage 1-7 Tabs + Sonic 1 vs Sonic 3 Mode + Play/Edit Switch */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Stage 1..7 Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-slate-800">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              disabled={noCheatsMode}
              onClick={() => {
                if (noCheatsMode) return;
                onSelectStageNumber(num);
                resetForStageChange();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeStageNumber === num
                  ? 'bg-blue-600 text-white'
                  : noCheatsMode
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 hover:text-white cursor-pointer'
              }`}
            >
              Stage {num}
            </button>
          ))}
        </div>

        {/* Sonic 1 vs Sonic 3 Engine Selector */}
        <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              onChangeStageType('sonic1');
              setSelectedBrush(SpecialTileType.WALL_BLUE);
              resetForStageChange();
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              specialStageType === 'sonic1'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sonic 1 Special Stage (360° Maze)
          </button>
          <button
            onClick={() => {
              onChangeStageType('sonic3');
              setSelectedBrush(SpecialTileType.BLUE_SPHERE);
              resetForStageChange();
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              specialStageType === 'sonic3'
                ? 'bg-amber-600 text-white'
                : 'text-amber-400/90 hover:text-amber-300'
            }`}
          >
            Sonic 3 Blue Spheres (Note: Broken)
          </button>
        </div>

        {/* Play vs Edit Toggle + In-Screen Joystick Toggle (No Retry Button!) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTouchControls((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showTouchControls
                ? 'bg-blue-600/25 border-blue-500 text-blue-300'
                : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>In-Screen Joystick</span>
          </button>

          {!noCheatsMode && (
            <button
              onClick={() => {
                setMode(mode === 'play' ? 'edit' : 'play');
                resetForStageChange();
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'edit'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {mode === 'edit' ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Play Special Stage
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Special Stage {activeStageNumber}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Note that Blue Spheres are broken */}
      <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-300">
        <span>
          <strong>Note:</strong> Blue Spheres (Sonic 3 Special Stage) are currently broken — please use the{' '}
          <strong>Sonic 1 Special Stage (360° Maze)</strong> for your Chaos &amp; Super Emerald runs.
        </span>
        {specialStageType === 'sonic3' && (
          <button
            onClick={() => {
              onChangeStageType('sonic1');
              setSelectedBrush(SpecialTileType.WALL_BLUE);
              resetForStageChange();
            }}
            className="px-3 py-1 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors cursor-pointer"
          >
            Switch to Sonic 1 Maze
          </button>
        )}
      </div>

      {mode === 'play' ? (
        /* PLAYABLE SPECIAL STAGE VIEWPORT WITH IN-SCREEN LEFT JOYSTICK & RIGHT JUMP */
        <div className="space-y-4">
          <div className="bg-[#131B2E] border border-slate-800 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">
                {stageData.name} · {activeEmeraldInfo.name}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">{statusBanner.message}</span>
            </div>
            <div className="flex items-center gap-4 font-mono">
              {specialStageType === 'sonic3' && (
                <span className="text-blue-400 font-bold">
                  BLUE SPHERES LEFT: {statusBanner.blueRemaining}
                </span>
              )}
              <span className="text-yellow-400 font-bold">
                RINGS: {statusBanner.rings}
              </span>
            </div>
          </div>

          <div className="relative bg-[#090D16] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <canvas
              ref={playCanvasRef}
              width={920}
              height={500}
              className="w-full h-auto block mx-auto select-none"
            />

            {/* IN-SCREEN Left Analog Joystick & Right Jump Button */}
            {showTouchControls && statusBanner.type === 'playing' && (
              <VirtualControlsOverlay
                onChange={(st) => {
                  touchInputRef.current = {
                    left: st.left,
                    right: st.right,
                    up: st.up,
                    down: st.down,
                  };
                }}
                onJumpJustPressed={() => {
                  jumpJustPressedRef.current = true;
                }}
                onTurnTrigger={(dir) => {
                  turnQueueRef.current = dir;
                }}
              />
            )}

            {statusBanner.type !== 'playing' && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-6 z-30">
                <div className="bg-[#131B2E] border border-slate-700 rounded-2xl max-w-md w-full p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-400">
                    {statusBanner.type === 'won' ? (
                      <Award className="w-6 h-6" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {statusBanner.message}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Automatically warping back to your newest Zone Checkpoint...
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={onReturnToZone}
                      className="w-full py-2.5 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Teleport to Checkpoint Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* INTERACTIVE SPECIAL STAGE EDITOR */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Palette */}
          <div className="lg:col-span-4 bg-[#131B2E] border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">
                {specialStageType === 'sonic1'
                  ? 'Sonic 1 Maze Tile Palette'
                  : 'Sonic 3 Planet Sphere Palette'}
              </h2>
              <p className="text-xs text-slate-400">
                Click any tile in the grid on the right to customize Special Stage {activeStageNumber}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {activePalette.map((item) => (
                <button
                  key={item.type}
                  onClick={() => setSelectedBrush(item.type)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    selectedBrush === item.type
                      ? 'bg-blue-600/25 border-blue-500 text-white'
                      : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded shrink-0 border border-white/20"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Interactive Grid Canvas */}
          <div className="lg:col-span-8 bg-[#131B2E] border border-slate-800 rounded-xl p-6 flex flex-col items-center space-y-4">
            <div className="text-xs text-slate-300 font-semibold">
              Editing {stageData.name} (
              {specialStageType === 'sonic1'
                ? `${stageData.s1Width}×${stageData.s1Height} Rotating Maze (3× Giant Scale)`
                : `${stageData.s3Size}×${stageData.s3Size} Spherical Planet Grid (3× Giant Scale)`}
              )
            </div>

            <div
              className="grid border-2 border-slate-700 rounded-lg overflow-hidden bg-[#090D16] select-none"
              style={{
                gridTemplateColumns: `repeat(${activeEditGrid[0].length}, minmax(0, 1fr))`,
                width: 648,
                height: 648,
              }}
            >
              {activeEditGrid.map((row, rIdx) =>
                row.map((cellVal, cIdx) => {
                  const found = activePalette.find((p) => p.type === cellVal);
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleEditGridClick(rIdx, cIdx)}
                      className="border-[0.5px] border-slate-800/70 flex items-center justify-center text-[9px] font-mono font-bold text-white cursor-crosshair hover:opacity-80"
                      style={{
                        backgroundColor: found ? found.color : '#090D16',
                      }}
                      title={`Row ${rIdx}, Col ${cIdx}`}
                    >
                      {cellVal === SpecialTileType.GOAL_EXIT
                        ? 'G'
                        : cellVal === SpecialTileType.REVERSE_ROT
                        ? 'R'
                        : cellVal === SpecialTileType.CHAOS_EMERALD
                        ? '◆'
                        : cellVal === SpecialTileType.PLAYER_START
                        ? 'P'
                        : ''}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
