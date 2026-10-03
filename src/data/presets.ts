import {
  CharacterId,
  CharacterPhysicsSpec,
  CustomPixelMatrix,
  EditableTextureKey,
  LevelData,
  SpecialStageData,
  SpecialTileType,
  TilesetConfig,
  TilesetPalette,
  TileType,
} from '../types/engine';

export const CHAOS_EMERALD_INFO = [
  { number: 1, name: 'Green Chaos Emerald', color: '#22C55E' },
  { number: 2, name: 'Blue Chaos Emerald', color: '#3B82F6' },
  { number: 3, name: 'Yellow Chaos Emerald', color: '#FACC15' },
  { number: 4, name: 'Purple Chaos Emerald', color: '#A855F7' },
  { number: 5, name: 'Silver Chaos Emerald', color: '#E2E8F0' },
  { number: 6, name: 'Cyan Chaos Emerald', color: '#06B6D4' },
  { number: 7, name: 'Red Chaos Emerald', color: '#EF4444' },
];

export const SUPER_EMERALD_INFO = [
  { number: 1, name: 'Green Super Emerald', color: '#4ADE80' },
  { number: 2, name: 'Blue Super Emerald', color: '#60A5FA' },
  { number: 3, name: 'Gold Super Emerald', color: '#FDE047' },
  { number: 4, name: 'Amethyst Super Emerald', color: '#C084FC' },
  { number: 5, name: 'Diamond Super Emerald', color: '#F8FAFC' },
  { number: 6, name: 'Aqua Super Emerald', color: '#22D3EE' },
  { number: 7, name: 'Crimson Super Emerald', color: '#F87171' },
];

export const CHARACTER_SPECS: Record<CharacterId, CharacterPhysicsSpec> = {
  sonic: {
    id: 'sonic',
    name: 'Sonic',
    fullName: 'Sonic the Hedgehog',
    superName: 'Super Sonic',
    hyperName: 'Hyper Sonic',
    tagline: 'Uncapped Hyper Velocity, Drop Dash & Hyper Flash',
    abilityName: 'Drop Dash, Peel-Out & Hyper Flash',
    abilityDetails:
      'Hold Jump in mid-air to charge a Drop Dash, hold Up + Jump from standstill for a Peel-Out, transform into Super Sonic (7 Chaos Emeralds) or uncapped-speed Hyper Sonic (7 Super Emeralds + Mid-Air Hyper Flash!).',
    acc: 0.095,
    dec: 0.52,
    frc: 0.065,
    topSpeed: 9.6,
    jumpForce: 8.8,
    gravity: 0.36,
    airAcc: 0.16,
    rollFrc: 0.03,
    rollDec: 0.22,
    primaryColor: '#2563EB',
    secondaryColor: '#FDE68A',
    accentColor: '#EF4444',
    eyeColor: '#10B981',
    superColor: '#FACC15',
  },
  tails: {
    id: 'tails',
    name: 'Tails',
    fullName: 'Miles "Tails" Prower',
    superName: 'Super Tails',
    hyperName: 'Hyper Tails',
    tagline: 'Twin-Tail Propeller Flight & Golden Flicky Army',
    abilityName: 'Propeller Flight & Super Flicky Drones',
    abilityDetails:
      'Press Jump while airborne to engage twin-tail helicopter flight and press or hold Jump to climb over cliffs. Super/Hyper Tails has uncapped Hyper speed and 4 Golden Flickies that attack nearby enemies!',
    acc: 0.088,
    dec: 0.48,
    frc: 0.065,
    topSpeed: 8.4,
    jumpForce: 8.4,
    gravity: 0.34,
    airAcc: 0.17,
    rollFrc: 0.032,
    rollDec: 0.22,
    primaryColor: '#F59E0B',
    secondaryColor: '#FFFFFF',
    accentColor: '#EF4444',
    eyeColor: '#38BDF8',
    superColor: '#FDE047',
  },
  knuckles: {
    id: 'knuckles',
    name: 'Knuckles',
    fullName: 'Knuckles the Echidna',
    superName: 'Super Knuckles',
    hyperName: 'Hyper Knuckles',
    tagline: 'Aerial Glide, Wall Climb & Seismic Smash',
    abilityName: 'Glide, Wall Climb & Hyper Tremor',
    abilityDetails:
      'Hold Jump in mid-air to glide horizontally across chasms, latch onto vertical walls to climb Up/Down, and smash directly through Breakable Walls with uncapped Hyper speed.',
    acc: 0.088,
    dec: 0.5,
    frc: 0.068,
    topSpeed: 8.5,
    jumpForce: 8.1,
    gravity: 0.36,
    airAcc: 0.16,
    rollFrc: 0.032,
    rollDec: 0.24,
    primaryColor: '#DC2626',
    secondaryColor: '#FDE68A',
    accentColor: '#FACC15',
    eyeColor: '#A855F7',
    superColor: '#F472B6',
  },
  mighty: {
    id: 'mighty',
    name: 'Mighty',
    fullName: 'Mighty the Armadillo',
    superName: 'Super Mighty',
    hyperName: 'Hyper Mighty',
    tagline: 'Sonic Mania Hammer Drop & Spike-Proof Hard Shell',
    abilityName: 'Hammer Drop & Hard Shell Defense',
    abilityDetails:
      'Press Jump while airborne to slam straight downward with a seismic Hammer Drop that shatters Breakable Blocks underneath and pops nearby monitors! Curled shell deflects spikes and projectiles without losing rings.',
    acc: 0.092,
    dec: 0.52,
    frc: 0.068,
    topSpeed: 9.2,
    jumpForce: 8.6,
    gravity: 0.37,
    airAcc: 0.16,
    rollFrc: 0.028,
    rollDec: 0.22,
    primaryColor: '#DC2626',
    secondaryColor: '#FDE68A',
    accentColor: '#1E293B',
    eyeColor: '#0F172A',
    superColor: '#FDE047',
  },
  ray: {
    id: 'ray',
    name: 'Ray',
    fullName: 'Ray the Flying Squirrel',
    superName: 'Super Ray',
    hyperName: 'Hyper Ray',
    tagline: 'Sonic Mania Air Glide, Dive & Upward Swoop',
    abilityName: 'Air Glide & Momentum Swoop',
    abilityDetails:
      'Press Jump while airborne to spread your flying squirrel cape! Hold Forward to dive and build airspeed, then hold Back to swoop upward and soar to the highest sky towers!',
    acc: 0.09,
    dec: 0.49,
    frc: 0.064,
    topSpeed: 8.9,
    jumpForce: 8.6,
    gravity: 0.34,
    airAcc: 0.18,
    rollFrc: 0.03,
    rollDec: 0.22,
    primaryColor: '#FACC15',
    secondaryColor: '#FEF08A',
    accentColor: '#2563EB',
    eyeColor: '#D97706',
    superColor: '#FEF9C3',
  },
};

export function generateDefaultPixelMatrix(
  surfaceTop: string,
  surfaceHighlight: string,
  soilPrimary: string,
  soilSecondary: string,
  platformTop: string,
  _brickColor: string,
  _brickMortar: string
): CustomPixelMatrix {
  const groundTop: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y < 2) return surfaceHighlight;
      if (y < 5) return surfaceTop;
      if (y === 5) return (x + y) % 3 === 0 ? surfaceTop : soilPrimary;
      const check = (Math.floor(x / 4) + Math.floor((y - 6) / 4)) % 2 === 0;
      return check ? soilPrimary : soilSecondary;
    })
  );

  const groundDeep: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      const check = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0;
      return check ? soilPrimary : soilSecondary;
    })
  );

  const platform: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y < 2) return surfaceHighlight;
      if (y < 6) return platformTop;
      if (y < 10) return x % 4 === 0 ? soilSecondary : soilPrimary;
      return '';
    })
  );

  // Breakable Wall: Pure natural dirt/earth blocks matching the soil checkerboard (NO glassy highlights!)
  const breakableRock: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0 || y === 7 || y === 15) {
        return soilSecondary;
      }
      const rowOffset = y < 8 ? 0 : 4;
      if ((x + rowOffset) % 8 === 0) {
        return soilSecondary;
      }
      const check = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0;
      return check ? soilPrimary : soilSecondary;
    })
  );

  return { groundTop, groundDeep, platform, breakableRock };
}

export function generateChemicalPlantPixelMatrix(pal: TilesetPalette): CustomPixelMatrix {
  const hazardYellow = pal.surfaceTop || '#FACC15';
  const hazardBlack = '#090D16';
  const steelLight = '#64748B';
  const steelRivet = '#E2E8F0';
  const girderBlue = pal.soilPrimary || '#1D4ED8';
  const girderDark = pal.soilSecondary || '#0F172A';
  const neonCyan = pal.platformTop || '#38BDF8';
  const neonMagenta = '#EC4899';

  const groundTop: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0) return steelRivet;
      if (y >= 1 && y <= 3) {
        return (x + y) % 4 < 2 ? hazardYellow : hazardBlack;
      }
      if (y === 4) {
        return x % 4 === 1 ? steelRivet : steelLight;
      }
      if (y === 9 || y === 10) {
        return y === 9 ? neonCyan : '#0284C7';
      }
      if (x === 0 || x === 15 || x === 7 || x === 8) {
        return girderBlue;
      }
      if ((x + y) % 7 === 0 || (x - y + 16) % 7 === 0) {
        return '#2563EB';
      }
      return girderDark;
    })
  );

  const groundDeep: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (x === 0 || x === 15 || y === 0 || y === 15) {
        if ((x === 2 || x === 13) && (y === 0 || y === 15)) return steelRivet;
        return girderBlue;
      }
      if (x === 7 || x === 8) return '#1E40AF';
      if (y === 7) return neonCyan;
      if (y === 8) return neonMagenta;
      if (Math.abs((x % 8) - (y % 8)) <= 1 || Math.abs((x % 8) + (y % 8) - 7) <= 1) {
        return '#3B82F6';
      }
      return girderDark;
    })
  );

  const platform: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0) return steelRivet;
      if (y >= 1 && y <= 4) {
        return (x + y) % 4 < 2 ? hazardYellow : hazardBlack;
      }
      if (y === 5) return girderBlue;
      if (y >= 6 && y <= 8) {
        if (x >= 2 && x <= 5) return neonCyan;
        if (x >= 10 && x <= 13) return neonCyan;
        if (x === 1 || x === 6 || x === 9 || x === 14) return steelLight;
      }
      return '';
    })
  );

  const breakableRock: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0 || y === 7 || y === 15) return girderDark;
      const rowOffset = y < 8 ? 0 : 4;
      if ((x + rowOffset) % 8 === 0) return girderDark;
      const check = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0;
      return check ? girderBlue : girderDark;
    })
  );

  return { groundTop, groundDeep, platform, breakableRock };
}

export function generateDeathEggPixelMatrix(pal: TilesetPalette): CustomPixelMatrix {
  const chromeTop = pal.surfaceHighlight || '#F8FAFC';
  const steelCap = pal.surfaceTop || '#CBD5E1';
  const hazardRed = '#EF4444';
  const hazardYellow = '#FACC15';
  const hullMid = pal.soilPrimary || '#334155';
  const hullDeep = pal.soilSecondary || '#0F172A';
  const reactorGreen = '#22C55E';

  const groundTop: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0) return chromeTop;
      if (y === 1 || y === 2) return steelCap;
      if (y >= 3 && y <= 5) {
        return (x + y) % 4 < 2 ? hazardRed : hazardYellow;
      }
      if (y === 6) return '#64748B';
      if (y === 10) return x % 4 < 2 ? reactorGreen : '#0284C7';
      if (x === 0 || x === 15 || x === 7 || x === 8) return hullMid;
      return hullDeep;
    })
  );

  const groundDeep: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (x === 0 || x === 15 || y === 0 || y === 15) return hullMid;
      if ((x === 3 || x === 12) && (y === 3 || y === 12)) return '#94A3B8';
      if (y === 7 || y === 8) return x % 4 < 2 ? '#1E293B' : '#475569';
      return hullDeep;
    })
  );

  const platform: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0) return chromeTop;
      if (y >= 1 && y <= 4) return (x + y) % 4 < 2 ? hazardRed : hazardYellow;
      if (y >= 5 && y <= 8) return hullMid;
      return '';
    })
  );

  const breakableRock: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0 || y === 7 || y === 15) return hullDeep;
      return (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0 ? hullMid : '#475569';
    })
  );

  const decoWaterfall: string[][] = Array.from({ length: 16 }, () =>
    Array.from({ length: 16 }, () => '#475569')
  );

  const customBlock1: string[][] = Array.from({ length: 16 }, () =>
    Array.from({ length: 16 }, () => '')
  );

  return {
    groundTop,
    groundDeep,
    platform,
    breakableRock,
    decoWaterfall,
    customBlock1,
  };
}

// ============================================================================
// NEW ZONE TILESET GENERATOR: CHEMICAL PLANT ZONE (Blue Chemicals · Metal ·
// Glass Pipes with Blue Chemicals · Blue / Yellow / Light Grey Theme)
// ============================================================================
export function generateChemicalPlantZonePixelMatrix(
  pal: TilesetPalette
): CustomPixelMatrix {
  const steelCap = pal.surfaceHighlight || '#E2E8F0';
  const plateMid = pal.surfaceTop || '#94A3B8';
  const hazardYellow = pal.platformTop || '#FACC15';
  const steelDark = pal.soilSecondary || '#334155';
  const steelBlue = pal.soilPrimary || '#1D4ED8';
  const pipeGlass = '#DBEAFE';
  const chemicalBlue = '#38BDF8';
  const chemicalDeep = '#0369A1';
  const rivet = '#F8FAFC';
  const hazardBlack = '#0F172A';

  const groundTop: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      // Light grey armored steel cap with rivet heads
      if (y === 0) return steelCap;
      if (y === 1) return (x === 0 || x === 15 || x === 7 || x === 8) ? rivet : plateMid;
      // Yellow / black industrial hazard stripe band
      if (y >= 2 && y <= 4) return (x + y) % 4 < 2 ? hazardYellow : hazardBlack;
      if (y === 5) return x % 4 === 1 ? rivet : steelBlue;
      // Glass pipe running through the metal with glowing blue chemicals inside
      if (y === 6) return pipeGlass;
      if (y >= 7 && y <= 9) {
        if (x === 0 || x === 15) return pipeGlass;
        const shimmer = (x + y) % 5 === 0;
        return shimmer ? '#7DD3FC' : chemicalBlue;
      }
      if (y === 10) return pipeGlass;
      if (x === 0 || x === 15 || x === 7 || x === 8) return steelBlue;
      return plateMid;
    })
  );

  const groundDeep: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (x === 0 || x === 15 || y === 0 || y === 15) return steelDark;
      if ((x === 3 || x === 12) && (y === 3 || y === 12)) return rivet;
      // Central glass pipe carrying blue chemicals through the deep metal
      if (y >= 6 && y <= 9 && x >= 4 && x <= 11) {
        if (x === 4 || x === 11) return pipeGlass;
        return (x + y) % 3 === 0 ? '#7DD3FC' : chemicalDeep;
      }
      return (x + y) % 3 === 0 ? '#475569' : steelDark;
    })
  );

  const platform: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0) return steelCap;
      if (y >= 1 && y <= 3) return (x + y) % 4 < 2 ? hazardYellow : hazardBlack;
      if (y === 4) return steelBlue;
      if (y >= 5 && y <= 7 && x % 5 !== 4) return chemicalBlue;
      if (y >= 8 && y <= 9) return plateMid;
      return '';
    })
  );

  const breakableRock: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0 || y === 15 || x === 0 || x === 15) return steelBlue;
      if (y === 7 || x === 7) return steelDark;
      const bolt = (x % 5 === 2 && y % 5 === 2);
      if (bolt) return rivet;
      return (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0 ? plateMid : '#64748B';
    })
  );

  return { groundTop, groundDeep, platform, breakableRock };
}

// ============================================================================
// NEW ZONE TILESET GENERATOR: MYSTIC CAVERNS ZONE (Purple Rocky Spooky Cave
// with Mine Cart Shafts)
// ============================================================================
export function generateMysticCavernPixelMatrix(
  pal: TilesetPalette
): CustomPixelMatrix {
  const rockTop = pal.surfaceTop || '#A855F7';
  const rockLight = pal.surfaceHighlight || '#D8B4FE';
  const rockMid = pal.soilPrimary || '#7E22CE';
  const rockDeep = pal.soilSecondary || '#3B0764';
  const crystal = '#22D3EE';
  const cartWood = '#B45309';
  const cartIron = '#475569';
  const moss = '#4ADE80';

  const groundTop: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0) return (x % 6 === 2) ? crystal : rockLight;
      if (y <= 2) return rockTop;
      if (y === 3) return (x + y) % 5 === 0 ? crystal : rockTop;
      if (y === 4 && x % 7 === 3) return moss;
      const check = (Math.floor(x / 4) + Math.floor((y - 5) / 4)) % 2 === 0;
      return check ? rockMid : rockDeep;
    })
  );

  const groundDeep: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (x === 0 || x === 15 || y === 0 || y === 15) return rockMid;
      // Buried mine cart rail shaft running horizontally through the rock
      if (y >= 7 && y <= 9) {
        if (y === 8) return cartIron;
        if (x % 4 === 0) return cartWood;
        return rockDeep;
      }
      if ((x * 7 + y * 13) % 23 === 0) return crystal;
      return (x + y) % 4 === 0 ? '#5B21B6' : rockDeep;
    })
  );

  const platform: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0) return cartIron;
      if (y === 1) return x % 4 === 0 ? cartIron : cartWood;
      if (y === 2) return cartWood;
      if (y === 3) return x % 8 === 3 ? cartIron : rockMid;
      return '';
    })
  );

  const breakableRock: string[][] = Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === 0 || y === 15) return rockDeep;
      const crack = (x + y * 2) % 9 === 0 || (x * 2 - y) % 11 === 0;
      if (crack) return '#2E1065';
      return (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0 ? rockMid : '#6B21A8';
    })
  );

  return { groundTop, groundDeep, platform, breakableRock };
}

export function generateBlankWhiteBlockMatrix(): string[][] {
  return Array.from({ length: 16 }, () =>
    Array.from({ length: 16 }, () => '#FFFFFF')
  );
}

