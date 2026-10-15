import { CustomBackgroundConfig, CustomBossConfig, BossHitboxConfig } from '../types/engine';

export function createEmptyBossPixelMatrix(): string[][] {
  // Clean transparent 16x16 pixel matrix with no hardcoded default pattern
  const matrix: string[][] = [];
  for (let r = 0; r < 16; r++) {
    const row: string[] = [];
    for (let c = 0; c < 16; c++) {
      row.push('#00000000'); // fully transparent
    }
    matrix.push(row);
  }
  return matrix;
}

export function createDefaultBossPixelMatrix(): string[][] {
  return createEmptyBossPixelMatrix();
}

export const DEFAULT_BOSS_HITBOX: BossHitboxConfig = {
  coreRadius: 28,
  coreOffsetX: 0,
  coreOffsetY: 0,
  contactDamageRadius: 26,
  contactOffsetX: 0,
  contactOffsetY: 0,
};

export const BOSS_PRESETS: Record<string, CustomBossConfig> = {
  silversonic: {
    id: 'preset_silversonic',
    name: 'Silver Sonic',
    title: 'Mecha Sonic Mk. I Prototype',
    hp: 12,
    maxHp: 12,
    movementAI: 'silversonic_dash',
    moveSpeed: 4.8,
    arenaRadius: 520,
    attackType: 'spikes_radial',
    attackInterval: 80,
    attachments: {
      bumpersLeft: false,
      bumpersRight: false,
      bumpersTop: false,
      bumpersBottom: false,
      spikesFront: true,
      spikesTop: true,
      spikesBottom: false,
      spikesRear: true,
    },
    bumperBounciness: 12,
    texturePreset: 'silversonic',
    primaryColor: '#CBD5E1', // Polished Chrome
    secondaryColor: '#64748B', // Steel Grey
    glowColor: '#EF4444', // Crimson Optic Visor
    trimColor: '#FACC15', // Gold Spine Trim
    scale: 1.0,
    defeatReward: 'chaos_emerald',
  },

  deathegg: {
    id: 'preset_deathegg',
    name: 'Death Egg Robot',
    title: 'Final Orbital Fortress Megamech',
    hp: 24,
    maxHp: 24,
    movementAI: 'deathegg_mech',
    moveSpeed: 2.2,
    arenaRadius: 640,
    attackType: 'rocket_claws',
    attackInterval: 90,
    attachments: {
      bumpersLeft: false,
      bumpersRight: false,
      bumpersTop: false,
      bumpersBottom: false,
      spikesFront: true,
      spikesTop: false,
      spikesBottom: true,
      spikesRear: false,
    },
    bumperBounciness: 14,
    texturePreset: 'deathegg',
    primaryColor: '#EAB308', // Industrial Amber
    secondaryColor: '#334155', // Heavy Gunmetal
    glowColor: '#38BDF8', // Death Egg Cyan Reactors
    trimColor: '#EF4444', // Hazard Crimson
    scale: 2.2,
    defeatReward: 'goal_post',
  },

  egg_pinball: {
    id: 'preset_egg_pinball',
    name: 'Egg Pinball Fortress',
    title: 'Quad-Bumper Sonic Deflector Mech',
    hp: 10,
    maxHp: 10,
    movementAI: 'bounce_frenzy',
    moveSpeed: 4.2,
    arenaRadius: 380,
    attackType: 'plasma_fire',
    attackInterval: 65,
    attachments: {
      bumpersLeft: true,
      bumpersRight: true,
      bumpersTop: true,
      bumpersBottom: true,
      spikesFront: false,
      spikesTop: false,
      spikesBottom: false,
      spikesRear: false,
    },
    bumperBounciness: 15,
    texturePreset: 'eggman_classic',
    primaryColor: '#DC2626', // Classic Red
    secondaryColor: '#FACC15', // Checker Gold
    glowColor: '#38BDF8', // Bumper Pulse
    trimColor: '#F8FAFC', // White Accent
    scale: 1.15,
    defeatReward: 'ring_shower_20',
  },

  drill_crusher: {
    id: 'preset_drill_crusher',
    name: 'Egg Drill-Crusher',
    title: 'Ceiling Burrowing Hazard Mech',
    hp: 10,
    maxHp: 10,
    movementAI: 'drill_charge',
    moveSpeed: 5.4,
    arenaRadius: 360,
    attackType: 'wrecking_ball',
    attackInterval: 75,
    attachments: {
      bumpersLeft: false,
      bumpersRight: false,
      bumpersTop: false,
      bumpersBottom: false,
      spikesFront: true,
      spikesTop: false,
      spikesBottom: true,
      spikesRear: false,
    },
    bumperBounciness: 10,
    texturePreset: 'egg_drill',
    primaryColor: '#7E22CE', // Cavern Purple
    secondaryColor: '#EAB308', // Drill Gold
    glowColor: '#F97316', // Molten Amber
    trimColor: '#1E293B', // Heavy Obsidian
    scale: 1.25,
    defeatReward: 'giant_ring',
  },

  toxic_chem: {
    id: 'preset_toxic_chem',
    name: 'Toxic Slime Mech',
    title: 'Hydraulic Acid Piston Destroyer',
    hp: 14,
    maxHp: 14,
    movementAI: 'chemical_piston',
    moveSpeed: 3.4,
    arenaRadius: 400,
    attackType: 'laser_sweep',
    attackInterval: 70,
    attachments: {
      bumpersLeft: true,
      bumpersRight: true,
      bumpersTop: false,
      bumpersBottom: false,
      spikesFront: false,
      spikesTop: false,
      spikesBottom: true,
      spikesRear: false,
    },
    bumperBounciness: 13,
    texturePreset: 'egg_chemical',
    primaryColor: '#0284C7', // Toxic Blue
    secondaryColor: '#0D9488', // Teal Acid
    glowColor: '#A855F7', // Slime Core
    trimColor: '#FACC15', // Caution Yellow
    scale: 1.3,
    defeatReward: 'ring_shower_20',
  },

  magma_swooper: {
    id: 'preset_magma_swooper',
    name: 'Magma Fire-Swooper',
    title: 'Sub-Terra Volcanic Pyromaniac',
    hp: 8,
    maxHp: 8,
    movementAI: 'magma_dropper',
    moveSpeed: 3.8,
    arenaRadius: 340,
    attackType: 'magma_bomb',
    attackInterval: 50,
    attachments: {
      bumpersLeft: false,
      bumpersRight: false,
      bumpersTop: true,
      bumpersBottom: false,
      spikesFront: false,
      spikesTop: false,
      spikesBottom: true,
      spikesRear: false,
    },
    bumperBounciness: 11,
    texturePreset: 'eggman_classic',
    primaryColor: '#EA580C', // Magma Orange
    secondaryColor: '#991B1B', // Lava Maroon
    glowColor: '#FACC15', // Flame Yellow
    trimColor: '#78350F', // Dark Basalt
    scale: 1.1,
    defeatReward: 'chaos_emerald',
  },

  shadow_metal: {
    id: 'preset_shadow_metal',
    name: 'Shadow Metal Sonic',
    title: 'Dark Hyper-Drive Sonic Duplicate',
    hp: 16,
    maxHp: 16,
    movementAI: 'silversonic_dash',
    moveSpeed: 5.8,
    arenaRadius: 540,
    attackType: 'spikes_radial',
    attackInterval: 60,
    attachments: {
      bumpersLeft: true,
      bumpersRight: true,
      bumpersTop: true,
      bumpersBottom: false,
      spikesFront: true,
      spikesTop: true,
      spikesBottom: false,
      spikesRear: true,
    },
    bumperBounciness: 14,
    texturePreset: 'shadow_metal',
    primaryColor: '#0F172A', // Pitch Carbon
    secondaryColor: '#9333EA', // Neon Violet
    glowColor: '#F43F5E', // Bloodline Core
    trimColor: '#38BDF8', // Electro Pulse
    scale: 1.05,
    defeatReward: 'giant_ring',
  },

  golden_mecha: {
    id: 'preset_golden_mecha',
    name: 'Golden Mecha Overlord',
    title: 'Super Emerald Infused Titan',
    hp: 20,
    maxHp: 20,
    movementAI: 'sine_patrol',
    moveSpeed: 4.6,
    arenaRadius: 440,
    attackType: 'laser_sweep',
    attackInterval: 55,
    attachments: {
      bumpersLeft: true,
      bumpersRight: true,
      bumpersTop: true,
      bumpersBottom: false,
      spikesFront: true,
      spikesTop: false,
      spikesBottom: false,
      spikesRear: false,
    },
    bumperBounciness: 16,
    texturePreset: 'golden_mecha',
    primaryColor: '#FACC15', // Pure Super Gold
    secondaryColor: '#F59E0B', // Amber Alloy
    glowColor: '#FFFFFF', // Super Flare
    trimColor: '#0284C7', // Royal Azure
    scale: 1.4,
    defeatReward: 'chaos_emerald',
  },
};

