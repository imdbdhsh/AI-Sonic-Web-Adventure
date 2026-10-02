import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Camera,
  Compass,
  Download,
  Eraser,
  Grid,
  Hand,
  Layers,
  Play,
  Plus,
  Smartphone,
  Sparkles,
  Square,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { TILE_SIZE } from '../engine/physicsEngine';
import { renderViewport } from '../engine/renderer';
import { LevelData, TilesetConfig, TileType } from '../types/engine';

interface LevelEditorProps {
  levels: LevelData[];
  activeLevelId: string;
  tilesets: TilesetConfig[];
  onSelectLevel: (id: string) => void;
  onUpdateLevel: (updated: LevelData) => void;
  onCreateLevel: (newLevel: LevelData) => void;
  onDeleteLevel: (id: string) => void;
  onTestPlayLevel: () => void;
  onExportStagePackage: (levelId?: string) => void;
  onImportStagePackage: (rawJsonText: string) => void;
}

type EditorToolMode =
  | 'brush'
  | 'erase'
  | 'pan_camera'
  | 'ground_rect'
  | 'stamp_hill_up'
  | 'stamp_hill_down'
  | 'stamp_ring_arc'
  | 'stamp_loop_runway';

type EditorLayerMode = 'foreground' | 'background';

interface TilePaletteItem {
  type: TileType;
  label: string;
  category: 'terrain' | 'background' | 'custom' | 'gimmicks' | 'items' | 'badniks';
  swatch: string;
}