export function generateZonePixelMatrix(
  decorStyle: TilesetConfig['decorStyle'],
  pal: TilesetPalette
): CustomPixelMatrix {
  const base =
    decorStyle === 'chemical'
      ? generateChemicalPlantPixelMatrix(pal)
      : decorStyle === 'chemicalplant'
      ? generateChemicalPlantZonePixelMatrix(pal)
      : decorStyle === 'cave'
      ? generateMysticCavernPixelMatrix(pal)
      : decorStyle === 'deathegg'
      ? generateDeathEggPixelMatrix(pal)
      : generateDefaultPixelMatrix(
          pal.surfaceTop,
          pal.surfaceHighlight,
          pal.soilPrimary,
          pal.soilSecondary,
          pal.platformTop,
          pal.brickColor,
          pal.brickMortar
        );

  return {
    ...base,
    customBlock1: generateBlankWhiteBlockMatrix(),
    customBlock2: generateBlankWhiteBlockMatrix(),
    customBlock3: generateBlankWhiteBlockMatrix(),
    customBlock4: generateBlankWhiteBlockMatrix(),
    customBlock5: generateBlankWhiteBlockMatrix(),
    customBlock6: generateBlankWhiteBlockMatrix(),
    customBlock7: generateBlankWhiteBlockMatrix(),
    customBlock8: generateBlankWhiteBlockMatrix(),
    customBlock9: generateBlankWhiteBlockMatrix(),
    customBlock10: generateBlankWhiteBlockMatrix(),
  };
}

export function getDefaultTilePixelMatrix(
  key: EditableTextureKey,
  decorStyle: TilesetConfig['decorStyle'],
  pal: TilesetPalette
): string[][] {
  const core = generateZonePixelMatrix(decorStyle, pal);
  if (core[key]) {
    return core[key]!.map((row) => [...row]);
  }
  if (key.startsWith('customBlock')) {
    return generateBlankWhiteBlockMatrix();
  }

  // Slope Tiles (16x16 pixel representations)
  if (
    key === 'slopeUpLow' ||
    key === 'slopeUpHigh' ||
    key === 'slopeDownHigh' ||
    key === 'slopeDownLow' ||
    key === 'slope45Up' ||
    key === 'slope45Down'
  ) {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        let topY = 0;
        if (key === 'slopeUpLow') topY = 16 - Math.floor((x / 16) * 8);
        else if (key === 'slopeUpHigh') topY = 8 - Math.floor((x / 16) * 8);
        else if (key === 'slopeDownHigh') topY = Math.floor((x / 16) * 8);
        else if (key === 'slopeDownLow') topY = 8 + Math.floor((x / 16) * 8);
        else if (key === 'slope45Up') topY = 15 - x;
        else if (key === 'slope45Down') topY = x;

        if (y < topY) return '';
        if (y === topY) return pal.surfaceHighlight;
        if (y <= topY + 2) return pal.surfaceTop;
        return core.groundDeep[y][x];
      })
    );
  }

  if (key === 'spikes') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y >= 10) {
          return y === 10 || y === 15 || x === 0 || x === 15
            ? '#64748B'
            : '#334155';
        }
        const spikeCol = x % 4;
        const distFromTip = y - 1;
        if (distFromTip >= 0 && spikeCol >= 1 && spikeCol <= 2) {
          return pal.hazardColor || '#E2E8F0';
        }
        if (y >= 5 && (spikeCol === 0 || spikeCol === 3)) {
          return '#94A3B8';
        }
        return '';
      })
    );
  }

  if (key === 'ceilingSpikes') {
    // Ceiling Spikes: steel mounting plate on top, spikes thrusting DOWNWARD
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y <= 5) {
          return y === 0 || x === 0 || x === 15 ? '#475569' : '#334155';
        }
        const spikeCol = x % 4;
        const distFromTip = 14 - y;
        if (spikeCol >= 1 && spikeCol <= 2 && distFromTip >= 0) {
          return pal.hazardColor || '#E2E8F0';
        }
        if (y <= 10 && (spikeCol === 0 || spikeCol === 3)) return '#94A3B8';
        return '';
      })
    );
  }

  if (key === 'stalactite') {
    // Mystic Caverns Falling Rock Stalactite: purple rock cone pointing down
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y === 0) return '#334155';
        const halfWidth = Math.max(1, 8 - y * 0.78);
        const dist = Math.abs(x - 7.5);
        if (dist > halfWidth) return '';
        if (dist > halfWidth - 1.5) return '#4C1D95';
        if (y % 4 === 0) return '#2E1065';
        return (x + y) % 3 === 0 ? '#7E22CE' : '#5B21B6';
      })
    );
  }

  if (key === 'acidPool') {
    // Boiling Toxic Blue Chemical Pool with bubbling surface
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y === 0) return (x + y) % 3 === 0 ? '#E0F2FE' : '';
        if (y <= 2) return '#7DD3FC';
        if (y <= 5) return (x + y) % 4 === 0 ? '#BAE6FD' : '#38BDF8';
        if (y <= 10) return (x * 3 + y) % 5 === 0 ? '#0EA5E9' : '#0284C7';
        return '#075985';
      })
    );
  }

  if (key === 'steamVent') {
    // Steam Vent: riveted steel grate with dark vent slits
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (x === 0 || x === 15 || y === 0 || y === 15) return '#64748B';
        if ((x === 2 || x === 13) && (y === 2 || y === 13)) return '#F8FAFC';
        if (x % 5 === 1 && y >= 4 && y <= 11) return '#0F172A';
        return (x + y) % 3 === 0 ? '#475569' : '#334155';
      })
    );
  }

  if (key === 'tubeEntry' || key === 'tubeExit') {
    // Chemical Plant Travel Tube: glass pipe ring filled with blue chemicals
    const isExit = key === 'tubeExit';
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        const dist = Math.hypot(x - 7.5, y - 7.5);
        if (dist > 7.6) return '';
        if (dist > 5.6) return isExit ? '#CBD5E1' : '#94A3B8';
        if (dist > 4.4) return '#DBEAFE';
        if (!isExit && y < 6) return '';
        if (isExit && y > 10) return '';
        return (x + y) % 4 === 0 ? '#7DD3FC' : '#0EA5E9';
      })
    );
  }

  if (key === 'bossChemical' || key === 'bossMystic') {
    // Tileset Studio boss icon plates (drawn as the mech chassis core in-game)
    const isChemical = key === 'bossChemical';
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        const hull = isChemical ? '#94A3B8' : '#6B21A8';
        const trim = isChemical ? '#FACC15' : '#22D3EE';
        if (x < 1 || x > 14 || y < 1 || y > 14) return '#0F172A';
        if (y === 1 || y === 14 || x === 1 || x === 14) return trim;
        if (y >= 5 && y <= 10 && x >= 4 && x <= 11) {
          if (Math.hypot(x - 7.5, y - 7.5) <= 2.6) return trim;
          return '#0F172A';
        }
        return hull;
      })
    );
  }

  if (key === 'lava') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y === 0) return (x + y) % 3 === 0 ? '#FEF08A' : '';
        if (y <= 2) return '#FACC15';
        if (y <= 6) return (x + y) % 4 === 0 ? '#FACC15' : '#F97316';
        if (y <= 11) return (x * 3 + y) % 5 === 0 ? '#F97316' : '#DC2626';
        return '#991B1B';
      })
    );
  }

  if (key === 'springYellow' || key === 'springRed') {
    const padColor = key === 'springRed' ? '#EF4444' : '#FACC15';
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y >= 6 && y <= 9 && x >= 1 && x <= 14) {
          if (y === 7 && x >= 3 && x <= 12) return '#FFFFFF';
          return padColor;
        }
        if (y >= 10 && x >= 3 && x <= 12) {
          return (x + y) % 2 === 0 ? '#94A3B8' : '#475569';
        }
        return '';
      })
    );
  }

  if (key === 'springRight' || key === 'springLeft') {
    const isRight = key === 'springRight';
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        const px = isRight ? x : 15 - x;
        if (y >= 3 && y <= 12 && px <= 7) return '#94A3B8';
        if (y >= 1 && y <= 14 && px >= 7 && px <= 10) {
          return px === 8 ? '#FFFFFF' : '#EF4444';
        }
        return '';
      })
    );
  }

  if (key === 'boosterRight' || key === 'boosterLeft') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y < 11) return '';
        if (y === 11 || y === 15) return '#1E293B';
        return (x + y) % 3 === 0 ? '#EF4444' : '#FACC15';
      })
    );
  }

  if (key === 'ring' || key === 'giantRing') {
    const isGiant = key === 'giantRing';
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        const d = Math.hypot(x - 7.5, y - 7.5);
        const outer = isGiant ? 7.2 : 5.5;
        const inner = isGiant ? 4.2 : 3.0;
        if (d <= outer && d >= inner) {
          return x + y < 14 ? '#FEF08A' : '#FACC15';
        }
        return '';
      })
    );
  }

  if (key.startsWith('monitor')) {
    const iconColor =
      key === 'monitorRing' || key === 'monitorInvincibility' || key === 'monitorSuper'
        ? '#FACC15'
        : key === 'monitorSpeed' || key === 'monitorEggman'
        ? '#EF4444'
        : key === 'monitorFlame'
        ? '#F97316'
        : key === 'monitorBubble'
        ? '#34D399'
        : key === 'monitorSwap'
        ? '#A855F7'
        : '#38BDF8';
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y >= 2 && y <= 13 && x >= 2 && x <= 13) {
          if (y === 2) return '#94A3B8';
          if (y >= 4 && y <= 11 && x >= 3 && x <= 12) {
            if (Math.hypot(x - 7.5, y - 7.5) <= 3.2) return iconColor;
            return '#090D16';
          }
          return key === 'monitorSuper' ? '#CA8A04' : '#475569';
        }
        if (y >= 14 && x >= 4 && x <= 11) return '#64748B';
        return '';
      })
    );
  }

  if (key === 'decoWaterfall') {
    if (decorStyle === 'deathegg') {
      return Array.from({ length: 16 }, () =>
        Array.from({ length: 16 }, () => '#475569')
      );
    }
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (x === 0 || x === 15) return '';
        if ((x + y) % 5 === 0) return '#E0F2FE';
        if (x % 3 === 0) return '#0284C7';
        return '#0EA5E9';
      })
    );
  }

  if (key === 'oneWayDoor') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (x < 3 || x > 12) return '';
        if (x === 3 || x === 12) return '#475569';
        if (y === 0 || y === 15) return '#FACC15';
        const chevron = (x + Math.abs(y - 7.5)) % 5 < 2;
        return chevron ? '#38BDF8' : '#0F172A';
      })
    );
  }

  if (key === 'oneWayDoorLocked') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (x < 2 || x > 13) return '#1E293B';
        if (x === 2 || x === 13 || y === 0 || y === 15) return '#EF4444';
        if ((x + y) % 4 < 2 && (y <= 3 || y >= 12)) return '#FACC15';
        return y % 4 === 0 ? '#334155' : '#475569';
      })
    );
  }

  if (key === 'bgBrick') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y % 4 === 0) return '#0F172A';
        const offset = Math.floor(y / 4) % 2 === 0 ? 0 : 4;
        if ((x + offset) % 8 === 0) return '#0F172A';
        return (x + y) % 3 === 0 ? '#334155' : '#1E293B';
      })
    );
  }

  if (key === 'bgPillar') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (x < 2 || x > 13) return '';
        if (y === 0 || y === 15) return '#64748B';
        if (x === 2 || x === 13 || x === 5 || x === 10) return '#1E293B';
        return '#475569';
      })
    );
  }

  if (key === 'bgWindow') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (x === 0 || x === 15 || y === 0 || y === 15) return '#334155';
        if (x >= 4 && x <= 11 && y >= 3 && y <= 13) {
          if (x === 7 || x === 8 || y === 8) return '#1E293B';
          return '#0284C7';
        }
        return '#1E293B';
      })
    );
  }

  if (key === 'bgLattice') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (x === 0 || x === 15 || y === 0 || y === 15) return '#334155';
        if (Math.abs((x % 8) - (y % 8)) <= 1 || Math.abs((x % 8) + (y % 8) - 7) <= 1) {
          return '#475569';
        }
        return '';
      })
    );
  }

  if (key === 'bgFoliage') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        const d = Math.hypot(x - 7.5, y - 7.5);
        if (d > 8.5) return '#14532D';
        return (x + y) % 3 === 0 ? '#16A34A' : '#15803D';
      })
    );
  }

  if (key === 'movingPlatform' || key === 'movingPlatformVert' || key === 'swingingPlatform') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y < 2) return pal.surfaceHighlight;
        if (y < 5) return pal.surfaceTop;
        if (y < 10) return (x + y) % 2 === 0 ? pal.soilPrimary : pal.soilSecondary;
        return '';
      })
    );
  }

  if (key === 'monitor1up') {
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (x < 1 || x > 14 || y < 1) return '';
        if (y >= 14) return x >= 4 && x <= 11 ? '#475559' : '';
        if (x === 1 || x === 14 || y === 1 || y === 13) return '#94A3B8';
        if (x === 2 || x === 13 || y === 2 || y === 12) return '#334155';
        if (x >= 5 && x <= 10 && y >= 5 && y <= 10) return '#2563EB';
        return '#090D16';
      })
    );
  }

  if (key === 'checkpoint' || key === 'goalPost') {
    const topColor = key === 'goalPost' ? '#2563EB' : '#EF4444';
    return Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => {
        if (y >= 1 && y <= 6 && x >= 3 && x <= 12) {
          return y === 1 || y === 6 || x === 3 || x === 12 ? '#FACC15' : topColor;
        }
        if (y >= 7 && x >= 7 && x <= 8) return '#CBD5E1';
        return '';
      })
    );
  }

  // Remaining Zone Gimmicks (Bumper, Dash Ring, Crusher, Geyser, Shooters, Conveyors, Updraft, Teleport Orb)
  return Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (key === 'bumper' || key === 'teleportOrb' || key === 'dashRing') {
        const d = Math.hypot(x - 7.5, y - 7.5);
        if (d > 6.8) return '';
        if (d > 5.0) return '#FACC15';
        if (d < 2.2) return '#FFFFFF';
        return key === 'bumper' ? '#EF4444' : '#2563EB';
      }
      if (key === 'conveyorRight' || key === 'conveyorLeft') {
        if (y >= 7) return '';
        if (y === 0 || y === 6 || x === 0 || x === 15) return '#38BDF8';
        return x % 4 < 2 ? '#FACC15' : '#0F172A';
      }
      if (x === 0 || x === 15 || y === 0 || y === 15) return pal.surfaceTop;
      return (x + y) % 2 === 0 ? pal.soilPrimary : pal.soilSecondary;
    })
  );
}

const NEO_STARLIGHT_PALETTE: TilesetPalette = {
  skyTop: '#040611',
  skyBottom: '#0F172A',
  mountainFar: '#1E1B4B',
  hillNear: '#1D4ED8',
  waterColor: '#6D28D9',
  surfaceTop: '#FACC15',
  surfaceHighlight: '#FEF08A',
  soilPrimary: '#1D4ED8',
  soilSecondary: '#090D16',
  platformTop: '#38BDF8',
  brickColor: '#334155',
  brickMortar: '#090D16',
  hazardColor: '#F43F5E',
};

export const DEFAULT_TILESETS: TilesetConfig[] = [
  {
    id: 'emerald-coast',
    name: 'Emerald Mountains Zone',
    zoneSubtitle: 'Alpine Checkerboard Cliffs & Emerald Waterfalls',
    decorStyle: 'palms',
    palette: {
      skyTop: '#0F296B',
      skyBottom: '#2563EB',
      mountainFar: '#1E3A8A',
      hillNear: '#15803D',
      waterColor: '#0284C7',
      surfaceTop: '#22C55E',
      surfaceHighlight: '#86EFAC',
      soilPrimary: '#B45309',
      soilSecondary: '#78350F',
      platformTop: '#FACC15',
      brickColor: '#64748B',
      brickMortar: '#1E293B',
      hazardColor: '#E2E8F0',
    },
    customPixels: generateDefaultPixelMatrix(
      '#22C55E',
      '#86EFAC',
      '#B45309',
      '#78350F',
      '#FACC15',
      '#64748B',
      '#1E293B'
    ),
  },
  {
    id: 'marble-ruin',
    name: 'Marble Zone',
    zoneSubtitle: 'Ancient Violet Columns & Molten Magma Chambers',
    decorStyle: 'marble',
    palette: {
      skyTop: '#1E1035',
      skyBottom: '#4C1D95',
      mountainFar: '#3B0764',
      hillNear: '#581C87',
      waterColor: '#EA580C',
      surfaceTop: '#16A34A',
      surfaceHighlight: '#4ADE80',
      soilPrimary: '#7E22CE',
      soilSecondary: '#4C1D95',
      platformTop: '#E2E8F0',
      brickColor: '#9333EA',
      brickMortar: '#2E1065',
      hazardColor: '#FB923C',
    },
    customPixels: generateDefaultPixelMatrix(
      '#16A34A',
      '#4ADE80',
      '#7E22CE',
      '#4C1D95',
      '#E2E8F0',
      '#9333EA',
      '#2E1065'
    ),
  },
  {
    id: 'chemical-plant',
    name: 'Neo Starlight Zone',
    zoneSubtitle: 'Neon Starlight Girders, Cyber Highways & Booster Loops',
    decorStyle: 'chemical',
    palette: NEO_STARLIGHT_PALETTE,
    customPixels: generateChemicalPlantPixelMatrix(NEO_STARLIGHT_PALETTE),
  },
  {
    id: 'sky-sanctuary',
    name: 'Hill Top Peaks Zone',
    zoneSubtitle: 'Cobalt Mountain Peaks, Pine Ridges & High-Altitude Clouds',
    decorStyle: 'sanctuary',
    palette: {
      skyTop: '#07193D',
      skyBottom: '#1D4ED8',
      mountainFar: '#1E3A8A',
      hillNear: '#2563EB',
      waterColor: '#0284C7',
      surfaceTop: '#22C55E',
      surfaceHighlight: '#4ADE80',
      soilPrimary: '#1D4ED8',
      soilSecondary: '#1E3A8A',
      platformTop: '#38BDF8',
      brickColor: '#2563EB',
      brickMortar: '#0F172A',
      hazardColor: '#F43F5E',
    },
    customPixels: generateDefaultPixelMatrix(
      '#22C55E',
      '#4ADE80',
      '#1D4ED8',
      '#1E3A8A',
      '#38BDF8',
      '#2563EB',
      '#0F172A'
    ),
  },
  {
    id: 'death-egg',
    name: 'Death Egg Zone',
    zoneSubtitle: 'Orbital Battle Station, Silver Sonic Chamber & Final Mecha Hangar',
    decorStyle: 'deathegg',
    palette: {
      skyTop: '#02040A',
      skyBottom: '#090D16',
      mountainFar: '#1E293B',
      hillNear: '#334155',
      waterColor: '#0284C7',
      surfaceTop: '#CBD5E1',
      surfaceHighlight: '#F8FAFC',
      soilPrimary: '#334155',
      soilSecondary: '#0F172A',
      platformTop: '#EF4444',
      brickColor: '#475569',
      brickMortar: '#090D16',
      hazardColor: '#FACC15',
    },
    customPixels: generateDeathEggPixelMatrix({
      skyTop: '#02040A',
      skyBottom: '#090D16',
      mountainFar: '#1E293B',
      hillNear: '#334155',
      waterColor: '#0284C7',
      surfaceTop: '#CBD5E1',
      surfaceHighlight: '#F8FAFC',
      soilPrimary: '#334155',
      soilSecondary: '#0F172A',
      platformTop: '#EF4444',
      brickColor: '#475569',
      brickMortar: '#090D16',
      hazardColor: '#FACC15',
    }),
  },
  {
    id: 'chemical-plant-zone',
    name: 'Chemical Plant Zone',
    zoneSubtitle: 'Blue Chemical Vats, Glass Travel Tubes & Steel Hydraulic Gantries',
    decorStyle: 'chemicalplant',
    palette: {
      skyTop: '#0B2A5B',
      skyBottom: '#3B82F6',
      mountainFar: '#1E3A8A',
      hillNear: '#94A3B8',
      waterColor: '#38BDF8',
      surfaceTop: '#94A3B8',
      surfaceHighlight: '#E2E8F0',
      soilPrimary: '#1D4ED8',
      soilSecondary: '#334155',
      platformTop: '#FACC15',
      brickColor: '#64748B',
      brickMortar: '#0F172A',
      hazardColor: '#E2E8F0',
    },
    customPixels: generateChemicalPlantZonePixelMatrix({
      skyTop: '#0B2A5B',
      skyBottom: '#3B82F6',
      mountainFar: '#1E3A8A',
      hillNear: '#94A3B8',
      waterColor: '#38BDF8',
      surfaceTop: '#94A3B8',
      surfaceHighlight: '#E2E8F0',
      soilPrimary: '#1D4ED8',
      soilSecondary: '#334155',
      platformTop: '#FACC15',
      brickColor: '#64748B',
      brickMortar: '#0F172A',
      hazardColor: '#E2E8F0',
    }),
  },
  {
    id: 'mystic-caverns',
    name: 'Mystic Caverns Zone',
    zoneSubtitle: 'Purple Spooky Caverns, Crystal Grottoes & Mine Cart Shafts',
    decorStyle: 'cave',
    palette: {
      skyTop: '#160B2E',
      skyBottom: '#3B0764',
      mountainFar: '#2E1065',
      hillNear: '#4C1D95',
      waterColor: '#7C3AED',
      surfaceTop: '#A855F7',
      surfaceHighlight: '#D8B4FE',
      soilPrimary: '#7E22CE',
      soilSecondary: '#3B0764',
      platformTop: '#B45309',
      brickColor: '#6B21A8',
      brickMortar: '#2E1065',
      hazardColor: '#E9D5FF',
    },
    customPixels: generateMysticCavernPixelMatrix({
      skyTop: '#160B2E',
      skyBottom: '#3B0764',
      mountainFar: '#2E1065',
      hillNear: '#4C1D95',
      waterColor: '#7C3AED',
      surfaceTop: '#A855F7',
      surfaceHighlight: '#D8B4FE',
      soilPrimary: '#7E22CE',
      soilSecondary: '#3B0764',
      platformTop: '#B45309',
      brickColor: '#6B21A8',
      brickMortar: '#2E1065',
      hazardColor: '#E9D5FF',
    }),
  },
];