export const DEFAULT_CUSTOM_BOSS: CustomBossConfig = {
  ...BOSS_PRESETS.silversonic,
  customPixels: createEmptyBossPixelMatrix(),
  hitbox: { ...DEFAULT_BOSS_HITBOX },
};

export const BACKGROUND_PRESETS: Record<string, { label: string; config: CustomBackgroundConfig }> = {
  deathegg: {
    label: 'Death Egg Orbital Station',
    config: {
      theme: 'deathegg',
      skyTop: '#02040A',
      skyMiddle: '#0B1329',
      skyBottom: '#0E2856',
      parallaxSpeedFar: 0.05,
      parallaxSpeedNear: 0.22,
      cloudLayers: false,
      starsActive: true,
      floatingEmbers: false,
      distantCity: false,
      waterReflect: false,
      gridFloor: false,
    },
  },
  cyber_grid: {
    label: 'Neon Synthwave Grid',
    config: {
      theme: 'cyber_grid',
      skyTop: '#0B0424',
      skyMiddle: '#3B0764',
      skyBottom: '#831843',
      parallaxSpeedFar: 0.08,
      parallaxSpeedNear: 0.35,
      cloudLayers: false,
      starsActive: true,
      floatingEmbers: false,
      distantCity: true,
      waterReflect: false,
      gridFloor: true,
    },
  },
  sunset_mountains: {
    label: 'Fiery Sunset Peaks',
    config: {
      theme: 'sunset_mountains',
      skyTop: '#4C1D95',
      skyMiddle: '#B45309',
      skyBottom: '#DC2626',
      parallaxSpeedFar: 0.12,
      parallaxSpeedNear: 0.28,
      cloudLayers: true,
      starsActive: false,
      floatingEmbers: true,
      distantCity: false,
      waterReflect: true,
      gridFloor: false,
    },
  },
  cave: {
    label: 'Mystic Amethyst Cavern',
    config: {
      theme: 'cave',
      skyTop: '#1E1B4B',
      skyMiddle: '#2E1065',
      skyBottom: '#3B0764',
      parallaxSpeedFar: 0.1,
      parallaxSpeedNear: 0.2,
      cloudLayers: false,
      starsActive: false,
      floatingEmbers: false,
      distantCity: false,
      waterReflect: false,
      gridFloor: false,
    },
  },
  chemicalplant: {
    label: 'Chemical Plant Gantries',
    config: {
      theme: 'chemicalplant',
      skyTop: '#082F49',
      skyMiddle: '#0C4A6E',
      skyBottom: '#075985',
      parallaxSpeedFar: 0.12,
      parallaxSpeedNear: 0.26,
      cloudLayers: false,
      starsActive: false,
      floatingEmbers: false,
      distantCity: true,
      waterReflect: false,
      gridFloor: false,
    },
  },
  palms: {
    label: 'Tropical Emerald Shore',
    config: {
      theme: 'palms',
      skyTop: '#0284C7',
      skyMiddle: '#38BDF8',
      skyBottom: '#059669',
      parallaxSpeedFar: 0.12,
      parallaxSpeedNear: 0.3,
      cloudLayers: true,
      starsActive: false,
      floatingEmbers: false,
      distantCity: false,
      waterReflect: true,
      gridFloor: false,
    },
  },
  sanctuary: {
    label: 'Celestial Floating Sanctuary',
    config: {
      theme: 'sanctuary',
      skyTop: '#1E3A8A',
      skyMiddle: '#60A5FA',
      skyBottom: '#FDE68A',
      parallaxSpeedFar: 0.1,
      parallaxSpeedNear: 0.25,
      cloudLayers: true,
      starsActive: true,
      floatingEmbers: true,
      distantCity: false,
      waterReflect: false,
      gridFloor: false,
    },
  },
  deep_space: {
    label: 'Cosmic Star Nebula',
    config: {
      theme: 'deep_space',
      skyTop: '#020617',
      skyMiddle: '#172554',
      skyBottom: '#3B0764',
      parallaxSpeedFar: 0.04,
      parallaxSpeedNear: 0.18,
      cloudLayers: false,
      starsActive: true,
      floatingEmbers: true,
      distantCity: false,
      waterReflect: false,
      gridFloor: false,
    },
  },
};