const PALETTE_ITEMS: TilePaletteItem[] = [
  // Terrain
  { type: TileType.GROUND_TOP, label: 'Ground Top Cap', category: 'terrain', swatch: '#22C55E' },
  { type: TileType.GROUND_DEEP, label: 'Deep Soil Block', category: 'terrain', swatch: '#B45309' },
  { type: TileType.SLOPE_UP_LOW, label: '26° Slope Up (A)', category: 'terrain', swatch: '#16A34A' },
  { type: TileType.SLOPE_UP_HIGH, label: '26° Slope Up (B)', category: 'terrain', swatch: '#15803D' },
  { type: TileType.SLOPE_DOWN_HIGH, label: '26° Slope Down (A)', category: 'terrain', swatch: '#16A34A' },
  { type: TileType.SLOPE_DOWN_LOW, label: '26° Slope Down (B)', category: 'terrain', swatch: '#15803D' },
  { type: TileType.SLOPE_45_UP, label: '45° Steep Up', category: 'terrain', swatch: '#10B981' },
  { type: TileType.SLOPE_45_DOWN, label: '45° Steep Down', category: 'terrain', swatch: '#059669' },
  { type: TileType.PLATFORM, label: 'One-Way Platform', category: 'terrain', swatch: '#FACC15' },
  { type: TileType.ONE_WAY_DOOR, label: 'One-Way Door (3-Tall)', category: 'terrain', swatch: '#38BDF8' },
  { type: TileType.BREAKABLE_ROCK, label: 'Breakable Wall', category: 'terrain', swatch: '#B45309' },
  { type: TileType.DECO_WATERFALL, label: 'Waterfall Deco', category: 'terrain', swatch: '#0EA5E9' },
  { type: TileType.BG_BRICK, label: 'BG: Tower Brick (Behind)', category: 'terrain', swatch: '#334155' },
  { type: TileType.BG_PILLAR, label: 'BG: Stone Pillar (Behind)', category: 'terrain', swatch: '#475569' },

  // Background Tiles (Pass-through tiles that render behind foreground & players!)
  { type: TileType.BG_BRICK, label: 'BG: Tower Brick Wall', category: 'background', swatch: '#334155' },
  { type: TileType.BG_PILLAR, label: 'BG: Fluted Stone Pillar', category: 'background', swatch: '#475569' },
  { type: TileType.BG_WINDOW, label: 'BG: Tower Arch Window', category: 'background', swatch: '#0284C7' },
  { type: TileType.BG_LATTICE, label: 'BG: Girder Lattice', category: 'background', swatch: '#64748B' },
  { type: TileType.BG_FOLIAGE, label: 'BG: Emerald Foliage Wall', category: 'background', swatch: '#15803D' },
  { type: TileType.DECO_WATERFALL, label: 'BG: Cascading Waterfall', category: 'background', swatch: '#0EA5E9' },

  // 10 Blank White Blocks (Editable in Tileset Studio!)
  { type: TileType.CUSTOM_BLOCK_1, label: 'Blank White Block 1', category: 'terrain', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_2, label: 'Blank White Block 2', category: 'terrain', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_3, label: 'Blank White Block 3', category: 'terrain', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_4, label: 'Blank White Block 4', category: 'terrain', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_5, label: 'Blank White Block 5', category: 'terrain', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_6, label: 'Blank White Block 6', category: 'terrain', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_7, label: 'Blank White Block 7', category: 'terrain', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_8, label: 'Blank White Block 8', category: 'terrain', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_9, label: 'Blank White Block 9', category: 'terrain', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_10, label: 'Blank White Block 10', category: 'terrain', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_1, label: 'Blank White Block 1', category: 'custom', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_2, label: 'Blank White Block 2', category: 'custom', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_3, label: 'Blank White Block 3', category: 'custom', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_4, label: 'Blank White Block 4', category: 'custom', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_5, label: 'Blank White Block 5', category: 'custom', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_6, label: 'Blank White Block 6', category: 'custom', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_7, label: 'Blank White Block 7', category: 'custom', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_8, label: 'Blank White Block 8', category: 'custom', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_9, label: 'Blank White Block 9', category: 'custom', swatch: '#FFFFFF' },
  { type: TileType.CUSTOM_BLOCK_10, label: 'Blank White Block 10', category: 'custom', swatch: '#FFFFFF' },

  // Gimmicks & Loops
  { type: TileType.MOVING_PLATFORM, label: 'Moving Platform ↔', category: 'gimmicks', swatch: '#22C55E' },
  { type: TileType.MOVING_PLATFORM_VERT, label: 'Elevator Platform ↕', category: 'gimmicks', swatch: '#10B981' },
  { type: TileType.SWINGING_PLATFORM, label: 'Swinging Platform ⛓', category: 'gimmicks', swatch: '#F59E0B' },
  { type: TileType.ONE_WAY_DOOR, label: 'One-Way Door (3-Tall)', category: 'gimmicks', swatch: '#38BDF8' },
  { type: TileType.LOOP_HEAD, label: '360° Loop-de-Loop', category: 'gimmicks', swatch: '#3B82F6' },
  { type: TileType.BOOSTER_RIGHT, label: 'Speed Booster →', category: 'gimmicks', swatch: '#EF4444' },
  { type: TileType.BOOSTER_LEFT, label: 'Speed Booster ←', category: 'gimmicks', swatch: '#F97316' },
  { type: TileType.SPRING_YELLOW, label: 'Yellow Spring ↑', category: 'gimmicks', swatch: '#EAB308' },
  { type: TileType.SPRING_RED, label: 'Red High Spring ↑', category: 'gimmicks', swatch: '#DC2626' },
  { type: TileType.SPRING_RIGHT, label: 'Side Spring →', category: 'gimmicks', swatch: '#F43F5E' },
  { type: TileType.SPRING_LEFT, label: 'Side Spring ←', category: 'gimmicks', swatch: '#FB7185' },
  { type: TileType.SPIKES_UP, label: 'Hazard Spikes', category: 'gimmicks', swatch: '#CBD5E1' },
  { type: TileType.LAVA, label: 'Marble Zone Lava', category: 'gimmicks', swatch: '#EA580C' },
  { type: TileType.GIMMICK_BUMPER, label: 'Emerald: Pinball Star Bumper', category: 'gimmicks', swatch: '#EF4444' },
  { type: TileType.GIMMICK_DASH_RING, label: 'Emerald: Rainbow Dash Ring', category: 'gimmicks', swatch: '#38BDF8' },
  { type: TileType.GIMMICK_CRUSHER, label: 'Marble: Stomping Crusher', category: 'gimmicks', swatch: '#A855F7' },
  { type: TileType.GIMMICK_LAVA_GEYSER, label: 'Marble: Erupting Lava Geyser', category: 'gimmicks', swatch: '#F97316' },
  { type: TileType.GIMMICK_LAVA_SHOOTER_LEFT, label: 'Starlight: Wall Lava Shooter ←', category: 'gimmicks', swatch: '#EA580C' },
  { type: TileType.GIMMICK_LAVA_SHOOTER_RIGHT, label: 'Starlight: Wall Lava Shooter →', category: 'gimmicks', swatch: '#FB923C' },
  { type: TileType.GIMMICK_CONVEYOR_RIGHT, label: 'Starlight: Conveyor Belt →', category: 'gimmicks', swatch: '#38BDF8' },
  { type: TileType.GIMMICK_CONVEYOR_LEFT, label: 'Starlight: Conveyor Belt ←', category: 'gimmicks', swatch: '#0284C7' },
  { type: TileType.GIMMICK_UPDRAFT, label: 'Hill Top: Wind Updraft Fan ↑', category: 'gimmicks', swatch: '#7DD3FC' },
  { type: TileType.GIMMICK_TELEPORT_ORB, label: 'Hill Top: Cloud Warp Cannon', category: 'gimmicks', swatch: '#2563EB' },

  // Collectibles & Spawns
  { type: TileType.RING, label: 'Golden Ring', category: 'items', swatch: '#FACC15' },
  { type: TileType.MONITOR_1UP, label: 'Monitor: 1-UP Extra Life', category: 'items', swatch: '#22C55E' },
  { type: TileType.MONITOR_RING, label: 'Monitor: +10 Rings', category: 'items', swatch: '#FDE047' },
  { type: TileType.MONITOR_SPEED, label: 'Monitor: Speed Shoes', category: 'items', swatch: '#EF4444' },
  { type: TileType.MONITOR_SHIELD, label: 'Monitor: Blue Shield', category: 'items', swatch: '#60A5FA' },
  { type: TileType.MONITOR_FLAME, label: 'Monitor: Flame Shield', category: 'items', swatch: '#F97316' },
  { type: TileType.MONITOR_LIGHTNING, label: 'Monitor: Lightning Shield', category: 'items', swatch: '#38BDF8' },
  { type: TileType.MONITOR_BUBBLE, label: 'Monitor: Bubble Shield', category: 'items', swatch: '#34D399' },
  { type: TileType.MONITOR_INVINCIBILITY, label: 'Monitor: Invincibility', category: 'items', swatch: '#FACC15' },
  { type: TileType.MONITOR_EGGMAN, label: 'Monitor: Eggman Trap', category: 'items', swatch: '#DC2626' },
  { type: TileType.MONITOR_SWAP, label: 'Monitor: Teleport Swap', category: 'items', swatch: '#A855F7' },
  { type: TileType.MONITOR_SUPER, label: 'Monitor: Super "S" Form', category: 'items', swatch: '#FDE047' },
  { type: TileType.GIANT_RING, label: 'Special Stage Giant Ring', category: 'items', swatch: '#F59E0B' },
  { type: TileType.CHECKPOINT, label: 'Star Post Checkpoint', category: 'items', swatch: '#60A5FA' },
  { type: TileType.GOAL_POST, label: 'Goal Signpost', category: 'items', swatch: '#2563EB' },
  { type: TileType.SPAWN_P1, label: 'P1 Start Spawn', category: 'items', swatch: '#3B82F6' },
  { type: TileType.SPAWN_P2, label: 'P2 Start Spawn', category: 'items', swatch: '#F59E0B' },

  // Badniks & Bosses
  { type: TileType.BADNIK_MOTOBUG, label: 'Motobug Patrol', category: 'badniks', swatch: '#DC2626' },
  { type: TileType.BADNIK_BUZZ, label: 'Buzz Bomber Flyer', category: 'badniks', swatch: '#2563EB' },
  { type: TileType.BADNIK_CRAB, label: 'Crabmeat Guard', category: 'badniks', swatch: '#F43F5E' },
  { type: TileType.BADNIK_CHOPPER, label: 'Emerald Act 2: Chopper Piranha', category: 'badniks', swatch: '#F97316' },
  { type: TileType.BADNIK_CATERKILLER, label: 'Marble: Spiked Caterkiller', category: 'badniks', swatch: '#EC4899' },
  { type: TileType.BADNIK_BATBRAIN, label: 'Marble: Swooping Batbrain', category: 'badniks', swatch: '#6366F1' },
  { type: TileType.BADNIK_ORBINAUT, label: 'Starlight: Spike Orbinaut', category: 'badniks', swatch: '#0EA5E9' },
  { type: TileType.BADNIK_BOMB, label: 'Starlight: Walking Bomb', category: 'badniks', swatch: '#EF4444' },
  { type: TileType.BADNIK_SPINY, label: 'Hill Top: Mortar Spiny', category: 'badniks', swatch: '#0284C7' },
  { type: TileType.BOSS_EGGMAN, label: 'Boss: Emerald Eggman Wrecker (Act 2)', category: 'badniks', swatch: '#EF4444' },
  { type: TileType.BOSS_MARBLE, label: 'Boss: Marble Magma Dropper (Act 2)', category: 'badniks', swatch: '#F97316' },
  { type: TileType.BOSS_STARLIGHT, label: 'Boss: Starlight Cyber Laser (Act 2)', category: 'badniks', swatch: '#38BDF8' },
  { type: TileType.BOSS_HILLTOP, label: 'Boss: Hill Top Pyro-Sub (Act 2)', category: 'badniks', swatch: '#DC2626' },
  { type: TileType.BOSS_SILVER_SONIC, label: 'Death Egg: Silver Sonic Boss', category: 'badniks', swatch: '#CBD5E1' },
  { type: TileType.BOSS_DEATH_EGG_ROBOT, label: 'Death Egg: Final Mecha Boss', category: 'badniks', swatch: '#FACC15' },
];