function createEmptyGrid(width: number, height: number): number[][] {
  return Array.from({ length: height }, () => Array(width).fill(TileType.EMPTY));
}

function fillRect(
  grid: number[][],
  x0: number,
  y0: number,
  w: number,
  h: number,
  topTile: TileType,
  deepTile: TileType
) {
  const height = grid.length;
  const width = grid[0].length;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (y >= 0 && y < height && x >= 0 && x < width) {
        grid[y][x] = y === y0 ? topTile : deepTile;
      }
    }
  }
}

function addSlopeRunUp(grid: number[][], startX: number, baseY: number, steps: number) {
  let curX = startX;
  let curY = baseY;
  for (let i = 0; i < steps; i++) {
    if (curX + 1 < grid[0].length && curY >= 0) {
      grid[curY][curX] = TileType.SLOPE_UP_LOW;
      grid[curY][curX + 1] = TileType.SLOPE_UP_HIGH;
      fillRect(
        grid,
        curX,
        curY + 1,
        2,
        grid.length - (curY + 1),
        TileType.GROUND_DEEP,
        TileType.GROUND_DEEP
      );
      curX += 2;
      curY -= 1;
    }
  }
}

function addSlopeRunDown(grid: number[][], startX: number, topY: number, steps: number) {
  let curX = startX;
  let curY = topY;
  for (let i = 0; i < steps; i++) {
    if (curX + 1 < grid[0].length && curY < grid.length) {
      grid[curY][curX] = TileType.SLOPE_DOWN_HIGH;
      grid[curY][curX + 1] = TileType.SLOPE_DOWN_LOW;
      fillRect(
        grid,
        curX,
        curY + 1,
        2,
        grid.length - (curY + 1),
        TileType.GROUND_DEEP,
        TileType.GROUND_DEEP
      );
      curX += 2;
      curY += 1;
    }
  }
}

