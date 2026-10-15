import React, { useEffect, useRef, useState } from 'react';
import {
  Cloud,
  Compass,
  Download,
  Eye,
  Grid,
  Layers,
  Moon,
  Palette,
  RotateCcw,
  Sparkles,
  Sun,
  Upload,
  Waves,
} from 'lucide-react';
import { BACKGROUND_PRESETS } from '../data/bossPresets';
import { CustomBackgroundConfig, LevelData, TilesetConfig } from '../types/engine';
import { triggerJsonDownload } from '../utils/exportHelper';

interface BackgroundEditorProps {
  level: LevelData;
  activeTileset: TilesetConfig;
  onUpdateLevel: (updated: LevelData) => void;
  onClose?: () => void;
}

export const BackgroundEditor: React.FC<BackgroundEditorProps> = ({
  level,
  activeTileset,
  onUpdateLevel,
  onClose,
}) => {
  const [config, setConfig] = useState<CustomBackgroundConfig>(() => {
    if (level.customBackground) {
      return { ...level.customBackground };
    }
    const defaultPreset =
      activeTileset.decorStyle === 'deathegg'
        ? BACKGROUND_PRESETS.deathegg.config
        : activeTileset.decorStyle === 'cave'
        ? BACKGROUND_PRESETS.cave.config
        : activeTileset.decorStyle === 'chemical' || activeTileset.decorStyle === 'chemicalplant'
        ? BACKGROUND_PRESETS.chemicalplant.config
        : BACKGROUND_PRESETS.palms.config;
    return { ...defaultPreset };
  });

  const [simCamX, setSimCamX] = useState<number>(0);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll simulation
  useEffect(() => {
    if (!autoScroll) return;
    const interval = setInterval(() => {
      setSimCamX((prev) => (prev + 2.5) % 3200);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [autoScroll]);

  // Live Canvas Preview Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, config.skyTop);
    skyGrad.addColorStop(0.55, config.skyMiddle);
    skyGrad.addColorStop(1, config.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Stars / Cosmic Dust
    if (config.starsActive) {
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 45; i++) {
        const sx = (i * 73 + simCamX * 0.04) % w;
        const sy = (i * 37) % (h * 0.65);
        const size = (i % 3 === 0) ? 2.2 : 1.2;
        ctx.globalAlpha = 0.4 + 0.6 * Math.sin(simCamX * 0.05 + i);
        ctx.fillRect(sx, sy, size, size);
      }
      ctx.globalAlpha = 1.0;
    }

    // 3. Synthwave Grid Floor
    if (config.gridFloor) {
      const horizonY = h * 0.58;
      ctx.save();
      const gridGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      gridGrad.addColorStop(0, '#1E0533');
      gridGrad.addColorStop(1, '#3B0764');
      ctx.fillStyle = gridGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Horizontal lines in perspective
      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 1;
      for (let y = 1; y <= 8; y++) {
        const py = horizonY + Math.pow(y / 8, 1.8) * (h - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
        ctx.stroke();
      }

      // Vanishing vertical lines
      const cx = w * 0.5;
      const gridOffset = (simCamX * 0.5) % 40;
      for (let x = -w; x <= w * 2; x += 40) {
        ctx.beginPath();
        ctx.moveTo(cx, horizonY);
        ctx.lineTo(x - gridOffset, h);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Distant City or Mountains
    if (config.distantCity) {
      ctx.save();
      const farOffset = -((simCamX * config.parallaxSpeedFar) % 240);
      ctx.fillStyle = '#0F172A';
      for (let bx = farOffset - 240; bx < w + 240; bx += 240) {
        // City skyline blocks
        ctx.fillRect(bx + 10, h * 0.35, 40, h * 0.65);
        ctx.fillRect(bx + 60, h * 0.45, 55, h * 0.55);
        ctx.fillRect(bx + 125, h * 0.3, 35, h * 0.7);
        ctx.fillRect(bx + 170, h * 0.5, 60, h * 0.5);

        // Neon windows
        ctx.fillStyle = '#FACC15';
        for (let wy = h * 0.4; wy < h * 0.65; wy += 14) {
          ctx.fillRect(bx + 20, wy, 4, 4);
          ctx.fillRect(bx + 30, wy, 4, 4);
          ctx.fillRect(bx + 75, wy, 4, 4);
          ctx.fillRect(bx + 140, wy, 4, 4);
        }
        ctx.fillStyle = '#0F172A';
      }
      ctx.restore();
    } else if (config.theme === 'sunset_mountains' || config.theme === 'palms') {
      // Mountain peaks
      ctx.save();
      const farOffset = -((simCamX * config.parallaxSpeedFar) % 320);
      ctx.fillStyle = config.theme === 'sunset_mountains' ? '#4C0519' : '#065F46';
      for (let mx = farOffset - 320; mx < w + 320; mx += 320) {
        ctx.beginPath();
        ctx.moveTo(mx, h * 0.65);
        ctx.lineTo(mx + 80, h * 0.35);
        ctx.lineTo(mx + 160, h * 0.55);
        ctx.lineTo(mx + 240, h * 0.3);
        ctx.lineTo(mx + 320, h * 0.65);
        ctx.lineTo(mx + 320, h);
        ctx.lineTo(mx, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    } else if (config.theme === 'deathegg') {
      // Space bulkhead struts
      ctx.save();
      const strutOffset = -((simCamX * config.parallaxSpeedNear) % 200);
      ctx.fillStyle = '#1E293B';
      for (let bx = strutOffset - 200; bx < w + 200; bx += 200) {
        ctx.fillRect(bx, 0, 24, h);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(bx, 0, 200, h * 0.12);
        ctx.fillRect(bx, h * 0.72, 200, h * 0.28);
        ctx.fillStyle = (simCamX % 30 < 15) ? '#EF4444' : '#22C55E';
        ctx.fillRect(bx + 6, h * 0.25, 12, 6);
        ctx.fillStyle = '#1E293B';
      }
      ctx.restore();
    }

    // 5. Cloud Layers
    if (config.cloudLayers) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      const cloudOffset = -((simCamX * 0.15) % 280);
      for (let cx = cloudOffset - 280; cx < w + 280; cx += 280) {
        ctx.beginPath();
        ctx.arc(cx + 40, h * 0.25, 24, 0, Math.PI * 2);
        ctx.arc(cx + 70, h * 0.22, 34, 0, Math.PI * 2);
        ctx.arc(cx + 105, h * 0.26, 26, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. Floating Embers
    if (config.floatingEmbers) {
      ctx.fillStyle = '#F97316';
      for (let e = 0; e < 18; e++) {
        const ex = (e * 89 + simCamX * 0.6) % w;
        const ey = h - ((e * 41 + simCamX * 0.4) % (h * 0.6));
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(simCamX * 0.1 + e);
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    // 7. Water Reflection
    if (config.waterReflect) {
      const waterY = h * 0.72;
      ctx.save();
      const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
      waterGrad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      waterGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, waterY, w, h - waterY);

      // Water shimmer lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      for (let ly = waterY + 6; ly < h; ly += 12) {
        const offset = Math.sin(simCamX * 0.05 + ly) * 12;
        ctx.beginPath();
        ctx.moveTo(offset, ly);
        ctx.lineTo(w + offset, ly);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [config, simCamX]);

  const handleApplyToLevel = () => {
    onUpdateLevel({
      ...level,
      customBackground: config,
    });
  };

  const handleResetToDefault = () => {
    const updated = { ...level };
    delete updated.customBackground;
    onUpdateLevel(updated);
    setConfig({
      ...BACKGROUND_PRESETS.palms.config,
    });
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(config, null, 2);
    triggerJsonDownload(`${level.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-background.bg.json`, jsonStr);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed === 'object' && parsed.skyTop) {
          setConfig(parsed as CustomBackgroundConfig);
          onUpdateLevel({
            ...level,
            customBackground: parsed as CustomBackgroundConfig,
          });
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Zone Background Studio</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
              Parallax &amp; Atmosphere
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Customize sky gradients, parallax horizons, and atmospheric effects for{' '}
            <span className="text-slate-200 font-semibold">{level.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#131B2E] hover:bg-slate-800 text-blue-300 border border-blue-500/30 rounded-lg transition-colors cursor-pointer"
            title="Export Background Config JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export BG</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#131B2E] hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            title="Import Background Config JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import BG</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.bg.json"
            onChange={handleImportJson}
            className="hidden"
          />
          <button
            onClick={handleApplyToLevel}
            className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Save to Stage
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

      {/* Preset Library Quick Switcher */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Preset Atmosphere Themes:</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(BACKGROUND_PRESETS).map(([key, item]) => {
            const isSelected = config.theme === item.config.theme;
            return (
              <button
                key={key}
                onClick={() => {
                  setConfig({ ...item.config });
                }}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-900/30 border-blue-500 text-white shadow-sm'
                    : 'bg-[#131B2E] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div
                  className="w-full h-4 rounded mb-1.5 border border-white/10"
                  style={{
                    background: `linear-gradient(to right, ${item.config.skyTop}, ${item.config.skyMiddle}, ${item.config.skyBottom})`,
                  }}
                />
                <div className="text-xs font-bold truncate">{item.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Animated Canvas Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Parallax Preview (Simulated 60FPS Camera)</span>
          </div>
          <button
            onClick={() => setAutoScroll((v) => !v)}
            className="text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800/60 px-2 py-0.5 rounded cursor-pointer"
          >
            Camera Pan: {autoScroll ? 'AUTO SCROLL' : 'PAUSED'}
          </button>
        </div>
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-[16/7] w-full max-h-56">
          <canvas
            ref={canvasRef}
            width={640}
            height={280}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Editor Sliders & Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sky Gradients */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Sky Gradient Colors</span>
          </h3>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Sky Top Zenith:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.skyTop}
                  onChange={(e) => setConfig((prev) => ({ ...prev, skyTop: e.target.value }))}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-300">{config.skyTop}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Mid-Sky Horizon:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.skyMiddle}
                  onChange={(e) => setConfig((prev) => ({ ...prev, skyMiddle: e.target.value }))}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-300">{config.skyMiddle}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Base / Water Fog:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.skyBottom}
                  onChange={(e) => setConfig((prev) => ({ ...prev, skyBottom: e.target.value }))}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-300">{config.skyBottom}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Far Parallax Speed:</span>
              <span className="font-mono text-blue-300">{config.parallaxSpeedFar.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.02}
              max={0.5}
              step={0.01}
              value={config.parallaxSpeedFar}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, parallaxSpeedFar: parseFloat(e.target.value) }))
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Atmosphere & Particle Toggles */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Atmospheric &amp; Environmental Elements</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setConfig((prev) => ({ ...prev, starsActive: !prev.starsActive }))}
              className={`p-2.5 rounded-lg border flex items-center gap-2 transition-colors cursor-pointer ${
                config.starsActive
                  ? 'bg-blue-600/25 border-blue-500 text-blue-200'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5 shrink-0" />
              <span>Twinkling Stars</span>
            </button>

            <button
              onClick={() => setConfig((prev) => ({ ...prev, floatingEmbers: !prev.floatingEmbers }))}
              className={`p-2.5 rounded-lg border flex items-center gap-2 transition-colors cursor-pointer ${
                config.floatingEmbers
                  ? 'bg-amber-600/25 border-amber-500 text-amber-200'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Floating Embers</span>
            </button>

            <button
              onClick={() => setConfig((prev) => ({ ...prev, cloudLayers: !prev.cloudLayers }))}
              className={`p-2.5 rounded-lg border flex items-center gap-2 transition-colors cursor-pointer ${
                config.cloudLayers
                  ? 'bg-sky-600/25 border-sky-500 text-sky-200'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-400'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 shrink-0" />
              <span>Cloud Bands</span>
            </button>

            <button
              onClick={() => setConfig((prev) => ({ ...prev, distantCity: !prev.distantCity }))}
              className={`p-2.5 rounded-lg border flex items-center gap-2 transition-colors cursor-pointer ${
                config.distantCity
                  ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>City / Silhouettes</span>
            </button>

            <button
              onClick={() => setConfig((prev) => ({ ...prev, gridFloor: !prev.gridFloor }))}
              className={`p-2.5 rounded-lg border flex items-center gap-2 transition-colors cursor-pointer ${
                config.gridFloor
                  ? 'bg-purple-600/25 border-purple-500 text-purple-200'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-400'
              }`}
            >
              <Grid className="w-3.5 h-3.5 shrink-0" />
              <span>Synthwave Grid</span>
            </button>

            <button
              onClick={() => setConfig((prev) => ({ ...prev, waterReflect: !prev.waterReflect }))}
              className={`p-2.5 rounded-lg border flex items-center gap-2 transition-colors cursor-pointer ${
                config.waterReflect
                  ? 'bg-teal-600/25 border-teal-500 text-teal-200'
                  : 'bg-[#0B0F19] border-slate-800 text-slate-400'
              }`}
            >
              <Waves className="w-3.5 h-3.5 shrink-0" />
              <span>Water Reflection</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Stage Background</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
