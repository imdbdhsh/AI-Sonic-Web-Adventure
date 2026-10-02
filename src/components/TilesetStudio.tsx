import React, { useRef, useState } from 'react';
import {
  Download,
  Eraser,
  Image as ImageIcon,
  PaintBucket,
  Paintbrush,
  Palette,
  Pipette,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  generateBlankWhiteBlockMatrix,
  generateZonePixelMatrix,
  getDefaultTilePixelMatrix,
} from '../data/presets';
import { invalidateTilesetCache } from '../engine/renderer';
import {
  CustomPixelMatrix,
  EditableTextureKey,
  TilesetConfig,
} from '../types/engine';
import { triggerJsonDownload } from '../utils/exportHelper';

interface TilesetStudioProps {
  tilesets: TilesetConfig[];
  activeTilesetId: string;
  onSelectTileset: (id: string) => void;
  onUpdateTileset: (updated: TilesetConfig) => void;
  onCreateTileset: (newTileset: TilesetConfig) => void;
  onDeleteTileset: (id: string) => void;
}

type TextureCategory = 'white_blocks' | 'terrain' | 'gimmicks' | 'items';

interface TextureSlotMeta {
  key: EditableTextureKey;
  label: string;
  category: TextureCategory;
}

const TEXTURE_SLOTS: TextureSlotMeta[] = [
  // 10 Blank White Blocks
  { key: 'customBlock1', label: 'Blank White Block 1', category: 'white_blocks' },
  { key: 'customBlock2', label: 'Blank White Block 2', category: 'white_blocks' },
  { key: 'customBlock3', label: 'Blank White Block 3', category: 'white_blocks' },
  { key: 'customBlock4', label: 'Blank White Block 4', category: 'white_blocks' },
  { key: 'customBlock5', label: 'Blank White Block 5', category: 'white_blocks' },
  { key: 'customBlock6', label: 'Blank White Block 6', category: 'white_blocks' },
  { key: 'customBlock7', label: 'Blank White Block 7', category: 'white_blocks' },
  { key: 'customBlock8', label: 'Blank White Block 8', category: 'white_blocks' },
  { key: 'customBlock9', label: 'Blank White Block 9', category: 'white_blocks' },
  { key: 'customBlock10', label: 'Blank White Block 10', category: 'white_blocks' },

  // Terrain & Slopes
  { key: 'groundTop', label: 'Ground Surface Cap', category: 'terrain' },
  { key: 'groundDeep', label: 'Deep Checkered Soil', category: 'terrain' },
  { key: 'platform', label: 'One-Way Platform', category: 'terrain' },
  { key: 'oneWayDoor', label: 'One-Way Door (Open)', category: 'terrain' },
  { key: 'oneWayDoorLocked', label: 'One-Way Door (Solid)', category: 'terrain' },
  { key: 'breakableRock', label: 'Breakable Wall', category: 'terrain' },
  { key: 'decoWaterfall', label: 'Waterfall Decoration', category: 'terrain' },
  { key: 'bgBrick', label: 'BG Castle Brick (Behind)', category: 'terrain' },
  { key: 'bgPillar', label: 'BG Marble Pillar (Behind)', category: 'terrain' },
  { key: 'bgWindow', label: 'BG Tower Window (Behind)', category: 'terrain' },
  { key: 'bgLattice', label: 'BG Sky Girder (Behind)', category: 'terrain' },
  { key: 'bgFoliage', label: 'BG Lush Vines (Behind)', category: 'terrain' },
  { key: 'slopeUpLow', label: '26° Slope Up (A)', category: 'terrain' },
  { key: 'slopeUpHigh', label: '26° Slope Up (B)', category: 'terrain' },
  { key: 'slopeDownHigh', label: '26° Slope Down (A)', category: 'terrain' },
  { key: 'slopeDownLow', label: '26° Slope Down (B)', category: 'terrain' },
  { key: 'slope45Up', label: '45° Steep Slope Up', category: 'terrain' },
  { key: 'slope45Down', label: '45° Steep Slope Down', category: 'terrain' },

  // Gimmicks, Hazards & Springs
  { key: 'spikes', label: 'Hazard Spikes', category: 'gimmicks' },
  { key: 'lava', label: 'Molten Lava', category: 'gimmicks' },
  { key: 'springYellow', label: 'Yellow Spring ↑', category: 'gimmicks' },
  { key: 'springRed', label: 'Red High Spring ↑', category: 'gimmicks' },
  { key: 'springRight', label: 'Side Spring →', category: 'gimmicks' },
  { key: 'springLeft', label: 'Side Spring ←', category: 'gimmicks' },
  { key: 'boosterRight', label: 'Speed Booster →', category: 'gimmicks' },
  { key: 'boosterLeft', label: 'Speed Booster ←', category: 'gimmicks' },
  { key: 'bumper', label: 'Pinball Star Bumper', category: 'gimmicks' },
  { key: 'dashRing', label: 'Rainbow Dash Ring', category: 'gimmicks' },
  { key: 'crusher', label: 'Stomping Crusher', category: 'gimmicks' },
  { key: 'lavaGeyser', label: 'Erupting Lava Geyser', category: 'gimmicks' },
  { key: 'lavaShooterLeft', label: 'Wall Lava Shooter ←', category: 'gimmicks' },
  { key: 'lavaShooterRight', label: 'Wall Lava Shooter →', category: 'gimmicks' },
  { key: 'conveyorRight', label: 'Conveyor Belt →', category: 'gimmicks' },
  { key: 'conveyorLeft', label: 'Conveyor Belt ←', category: 'gimmicks' },
  { key: 'updraft', label: 'Wind Updraft Fan ↑', category: 'gimmicks' },
  { key: 'teleportOrb', label: 'Cloud Warp Cannon', category: 'gimmicks' },
  { key: 'movingPlatform', label: 'Moving Platform', category: 'gimmicks' },
  { key: 'swingingPlatform', label: 'Swinging Platform', category: 'gimmicks' },

  // Rings, Monitors & Markers
  { key: 'ring', label: 'Golden Ring', category: 'items' },
  { key: 'giantRing', label: 'Giant Special Ring', category: 'items' },
  { key: 'monitor1Up', label: 'Monitor: 1-UP Extra Life', category: 'items' },
  { key: 'monitorRing', label: 'Monitor: +10 Rings', category: 'items' },
  { key: 'monitorSpeed', label: 'Monitor: Speed Shoes', category: 'items' },
  { key: 'monitorShield', label: 'Monitor: Blue Shield', category: 'items' },
  { key: 'monitorFlame', label: 'Monitor: Flame Shield', category: 'items' },
  { key: 'monitorLightning', label: 'Monitor: Lightning Shield', category: 'items' },
  { key: 'monitorBubble', label: 'Monitor: Bubble Shield', category: 'items' },
  { key: 'monitorInvincibility', label: 'Monitor: Invincibility', category: 'items' },
  { key: 'monitorEggman', label: 'Monitor: Eggman Trap', category: 'items' },
  { key: 'monitorSwap', label: 'Monitor: Teleport Swap', category: 'items' },
  { key: 'monitorSuper', label: 'Monitor: Super "S"', category: 'items' },
  { key: 'checkpoint', label: 'Star Post Checkpoint', category: 'items' },
  { key: 'goalPost', label: 'Goal Signpost', category: 'items' },
];