// ============================================================================
// LEVEL 1: EMERALD MOUNTAINS ZONE — ACT 1
// ============================================================================
function buildEmeraldMountainsAct1(): LevelData {
  const width = 240;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  fillRect(grid, 0, 24, 20, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][4] = TileType.SPAWN_P1;
  grid[23][2] = TileType.SPAWN_P2;

  for (let x = 7; x <= 13; x++) grid[22][x] = TileType.RING;
  grid[23][15] = TileType.MONITOR_FLAME;
  grid[23][17] = TileType.MONITOR_LIGHTNING;
  grid[23][19] = TileType.MONITOR_SPEED;

  addSlopeRunUp(grid, 20, 23, 4);
  fillRect(grid, 28, 20, 14, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let x = 29; x <= 39; x++) grid[18][x] = TileType.RING;
  grid[19][34] = TileType.BADNIK_MOTOBUG;
  grid[15][38] = TileType.BADNIK_BUZZ;
  grid[19][40] = TileType.BADNIK_CRAB;
  grid[17][36] = TileType.GIMMICK_BUMPER;

  fillRect(grid, 30, 15, 8, 1, TileType.PLATFORM, TileType.PLATFORM);
  grid[14][32] = TileType.MONITOR_BUBBLE;
  grid[14][35] = TileType.MONITOR_RING;
  grid[14][37] = TileType.MONITOR_1UP;
  grid[12][39] = TileType.GIMMICK_DASH_RING;

  addSlopeRunDown(grid, 42, 20, 4);
  fillRect(grid, 50, 24, 30, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][52] = TileType.BOOSTER_RIGHT;
  grid[18][58] = TileType.LOOP_HEAD;
  for (let lx = 59; lx <= 62; lx++) grid[20][lx] = TileType.RING;
  grid[23][67] = TileType.BADNIK_MOTOBUG;
  grid[23][71] = TileType.BADNIK_CRAB;
  grid[19][73] = TileType.GIMMICK_BUMPER;
  grid[23][75] = TileType.CHECKPOINT;

  // Section 2: Breakable Wall Secret Tunnel & Lava Canyon
  fillRect(grid, 80, 17, 18, 5, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 80, 26, 18, 6, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[22][80] = TileType.BREAKABLE_ROCK;
  grid[23][80] = TileType.BREAKABLE_ROCK;
  grid[24][80] = TileType.BREAKABLE_ROCK;
  grid[25][80] = TileType.BREAKABLE_ROCK;

  for (let x = 82; x <= 91; x++) {
    grid[24][x] = TileType.RING;
    grid[25][x] = TileType.RING;
  }
  grid[25][93] = TileType.MONITOR_FLAME;
  grid[24][95] = TileType.GIANT_RING;

  grid[23][78] = TileType.SPRING_RED;
  grid[16][82] = TileType.CHECKPOINT;
  grid[16][85] = TileType.MONITOR_RING;
  for (let x = 87; x <= 95; x++) grid[15][x] = TileType.RING;
  grid[16][93] = TileType.BADNIK_CRAB;
  grid[13][96] = TileType.GIMMICK_DASH_RING;

  // Molten Lava Canyon (x: 98..126) with Pinball Star Bumpers!
  fillRect(grid, 98, 28, 28, 4, TileType.GROUND_DEEP, TileType.GROUND_DEEP);
  for (let lx = 98; lx < 126; lx++) {
    grid[27][lx] = TileType.LAVA;
  }
  grid[18][104] = TileType.BADNIK_BUZZ;
  grid[18][114] = TileType.BADNIK_BUZZ;
  grid[19][109] = TileType.GIMMICK_BUMPER;
  grid[19][119] = TileType.GIMMICK_BUMPER;
  for (let px = 100; px <= 120; px += 5) {
    fillRect(grid, px, 23, 3, 1, TileType.PLATFORM, TileType.PLATFORM);
    grid[21][px + 1] = TileType.RING;
  }
  fillRect(grid, 102, 14, 18, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let x = 104; x <= 116; x += 2) grid[12][x] = TileType.RING;
  grid[13][110] = TileType.MONITOR_INVINCIBILITY;
  grid[10][114] = TileType.BADNIK_BUZZ;
  grid[12][118] = TileType.GIANT_RING;

  // Upgraded to RED SPRING at x: 127!
  fillRect(grid, 126, 24, 14, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][127] = TileType.SPRING_RED;
  grid[17][129] = TileType.GIMMICK_DASH_RING;
  grid[23][130] = TileType.CHECKPOINT;
  grid[23][133] = TileType.MONITOR_LIGHTNING;
  grid[23][135] = TileType.MONITOR_BUBBLE;

  // Section 3: High-Speed Rollercoaster & Twin 360° Loops
  addSlopeRunUp(grid, 140, 23, 3);
  fillRect(grid, 146, 21, 8, 11, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let x = 147; x <= 152; x++) grid[19][x] = TileType.RING;
  grid[20][150] = TileType.BADNIK_MOTOBUG;

  addSlopeRunDown(grid, 154, 21, 3);
  fillRect(grid, 160, 24, 36, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][161] = TileType.BOOSTER_RIGHT;
  grid[18][166] = TileType.LOOP_HEAD;
  for (let lx = 167; lx <= 170; lx++) grid[20][lx] = TileType.RING;

  grid[23][175] = TileType.BOOSTER_RIGHT;
  grid[18][180] = TileType.LOOP_HEAD;
  for (let lx = 181; lx <= 184; lx++) grid[20][lx] = TileType.RING;

  grid[23][190] = TileType.CHECKPOINT;
  grid[23][192] = TileType.MONITOR_RING;
  grid[23][194] = TileType.MONITOR_SHIELD;

  // Section 4: Act 1 Final High-Speed Sprint to Goal Signpost (Bosses only appear in Act 2!)
  fillRect(grid, 196, 24, 44, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][197] = TileType.BOOSTER_RIGHT;
  for (let x = 199; x <= 220; x += 2) grid[22][x] = TileType.RING;
  grid[23][210] = TileType.BADNIK_MOTOBUG;
  grid[19][216] = TileType.GIMMICK_BUMPER;

  grid[23][230] = TileType.GOAL_POST;

  return {
    id: 'emerald-mountains-act-1',
    name: 'Emerald Mountains',
    act: 1,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'emerald-coast',
    grid,
    p1Spawn: { x: 4, y: 22 },
    p2Spawn: { x: 2, y: 22 },
  };
}

// ============================================================================
// LEVEL 2: EMERALD MOUNTAINS ZONE — ACT 2
// ============================================================================
function buildEmeraldMountainsAct2(): LevelData {
  const width = 220;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  fillRect(grid, 0, 20, 18, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[19][4] = TileType.SPAWN_P1;
  grid[19][2] = TileType.SPAWN_P2;
  for (let x = 6; x <= 14; x++) grid[18][x] = TileType.RING;
  grid[19][15] = TileType.MONITOR_SPEED;
  grid[19][17] = TileType.MONITOR_LIGHTNING;

  addSlopeRunDown(grid, 18, 20, 4);
  fillRect(grid, 26, 24, 38, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][28] = TileType.BOOSTER_RIGHT;
  grid[18][34] = TileType.LOOP_HEAD;
  for (let x = 35; x <= 38; x++) grid[20][x] = TileType.RING;

  grid[23][43] = TileType.BADNIK_MOTOBUG;
  grid[19][46] = TileType.GIMMICK_BUMPER;
  grid[23][48] = TileType.BOOSTER_RIGHT;
  grid[18][53] = TileType.LOOP_HEAD;
  grid[23][61] = TileType.CHECKPOINT;

  // Split Waterfall Terraces & Secret Breakable Vault (Red Spring at x: 63!)
  fillRect(grid, 64, 16, 26, 4, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 64, 24, 26, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][63] = TileType.SPRING_RED;
  grid[13][65] = TileType.GIMMICK_DASH_RING;

  // Scenic Waterfall Deco cascading down the cliff terrace!
  for (let wy = 16; wy <= 23; wy++) {
    grid[wy][62] = TileType.DECO_WATERFALL;
    grid[wy][89] = TileType.DECO_WATERFALL;
  }

  grid[20][68] = TileType.BREAKABLE_ROCK;
  grid[21][68] = TileType.BREAKABLE_ROCK;
  grid[22][68] = TileType.BREAKABLE_ROCK;
  grid[23][68] = TileType.BREAKABLE_ROCK;
  for (let x = 70; x <= 80; x++) grid[22][x] = TileType.RING;
  grid[23][82] = TileType.MONITOR_RING;
  grid[22][85] = TileType.GIANT_RING;
  grid[23][88] = TileType.SPRING_RED;

  for (let x = 66; x <= 84; x += 2) grid[14][x] = TileType.RING;
  grid[15][74] = TileType.BADNIK_CRAB;
  grid[12][80] = TileType.BADNIK_BUZZ;
  grid[15][86] = TileType.MONITOR_FLAME;

  // Waterfall Island Chasm: ONLY place in the game with Chopper Piranhas leaping from Waterfalls!
  for (let ix = 92; ix <= 122; ix += 10) {
    fillRect(grid, ix, 21, 6, 11, TileType.GROUND_TOP, TileType.GROUND_DEEP);
    grid[19][ix + 2] = TileType.RING;
    grid[19][ix + 3] = TileType.RING;
    // Cascading Waterfall Deco columns between the islands!
    for (let wy = 21; wy <= 31; wy++) {
      grid[wy][ix - 3] = TileType.DECO_WATERFALL;
      grid[wy][ix - 2] = TileType.DECO_WATERFALL;
      grid[wy][ix - 1] = TileType.DECO_WATERFALL;
    }
    // Chopper Piranha leaping straight out of the cascading waterfall!
    grid[23][ix - 2] = TileType.BADNIK_CHOPPER;
    grid[16][ix + 5] = TileType.GIMMICK_BUMPER;
    if (ix === 102) grid[20][ix + 4] = TileType.SPRING_RED;
    if (ix === 112) grid[20][ix + 3] = TileType.BADNIK_CRAB;
  }
  fillRect(grid, 100, 13, 16, 1, TileType.PLATFORM, TileType.PLATFORM);
  grid[12][103] = TileType.CHECKPOINT;
  for (let x = 105; x <= 111; x++) grid[11][x] = TileType.RING;
  grid[11][114] = TileType.GIANT_RING;
  grid[10][117] = TileType.GIMMICK_DASH_RING;

  fillRect(grid, 130, 24, 90, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][133] = TileType.CHECKPOINT;
  grid[23][136] = TileType.MONITOR_BUBBLE;
  grid[23][139] = TileType.BOOSTER_RIGHT;
  grid[18][145] = TileType.LOOP_HEAD;
  for (let x = 154; x <= 166; x++) grid[22][x] = TileType.RING;
  grid[23][168] = TileType.CHECKPOINT;
  grid[23][170] = TileType.MONITOR_RING;

  grid[19][188] = TileType.BOSS_EGGMAN;
  fillRect(grid, 180, 21, 5, 1, TileType.PLATFORM, TileType.PLATFORM);
  fillRect(grid, 191, 21, 5, 1, TileType.PLATFORM, TileType.PLATFORM);

  grid[23][208] = TileType.GOAL_POST;

  return {
    id: 'emerald-mountains-act-2',
    name: 'Emerald Mountains',
    act: 2,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'emerald-coast',
    grid,
    p1Spawn: { x: 4, y: 18 },
    p2Spawn: { x: 2, y: 18 },
  };
}

// ============================================================================
// UNUSED STAGE: BROKEN TEST 01 (Only accessible via "Active Zone & Act" selector)
// ============================================================================
function buildBrokenTest01(): LevelData {
  const width = 260;
  const height = 96; // High-altitude 96-row vertical level (3,072px tall!)
  const grid = createEmptyGrid(width, height);
  const bgGrid = createEmptyGrid(width, height);

  const fillBgRect = (x0: number, y0: number, w: number, h: number, tile: TileType) => {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        if (y >= 0 && y < height && x >= 0 && x < width) {
          bgGrid[y][x] = tile;
        }
      }
    }
  };

  // Helper to construct a Tall Multi-Tier Sky Tower with Background Walls, Windows, Breakable Vaults & Elevators
  const buildSkyTower = (
    x0: number,
    w: number,
    topY: number,
    baseY: number,
    floorStep: number = 10
  ) => {
    // 1. Background masonry walls, pillars & arched windows behind the entire tower!
    fillBgRect(x0, topY, w, baseY - topY, TileType.BG_BRICK);
    for (let y = topY + 1; y < baseY; y++) {
      bgGrid[y][x0 + 1] = TileType.BG_PILLAR;
      bgGrid[y][x0 + w - 2] = TileType.BG_PILLAR;
      if (y % 6 === 2 && w >= 10) {
        bgGrid[y][x0 + Math.floor(w / 2)] = TileType.BG_WINDOW;
        bgGrid[y][x0 + Math.floor(w / 2) - 3] = TileType.BG_WINDOW;
        bgGrid[y][x0 + Math.floor(w / 2) + 3] = TileType.BG_WINDOW;
      }
    }

    // 2. Solid outer tower walls with Breakable Rock entry/exit breaches & balcony ledges
    for (let y = topY; y < baseY; y++) {
      const isBreach = (y - topY) % floorStep >= floorStep - 4 && (y - topY) % floorStep <= floorStep - 2;
      grid[y][x0] = isBreach ? TileType.BREAKABLE_ROCK : TileType.GROUND_DEEP;
      grid[y][x0 + w - 1] = isBreach ? TileType.BREAKABLE_ROCK : TileType.GROUND_DEEP;
    }

    // 3. Tower roof Battlements & Breakable Secret Floor Shafts
    fillRect(grid, x0 - 1, topY, w + 2, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
    // Center roof breakable skylight for Mighty's Hammer Drop!
    const midX = x0 + Math.floor(w / 2);
    grid[topY][midX - 1] = TileType.BREAKABLE_ROCK;
    grid[topY][midX] = TileType.BREAKABLE_ROCK;
    grid[topY][midX + 1] = TileType.BREAKABLE_ROCK;
    grid[topY + 1][midX - 1] = TileType.BREAKABLE_ROCK;
    grid[topY + 1][midX] = TileType.BREAKABLE_ROCK;
    grid[topY + 1][midX + 1] = TileType.BREAKABLE_ROCK;

    // 4. Interior Tower Floors, Breakable Trapdoors, Rings & Secret Treasures
    let tierIdx = 0;
    for (let fy = topY + floorStep; fy < baseY - 4; fy += floorStep) {
      tierIdx++;
      for (let x = x0 + 1; x < x0 + w - 1; x++) {
        // Leave an elevator/spring shaft on alternating sides + a breakable center trapdoor!
        const isLeftShaft = tierIdx % 2 === 0 && x <= x0 + 3;
        const isRightShaft = tierIdx % 2 === 1 && x >= x0 + w - 4;
        const isCenterBreakable = Math.abs(x - midX) <= 1;
        if (isCenterBreakable) {
          grid[fy][x] = TileType.BREAKABLE_ROCK;
        } else if (!isLeftShaft && !isRightShaft) {
          grid[fy][x] = TileType.PLATFORM;
        }
      }

      // Springs & Vertical Moving Platforms to climb the tower
      const shaftX = tierIdx % 2 === 0 ? x0 + 2 : x0 + w - 3;
      grid[fy - 1][shaftX] = tierIdx % 2 === 0 ? TileType.SPRING_RED : TileType.MOVING_PLATFORM_VERT;

      // Populate interior floor with rings, Badniks & hidden monitors behind breakable walls
      for (let rx = x0 + 4; rx <= x0 + w - 5; rx += 2) {
        grid[fy - 2][rx] = TileType.RING;
      }

      // Partition wall of Breakable Rocks guarding a hidden treasure cache on each floor
      const vaultSideX = tierIdx % 2 === 0 ? x0 + w - 5 : x0 + 4;
      grid[fy - 1][vaultSideX] = TileType.BREAKABLE_ROCK;
      grid[fy - 2][vaultSideX] = TileType.BREAKABLE_ROCK;
      grid[fy - 3][vaultSideX] = TileType.BREAKABLE_ROCK;

      const prizeX = tierIdx % 2 === 0 ? x0 + w - 3 : x0 + 2;
      if (tierIdx === 1) {
        grid[fy - 1][prizeX] = TileType.MONITOR_1UP;
      } else if (tierIdx === 2) {
        grid[fy - 2][prizeX] = TileType.GIANT_RING;
      } else if (tierIdx === 3) {
        grid[fy - 1][prizeX] = TileType.MONITOR_SUPER;
      } else {
        grid[fy - 1][prizeX] =
          tierIdx % 2 === 0 ? TileType.MONITOR_LIGHTNING : TileType.MONITOR_FLAME;
      }
    }
  };

  // ==========================================================================
  // BASE VALLEY FLOOR & UNDERGROUND SECRET CATACOMBS (y = 84..95)
  // ==========================================================================
  fillRect(grid, 0, 84, 52, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillBgRect(0, 78, 52, 6, TileType.BG_FOLIAGE);
  grid[83][5] = TileType.SPAWN_P1;
  grid[83][3] = TileType.SPAWN_P2;

  for (let x = 8; x <= 18; x++) grid[82][x] = TileType.RING;
  grid[83][15] = TileType.MONITOR_SPEED;
  grid[83][17] = TileType.MONITOR_SHIELD;
  grid[83][19] = TileType.BOOSTER_RIGHT;
  grid[78][21] = TileType.LOOP_HEAD;

  // Secret Underground Catacomb beneath Spawn & Tower 1 (y = 88..93, x = 10..44)
  // Accessible by smashing the Breakable Block floor at x = 12..14, y = 84..87!
  for (let by = 84; by <= 87; by++) {
    grid[by][12] = TileType.BREAKABLE_ROCK;
    grid[by][13] = TileType.BREAKABLE_ROCK;
    grid[by][14] = TileType.BREAKABLE_ROCK;
  }
  for (let cy = 88; cy <= 92; cy++) {
    for (let cx = 11; cx <= 44; cx++) {
      grid[cy][cx] = TileType.EMPTY;
      bgGrid[cy][cx] = TileType.BG_BRICK;
    }
  }
  for (let rx = 16; rx <= 36; rx += 2) {
    grid[90][rx] = TileType.RING;
    grid[91][rx] = TileType.RING;
  }
  grid[92][38] = TileType.MONITOR_1UP;
  grid[92][40] = TileType.MONITOR_INVINCIBILITY;
  grid[91][42] = TileType.GIANT_RING;
  grid[92][44] = TileType.SPRING_RED;
  for (let by = 84; by <= 87; by++) {
    grid[by][44] = TileType.BREAKABLE_ROCK;
  }

  // ==========================================================================
  // TOWER 1: THE EMERALD WATCHTOWER (x: 28..46, y: 38..84 — 46 Blocks Tall!)
  // ==========================================================================
  buildSkyTower(28, 18, 38, 84, 11);
  // Roof treasures on Tower 1 (y = 37)
  grid[37][31] = TileType.CHECKPOINT;
  grid[37][34] = TileType.MONITOR_RING;
  grid[37][37] = TileType.BADNIK_CRAB;
  grid[37][42] = TileType.SPRING_RED;
  // High Sky Secret Island above Tower 1 (y = 22, x = 28..44)
  fillRect(grid, 28, 22, 16, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillBgRect(29, 16, 14, 6, TileType.BG_LATTICE);
  for (let x = 30; x <= 40; x += 2) grid[20][x] = TileType.RING;
  grid[21][35] = TileType.MONITOR_1UP;
  grid[20][41] = TileType.GIANT_RING;

  // ==========================================================================
  // CHASM 1: SWINGING PENDULUMS & MOVING SKY PLATFORMS (x: 46..62)
  // ==========================================================================
  fillRect(grid, 52, 86, 48, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[74][50] = TileType.MOVING_PLATFORM;
  grid[62][54] = TileType.SWINGING_PLATFORM;
  grid[48][50] = TileType.MOVING_PLATFORM;
  grid[36][54] = TileType.SWINGING_PLATFORM;
  grid[85][55] = TileType.SPRING_RED;
  grid[70][55] = TileType.GIMMICK_UPDRAFT;
  grid[56][55] = TileType.GIMMICK_UPDRAFT;

  // ==========================================================================
  // TOWER 2: TWIN SPIRE FORTRESS (x: 62..86, y: 24..86 — 62 Blocks Tall!)
  // ==========================================================================
  buildSkyTower(62, 24, 24, 86, 12);
  // Elevated Loop-de-Loop on Tower 2's Roof Sky-Deck (y = 24)!
  fillRect(grid, 60, 24, 32, 3, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][63] = TileType.CHECKPOINT;
  grid[23][66] = TileType.BOOSTER_RIGHT;
  grid[18][71] = TileType.LOOP_HEAD;
  grid[23][82] = TileType.MONITOR_SPEED;
  grid[23][85] = TileType.SPRING_RED;

  // Secret Sky-Peak Cloud Sanctuary above Tower 2 (y = 11, x = 66..84)
  fillRect(grid, 66, 12, 18, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let x = 68; x <= 80; x++) grid[10][x] = TileType.RING;
  grid[11][74] = TileType.MONITOR_SUPER;
  grid[10][82] = TileType.GIANT_RING;

  // ==========================================================================
  // CHASM 2: AERIAL DASH RINGS & PENDULUM BRIDGE (x: 86..106)
  // ==========================================================================
  grid[22][90] = TileType.GIMMICK_DASH_RING;
  grid[20][96] = TileType.SWINGING_PLATFORM;
  grid[18][102] = TileType.GIMMICK_DASH_RING;
  grid[44][92] = TileType.MOVING_PLATFORM;
  grid[44][99] = TileType.SWINGING_PLATFORM;
  grid[66][92] = TileType.SWINGING_PLATFORM;
  grid[66][99] = TileType.MOVING_PLATFORM;
  // Valley floor bridge with Breakable Rock wall tunnel
  fillRect(grid, 100, 84, 52, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[83][95] = TileType.SPRING_RED;

  // ==========================================================================
  // TOWER 3: GRAND CITADEL SPIRE (x: 106..138, y: 14..84 — 70 Blocks Tall!)
  // ==========================================================================
  buildSkyTower(106, 32, 14, 84, 10);
  // Inside Tower 3's Central Core: Giant Breakable Block Honeycomb Maze (x: 115..128, y: 30..70)
  for (let hy = 32; hy <= 68; hy += 6) {
    for (let hx = 116; hx <= 127; hx++) {
      grid[hy][hx] = TileType.BREAKABLE_ROCK;
      grid[hy + 1][hx] = TileType.BREAKABLE_ROCK;
    }
    grid[hy - 1][118 + (hy % 7)] = TileType.MONITOR_RING;
    grid[hy - 1][124] = hy === 44 ? TileType.MONITOR_1UP : TileType.RING;
  }
  // Tower 3 Ultra-High Summit (y = 14)
  grid[13][110] = TileType.CHECKPOINT;
  for (let x = 112; x <= 132; x += 2) grid[12][x] = TileType.RING;
  grid[13][122] = TileType.BADNIK_CRAB;
  grid[9][126] = TileType.BADNIK_BUZZ;
  grid[13][134] = TileType.MONITOR_1UP;
  grid[12][136] = TileType.GIANT_RING;

  // ==========================================================================
  // TOWER 4: WATERFALL BELFRY & HIDDEN ALCOVES (x: 152..182, y: 28..86)
  // ==========================================================================
  fillRect(grid, 152, 84, 42, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  // Cascading 56-tile-tall Waterfalls on both flanks of Tower 4!
  for (let wy = 28; wy <= 83; wy++) {
    grid[wy][148] = TileType.DECO_WATERFALL;
    grid[wy][149] = TileType.DECO_WATERFALL;
    grid[wy][150] = TileType.DECO_WATERFALL;
    grid[wy][183] = TileType.DECO_WATERFALL;
    grid[wy][184] = TileType.DECO_WATERFALL;
  }
  grid[76][149] = TileType.BADNIK_CHOPPER;
  grid[56][149] = TileType.BADNIK_CHOPPER;
  grid[38][149] = TileType.BADNIK_CHOPPER;

  // Moving & Swinging Platforms flanking the giant waterfall
  grid[72][144] = TileType.MOVING_PLATFORM_VERT;
  grid[54][144] = TileType.SWINGING_PLATFORM;
  grid[36][144] = TileType.MOVING_PLATFORM;

  buildSkyTower(152, 30, 28, 84, 11);
  // Secret Waterfall Warp Alcove at y = 50, x = 164..170
  grid[49][166] = TileType.GIMMICK_TELEPORT_ORB;
  grid[27][156] = TileType.CHECKPOINT;
  grid[27][160] = TileType.BOOSTER_RIGHT;
  grid[22][166] = TileType.LOOP_HEAD;
  grid[26][178] = TileType.GIANT_RING;

  // ==========================================================================
  // TOWER 5: SKY KEEP & ACT 3 FINALE RUNWAY (x: 194..258)
  // ==========================================================================
  fillRect(grid, 194, 84, 66, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  buildSkyTower(196, 22, 36, 84, 12);

  // Connect Upper Tower 4 & 5 to the Finale Runway with High-Speed Sky Bridges & Loops
  fillRect(grid, 186, 36, 10, 2, TileType.PLATFORM, TileType.PLATFORM);
  grid[34][190] = TileType.SWINGING_PLATFORM;
  grid[35][200] = TileType.CHECKPOINT;
  grid[35][204] = TileType.MONITOR_1UP;

  // Lower & Upper Finale Runways converging at the Goal Signpost
  grid[83][220] = TileType.CHECKPOINT;
  grid[83][223] = TileType.BOOSTER_RIGHT;
  grid[78][228] = TileType.LOOP_HEAD;
  for (let x = 236; x <= 246; x++) grid[82][x] = TileType.RING;
  grid[83][250] = TileType.GOAL_POST;

  // Upper Sky Goal Platform at y = 36 so players finishing on the high route can also hit a Goal Signpost or drop down!
  fillRect(grid, 218, 36, 36, 3, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillBgRect(218, 28, 36, 8, TileType.BG_LATTICE);
  grid[35][222] = TileType.BOOSTER_RIGHT;
  grid[30][228] = TileType.LOOP_HEAD;
  for (let x = 236; x <= 244; x++) grid[34][x] = TileType.RING;
  grid[35][248] = TileType.GOAL_POST;

  return {
    id: 'broken-test-01',
    name: 'Broken Test 01',
    act: 1,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'emerald-coast',
    grid,
    bgGrid,
    p1Spawn: { x: 5, y: 82 },
    p2Spawn: { x: 3, y: 82 },
  };
}

// ============================================================================
// LEVEL 3 (COMPLETELY REDONE): MARBLE ZONE — ACT 1 (Crusher Hallways & Magma Geysers!)
// ============================================================================
function buildMarbleZoneAct1(): LevelData {
  const width = 235;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  // Section 1: Ancient Violet Columns, Caterkiller Patrol & First Magma Geyser Pit
  fillRect(grid, 0, 22, 22, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[21][4] = TileType.SPAWN_P1;
  grid[21][2] = TileType.SPAWN_P2;
  for (let x = 6; x <= 14; x++) grid[20][x] = TileType.RING;
  grid[21][15] = TileType.MONITOR_FLAME;
  grid[21][17] = TileType.MONITOR_SHIELD;
  grid[21][19] = TileType.BADNIK_CATERKILLER;

  // Molten Geyser Trench (x: 22..48)
  fillRect(grid, 22, 27, 26, 5, TileType.GROUND_DEEP, TileType.GROUND_DEEP);
  for (let lx = 22; lx < 48; lx++) {
    grid[26][lx] = lx % 7 === 0 ? TileType.GIMMICK_LAVA_GEYSER : TileType.LAVA;
  }
  for (let px = 25; px <= 43; px += 6) {
    fillRect(grid, px, 21, 4, 1, TileType.PLATFORM, TileType.PLATFORM);
    grid[19][px + 1] = TileType.RING;
    grid[19][px + 2] = TileType.RING;
  }
  grid[15][34] = TileType.BADNIK_BATBRAIN;
  grid[15][42] = TileType.BADNIK_BATBRAIN;

  // Section 2: Twin-Deck Subterranean Crusher Dungeon (x: 48..114)
  fillRect(grid, 48, 22, 20, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[21][50] = TileType.CHECKPOINT;
  grid[21][53] = TileType.MONITOR_RING;
  grid[21][60] = TileType.BADNIK_CATERKILLER;
  grid[21][66] = TileType.SPRING_RED;

  // Upper & Lower Marble Catacomb Corridors with Stomping Crusher Pillars!
  fillRect(grid, 68, 12, 46, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 68, 19, 46, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 68, 26, 46, 6, TileType.GROUND_TOP, TileType.GROUND_DEEP);

  // Breakable Catacomb Entrance Wall into Lower Dungeon
  for (let ry = 21; ry <= 25; ry++) {
    grid[ry][69] = TileType.BREAKABLE_ROCK;
  }
  // Stomping Marble Crushers mounted in the dungeon ceiling!
  for (let cx = 75; cx <= 105; cx += 8) {
    grid[21][cx] = TileType.GIMMICK_CRUSHER;
    grid[14][cx + 3] = TileType.GIMMICK_CRUSHER;
  }
  for (let x = 73; x <= 103; x += 2) {
    grid[24][x] = TileType.RING;
    grid[17][x] = TileType.RING;
  }
  grid[25][88] = TileType.BADNIK_CATERKILLER;
  grid[22][96] = TileType.BADNIK_BATBRAIN;
  grid[25][106] = TileType.MONITOR_FLAME;
  grid[24][109] = TileType.GIANT_RING;
  grid[25][112] = TileType.SPRING_RED;

  // Upper Marble Temple Roof
  grid[18][84] = TileType.BADNIK_CATERKILLER;
  grid[18][98] = TileType.MONITOR_INVINCIBILITY;
  grid[17][108] = TileType.GIANT_RING;

  // Section 3: Great Erupting Magma Sea & Batbrain Cavern (x: 114..164)
  fillRect(grid, 114, 27, 50, 5, TileType.GROUND_DEEP, TileType.GROUND_DEEP);
  for (let lx = 114; lx < 164; lx++) {
    grid[26][lx] = lx % 8 === 0 ? TileType.GIMMICK_LAVA_GEYSER : TileType.LAVA;
  }
  for (let px = 117; px <= 157; px += 7) {
    fillRect(grid, px, 21 - (px % 2), 4, 1, TileType.PLATFORM, TileType.PLATFORM);
    grid[18][px + 1] = TileType.RING;
    grid[18][px + 2] = TileType.RING;
  }
  grid[14][126] = TileType.BADNIK_BATBRAIN;
  grid[14][140] = TileType.BADNIK_BATBRAIN;
  grid[14][154] = TileType.BADNIK_BATBRAIN;

  // Section 4: Marble Colosseum Act 1 Finale Sprint (Boss only appears in Act 2!)
  fillRect(grid, 164, 22, 71, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[21][167] = TileType.CHECKPOINT;
  grid[21][170] = TileType.MONITOR_FLAME;
  grid[21][173] = TileType.MONITOR_RING;
  grid[21][178] = TileType.BADNIK_CATERKILLER;
  for (let x = 182; x <= 216; x += 2) grid[20][x] = TileType.RING;
  grid[21][194] = TileType.CHECKPOINT;
  grid[17][204] = TileType.BADNIK_BATBRAIN;
  grid[21][212] = TileType.BADNIK_CATERKILLER;

  grid[21][226] = TileType.GOAL_POST;

  return {
    id: 'marble-zone-act-1',
    name: 'Marble Zone',
    act: 1,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'marble-ruin',
    grid,
    p1Spawn: { x: 4, y: 20 },
    p2Spawn: { x: 2, y: 20 },
  };
}

// ============================================================================
// LEVEL 4 (COMPLETELY REDONE): MARBLE ZONE — ACT 2 (Deep Magma Catacombs & Crushers!)
// ============================================================================
function buildMarbleZoneAct2(): LevelData {
  const width = 240;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  // Section 1: Sunken Marble Viaduct & Crusher Gate
  fillRect(grid, 0, 20, 24, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[19][4] = TileType.SPAWN_P1;
  grid[19][2] = TileType.SPAWN_P2;
  for (let x = 7; x <= 15; x++) grid[18][x] = TileType.RING;
  grid[19][16] = TileType.MONITOR_FLAME;
  grid[19][18] = TileType.MONITOR_SPEED;
  grid[19][21] = TileType.BADNIK_CATERKILLER;

  addSlopeRunDown(grid, 24, 20, 4);
  fillRect(grid, 32, 24, 34, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 36, 16, 26, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let cx = 39; cx <= 59; cx += 6) {
    grid[18][cx] = TileType.GIMMICK_CRUSHER;
    grid[22][cx + 2] = TileType.RING;
  }
  grid[23][48] = TileType.BADNIK_CATERKILLER;
  grid[14][52] = TileType.BADNIK_BATBRAIN;
  grid[23][62] = TileType.CHECKPOINT;
  grid[23][64] = TileType.SPRING_RED;

  // Section 2: Triple-Tiered Subterranean Vault & Erupting Lava Geysers (x: 66..146)
  fillRect(grid, 66, 14, 38, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 66, 24, 38, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let ry = 16; ry <= 23; ry++) {
    grid[ry][67] = TileType.BREAKABLE_ROCK;
  }
  for (let cx = 73; cx <= 93; cx += 7) {
    grid[16][cx] = TileType.GIMMICK_CRUSHER;
  }
  for (let x = 70; x <= 92; x += 2) {
    grid[22][x] = TileType.RING;
    grid[12][x] = TileType.RING;
  }
  grid[23][84] = TileType.BADNIK_CATERKILLER;
  grid[19][90] = TileType.BADNIK_BATBRAIN;
  grid[23][95] = TileType.MONITOR_BUBBLE;
  grid[22][99] = TileType.GIANT_RING;
  grid[23][102] = TileType.SPRING_RED;

  // Boiling Geyser Caldera (x: 104..152)
  fillRect(grid, 104, 28, 48, 4, TileType.GROUND_DEEP, TileType.GROUND_DEEP);
  for (let lx = 104; lx < 152; lx++) {
    grid[27][lx] = lx % 6 === 0 ? TileType.GIMMICK_LAVA_GEYSER : TileType.LAVA;
  }
  for (let px = 107; px <= 145; px += 6) {
    fillRect(grid, px, 21, 4, 1, TileType.PLATFORM, TileType.PLATFORM);
    grid[19][px + 1] = TileType.RING;
    grid[19][px + 2] = TileType.RING;
  }
  grid[15][118] = TileType.BADNIK_BATBRAIN;
  grid[15][134] = TileType.BADNIK_BATBRAIN;
  fillRect(grid, 118, 12, 18, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[11][121] = TileType.CHECKPOINT;
  grid[11][126] = TileType.MONITOR_INVINCIBILITY;
  grid[10][132] = TileType.GIANT_RING;

  // Section 3: Subterranean Loop & Magma Boss Sanctuary (x: 152..240)
  fillRect(grid, 152, 23, 88, 9, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[22][155] = TileType.CHECKPOINT;
  grid[22][158] = TileType.MONITOR_FLAME;
  grid[22][162] = TileType.BOOSTER_RIGHT;
  grid[17][168] = TileType.LOOP_HEAD;
  for (let x = 178; x <= 188; x++) grid[21][x] = TileType.RING;
  grid[22][184] = TileType.BADNIK_CATERKILLER;
  grid[22][191] = TileType.CHECKPOINT;
  grid[22][194] = TileType.MONITOR_RING;

  // Unique Marble Zone Magma Boss at x: 210, y: 18 (Platforms lowered to y: 20!)
  grid[18][210] = TileType.BOSS_MARBLE;
  fillRect(grid, 201, 20, 5, 1, TileType.PLATFORM, TileType.PLATFORM);
  fillRect(grid, 213, 20, 5, 1, TileType.PLATFORM, TileType.PLATFORM);
  for (let lx = 207; lx <= 212; lx++) {
    grid[23][lx] = TileType.LAVA;
  }

  grid[22][230] = TileType.GOAL_POST;

  return {
    id: 'marble-zone-act-2',
    name: 'Marble Zone',
    act: 2,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'marble-ruin',
    grid,
    p1Spawn: { x: 4, y: 18 },
    p2Spawn: { x: 2, y: 18 },
  };
}

// ============================================================================
// LEVEL 5 (COMPLETELY REDONE): NEO STARLIGHT ZONE — ACT 1 (Cyber Highway & Wall Lava Shooters!)
// ============================================================================
function buildNeoStarlightAct1(): LevelData {
  const width = 238;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  // Section 1: Neon Starlight Expressway, Conveyor Belts & First Wall Lava Shooter Tower
  fillRect(grid, 0, 22, 30, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[21][4] = TileType.SPAWN_P1;
  grid[21][2] = TileType.SPAWN_P2;
  for (let x = 7; x <= 14; x++) grid[20][x] = TileType.RING;
  grid[21][15] = TileType.MONITOR_FLAME;
  grid[21][17] = TileType.MONITOR_LIGHTNING;

  // Motorized Conveyor Belt strip + Orbinaut patrol
  for (let cx = 19; cx <= 25; cx++) {
    grid[22][cx] = TileType.GIMMICK_CONVEYOR_RIGHT;
  }
  grid[19][22] = TileType.BADNIK_ORBINAUT;
  grid[21][27] = TileType.BADNIK_BOMB;

  // Wall Turret Pillar #1 with Left-Firing Wall Lava Shooters!
  fillRect(grid, 30, 16, 4, 6, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[20][30] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[17][30] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[21][28] = TileType.SPRING_RED;

  // High-Speed Neon Loop & Dual-Conveyor Overpass (x: 34..76)
  fillRect(grid, 34, 21, 42, 11, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[20][36] = TileType.BOOSTER_RIGHT;
  grid[15][42] = TileType.LOOP_HEAD;
  for (let x = 50; x <= 60; x++) {
    grid[19][x] = TileType.RING;
    if (x >= 52 && x <= 58) grid[21][x] = TileType.GIMMICK_CONVEYOR_LEFT;
  }
  grid[18][55] = TileType.BADNIK_ORBINAUT;
  grid[20][62] = TileType.BADNIK_BOMB;
  grid[18][65] = TileType.GIMMICK_BUMPER;

  // Wall Turret Pillar #2 firing Both Left and Right! (Red Spring at x: 66 to clear the wall!)
  grid[20][66] = TileType.SPRING_RED;
  fillRect(grid, 68, 15, 4, 6, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[19][68] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[16][68] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[19][71] = TileType.GIMMICK_LAVA_SHOOTER_RIGHT;
  grid[20][74] = TileType.CHECKPOINT;

  // Section 2: Twin-Tiered Starlight Foundry & Wall Lava Shooter Gauntlet (x: 76..154)
  fillRect(grid, 76, 13, 38, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 76, 24, 38, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[20][75] = TileType.SPRING_RED;

  // Breakable Girder Wall into Lower Conveyor & Lava Shooter Vault
  for (let ry = 15; ry <= 23; ry++) {
    grid[ry][77] = TileType.BREAKABLE_ROCK;
  }
  for (let cx = 82; cx <= 96; cx++) {
    grid[24][cx] = cx % 2 === 0 ? TileType.GIMMICK_CONVEYOR_RIGHT : TileType.GIMMICK_CONVEYOR_LEFT;
    grid[22][cx] = TileType.RING;
  }
  // Wall Column inside Lower Vault firing Fireballs Left & Right! (Red Spring at x: 97!)
  grid[23][97] = TileType.SPRING_RED;
  fillRect(grid, 99, 18, 3, 6, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[22][99] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[19][99] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[22][101] = TileType.GIMMICK_LAVA_SHOOTER_RIGHT;
  grid[23][90] = TileType.BADNIK_BOMB;
  grid[23][104] = TileType.MONITOR_INVINCIBILITY;
  grid[22][108] = TileType.GIANT_RING;
  grid[23][112] = TileType.SPRING_RED;

  // Upper Cyber Overpass with Orbinauts, Bomb Badniks & Wall Shooters (Red Spring at x: 106!)
  for (let x = 80; x <= 105; x += 2) grid[11][x] = TileType.RING;
  grid[10][86] = TileType.BADNIK_ORBINAUT;
  grid[12][94] = TileType.BADNIK_BOMB;
  grid[12][102] = TileType.MONITOR_BUBBLE;
  grid[12][106] = TileType.SPRING_RED;
  fillRect(grid, 108, 8, 3, 5, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[11][108] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[9][108] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;

  // Starlight Reactor Chasm with Wall Lava Turrets & Conveyor Skybridges (x: 114..160)
  fillRect(grid, 114, 27, 46, 5, TileType.GROUND_DEEP, TileType.GROUND_DEEP);
  for (let lx = 114; lx < 160; lx++) grid[26][lx] = TileType.LAVA;
  for (let px = 117; px <= 153; px += 9) {
    fillRect(grid, px, 20, 6, 1, TileType.GIMMICK_CONVEYOR_RIGHT, TileType.GIMMICK_CONVEYOR_RIGHT);
    grid[18][px + 2] = TileType.RING;
    grid[19][px + 4] = TileType.SPRING_RED;
  }
  // Twin Wall Turret Towers in the Chasm firing Fireballs across the bridges!
  fillRect(grid, 127, 14, 3, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[18][127] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[18][129] = TileType.GIMMICK_LAVA_SHOOTER_RIGHT;
  grid[15][127] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;

  fillRect(grid, 145, 14, 3, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[18][145] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[18][147] = TileType.GIMMICK_LAVA_SHOOTER_RIGHT;
  grid[16][137] = TileType.BADNIK_ORBINAUT;
  grid[13][146] = TileType.GIANT_RING;

  // Section 3: Final Starlight Loop & Act 1 Expressway Finish (Boss only appears in Act 2!)
  fillRect(grid, 160, 22, 78, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[21][163] = TileType.CHECKPOINT;
  grid[21][166] = TileType.MONITOR_FLAME;
  grid[21][169] = TileType.BOOSTER_RIGHT;
  grid[16][175] = TileType.LOOP_HEAD;
  for (let x = 183; x <= 218; x += 2) grid[20][x] = TileType.RING;
  grid[19][187] = TileType.BADNIK_ORBINAUT;
  grid[21][191] = TileType.BADNIK_BOMB;
  grid[21][195] = TileType.CHECKPOINT;
  grid[21][197] = TileType.MONITOR_RING;
  for (let cx = 202; cx <= 214; cx++) {
    grid[22][cx] = TileType.GIMMICK_CONVEYOR_RIGHT;
  }
  grid[19][210] = TileType.BADNIK_ORBINAUT;

  grid[21][228] = TileType.GOAL_POST;

  return {
    id: 'neo-starlight-act-1',
    name: 'Neo Starlight',
    act: 1,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'chemical-plant',
    grid,
    p1Spawn: { x: 4, y: 20 },
    p2Spawn: { x: 2, y: 20 },
  };
}

// ============================================================================
// LEVEL 6 (COMPLETELY REDONE): NEO STARLIGHT ZONE — ACT 2 (Orbital Lava Turret Foundry)
// ============================================================================
function buildNeoStarlightAct2(): LevelData {
  const width = 242;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  // Section 1: High-Velocity Conveyor Deck & Wall Fireball Turrets
  fillRect(grid, 0, 19, 26, 13, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[18][4] = TileType.SPAWN_P1;
  grid[18][2] = TileType.SPAWN_P2;
  grid[18][8] = TileType.MONITOR_FLAME;
  grid[18][10] = TileType.MONITOR_SPEED;
  for (let cx = 12; cx <= 20; cx++) {
    grid[19][cx] = TileType.GIMMICK_CONVEYOR_RIGHT;
    grid[17][cx] = TileType.RING;
  }
  grid[16][16] = TileType.BADNIK_ORBINAUT;
  grid[18][22] = TileType.BADNIK_BOMB;
  grid[18][24] = TileType.BOOSTER_RIGHT;

  addSlopeRunDown(grid, 26, 19, 5);
  fillRect(grid, 36, 24, 46, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][38] = TileType.BOOSTER_RIGHT;
  grid[18][44] = TileType.LOOP_HEAD;

  // Dual Wall Lava Turret Bunker in the middle of the highway!
  fillRect(grid, 55, 17, 4, 7, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[22][55] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[19][55] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[22][58] = TileType.GIMMICK_LAVA_SHOOTER_RIGHT;
  grid[19][58] = TileType.GIMMICK_LAVA_SHOOTER_RIGHT;
  grid[23][52] = TileType.SPRING_RED;

  grid[21][64] = TileType.BADNIK_ORBINAUT;
  grid[23][68] = TileType.BADNIK_BOMB;
  grid[23][72] = TileType.BOOSTER_RIGHT;
  grid[18][76] = TileType.LOOP_HEAD;

  // Section 2: Multi-Tier Conveyor Labyrinth & Crossfire Wall Lava Shooters (x: 82..156)
  fillRect(grid, 82, 14, 36, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 82, 24, 36, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][80] = TileType.CHECKPOINT;
  grid[23][81] = TileType.SPRING_RED;

  for (let ry = 16; ry <= 23; ry++) {
    grid[ry][83] = TileType.BREAKABLE_ROCK;
  }
  for (let cx = 86; cx <= 102; cx++) {
    grid[24][cx] = TileType.GIMMICK_CONVEYOR_LEFT;
    grid[22][cx] = TileType.RING;
  }
  // Wall Lava Shooter Pillar inside the lower conduit! (Red Spring at x: 104!)
  grid[23][104] = TileType.SPRING_RED;
  fillRect(grid, 106, 18, 3, 6, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[22][106] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[19][106] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[22][108] = TileType.GIMMICK_LAVA_SHOOTER_RIGHT;
  grid[23][111] = TileType.MONITOR_INVINCIBILITY;
  grid[22][114] = TileType.GIANT_RING;
  grid[23][116] = TileType.SPRING_RED;

  // Upper Conveyor Deck (Red Spring at x: 108!)
  for (let cx = 86; cx <= 106; cx++) {
    grid[14][cx] = TileType.GIMMICK_CONVEYOR_RIGHT;
    if (cx % 2 === 0) grid[12][cx] = TileType.RING;
  }
  grid[11][94] = TileType.BADNIK_ORBINAUT;
  grid[13][102] = TileType.BADNIK_BOMB;
  grid[13][108] = TileType.SPRING_RED;
  fillRect(grid, 110, 8, 3, 6, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[12][110] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
  grid[9][110] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;

  // Starlight Furnace Core with 3 Wall Fireball Towers (x: 118..162)
  fillRect(grid, 118, 28, 44, 4, TileType.GROUND_DEEP, TileType.GROUND_DEEP);
  for (let lx = 118; lx < 162; lx++) {
    grid[27][lx] = lx % 7 === 0 ? TileType.GIMMICK_LAVA_GEYSER : TileType.LAVA;
  }
  for (let tx = 124; tx <= 152; tx += 14) {
    fillRect(grid, tx, 15, 3, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
    grid[19][tx] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
    grid[19][tx + 2] = TileType.GIMMICK_LAVA_SHOOTER_RIGHT;
    grid[16][tx] = TileType.GIMMICK_LAVA_SHOOTER_LEFT;
    fillRect(grid, tx - 5, 21, 4, 1, TileType.GIMMICK_CONVEYOR_RIGHT, TileType.GIMMICK_CONVEYOR_RIGHT);
    grid[19][tx - 3] = TileType.RING;
    grid[20][tx - 2] = TileType.SPRING_RED;
  }
  grid[13][139] = TileType.GIANT_RING;
  grid[14][153] = TileType.MONITOR_FLAME;

  // Section 3: Final Starlight Accelerator & Boss Arena (x: 162..242)
  fillRect(grid, 162, 23, 80, 9, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[22][165] = TileType.CHECKPOINT;
  grid[22][168] = TileType.MONITOR_RING;
  grid[22][171] = TileType.BOOSTER_RIGHT;
  grid[17][177] = TileType.LOOP_HEAD;
  for (let x = 185; x <= 195; x++) grid[21][x] = TileType.RING;
  grid[20][189] = TileType.BADNIK_ORBINAUT;
  grid[22][193] = TileType.BADNIK_BOMB;
  grid[22][197] = TileType.CHECKPOINT;

  // Unique Neo Starlight Zone Boss: Dr. Eggman Cyber Spike-Mine & Laser Pod!
  grid[18][212] = TileType.BOSS_STARLIGHT;
  fillRect(grid, 204, 20, 5, 1, TileType.PLATFORM, TileType.PLATFORM);
  fillRect(grid, 215, 20, 5, 1, TileType.PLATFORM, TileType.PLATFORM);

  grid[22][232] = TileType.GOAL_POST;

  return {
    id: 'neo-starlight-act-2',
    name: 'Neo Starlight',
    act: 2,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'chemical-plant',
    grid,
    p1Spawn: { x: 4, y: 17 },
    p2Spawn: { x: 2, y: 17 },
  };
}

// ============================================================================
// LEVEL 7 (COMPLETELY REDONE): HILL TOP PEAKS ZONE — ACT 1 (Updraft Fans, Cloud Cannons & Rexons!)
// ============================================================================
function buildHillTopPeaksAct1(): LevelData {
  const width = 236;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  // Section 1: Cobalt Alpine Foothills, Spiny Patrol & Cloud Warp Cannon
  fillRect(grid, 0, 23, 30, 9, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[22][4] = TileType.SPAWN_P1;
  grid[22][2] = TileType.SPAWN_P2;
  for (let x = 7; x <= 15; x++) grid[21][x] = TileType.RING;
  grid[22][16] = TileType.MONITOR_FLAME;
  grid[22][18] = TileType.MONITOR_BUBBLE;
  grid[22][22] = TileType.BADNIK_SPINY;
  grid[20][25] = TileType.GIMMICK_DASH_RING;
  grid[22][28] = TileType.GIMMICK_TELEPORT_ORB;

  // Section 2: Stratosphere Updraft Canyon & Twin Peak Routes (x: 30..108)
  // Upper Sky Sanctuary Route (reached via Cloud Cannon or Updraft Fans!)
  fillRect(grid, 36, 13, 32, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let x = 38; x <= 64; x += 2) grid[11][x] = TileType.RING;
  grid[12][46] = TileType.BADNIK_SPINY;
  grid[12][56] = TileType.BADNIK_CRAB;
  grid[12][62] = TileType.CHECKPOINT;
  grid[11][66] = TileType.GIANT_RING;

  // Lower Volcanic Alpine Gorge with Updraft Wind Fans & Spiny Patrols
  fillRect(grid, 30, 25, 78, 7, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let ry = 19; ry <= 24; ry++) {
    grid[ry][34] = TileType.BREAKABLE_ROCK;
  }
  for (let fx = 40; fx <= 64; fx += 8) {
    grid[24][fx] = TileType.GIMMICK_UPDRAFT;
    grid[18][fx] = TileType.RING;
    grid[16][fx] = TileType.RING;
  }
  // Volcanic Lava Pool inside the mountain!
  for (let lx = 70; lx <= 86; lx++) {
    grid[25][lx] = lx % 5 === 0 ? TileType.GIMMICK_LAVA_GEYSER : TileType.LAVA;
  }
  fillRect(grid, 73, 21, 4, 1, TileType.PLATFORM, TileType.PLATFORM);
  fillRect(grid, 81, 21, 4, 1, TileType.PLATFORM, TileType.PLATFORM);
  grid[24][68] = TileType.BADNIK_SPINY;
  grid[24][88] = TileType.BADNIK_CRAB;
  grid[24][94] = TileType.BADNIK_SPINY;
  grid[24][98] = TileType.MONITOR_INVINCIBILITY;
  grid[23][102] = TileType.GIANT_RING;
  grid[24][105] = TileType.GIMMICK_TELEPORT_ORB;

  // Section 3: High Cloud Cannon Chain & Alpine Loops (x: 108..168)
  fillRect(grid, 108, 19, 60, 13, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[18][111] = TileType.CHECKPOINT;
  grid[18][114] = TileType.BOOSTER_RIGHT;
  grid[13][120] = TileType.LOOP_HEAD;
  grid[18][130] = TileType.BADNIK_SPINY;
  grid[15][136] = TileType.BADNIK_BUZZ;
  grid[18][142] = TileType.GIMMICK_UPDRAFT;
  grid[18][146] = TileType.BOOSTER_RIGHT;
  grid[13][152] = TileType.LOOP_HEAD;
  grid[15][162] = TileType.GIMMICK_DASH_RING;

  // Section 4: Summit Act 1 Finale Runway (Boss only appears in Act 2!)
  fillRect(grid, 168, 21, 68, 11, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let x = 172; x <= 216; x += 2) grid[19][x] = TileType.RING;
  grid[20][178] = TileType.BADNIK_SPINY;
  grid[20][186] = TileType.CHECKPOINT;
  grid[20][189] = TileType.MONITOR_RING;
  grid[20][191] = TileType.MONITOR_FLAME;
  grid[20][196] = TileType.BOOSTER_RIGHT;
  grid[20][208] = TileType.BADNIK_SPINY;

  grid[20][226] = TileType.GOAL_POST;

  return {
    id: 'hill-top-peaks-act-1',
    name: 'Hill Top Peaks',
    act: 1,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'sky-sanctuary',
    grid,
    p1Spawn: { x: 4, y: 21 },
    p2Spawn: { x: 2, y: 21 },
  };
}

// ============================================================================
// LEVEL 8 (COMPLETELY REDONE): HILL TOP PEAKS ZONE — ACT 2 (Volcanic Stratosphere Finale)
// ============================================================================
function buildHillTopPeaksAct2(): LevelData {
  const width = 244;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  // Section 1: Cloud Cannon Launchpad & Supersonic Peak Loops
  fillRect(grid, 0, 23, 26, 9, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[22][4] = TileType.SPAWN_P1;
  grid[22][2] = TileType.SPAWN_P2;
  for (let x = 7; x <= 15; x++) grid[21][x] = TileType.RING;
  grid[22][16] = TileType.MONITOR_FLAME;
  grid[22][18] = TileType.MONITOR_SPEED;
  grid[22][21] = TileType.BADNIK_SPINY;
  grid[22][24] = TileType.GIMMICK_TELEPORT_ORB;

  fillRect(grid, 30, 19, 44, 13, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[18][33] = TileType.BOOSTER_RIGHT;
  grid[13][39] = TileType.LOOP_HEAD;
  grid[18][49] = TileType.BADNIK_SPINY;
  grid[18][53] = TileType.GIMMICK_UPDRAFT;
  grid[18][56] = TileType.BOOSTER_RIGHT;
  grid[13][62] = TileType.LOOP_HEAD;
  grid[18][70] = TileType.CHECKPOINT;
  grid[18][72] = TileType.GIMMICK_TELEPORT_ORB;

  // Section 2: Volcanic Caldera Core & Sky Updraft Sanctuary (x: 74..154)
  fillRect(grid, 76, 12, 34, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 74, 24, 36, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let ry = 14; ry <= 23; ry++) {
    grid[ry][76] = TileType.BREAKABLE_ROCK;
  }
  for (let x = 80; x <= 102; x += 2) {
    grid[22][x] = TileType.RING;
    grid[10][x] = TileType.RING;
  }
  grid[11][88] = TileType.BADNIK_SPINY;
  grid[11][98] = TileType.BADNIK_CRAB;
  grid[23][86] = TileType.BADNIK_CRAB;
  grid[23][94] = TileType.BADNIK_SPINY;
  grid[23][100] = TileType.MONITOR_LIGHTNING;
  grid[22][104] = TileType.GIANT_RING;
  grid[23][108] = TileType.GIMMICK_TELEPORT_ORB;

  // Volcanic Mountain Caldera with Updraft Fans, Erupting Geysers & Spiny Patrols (x: 110..154)
  fillRect(grid, 110, 28, 44, 4, TileType.GROUND_DEEP, TileType.GROUND_DEEP);
  for (let lx = 110; lx < 154; lx++) {
    grid[27][lx] = lx % 6 === 0 ? TileType.GIMMICK_LAVA_GEYSER : TileType.LAVA;
  }
  for (let px = 113; px <= 145; px += 8) {
    fillRect(grid, px, 21, 5, 1, TileType.PLATFORM, TileType.PLATFORM);
    grid[20][px + 1] = TileType.GIMMICK_UPDRAFT;
    grid[20][px + 3] = TileType.BADNIK_SPINY;
    grid[15][px + 2] = TileType.GIMMICK_DASH_RING;
  }
  fillRect(grid, 122, 11, 20, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[10][125] = TileType.CHECKPOINT;
  grid[10][130] = TileType.MONITOR_INVINCIBILITY;
  grid[9][138] = TileType.GIANT_RING;

  // Section 3: Summit Finale Runway & Grand Magma Boss Battle (x: 154..244)
  fillRect(grid, 154, 22, 90, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[21][157] = TileType.CHECKPOINT;
  grid[21][160] = TileType.BOOSTER_RIGHT;
  grid[16][166] = TileType.LOOP_HEAD;
  grid[21][175] = TileType.BADNIK_SPINY;
  grid[21][180] = TileType.BOOSTER_RIGHT;
  grid[16][186] = TileType.LOOP_HEAD;

  for (let x = 194; x <= 202; x++) grid[20][x] = TileType.RING;
  grid[21][203] = TileType.CHECKPOINT;
  grid[21][205] = TileType.MONITOR_RING;
  grid[21][207] = TileType.MONITOR_FLAME;

  // Unique Hill Top Peaks Zone Boss: Dr. Eggman Volcanic Pyro-Sub & Solar Cannon at x: 218, y: 17!
  grid[17][218] = TileType.BOSS_HILLTOP;
  fillRect(grid, 209, 19, 5, 1, TileType.PLATFORM, TileType.PLATFORM);
  fillRect(grid, 221, 19, 5, 1, TileType.PLATFORM, TileType.PLATFORM);
  for (let lx = 215; lx <= 220; lx++) {
    grid[22][lx] = TileType.LAVA;
  }

  grid[21][235] = TileType.GOAL_POST;

  return {
    id: 'hill-top-peaks-act-2',
    name: 'Hill Top Peaks',
    act: 2,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'sky-sanctuary',
    grid,
    p1Spawn: { x: 4, y: 21 },
    p2Spawn: { x: 2, y: 21 },
  };
}

// ============================================================================
// FINAL ZONE: USER'S CUSTOM DEATH EGG ZONE (232x32 WITH CUSTOM WATERFALL TEXTURE!)
// ============================================================================
function buildDeathEggZone(): LevelData {
  const width = 232;
  const height = 32;
  const grid: number[][] = [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,1,1,1,0,0,1,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,1,0,1,0,0,1,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,1,0,1,0,0,1,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,0,1,1,1,0,0,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [59,59,59,59,59,59,59,59,59,59,59,59,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [59,59,59,59,59,59,59,59,59,59,59,59,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [59,59,59,59,59,59,59,59,59,59,59,59,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,0,74,0,0,0,0,0,74,0,0,0,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,0,74,0,0,0,0,0,74,0,0,0,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,0,0,0,0,0,0,0,0,0,74,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,0,0,0,0,0,0,0,74,0,0,0,0,74,0,0,0,0,0,74,0,0,0,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  return {
    id: 'death-egg-zone',
    name: 'Death Egg Zone',
    act: 1,
    author: 'Sonic: Web Adventure',
    width,
    height,
    tilesetId: 'death-egg',
    grid,
    p1Spawn: { x: 6, y: 18 },
    p2Spawn: { x: 2, y: 20 },
  };
}

// ============================================================================
// LEVEL 9: CHEMICAL PLANT ZONE — ACT 1
// (Blue Chemical Vats, Glass Travel Tubes, Steam Vents & Toxic Pools)
// ============================================================================
function buildChemicalPlantAct1(): LevelData {
  const width = 236;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  // Section 1: Steel Intake Deck, Conveyor Gantry & First Travel Tube Intake
  fillRect(grid, 0, 23, 36, 9, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[22][4] = TileType.SPAWN_P1;
  grid[22][2] = TileType.SPAWN_P2;
  for (let x = 7; x <= 15; x++) grid[21][x] = TileType.RING;
  grid[22][16] = TileType.MONITOR_SHIELD;
  grid[22][17] = TileType.MONITOR_SPEED;
  for (let cx = 18; cx <= 25; cx++) grid[23][cx] = TileType.GIMMICK_CONVEYOR_RIGHT;
  grid[20][23] = TileType.BADNIK_CRAB;
  grid[23][32] = TileType.GIMMICK_TUBE_ENTRY; // Fall into the glass tube network!

  // Tube #1 Exit Nozzle on the raised glass-pipe gantry (x 38..52)
  fillRect(grid, 38, 16, 14, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[15][45] = TileType.GIMMICK_TUBE_EXIT;
  for (let x = 39; x <= 43; x++) grid[14][x] = TileType.RING;
  grid[15][50] = TileType.MONITOR_RING;

  // Section 2: Boiling Toxic Blue Chemical Vats & Steam Vent Pillars (x 36..96)
  fillRect(grid, 34, 29, 62, 3, TileType.GROUND_DEEP, TileType.GROUND_DEEP);
  for (let ax = 36; ax <= 95; ax++) grid[28][ax] = TileType.GIMMICK_ACID_POOL;
  fillRect(grid, 50, 24, 3, 5, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[24][51] = TileType.GIMMICK_STEAM_VENT;
  fillRect(grid, 74, 24, 3, 5, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[24][75] = TileType.GIMMICK_STEAM_VENT;
  for (let px = 42; px <= 92; px += 10) {
    fillRect(grid, px, 22, 5, 1, TileType.PLATFORM, TileType.PLATFORM);
    grid[20][px + 2] = TileType.RING;
  }
  grid[21][46] = TileType.BADNIK_BUZZ;
  grid[18][62] = TileType.GIMMICK_DASH_RING;
  grid[21][80] = TileType.BADNIK_BOMB;
  grid[20][88] = TileType.RING;
  grid[20][89] = TileType.RING;
  grid[20][90] = TileType.RING;

  // Section 3: Upper Steel Gantry, Spike Beds & Breakable Crate Vault (x 96..152)
  fillRect(grid, 96, 21, 56, 11, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[20][99] = TileType.CHECKPOINT;
  for (let x = 101; x <= 108; x++) grid[20][x] = TileType.RING;
  for (let sx = 112; sx <= 122; sx += 5) grid[20][sx] = TileType.SPIKES_UP;
  fillRect(grid, 110, 15, 16, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let sx = 112; sx <= 122; sx += 5) grid[17][sx] = TileType.SPIKES_DOWN;
  grid[20][127] = TileType.BADNIK_SPINY;
  grid[19][130] = TileType.SPRING_RED;

  // Breakable metal crate vault hiding a Giant Ring (secret room!)
  fillRect(grid, 133, 16, 12, 6, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let ry = 17; ry <= 20; ry++) {
    for (let rx = 134; rx <= 143; rx++) grid[ry][rx] = TileType.EMPTY;
    grid[ry][133] = TileType.BREAKABLE_ROCK;
  }
  grid[20][137] = TileType.GIANT_RING;
  grid[20][139] = TileType.MONITOR_INVINCIBILITY;
  grid[20][141] = TileType.RING;
  grid[20][142] = TileType.RING;

  // Section 4: Chemical Accelerator Runway & Grand Tube Launch (x 152..236)
  fillRect(grid, 152, 22, 84, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[21][155] = TileType.CHECKPOINT;
  grid[21][158] = TileType.BOOSTER_RIGHT;
  grid[16][164] = TileType.LOOP_HEAD;
  for (let x = 172; x <= 182; x += 2) grid[20][x] = TileType.RING;
  grid[21][186] = TileType.BADNIK_SPINY;
  grid[22][196] = TileType.GIMMICK_TUBE_ENTRY; // Second travel tube jump!
  grid[21][204] = TileType.MONITOR_FLAME;

  // Tube #2 Exit Nozzle high above the finish runway (x 208..224)
  fillRect(grid, 208, 15, 16, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[14][216] = TileType.GIMMICK_TUBE_EXIT;
  for (let x = 209; x <= 213; x++) grid[13][x] = TileType.RING;
  grid[14][223] = TileType.GIANT_RING;

  grid[21][230] = TileType.GOAL_POST;

  return {
    id: 'chemical-plant-act-1',
    name: 'Chemical Plant',
    act: 1,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'chemical-plant-zone',
    grid,
    p1Spawn: { x: 4, y: 22 },
    p2Spawn: { x: 2, y: 22 },
  };
}

// ============================================================================
// LEVEL 10: CHEMICAL PLANT ZONE — ACT 2
// (Hydraulic Slime-Crusher & Siphon Mech — Piston Stomp, Chemical Flood,
//  Siphon Vortex & 120-Frame Overheat Venting Weak Point)
// ============================================================================
function buildChemicalPlantAct2(): LevelData {
  const width = 246;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  // Section 1: Vat Valve Gauntlet & First Travel Tube
  fillRect(grid, 0, 22, 40, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[21][4] = TileType.SPAWN_P1;
  grid[21][2] = TileType.SPAWN_P2;
  for (let x = 7; x <= 14; x++) grid[20][x] = TileType.RING;
  grid[21][16] = TileType.MONITOR_FLAME;
  grid[21][18] = TileType.MONITOR_BUBBLE;
  grid[21][20] = TileType.BADNIK_CRAB;
  for (let cx = 24; cx <= 30; cx++) grid[22][cx] = TileType.GIMMICK_CONVEYOR_RIGHT;
  grid[22][36] = TileType.GIMMICK_TUBE_ENTRY;

  // Tube exit nozzle on the glass-pipe overpass
  fillRect(grid, 42, 15, 12, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[14][48] = TileType.GIMMICK_TUBE_EXIT;
  for (let x = 43; x <= 47; x++) grid[13][x] = TileType.RING;
  grid[14][52] = TileType.MONITOR_LIGHTNING;

  // Section 2: Great Blue Chemical Lake & Steam Vent Crossing (x 38..104)
  fillRect(grid, 38, 29, 68, 3, TileType.GROUND_DEEP, TileType.GROUND_DEEP);
  for (let ax = 40; ax <= 103; ax++) grid[28][ax] = TileType.GIMMICK_ACID_POOL;
  for (let px = 44; px <= 98; px += 9) {
    fillRect(grid, px, 23, 4, 1, TileType.PLATFORM, TileType.PLATFORM);
    grid[21][px + 1] = TileType.RING;
    grid[21][px + 2] = TileType.RING;
  }
  fillRect(grid, 56, 24, 3, 5, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[24][57] = TileType.GIMMICK_STEAM_VENT;
  fillRect(grid, 82, 24, 3, 5, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[24][83] = TileType.GIMMICK_STEAM_VENT;
  grid[22][66] = TileType.GIMMICK_DASH_RING;
  grid[20][90] = TileType.BADNIK_BUZZ;

  // Section 3: Twin-Deck Steel Foundry, Spike Beds & Crate Vault (x 104..178)
  fillRect(grid, 104, 13, 46, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 104, 24, 46, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][107] = TileType.CHECKPOINT;
  grid[23][110] = TileType.MONITOR_RING;
  for (let ry = 15; ry <= 23; ry++) grid[ry][105] = TileType.BREAKABLE_ROCK;
  for (let cx = 108; cx <= 128; cx++) {
    grid[24][cx] = cx % 2 === 0 ? TileType.GIMMICK_CONVEYOR_RIGHT : TileType.GIMMICK_CONVEYOR_LEFT;
    grid[22][cx] = TileType.RING;
  }
  grid[24][130] = TileType.GIMMICK_STEAM_VENT;
  grid[24][148] = TileType.GIMMICK_STEAM_VENT;
  for (let sx = 136; sx <= 144; sx += 4) grid[24][sx] = TileType.SPIKES_UP;
  fillRect(grid, 134, 18, 14, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let sx = 136; sx <= 144; sx += 4) grid[20][sx] = TileType.SPIKES_DOWN;
  grid[23][152] = TileType.BADNIK_SPINY;
  grid[23][156] = TileType.MONITOR_INVINCIBILITY;

  // Breakable metal crate vault hiding a Giant Ring (secret room!)
  fillRect(grid, 158, 17, 12, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let ry = 18; ry <= 23; ry++) {
    for (let rx = 159; rx <= 168; rx++) grid[ry][rx] = TileType.EMPTY;
    grid[ry][158] = TileType.BREAKABLE_ROCK;
  }
  grid[23][161] = TileType.GIANT_RING;
  grid[23][164] = TileType.MONITOR_1UP;
  grid[23][166] = TileType.RING;
  grid[23][167] = TileType.RING;

  // Section 4: Hydraulic Siphon Arena & Boss Battle (x 178..246)
  fillRect(grid, 178, 22, 68, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[21][181] = TileType.CHECKPOINT;
  grid[21][184] = TileType.MONITOR_RING;
  grid[21][187] = TileType.BOOSTER_RIGHT;
  for (let x = 190; x <= 196; x += 2) grid[20][x] = TileType.RING;
  grid[21][197] = TileType.CHECKPOINT;

  // High catwalks inside the arena: refuge from the Chemical Flood!
  fillRect(grid, 199, 18, 6, 1, TileType.PLATFORM, TileType.PLATFORM);
  fillRect(grid, 211, 18, 6, 1, TileType.PLATFORM, TileType.PLATFORM);
  for (let x = 200; x <= 204; x += 2) grid[17][x] = TileType.RING;
  for (let x = 212; x <= 216; x += 2) grid[17][x] = TileType.RING;

  // Hydraulic Slime-Crusher & Siphon Mech (Act 2 Boss)
  grid[18][207] = TileType.BOSS_CHEMICAL;

  grid[21][236] = TileType.GOAL_POST;

  return {
    id: 'chemical-plant-act-2',
    name: 'Chemical Plant',
    act: 2,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'chemical-plant-zone',
    grid,
    p1Spawn: { x: 4, y: 21 },
    p2Spawn: { x: 2, y: 21 },
  };
}

// ============================================================================
// LEVEL 11: MYSTIC CAVERNS ZONE — ACT 1
// (Purple Spooky Caverns, Falling Stalactites, Bed & Ceiling Spikes,
//  Vertical Elevators, Mine Cart Shafts & Breakable Rock Secret Vaults)
// ============================================================================
function buildMysticCavernsAct1(): LevelData {
  const width = 234;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  // Section 1: Crystal Grotto Entrance with Stalactite-Dripped Roof (x 0..40)
  fillRect(grid, 0, 0, 40, 18, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 0, 24, 40, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][4] = TileType.SPAWN_P1;
  grid[23][2] = TileType.SPAWN_P2;
  for (let x = 7; x <= 15; x++) grid[22][x] = TileType.RING;
  grid[23][17] = TileType.MONITOR_SHIELD;
  grid[22][20] = TileType.BADNIK_BATBRAIN;
  for (let sx = 10; sx <= 34; sx += 6) grid[18][sx] = TileType.GIMMICK_STALACTITE;
  for (let sx = 24; sx <= 30; sx++) grid[24][sx] = TileType.SPIKES_UP; // Floor spike bed
  for (let x = 24; x <= 30; x += 2) grid[21][x] = TileType.RING;

  // Section 2: Mine Cart Elevator Shaft & Breakable Rock Vault (x 40..96)
  fillRect(grid, 40, 0, 56, 12, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 40, 24, 56, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  // Vertical elevator shaft carved up into the rock
  for (let ry = 12; ry <= 23; ry++) {
    for (let rx = 55; rx <= 66; rx++) grid[ry][rx] = TileType.EMPTY;
  }
  grid[19][58] = TileType.MOVING_PLATFORM_VERT;
  grid[21][63] = TileType.MOVING_PLATFORM_VERT;
  grid[12][61] = TileType.RING;
  grid[14][61] = TileType.RING;
  grid[16][61] = TileType.RING;
  grid[22][55] = TileType.CHECKPOINT;
  // Breakable rock wall hiding a secret vault with a Giant Ring
  fillRect(grid, 70, 18, 12, 6, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let ry = 19; ry <= 22; ry++) {
    for (let rx = 71; rx <= 80; rx++) grid[ry][rx] = TileType.EMPTY;
    grid[ry][70] = TileType.BREAKABLE_ROCK;
  }
  grid[23][74] = TileType.GIANT_RING;
  grid[23][77] = TileType.MONITOR_RING;
  grid[21][68] = TileType.BADNIK_CATERKILLER;

  // Section 3: Low Ceiling Spike Corridor & Mine Cart Shaft (x 96..152)
  fillRect(grid, 96, 0, 56, 14, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 96, 23, 56, 9, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[22][99] = TileType.CHECKPOINT;
  for (let sx = 104; sx <= 138; sx += 3) grid[22][sx] = TileType.SPIKES_UP;
  for (let sx = 105; sx <= 139; sx += 3) grid[18][sx] = TileType.SPIKES_DOWN;
  for (let sx = 106; sx <= 136; sx += 6) grid[14][sx] = TileType.GIMMICK_STALACTITE;
  fillRect(grid, 100, 17, 6, 1, TileType.PLATFORM, TileType.PLATFORM);
  fillRect(grid, 110, 17, 6, 1, TileType.PLATFORM, TileType.PLATFORM);
  fillRect(grid, 120, 17, 6, 1, TileType.PLATFORM, TileType.PLATFORM);
  fillRect(grid, 130, 17, 6, 1, TileType.PLATFORM, TileType.PLATFORM);
  for (let x = 101; x <= 104; x++) grid[16][x] = TileType.RING;
  grid[16][124] = TileType.BADNIK_BATBRAIN;
  grid[22][146] = TileType.BADNIK_CATERKILLER;
  grid[21][150] = TileType.SPRING_RED;

  // Section 4: Deep Cavern Descent, Second Elevator Shaft & Finale (x 152..234)
  fillRect(grid, 152, 0, 82, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 152, 25, 82, 7, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let ry = 10; ry <= 24; ry++) {
    for (let rx = 160; rx <= 170; rx++) grid[ry][rx] = TileType.EMPTY;
  }
  grid[21][163] = TileType.MOVING_PLATFORM_VERT;
  grid[12][167] = TileType.RING;
  grid[14][164] = TileType.RING;
  grid[24][158] = TileType.CHECKPOINT;
  // Shaft exit ledge
  fillRect(grid, 171, 20, 8, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[19][174] = TileType.RING;
  grid[19][176] = TileType.MONITOR_BUBBLE;
  // Rocky overhang dripping stalactites down onto the spike beds below
  fillRect(grid, 178, 13, 24, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let sx = 182; sx <= 198; sx += 8) grid[15][sx] = TileType.GIMMICK_STALACTITE;
  for (let sx = 186; sx <= 200; sx += 5) grid[25][sx] = TileType.SPIKES_UP;
  grid[24][204] = TileType.BADNIK_CATERKILLER;
  grid[24][208] = TileType.MONITOR_INVINCIBILITY;
  fillRect(grid, 212, 21, 10, 11, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let x = 210; x <= 216; x += 2) grid[20][x] = TileType.RING;
  grid[24][226] = TileType.GOAL_POST;

  return {
    id: 'mystic-caverns-act-1',
    name: 'Mystic Caverns',
    act: 1,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'mystic-caverns',
    grid,
    p1Spawn: { x: 4, y: 23 },
    p2Spawn: { x: 2, y: 23 },
  };
}

// ============================================================================
// LEVEL 12: MYSTIC CAVERNS ZONE — ACT 2
// (Egg Drill-Crusher — Drill Charge, Wall-Crash Stun 115 Frames,
//  Ceiling Burrow Tremors & Ground Slam Shockwaves)
// ============================================================================
function buildMysticCavernsAct2(): LevelData {
  const width = 240;
  const height = 32;
  const grid = createEmptyGrid(width, height);

  // Section 1: Spooky Purple Grotto & Falling Stalactite Run (x 0..44)
  fillRect(grid, 0, 0, 44, 17, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 0, 24, 44, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[23][4] = TileType.SPAWN_P1;
  grid[23][2] = TileType.SPAWN_P2;
  for (let x = 7; x <= 14; x++) grid[22][x] = TileType.RING;
  grid[23][16] = TileType.MONITOR_FLAME;
  grid[23][18] = TileType.MONITOR_SPEED;
  for (let sx = 9; sx <= 39; sx += 5) grid[17][sx] = TileType.GIMMICK_STALACTITE;
  grid[22][22] = TileType.BADNIK_BATBRAIN;
  for (let sx = 28; sx <= 34; sx += 2) grid[24][sx] = TileType.SPIKES_UP;

  // Section 2: Mine Cart Shaft, Elevator Ascent & Rock Vault (x 44..104)
  fillRect(grid, 44, 0, 60, 11, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 44, 25, 60, 7, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let ry = 11; ry <= 24; ry++) {
    for (let rx = 52; rx <= 62; rx++) grid[ry][rx] = TileType.EMPTY;
  }
  grid[21][55] = TileType.MOVING_PLATFORM_VERT;
  grid[14][59] = TileType.RING;
  grid[12][59] = TileType.RING;
  fillRect(grid, 63, 19, 8, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[18][66] = TileType.CHECKPOINT;
  // Breakable rock vault hiding a Giant Ring
  fillRect(grid, 74, 17, 14, 8, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let ry = 18; ry <= 23; ry++) {
    for (let rx = 75; rx <= 86; rx++) grid[ry][rx] = TileType.EMPTY;
    grid[ry][74] = TileType.BREAKABLE_ROCK;
  }
  grid[23][78] = TileType.GIANT_RING;
  grid[23][81] = TileType.MONITOR_INVINCIBILITY;
  grid[23][84] = TileType.RING;
  grid[23][85] = TileType.RING;
  grid[24][92] = TileType.BADNIK_CATERKILLER;
  for (let sx = 94; sx <= 100; sx += 3) grid[24][sx] = TileType.SPIKES_UP;
  fillRect(grid, 93, 19, 12, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  for (let sx = 95; sx <= 101; sx += 3) grid[21][sx] = TileType.SPIKES_DOWN;

  // Section 3: Crystal Chasm Crossing with Stalactites & Steam Bridge (x 104..176)
  fillRect(grid, 104, 0, 72, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 104, 28, 72, 4, TileType.GROUND_DEEP, TileType.GROUND_DEEP);
  for (let px = 108; px <= 172; px += 9) {
    fillRect(grid, px, 20, 5, 1, TileType.PLATFORM, TileType.PLATFORM);
    grid[18][px + 2] = TileType.RING;
  }
  grid[16][112] = TileType.BADNIK_BATBRAIN;
  for (let sx = 120; sx <= 160; sx += 8) grid[10][sx] = TileType.GIMMICK_STALACTITE;
  grid[19][140] = TileType.GIMMICK_DASH_RING;
  grid[20][156] = TileType.MONITOR_LIGHTNING;
  grid[24][130] = TileType.CHECKPOINT; // Rest pillar inside the chasm
  fillRect(grid, 128, 24, 5, 4, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 164, 16, 8, 2, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[15][168] = TileType.GIANT_RING;

  // Section 4: Reinforced Drill-Crusher Arena (x 176..240)
  // Solid cavern roof the drill can burrow up into for its Ceiling Burrow tremors!
  fillRect(grid, 176, 0, 64, 10, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  fillRect(grid, 176, 21, 64, 11, TileType.GROUND_TOP, TileType.GROUND_DEEP);
  grid[20][179] = TileType.CHECKPOINT;
  grid[20][182] = TileType.MONITOR_RING;
  grid[20][186] = TileType.BOOSTER_RIGHT;
  for (let x = 190; x <= 196; x += 2) grid[19][x] = TileType.RING;
  grid[20][198] = TileType.CHECKPOINT;
  // Dodge catwalks under the burrow ceiling
  fillRect(grid, 187, 16, 7, 1, TileType.PLATFORM, TileType.PLATFORM);
  fillRect(grid, 213, 16, 7, 1, TileType.PLATFORM, TileType.PLATFORM);
  grid[15][190] = TileType.RING;
  grid[15][216] = TileType.RING;

  // Egg Drill-Crusher (Act 2 Boss)
  grid[16][204] = TileType.BOSS_MYSTIC;

  grid[20][232] = TileType.GOAL_POST;

  return {
    id: 'mystic-caverns-act-2',
    name: 'Mystic Caverns',
    act: 2,
    author: 'Sonic Velocity Studio',
    width,
    height,
    tilesetId: 'mystic-caverns',
    grid,
    p1Spawn: { x: 4, y: 23 },
    p2Spawn: { x: 2, y: 23 },
  };
}

// Sequential Campaign Order: Emerald Mountains → Marble Zone → Mystic Caverns
// → Chemical Plant → Neo Starlight → Hill Top Peaks → Death Egg Zone.
// "Broken Test 01" stays LAST and is only reachable via the Active Zone & Act selector.
export const DEFAULT_LEVELS: LevelData[] = [
  buildEmeraldMountainsAct1(),
  buildEmeraldMountainsAct2(),
  buildMarbleZoneAct1(),
  buildMarbleZoneAct2(),
  buildMysticCavernsAct1(),
  buildMysticCavernsAct2(),
  buildChemicalPlantAct1(),
  buildChemicalPlantAct2(),
  buildNeoStarlightAct1(),
  buildNeoStarlightAct2(),
  buildHillTopPeaksAct1(),
  buildHillTopPeaksAct2(),
  buildDeathEggZone(),
  buildBrokenTest01(),
];

/** Canonical campaign progression ids (Act 1 -> Act 2 per zone, in zone order). */
export const CAMPAIGN_ORDER: string[] = DEFAULT_LEVELS.map((l) => l.id);

/**
 * Keeps the level list in canonical campaign order:
 * Emerald Mountains -> Marble Zone -> Mystic Caverns -> Chemical Plant ->
 * Neo Starlight -> Hill Top Peaks -> Death Egg Zone, with any user-authored
 * stages (or built-in stages the player deleted) preserved just before the
 * finale. "Broken Test 01" always stays dead last so it is only reachable
 * through the Active Zone & Act selector.
 */
export function orderCampaignLevels(list: LevelData[]): LevelData[] {
  const defaultDeathEgg =
    DEFAULT_LEVELS.find((l) => l.id === 'death-egg-zone') ||
    DEFAULT_LEVELS[DEFAULT_LEVELS.length - 2];
  const defaultBrokenTest = DEFAULT_LEVELS.find((l) => l.id === 'broken-test-01');
  const foundDeathEgg = list.find((l) => l.id === 'death-egg-zone');
  const existingDeathEgg =
    foundDeathEgg && foundDeathEgg.width >= 232 ? foundDeathEgg : defaultDeathEgg;
  const existingBrokenTest =
    list.find((l) => l.id === 'broken-test-01') || defaultBrokenTest;

  const byId = new Map(list.map((l) => [l.id, l]));
  const ordered: LevelData[] = [];
  for (const id of CAMPAIGN_ORDER) {
    if (id === 'broken-test-01' || id === 'death-egg-zone') continue;
    const found = byId.get(id);
    if (found) ordered.push(found);
    byId.delete(id);
  }
  const userStages = list.filter(
    (l) =>
      byId.has(l.id) &&
      l.id !== 'emerald-mountains-act-3' &&
      l.id !== 'death-egg-zone' &&
      l.id !== 'broken-test-01'
  );

  return existingBrokenTest
    ? [...ordered, ...userStages, existingDeathEgg, existingBrokenTest]
    : [...ordered, ...userStages, existingDeathEgg];
}

/**
 * Builds the 7 Unique, 3x-Larger, Harder Special Stages (Stages 1..7):
 * - Sonic 1 Rotating 2D Maze Grid: 42x42 (Harder multi-layer Crystal Vaults & many GOAL_EXIT traps!)
 * - Sonic 3 "Get Blue Spheres!" 3D Planetary Grid: 36x36 (Note: Marked Broken/Experimental in UI)
 */
function buildSpecialStage(stageNumber: number): SpecialStageData {
  const info = CHAOS_EMERALD_INFO[stageNumber - 1];
  const s1Size = 42;
  const s1Grid: number[][] = Array.from({ length: s1Size }, () =>
    Array(s1Size).fill(SpecialTileType.EMPTY)
  );

  const wallFor = (idx: number): SpecialTileType =>
    (idx + stageNumber) % 3 === 0
      ? SpecialTileType.WALL_BLUE
      : (idx + stageNumber) % 3 === 1
      ? SpecialTileType.WALL_YELLOW
      : SpecialTileType.WALL_PINK;

  // Outer Kaleidoscope Border Walls (42x42)
  for (let i = 0; i < s1Size; i++) {
    const w = wallFor(i);
    s1Grid[0][i] = w;
    s1Grid[s1Size - 1][i] = w;
    s1Grid[i][0] = w;
    s1Grid[i][s1Size - 1] = w;
  }

  // Helper to place a Harder Breakable Crystal Vault + Corner GOAL_EXIT Traps around the Emerald at (ex, ey)
  const placeEmeraldVault = (ex: number, ey: number, layers: number = 3) => {
    for (let dy = -layers; dy <= layers; dy++) {
      for (let dx = -layers; dx <= layers; dx++) {
        const gy = ey + dy;
        const gx = ex + dx;
        if (gy <= 0 || gy >= s1Size - 1 || gx <= 0 || gx >= s1Size - 1) continue;
        if (dx === 0 && dy === 0) {
          s1Grid[gy][gx] = SpecialTileType.CHAOS_EMERALD;
        } else if (Math.abs(dx) === layers && Math.abs(dy) === layers) {
          // Corner GOAL_EXIT traps guarding the outer corners of the crystal vault!
          s1Grid[gy][gx] = SpecialTileType.GOAL_EXIT;
        } else if (Math.abs(dx) >= 1 && Math.abs(dy) >= 1) {
          s1Grid[gy][gx] = SpecialTileType.GEM_BREAKABLE;
        } else {
          s1Grid[gy][gx] = SpecialTileType.GEM_BREAKABLE;
        }
      }
    }
  };

  if (stageNumber === 1) {
    // STAGE 1 (HARDER): EMERALD SPIRAL CITADEL (3-Ring Spiral with 14 GOAL Traps & Bumper Locks)
    s1Grid[3][3] = SpecialTileType.PLAYER_START;
    for (let i = 6; i <= 35; i++) {
      s1Grid[6][i] = SpecialTileType.WALL_BLUE;
      s1Grid[i][35] = SpecialTileType.WALL_YELLOW;
      if (i >= 10) s1Grid[35][i] = SpecialTileType.WALL_PINK;
      if (i >= 12 && i <= 35) s1Grid[i][10] = SpecialTileType.WALL_BLUE;
    }
    for (let i = 10; i <= 29; i++) {
      s1Grid[12][i] = SpecialTileType.WALL_YELLOW;
      if (i >= 12) s1Grid[i][29] = SpecialTileType.WALL_PINK;
      if (i >= 16) s1Grid[29][i] = SpecialTileType.WALL_BLUE;
    }
    for (let k = 4; k <= 32; k += 4) {
      s1Grid[3][k] = SpecialTileType.RING;
      s1Grid[k][38] = SpecialTileType.RING;
      s1Grid[38][k] = SpecialTileType.RING;
    }
    // Extra Bumpers, Speed-Up Spheres & 10 Corridor GOAL_EXIT Hazards
    s1Grid[9][16] = SpecialTileType.BUMPER;
    s1Grid[9][24] = SpecialTileType.BUMPER;
    s1Grid[20][32] = SpecialTileType.REVERSE_ROT;
    s1Grid[15][32] = SpecialTileType.SPEED_UP;
    s1Grid[32][20] = SpecialTileType.BUMPER;
    s1Grid[4][38] = SpecialTileType.GOAL_EXIT;
    s1Grid[18][4] = SpecialTileType.GOAL_EXIT;
    s1Grid[28][4] = SpecialTileType.GOAL_EXIT;
    s1Grid[38][4] = SpecialTileType.GOAL_EXIT;
    s1Grid[38][20] = SpecialTileType.GOAL_EXIT;
    s1Grid[38][38] = SpecialTileType.GOAL_EXIT;
    s1Grid[9][33] = SpecialTileType.GOAL_EXIT;
    s1Grid[33][12] = SpecialTileType.GOAL_EXIT;
    s1Grid[14][14] = SpecialTileType.GOAL_EXIT;
    s1Grid[27][27] = SpecialTileType.GOAL_EXIT;
    placeEmeraldVault(21, 21, 2);
  } else if (stageNumber === 2) {
    // STAGE 2 (HARDER): PINBALL BUMPER REACTOR (High-Density Bumper Matrix & 16 GOAL Traps)
    s1Grid[3][21] = SpecialTileType.PLAYER_START;
    for (let r = 7; r <= 33; r += 5) {
      for (let c = 5; c <= 36; c += 5) {
        if (Math.abs(r - 35) <= 4 && Math.abs(c - 21) <= 4) continue;
        if ((r + c) % 3 === 0) {
          s1Grid[r][c] = SpecialTileType.GOAL_EXIT;
        } else if ((r + c) % 2 === 0) {
          s1Grid[r][c] = SpecialTileType.BUMPER;
        } else {
          s1Grid[r][c] = SpecialTileType.RING;
        }
      }
    }
    for (let i = 7; i <= 34; i++) {
      if (i < 18 || i > 24) {
        s1Grid[15][i] = SpecialTileType.WALL_YELLOW;
        s1Grid[27][i] = SpecialTileType.WALL_BLUE;
      } else {
        s1Grid[15][i] = SpecialTileType.GEM_BREAKABLE;
        s1Grid[27][i] = SpecialTileType.GEM_BREAKABLE;
      }
    }
    s1Grid[10][10] = SpecialTileType.REVERSE_ROT;
    s1Grid[10][31] = SpecialTileType.SPEED_UP;
    s1Grid[21][10] = SpecialTileType.SPEED_UP;
    s1Grid[21][31] = SpecialTileType.REVERSE_ROT;
    s1Grid[14][4] = SpecialTileType.GOAL_EXIT;
    s1Grid[14][37] = SpecialTileType.GOAL_EXIT;
    s1Grid[26][4] = SpecialTileType.GOAL_EXIT;
    s1Grid[26][37] = SpecialTileType.GOAL_EXIT;
    s1Grid[38][14] = SpecialTileType.GOAL_EXIT;
    s1Grid[38][28] = SpecialTileType.GOAL_EXIT;
    placeEmeraldVault(21, 35, 3);
  } else if (stageNumber === 3) {
    // STAGE 3 (HARDER): TWIN VORTEX HOURGLASS (Goal-Lined Funnel Walls & Triple Crystal Neck)
    s1Grid[3][6] = SpecialTileType.PLAYER_START;
    for (let i = 1; i <= 15; i++) {
      s1Grid[5 + i][2 + i] = SpecialTileType.WALL_PINK;
      s1Grid[5 + i][39 - i] = SpecialTileType.WALL_PINK;
      s1Grid[36 - i][2 + i] = SpecialTileType.WALL_BLUE;
      s1Grid[36 - i][39 - i] = SpecialTileType.WALL_BLUE;
      if (i % 3 === 0) {
        s1Grid[5 + i][4 + i] = SpecialTileType.GOAL_EXIT;
        s1Grid[5 + i][37 - i] = SpecialTileType.GOAL_EXIT;
        s1Grid[36 - i][4 + i] = SpecialTileType.GOAL_EXIT;
        s1Grid[36 - i][37 - i] = SpecialTileType.GOAL_EXIT;
      }
    }
    // Triple-Layer Crystal Gate across the hourglass waist
    for (let x = 18; x <= 23; x++) {
      s1Grid[19][x] = SpecialTileType.GEM_BREAKABLE;
      s1Grid[20][x] = SpecialTileType.GEM_BREAKABLE;
      s1Grid[21][x] = SpecialTileType.GEM_BREAKABLE;
    }
    s1Grid[12][21] = SpecialTileType.BUMPER;
    s1Grid[15][19] = SpecialTileType.BUMPER;
    s1Grid[15][23] = SpecialTileType.BUMPER;
    s1Grid[16][14] = SpecialTileType.REVERSE_ROT;
    s1Grid[16][27] = SpecialTileType.SPEED_UP;
    s1Grid[25][10] = SpecialTileType.GOAL_EXIT;
    s1Grid[25][31] = SpecialTileType.GOAL_EXIT;
    s1Grid[30][15] = SpecialTileType.GOAL_EXIT;
    s1Grid[30][26] = SpecialTileType.GOAL_EXIT;
    placeEmeraldVault(21, 34, 3);
  } else if (stageNumber === 4) {
    // STAGE 4 (HARDER): AMETHYST SERPENTINE GAUNTLET (5-Tier Switchback with Goal Chokepoints)
    s1Grid[3][3] = SpecialTileType.PLAYER_START;
    const tiers = [8, 15, 22, 29, 35];
    tiers.forEach((rowY, idx) => {
      const gapStart = idx % 2 === 0 ? 31 : 5;
      for (let x = 1; x < s1Size - 1; x++) {
        if (x >= gapStart && x <= gapStart + 4) {
          s1Grid[rowY][x] = SpecialTileType.GEM_BREAKABLE;
          s1Grid[rowY - 1][x] = SpecialTileType.GEM_BREAKABLE;
        } else {
          s1Grid[rowY][x] = wallFor(idx + x);
        }
      }
      for (let x = 6; x < s1Size - 6; x += 4) {
        s1Grid[rowY - 3][x] = SpecialTileType.RING;
      }
      // Multiple GOAL_EXIT hazards on every tier!
      s1Grid[rowY - 2][idx % 2 === 0 ? 39 : 2] = SpecialTileType.GOAL_EXIT;
      s1Grid[rowY - 2][idx % 2 === 0 ? 28 : 12] = SpecialTileType.GOAL_EXIT;
      s1Grid[rowY - 4][16] = SpecialTileType.GOAL_EXIT;
      s1Grid[rowY - 4][25] = SpecialTileType.BUMPER;
      s1Grid[rowY - 4][20] = idx % 2 === 0 ? SpecialTileType.SPEED_UP : SpecialTileType.REVERSE_ROT;
    });
    placeEmeraldVault(21, 38, 2);
  } else if (stageNumber === 5) {
    // STAGE 5 (HARDER): DIAMOND STAR FORTRESS (4-Quadrant Cross Citadel with 16 Goal Mines)
    s1Grid[21][3] = SpecialTileType.PLAYER_START;
    for (let i = 5; i <= 36; i++) {
      if (i < 16 || i > 26) {
        s1Grid[i][16] = SpecialTileType.WALL_BLUE;
        s1Grid[i][26] = SpecialTileType.WALL_BLUE;
        s1Grid[16][i] = SpecialTileType.WALL_YELLOW;
        s1Grid[26][i] = SpecialTileType.WALL_YELLOW;
      } else {
        s1Grid[i][16] = SpecialTileType.GEM_BREAKABLE;
        s1Grid[i][26] = SpecialTileType.GEM_BREAKABLE;
        s1Grid[16][i] = SpecialTileType.GEM_BREAKABLE;
        s1Grid[26][i] = SpecialTileType.GEM_BREAKABLE;
      }
    }
    for (let a = 7; a <= 34; a += 3) {
      s1Grid[21][a] = SpecialTileType.RING;
      s1Grid[a][21] = SpecialTileType.RING;
    }
    s1Grid[10][10] = SpecialTileType.BUMPER;
    s1Grid[10][31] = SpecialTileType.BUMPER;
    s1Grid[31][10] = SpecialTileType.BUMPER;
    s1Grid[31][31] = SpecialTileType.BUMPER;
    s1Grid[13][13] = SpecialTileType.GOAL_EXIT;
    s1Grid[13][28] = SpecialTileType.GOAL_EXIT;
    s1Grid[28][13] = SpecialTileType.GOAL_EXIT;
    s1Grid[28][28] = SpecialTileType.GOAL_EXIT;
    s1Grid[7][21] = SpecialTileType.GOAL_EXIT;
    s1Grid[35][21] = SpecialTileType.GOAL_EXIT;
    s1Grid[21][35] = SpecialTileType.GOAL_EXIT;
    s1Grid[19][14] = SpecialTileType.GOAL_EXIT;
    s1Grid[23][14] = SpecialTileType.GOAL_EXIT;
    s1Grid[14][19] = SpecialTileType.GOAL_EXIT;
    s1Grid[14][23] = SpecialTileType.GOAL_EXIT;
    s1Grid[21][12] = SpecialTileType.REVERSE_ROT;
    s1Grid[12][21] = SpecialTileType.SPEED_UP;
    placeEmeraldVault(21, 21, 3);
  } else if (stageNumber === 6) {
    // STAGE 6 (HARDER): AQUA ACCELERATOR RINGS (Nested Concentric Chambers & Goal Corner Traps)
    s1Grid[2][21] = SpecialTileType.PLAYER_START;
    const rings = [6, 11, 16];
    rings.forEach((inset, idx) => {
      const min = inset;
      const max = s1Size - 1 - inset;
      for (let i = min; i <= max; i++) {
        const isGate = i >= 19 && i <= 23;
        const gateOnTop = idx % 2 === 0;
        s1Grid[min][i] =
          isGate && gateOnTop ? SpecialTileType.GEM_BREAKABLE : SpecialTileType.WALL_BLUE;
        s1Grid[max][i] =
          isGate && !gateOnTop ? SpecialTileType.GEM_BREAKABLE : SpecialTileType.WALL_PINK;
        s1Grid[i][min] = SpecialTileType.WALL_YELLOW;
        s1Grid[i][max] = SpecialTileType.WALL_YELLOW;
      }
      // Place GOAL_EXIT spheres in all 4 interior corners + flanking the crystal gates!
      s1Grid[min + 2][min + 2] = SpecialTileType.GOAL_EXIT;
      s1Grid[min + 2][max - 2] = SpecialTileType.GOAL_EXIT;
      s1Grid[max - 2][min + 2] = SpecialTileType.GOAL_EXIT;
      s1Grid[max - 2][max - 2] = SpecialTileType.GOAL_EXIT;
      s1Grid[min + 1][17] = SpecialTileType.BUMPER;
      s1Grid[min + 1][25] = SpecialTileType.BUMPER;
      s1Grid[max - 1][17] = SpecialTileType.SPEED_UP;
      s1Grid[max - 1][25] = SpecialTileType.REVERSE_ROT;
    });
    placeEmeraldVault(21, 21, 3);
  } else {
    // STAGE 7 (HARDEST): CRIMSON CHAOS SANCTUM (18 GOAL Spheres & 4-Layer Crystal Fortress!)
    s1Grid[3][3] = SpecialTileType.PLAYER_START;
    for (let x = 1; x < s1Size - 1; x++) {
      if (x < 18 || x > 24) {
        s1Grid[11][x] = SpecialTileType.WALL_PINK;
        s1Grid[29][x] = SpecialTileType.WALL_YELLOW;
      } else {
        s1Grid[11][x] = SpecialTileType.GEM_BREAKABLE;
        s1Grid[12][x] = SpecialTileType.GEM_BREAKABLE;
        s1Grid[28][x] = SpecialTileType.GEM_BREAKABLE;
        s1Grid[29][x] = SpecialTileType.GEM_BREAKABLE;
      }
    }
    for (let y = 12; y <= 28; y++) {
      if (y < 18 || y > 22) {
        s1Grid[y][13] = SpecialTileType.WALL_BLUE;
        s1Grid[y][28] = SpecialTileType.WALL_BLUE;
      } else {
        s1Grid[y][13] = SpecialTileType.GEM_BREAKABLE;
        s1Grid[y][28] = SpecialTileType.GEM_BREAKABLE;
      }
    }
    for (let x = 5; x <= 36; x += 5) {
      s1Grid[6][x] = SpecialTileType.RING;
      s1Grid[20][x] = SpecialTileType.RING;
      s1Grid[33][x] = SpecialTileType.RING;
    }
    // Heavy Goal Sphere Minefield across all chambers!
    const goalCoords = [
      [8, 8], [8, 16], [8, 25], [8, 33],
      [15, 6], [15, 16], [15, 25], [15, 35],
      [25, 6], [25, 16], [25, 25], [25, 35],
      [33, 8], [33, 14], [33, 27], [33, 33],
    ];
    goalCoords.forEach(([gy, gx]) => {
      s1Grid[gy][gx] = SpecialTileType.GOAL_EXIT;
    });
    s1Grid[10][17] = SpecialTileType.BUMPER;
    s1Grid[10][25] = SpecialTileType.BUMPER;
    s1Grid[20][18] = SpecialTileType.SPEED_UP;
    s1Grid[20][24] = SpecialTileType.REVERSE_ROT;
    s1Grid[27][17] = SpecialTileType.BUMPER;
    s1Grid[27][25] = SpecialTileType.BUMPER;
    placeEmeraldVault(21, 35, 3);
  }

  // ============================================================================
  // SONIC 3 "GET BLUE SPHERES!" 3D PLANETARY GRID (36x36 — Harder Red Sphere Moats)
  // ============================================================================
  const s3Size = 36;
  const s3Grid: number[][] = Array.from({ length: s3Size }, () =>
    Array(s3Size).fill(SpecialTileType.EMPTY)
  );

  const placeSphereBox = (
    x0: number,
    y0: number,
    w: number,
    h: number,
    hollowRingCenter: boolean = true
  ) => {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const gx = (x0 + dx + s3Size) % s3Size;
        const gy = (y0 + dy + s3Size) % s3Size;
        const isEdge = dx === 0 || dx === w - 1 || dy === 0 || dy === h - 1;
        if (hollowRingCenter && !isEdge) {
          s3Grid[gy][gx] = SpecialTileType.RING;
        } else {
          s3Grid[gy][gx] = SpecialTileType.BLUE_SPHERE;
        }
      }
    }
  };

  s3Grid[30][18] = SpecialTileType.PLAYER_START;

  if (stageNumber === 1) {
    placeSphereBox(16, 22, 5, 5, true);
    placeSphereBox(16, 12, 5, 5, true);
    placeSphereBox(8, 12, 4, 4, true);
    placeSphereBox(25, 12, 4, 4, true);
    placeSphereBox(8, 22, 4, 4, true);
    placeSphereBox(25, 22, 4, 4, true);
    for (let y = 17; y <= 21; y++) s3Grid[y][18] = SpecialTileType.RING;
    s3Grid[11][15] = SpecialTileType.RED_SPHERE;
    s3Grid[11][21] = SpecialTileType.RED_SPHERE;
    s3Grid[21][15] = SpecialTileType.RED_SPHERE;
    s3Grid[21][21] = SpecialTileType.RED_SPHERE;
    s3Grid[20][12] = SpecialTileType.YELLOW_SPRING_SPHERE;
    s3Grid[20][24] = SpecialTileType.YELLOW_SPRING_SPHERE;
  } else if (stageNumber === 2) {
    for (let y = 6; y <= 26; y += 5) {
      placeSphereBox(10, y, 4, 3, true);
      placeSphereBox(22, y, 4, 3, true);
      s3Grid[y + 1][16] = SpecialTileType.RED_SPHERE;
      s3Grid[y + 1][18] = SpecialTileType.YELLOW_SPRING_SPHERE;
      s3Grid[y + 1][20] = SpecialTileType.RED_SPHERE;
      s3Grid[y][9] = SpecialTileType.BUMPER_SPHERE;
      s3Grid[y][27] = SpecialTileType.BUMPER_SPHERE;
    }
  } else if (stageNumber === 3) {
    placeSphereBox(15, 20, 7, 4, true);
    placeSphereBox(15, 10, 7, 4, true);
    placeSphereBox(6, 15, 5, 4, true);
    placeSphereBox(25, 15, 5, 4, true);
    placeSphereBox(6, 7, 4, 3, true);
    placeSphereBox(26, 7, 4, 3, true);
    for (let i = 13; i <= 23; i++) {
      s3Grid[16][i] = SpecialTileType.RING;
      s3Grid[17][i] = SpecialTileType.RED_SPHERE;
    }
    s3Grid[17][18] = SpecialTileType.YELLOW_SPRING_SPHERE;
  } else if (stageNumber === 4) {
    for (let ry = 6; ry <= 24; ry += 6) {
      for (let rx = 6; rx <= 26; rx += 6) {
        placeSphereBox(rx, ry, 3, 3, true);
        s3Grid[ry - 1][rx + 1] = SpecialTileType.RED_SPHERE;
        s3Grid[ry + 3][rx + 1] = SpecialTileType.YELLOW_SPRING_SPHERE;
      }
    }
  } else if (stageNumber === 5) {
    for (let x = 3; x < 33; x += 5) {
      placeSphereBox(x, 16, 3, 4, true);
      placeSphereBox(x, 8, 3, 3, true);
      s3Grid[14][x + 1] = SpecialTileType.RED_SPHERE;
      s3Grid[21][x + 1] = SpecialTileType.BUMPER_SPHERE;
    }
    placeSphereBox(16, 24, 5, 3, true);
  } else if (stageNumber === 6) {
    for (let step = 0; step < 6; step++) {
      const sx = 7 + (step % 2) * 14;
      const sy = 5 + step * 4;
      placeSphereBox(sx, sy, 5, 3, true);
      placeSphereBox(sx + 7, sy, 3, 3, true);
      s3Grid[sy + 1][18] = SpecialTileType.YELLOW_SPRING_SPHERE;
      s3Grid[sy][sx - 1] = SpecialTileType.RED_SPHERE;
      s3Grid[sy][sx + 5] = SpecialTileType.RED_SPHERE;
    }
  } else {
    const offsets = [
      [16, 23],
      [16, 15],
      [16, 7],
      [8, 19],
      [24, 19],
      [8, 11],
      [24, 11],
      [16, 31],
      [8, 3],
      [24, 3],
    ];
    offsets.forEach(([ox, oy], idx) => {
      placeSphereBox(ox, oy, 4, 4, true);
      s3Grid[oy - 1][ox] = SpecialTileType.RED_SPHERE;
      s3Grid[oy - 1][ox + 3] = SpecialTileType.RED_SPHERE;
      s3Grid[oy + 4][ox] = SpecialTileType.RED_SPHERE;
      s3Grid[oy + 4][ox + 1] =
        idx % 2 === 0
          ? SpecialTileType.YELLOW_SPRING_SPHERE
          : SpecialTileType.BUMPER_SPHERE;
    });
  }

  return {
    stageNumber,
    name: `Special Stage ${stageNumber}`,
    emeraldName: info.name,
    emeraldColor: info.color,
    s1Width: s1Size,
    s1Height: s1Size,
    s1Grid,
    s3Size,
    s3Grid,
  };
}

export const DEFAULT_SPECIAL_STAGES: SpecialStageData[] = [1, 2, 3, 4, 5, 6, 7].map((n) =>
  buildSpecialStage(n)
);

