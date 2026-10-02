import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download,
  Edit3,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Sparkles,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Trophy,
  Upload,
} from 'lucide-react';
import {
  CHAOS_EMERALD_INFO,
  CHARACTER_SPECS,
  SUPER_EMERALD_INFO,
} from '../data/presets';
import {
  createPlayerEntity,
  spawnBadniksFromGrid,
  spawnBossesFromGrid,
  StepContext,
  TILE_SIZE,
  triggerSuperTransformation,
  updatePlayerPhysics,
  updateWorldEntities,
} from '../engine/physicsEngine';
import { renderViewport } from '../engine/renderer';
import {
  CharacterId,
  ControlInputState,
  LevelCheckpointSession,
  LevelData,
  MultiplayerMode,
  PlayerEntity,
  SplitOrientation,
  TilesetConfig,
  TileType,
} from '../types/engine';
import { VirtualControlsOverlay } from './VirtualControlsOverlay';

interface GameStageProps {
  levels: LevelData[];
  activeLevelId: string;
  tilesets: TilesetConfig[];
  p1Character: CharacterId;
  p2Character: CharacterId;
  multiplayerMode: MultiplayerMode;
  splitOrientation: SplitOrientation;
  chaosEmeralds: boolean[];
  superEmeralds: boolean[];
  lives: number;
  onChangeLives: React.Dispatch<React.SetStateAction<number>>;
  onGameOver: () => void;
  checkpointSession: LevelCheckpointSession | null;
  noCheatsMode?: boolean;
  onResetCampaign?: () => void;
  onSaveCheckpointSession: (session: LevelCheckpointSession) => void;
  onClearCheckpointSession: (levelId: string) => void;
  onSelectLevel: (id: string) => void;
  onChangeP1Character: (c: CharacterId) => void;
  onChangeP2Character: (c: CharacterId) => void;
  onChangeMultiplayerMode: (m: MultiplayerMode) => void;
  onChangeSplitOrientation: (o: SplitOrientation) => void;
  onOpenEditor: () => void;
  onEnterSpecialStage: () => void;
  onExportStagePackage?: (levelId?: string) => void;
  onImportStagePackage?: (rawJsonText: string) => void;
}

interface HudTelemetry {
  p1Rings: number;
  p1Score: number;
  p1Lives: number;
  p1NextLifeRings: number;
  p1Speed: number;
  p1State: string;
  p1Shield: string;
  p1IsSuper: boolean;
  p1IsHyper: boolean;
  p1Progress: number;
  p2Rings: number;
  p2Score: number;
  p2Speed: number;
  p2State: string;
  p2IsSuper: boolean;
  p2IsHyper: boolean;
  p2Progress: number;
  bossHp: number | null;
  bossMaxHp: number | null;
  bossType: 'eggman' | 'marble' | 'starlight' | 'hilltop' | 'silversonic' | 'deathegg' | null;
  elapsedMs: number;
  actCleared: boolean;
  gameOver: boolean;
  winnerLabel: string | null;
}