export const LevelEditor: React.FC<LevelEditorProps> = ({
  levels,
  activeLevelId,
  tilesets,
  onSelectLevel,
  onUpdateLevel,
  onCreateLevel,
  onDeleteLevel,
  onTestPlayLevel,
  onExportStagePackage,
  onImportStagePackage,
}) => {
  const activeLevel = levels.find((l) => l.id === activeLevelId) || levels[0];
  const activeTileset =
    tilesets.find((t) => t.id === activeLevel.tilesetId) || tilesets[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedTile, setSelectedTile] = useState<TileType>(TileType.GROUND_TOP);
  const [toolMode, setToolMode] = useState<EditorToolMode>('brush');
  const [editorLayer, setEditorLayer] = useState<EditorLayerMode>('foreground');
  const [swipeToPlaceMode, setSwipeToPlaceMode] = useState<boolean>(true);
  const [cameraZoom, setCameraZoom] = useState<number>(1.0);
  const [fastPan, setFastPan] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<TilePaletteItem['category']>('terrain');
  const [camX, setCamX] = useState<number>(440);
  const [camY, setCamY] = useState<number>(
    Math.max(200, (activeLevel.p1Spawn?.y || 20) * TILE_SIZE - 40)
  );
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isDraggingPaint, setIsDraggingPaint] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panOrigin, setPanOrigin] = useState<{ x: number; y: number; cx: number; cy: number }>({
    x: 0,
    y: 0,
    cx: 0,
    cy: 0,
  });
  const [rectStart, setRectStart] = useState<{ col: number; row: number } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number } | null>(null);
  const lastSwipedCellRef = useRef<string | null>(null);

  // Sync editor camera to P1 Spawn whenever the user selects a different level (e.g. Act 3 high-Y level!)
  useEffect(() => {
    setCamX(Math.max(240, (activeLevel.p1Spawn?.x || 4) * TILE_SIZE + 160));
    setCamY(Math.max(180, (activeLevel.p1Spawn?.y || 20) * TILE_SIZE - 40));
  }, [activeLevel.id]);

  // Render Loop for Editor Viewport
  useEffect(() => {
    let animId = 0;
    let tick = 0;

    const renderLoop = () => {
      tick++;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const effW = Math.round(canvas.width / cameraZoom);
          const effH = Math.round(canvas.height / cameraZoom);

          ctx.save();
          ctx.scale(cameraZoom, cameraZoom);
          renderViewport(
            ctx,
            effW,
            effH,
            camX,
            camY,
            activeLevel,
            activeLevel.grid,
            activeTileset,
            [],
            [],
            [],
            [],
            [],
            [],
            tick,
            showGrid
          );

          // Draw Hover Cursor Highlight
          if (hoverCell) {
            const camLeft = Math.floor(camX - effW / 2);
            const camTop = Math.floor(camY - effH / 2);
            const sx = hoverCell.col * TILE_SIZE - camLeft;
            const sy = hoverCell.row * TILE_SIZE - camTop;

            ctx.save();
            ctx.strokeStyle =
              toolMode === 'erase'
                ? '#F43F5E'
                : editorLayer === 'background'
                ? '#A855F7'
                : '#38BDF8';
            ctx.lineWidth = 2;
            if (toolMode === 'ground_rect' && rectStart) {
              const minC = Math.min(rectStart.col, hoverCell.col);
              const maxC = Math.max(rectStart.col, hoverCell.col);
              const minR = Math.min(rectStart.row, hoverCell.row);
              const maxR = Math.max(rectStart.row, hoverCell.row);
              ctx.strokeRect(
                minC * TILE_SIZE - camLeft,
                minR * TILE_SIZE - camTop,
                (maxC - minC + 1) * TILE_SIZE,
                (maxR - minR + 1) * TILE_SIZE
              );
            } else if (selectedTile === TileType.LOOP_HEAD && toolMode === 'brush') {
              ctx.strokeRect(sx, sy, TILE_SIZE * 6, TILE_SIZE * 6);
            } else {
              ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);
            }
            ctx.restore();
          }
          ctx.restore();
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    activeLevel,
    activeTileset,
    camX,
    camY,
    cameraZoom,
    editorLayer,
    showGrid,
    hoverCell,
    toolMode,
    selectedTile,
    rectStart,
  ]);

  // Keyboard Arrow/WASD camera panning inside editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      const step = 64;
      const maxW = activeLevel.width * TILE_SIZE;
      const maxH = activeLevel.height * TILE_SIZE;
      if (e.key === 'ArrowRight' || e.key === 'd') {
        setCamX((x) => Math.min(maxW - 200, x + step));
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setCamX((x) => Math.max(200, x - step));
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        setCamY((y) => Math.max(160, y - step));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setCamY((y) => Math.min(maxH - 160, y + step));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLevel.width, activeLevel.height]);

  const getGridCoordsFromClientPos = (
    clientX: number,
    clientY: number
  ): { col: number; row: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const effW = Math.round(canvas.width / cameraZoom);
    const effH = Math.round(canvas.height / cameraZoom);
    const scaleX = effW / rect.width;
    const scaleY = effH / rect.height;
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    const worldX = canvasX + Math.floor(camX - effW / 2);
    const worldY = canvasY + Math.floor(camY - effH / 2);

    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(worldY / TILE_SIZE);

    if (col < 0 || col >= activeLevel.width || row < 0 || row >= activeLevel.height) {
      return null;
    }
    return { col, row };
  };

  const getGridCoordsFromMouse = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): { col: number; row: number } | null => {
    return getGridCoordsFromClientPos(e.clientX, e.clientY);
  };

  const applyToolAt = (col: number, row: number) => {
    const isBgEdit = editorLayer === 'background';
    const nextGrid = activeLevel.grid.map((r) => [...r]);
    const nextBgGrid = (
      activeLevel.bgGrid && activeLevel.bgGrid.length === activeLevel.height
        ? activeLevel.bgGrid.map((r) => [...r])
        : Array.from({ length: activeLevel.height }, () =>
            Array(activeLevel.width).fill(TileType.EMPTY)
          )
    );
    let nextP1 = { ...activeLevel.p1Spawn };
    let nextP2 = { ...activeLevel.p2Spawn };

    const setCell = (c: number, r: number, t: TileType) => {
      if (r >= 0 && r < activeLevel.height && c >= 0 && c < activeLevel.width) {
        if (isBgEdit) {
          nextBgGrid[r][c] = t;
        } else {
          nextGrid[r][c] = t;
        }
      }
    };

    if (toolMode === 'erase') {
      setCell(col, row, TileType.EMPTY);
    } else if (toolMode === 'brush') {
      if (selectedTile === TileType.SPAWN_P1 && !isBgEdit) {
        // Clear old P1 spawn marker
        for (let r = 0; r < activeLevel.height; r++) {
          for (let c = 0; c < activeLevel.width; c++) {
            if (nextGrid[r][c] === TileType.SPAWN_P1) nextGrid[r][c] = TileType.EMPTY;
          }
        }
        nextP1 = { x: col, y: row };
        setCell(col, row, selectedTile);
      } else if (selectedTile === TileType.SPAWN_P2 && !isBgEdit) {
        for (let r = 0; r < activeLevel.height; r++) {
          for (let c = 0; c < activeLevel.width; c++) {
            if (nextGrid[r][c] === TileType.SPAWN_P2) nextGrid[r][c] = TileType.EMPTY;
          }
        }
        nextP2 = { x: col, y: row };
        setCell(col, row, selectedTile);
      } else if (selectedTile === TileType.ONE_WAY_DOOR && !isBgEdit) {
        // Place a 3-block-tall One-Way Door column anchored at (col, row)
        setCell(col, row, TileType.ONE_WAY_DOOR);
        setCell(col, row - 1, TileType.ONE_WAY_DOOR);
        setCell(col, row - 2, TileType.ONE_WAY_DOOR);
      } else {
        setCell(col, row, selectedTile);
      }
    } else if (toolMode === 'stamp_hill_up') {
      // Stamp a 6-tile smooth slope up with deep soil underneath
      let cx = col;
      let cy = row;
      for (let i = 0; i < 3; i++) {
        setCell(cx, cy, TileType.SLOPE_UP_LOW);
        setCell(cx + 1, cy, TileType.SLOPE_UP_HIGH);
        for (let fillY = cy + 1; fillY < Math.min(activeLevel.height, cy + 7); fillY++) {
          setCell(cx, fillY, TileType.GROUND_DEEP);
          setCell(cx + 1, fillY, TileType.GROUND_DEEP);
        }
        cx += 2;
        cy -= 1;
      }
    } else if (toolMode === 'stamp_hill_down') {
      let cx = col;
      let cy = row;
      for (let i = 0; i < 3; i++) {
        setCell(cx, cy, TileType.SLOPE_DOWN_HIGH);
        setCell(cx + 1, cy, TileType.SLOPE_DOWN_LOW);
        for (let fillY = cy + 1; fillY < Math.min(activeLevel.height, cy + 7); fillY++) {
          setCell(cx, fillY, TileType.GROUND_DEEP);
          setCell(cx + 1, fillY, TileType.GROUND_DEEP);
        }
        cx += 2;
        cy += 1;
      }
    } else if (toolMode === 'stamp_ring_arc') {
      const offsets = [
        [0, 0],
        [1, -1],
        [2, -2],
        [3, -2],
        [4, -1],
        [5, 0],
      ];
      offsets.forEach(([dx, dy]) => setCell(col + dx, row + dy, TileType.RING));
    } else if (toolMode === 'stamp_loop_runway') {
      // Flat 12-tile runway + booster + 360 loop-de-loop
      for (let x = col; x < col + 12; x++) {
        setCell(x, row, TileType.GROUND_TOP);
        for (let y = row + 1; y < Math.min(activeLevel.height, row + 5); y++) {
          setCell(x, y, TileType.GROUND_DEEP);
        }
      }
      setCell(col + 1, row - 1, TileType.BOOSTER_RIGHT);
      setCell(col + 3, row - 6, TileType.LOOP_HEAD);
      setCell(col + 5, row - 3, TileType.RING);
      setCell(col + 6, row - 3, TileType.RING);
      setCell(col + 7, row - 3, TileType.RING);
    }

    onUpdateLevel({
      ...activeLevel,
      grid: nextGrid,
      bgGrid: nextBgGrid,
      p1Spawn: nextP1,
      p2Spawn: nextP2,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.button === 2 || e.shiftKey || toolMode === 'pan_camera') {
      setIsPanning(true);
      setPanOrigin({ x: e.clientX, y: e.clientY, cx: camX, cy: camY });
      return;
    }

    const cell = getGridCoordsFromMouse(e);
    if (!cell) return;

    if (toolMode === 'ground_rect') {
      setRectStart(cell);
      return;
    }

    setIsDraggingPaint(true);
    lastSwipedCellRef.current = `${cell.col},${cell.row}`;
    applyToolAt(cell.col, cell.row);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const dx = (e.clientX - panOrigin.x) / cameraZoom;
      const dy = (e.clientY - panOrigin.y) / cameraZoom;
      const maxW = activeLevel.width * TILE_SIZE;
      const maxH = activeLevel.height * TILE_SIZE;
      setCamX(Math.max(160, Math.min(maxW - 160, panOrigin.cx - dx)));
      setCamY(Math.max(120, Math.min(maxH - 120, panOrigin.cy - dy)));
      return;
    }

    const cell = getGridCoordsFromMouse(e);
    setHoverCell(cell);

    if (isDraggingPaint && cell && (toolMode === 'brush' || toolMode === 'erase')) {
      const cellKey = `${cell.col},${cell.row}`;
      if (
        cellKey !== lastSwipedCellRef.current &&
        selectedTile !== TileType.LOOP_HEAD &&
        selectedTile !== TileType.ONE_WAY_DOOR
      ) {
        lastSwipedCellRef.current = cellKey;
        applyToolAt(cell.col, cell.row);
      }
    }
  };

  const handleMouseUp = () => {
    if (toolMode === 'ground_rect' && rectStart && hoverCell) {
      const minC = Math.min(rectStart.col, hoverCell.col);
      const maxC = Math.max(rectStart.col, hoverCell.col);
      const minR = Math.min(rectStart.row, hoverCell.row);
      const maxR = Math.max(rectStart.row, hoverCell.row);

      if (editorLayer === 'background') {
        const nextBgGrid = (
          activeLevel.bgGrid && activeLevel.bgGrid.length === activeLevel.height
            ? activeLevel.bgGrid.map((r) => [...r])
            : Array.from({ length: activeLevel.height }, () =>
                Array(activeLevel.width).fill(TileType.EMPTY)
              )
        );
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            nextBgGrid[r][c] = selectedTile || TileType.BG_BRICK;
          }
        }
        onUpdateLevel({ ...activeLevel, bgGrid: nextBgGrid });
      } else {
        const nextGrid = activeLevel.grid.map((r) => [...r]);
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            nextGrid[r][c] = r === minR ? TileType.GROUND_TOP : TileType.GROUND_DEEP;
          }
        }
        onUpdateLevel({ ...activeLevel, grid: nextGrid });
      }
    }
    setRectStart(null);
    setIsDraggingPaint(false);
    setIsPanning(false);
    lastSwipedCellRef.current = null;
  };

  // Mobile Touch Support: Swipe-to-Place Mode & Touch Camera Panning!
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length >= 2 || !swipeToPlaceMode || toolMode === 'pan_camera') {
      const t = e.touches[0];
      setIsPanning(true);
      setPanOrigin({ x: t.clientX, y: t.clientY, cx: camX, cy: camY });
      return;
    }

    const t = e.touches[0];
    const cell = getGridCoordsFromClientPos(t.clientX, t.clientY);
    if (!cell) return;
    setHoverCell(cell);

    if (toolMode === 'ground_rect') {
      setRectStart(cell);
      return;
    }

    setIsDraggingPaint(true);
    lastSwipedCellRef.current = `${cell.col},${cell.row}`;
    applyToolAt(cell.col, cell.row);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isPanning || e.touches.length >= 2 || !swipeToPlaceMode || toolMode === 'pan_camera') {
      const t = e.touches[0];
      if (!t) return;
      const dx = (t.clientX - panOrigin.x) / cameraZoom;
      const dy = (t.clientY - panOrigin.y) / cameraZoom;
      const maxW = activeLevel.width * TILE_SIZE;
      const maxH = activeLevel.height * TILE_SIZE;
      setCamX(Math.max(160, Math.min(maxW - 160, panOrigin.cx - dx)));
      setCamY(Math.max(120, Math.min(maxH - 120, panOrigin.cy - dy)));
      return;
    }

    const t = e.touches[0];
    if (!t) return;
    const cell = getGridCoordsFromClientPos(t.clientX, t.clientY);
    setHoverCell(cell);

    if (isDraggingPaint && cell && (toolMode === 'brush' || toolMode === 'erase')) {
      const cellKey = `${cell.col},${cell.row}`;
      if (
        cellKey !== lastSwipedCellRef.current &&
        selectedTile !== TileType.LOOP_HEAD &&
        selectedTile !== TileType.ONE_WAY_DOOR
      ) {
        lastSwipedCellRef.current = cellKey;
        applyToolAt(cell.col, cell.row);
      }
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const jumpCameraToGoal = () => {
    for (let r = 0; r < activeLevel.height; r++) {
      for (let c = 0; c < activeLevel.width; c++) {
        if (activeLevel.grid[r][c] === TileType.GOAL_POST) {
          setCamX(Math.max(200, c * TILE_SIZE));
          setCamY(Math.max(160, r * TILE_SIZE - 40));
          return;
        }
      }
    }
    setCamX(Math.max(200, (activeLevel.width - 12) * TILE_SIZE));
  };

  const handleCreateNewLevel = () => {
    const width = 160;
    const height = 32;
    const grid = Array.from({ length: height }, () => Array(width).fill(TileType.EMPTY));
    // Create starter ground floor and goal post
    for (let x = 0; x < 48; x++) {
      grid[24][x] = TileType.GROUND_TOP;
      for (let y = 25; y < height; y++) grid[y][x] = TileType.GROUND_DEEP;
    }
    grid[23][4] = TileType.SPAWN_P1;
    grid[23][2] = TileType.SPAWN_P2;
    grid[23][42] = TileType.GOAL_POST;

    const newLevel: LevelData = {
      id: `custom-act-${Date.now().toString().slice(-4)}`,
      name: `Custom Zone`,
      act: levels.length + 1,
      author: 'Level Designer',
      width,
      height,
      tilesetId: activeTileset.id,
      grid,
      p1Spawn: { x: 4, y: 22 },
      p2Spawn: { x: 2, y: 22 },
    };
    onCreateLevel(newLevel);
    onSelectLevel(newLevel.id);
  };

  const handleResizeLevel = (newWidth: number, newHeight: number = activeLevel.height) => {
    const clampedW = Math.max(64, Math.min(640, Math.round(newWidth)));
    const clampedH = Math.max(24, Math.min(255, Math.round(newHeight)));
    if (clampedW === activeLevel.width && clampedH === activeLevel.height) return;

    const nextGrid: number[][] = Array.from({ length: clampedH }, (_, r) =>
      Array.from({ length: clampedW }, (__, c) => {
        if (r < activeLevel.height && c < activeLevel.width) {
          return activeLevel.grid[r][c];
        }
        return TileType.EMPTY;
      })
    );

    const nextBgGrid: number[][] = Array.from({ length: clampedH }, (_, r) =>
      Array.from({ length: clampedW }, (__, c) => {
        if (
          activeLevel.bgGrid &&
          r < activeLevel.bgGrid.length &&
          c < (activeLevel.bgGrid[r]?.length || 0)
        ) {
          return activeLevel.bgGrid[r][c];
        }
        return TileType.EMPTY;
      })
    );

    const maxScrollX = Math.max(300, clampedW * TILE_SIZE - 300);
    const maxScrollY = Math.max(160, clampedH * TILE_SIZE - 160);
    setCamX((prev) => Math.min(prev, maxScrollX));
    setCamY((prev) => Math.min(prev, maxScrollY));

    onUpdateLevel({
      ...activeLevel,
      width: clampedW,
      height: clampedH,
      grid: nextGrid,
      bgGrid: nextBgGrid,
    });
  };

  const handleExportLevel = () => {
    onExportStagePackage(activeLevel.id);
  };

  const handleImportLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onImportStagePackage(String(reader.result));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-[1420px] mx-auto px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Sidebar: Level Selector, Tileset Binding, & Tile Palette */}
      <div className="lg:col-span-3 space-y-4">
        {/* Stage & Tileset Configuration */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Stage Blueprint</h2>
            <button
              onClick={handleCreateNewLevel}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Stage
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Active Level</label>
              <select
                value={activeLevel.id}
                onChange={(e) => onSelectLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#0B0F19] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {levels
                  .filter(
                    (lvl) =>
                      lvl.id !== 'broken-test-01' ||
                      activeLevel.id === 'broken-test-01'
                  )
                  .map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.id === 'broken-test-01'
                        ? 'Broken Test 01'
                        : `${lvl.name} — Act ${lvl.act}`}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Zone Title</label>
                <input
                  type="text"
                  value={activeLevel.name}
                  onChange={(e) =>
                    onUpdateLevel({ ...activeLevel, name: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-[#0B0F19] border border-slate-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Act #</label>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={activeLevel.act}
                  onChange={(e) =>
                    onUpdateLevel({
                      ...activeLevel,
                      act: Math.max(1, Number(e.target.value) || 1),
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-[#0B0F19] border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Assigned Custom / Zone Tileset
              </label>
              <select
                value={activeLevel.tilesetId}
                onChange={(e) =>
                  onUpdateLevel({ ...activeLevel, tilesetId: e.target.value })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-[#0B0F19] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {tilesets.map((ts) => (
                  <option key={ts.id} value={ts.id}>
                    {ts.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Width (X) & Height / Y Limit (up to 255 Tiles) Controls */}
            <div className="pt-1 space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Level Width / X (Tiles)</span>
                  <span className="font-mono text-blue-400 font-semibold">
                    {activeLevel.width} cols ({activeLevel.width * TILE_SIZE}px)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleResizeLevel(activeLevel.width - 32, activeLevel.height)}
                    disabled={activeLevel.width <= 64}
                    className="px-2 py-1 text-xs font-mono bg-[#0B0F19] hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded text-slate-300 cursor-pointer"
                    title="Decrease Level Width by 32 Tiles"
                  >
                    -32
                  </button>
                  <input
                    type="number"
                    min={64}
                    max={640}
                    step={16}
                    value={activeLevel.width}
                    onChange={(e) =>
                      handleResizeLevel(Number(e.target.value) || activeLevel.width, activeLevel.height)
                    }
                    className="w-full px-2 py-1 text-xs text-center font-mono bg-[#0B0F19] border border-slate-800 rounded text-white"
                  />
                  <button
                    onClick={() => handleResizeLevel(activeLevel.width + 32, activeLevel.height)}
                    disabled={activeLevel.width >= 640}
                    className="px-2 py-1 text-xs font-mono bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 rounded text-blue-300 font-semibold cursor-pointer"
                    title="Increase Level Width by 32 Tiles"
                  >
                    +32
                  </button>
                  <button
                    onClick={() => handleResizeLevel(activeLevel.width + 64, activeLevel.height)}
                    disabled={activeLevel.width >= 640}
                    className="px-2 py-1 text-xs font-mono bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold cursor-pointer"
                    title="Increase Level Width by 64 Tiles"
                  >
                    +64
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Level Height / Y Limit (Max 255)</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {activeLevel.height} / 255 rows ({activeLevel.height * TILE_SIZE}px)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleResizeLevel(activeLevel.width, activeLevel.height - 16)}
                    disabled={activeLevel.height <= 24}
                    className="px-2 py-1 text-xs font-mono bg-[#0B0F19] hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded text-slate-300 cursor-pointer"
                    title="Decrease Level Height by 16 Tiles"
                  >
                    -16
                  </button>
                  <input
                    type="number"
                    min={24}
                    max={255}
                    step={1}
                    value={activeLevel.height}
                    onChange={(e) =>
                      handleResizeLevel(activeLevel.width, Number(e.target.value) || activeLevel.height)
                    }
                    className="w-full px-2 py-1 text-xs text-center font-mono bg-[#0B0F19] border border-slate-800 rounded text-white"
                  />
                  <button
                    onClick={() => handleResizeLevel(activeLevel.width, activeLevel.height + 32)}
                    disabled={activeLevel.height >= 255}
                    className="px-2 py-1 text-xs font-mono bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 rounded text-emerald-300 font-semibold cursor-pointer"
                    title="Increase Level Height by 32 Tiles"
                  >
                    +32
                  </button>
                  <button
                    onClick={() => handleResizeLevel(activeLevel.width, 255)}
                    disabled={activeLevel.height >= 255}
                    className="px-2 py-1 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded text-white font-semibold cursor-pointer"
                    title="Set Level Height to Maximum 255 Y Limit"
                  >
                    255
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportLevel}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/35 text-blue-200 border border-blue-500/40 rounded-md transition-colors cursor-pointer"
                title="Export Custom Stage + Edited Tile Textures + Edited SFX & BGM Sounds"
              >
                <Download className="w-3.5 h-3.5" />
                Export Stage
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-200 border border-emerald-500/40 rounded-md transition-colors cursor-pointer"
                title="Import Custom Stage + All Edited Textures & Sounds"
              >
                <Upload className="w-3.5 h-3.5" />
                Import Stage
              </button>
              {levels.length > 1 && activeLevel.id !== 'death-egg-zone' && (
                <button
                  onClick={() => onDeleteLevel(activeLevel.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-md transition-colors cursor-pointer"
                  title="Delete stage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.stage.json"
                onChange={handleImportLevel}
                className="hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Exports &amp; imports stage layout alongside all edited tile textures and custom SFX sounds.
            </p>
          </div>
        </div>

        {/* Tool Mode, Layer Switcher, Mobile Swipe-to-Place & Sonic Prefab Stamps */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300">
              Brush, Layer &amp; Touch Tools
            </h3>
            <button
              onClick={() => setSwipeToPlaceMode((v) => !v)}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-md border transition-colors cursor-pointer ${
                swipeToPlaceMode
                  ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300'
                  : 'bg-[#0B0F19] border-slate-700 text-slate-400'
              }`}
              title="Toggle Mobile Touch Swipe-to-Place Mode (Swipe finger across canvas to place tiles continuously)"
            >
              <Smartphone className="w-3 h-3" />
              <span>Swipe Place: {swipeToPlaceMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Foreground vs Background Layer Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0B0F19] rounded-lg border border-slate-800">
            <button
              onClick={() => setEditorLayer('foreground')}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                editorLayer === 'foreground'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Foreground Layer
            </button>
            <button
              onClick={() => setEditorLayer('background')}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                editorLayer === 'background'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Place ANY tile into the Background Layer so it renders behind foreground tiles and players!"
            >
              Background (Behind)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setToolMode('brush')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                toolMode === 'brush'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Tile Brush</span>
            </button>
            <button
              onClick={() => setToolMode('erase')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                toolMode === 'erase'
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Eraser className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Eraser</span>
            </button>
            <button
              onClick={() => setToolMode('pan_camera')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                toolMode === 'pan_camera'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              title="Drag canvas with finger or mouse to pan the camera"
            >
              <Hand className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Pan Camera</span>
            </button>
            <button
              onClick={() => setToolMode('ground_rect')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                toolMode === 'ground_rect'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Square className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Ground Box</span>
            </button>
            <button
              onClick={() => setToolMode('stamp_ring_arc')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                toolMode === 'stamp_ring_arc'
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Ring Arc</span>
            </button>
            <button
              onClick={() => setToolMode('stamp_hill_up')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                toolMode === 'stamp_hill_up'
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="truncate">↗ Slope Hill Up</span>
            </button>
            <button
              onClick={() => setToolMode('stamp_hill_down')}
              className={`col-span-2 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                toolMode === 'stamp_hill_down'
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="truncate">↘ Slope Hill Down</span>
            </button>
            <button
              onClick={() => setToolMode('stamp_loop_runway')}
              className={`col-span-2 flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                toolMode === 'stamp_loop_runway'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-[#0B0F19] border-slate-800 text-blue-400 hover:border-blue-500/60'
              }`}
            >
              <span>Stamp: Full 360° Loop-de-Loop Runway</span>
            </button>
          </div>
        </div>

        {/* Tile Category & Tile Picker */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#0B0F19] rounded-lg border border-slate-800">
            {(['terrain', 'background', 'gimmicks', 'items', 'badniks', 'custom'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`py-1 text-[11px] font-medium rounded capitalize transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'custom'
                    ? 'White Blocks'
                    : cat === 'background'
                    ? 'BG Tiles'
                    : cat}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
            {PALETTE_ITEMS.filter((item) => item.category === activeCategory).map(
              (item, idx) => {
                const isSelected =
                  toolMode === 'brush' && selectedTile === item.type;
                return (
                  <button
                    key={`${item.category}-${item.type}-${idx}`}
                    onClick={() => {
                      setSelectedTile(item.type);
                      setToolMode('brush');
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-500 text-white'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-sm shrink-0 border border-white/20"
                      style={{ backgroundColor: item.swatch }}
                    />
                    <span className="text-xs font-medium truncate">
                      {item.label}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Level Canvas & Camera Scrubber */}
      <div className="lg:col-span-9 flex flex-col gap-4">
        {/* Editor Toolbar */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <span className="font-semibold text-white">
              {activeLevel.name} · Act {activeLevel.act}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">
              Grid: {activeLevel.width}×{activeLevel.height}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">
              Cursor:{' '}
              {hoverCell ? `X:${hoverCell.col} Y:${hoverCell.row}` : 'Out of bounds'}
            </span>
          </div>

          {/* Horizontal Zone Scrubber & Navigation */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setCamX((x) => Math.max(160, x - (fastPan ? 640 : 240)))}
                className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Pan Left (A / Left Arrow)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCamY((y) => Math.max(120, y - (fastPan ? 480 : 160)))}
                className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Pan Up (W / Up Arrow)"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  setCamY((y) =>
                    Math.min(activeLevel.height * TILE_SIZE - 120, y + (fastPan ? 480 : 160))
                  )
                }
                className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Pan Down (S / Down Arrow)"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  setCamX((x) =>
                    Math.min(activeLevel.width * TILE_SIZE - 160, x + (fastPan ? 640 : 240))
                  )
                }
                className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Pan Right (D / Right Arrow)"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFastPan((f) => !f)}
                className={`px-2 py-1 text-[10px] font-mono font-bold rounded cursor-pointer ${
                  fastPan ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Toggle 3x Fast Camera Pan Speed"
              >
                {fastPan ? '3x PAN' : '1x PAN'}
              </button>
            </div>

            {/* Editor Zoom Controls */}
            <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setCameraZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Zoom Out Camera"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCameraZoom(1.0)}
                className="px-2 py-1 text-[11px] font-mono text-blue-300 hover:text-white cursor-pointer"
                title="Reset Camera Zoom to 100%"
              >
                {Math.round(cameraZoom * 100)}%
              </button>
              <button
                onClick={() => setCameraZoom((z) => Math.min(2.0, Number((z + 0.25).toFixed(2))))}
                className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Zoom In Camera"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setSwipeToPlaceMode((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                swipeToPlaceMode
                  ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-400'
              }`}
              title="Swipe to Place Mode on Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Swipe Place: {swipeToPlaceMode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setShowGrid((g) => !g)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                showGrid
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-400'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Grid
            </button>

            <button
              onClick={handleExportLevel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0B0F19] hover:bg-slate-800 text-blue-300 border border-blue-500/40 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              title="Export Stage Package (Includes Edited Textures & Sounds)"
            >
              <Download className="w-3.5 h-3.5" />
              Export Package
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0B0F19] hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              title="Import Stage Package (Loads Stage + Edited Textures & Sounds)"
            >
              <Upload className="w-3.5 h-3.5" />
              Import Package
            </button>

            <button
              onClick={onTestPlayLevel}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Test Play Stage
            </button>
          </div>
        </div>

        {/* Dedicated Editor Camera Controls & Quick-Jump Bar */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-blue-300">
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Controls:</span>
            </span>
            <button
              onClick={() => {
                setCamX(Math.max(200, activeLevel.p1Spawn.x * TILE_SIZE + 120));
                setCamY(Math.max(160, activeLevel.p1Spawn.y * TILE_SIZE - 32));
              }}
              className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 rounded-md text-slate-200 cursor-pointer"
            >
              Jump to P1 Spawn
            </button>
            <button
              onClick={jumpCameraToGoal}
              className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 rounded-md text-slate-200 cursor-pointer"
            >
              Jump to Goal Sign
            </button>
            <button
              onClick={() => setCamY(200)}
              className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 rounded-md text-sky-300 cursor-pointer"
            >
              High Sky (Top Y)
            </button>
            <button
              onClick={() => setCamY(Math.round((activeLevel.height * TILE_SIZE) / 2))}
              className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 rounded-md text-emerald-300 cursor-pointer"
            >
              Mid Altitude
            </button>
            <button
              onClick={() => setCamY(Math.max(200, activeLevel.height * TILE_SIZE - 220))}
              className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 rounded-md text-amber-300 cursor-pointer"
            >
              Ground Floor (Low Y)
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-slate-400">Tile X:</label>
            <input
              type="number"
              min={0}
              max={activeLevel.width - 1}
              value={Math.round(camX / TILE_SIZE)}
              onChange={(e) =>
                setCamX(
                  Math.max(
                    160,
                    Math.min(
                      activeLevel.width * TILE_SIZE - 160,
                      (Number(e.target.value) || 0) * TILE_SIZE
                    )
                  )
                )
              }
              className="w-16 px-2 py-1 bg-[#0B0F19] border border-slate-700 rounded text-white text-center"
            />
            <label className="text-slate-400">Tile Y:</label>
            <input
              type="number"
              min={0}
              max={activeLevel.height - 1}
              value={Math.round(camY / TILE_SIZE)}
              onChange={(e) =>
                setCamY(
                  Math.max(
                    120,
                    Math.min(
                      activeLevel.height * TILE_SIZE - 120,
                      (Number(e.target.value) || 0) * TILE_SIZE
                    )
                  )
                )
              }
              className="w-16 px-2 py-1 bg-[#0B0F19] border border-slate-700 rounded text-white text-center"
            />
          </div>
        </div>

        {/* Main Interactive Level Canvas (Supports Mobile Touch Swipe-to-Place & Pinch/Drag Pan!) */}
        <div className="relative bg-[#090D16] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-full h-auto block select-none touch-none ${
              toolMode === 'pan_camera' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
            }`}
          />
          {/* Floating On-Canvas Camera D-Pad Overlay for Mobile & Quick Panning */}
          <div className="absolute bottom-3 right-3 bg-slate-950/85 border border-slate-700/80 rounded-xl p-1.5 flex items-center gap-1 shadow-xl backdrop-blur-sm">
            <button
              onClick={() => setCamX((x) => Math.max(160, x - (fastPan ? 512 : 192)))}
              className="p-2 text-slate-200 hover:text-white bg-slate-800/90 hover:bg-blue-600 rounded-lg cursor-pointer"
              title="Camera Left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setCamY((y) => Math.max(120, y - (fastPan ? 384 : 160)))}
                className="p-2 text-slate-200 hover:text-white bg-slate-800/90 hover:bg-blue-600 rounded-lg cursor-pointer"
                title="Camera Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCamY((y) =>
                    Math.min(activeLevel.height * TILE_SIZE - 120, y + (fastPan ? 384 : 160))
                  )
                }
                className="p-2 text-slate-200 hover:text-white bg-slate-800/90 hover:bg-blue-600 rounded-lg cursor-pointer"
                title="Camera Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() =>
                setCamX((x) =>
                  Math.min(activeLevel.width * TILE_SIZE - 160, x + (fastPan ? 512 : 192))
                )
              }
              className="p-2 text-slate-200 hover:text-white bg-slate-800/90 hover:bg-blue-600 rounded-lg cursor-pointer"
              title="Camera Right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal & Vertical Level Scrubber Bar */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl px-4 py-3 space-y-2.5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap w-44">
              Stage X Scroll ({Math.round(camX)} / {activeLevel.width * TILE_SIZE}px)
            </span>
            <input
              type="range"
              min={300}
              max={Math.max(300, activeLevel.width * TILE_SIZE - 300)}
              value={Math.min(camX, Math.max(300, activeLevel.width * TILE_SIZE - 300))}
              onChange={(e) => setCamX(Number(e.target.value))}
              className="flex-1 accent-blue-500 cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleResizeLevel(activeLevel.width + 32, activeLevel.height)}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                +32 Width
              </button>
              <button
                onClick={() => handleResizeLevel(activeLevel.width + 64, activeLevel.height)}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                +64 Width
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap w-44">
              Stage Y Scroll ({Math.round(camY)} / {activeLevel.height * TILE_SIZE}px)
            </span>
            <input
              type="range"
              min={160}
              max={Math.max(160, activeLevel.height * TILE_SIZE - 160)}
              value={Math.min(camY, Math.max(160, activeLevel.height * TILE_SIZE - 160))}
              onChange={(e) => setCamY(Number(e.target.value))}
              className="flex-1 accent-emerald-500 cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleResizeLevel(activeLevel.width, activeLevel.height + 32)}
                disabled={activeLevel.height >= 255}
                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-40 text-emerald-300 border border-emerald-500/30 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                +32 Y Height
              </button>
              <button
                onClick={() => handleResizeLevel(activeLevel.width, 255)}
                disabled={activeLevel.height >= 255}
                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                Max 255 Y
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
