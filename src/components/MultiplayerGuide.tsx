import React from 'react';
import { Gamepad2, Keyboard, Play, Users } from 'lucide-react';
import { CHARACTER_SPECS } from '../data/presets';
import {
  CharacterId,
  MultiplayerMode,
  SplitOrientation,
} from '../types/engine';

interface MultiplayerGuideProps {
  p1Character: CharacterId;
  p2Character: CharacterId;
  multiplayerMode: MultiplayerMode;
  splitOrientation: SplitOrientation;
  onChangeP1Character: (c: CharacterId) => void;
  onChangeP2Character: (c: CharacterId) => void;
  onChangeMultiplayerMode: (m: MultiplayerMode) => void;
  onChangeSplitOrientation: (o: SplitOrientation) => void;
  onLaunchGame: () => void;
}

export const MultiplayerGuide: React.FC<MultiplayerGuideProps> = ({
  p1Character,
  p2Character,
  multiplayerMode,
  splitOrientation,
  onChangeP1Character,
  onChangeP2Character,
  onChangeMultiplayerMode,
  onChangeSplitOrientation,
  onLaunchGame,
}) => {
  return (
    <div className="max-w-[1380px] mx-auto px-6 py-6 space-y-6">
      {/* Header & Quick Launch */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h1 className="text-2xl font-bold text-white">
            Local Multiplayer & Character Physics Configuration
          </h1>
          <p className="text-sm text-slate-400">
            Configure same-keyboard or dual-gamepad local multiplayer, select characters for Player 1 and Player 2, and inspect 16-bit momentum constants.
          </p>
        </div>
        <button
          onClick={onLaunchGame}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          Launch Active Zone Now
        </button>
      </div>

      {/* Player 1 & Player 2 Roster Selection + Mode Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player 1 Card */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Player 1 Roster</h2>
              <p className="text-xs text-slate-400">Lead Runner · Blue Indicator</p>
            </div>
            <span className="text-xs font-mono text-blue-400">WASD + Space</span>
          </div>

          <div className="space-y-2">
            {(['sonic', 'tails', 'knuckles', 'mighty', 'ray'] as CharacterId[]).map((cid) => {
              const spec = CHARACTER_SPECS[cid];
              const active = p1Character === cid;
              return (
                <button
                  key={cid}
                  onClick={() => onChangeP1Character(cid)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{spec.fullName}</span>
                    <span className="text-xs font-mono text-slate-400">
                      SPD {spec.topSpeed}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{spec.tagline}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Player 2 Card */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Player 2 Roster</h2>
              <p className="text-xs text-slate-400">
                Wingman or Rival · Amber Indicator
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400">Arrows + Enter</span>
          </div>

          <div className="space-y-2">
            {(['sonic', 'tails', 'knuckles', 'mighty', 'ray'] as CharacterId[]).map((cid) => {
              const spec = CHARACTER_SPECS[cid];
              const active = p2Character === cid;
              return (
                <button
                  key={cid}
                  onClick={() => onChangeP2Character(cid)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-500/20 border-amber-500 text-white'
                      : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{spec.fullName}</span>
                    <span className="text-xs font-mono text-slate-400">
                      SPD {spec.topSpeed}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{spec.tagline}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multiplayer Screen Architecture */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">
              Local Multiplayer Architecture
            </h2>
            <p className="text-xs text-slate-400">
              Choose how cameras and rules behave for 2 players
            </p>
          </div>

          <div className="space-y-2">
            {(
              [
                [
                  'solo_ai',
                  '1P + AI Partner (Drop-In Co-op)',
                  'Player 2 is controlled by AI companion logic, but a second human player can press Arrow Keys + Enter at any moment to take over.',
                ],
                [
                  'coop_shared',
                  '2P Co-op Shared Camera',
                  'Both human players share a single dynamic viewport that interpolates between their positions.',
                ],
                [
                  'coop_split',
                  '2P Co-op Independent Split-Screen',
                  'Dedicated dual viewports so Sonic, Tails, and Knuckles can explore upper and lower zone routes simultaneously.',
                ],
                [
                  'versus_split',
                  '2P Versus Split-Screen Zone Race',
                  'Head-to-head race to the Goal Signpost with live percentage distance tracker and score breakdown.',
                ],
              ] as const
            ).map(([mode, title, desc]) => (
              <button
                key={mode}
                onClick={() => onChangeMultiplayerMode(mode)}
                className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                  multiplayerMode === mode
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {desc}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs text-slate-400 mb-1.5">
              Split-Screen Viewport Division
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeSplitOrientation('horizontal')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  splitOrientation === 'horizontal'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-[#0B0F19] border-slate-800 text-slate-400'
                }`}
              >
                Horizontal (Top / Bottom)
              </button>
              <button
                onClick={() => onChangeSplitOrientation('vertical')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  splitOrientation === 'vertical'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-[#0B0F19] border-slate-800 text-slate-400'
                }`}
              >
                Vertical (Left / Right)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & 16-Bit Physics Parameter Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Keyboard & Gamepad Mapping */}
        <div className="lg:col-span-5 bg-[#131B2E] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white">
            Input Bindings & Special Techniques
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#0B0F19] border border-slate-800 rounded-lg space-y-1.5">
              <div className="font-bold text-blue-400 flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                Player 1 Controls (Keyboard / Gamepad 1)
              </div>
              <div className="text-slate-300 font-mono">
                Move: A / D · Look Up: W · Crouch / Roll: S
              </div>
              <div className="text-slate-300 font-mono">
                Jump / Action: Space or J or Z
              </div>
            </div>

            <div className="p-3.5 bg-[#0B0F19] border border-slate-800 rounded-lg space-y-1.5">
              <div className="font-bold text-amber-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Player 2 Controls (Keyboard / Gamepad 2)
              </div>
              <div className="text-slate-300 font-mono">
                Move: Left / Right Arrows · Look Up: Up · Crouch: Down
              </div>
              <div className="text-slate-300 font-mono">
                Jump / Action: Enter or / or Numpad 0
              </div>
            </div>

            <div className="p-3.5 bg-[#0B0F19] border border-slate-800 rounded-lg space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Signature 16-Bit Moves
              </div>
              <p className="text-slate-400">
                <strong className="text-white">Spin Dash (All):</strong> Hold Down while standing still and tap Jump repeatedly to rev up, then release Down.
              </p>
              <p className="text-slate-400">
                <strong className="text-white">Drop Dash (Sonic):</strong> While jumping, press and hold Jump in mid-air to charge; release into an instant boost upon landing.
              </p>
              <p className="text-slate-400">
                <strong className="text-white">Propeller Flight (Tails):</strong> Press Jump while airborne to fly; tap Jump repeatedly to climb higher.
              </p>
              <p className="text-slate-400">
                <strong className="text-white">Glide & Climb (Knuckles):</strong> Hold Jump while airborne to glide across gaps; glide into any solid wall to latch on and climb Up/Down.
              </p>
              <p className="text-slate-400">
                <strong className="text-white">Hammer Drop & Hard Shell (Mighty):</strong> Press Jump in mid-air to slam down with a shockwave that shatters breakable rocks and pops nearby monitors; curled shell deflects spikes &amp; projectiles once per jump.
              </p>
              <p className="text-slate-400">
                <strong className="text-white">Air Glide & Swoop (Ray):</strong> Hold Jump in mid-air to deploy his flying squirrel cape; tap Left/Right or Down/Up to dive for momentum and swoop high into the sky!
              </p>
            </div>
          </div>
        </div>

        {/* Tabular Character Physics Matrix */}
        <div className="lg:col-span-7 bg-[#131B2E] border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Character Physics & Momentum Spec Sheet
            </h3>
            <p className="text-xs text-slate-400">
              Engine sub-pixel constants per 60Hz frame step
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 pr-4 font-medium">Character</th>
                  <th className="py-2.5 px-3 font-medium">Top Speed</th>
                  <th className="py-2.5 px-3 font-medium">Accel</th>
                  <th className="py-2.5 px-3 font-medium">Decel</th>
                  <th className="py-2.5 px-3 font-medium">Jump Impulse</th>
                  <th className="py-2.5 pl-3 font-medium">Special Technique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-mono">
                {(['sonic', 'tails', 'knuckles', 'mighty', 'ray'] as CharacterId[]).map((cid) => {
                  const s = CHARACTER_SPECS[cid];
                  return (
                    <tr key={cid} className="text-slate-200">
                      <td className="py-3 pr-4 font-sans font-bold text-white">
                        {s.fullName}
                      </td>
                      <td className="py-3 px-3">{s.topSpeed.toFixed(2)} px/f</td>
                      <td className="py-3 px-3">{s.acc.toFixed(3)}</td>
                      <td className="py-3 px-3">{s.dec.toFixed(2)}</td>
                      <td className="py-3 px-3">{s.jumpForce.toFixed(1)} px/f</td>
                      <td className="py-3 pl-3 font-sans text-blue-400">
                        {s.abilityName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