export const GameStage: React.FC<GameStageProps> = ({
  levels,
  activeLevelId,
  tilesets,
  p1Character,
  p2Character,
  multiplayerMode,
  splitOrientation,
  chaosEmeralds,
  superEmeralds,
  lives,
  onChangeLives,
  onGameOver,
  checkpointSession,
  noCheatsMode = false,
  onResetCampaign,
  onSaveCheckpointSession,
  onClearCheckpointSession,
  onSelectLevel,
  onChangeP1Character,
  onChangeP2Character,
  onChangeMultiplayerMode,
  onChangeSplitOrientation,
  onOpenEditor,
  onEnterSpecialStage,
  onExportStagePackage,
  onImportStagePackage,
}) => {
  const activeLevel = levels.find((l) => l.id === activeLevelId) || levels[0];
  const activeTileset =
    tilesets.find((t) => t.id === activeLevel.tilesetId) || tilesets[0];
  const stageFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportStageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportStagePackage) return;
    const reader = new FileReader();
    reader.onload = () => {
      onImportStagePackage(String(reader.result));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const allEmeraldsCollected = chaosEmeralds.every(Boolean);
  const allSuperEmeraldsCollected =
    allEmeraldsCollected && superEmeralds.every(Boolean);
  const emeraldCount = chaosEmeralds.filter(Boolean).length;
  const superEmeraldCount = superEmeralds.filter(Boolean).length;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [restartCounter, setRestartCounter] = useState(0);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(true);

  const manualSuperRequestRef = useRef<boolean>(false);
  const touchInputRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    special: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    special: false,
  });

  const [hud, setHud] = useState<HudTelemetry>({
    p1Rings: 0,
    p1Score: 0,
    p1Lives: lives,
    p1NextLifeRings: 100,
    p1Speed: 0,
    p1State: 'idle',
    p1Shield: 'none',
    p1IsSuper: false,
    p1IsHyper: false,
    p1Progress: 0,
    p2Rings: 0,
    p2Score: 0,
    p2Speed: 0,
    p2State: 'idle',
    p2IsSuper: false,
    p2IsHyper: false,
    p2Progress: 0,
    bossHp: null,
    bossMaxHp: null,
    bossType: null,
    elapsedMs: 0,
    actCleared: false,
    gameOver: false,
    winnerLabel: null,
  });

  // Live Keyboard & Gamepad Input Ref
  const keysDownRef = useRef<Set<string>>(new Set());
  const prevJumpRef = useRef<{ p1: boolean; p2: boolean }>({ p1: false, p2: false });
  const prevSpecRef = useRef<{ p1: boolean; p2: boolean }>({ p1: false, p2: false });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      if (
        [
          'Space',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Enter',
          'Slash',
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
      keysDownRef.current.add(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleRestartStage = useCallback(() => {
    onClearCheckpointSession(activeLevel.id);
    setIsPaused(false);
    setRestartCounter((c) => c + 1);
  }, [activeLevel.id, onClearCheckpointSession]);

  // Keep latest callbacks in refs so the 60FPS loop doesn't restart unnecessarily
  const sessionRef = useRef<LevelCheckpointSession | null>(checkpointSession);
  sessionRef.current = checkpointSession;
  const saveSessionRef = useRef(onSaveCheckpointSession);
  saveSessionRef.current = onSaveCheckpointSession;
  const enterSpecialRef = useRef(onEnterSpecialStage);
  enterSpecialRef.current = onEnterSpecialStage;
  const livesRef = useRef<number>(lives);
  livesRef.current = lives;
  const onChangeLivesRef = useRef(onChangeLives);
  onChangeLivesRef.current = onChangeLives;
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  // Automatically trigger Game Over reset after 3.2s when player runs out of lives
  useEffect(() => {
    if (!hud.gameOver) return;
    const timer = window.setTimeout(() => {
      setHud((prev) => ({ ...prev, gameOver: false, p1Lives: 3 }));
      onGameOverRef.current();
      setRestartCounter((c) => c + 1);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [hud.gameOver]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId = 0;
    let tick = 0;

    // Clone mutable working grid
    const workingGrid = activeLevel.grid.map((row) => [...row]);

    // Check if returning from a Special Stage to a saved Checkpoint in this level!
    const existingSession =
      sessionRef.current && sessionRef.current.levelId === activeLevel.id
        ? sessionRef.current
        : null;

    const collectedRingSet = new Set<string>(
      existingSession ? existingSession.collectedGiantRings : []
    );

    // Permanently remove any Giant Rings already collected in this Zone so they CANNOT be collected again!
    for (const key of collectedRingSet) {
      const [colStr, rowStr] = key.split(',');
      const c = Number(colStr);
      const r = Number(rowStr);
      if (
        !Number.isNaN(c) &&
        !Number.isNaN(r) &&
        workingGrid[r]?.[c] === TileType.GIANT_RING
      ) {
        workingGrid[r][c] = TileType.EMPTY;
      }
    }

    const p1 = createPlayerEntity(
      1,
      p1Character,
      activeLevel.p1Spawn.x,
      activeLevel.p1Spawn.y,
      false
    );
    p1.lives = Math.max(1, livesRef.current);
    const p2 = createPlayerEntity(
      2,
      p2Character,
      activeLevel.p2Spawn.x,
      activeLevel.p2Spawn.y,
      multiplayerMode === 'solo_ai'
    );

    // If returning from Special Stage, teleport directly to newest checkpoint!
    if (existingSession) {
      p1.x = existingSession.checkpointX;
      p1.y = existingSession.checkpointY;
      p1.checkpointX = existingSession.checkpointX;
      p1.checkpointY = existingSession.checkpointY;
      p1.camX = Math.max(0, p1.x - 240);
      p1.camY = Math.max(0, p1.y - 180);
      p1.rings = existingSession.savedRings;
      p1.score = existingSession.savedScore;

      p2.x = existingSession.checkpointX - 32;
      p2.y = existingSession.checkpointY;
      p2.checkpointX = existingSession.checkpointX - 32;
      p2.checkpointY = existingSession.checkpointY;
      p2.camX = p1.camX;
      p2.camY = p1.camY;
    }

    let lastSavedCheckpointX = p1.checkpointX;
    let lastSavedCheckpointY = p1.checkpointY;

    const stepCtx: StepContext = {
      level: activeLevel,
      grid: workingGrid,
      badniks: spawnBadniksFromGrid(activeLevel),
      bosses: spawnBossesFromGrid(activeLevel),
      projectiles: [],
      scatteredRings: [],
      particles: [],
      players: [p1, p2],
      allEmeraldsCollected,
      allSuperEmeraldsCollected,
      elapsedMs: existingSession ? existingSession.elapsedMs : 0,
    };

    const pollInput = (playerNum: 1 | 2): ControlInputState => {
      const k = keysDownRef.current;
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = pads[playerNum - 1];

      if (playerNum === 1) {
        const soloArrows =
          multiplayerMode === 'solo_ai' &&
          !k.has('Enter') &&
          !k.has('Slash') &&
          !k.has('Numpad0');

        const t = touchInputRef.current;
        const left =
          t.left ||
          k.has('KeyA') ||
          (soloArrows && k.has('ArrowLeft')) ||
          Boolean(pad && (pad.axes[0] < -0.3 || pad.buttons[14]?.pressed));
        const right =
          t.right ||
          k.has('KeyD') ||
          (soloArrows && k.has('ArrowRight')) ||
          Boolean(pad && (pad.axes[0] > 0.3 || pad.buttons[15]?.pressed));
        const up =
          t.up ||
          k.has('KeyW') ||
          (soloArrows && k.has('ArrowUp')) ||
          Boolean(pad && (pad.axes[1] < -0.3 || pad.buttons[12]?.pressed));
        const down =
          t.down ||
          k.has('KeyS') ||
          (soloArrows && k.has('ArrowDown')) ||
          Boolean(pad && (pad.axes[1] > 0.3 || pad.buttons[13]?.pressed));
        const jumpHeld =
          t.jump ||
          k.has('Space') ||
          k.has('KeyJ') ||
          k.has('KeyZ') ||
          Boolean(pad && (pad.buttons[0]?.pressed || pad.buttons[1]?.pressed));
        const specialHeld =
          t.special ||
          k.has('KeyC') ||
          k.has('KeyX') ||
          k.has('ShiftLeft') ||
          k.has('KeyK') ||
          Boolean(pad && (pad.buttons[2]?.pressed || pad.buttons[3]?.pressed));

        const jumpJustPressed = jumpHeld && !prevJumpRef.current.p1;
        prevJumpRef.current.p1 = jumpHeld;

        const specialJustPressed = specialHeld && !prevSpecRef.current.p1;
        prevSpecRef.current.p1 = specialHeld;

        return {
          left,
          right,
          up,
          down,
          jumpHeld,
          jumpJustPressed,
          specialHeld,
          specialJustPressed,
        };
      } else {
        const left =
          k.has('ArrowLeft') ||
          Boolean(pad && (pad.axes[0] < -0.3 || pad.buttons[14]?.pressed));
        const right =
          k.has('ArrowRight') ||
          Boolean(pad && (pad.axes[0] > 0.3 || pad.buttons[15]?.pressed));
        const up =
          k.has('ArrowUp') ||
          Boolean(pad && (pad.axes[1] < -0.3 || pad.buttons[12]?.pressed));
        const down =
          k.has('ArrowDown') ||
          Boolean(pad && (pad.axes[1] > 0.3 || pad.buttons[13]?.pressed));
        const jumpHeld =
          k.has('Enter') ||
          k.has('Slash') ||
          k.has('Numpad0') ||
          Boolean(pad && (pad.buttons[0]?.pressed || pad.buttons[1]?.pressed));
        const specialHeld =
          k.has('ShiftRight') ||
          k.has('Period') ||
          k.has('Numpad1') ||
          Boolean(pad && (pad.buttons[2]?.pressed || pad.buttons[3]?.pressed));

        const jumpJustPressed = jumpHeld && !prevJumpRef.current.p2;
        prevJumpRef.current.p2 = jumpHeld;

        const specialJustPressed = specialHeld && !prevSpecRef.current.p2;
        prevSpecRef.current.p2 = specialHeld;

        return {
          left,
          right,
          up,
          down,
          jumpHeld,
          jumpJustPressed,
          specialHeld,
          specialJustPressed,
        };
      }
    };

    const loop = () => {
      if (!isPaused) {
        tick++;
        const bothFinished =
          p1.finishedTimeMs !== null &&
          (p2.isAI || p2.finishedTimeMs !== null || multiplayerMode === 'versus_split');

        if (!bothFinished) {
          stepCtx.elapsedMs += 16.67;
        }

        // Sync runtime character selection & emerald status
        p1.character = p1Character;
        p2.character = p2Character;
        p2.isAI = multiplayerMode === 'solo_ai';
        stepCtx.allEmeraldsCollected = allEmeraldsCollected;
        stepCtx.allSuperEmeraldsCollected = allSuperEmeraldsCollected;

        if (manualSuperRequestRef.current) {
          manualSuperRequestRef.current = false;
          if (allEmeraldsCollected && p1.rings >= 50) {
            triggerSuperTransformation(p1, stepCtx);
          }
        }

        const in1 = pollInput(1);
        const in2 = pollInput(2);

        if (!p1.gameOverTriggered) {
          updatePlayerPhysics(p1, in1, null, stepCtx);
          updatePlayerPhysics(p2, in2, p1, stepCtx);
          updateWorldEntities(stepCtx);
        }

        // Sync any lives gained (+1 per 100 rings or 1-UP monitor) or lost (-1 on death)
        if (p1.livesDeltaThisFrame && p1.livesDeltaThisFrame !== 0) {
          const delta = p1.livesDeltaThisFrame;
          p1.livesDeltaThisFrame = 0;
          const updatedLives = Math.max(0, p1.lives);
          livesRef.current = updatedLives;
          if (updatedLives > 0 || delta > 0) {
            onChangeLivesRef.current(updatedLives);
          }
        }

        // Persist newest checkpoint if P1 activated a new Star Post!
        if (
          p1.checkpointX !== lastSavedCheckpointX ||
          p1.checkpointY !== lastSavedCheckpointY
        ) {
          lastSavedCheckpointX = p1.checkpointX;
          lastSavedCheckpointY = p1.checkpointY;
          saveSessionRef.current({
            levelId: activeLevel.id,
            checkpointX: p1.checkpointX,
            checkpointY: p1.checkpointY,
            collectedGiantRings: Array.from(collectedRingSet),
            savedRings: p1.rings,
            savedScore: p1.score,
            elapsedMs: stepCtx.elapsedMs,
          });
        }

        // Check if either player jumped into a Giant Special Stage Ring!
        if (p1.enteredGiantRing || p2.enteredGiantRing) {
          const ringKey = p1.collectedGiantRingKey || p2.collectedGiantRingKey;
          if (ringKey) {
            collectedRingSet.add(ringKey);
          }
          p1.enteredGiantRing = false;
          p2.enteredGiantRing = false;
          p1.collectedGiantRingKey = null;
          p2.collectedGiantRingKey = null;

          // Save checkpoint session & collected Giant Ring so this Giant Ring can NEVER be collected again!
          saveSessionRef.current({
            levelId: activeLevel.id,
            checkpointX: p1.checkpointX,
            checkpointY: p1.checkpointY,
            collectedGiantRings: Array.from(collectedRingSet),
            savedRings: p1.rings,
            savedScore: p1.score,
            elapsedMs: stepCtx.elapsedMs,
          });

          // If all 7 Chaos Emeralds AND all 7 Super Emeralds are already collected, grant +50 Rings in-place!
          if (allSuperEmeraldsCollected) {
            p1.rings += 40;
          } else {
            enterSpecialRef.current();
            return;
          }
        }

        // Render Viewport(s)
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const w = canvas.width;
            const h = canvas.height;
            const playersList: PlayerEntity[] = [p1, p2];

            const isSplit =
              multiplayerMode === 'coop_split' || multiplayerMode === 'versus_split';

            if (!isSplit) {
              let camX = p1.camX;
              let camY = p1.camY;
              if (
                multiplayerMode === 'coop_shared' &&
                Math.hypot(p1.x - p2.x, p1.y - p2.y) < 480
              ) {
                camX = (p1.camX + p2.camX) / 2;
                camY = (p1.camY + p2.camY) / 2;
              }
              renderViewport(
                ctx,
                w,
                h,
                camX,
                camY,
                activeLevel,
                workingGrid,
                activeTileset,
                playersList,
                stepCtx.badniks,
                stepCtx.bosses,
                stepCtx.projectiles,
                stepCtx.scatteredRings,
                stepCtx.particles,
                tick
              );
              drawCanvasLifeBadge(
                ctx,
                16,
                h - 42,
                CHARACTER_SPECS[p1.character].name.toUpperCase(),
                CHARACTER_SPECS[p1.character].primaryColor,
                p1.lives
              );
            } else if (splitOrientation === 'horizontal') {
              const halfH = Math.floor(h / 2);

              ctx.save();
              ctx.beginPath();
              ctx.rect(0, 0, w, halfH);
              ctx.clip();
              renderViewport(
                ctx,
                w,
                halfH,
                p1.camX,
                p1.camY,
                activeLevel,
                workingGrid,
                activeTileset,
                playersList,
                stepCtx.badniks,
                stepCtx.bosses,
                stepCtx.projectiles,
                stepCtx.scatteredRings,
                stepCtx.particles,
                tick
              );
              drawViewportCornerLabel(
                ctx,
                12,
                12,
                `P1 · ${(p1.isHyper ? CHARACTER_SPECS[p1.character].hyperName : p1.isSuper ? CHARACTER_SPECS[p1.character].superName : CHARACTER_SPECS[p1.character].name).toUpperCase()}`,
                p1.isHyper ? '#38BDF8' : p1.isSuper ? '#FACC15' : '#3B82F6'
              );
              ctx.restore();

              ctx.save();
              ctx.beginPath();
              ctx.rect(0, halfH, w, halfH);
              ctx.clip();
              ctx.translate(0, halfH);
              renderViewport(
                ctx,
                w,
                halfH,
                p2.camX,
                p2.camY,
                activeLevel,
                workingGrid,
                activeTileset,
                playersList,
                stepCtx.badniks,
                stepCtx.bosses,
                stepCtx.projectiles,
                stepCtx.scatteredRings,
                stepCtx.particles,
                tick
              );
              drawViewportCornerLabel(
                ctx,
                12,
                12,
                `P2 · ${(p2.isHyper ? CHARACTER_SPECS[p2.character].hyperName : p2.isSuper ? CHARACTER_SPECS[p2.character].superName : CHARACTER_SPECS[p2.character].name).toUpperCase()}`,
                p2.isHyper ? '#38BDF8' : p2.isSuper ? '#FACC15' : '#F59E0B'
              );
              ctx.restore();

              ctx.fillStyle = '#090D16';
              ctx.fillRect(0, halfH - 2, w, 4);
              ctx.fillStyle = '#334155';
              ctx.fillRect(0, halfH - 1, w, 2);
            } else {
              const halfW = Math.floor(w / 2);

              ctx.save();
              ctx.beginPath();
              ctx.rect(0, 0, halfW, h);
              ctx.clip();
              renderViewport(
                ctx,
                halfW,
                h,
                p1.camX,
                p1.camY,
                activeLevel,
                workingGrid,
                activeTileset,
                playersList,
                stepCtx.badniks,
                stepCtx.bosses,
                stepCtx.projectiles,
                stepCtx.scatteredRings,
                stepCtx.particles,
                tick
              );
              drawViewportCornerLabel(
                ctx,
                12,
                12,
                `P1 · ${(p1.isHyper ? CHARACTER_SPECS[p1.character].hyperName : p1.isSuper ? CHARACTER_SPECS[p1.character].superName : CHARACTER_SPECS[p1.character].name).toUpperCase()}`,
                p1.isHyper ? '#38BDF8' : p1.isSuper ? '#FACC15' : '#3B82F6'
              );
              ctx.restore();

              ctx.save();
              ctx.beginPath();
              ctx.rect(halfW, 0, halfW, h);
              ctx.clip();
              ctx.translate(halfW, 0);
              renderViewport(
                ctx,
                halfW,
                h,
                p2.camX,
                p2.camY,
                activeLevel,
                workingGrid,
                activeTileset,
                playersList,
                stepCtx.badniks,
                stepCtx.bosses,
                stepCtx.projectiles,
                stepCtx.scatteredRings,
                stepCtx.particles,
                tick
              );
              drawViewportCornerLabel(
                ctx,
                12,
                12,
                `P2 · ${(p2.isHyper ? CHARACTER_SPECS[p2.character].hyperName : p2.isSuper ? CHARACTER_SPECS[p2.character].superName : CHARACTER_SPECS[p2.character].name).toUpperCase()}`,
                p2.isHyper ? '#38BDF8' : p2.isSuper ? '#FACC15' : '#F59E0B'
              );
              ctx.restore();

              ctx.fillStyle = '#090D16';
              ctx.fillRect(halfW - 2, 0, 4, h);
              ctx.fillStyle = '#334155';
              ctx.fillRect(halfW - 1, 0, 2, h);
            }
          }
        }

        // Update React HUD every 4 frames (~15Hz)
        if (tick % 4 === 0) {
          const levelTotalPx = Math.max(1, (activeLevel.width - 12) * TILE_SIZE);
          const p1Prog = Math.min(100, Math.max(0, Math.round((p1.x / levelTotalPx) * 100)));
          const p2Prog = Math.min(100, Math.max(0, Math.round((p2.x / levelTotalPx) * 100)));

          const activeBoss =
            stepCtx.bosses.find((b) => b.alive && b.engaged) ||
            stepCtx.bosses.find((b) => b.alive);

          let winnerLabel: string | null = null;
          const actCleared = p1.finishedTimeMs !== null || p2.finishedTimeMs !== null;
          if (actCleared) {
            if (multiplayerMode === 'versus_split') {
              if (p1.finishedTimeMs !== null && p2.finishedTimeMs === null) {
                winnerLabel = `Player 1 (${CHARACTER_SPECS[p1.character].name}) Wins the Zone Race!`;
              } else if (p2.finishedTimeMs !== null && p1.finishedTimeMs === null) {
                winnerLabel = `Player 2 (${CHARACTER_SPECS[p2.character].name}) Wins the Zone Race!`;
              } else {
                winnerLabel =
                  p1.score >= p2.score
                    ? `Player 1 (${CHARACTER_SPECS[p1.character].name}) Wins on Score!`
                    : `Player 2 (${CHARACTER_SPECS[p2.character].name}) Wins on Score!`;
              }
            } else {
              winnerLabel = `${activeLevel.name} Act ${activeLevel.act} Clear!`;
            }
          }

          setHud({
            p1Rings: p1.rings,
            p1Score: p1.score,
            p1Lives: p1.lives,
            p1NextLifeRings: p1.nextExtraLifeRingThreshold || 100,
            p1Speed: Math.abs(p1.gsp || p1.vx),
            p1State: p1.state,
            p1Shield: p1.shield,
            p1IsSuper: p1.isSuper,
            p1IsHyper: p1.isHyper,
            p1Progress: p1Prog,
            p2Rings: p2.rings,
            p2Score: p2.score,
            p2Speed: Math.abs(p2.gsp || p2.vx),
            p2State: p2.state,
            p2IsSuper: p2.isSuper,
            p2IsHyper: p2.isHyper,
            p2Progress: p2Prog,
            bossHp: activeBoss ? activeBoss.hp : null,
            bossMaxHp: activeBoss ? activeBoss.maxHp : null,
            bossType: activeBoss ? activeBoss.bossType || 'eggman' : null,
            elapsedMs: stepCtx.elapsedMs,
            actCleared,
            gameOver: Boolean(p1.gameOverTriggered || p1.lives <= 0),
            winnerLabel,
          });
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    activeLevel,
    activeTileset,
    p1Character,
    p2Character,
    multiplayerMode,
    splitOrientation,
    allEmeraldsCollected,
    allSuperEmeraldsCollected,
    isPaused,
    restartCounter,
  ]);

  const formatTimer = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const p1TransformName = allSuperEmeraldsCollected
    ? CHARACTER_SPECS[p1Character].hyperName
    : CHARACTER_SPECS[p1Character].superName;

  const currentActIndex = Math.max(
    0,
    levels.findIndex((l) => l.id === activeLevel.id)
  );

  return (
    <div className="max-w-[1420px] mx-auto px-6 py-5 space-y-4">
      {/* Play Game (No-Cheat Campaign Mode) Status Banner */}
      {noCheatsMode && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-[#131B2E] to-blue-950/80 border border-emerald-500/40 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-md uppercase tracking-wide">
              Play Game · No-Cheats Mode
            </span>
            <span className="text-sm font-bold text-white">
              Stage {currentActIndex + 1} of {levels.length}: {activeLevel.name} — Act{' '}
              {activeLevel.act}
            </span>
            <span className="text-xs text-slate-300">
              Earn Chaos & Super Emeralds purely by finding Giant Rings in-level — all Emerald cheats & level skips disabled!
            </span>
          </div>
          {onResetCampaign && (
            <button
              onClick={onResetCampaign}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600/25 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              New Game (Reset Campaign Run)
            </button>
          )}
        </div>
      )}

      {/* Top Stage Controls & Character / Multiplayer Bar */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Stage Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] text-slate-400">
              {noCheatsMode ? 'Campaign Zone & Act (Locked Progression)' : 'Active Zone & Act'}
            </label>
            {noCheatsMode ? (
              <div className="mt-0.5 px-3 py-1.5 text-xs font-bold bg-[#0B0F19] border border-emerald-500/40 rounded-lg text-emerald-300">
                {activeLevel.name} — Act {activeLevel.act}
              </div>
            ) : (
              <select
                value={activeLevel.id}
                onChange={(e) => {
                  onSelectLevel(e.target.value);
                }}
                className="mt-0.5 px-3 py-1.5 text-xs font-semibold bg-[#0B0F19] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name} — Act {lvl.act}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Player 1 Character Selector */}
          <div>
            <label className="block text-[11px] text-slate-400">Player 1 (WASD + Space)</label>
            <div className="mt-0.5 flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-slate-800">
              {(['sonic', 'tails', 'knuckles', 'mighty', 'ray'] as CharacterId[]).map((cid) => (
                <button
                  key={cid}
                  onClick={() => onChangeP1Character(cid)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded capitalize transition-colors cursor-pointer ${
                    p1Character === cid
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cid}
                </button>
              ))}
            </div>
          </div>

          {/* Player 2 Character Selector */}
          <div>
            <label className="block text-[11px] text-slate-400">
              Player 2 (Arrows + Enter)
            </label>
            <div className="mt-0.5 flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-slate-800">
              {(['sonic', 'tails', 'knuckles', 'mighty', 'ray'] as CharacterId[]).map((cid) => (
                <button
                  key={cid}
                  onClick={() => onChangeP2Character(cid)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded capitalize transition-colors cursor-pointer ${
                    p2Character === cid
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cid}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Local Multiplayer Mode & Viewport Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-slate-800">
            {(
              [
                ['solo_ai', '1P + AI Partner'],
                ['coop_shared', '2P Co-op Shared'],
                ['coop_split', '2P Co-op Split'],
                ['versus_split', '2P Versus Race'],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => onChangeMultiplayerMode(mode)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  multiplayerMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {(multiplayerMode === 'coop_split' || multiplayerMode === 'versus_split') && (
            <button
              onClick={() =>
                onChangeSplitOrientation(
                  splitOrientation === 'horizontal' ? 'vertical' : 'horizontal'
                )
              }
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#0B0F19] hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              title="Toggle Horizontal vs Vertical Split-Screen"
            >
              {splitOrientation === 'horizontal' ? (
                <>
                  <SplitSquareVertical className="w-3.5 h-3.5 text-blue-400" />
                  <span>Top / Bottom</span>
                </>
              ) : (
                <>
                  <SplitSquareHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Left / Right</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setShowTouchControls((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showTouchControls
                ? 'bg-blue-600/25 border-blue-500 text-blue-300'
                : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Toggle On-Screen Virtual Joystick & Jump Button"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>In-Screen Joystick</span>
          </button>

          <button
            onClick={() => setIsPaused((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={handleRestartStage}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Act</span>
          </button>

          {!noCheatsMode && (
            <>
              {onExportStagePackage && (
                <button
                  onClick={() => onExportStagePackage(activeLevel.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#0B0F19] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  title="Export Custom Stage + Edited Textures & Sounds"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Export Stage</span>
                </button>
              )}
              {onImportStagePackage && (
                <>
                  <button
                    onClick={() => stageFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#0B0F19] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    title="Import Custom Stage + All Edited Textures & Sounds"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Import Stage</span>
                  </button>
                  <input
                    ref={stageFileInputRef}
                    type="file"
                    accept=".json,.stage.json"
                    onChange={handleImportStageFile}
                    className="hidden"
                  />
                </>
              )}
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Stage</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Unobtrusive 16-Bit HUD Header Bar */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-xl px-5 py-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Player 1 Telemetry & Super / Hyper Form Trigger */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>
                P1 ·{' '}
                {hud.p1IsHyper ? (
                  <strong className="text-sky-300">
                    {CHARACTER_SPECS[p1Character].hyperName}
                  </strong>
                ) : hud.p1IsSuper ? (
                  <strong className="text-yellow-300">
                    {CHARACTER_SPECS[p1Character].superName}
                  </strong>
                ) : (
                  CHARACTER_SPECS[p1Character].fullName
                )}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 font-mono text-sm">
              <span
                className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs"
                title={`1-UP at ${hud.p1NextLifeRings} Rings or 1-UP Monitor! 0 Lives = Game Over!`}
              >
                LIVES ×{hud.p1Lives}
              </span>
              <span
                className={
                  hud.p1Rings === 0 ? 'text-amber-400 font-bold' : 'text-yellow-300 font-bold'
                }
              >
                RINGS: {hud.p1Rings}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-200">SCORE: {hud.p1Score}</span>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            <div>SPD: {hud.p1Speed.toFixed(1)}</div>
            <div className="uppercase text-blue-400">{hud.p1State}</div>
          </div>

          {allEmeraldsCollected && hud.p1Rings >= 50 && !hud.p1IsSuper && (
            <button
              onClick={() => {
                manualSuperRequestRef.current = true;
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg shadow-lg transition-colors cursor-pointer ${
                allSuperEmeraldsCollected
                  ? 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
              title="Press C / Shift or Click to Transform!"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Go {p1TransformName}! (C)</span>
            </button>
          )}
        </div>

        {/* Center Zone Timer, Chaos & Super Emeralds & Race Progress */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              {activeLevel.name} · Act {activeLevel.act} · TIME{' '}
              <strong className="font-mono text-white">
                {formatTimer(hud.elapsedMs)}
              </strong>
            </span>
            {hud.bossHp !== null && hud.bossMaxHp !== null && (
              <span className="font-mono text-rose-400 font-bold">
                ·{' '}
                {hud.bossType === 'deathegg'
                  ? `DEATH EGG ROBOT HP: ${hud.bossHp}/${hud.bossMaxHp}`
                  : hud.bossType === 'silversonic'
                  ? `SILVER SONIC HP: ${hud.bossHp}/${hud.bossMaxHp}`
                  : hud.bossType === 'marble'
                  ? `MARBLE MAGMA BOSS HP: ${hud.bossHp}/${hud.bossMaxHp}`
                  : hud.bossType === 'starlight'
                  ? `STARLIGHT CYBER BOSS HP: ${hud.bossHp}/${hud.bossMaxHp}`
                  : hud.bossType === 'hilltop'
                  ? `HILL TOP PYRO BOSS HP: ${hud.bossHp}/${hud.bossMaxHp}`
                  : `EGGMAN HP: ${hud.bossHp}/${hud.bossMaxHp}`}
              </span>
            )}
          </div>

          {/* 7 Chaos Emeralds / 7 Super Emeralds Indicator Row */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-mono text-slate-400">
              {allEmeraldsCollected
                ? `SUPER EMERALDS (${superEmeraldCount}/7):`
                : `CHAOS EMERALDS (${emeraldCount}/7):`}
            </span>
            <div className="flex items-center gap-1">
              {(allEmeraldsCollected ? SUPER_EMERALD_INFO : CHAOS_EMERALD_INFO).map(
                (em, i) => {
                  const owned = allEmeraldsCollected
                    ? superEmeralds[i]
                    : chaosEmeralds[i];
                  return (
                    <span
                      key={em.number}
                      title={`${em.name}: ${owned ? 'Collected' : 'Enter a Giant Ring in the Zone!'}`}
                      className="w-3 h-3 rotate-45 inline-block border transition-transform"
                      style={{
                        backgroundColor: owned ? em.color : '#0B0F19',
                        borderColor: owned ? '#FFFFFF' : '#334155',
                        opacity: owned ? 1 : 0.45,
                      }}
                    />
                  );
                }
              )}
            </div>
          </div>

          {/* Live Stage Progress Track for Both Players */}
          <div className="w-full max-w-xs h-1.5 bg-[#0B0F19] rounded-full mt-1.5 relative border border-slate-800 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 bg-blue-500/60 transition-transform"
              style={{ width: `${hud.p1Progress}%` }}
            />
            <div
              className="absolute top-0 bottom-0 left-0 bg-amber-500/60 transition-transform"
              style={{ width: `${hud.p2Progress}%` }}
            />
          </div>
        </div>

        {/* Player 2 Telemetry */}
        <div className="flex items-center justify-between md:justify-end gap-5">
          <div className="text-xs font-mono text-slate-400 hidden sm:block text-right">
            <div>SPD: {hud.p2Speed.toFixed(1)}</div>
            <div className="uppercase text-amber-400">{hud.p2State}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">
              P2 ({multiplayerMode === 'solo_ai' ? 'AI / Drop-In' : 'Human'}) ·{' '}
              {hud.p2IsHyper ? (
                <strong className="text-sky-300">
                  {CHARACTER_SPECS[p2Character].hyperName}
                </strong>
              ) : hud.p2IsSuper ? (
                <strong className="text-yellow-300">
                  {CHARACTER_SPECS[p2Character].superName}
                </strong>
              ) : (
                CHARACTER_SPECS[p2Character].fullName
              )}
            </div>
            <div className="flex items-center justify-end gap-3 mt-0.5 font-mono text-sm">
              <span
                className={
                  hud.p2Rings === 0 ? 'text-amber-400 font-bold' : 'text-yellow-300 font-bold'
                }
              >
                RINGS: {hud.p2Rings}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-200">SCORE: {hud.p2Score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 60 FPS Game Canvas WITH IN-SCREEN LEFT JOYSTICK & RIGHT JUMP BUTTON */}
      <div className="relative bg-[#090D16] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={960}
          height={520}
          className="w-full h-auto block select-none"
        />

        {/* IN-SCREEN Left Analog Joystick & Right Jump Button */}
        {showTouchControls && !hud.actCleared && (
          <VirtualControlsOverlay
            onChange={(st) => {
              touchInputRef.current = st;
            }}
            onSpecialTrigger={() => {
              manualSuperRequestRef.current = true;
            }}
            showSuperButton={allEmeraldsCollected && hud.p1Rings >= 50 && !hud.p1IsSuper}
            superLabel={allSuperEmeraldsCollected ? 'HYPER' : 'SUPER'}
          />
        )}

        {/* Game Over Modal Overlay (0 Lives -> Restart from Start of Game with 0 Chaos Emeralds) */}
        {hud.gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-40">
            <div className="bg-[#131B2E] border-2 border-rose-500/70 rounded-2xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl">
              <div className="inline-block px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold uppercase tracking-widest">
                0 Lives Remaining
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-wider text-rose-500 font-display">
                  GAME OVER
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You ran out of lives! Returning to the start of the game (<strong className="text-white">Emerald Mountains Zone — Act 1</strong>) with <strong className="text-emerald-400">3 Lives</strong> and <strong className="text-amber-400">no Chaos Emeralds</strong>.
                </p>
              </div>
              <button
                onClick={() => {
                  setHud((prev) => ({ ...prev, gameOver: false, p1Lives: 3 }));
                  onGameOver();
                  setRestartCounter((c) => c + 1);
                }}
                className="w-full py-3 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors cursor-pointer shadow-lg"
              >
                Restart Game from Act 1 (3 Lives · 0 Chaos Emeralds)
              </button>
            </div>
          </div>
        )}

        {/* Act Clear / Victory Modal Overlay */}
        {hud.actCleared && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-30">
            <div className="bg-[#131B2E] border border-slate-700 rounded-2xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">
                  {hud.winnerLabel || 'Act Clear!'}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Clear Time: {formatTimer(hud.elapsedMs)}
                </p>
              </div>

              <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>P1 ({CHARACTER_SPECS[p1Character].name}) Final Score</span>
                  <span className="text-white font-bold">{hud.p1Score} PTS</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>P1 Ring Bonus ({hud.p1Rings} × 100)</span>
                  <span className="text-yellow-400">+{hud.p1Rings * 100}</span>
                </div>
                <div className="border-t border-slate-800 my-2 pt-2 flex justify-between text-slate-300">
                  <span>P2 ({CHARACTER_SPECS[p2Character].name}) Final Score</span>
                  <span className="text-white font-bold">{hud.p2Score} PTS</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRestartStage}
                  className="flex-1 py-2.5 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Play Again
                </button>
                <button
                  onClick={() => {
                    const idx = levels.findIndex((l) => l.id === activeLevel.id);
                    const nextLvl = levels[(idx + 1) % levels.length];
                    onClearCheckpointSession(nextLvl.id);
                    onSelectLevel(nextLvl.id);
                  }}
                  className="flex-1 py-2.5 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Next Act →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Character Physics, Super & Hyper Form Guide Strip */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        {(['sonic', 'tails', 'knuckles', 'mighty', 'ray'] as CharacterId[]).map((cid) => {
          const spec = CHARACTER_SPECS[cid];
          const isP1 = p1Character === cid;
          const isP2 = p2Character === cid;
          return (
            <div
              key={cid}
              className={`p-3 rounded-lg border transition-colors ${
                isP1 || isP2
                  ? 'bg-[#0B0F19] border-slate-700'
                  : 'bg-[#0B0F19]/50 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-xs">
                  {spec.fullName}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  SPD {spec.topSpeed}
                </span>
              </div>
              <div className="text-blue-400 font-semibold text-[11px] mb-1">
                {spec.abilityName}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{spec.abilityDetails}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function drawCanvasLifeBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  charName: string,
  color: string,
  lives: number
) {
  ctx.save();
  ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
  ctx.fillRect(x, y, 122, 28);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, 122, 28);

  // Character Life Icon Box
  ctx.fillStyle = color;
  ctx.fillRect(x + 5, y + 5, 18, 18);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText(charName.charAt(0), x + 10, y + 18);

  // Name & Life Count
  ctx.fillStyle = '#FACC15';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillText(charName, x + 28, y + 13);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText(`× ${Math.max(0, lives)}`, x + 28, y + 24);
  ctx.restore();
}

function drawViewportCornerLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  accent: string
) {
  ctx.save();
  ctx.fillStyle = 'rgba(11, 15, 25, 0.82)';
  ctx.fillRect(x, y, 178, 22);
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, 4, 22);
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText(text, x + 10, y + 15);
  ctx.restore();
}
