import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  ChevronRight,
  Crosshair,
  Download,
  Eraser,
  Eye,
  Heart,
  Layers,
  Move,
  Paintbrush,
  Plus,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Swords,
  Target,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import {
  BOSS_PRESETS,
  createDefaultBossPixelMatrix,
  createEmptyBossPixelMatrix,
  DEFAULT_BOSS_HITBOX,
} from '../data/bossPresets';
import {
  BossAttackType,
  BossHitboxConfig,
  BossMovementAI,
  BossTexturePreset,
  CustomBossConfig,
  LevelData,
  TileType,
} from '../types/engine';
import { triggerJsonDownload } from '../utils/exportHelper';

interface BossEditorProps {
  level: LevelData;
  onUpdateLevel: (updated: LevelData) => void;
  onClose?: () => void;
}

const PALETTE_SWATCHES = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#F8FAFC', '#94A3B8',
  '#1E293B', '#020617', '#EAB308', '#7E22CE', '#0284C7'
];

export const BossEditor: React.FC<BossEditorProps> = ({
  level,
  onUpdateLevel,
  onClose,
}) => {
  // Load custom boss from current level or default to Silver Sonic with clean empty texture
  const [boss, setBoss] = useState<CustomBossConfig>(() => {
    if (level.customBosses && level.customBosses.length > 0) {
      const existing = level.customBosses[0];
      return {
        ...existing,
        customPixels: existing.customPixels || createEmptyBossPixelMatrix(),
        hitbox: existing.hitbox ? { ...existing.hitbox } : { ...DEFAULT_BOSS_HITBOX },
      };
    }
    return {
      ...BOSS_PRESETS.silversonic,
      customPixels: createEmptyBossPixelMatrix(),
      hitbox: { ...DEFAULT_BOSS_HITBOX },
    };
  });

  const [activeTab, setActiveTab] = useState<'attributes' | 'attachments' | 'hitbox' | 'visuals' | 'pixels'>('attributes');
  const [showHitboxOverlay, setShowHitboxOverlay] = useState<boolean>(true);
  const [selectedPixelColor, setSelectedPixelColor] = useState<string>('#38BDF8');
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [previewTick, setPreviewTick] = useState<number>(0);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Animation ticker for interactive preview canvas
  useEffect(() => {
    let animId: number;
    const loop = () => {
      setPreviewTick((t) => (t + 1) % 720);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw Interactive Boss Preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark grid background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, w, h);

    // Subtle arena guide lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Floor line
    const floorY = h - 28;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(w, floorY);
    ctx.stroke();

    // Center boss position with dynamic movement animation
    const scale = boss.scale || 1.0;
    const cx = w * 0.5;
    let cy = floorY - 60 * scale;

    if (boss.movementAI === 'silversonic_dash') {
      const cycle = previewTick % 120;
      if (cycle < 60) {
        cy += Math.sin(cycle * 0.2) * 3;
      } else {
        cy -= Math.sin(((cycle - 60) / 60) * Math.PI) * 45;
      }
    } else if (boss.movementAI === 'deathegg_mech') {
      cy += Math.sin(previewTick * 0.1) * 4;
    } else if (boss.movementAI === 'bounce_frenzy') {
      cy += Math.sin(previewTick * 0.15) * 20;
    } else {
      cy += Math.sin(previewTick * 0.08) * 12;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // 1. Draw Boss Base Texture / Sprite
    if (boss.texturePreset === 'silversonic') {
      // Silver Sonic Robot Body
      ctx.fillStyle = boss.primaryColor;
      ctx.beginPath();
      ctx.arc(0, -6, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Visor
      ctx.fillStyle = boss.glowColor;
      ctx.fillRect(-8, -10, 16, 6);

      // Spine Spikes
      ctx.fillStyle = boss.secondaryColor;
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(-30, -20);
      ctx.lineTo(-14, -4);
      ctx.closePath();
      ctx.fill();
    } else if (boss.texturePreset === 'deathegg') {
      // Giant Death Egg Mech Body
      ctx.fillStyle = boss.primaryColor;
      ctx.fillRect(-28, -26, 56, 44);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.strokeRect(-28, -26, 56, 44);

      // Cockpit Dome
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(0, -32, 14, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.stroke();

      // Reactor Core
      ctx.fillStyle = boss.glowColor;
      ctx.beginPath();
      ctx.arc(0, -4, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.texturePreset === 'egg_drill') {
      // Egg Drill Pod
      ctx.fillStyle = boss.primaryColor;
      ctx.beginPath();
      ctx.arc(0, -6, 22, 0, Math.PI);
      ctx.fill();

      // Massive Front Drill
      ctx.fillStyle = boss.secondaryColor;
      ctx.beginPath();
      ctx.moveTo(18, -12);
      ctx.lineTo(44, -6);
      ctx.lineTo(18, 0);
      ctx.closePath();
      ctx.fill();

      // Hazard Stripes
      ctx.fillStyle = boss.glowColor;
      ctx.fillRect(-18, -14, 36, 6);
    } else if (boss.texturePreset === 'egg_chemical') {
      // Chemical Plant Slime-Mech Chassis
      ctx.fillStyle = boss.primaryColor;
      ctx.fillRect(-22, -18, 44, 32);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-22, -18, 44, 32);

      // Bubbling Slime Chamber
      ctx.fillStyle = boss.secondaryColor;
      ctx.beginPath();
      ctx.arc(0, -2, 14, 0, Math.PI * 2);
      ctx.fill();

      // Slime Core Glow
      ctx.fillStyle = boss.glowColor;
      ctx.beginPath();
      ctx.arc(0, -2, 7, 0, Math.PI * 2);
      ctx.fill();

      // Caution Hatch
      ctx.fillStyle = boss.trimColor;
      ctx.fillRect(-18, 10, 36, 4);
    } else if (boss.texturePreset === 'shadow_metal') {
      // Shadow Metal Sonic Body
      ctx.fillStyle = boss.primaryColor || '#0F172A';
      ctx.beginPath();
      ctx.arc(0, -6, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = boss.secondaryColor || '#9333EA';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Crimson Visor
      ctx.fillStyle = boss.glowColor || '#F43F5E';
      ctx.fillRect(-8, -10, 16, 6);

      // Dark Spines
      ctx.fillStyle = boss.secondaryColor || '#9333EA';
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(-30, -20);
      ctx.lineTo(-14, -4);
      ctx.closePath();
      ctx.fill();
    } else if (boss.texturePreset === 'golden_mecha') {
      // Radiant Golden Mecha Overlord
      ctx.fillStyle = boss.primaryColor || '#FACC15';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = boss.secondaryColor || '#F59E0B';
      ctx.fillRect(-24, -4, 48, 8);

      // Super Radiant Dome
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -8, 16, Math.PI, 0);
      ctx.fill();
    } else {
      // Classic Eggmobile / Custom Pod
      ctx.fillStyle = boss.primaryColor;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = boss.secondaryColor;
      ctx.fillRect(-24, -4, 48, 8);

      // Hazard trim
      ctx.fillStyle = boss.trimColor;
      for (let x = -20; x <= 16; x += 8) {
        ctx.fillRect(x, -3, 4, 6);
      }

      // Windshield Dome
      ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.beginPath();
      ctx.arc(0, -8, 16, Math.PI, 0);
      ctx.fill();
    }

    // 2. Custom Insignia Pixel Matrix (if present)
    if (boss.customPixels && boss.customPixels.length === 16) {
      const pxSize = 1.2;
      const startPxX = -8 * pxSize;
      const startPxY = -2 * pxSize;
      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 16; c++) {
          const col = boss.customPixels[r][c];
          if (col && col !== '#00000000') {
            ctx.fillStyle = col;
            ctx.fillRect(startPxX + c * pxSize, startPxY + r * pxSize, pxSize, pxSize);
          }
        }
      }
    }

    // 3. Draw Attached Bumpers
    const attach = boss.attachments;
    const bumperPulse = 0.8 + 0.2 * Math.sin(previewTick * 0.2);
    if (attach.bumpersLeft) {
      drawBumper(ctx, -32, -4, boss.glowColor, bumperPulse);
    }
    if (attach.bumpersRight) {
      drawBumper(ctx, 32, -4, boss.glowColor, bumperPulse);
    }
    if (attach.bumpersTop) {
      drawBumper(ctx, 0, -32, boss.glowColor, bumperPulse);
    }
    if (attach.bumpersBottom) {
      drawBumper(ctx, 0, 26, boss.glowColor, bumperPulse);
    }

    // 4. Draw Attached Spikes
    if (attach.spikesFront) {
      drawSpikes(ctx, 24, -4, 'right');
    }
    if (attach.spikesTop) {
      drawSpikes(ctx, 0, -28, 'up');
    }
    if (attach.spikesBottom) {
      drawSpikes(ctx, 0, 24, 'down');
    }
    if (attach.spikesRear) {
      drawSpikes(ctx, -24, -4, 'left');
    }

    // 5. Draw Hitbox & Hurtbox Overlays
    const shouldDrawHitbox = activeTab === 'hitbox' || showHitboxOverlay;
    if (shouldDrawHitbox) {
      const hb = boss.hitbox || DEFAULT_BOSS_HITBOX;

      // Contact Hurtbox (Red danger circle)
      ctx.save();
      ctx.translate(hb.contactOffsetX || 0, hb.contactOffsetY || 0);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, hb.contactDamageRadius || 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2 / scale;
      ctx.setLineDash([4 / scale, 3 / scale]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Weak Point Core Hitbox (Emerald target circle with crosshairs)
      ctx.save();
      ctx.translate(hb.coreOffsetX || 0, hb.coreOffsetY || 0);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.beginPath();
      ctx.arc(0, 0, hb.coreRadius || 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5 / scale;
      ctx.stroke();

      // Crosshairs
      const r = hb.coreRadius || 28;
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 1.5 / scale;
      ctx.beginPath();
      ctx.moveTo(-r - 4 / scale, 0);
      ctx.lineTo(r + 4 / scale, 0);
      ctx.moveTo(0, -r - 4 / scale);
      ctx.lineTo(0, r + 4 / scale);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();

    // 6. Boss HUD Health Bar & Title Overlay
    ctx.save();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(16, 12, w - 32, 28);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(16, 12, w - 32, 28);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(boss.name.toUpperCase(), 24, 25);
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(boss.title, 24, 35);

    // Segmented health pips
    const pipCount = Math.min(24, boss.hp);
    const pipStartX = w - 24 - pipCount * 7;
    for (let p = 0; p < pipCount; p++) {
      ctx.fillStyle = p < boss.hp ? '#EF4444' : '#475569';
      ctx.fillRect(pipStartX + p * 7, 20, 5, 12);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(pipStartX + p * 7, 20, 5, 2);
    }

    // Hitbox Visual Legend
    if (shouldDrawHitbox) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(16, h - 24, w - 32, 18);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, h - 24, w - 32, 18);

      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#10B981';
      ctx.fillText('● WEAK POINT (CORE)', 24, h - 12);
      ctx.fillStyle = '#EF4444';
      ctx.fillText('● CONTACT HURTBOX (LETHAL)', w - 165, h - 12);
    }
    ctx.restore();
  }, [boss, previewTick, activeTab, showHitboxOverlay]);

  function drawBumper(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    glow: string,
    pulse: number
  ) {
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(pulse, pulse);

    // Outer bumper ring
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Chrome rim
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing Star Center
    ctx.fillStyle = glow || '#FACC15';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawSpikes(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    dir: 'up' | 'down' | 'left' | 'right'
  ) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = '#CBD5E1';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1;

    const len = 12;
    const half = 5;

    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      if (dir === 'up') {
        ctx.moveTo(i * 10 - half, 0);
        ctx.lineTo(i * 10, -len);
        ctx.lineTo(i * 10 + half, 0);
      } else if (dir === 'down') {
        ctx.moveTo(i * 10 - half, 0);
        ctx.lineTo(i * 10, len);
        ctx.lineTo(i * 10 + half, 0);
      } else if (dir === 'left') {
        ctx.moveTo(0, i * 10 - half);
        ctx.lineTo(-len, i * 10);
        ctx.lineTo(0, i * 10 + half);
      } else {
        ctx.moveTo(0, i * 10 - half);
        ctx.lineTo(len, i * 10);
        ctx.lineTo(0, i * 10 + half);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // Pixel Matrix Editor functions
  const handlePixelClick = (row: number, col: number) => {
    const currentMatrix =
      boss.customPixels || createDefaultBossPixelMatrix();
    const next = currentMatrix.map((r, rIdx) =>
      r.map((c, cIdx) => {
        if (rIdx === row && cIdx === col) {
          return isErasing ? '#00000000' : selectedPixelColor;
        }
        return c;
      })
    );
    setBoss((prev) => ({ ...prev, customPixels: next }));
  };

  const handleClearPixels = () => {
    const empty: string[][] = Array(16)
      .fill(null)
      .map(() => Array(16).fill('#00000000'));
    setBoss((prev) => ({ ...prev, customPixels: empty }));
  };

  const handleResetPixels = () => {
    setBoss((prev) => ({
      ...prev,
      customPixels: createDefaultBossPixelMatrix(),
    }));
  };

  // Save Boss to Level
  const handleSaveToLevel = () => {
    const existing = level.customBosses || [];
    const idx = existing.findIndex((b) => b.id === boss.id);
    let updatedBosses: CustomBossConfig[];
    if (idx !== -1) {
      updatedBosses = [...existing];
      updatedBosses[idx] = boss;
    } else {
      updatedBosses = [boss, ...existing];
    }

    onUpdateLevel({
      ...level,
      customBosses: updatedBosses,
    });
  };

  // Place Boss Tile into Level Grid
  const handlePlaceBossInLevel = () => {
    // Find a suitable open spot near player spawn or right side of level
    const spawnX = Math.min(level.width - 10, Math.max(10, Math.floor(level.width * 0.75)));
    let spawnY = 8;
    for (let y = level.height - 2; y >= 2; y--) {
      if (level.grid[y][spawnX] !== 0) {
        spawnY = Math.max(2, y - 4);
        break;
      }
    }

    const nextGrid = level.grid.map((r, ry) =>
      r.map((c, cx) => {
        if (ry === spawnY && cx === spawnX) {
          return TileType.BOSS_CUSTOM;
        }
        return c;
      })
    );

    const existing = level.customBosses || [];
    const idx = existing.findIndex((b) => b.id === boss.id);
    let updatedBosses: CustomBossConfig[];
    if (idx !== -1) {
      updatedBosses = [...existing];
      updatedBosses[idx] = boss;
    } else {
      updatedBosses = [boss, ...existing];
    }

    onUpdateLevel({
      ...level,
      grid: nextGrid,
      customBosses: updatedBosses,
    });
  };

  // Export Boss as JSON
  const handleExportBossJson = () => {
    const jsonStr = JSON.stringify(boss, null, 2);
    const slug = boss.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    triggerJsonDownload(`${slug || 'custom-boss'}.boss.json`, jsonStr);
  };

  // Import Boss JSON
  const handleImportBossJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed === 'object' && parsed.hp && parsed.movementAI) {
          setBoss(parsed as CustomBossConfig);
        }
      } catch {
        // Ignore invalid JSON
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-5 space-y-6 text-slate-200">
      {/* Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Custom Boss Creator Studio</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
              Full AI, Armor &amp; Weapons
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build custom bosses with health, movement AI, textures, bumpers, lethal spikes, and arena boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBossJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#131B2E] hover:bg-slate-800 text-blue-300 border border-blue-500/30 rounded-lg transition-colors cursor-pointer"
            title="Export Boss Code JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Boss</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#131B2E] hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            title="Import Boss Code JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Boss</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.boss.json"
            onChange={handleImportBossJson}
            className="hidden"
          />
          <button
            onClick={handlePlaceBossInLevel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
            title="Place this Boss into the Level Grid!"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Place in Stage</span>
          </button>
          <button
            onClick={handleSaveToLevel}
            className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Save Boss
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>

      {/* Preset Boss Library Quick Loaders */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Load Boss AI &amp; Texture Presets:</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(BOSS_PRESETS).map(([key, preset]) => {
            const isCurrent = boss.id === preset.id;
            return (
              <button
                key={key}
                onClick={() =>
                  setBoss((prev) => ({
                    ...preset,
                    customPixels: prev.customPixels || createEmptyBossPixelMatrix(),
                    hitbox: preset.hitbox ? { ...preset.hitbox } : { ...DEFAULT_BOSS_HITBOX },
                  }))
                }
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-900/30 border-amber-500 text-white shadow-sm'
                    : 'bg-[#131B2E] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold truncate">{preset.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-mono">
                    {preset.hp} HP
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{preset.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Preview Canvas on Left / Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Live Animated Preview Canvas & Boss Identity */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Interactive Battle Preview</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHitboxOverlay((v) => !v)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    showHitboxOverlay || activeTab === 'hitbox'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle Weak Point & Hurtbox Rings on Preview Canvas"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Hitbox Rings</span>
                </button>
                <span className="text-[11px] font-mono text-slate-400">
                  Scale: {boss.scale.toFixed(1)}x
                </span>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-slate-700/60 bg-black aspect-[4/3] w-full">
              <canvas
                ref={previewCanvasRef}
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Boss Identity Inputs */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Boss Name:</label>
                <input
                  type="text"
                  value={boss.name}
                  onChange={(e) => setBoss((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-slate-700 text-white font-semibold text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Subtitle / Descriptor:</label>
                <input
                  type="text"
                  value={boss.title}
                  onChange={(e) => setBoss((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-slate-700 text-slate-300 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Configuration Panels */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 bg-[#131B2E] p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('attributes')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'attributes'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Health &amp; AI</span>
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'attachments'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Bumpers &amp; Spikes</span>
            </button>
            <button
              onClick={() => setActiveTab('hitbox')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'hitbox'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Hitboxes</span>
            </button>
            <button
              onClick={() => setActiveTab('visuals')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'visuals'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Textures &amp; Color</span>
            </button>
            <button
              onClick={() => setActiveTab('pixels')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'pixels'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Insignia (16x16)</span>
            </button>
          </div>

          {/* Tab 1: Health, Movement AI, Arena Radius & Weapons */}
          {activeTab === 'attributes' && (
            <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Health (HP) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-bold flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      Boss Health (HP):
                    </span>
                    <span className="font-mono text-rose-300 font-bold">{boss.hp} HP</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={boss.hp}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setBoss((prev) => ({ ...prev, hp: val, maxHp: val }));
                    }}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex gap-1">
                    {[6, 8, 12, 16, 24, 32].map((presetHp) => (
                      <button
                        key={presetHp}
                        onClick={() => setBoss((prev) => ({ ...prev, hp: presetHp, maxHp: presetHp }))}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                          boss.hp === presetHp
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-[#0B0F19] border-slate-700 text-slate-400'
                        }`}
                      >
                        {presetHp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Move Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-bold flex items-center gap-1">
                      <Move className="w-3.5 h-3.5 text-blue-400" />
                      Move Speed:
                    </span>
                    <span className="font-mono text-blue-300 font-bold">{boss.moveSpeed.toFixed(1)} px/f</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={10.0}
                    step={0.2}
                    value={boss.moveSpeed}
                    onChange={(e) =>
                      setBoss((prev) => ({ ...prev, moveSpeed: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Movement AI Pattern */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Movement AI Behavior:
                </label>
                <select
                  value={boss.movementAI}
                  onChange={(e) =>
                    setBoss((prev) => ({ ...prev, movementAI: e.target.value as BossMovementAI }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-700 text-white font-medium cursor-pointer"
                >
                  <option value="eggman_hover">Classic Eggmobile: Hover &amp; Horizontal Swoop</option>
                  <option value="silversonic_dash">Silver Sonic: Jet Roller Dash, High Leap &amp; Spindash</option>
                  <option value="deathegg_mech">Death Egg Robot: 8-Phase Walking Mech &amp; Target Reticle</option>
                  <option value="drill_charge">Egg Drill-Crusher: Drill Charge, Wall Crash Stun &amp; Ceiling Burrow</option>
                  <option value="chemical_piston">Chemical Slime Mech: Piston Stomp, Fluid Flood &amp; Vortex</option>
                  <option value="magma_dropper">Magma Swooper: Low Platform Furnace Dive &amp; Fire Dropper</option>
                  <option value="sine_patrol">Sine-Wave Patrol: Undulating Flight &amp; Precision Dive</option>
                  <option value="bounce_frenzy">Pinball Frenzy: Erratic Diagonal Bouncing Mech</option>
                </select>
              </div>

              {/* Arena Radius */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">
                    Arena Radius Limit (Lock Boundary):
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {boss.arenaRadius} px (~{Math.round(boss.arenaRadius / 32)} tiles)
                  </span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={900}
                  step={10}
                  value={boss.arenaRadius}
                  onChange={(e) =>
                    setBoss((prev) => ({ ...prev, arenaRadius: parseInt(e.target.value) }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Weapons & Attacks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold flex items-center gap-1">
                    <Swords className="w-3.5 h-3.5 text-rose-400" />
                    Offensive Weapon:
                  </label>
                  <select
                    value={boss.attackType}
                    onChange={(e) =>
                      setBoss((prev) => ({ ...prev, attackType: e.target.value as BossAttackType }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-slate-700 text-white cursor-pointer"
                  >
                    <option value="none">None (Melee Contact Only)</option>
                    <option value="wrecking_ball">Swinging Wrecking Ball</option>
                    <option value="plasma_fire">Forward Plasma Laser Shots</option>
                    <option value="magma_bomb">Dropping Magma Bombs</option>
                    <option value="laser_sweep">Sweeping Cyber Energy Beams</option>
                    <option value="spikes_radial">Radial 6-Spike Volley</option>
                    <option value="rocket_claws">Rocket Propelled Claw Hands</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Defeat Reward:
                  </label>
                  <select
                    value={boss.defeatReward}
                    onChange={(e) =>
                      setBoss((prev) => ({
                        ...prev,
                        defeatReward: e.target.value as CustomBossConfig['defeatReward'],
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-slate-700 text-white cursor-pointer"
                  >
                    <option value="goal_post">Goal Post Signboard (Clear Act)</option>
                    <option value="giant_ring">Giant Special Stage Warp Ring</option>
                    <option value="ring_shower_20">20-Golden-Ring Shower</option>
                    <option value="chaos_emerald">Chaos Emerald Recovery</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Attachments - Bumpers & Spikes */}
          {activeTab === 'attachments' && (
            <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
              {/* Bumpers on Boss */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Pinball Bumpers on Boss (Deflects Players)</span>
                  </h3>
                  <span className="text-[11px] text-cyan-300">Harmless Rebound</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Mounting star bumpers onto the boss bounces Sonic backwards with pinball impulse!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    ['bumpersLeft', 'Left Bumper'],
                    ['bumpersRight', 'Right Bumper'],
                    ['bumpersTop', 'Top Bumper'],
                    ['bumpersBottom', 'Bottom Bumper'],
                  ].map(([key, label]) => {
                    const active = boss.attachments[key as keyof typeof boss.attachments];
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          setBoss((prev) => ({
                            ...prev,
                            attachments: {
                              ...prev.attachments,
                              [key]: !active,
                            },
                          }))
                        }
                        className={`p-2 rounded-lg border font-bold transition-colors cursor-pointer ${
                          active
                            ? 'bg-cyan-600/25 border-cyan-500 text-cyan-200'
                            : 'bg-[#0B0F19] border-slate-800 text-slate-400'
                        }`}
                      >
                        {label}: {active ? 'ON' : 'OFF'}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bumper Rebound Force:</span>
                    <span className="font-mono text-cyan-300">{boss.bumperBounciness} px/f</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={18}
                    value={boss.bumperBounciness}
                    onChange={(e) =>
                      setBoss((prev) => ({ ...prev, bumperBounciness: parseInt(e.target.value) }))
                    }
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Spikes on Boss */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Lethal Spikes on Boss (Damages Players)</span>
                  </h3>
                  <span className="text-[11px] text-rose-300">Lethal Hazard</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Attaching razor spikes makes those angles lethal to jump or roll into!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    ['spikesFront', 'Front Spikes'],
                    ['spikesTop', 'Top Spikes'],
                    ['spikesBottom', 'Bottom Spikes'],
                    ['spikesRear', 'Rear Spikes'],
                  ].map(([key, label]) => {
                    const active = boss.attachments[key as keyof typeof boss.attachments];
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          setBoss((prev) => ({
                            ...prev,
                            attachments: {
                              ...prev.attachments,
                              [key]: !active,
                            },
                          }))
                        }
                        className={`p-2 rounded-lg border font-bold transition-colors cursor-pointer ${
                          active
                            ? 'bg-rose-600/25 border-rose-500 text-rose-200'
                            : 'bg-[#0B0F19] border-slate-800 text-slate-400'
                        }`}
                      >
                        {label}: {active ? 'ON' : 'OFF'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Hitbox & Hurtbox Editor */}
          {activeTab === 'hitbox' && (
            <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4 text-emerald-400" />
                    <span>Custom Boss Hitbox &amp; Hurtbox Editor</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure precision weak points where players can damage the boss, and contact hurtbox boundaries where touching the boss hurts players!
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold">
                    Pixel-Accurate Collision
                  </span>
                </div>
              </div>

              {/* Quick Hitbox Presets */}
              <div className="space-y-1.5 pt-1 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hitbox Templates &amp; Archetypes:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    {
                      label: 'Standard Balanced',
                      desc: 'Balanced weak point & contact ring',
                      config: { coreRadius: 26, coreOffsetX: 0, coreOffsetY: 0, contactDamageRadius: 26, contactOffsetX: 0, contactOffsetY: 0 },
                    },
                    {
                      label: 'Top Cockpit Core',
                      desc: 'Only vulnerable from above / head',
                      config: { coreRadius: 18, coreOffsetX: 0, coreOffsetY: -16, contactDamageRadius: 28, contactOffsetX: 0, contactOffsetY: 4 },
                    },
                    {
                      label: 'Exposed Rear Core',
                      desc: 'Only vulnerable from behind',
                      config: { coreRadius: 20, coreOffsetX: -16, coreOffsetY: 0, contactDamageRadius: 28, contactOffsetX: 8, contactOffsetY: 0 },
                    },
                    {
                      label: 'Heavy Armored Shell',
                      desc: 'Tiny weak point, large hurtbox',
                      config: { coreRadius: 14, coreOffsetX: 0, coreOffsetY: -8, contactDamageRadius: 32, contactOffsetX: 0, contactOffsetY: 0 },
                    },
                    {
                      label: 'Colossus Titan',
                      desc: 'Massive hitbox for giant bosses',
                      config: { coreRadius: 38, coreOffsetX: 0, coreOffsetY: 0, contactDamageRadius: 38, contactOffsetX: 0, contactOffsetY: 0 },
                    },
                    {
                      label: 'Reset to Default',
                      desc: 'Default 28px core / 26px hurtbox',
                      config: { ...DEFAULT_BOSS_HITBOX },
                    },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setBoss((prev) => ({
                          ...prev,
                          hitbox: { ...preset.config },
                        }))
                      }
                      className="p-2 rounded-lg bg-[#0B0F19] hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-slate-200 text-[11px]">{preset.label}</div>
                      <div className="text-[10px] text-slate-400">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weak Point Core Hitbox (Green) */}
              <div className="bg-[#0B0F19] p-3 rounded-lg border border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="font-bold text-emerald-300">Vulnerable Core Hitbox (Weak Point)</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    Radius: {boss.hitbox?.coreRadius || 28}px
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  When a curled or attacking Sonic (Jump, Spin Dash, Dropdash, Roll, Glide) strikes inside this circle, the boss takes damage!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Core Radius:</span>
                      <span className="font-mono text-emerald-400">{boss.hitbox?.coreRadius || 28}px</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={64}
                      value={boss.hitbox?.coreRadius || 28}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBoss((prev) => ({
                          ...prev,
                          hitbox: {
                            ...(prev.hitbox || DEFAULT_BOSS_HITBOX),
                            coreRadius: val,
                          },
                        }));
                      }}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Offset X:</span>
                      <span className="font-mono text-emerald-400">
                        {(boss.hitbox?.coreOffsetX || 0) > 0 ? `+${boss.hitbox?.coreOffsetX}` : boss.hitbox?.coreOffsetX || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      value={boss.hitbox?.coreOffsetX || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBoss((prev) => ({
                          ...prev,
                          hitbox: {
                            ...(prev.hitbox || DEFAULT_BOSS_HITBOX),
                            coreOffsetX: val,
                          },
                        }));
                      }}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Offset Y:</span>
                      <span className="font-mono text-emerald-400">
                        {(boss.hitbox?.coreOffsetY || 0) > 0 ? `+${boss.hitbox?.coreOffsetY}` : boss.hitbox?.coreOffsetY || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      value={boss.hitbox?.coreOffsetY || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBoss((prev) => ({
                          ...prev,
                          hitbox: {
                            ...(prev.hitbox || DEFAULT_BOSS_HITBOX),
                            coreOffsetY: val,
                          },
                        }));
                      }}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Damage Hurtbox (Red) */}
              <div className="bg-[#0B0F19] p-3 rounded-lg border border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                    <span className="font-bold text-rose-300">Contact Damage Hurtbox (Lethal Hull)</span>
                  </div>
                  <span className="text-[11px] font-mono text-rose-400 font-semibold">
                    Radius: {boss.hitbox?.contactDamageRadius || 26}px
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Touching this area while walking, running or standing hurts the player and knocks them back!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Hurtbox Radius:</span>
                      <span className="font-mono text-rose-400">{boss.hitbox?.contactDamageRadius || 26}px</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={64}
                      value={boss.hitbox?.contactDamageRadius || 26}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBoss((prev) => ({
                          ...prev,
                          hitbox: {
                            ...(prev.hitbox || DEFAULT_BOSS_HITBOX),
                            contactDamageRadius: val,
                          },
                        }));
                      }}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Offset X:</span>
                      <span className="font-mono text-rose-400">
                        {(boss.hitbox?.contactOffsetX || 0) > 0 ? `+${boss.hitbox?.contactOffsetX}` : boss.hitbox?.contactOffsetX || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      value={boss.hitbox?.contactOffsetX || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBoss((prev) => ({
                          ...prev,
                          hitbox: {
                            ...(prev.hitbox || DEFAULT_BOSS_HITBOX),
                            contactOffsetX: val,
                          },
                        }));
                      }}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Offset Y:</span>
                      <span className="font-mono text-rose-400">
                        {(boss.hitbox?.contactOffsetY || 0) > 0 ? `+${boss.hitbox?.contactOffsetY}` : boss.hitbox?.contactOffsetY || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      value={boss.hitbox?.contactOffsetY || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBoss((prev) => ({
                          ...prev,
                          hitbox: {
                            ...(prev.hitbox || DEFAULT_BOSS_HITBOX),
                            contactOffsetY: val,
                          },
                        }));
                      }}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Textures, Colors & Scale */}
          {activeTab === 'visuals' && (
            <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
              {/* Texture Preset */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1">
                  <Paintbrush className="w-3.5 h-3.5 text-purple-400" />
                  Base Sprite &amp; Chassis Silhouette:
                </label>
                <select
                  value={boss.texturePreset}
                  onChange={(e) =>
                    setBoss((prev) => ({ ...prev, texturePreset: e.target.value as BossTexturePreset }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-slate-700 text-white cursor-pointer font-medium"
                >
                  <option value="silversonic">Silver Sonic / Mecha Sonic Mk. I Silhouette</option>
                  <option value="deathegg">Giant Death Egg Robot Heavy Armor</option>
                  <option value="eggman_classic">Classic Red Eggmobile Pod</option>
                  <option value="egg_drill">Heavy Drill Mech Hull</option>
                  <option value="egg_chemical">Chemical Plant Slime Mech</option>
                  <option value="shadow_metal">Shadow Metal Sonic Dark Obsidian</option>
                  <option value="golden_mecha">Golden Super-Egg Radiant Plate</option>
                  <option value="custom">Custom Color Pod</option>
                </select>
              </div>

              {/* Color Customization */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <span className="text-slate-400 block mb-1">Primary Chassis:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={boss.primaryColor}
                      onChange={(e) => setBoss((prev) => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-slate-300">{boss.primaryColor}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Secondary Stripes:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={boss.secondaryColor}
                      onChange={(e) => setBoss((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-slate-300">{boss.secondaryColor}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Visor / Glow Core:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={boss.glowColor}
                      onChange={(e) => setBoss((prev) => ({ ...prev, glowColor: e.target.value }))}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-slate-300">{boss.glowColor}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Metal Trim:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={boss.trimColor}
                      onChange={(e) => setBoss((prev) => ({ ...prev, trimColor: e.target.value }))}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-slate-300">{boss.trimColor}</span>
                  </div>
                </div>
              </div>

              {/* Boss Scale Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Boss Sprite Scale:</span>
                  <span className="font-mono text-purple-300 font-bold">{boss.scale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={2.5}
                  step={0.1}
                  value={boss.scale}
                  onChange={(e) =>
                    setBoss((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tab 4: 16x16 Pixel Matrix Editor for Cockpit Badge */}
          {activeTab === 'pixels' && (
            <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-200">16x16 Custom Insignia Badge Editor</h3>
                  <p className="text-[11px] text-slate-400">
                    Paint a custom emblem or face-plate pixel texture that renders directly onto the boss hull!
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleResetPixels}
                    className="p-1 text-slate-400 hover:text-white bg-[#0B0F19] rounded border border-slate-700 cursor-pointer"
                    title="Reset to Robotic Skull Badge"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleClearPixels}
                    className="p-1 text-slate-400 hover:text-rose-400 bg-[#0B0F19] rounded border border-slate-700 cursor-pointer"
                    title="Clear All Pixels"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Palette & Tools */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsErasing(false)}
                    className={`p-1.5 rounded border transition-colors cursor-pointer ${
                      !isErasing
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#0B0F19] border-slate-700 text-slate-400'
                    }`}
                    title="Pencil Tool"
                  >
                    <Paintbrush className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsErasing(true)}
                    className={`p-1.5 rounded border transition-colors cursor-pointer ${
                      isErasing
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-[#0B0F19] border-slate-700 text-slate-400'
                    }`}
                    title="Eraser Tool"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {PALETTE_SWATCHES.map((swatch) => (
                    <button
                      key={swatch}
                      onClick={() => {
                        setSelectedPixelColor(swatch);
                        setIsErasing(false);
                      }}
                      className={`w-5 h-5 rounded-sm border cursor-pointer ${
                        selectedPixelColor === swatch && !isErasing
                          ? 'border-white scale-110 shadow-sm'
                          : 'border-black/40'
                      }`}
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                  <input
                    type="color"
                    value={selectedPixelColor}
                    onChange={(e) => {
                      setSelectedPixelColor(e.target.value);
                      setIsErasing(false);
                    }}
                    className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer ml-1"
                  />
                </div>
              </div>

              {/* 16x16 Grid */}
              <div className="flex justify-center p-2 bg-[#0B0F19] rounded-lg border border-slate-800">
                <div className="grid grid-cols-16 gap-[1px] bg-slate-800 p-[1px] rounded">
                  {(boss.customPixels || createDefaultBossPixelMatrix()).map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => handlePixelClick(r, c)}
                        className="w-4 h-4 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor:
                            cell === '#00000000' || !cell ? 'transparent' : cell,
                          backgroundImage:
                            cell === '#00000000' || !cell
                              ? 'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)'
                              : 'none',
                          backgroundSize: '4px 4px',
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
