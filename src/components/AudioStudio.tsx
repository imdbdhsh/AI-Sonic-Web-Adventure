import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  RotateCcw,
  Sliders,
  Upload,
  Volume2,
} from 'lucide-react';
import {
  SfxPatchKey,
  soundFX,
} from '../audio/soundEngine';
import {
  PitchCurveType,
  SfxPatch,
} from '../types/engine';
import { triggerJsonDownload } from '../utils/exportHelper';

export const AudioStudio: React.FC = () => {
  const [patches, setPatches] = useState<Record<SfxPatchKey, SfxPatch>>(() => ({
    ...soundFX.getPatches(),
  }));
  const [selectedPatchKey, setSelectedPatchKey] = useState<SfxPatchKey>('jump');

  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const envCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activePatch = patches[selectedPatchKey];

  // Live 60FPS Web Audio Oscilloscope & Spectrum Visualizer for SFX Output
  useEffect(() => {
    let animId = 0;
    const timeData = new Uint8Array(256);
    const freqData = new Uint8Array(128);

    const renderScope = () => {
      const canvas = scopeCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.fillStyle = '#090D16';
          ctx.fillRect(0, 0, w, h);

          ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.stroke();

          const analyser = soundFX.getAnalyser();
          if (analyser) {
            analyser.getByteFrequencyData(freqData);
            analyser.getByteTimeDomainData(timeData);

            const barW = w / 48;
            for (let i = 0; i < 48; i++) {
              const val = freqData[i] / 255;
              const barH = val * (h - 12);
              ctx.fillStyle = `rgba(37, 99, 235, ${0.25 + val * 0.45})`;
              ctx.fillRect(i * barW, h - barH, barW - 2, barH);
            }

            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < timeData.length; i++) {
              const x = (i / (timeData.length - 1)) * w;
              const v = timeData[i] / 128.0;
              const y = (v * h) / 2;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(renderScope);
    };

    animId = requestAnimationFrame(renderScope);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw SFX Pitch & Amplitude Envelope Curve Preview
  useEffect(() => {
    const canvas = envCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const atkRatio = Math.min(
      0.45,
      activePatch.attackMs / Math.max(40, activePatch.durationMs)
    );
    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w * atkRatio, h * (1 - activePatch.volume * 2.2));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const startNorm = Math.min(1, activePatch.baseFreq / 1400);
    const endNorm = Math.min(1, activePatch.endFreq / 1400);

    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      let pitchNorm = startNorm + (endNorm - startNorm) * t;
      if (activePatch.pitchCurve === 'exponential') {
        pitchNorm = startNorm + (endNorm - startNorm) * Math.pow(t, 0.45);
      } else if (activePatch.pitchCurve === 'arp_step') {
        pitchNorm =
          t < 0.33
            ? startNorm
            : t < 0.66
            ? (startNorm + endNorm) * 0.5
            : endNorm;
      } else if (activePatch.pitchCurve === 'vibrato') {
        pitchNorm += Math.sin(t * Math.PI * 8) * 0.08;
      }

      const fmRipple =
        (activePatch.fmDepth / 400) *
        0.12 *
        Math.sin(t * activePatch.fmRate * 1.2);
      const y =
        h - 10 - Math.max(0.05, Math.min(0.95, pitchNorm + fmRipple)) * (h - 20);
      const x = t * w;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [activePatch]);

  const handleUpdatePatchField = <K extends keyof SfxPatch>(
    field: K,
    val: SfxPatch[K]
  ) => {
    const updated: SfxPatch = {
      ...activePatch,
      [field]: val,
    };
    soundFX.updatePatch(selectedPatchKey, updated);
    setPatches({
      ...patches,
      [selectedPatchKey]: updated,
    });
  };

  const handleResetPatches = () => {
    soundFX.resetPatches();
    setPatches({ ...soundFX.getPatches() });
  };

  const handleExportSfxPack = () => {
    const payload = {
      patches,
    };
    const jsonText = JSON.stringify(payload, null, 2);
    triggerJsonDownload(
      `sonic-sfx-pack-${Date.now().toString().slice(-4)}.json`,
      jsonText
    );
  };

  const handleImportSfxPack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const incoming = parsed.patches || parsed.sfxPatches || parsed;
        if (incoming && typeof incoming === 'object') {
          soundFX.setAllPatches(incoming);
          setPatches({ ...soundFX.getPatches() });
        }
      } catch {
        // Ignore malformed JSON
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-6">
      {/* Top Studio Header & Live Master SFX Oscilloscope */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        <div className="lg:col-span-5 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">
              16-Bit FM & PSG Sound Effects (SFX) Studio
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Synthesize and customize real-time FM/PSG game sound effects (Music is completely disabled — pure SFX engine).
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={handleExportSfxPack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export SFX Pack
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import SFX Pack
            </button>
            <button
              onClick={handleResetPatches}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Default SFX
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportSfxPack}
              className="hidden"
            />
          </div>
        </div>

        {/* Live Web Audio Oscilloscope & Spectrum Display */}
        <div className="lg:col-span-7 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>SFX OUTPUT OSCILLOSCOPE & FFT SPECTRUM</span>
            <span className="text-emerald-400">
              CLICK ANY SOUND EFFECT PATCH BELOW TO AUDITION
            </span>
          </div>
          <canvas
            ref={scopeCanvasRef}
            width={680}
            height={82}
            className="w-full h-[82px] rounded-lg border border-slate-800 bg-[#090D16] block"
          />
        </div>
      </div>

      {/* Main SFX Patch Selector & Synth Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 10 Game SFX Patch Selector Grid */}
        <div className="lg:col-span-5 bg-[#131B2E] border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white">
            Game Sound Effect Patches (10)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(patches) as SfxPatchKey[]).map((key) => {
              const p = patches[key];
              const isSelected = selectedPatchKey === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedPatchKey(key);
                    soundFX.playPatch(key);
                  }}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/25 border-blue-500 text-white'
                      : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono uppercase">
                      {p.wave} · {p.durationMs}ms
                    </div>
                  </div>
                  <Volume2 className="w-4 h-4 text-blue-400 shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep FM/PSG SFX Synthesizer & Envelope Designer */}
        <div className="lg:col-span-7 bg-[#131B2E] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">
                Editing Patch: {activePatch.name}
              </h2>
              <p className="text-xs text-slate-400">
                Adjust carrier waveform, pitch sweep envelope, FM operator modulation, and PSG noise mix
              </p>
            </div>
            <button
              onClick={() => soundFX.playPatch(selectedPatchKey)}
              className="py-2 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              Trigger "{activePatch.name}"
            </button>
          </div>

          {/* Interactive Pitch & Amplitude Envelope Curve Preview */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>PITCH SWEEP & FM MODULATION CURVE</span>
              <span className="text-amber-400">{activePatch.wave.toUpperCase()}</span>
            </div>
            <canvas
              ref={envCanvasRef}
              width={560}
              height={96}
              className="w-full h-[96px] rounded-lg border border-slate-800 bg-[#090D16] block"
            />
          </div>

          {/* Carrier Waveform & Pitch Curve Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Carrier Waveform
              </label>
              <select
                value={activePatch.wave}
                onChange={(e) =>
                  handleUpdatePatchField('wave', e.target.value as OscillatorType)
                }
                className="w-full px-3 py-2 text-xs bg-[#0B0F19] border border-slate-800 rounded-lg text-white capitalize"
              >
                <option value="square">Square (PSG)</option>
                <option value="sawtooth">Sawtooth (FM)</option>
                <option value="triangle">Triangle</option>
                <option value="sine">Pure Sine</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Pitch Sweep Curve
              </label>
              <select
                value={activePatch.pitchCurve}
                onChange={(e) =>
                  handleUpdatePatchField(
                    'pitchCurve',
                    e.target.value as PitchCurveType
                  )
                }
                className="w-full px-3 py-2 text-xs bg-[#0B0F19] border border-slate-800 rounded-lg text-white"
              >
                <option value="linear">Linear Sweep</option>
                <option value="exponential">Exponential Curve</option>
                <option value="arp_step">3-Step Arpeggio</option>
                <option value="vibrato">Oscillating Vibrato</option>
              </select>
            </div>
          </div>

          {/* Synth Parameter Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Start Frequency</span>
                <span className="font-mono text-white">
                  {Math.round(activePatch.baseFreq)} Hz
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={1600}
                value={activePatch.baseFreq}
                onChange={(e) =>
                  handleUpdatePatchField('baseFreq', Number(e.target.value))
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">End Target Frequency</span>
                <span className="font-mono text-white">
                  {Math.round(activePatch.endFreq)} Hz
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={1800}
                value={activePatch.endFreq}
                onChange={(e) =>
                  handleUpdatePatchField('endFreq', Number(e.target.value))
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">FM Depth</span>
                <span className="font-mono text-amber-400">
                  {activePatch.fmDepth} Hz
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={350}
                value={activePatch.fmDepth}
                onChange={(e) =>
                  handleUpdatePatchField('fmDepth', Number(e.target.value))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">FM Speed</span>
                <span className="font-mono text-amber-400">
                  {activePatch.fmRate} Hz
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={75}
                value={activePatch.fmRate}
                onChange={(e) =>
                  handleUpdatePatchField('fmRate', Number(e.target.value))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Duration</span>
                <span className="font-mono text-white">
                  {activePatch.durationMs} ms
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={700}
                step={10}
                value={activePatch.durationMs}
                onChange={(e) =>
                  handleUpdatePatchField('durationMs', Number(e.target.value))
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">PSG Noise Mix</span>
                <span className="font-mono text-emerald-400">
                  {Math.round(activePatch.noiseMix * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={activePatch.noiseMix}
                onChange={(e) =>
                  handleUpdatePatchField('noiseMix', Number(e.target.value))
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