const QUICK_SWATCHES = [
  '#FFFFFF',
  '#F8FAFC',
  '#94A3B8',
  '#475569',
  '#0F172A',
  '#22C55E',
  '#86EFAC',
  '#15803D',
  '#B45309',
  '#78350F',
  '#FACC15',
  '#FEF08A',
  '#2563EB',
  '#38BDF8',
  '#9333EA',
  '#EC4899',
  '#EF4444',
  '#F97316',
];

const CUSTOM_SWATCHES_STORAGE_KEY = 'sonic_velocity_custom_color_swatches_v1';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return { r: 34, g: 197, b: 94 };
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return { r: 34, g: 197, b: 94 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export const TilesetStudio: React.FC<TilesetStudioProps> = ({
  tilesets,
  activeTilesetId,
  onSelectTileset,
  onUpdateTileset,
  onCreateTileset,
  onDeleteTileset,
}) => {
  const activeTileset =
    tilesets.find((t) => t.id === activeTilesetId) || tilesets[0];

  const [textureCategory, setTextureCategory] =
    useState<TextureCategory>('white_blocks');
  const [activeTexture, setActiveTexture] =
    useState<EditableTextureKey>('customBlock1');
  const [brushColor, setBrushColor] = useState<string>('#2563EB');
  const [hexDraft, setHexDraft] = useState<string>('#2563EB');
  const [customSwatches, setCustomSwatches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_SWATCHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return ['#10B981', '#06B6D4', '#8B5CF6', '#F43F5E', '#F59E0B', '#E2E8F0'];
  });

  const [tool, setTool] = useState<'brush' | 'bucket' | 'eyedropper' | 'eraser'>(
    'brush'
  );
  const [isPainting, setIsPainting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const selectBrushColor = (color: string) => {
    const normalized = color.startsWith('#') ? color.toUpperCase() : `#${color.toUpperCase()}`;
    setBrushColor(normalized);
    setHexDraft(normalized);
  };

  const handleSaveCustomSwatch = () => {
    const norm = brushColor.toUpperCase();
    if (customSwatches.includes(norm)) return;
    const next = [norm, ...customSwatches].slice(0, 16);
    setCustomSwatches(next);
    try {
      localStorage.setItem(CUSTOM_SWATCHES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota error
    }
  };

  const handleRemoveCustomSwatch = (hex: string) => {
    const next = customSwatches.filter((c) => c !== hex);
    setCustomSwatches(next);
    try {
      localStorage.setItem(CUSTOM_SWATCHES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota error
    }
  };

  const ensurePixelMatrix = (): CustomPixelMatrix => {
    if (activeTileset.customPixels) return activeTileset.customPixels;
    return generateZonePixelMatrix(
      activeTileset.decorStyle,
      activeTileset.palette
    );
  };

  const getSlotMatrix = (key: EditableTextureKey): string[][] => {
    const current = ensurePixelMatrix();
    if (current[key] && Array.isArray(current[key]) && current[key]!.length === 16) {
      return current[key]!;
    }
    return getDefaultTilePixelMatrix(
      key,
      activeTileset.decorStyle,
      activeTileset.palette
    );
  };

  const matrix = getSlotMatrix(activeTexture);
  const rgb = hexToRgb(brushColor);

  const commitSlotMatrix = (key: EditableTextureKey, nextGrid: string[][]) => {
    const currentPixels = ensurePixelMatrix();
    const updated: TilesetConfig = {
      ...activeTileset,
      customPixels: {
        ...currentPixels,
        [key]: nextGrid,
      },
    };
    invalidateTilesetCache(activeTileset.id);
    onUpdateTileset(updated);
  };

  const handlePixelAction = (r: number, c: number) => {
    const targetGrid = getSlotMatrix(activeTexture).map((row) => [...row]);

    if (tool === 'eyedropper') {
      const picked = targetGrid[r][c];
      if (picked) selectBrushColor(picked);
      setTool('brush');
      return;
    }

    if (tool === 'bucket') {
      const targetColor = targetGrid[r][c];
      const replacementColor = brushColor;
      if (targetColor === replacementColor) return;

      const queue: Array<[number, number]> = [[r, c]];
      const visited = new Set<string>();
      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        const k = `${cr},${cc}`;
        if (visited.has(k)) continue;
        visited.add(k);
        if (cr < 0 || cr >= 16 || cc < 0 || cc >= 16) continue;
        if (targetGrid[cr][cc] !== targetColor) continue;
        targetGrid[cr][cc] = replacementColor;
        queue.push([cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]);
      }
      commitSlotMatrix(activeTexture, targetGrid);
      return;
    }

    const newColor = tool === 'eraser' ? '' : brushColor;
    if (targetGrid[r][c] === newColor) return;
    targetGrid[r][c] = newColor;
    commitSlotMatrix(activeTexture, targetGrid);
  };

  const handlePaletteChange = (
    key: keyof TilesetConfig['palette'],
    val: string
  ) => {
    const nextPalette = {
      ...activeTileset.palette,
      [key]: val,
    };
    const regeneratedCore = generateZonePixelMatrix(
      activeTileset.decorStyle,
      nextPalette
    );
    const existingPixels = ensurePixelMatrix();
    const updated: TilesetConfig = {
      ...activeTileset,
      palette: nextPalette,
      customPixels: {
        ...existingPixels,
        groundTop: regeneratedCore.groundTop,
        groundDeep: regeneratedCore.groundDeep,
        platform: regeneratedCore.platform,
        breakableRock: regeneratedCore.breakableRock,
      },
    };
    invalidateTilesetCache(activeTileset.id);
    onUpdateTileset(updated);
  };

  const handleCreateCustom = () => {
    const id = `custom-zone-${Date.now().toString().slice(-4)}`;
    const clonedPixels = ensurePixelMatrix();
    const newTileset: TilesetConfig = {
      ...activeTileset,
      id,
      name: `Custom Zone ${tilesets.length + 1}`,
      zoneSubtitle: 'User-Created Custom 16-Bit Tileset',
      isCustom: true,
      customPixels: JSON.parse(JSON.stringify(clonedPixels)),
    };
    onCreateTileset(newTileset);
    onSelectTileset(id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const updated: TilesetConfig = {
          ...activeTileset,
          uploadedSheetDataUrl: reader.result,
          uploadedTileMapping: activeTileset.uploadedTileMapping || {
            groundTopCol: 0,
            groundTopRow: 0,
            groundDeepCol: 1,
            groundDeepRow: 0,
            platformCol: 2,
            platformRow: 0,
            breakableCol: 3,
            breakableRow: 0,
            tilePixelSize: 16,
          },
        };
        invalidateTilesetCache(activeTileset.id);
        onUpdateTileset(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportTilesetJson = () => {
    const jsonText = JSON.stringify(activeTileset, null, 2);
    triggerJsonDownload(`${activeTileset.id}-tileset.json`, jsonText);
  };

  const handleImportTilesetJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as TilesetConfig;
        if (parsed && parsed.name && parsed.palette) {
          const imported: TilesetConfig = {
            ...parsed,
            id: `imported-${Date.now().toString().slice(-4)}`,
            isCustom: true,
          };
          onCreateTileset(imported);
          onSelectTileset(imported.id);
        }
      } catch {
        // Ignore invalid JSON file
      }
    };
    reader.readAsText(file);
  };

  const activeSlotMeta =
    TEXTURE_SLOTS.find((s) => s.key === activeTexture) || TEXTURE_SLOTS[0];
  const filteredSlots = TEXTURE_SLOTS.filter(
    (s) => s.category === textureCategory
  );

  return (
    <div
      className="max-w-[1420px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6"
      onMouseUp={() => setIsPainting(false)}
    >
      {/* Left Column: Tileset Selector & Complete Zone Atmosphere / Palette Editor */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Zone Tilesets</h2>
              <p className="text-xs text-slate-400">
                Edit any built-in or custom tileset — every tile, block, and color is customizable
              </p>
            </div>
            <button
              onClick={handleCreateCustom}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Tileset
            </button>
          </div>

          <div className="space-y-2">
            {tilesets.map((ts) => {
              const isSelected = ts.id === activeTileset.id;
              return (
                <div
                  key={ts.id}
                  onClick={() => onSelectTileset(ts.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-blue-500 text-white'
                      : 'bg-[#0B0F19]/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded overflow-hidden border border-slate-700 shrink-0 flex flex-col">
                      <div
                        className="h-2.5 w-full"
                        style={{ backgroundColor: ts.palette.surfaceTop }}
                      />
                      <div
                        className="flex-1 w-full grid grid-cols-2"
                        style={{ backgroundColor: ts.palette.soilPrimary }}
                      >
                        <div style={{ backgroundColor: ts.palette.soilSecondary }} />
                      </div>
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold truncate">{ts.name}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {ts.decorStyle} scenery · {ts.isCustom ? 'Custom' : 'Editable Preset'}
                      </div>
                    </div>
                  </div>
                  {ts.isCustom && (
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onDeleteTileset(ts.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete custom tileset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={handleExportTilesetJson}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import JSON
            </button>
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              onChange={handleImportTilesetJson}
              className="hidden"
            />
          </div>
        </div>

        {/* Complete Zone Metadata & Full 13-Color Palette Editor */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white">
            Full Zone Metadata & 13-Color Palette
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Tileset Name
              </label>
              <input
                type="text"
                value={activeTileset.name}
                onChange={(e) =>
                  onUpdateTileset({ ...activeTileset, name: e.target.value })
                }
                className="w-full px-3 py-1.5 text-sm bg-[#0B0F19] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Zone Subtitle
              </label>
              <input
                type="text"
                value={activeTileset.zoneSubtitle}
                onChange={(e) =>
                  onUpdateTileset({
                    ...activeTileset,
                    zoneSubtitle: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-[#0B0F19] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Background Parallax Scenery (All 5 Styles)
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0B0F19] rounded-lg border border-slate-800">
                {(
                  [
                    'palms',
                    'chemical',
                    'marble',
                    'sanctuary',
                    'deathegg',
                  ] as const
                ).map((style) => (
                  <button
                    key={style}
                    onClick={() =>
                      onUpdateTileset({ ...activeTileset, decorStyle: style })
                    }
                    className={`px-2 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                      activeTileset.decorStyle === style
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {style === 'deathegg' ? 'Death Egg' : style}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {(
                [
                  ['surfaceTop', 'Surface Top'],
                  ['surfaceHighlight', 'Top Highlight'],
                  ['soilPrimary', 'Checker Soil A'],
                  ['soilSecondary', 'Checker Soil B'],
                  ['platformTop', 'Platform Cap'],
                  ['brickColor', 'Brick Fill'],
                  ['brickMortar', 'Brick Mortar'],
                  ['hazardColor', 'Hazard Tint'],
                  ['skyTop', 'Sky Zenith'],
                  ['skyBottom', 'Sky Horizon'],
                  ['mountainFar', 'Far Mountains'],
                  ['hillNear', 'Near Hills'],
                  ['waterColor', 'Liquid Horizon'],
                ] as const
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-[#0B0F19] px-2.5 py-1.5 rounded-lg border border-slate-800"
                >
                  <span className="text-[11px] text-slate-300 truncate pr-1.5">
                    {label}
                  </span>
                  <input
                    type="color"
                    value={activeTileset.palette[key]}
                    onChange={(e) => handlePaletteChange(key, e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 shrink-0"
                    title={`${label}: ${activeTileset.palette[key]}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Complete Tile Texture Editor (All 50 Tiles + 10 Blank White Blocks + Custom Color Picker) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Complete 16×16 Tile & Blank White Block Texture Editor
              </h2>
              <p className="text-xs text-slate-400">
                Edit everything in this tileset: all 10 Blank White Blocks, terrain, slopes, springs, hazards, gimmicks, rings, and monitors
              </p>
            </div>

            {/* Category Tabs for All Editable Tiles */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0B0F19] rounded-lg border border-slate-800">
              {(
                [
                  ['white_blocks', '10 Blank White Blocks'],
                  ['terrain', 'Terrain & Slopes (11)'],
                  ['gimmicks', 'Gimmicks & Hazards (18)'],
                  ['items', 'Rings & Monitors (15)'],
                ] as const
              ).map(([catKey, catLabel]) => (
                <button
                  key={catKey}
                  onClick={() => {
                    setTextureCategory(catKey);
                    const firstInCat = TEXTURE_SLOTS.find(
                      (s) => s.category === catKey
                    );
                    if (firstInCat) setActiveTexture(firstInCat.key);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    textureCategory === catKey
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {catLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Slot Selector Grid within Active Category */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 bg-[#0B0F19]/70 rounded-xl border border-slate-800/80">
            {filteredSlots.map((slot) => {
              const isSelected = activeTexture === slot.key;
              const slotPreview = getSlotMatrix(slot.key);
              const sampleColor =
                slotPreview[4]?.[4] ||
                slotPreview[8]?.[8] ||
                (slot.key.startsWith('customBlock') ? '#FFFFFF' : '#38BDF8');

              return (
                <button
                  key={slot.key}
                  onClick={() => setActiveTexture(slot.key)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/25 border-blue-500 text-white'
                      : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-sm shrink-0 border border-slate-600"
                    style={{ backgroundColor: sampleColor }}
                  />
                  <span className="text-xs font-medium truncate">
                    {slot.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* 16x16 Interactive Pixel Canvas */}
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="mb-2 flex items-center justify-between w-full max-w-[320px] text-xs">
                <span className="font-bold text-white">
                  Editing: {activeSlotMeta.label}
                </span>
                <span className="font-mono text-slate-400">16×16 px</span>
              </div>
              <div
                className="grid grid-cols-16 border-2 border-slate-700 rounded-lg overflow-hidden shadow-inner bg-[#090D16] select-none touch-none"
                style={{ width: 320, height: 320 }}
                onMouseLeave={() => setIsPainting(false)}
              >
                {matrix.map((row, rIdx) =>
                  row.map((hex, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onMouseDown={() => {
                        setIsPainting(true);
                        handlePixelAction(rIdx, cIdx);
                      }}
                      onMouseEnter={() => {
                        if (isPainting && tool !== 'bucket') {
                          handlePixelAction(rIdx, cIdx);
                        }
                      }}
                      className="w-5 h-5 border-[0.5px] border-slate-800/40 cursor-crosshair"
                      style={{
                        backgroundColor: hex || 'transparent',
                        backgroundImage: !hex
                          ? 'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%)'
                          : undefined,
                        backgroundSize: '8px 8px',
                      }}
                    />
                  ))
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 w-full max-w-[320px]">
                <button
                  onClick={() =>
                    commitSlotMatrix(
                      activeTexture,
                      generateBlankWhiteBlockMatrix()
                    )
                  }
                  className="px-2.5 py-1.5 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Fill Blank White (#FFFFFF)
                </button>
                <button
                  onClick={() =>
                    commitSlotMatrix(
                      activeTexture,
                      Array.from({ length: 16 }, () =>
                        Array.from({ length: 16 }, () => brushColor)
                      )
                    )
                  }
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Fill Active Color
                </button>
                <button
                  onClick={() =>
                    commitSlotMatrix(
                      activeTexture,
                      getDefaultTilePixelMatrix(
                        activeTexture,
                        activeTileset.decorStyle,
                        activeTileset.palette
                      )
                    )
                  }
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer"
                >
                  Reset Tile Default
                </button>
              </div>
            </div>

            {/* Drawing Tools & Full Custom Color Selector */}
            <div className="md:col-span-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Drawing Tool
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setTool('brush')}
                    className={`flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      tool === 'brush'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Paintbrush className="w-3.5 h-3.5" />
                    Brush
                  </button>
                  <button
                    onClick={() => setTool('bucket')}
                    className={`flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      tool === 'bucket'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <PaintBucket className="w-3.5 h-3.5" />
                    Fill
                  </button>
                  <button
                    onClick={() => setTool('eyedropper')}
                    className={`flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      tool === 'eyedropper'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Pipette className="w-3.5 h-3.5" />
                    Pick
                  </button>
                  <button
                    onClick={() => setTool('eraser')}
                    className={`flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      tool === 'eraser'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    Erase
                  </button>
                </div>
              </div>

              {/* Custom Color Selector Box (Picker + Hex Input + RGB Sliders + Custom Swatches) */}
              <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Palette className="w-3.5 h-3.5 text-blue-400" />
                    <span>Custom Color Selector</span>
                  </div>
                  <button
                    onClick={handleSaveCustomSwatch}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Save Custom Color
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => {
                      selectBrushColor(e.target.value);
                      if (tool === 'eraser') setTool('brush');
                    }}
                    className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-700 shrink-0"
                    title="Click to open Custom Color Wheel"
                  />
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-400 mb-0.5">
                      Custom Hex Code (#RRGGBB)
                    </label>
                    <input
                      type="text"
                      value={hexDraft}
                      maxLength={7}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHexDraft(val);
                        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                          setBrushColor(val.toUpperCase());
                          if (tool === 'eraser') setTool('brush');
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#131B2E] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Custom RGB Sliders */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-4 font-mono text-rose-400 font-bold">R</span>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={rgb.r}
                      onChange={(e) => {
                        selectBrushColor(
                          rgbToHex(Number(e.target.value), rgb.g, rgb.b)
                        );
                        if (tool === 'eraser') setTool('brush');
                      }}
                      className="flex-1 accent-rose-500 cursor-pointer"
                    />
                    <span className="w-7 text-right font-mono text-slate-300">
                      {rgb.r}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 font-mono text-emerald-400 font-bold">
                      G
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={rgb.g}
                      onChange={(e) => {
                        selectBrushColor(
                          rgbToHex(rgb.r, Number(e.target.value), rgb.b)
                        );
                        if (tool === 'eraser') setTool('brush');
                      }}
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <span className="w-7 text-right font-mono text-slate-300">
                      {rgb.g}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 font-mono text-sky-400 font-bold">B</span>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={rgb.b}
                      onChange={(e) => {
                        selectBrushColor(
                          rgbToHex(rgb.r, rgb.g, Number(e.target.value))
                        );
                        if (tool === 'eraser') setTool('brush');
                      }}
                      className="flex-1 accent-sky-500 cursor-pointer"
                    />
                    <span className="w-7 text-right font-mono text-slate-300">
                      {rgb.b}
                    </span>
                  </div>
                </div>

                {/* User's Saved Custom Colors */}
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Saved Custom Colors (Click to use, Double-click to remove)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {customSwatches.map((hex) => (
                      <button
                        key={hex}
                        onClick={() => {
                          selectBrushColor(hex);
                          if (tool === 'eraser') setTool('brush');
                        }}
                        onDoubleClick={() => handleRemoveCustomSwatch(hex)}
                        className={`w-6 h-6 rounded border transition-transform cursor-pointer ${
                          brushColor.toLowerCase() === hex.toLowerCase()
                            ? 'border-white scale-110 ring-1 ring-blue-400'
                            : 'border-slate-700'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={`${hex} (Double-click to remove)`}
                      />
                    ))}
                  </div>
                </div>

                {/* Preset Swatches */}
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  <span className="block text-[10px] text-slate-400">
                    16-Bit Preset Swatches
                  </span>
                  <div className="grid grid-cols-9 gap-1.5">
                    {QUICK_SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        onClick={() => {
                          selectBrushColor(hex);
                          if (tool === 'eraser') setTool('brush');
                        }}
                        className={`w-6 h-6 rounded border transition-transform cursor-pointer ${
                          brushColor.toLowerCase() === hex.toLowerCase()
                            ? 'border-white scale-110'
                            : 'border-slate-700'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    const fresh = generateZonePixelMatrix(
                      activeTileset.decorStyle,
                      activeTileset.palette
                    );
                    invalidateTilesetCache(activeTileset.id);
                    onUpdateTileset({
                      ...activeTileset,
                      customPixels: fresh,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Entire Tileset to Default Zone Patterns
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* External Sprite Sheet / Tile Image Uploader */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Custom PNG / WebP Sprite Sheet Importer
              </h3>
              <p className="text-xs text-slate-400">
                Upload an external tile sheet image to override procedural pixel matrices with your own bitmap artwork
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeTileset.uploadedSheetDataUrl && (
                <button
                  onClick={() => {
                    invalidateTilesetCache(activeTileset.id);
                    onUpdateTileset({
                      ...activeTileset,
                      uploadedSheetDataUrl: undefined,
                    });
                  }}
                  className="px-3 py-2 text-xs font-medium bg-rose-950/60 hover:bg-rose-900/70 text-rose-200 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  Clear Uploaded Sheet
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                Upload Tile Sheet Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/webp,image/jpeg"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {activeTileset.uploadedSheetDataUrl &&
            activeTileset.uploadedTileMapping && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div className="bg-[#0B0F19] p-3 rounded-lg border border-slate-800 flex flex-col items-center justify-center">
                  <img
                    src={activeTileset.uploadedSheetDataUrl}
                    alt="Uploaded custom tileset sheet"
                    referrerPolicy="no-referrer"
                    className="max-h-36 object-contain pixelated border border-slate-700"
                  />
                  <span className="mt-2 text-xs text-slate-400">
                    Active Bitmap Tile Sheet Loaded
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Source Tile Size (px)
                    </label>
                    <input
                      type="number"
                      min={8}
                      max={128}
                      value={activeTileset.uploadedTileMapping.tilePixelSize}
                      onChange={(e) =>
                        onUpdateTileset({
                          ...activeTileset,
                          uploadedTileMapping: {
                            ...activeTileset.uploadedTileMapping!,
                            tilePixelSize: Math.max(
                              8,
                              Number(e.target.value) || 16
                            ),
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-[#0B0F19] border border-slate-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Ground Top (Col, Row)
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min={0}
                        value={activeTileset.uploadedTileMapping.groundTopCol}
                        onChange={(e) =>
                          onUpdateTileset({
                            ...activeTileset,
                            uploadedTileMapping: {
                              ...activeTileset.uploadedTileMapping!,
                              groundTopCol: Number(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-2 py-1.5 bg-[#0B0F19] border border-slate-800 rounded text-white font-mono"
                      />
                      <input
                        type="number"
                        min={0}
                        value={activeTileset.uploadedTileMapping.groundTopRow}
                        onChange={(e) =>
                          onUpdateTileset({
                            ...activeTileset,
                            uploadedTileMapping: {
                              ...activeTileset.uploadedTileMapping!,
                              groundTopRow: Number(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-2 py-1.5 bg-[#0B0F19] border border-slate-800 rounded text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Deep Soil (Col, Row)
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min={0}
                        value={activeTileset.uploadedTileMapping.groundDeepCol}
                        onChange={(e) =>
                          onUpdateTileset({
                            ...activeTileset,
                            uploadedTileMapping: {
                              ...activeTileset.uploadedTileMapping!,
                              groundDeepCol: Number(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-2 py-1.5 bg-[#0B0F19] border border-slate-800 rounded text-white font-mono"
                      />
                      <input
                        type="number"
                        min={0}
                        value={activeTileset.uploadedTileMapping.groundDeepRow}
                        onChange={(e) =>
                          onUpdateTileset({
                            ...activeTileset,
                            uploadedTileMapping: {
                              ...activeTileset.uploadedTileMapping!,
                              groundDeepRow: Number(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-2 py-1.5 bg-[#0B0F19] border border-slate-800 rounded text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
