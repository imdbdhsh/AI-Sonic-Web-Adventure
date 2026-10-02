import { soundFX } from '../audio/soundEngine';
import { CHARACTER_SPECS } from '../data/presets';
import {
  ActiveBadnik,
  ActiveBoss,
  ActiveHazard,
  BadnikProjectile,
  CharacterId,
  ControlInputState,
  DynamicPlatform,
  LevelData,
  MechBossPhase,
  ParticleFX,
  PlayerEntity,
  ScatteredRing,
  TileType,
  TubeTravelState,
} from '../types/engine';

export const TILE_SIZE = 32;
const PLAYER_HALF_W = 10;
const PLAYER_HALF_H = 15;
// Boss tuning constants
export const OVERHEAT_VENT_FRAMES = 120;   // Chemical Plant boss cooling-dome opening
export const DRILL_CRASH_STUN_FRAMES = 115; // Mystic Caverns boss wall-crash jam

export function createPlayerEntity(
  id: 1 | 2,
  character: CharacterId,
  spawnTileX: number,
  spawnTileY: number,
  isAI: boolean
): PlayerEntity {
  const startX = spawnTileX * TILE_SIZE + 16;
  const startY = spawnTileY * TILE_SIZE + 16;
  return {
    id,
    character,
    isAI,
    isSuper: false,
    isHyper: false,
    superRingTimer: 60,
    hyperFlashUsed: false,
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    gsp: 0,
    groundAngle: 0,
    onGround: false,
    facing: 1,
    state: 'idle',
    spindashRev: 0,
    peeloutCharge: 0,
    dropdashTimer: 0,
    flyStamina: 360,
    flyBoostCooldown: 0,
    shieldActionUsed: false,
    rings: 0,
    score: 0,
    shield: 'none',
    speedShoesTimer: 0,
    invincibleTimer: 0,
    hurtTimer: 0,
    checkpointX: startX,
    checkpointY: startY,
    finishedTimeMs: null,
    enteredGiantRing: false,
    collectedGiantRingKey: null,
    animTimer: 0,
    animFrame: 0,
    inLoop: false,
    tubeTravel: null,
    tubeCooldown: 0,
    loopCenterX: 0,
    loopCenterY: 0,
    loopAngle: 0,
    loopDir: 1,
    loopRadius: 74,
    loopCooldown: 0,
    camX: Math.max(0, startX - 240),
    camY: Math.max(0, startY - 180),
    camLookOffsetY: 0,
    inputQueue: [],
    forcedCutsceneRun: false,
    lives: 3,
    nextExtraLifeRingThreshold: 100,
    livesDeltaThisFrame: 0,
    gameOverTriggered: false,
    loopProgress: 0,
    raySwoopPitch: 0,
  };
}

export function spawnBadniksFromGrid(level: LevelData): ActiveBadnik[] {
  const list: ActiveBadnik[] = [];
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const t = level.grid[y][x];
      if (
        t === TileType.BADNIK_MOTOBUG ||
        t === TileType.BADNIK_BUZZ ||
        t === TileType.BADNIK_CRAB ||
        t === TileType.BADNIK_CHOPPER ||
        t === TileType.BADNIK_CATERKILLER ||
        t === TileType.BADNIK_BATBRAIN ||
        t === TileType.BADNIK_ORBINAUT ||
        t === TileType.BADNIK_BOMB ||
        t === TileType.BADNIK_SPINY
      ) {
        const px = x * TILE_SIZE + 16;
        const py = y * TILE_SIZE + 16;
        const initVx =
          t === TileType.BADNIK_BUZZ || t === TileType.BADNIK_BATBRAIN
            ? -2.6
            : t === TileType.BADNIK_CATERKILLER
            ? -2.3
            : t === TileType.BADNIK_CHOPPER
            ? 0
            : -1.8;
        list.push({
          id: `badnik_${x}_${y}`,
          type: t,
          x: px,
          y: py,
          startX: px,
          startY: py,
          vx: initVx,
          vy: 0,
          facing: -1,
          alive: true,
          timer: (x * 17 + y * 11) % 60,
          attackCooldown: 45,
          isCharging: false,
        });
      }
    }
  }
  return list;
}

export function spawnBossesFromGrid(level: LevelData): ActiveBoss[] {
  const hasDeathEggBoss = level.grid.some((row) =>
    row.some(
      (t) => t === TileType.BOSS_SILVER_SONIC || t === TileType.BOSS_DEATH_EGG_ROBOT
    )
  );
  // Bosses appear in Act 2 in each standard zone, and in Death Egg Zone!
  if (level.act !== 2 && level.id !== 'death-egg-zone' && !hasDeathEggBoss) return [];

  const list: ActiveBoss[] = [];
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const tile = level.grid[y][x];
      if (
        tile === TileType.BOSS_EGGMAN ||
        tile === TileType.BOSS_MARBLE ||
        tile === TileType.BOSS_STARLIGHT ||
        tile === TileType.BOSS_HILLTOP ||
        tile === TileType.BOSS_CHEMICAL ||
        tile === TileType.BOSS_MYSTIC ||
        tile === TileType.BOSS_SILVER_SONIC ||
        tile === TileType.BOSS_DEATH_EGG_ROBOT
      ) {
        const px = x * TILE_SIZE + 16;
        const py = y * TILE_SIZE + 16;
        const bossType: ActiveBoss['bossType'] =
          tile === TileType.BOSS_MARBLE
            ? 'marble'
            : tile === TileType.BOSS_STARLIGHT
            ? 'starlight'
            : tile === TileType.BOSS_HILLTOP
            ? 'hilltop'
            : tile === TileType.BOSS_CHEMICAL
            ? 'chemical'
            : tile === TileType.BOSS_MYSTIC
            ? 'mystic'
            : tile === TileType.BOSS_SILVER_SONIC
            ? 'silversonic'
            : tile === TileType.BOSS_DEATH_EGG_ROBOT
            ? 'deathegg'
            : 'eggman';
        const isFinalBoss = bossType === 'deathegg';
        const isSilverSonic = bossType === 'silversonic';
        const isMechDuo = bossType === 'chemical' || bossType === 'mystic';
        const maxHp = isFinalBoss ? 24 : isMechDuo ? 10 : 8;

        // Locate the arena floor: first solid tile straight below the boss post
        let mechFloorY = py + 3 * TILE_SIZE;
        for (let fy = y + 1; fy < level.height; fy++) {
          if (isSolidTile(level.grid[fy][x] as TileType)) {
            mechFloorY = fy * TILE_SIZE;
            break;
          }
        }
        // Locate the burrow ceiling: first solid tile straight above the boss post
        let mechCeilingY = Math.max(0, py - 6 * TILE_SIZE);
        for (let cy = y - 1; cy >= 0; cy--) {
          if (isSolidTile(level.grid[cy][x] as TileType)) {
            mechCeilingY = (cy + 1) * TILE_SIZE;
            break;
          }
        }

        const mechStartPhase: MechBossPhase =
          bossType === 'chemical' ? 'mech_advance' : 'drill_rev';
        list.push({
          id: `boss_${x}_${y}`,
          bossType,
          x: px,
          y: py,
          startX: px,
          startY: py,
          arenaLeft: Math.max(
            32,
            px - (isSilverSonic ? 544 : isFinalBoss ? 640 : 280)
          ),
          arenaRight: Math.min(
            level.width * TILE_SIZE - 32,
            px + (isSilverSonic ? 320 : isFinalBoss ? 288 : 280)
          ),
          engaged: false,
          vx: -2.2,
          vy: 0,
          facing: -1,
          hp: maxHp,
          maxHp,
          invulnTimer: 0,
          ballSwingAngle: 0,
          attackTimer: 0,
          alive: true,
          deatheggPhase: isFinalBoss ? 'walk_forward' : undefined,
          phaseTimer: 0,
          targetReticleActive: false,
          targetReticleX: px,
          targetReticleY: py + 16,
          targetReticleLocked: false,
          armsLaunched: 0,
          mechPhase: isMechDuo ? mechStartPhase : undefined,
          mechTimer: 0,
          mechFloorY,
          mechCeilingY,
          mechVulnerable: false,
          overheatFrames: 0,
          floodLevel: 0,
          vortexActive: false,
          vortexStrength: 0,
          stunFrames: 0,
          drillSpinning: false,
          ceilingBurrow: false,
          slamLanded: false,
        });
      }
    }
  }
  return list;
}

// ============================================================================
// SHARED HAZARD HELPERS (Mystic Caverns Stalactites / Debris / Boss Shockwaves)
// ============================================================================
let nextHazardId = 1;

export function spawnHazard(
  hazards: ActiveHazard[],
  kind: ActiveHazard['kind'],
  x: number,
  y: number,
  vx: number,
  vy: number,
  radius: number,
  life: number,
  damaging: boolean,
  color: string,
  facing?: 1 | -1
) {
  hazards.push({
    id: nextHazardId++,
    kind,
    x,
    y,
    vx,
    vy,
    radius,
    life,
    maxLife: life,
    damaging,
    color,
    facing,
  });
}

function getTileAt(grid: number[][], tx: number, ty: number): TileType {
  if (ty < 0 || ty >= grid.length) return TileType.EMPTY;
  if (tx < 0 || tx >= grid[0].length) return TileType.GROUND_DEEP;
  return grid[ty][tx] as TileType;
}

export function isMonitorTile(t: TileType): boolean {
  return (
    t === TileType.MONITOR_RING ||
    t === TileType.MONITOR_SPEED ||
    t === TileType.MONITOR_SHIELD ||
    t === TileType.MONITOR_FLAME ||
    t === TileType.MONITOR_LIGHTNING ||
    t === TileType.MONITOR_BUBBLE ||
    t === TileType.MONITOR_INVINCIBILITY ||
    t === TileType.MONITOR_EGGMAN ||
    t === TileType.MONITOR_SWAP ||
    t === TileType.MONITOR_SUPER ||
    t === TileType.MONITOR_1UP
  );
}

export function isBackgroundTile(t: TileType): boolean {
  return (
    t === TileType.BG_BRICK ||
    t === TileType.BG_PILLAR ||
    t === TileType.BG_WINDOW ||
    t === TileType.BG_LATTICE ||
    t === TileType.BG_FOLIAGE ||
    t === TileType.DECO_WATERFALL
  );
}

export function getDynamicPlatformState(
  col: number,
  row: number,
  type:
    | TileType.MOVING_PLATFORM
    | TileType.SWINGING_PLATFORM
    | TileType.MOVING_PLATFORM_VERT,
  tick: number
): DynamicPlatform {
  const baseX = col * TILE_SIZE + 16;
  const baseY = row * TILE_SIZE;

  if (type === TileType.MOVING_PLATFORM) {
    const phase = tick * 0.036 + col * 0.65;
    const prevPhase = (tick - 1) * 0.036 + col * 0.65;
    const x = baseX + Math.sin(phase) * 72;
    const prevX = baseX + Math.sin(prevPhase) * 72;
    return {
      col,
      row,
      type,
      x,
      y: baseY,
      prevX,
      prevY: baseY,
      width: 64,
      height: 14,
      pivotX: baseX,
      pivotY: baseY,
      angle: 0,
    };
  }

  if (type === TileType.MOVING_PLATFORM_VERT) {
    const phase = tick * 0.032 + row * 0.55;
    const prevPhase = (tick - 1) * 0.032 + row * 0.55;
    const y = baseY + Math.sin(phase) * 80;
    const prevY = baseY + Math.sin(prevPhase) * 80;
    return {
      col,
      row,
      type,
      x: baseX,
      y,
      prevX: baseX,
      prevY,
      width: 64,
      height: 14,
      pivotX: baseX,
      pivotY: baseY,
      angle: 0,
    };
  }

  // Swinging Pendulum Platform (TileType.SWINGING_PLATFORM)
  const pivotX = baseX;
  const pivotY = baseY + 6;
  const chainLen = 84;
  const angle = Math.sin(tick * 0.038 + col * 0.5) * 1.05;
  const prevAngle = Math.sin((tick - 1) * 0.038 + col * 0.5) * 1.05;
  const x = pivotX + Math.sin(angle) * chainLen;
  const y = pivotY + Math.cos(angle) * chainLen;
  const prevX = pivotX + Math.sin(prevAngle) * chainLen;
  const prevY = pivotY + Math.cos(prevAngle) * chainLen;
  return {
    col,
    row,
    type,
    x,
    y,
    prevX,
    prevY,
    width: 64,
    height: 14,
    pivotX,
    pivotY,
    angle,
  };
}

export function isCustomBlockTile(t: TileType): boolean {
  return t >= TileType.CUSTOM_BLOCK_1 && t <= TileType.CUSTOM_BLOCK_10;
}

export function isSolidTile(t: TileType): boolean {
  return (
    t === TileType.GROUND_TOP ||
    t === TileType.GROUND_DEEP ||
    t === TileType.SLOPE_UP_LOW ||
    t === TileType.SLOPE_UP_HIGH ||
    t === TileType.SLOPE_DOWN_HIGH ||
    t === TileType.SLOPE_DOWN_LOW ||
    t === TileType.SLOPE_45_UP ||
    t === TileType.SLOPE_45_DOWN ||
    t === TileType.BREAKABLE_ROCK ||
    t === TileType.SPIKES_UP ||
    t === TileType.LAVA ||
    t === TileType.GIMMICK_CRUSHER ||
    t === TileType.GIMMICK_LAVA_GEYSER ||
    t === TileType.GIMMICK_LAVA_SHOOTER_LEFT ||
    t === TileType.GIMMICK_LAVA_SHOOTER_RIGHT ||
    t === TileType.GIMMICK_CONVEYOR_RIGHT ||
    t === TileType.GIMMICK_CONVEYOR_LEFT ||
    t === TileType.ONE_WAY_DOOR_LOCKED ||
    t === TileType.SPIKES_DOWN ||
    t === TileType.GIMMICK_ACID_POOL ||
    t === TileType.GIMMICK_STEAM_VENT ||
    isCustomBlockTile(t)
  );
}

// Spiked surfaces damage on contact (Floor Spikes / Ceiling Spikes)
export function isSpikeHazardTile(t: TileType): boolean {
  return t === TileType.SPIKES_UP || t === TileType.SPIKES_DOWN;
}

// Shielded players (any elemental barrier), Super/Hyper forms & Invincibility
// are unaffected by boiling chemical pools & chemical floods.
export function isChemicallyShielded(player: PlayerEntity): boolean {
  return (
    player.shield !== 'none' ||
    player.isSuper ||
    player.isHyper ||
    player.invincibleTimer > 0
  );
}

export function isSlopeTile(t: TileType): boolean {
  return (
    t === TileType.SLOPE_UP_LOW ||
    t === TileType.SLOPE_UP_HIGH ||
    t === TileType.SLOPE_DOWN_HIGH ||
    t === TileType.SLOPE_DOWN_LOW ||
    t === TileType.SLOPE_45_UP ||
    t === TileType.SLOPE_45_DOWN
  );
}

function getTileSurfaceInfo(
  tile: TileType,
  tx: number,
  ty: number,
  worldX: number,
  grid?: number[][]
): { surfaceY: number; angle: number } | null {
  const topY = ty * TILE_SIZE;
  const bottomY = (ty + 1) * TILE_SIZE;
  const localX = Math.max(0, Math.min(TILE_SIZE, worldX - tx * TILE_SIZE));

  switch (tile) {
    case TileType.GROUND_TOP:
    case TileType.GROUND_DEEP:
    case TileType.PLATFORM:
    case TileType.BREAKABLE_ROCK:
    case TileType.SPIKES_UP:
    case TileType.LAVA:
    case TileType.GIMMICK_CRUSHER:
    case TileType.GIMMICK_LAVA_GEYSER:
    case TileType.GIMMICK_LAVA_SHOOTER_LEFT:
    case TileType.GIMMICK_LAVA_SHOOTER_RIGHT:
    case TileType.GIMMICK_CONVEYOR_RIGHT:
    case TileType.GIMMICK_CONVEYOR_LEFT:
    case TileType.CUSTOM_BLOCK_1:
    case TileType.CUSTOM_BLOCK_2:
    case TileType.CUSTOM_BLOCK_3:
    case TileType.CUSTOM_BLOCK_4:
    case TileType.CUSTOM_BLOCK_5:
    case TileType.CUSTOM_BLOCK_6:
    case TileType.CUSTOM_BLOCK_7:
    case TileType.CUSTOM_BLOCK_8:
    case TileType.CUSTOM_BLOCK_9:
    case TileType.CUSTOM_BLOCK_10:
    case TileType.SPIKES_DOWN:
    case TileType.GIMMICK_ACID_POOL:
    case TileType.GIMMICK_STEAM_VENT:
    case TileType.ONE_WAY_DOOR_LOCKED: {
      if (grid && ty > 0 && tile !== TileType.PLATFORM) {
        const aboveTile = getTileAt(grid, tx, ty - 1);
        if (isSlopeTile(aboveTile) || isSolidTile(aboveTile)) {
          return null;
        }
      }
      return { surfaceY: topY, angle: 0 };
    }

    case TileType.SLOPE_UP_LOW: {
      const h = (localX / TILE_SIZE) * 16;
      return { surfaceY: bottomY - h, angle: -0.4636 };
    }
    case TileType.SLOPE_UP_HIGH: {
      const h = 16 + (localX / TILE_SIZE) * 16;
      return { surfaceY: bottomY - h, angle: -0.4636 };
    }
    case TileType.SLOPE_DOWN_HIGH: {
      const h = 32 - (localX / TILE_SIZE) * 16;
      return { surfaceY: bottomY - h, angle: 0.4636 };
    }
    case TileType.SLOPE_DOWN_LOW: {
      const h = 16 - (localX / TILE_SIZE) * 16;
      return { surfaceY: bottomY - h, angle: 0.4636 };
    }
    case TileType.SLOPE_45_UP: {
      const h = localX;
      return { surfaceY: bottomY - h, angle: -0.7854 };
    }
    case TileType.SLOPE_45_DOWN: {
      const h = TILE_SIZE - localX;
      return { surfaceY: bottomY - h, angle: 0.7854 };
    }
    default:
      return null;
  }
}

export interface StepContext {
  level: LevelData;
  grid: number[][];
  badniks: ActiveBadnik[];
  bosses: ActiveBoss[];
  projectiles: BadnikProjectile[];
  scatteredRings: ScatteredRing[];
  particles: ParticleFX[];
  players: PlayerEntity[];
  allEmeraldsCollected: boolean;
  allSuperEmeraldsCollected?: boolean;
  elapsedMs: number;
  // Non-projectile mecha boss hazards + Mystic Caverns falling stalactites
  hazards: ActiveHazard[];
}

let nextParticleId = 1;
let nextScatteredRingId = 1;
let nextProjectileId = 1;

export function addParticle(
  particles: ParticleFX[],
  type: ParticleFX['type'],
  x: number,
  y: number,
  vx: number,
  vy: number,
  color: string,
  size: number = 5,
  maxLife: number = 24,
  text?: string
) {
  particles.push({
    id: nextParticleId++,
    type,
    x,
    y,
    vx,
    vy,
    color,
    size,
    life: maxLife,
    maxLife,
    text,
  });
}

export function triggerSuperTransformation(player: PlayerEntity, ctx: StepContext) {
  if (player.isSuper && (!ctx.allSuperEmeraldsCollected || player.isHyper)) return;
  player.isSuper = true;
  player.isHyper = Boolean(ctx.allSuperEmeraldsCollected);
  player.superRingTimer = 60;
  player.vy = Math.min(player.vy, -3.5);
  soundFX.playSuperTransform();

  const spec = CHARACTER_SPECS[player.character];
  const formTitle = player.isHyper ? spec.hyperName : spec.superName;
  addParticle(
    ctx.particles,
    'score_popup',
    player.x,
    player.y - 24,
    0,
    -1.2,
    player.isHyper ? '#38BDF8' : '#FACC15',
    14,
    55,
    `${formTitle.toUpperCase()}!`
  );
  const rainbowColors = ['#4ADE80', '#60A5FA', '#FDE047', '#C084FC', '#F8FAFC', '#22D3EE', '#F87171'];
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2;
    addParticle(
      ctx.particles,
      'sparkle',
      player.x,
      player.y,
      Math.cos(ang) * 4.5,
      Math.sin(ang) * 4.5,
      player.isHyper ? rainbowColors[i % rainbowColors.length] : '#FACC15',
      7,
      30
    );
  }
}

function checkExtraLifeFromRings(player: PlayerEntity, ctx: StepContext) {
  if (player.isAI) return;
  if (!player.nextExtraLifeRingThreshold || player.nextExtraLifeRingThreshold < 100) {
    player.nextExtraLifeRingThreshold = 100;
  }
  while (player.rings >= player.nextExtraLifeRingThreshold) {
    player.lives = (player.lives || 3) + 1;
    player.livesDeltaThisFrame = (player.livesDeltaThisFrame || 0) + 1;
    player.nextExtraLifeRingThreshold += 100;
    soundFX.playCheckpoint();
    addParticle(
      ctx.particles,
      'score_popup',
      player.x,
      player.y - 26,
      0,
      -1.3,
      '#22C55E',
      14,
      55,
      '1-UP! (100 RINGS)'
    );
  }
}

function hurtPlayer(
  player: PlayerEntity,
  ctx: StepContext,
  isSpikeOrProjectile: boolean = false
) {
  if (
    player.isSuper ||
    player.invincibleTimer > 0 ||
    player.hurtTimer > 0 ||
    player.state === 'victory' ||
    player.forcedCutsceneRun
  ) {
    return;
  }

  // Mighty the Armadillo (Sonic Mania): Curled Hard Shell deflects spikes & projectiles without losing rings!
  if (
    player.character === 'mighty' &&
    isSpikeOrProjectile &&
    (player.state === 'jump' ||
      player.state === 'roll' ||
      player.state === 'spindash' ||
      player.state === 'hammer_drop')
  ) {
    player.hurtTimer = 28;
    player.vy = -6.2;
    player.vx = -3.4 * player.facing;
    player.gsp = 0;
    player.onGround = false;
    player.state = 'roll';
    soundFX.playSpring(false);
    addParticle(
      ctx.particles,
      'score_popup',
      player.x,
      player.y - 20,
      0,
      -1.1,
      '#FACC15',
      12,
      32,
      'SHELL DEFLECT!'
    );
    return;
  }

  if (player.shield !== 'none') {
    player.shield = 'none';
    player.hurtTimer = 90;
    player.vy = -5.8;
    player.vx = -3.2 * player.facing;
    player.gsp = 0;
    player.onGround = false;
    player.inLoop = false;
    player.loopCooldown = 30;
    player.state = 'hurt';
    soundFX.playSpring(false);
    return;
  }

  if (player.rings > 0) {
    const dropCount = Math.min(player.rings, 24);
    player.rings = 0;
    player.nextExtraLifeRingThreshold = 100;
    soundFX.playRingLoss();
    for (let i = 0; i < dropCount; i++) {
      const angle = -Math.PI * 0.15 - (i / dropCount) * Math.PI * 0.7;
      const spd = i % 2 === 0 ? 4.8 : 3.2;
      ctx.scatteredRings.push({
        id: nextScatteredRingId++,
        x: player.x,
        y: player.y - 8,
        vx: Math.cos(angle) * spd * (i % 2 === 0 ? 1 : -1),
        vy: -Math.abs(Math.sin(angle) * spd) - 2.2,
        timer: 240,
      });
    }
    player.hurtTimer = 105;
    player.vy = -6.0;
    player.vx = -3.5 * player.facing;
    player.gsp = 0;
    player.onGround = false;
    player.inLoop = false;
    player.loopCooldown = 30;
    player.state = 'hurt';
  } else {
    soundFX.playPop();
    player.nextExtraLifeRingThreshold = 100;
    if (!player.isAI && player.id === 1) {
      player.lives = Math.max(0, (player.lives ?? 3) - 1);
      player.livesDeltaThisFrame = (player.livesDeltaThisFrame || 0) - 1;
      if (player.lives <= 0) {
        player.gameOverTriggered = true;
      }
      addParticle(
        ctx.particles,
        'score_popup',
        player.x,
        player.y - 24,
        0,
        -1.2,
        '#EF4444',
        13,
        48,
        player.lives <= 0 ? 'GAME OVER!' : `LIFE LOST! (${player.lives} LEFT)`
      );
    }
    player.x = player.checkpointX;
    player.y = player.checkpointY;
    player.vx = 0;
    player.vy = 0;
    player.gsp = 0;
    player.onGround = false;
    player.inLoop = false;
    player.loopCooldown = 30;
    player.hurtTimer = 90;
    player.state = 'idle';
  }
}

function killPlayerInVoid(player: PlayerEntity, ctx: StepContext) {
  if (player.state === 'victory') return;

  // Falling into the bottomless void is an INSTANT DEATH — even for Super & Hyper Forms, Shields, or Invincibility!
  soundFX.playRingLoss();
  soundFX.playPop();

  player.isSuper = false;
  player.isHyper = false;
  player.superRingTimer = 60;
  player.hyperFlashUsed = false;
  player.shield = 'none';
  player.invincibleTimer = 0;
  player.speedShoesTimer = 0;
  player.rings = 0;
  player.nextExtraLifeRingThreshold = 100;

  if (!player.isAI && player.id === 1) {
    player.lives = Math.max(0, (player.lives ?? 3) - 1);
    player.livesDeltaThisFrame = (player.livesDeltaThisFrame || 0) - 1;
    if (player.lives <= 0) {
      player.gameOverTriggered = true;
    }
  }

  player.x = player.checkpointX;
  player.y = player.checkpointY;
  player.vx = 0;
  player.vy = 0;
  player.gsp = 0;
  player.groundAngle = 0;
  player.onGround = false;
  player.inLoop = false;
  player.loopCooldown = 30;
  player.hurtTimer = 90;
  player.state = 'idle';

  addParticle(
    ctx.particles,
    'score_popup',
    player.x,
    player.y - 24,
    0,
    -1.2,
    '#EF4444',
    13,
    45,
    player.lives <= 0 ? 'GAME OVER!' : `VOID DEATH! (${player.lives} LIVES LEFT)`
  );
}

// ============================================================================
// CHEMICAL PLANT TRAVEL TUBES
// The player falls into a Tube Intake and is carried through the glass pipe
// network before being launched out of a Tube Exit nozzle.
// ============================================================================
function findTubeExit(
  ctx: StepContext,
  entryTx: number,
  entryTy: number
): { x: number; y: number; tx: number; ty: number } | null {
  let best: { x: number; y: number; tx: number; ty: number } | null = null;
  let bestScore = Infinity;
  for (let ty = 0; ty < ctx.level.height; ty++) {
    for (let tx = 0; tx < ctx.level.width; tx++) {
      if (ctx.grid[ty][tx] !== TileType.GIMMICK_TUBE_EXIT) continue;
      if (tx === entryTx && ty === entryTy) continue;
      // Prefer exits to the right & ahead of the intake, then nearest by distance
      const dx = tx - entryTx;
      const score = Math.abs(dx) + Math.abs(ty - entryTy) * 1.25 + (dx < 0 ? 200 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = { x: tx * TILE_SIZE + 16, y: ty * TILE_SIZE + 16, tx, ty };
      }
    }
  }
  return best;
}

function startTubeTravel(
  player: PlayerEntity,
  ctx: StepContext,
  entryTx: number,
  entryTy: number
) {
  const exit = findTubeExit(ctx, entryTx, entryTy);
  if (!exit) return;
  const entryCx = entryTx * TILE_SIZE + 16;
  const entryCy = entryTy * TILE_SIZE + 16;
  // The horizontal transport channel runs 2 tiles below the intake mouth
  const channelY = (entryTy + 2) * TILE_SIZE + 16;
  const dirToExit: 1 | -1 = exit.x >= entryCx ? 1 : -1;
  const travel: TubeTravelState = {
    points: [
      { x: entryCx, y: entryCy },
      { x: entryCx, y: channelY },
      { x: exit.x, y: channelY },
      { x: exit.x, y: exit.y },
      { x: exit.x, y: exit.y - TILE_SIZE * 0.5 },
    ],
    segment: 0,
    speed: 15.5,
    exitVx: 7.2 * dirToExit,
    exitVy: -12.6,
    entryX: entryCx,
    entryY: entryCy,
  };
  player.tubeTravel = travel;
  player.tubeCooldown = 40;
  player.vx = 0;
  player.vy = 0;
  player.gsp = 0;
  player.onGround = false;
  player.state = 'roll';
  player.inLoop = false;
  soundFX.playSpinDashRelease();
  addParticle(ctx.particles, 'sparkle', entryCx, entryCy, 0, -2, '#38BDF8', 8, 22);
  addParticle(
    ctx.particles,
    'score_popup',
    entryCx,
    entryCy - 18,
    0,
    -1.1,
    '#38BDF8',
    11,
    34,
    'TRAVEL TUBE!'
  );
}

function updateTubeTravel(player: PlayerEntity, ctx: StepContext): boolean {
  const travel = player.tubeTravel;
  if (!travel) return false;

  const target = travel.points[travel.segment + 1];
  if (!target) {
    finishTubeTravel(player, ctx);
    return true;
  }
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= travel.speed) {
    player.x = target.x;
    player.y = target.y;
    travel.segment++;
    if (travel.segment >= travel.points.length - 1) {
      finishTubeTravel(player, ctx);
      return true;
    }
  } else {
    player.x += (dx / dist) * travel.speed;
    player.y += (dy / dist) * travel.speed;
  }

  // Glass pipe chemical bubbles trailing behind Sonic
  if (Math.random() < 0.5) {
    addParticle(
      ctx.particles,
      'sparkle',
      player.x + (Math.random() - 0.5) * 12,
      player.y + (Math.random() - 0.5) * 12,
      -travel.exitVx * 0.25,
      0.6,
      Math.random() < 0.5 ? '#7DD3FC' : '#38BDF8',
      5,
      16
    );
  }
  return true;
}

function finishTubeTravel(player: PlayerEntity, ctx: StepContext) {
  const travel = player.tubeTravel;
  if (!travel) return;
  const exitPoint = travel.points[travel.points.length - 1];
  player.x = exitPoint.x;
  player.y = exitPoint.y;
  player.vx = travel.exitVx;
  player.vy = travel.exitVy;
  player.gsp = travel.exitVx;
  player.facing = travel.exitVx >= 0 ? 1 : -1;
  player.onGround = false;
  player.inLoop = false;
  player.state = 'spring';
  player.tubeTravel = null;
  player.tubeCooldown = 40;
  soundFX.playSpring(true);
  addParticle(ctx.particles, 'pop', player.x, player.y, 0, 0, '#38BDF8', 22, 20);
  addParticle(
    ctx.particles,
    'score_popup',
    player.x,
    player.y - 22,
    0,
    -1.2,
    '#7DD3FC',
    12,
    40,
    'TUBE LAUNCH!'
  );
}

export function updatePlayerPhysics(
  player: PlayerEntity,
  rawInput: ControlInputState,
  leader: PlayerEntity | null,
  ctx: StepContext
) {
  const spec = CHARACTER_SPECS[player.character];

  // Riding a Chemical Plant travel tube: follow the glass pipe route & ignore
  // normal physics until the tube exit launches the player out!
  if (player.tubeTravel) {
    updateTubeTravel(player, ctx);
    if (player.animTimer % 4 < 2) {
      addParticle(
        ctx.particles,
        'sparkle',
        player.x + (Math.random() - 0.5) * 14,
        player.y + (Math.random() - 0.5) * 14,
        0,
        -0.8,
        '#0EA5E9',
        5,
        14
      );
    }
    player.animTimer += 1;
    player.animFrame = Math.floor(player.animTimer / 6) % 8;
    return;
  }
  if (player.tubeCooldown && player.tubeCooldown > 0) player.tubeCooldown--;

  // Handle Super Form Ring Drain (1 ring per second) & Golden Aura Particles
  if (player.isSuper) {
    player.superRingTimer--;
    if (player.superRingTimer <= 0) {
      player.superRingTimer = 60;
      player.rings = Math.max(0, player.rings - 1);
      if (player.rings <= 0) {
        player.isSuper = false;
        player.isHyper = false;
      }
    }
    if (player.animTimer % 4 < 1) {
      const hyperPalette = ['#4ADE80', '#60A5FA', '#FDE047', '#C084FC', '#F8FAFC', '#F87171'];
      const auraCol = player.isHyper
        ? hyperPalette[Math.floor(player.animTimer / 2) % hyperPalette.length]
        : spec.superColor;
      addParticle(
        ctx.particles,
        'sparkle',
        player.x + (Math.random() - 0.5) * 26,
        player.y + (Math.random() - 0.5) * 26,
        -player.vx * 0.2,
        -1.2,
        auraCol,
        6,
        16
      );
    }
    // Super / Hyper Tails' 4 Golden Flickies automatically attack nearby Badniks!
    if (player.character === 'tails') {
      for (const b of ctx.badniks) {
        if (b.alive && Math.hypot(player.x - b.x, player.y - b.y) < 92) {
          b.alive = false;
          player.score += 100;
          soundFX.playPop();
          addParticle(ctx.particles, 'pop', b.x, b.y, 0, 0, '#FACC15', 20, 18);
          addParticle(
            ctx.particles,
            'score_popup',
            b.x,
            b.y - 10,
            0,
            -1.2,
            '#FDE047',
            11,
            30,
            'FLICKY +100'
          );
        }
      }
    }
  }

  // Check for Super / Hyper Transformation Input (7 Emeralds + 50 Rings + Special Key)
  if (
    !player.forcedCutsceneRun &&
    !player.isSuper &&
    ctx.allEmeraldsCollected &&
    player.rings >= 50 &&
    rawInput.specialJustPressed
  ) {
    triggerSuperTransformation(player, ctx);
  }

  const speedMul = player.isHyper
    ? 1.85
    : player.isSuper
    ? 1.48
    : player.speedShoesTimer > 0
    ? 1.35
    : 1.0;
  const jumpMul = player.isHyper ? 1.22 : player.isSuper ? 1.15 : 1.0;
  // Hyper Forms have NO speed cap/limit!
  const maxTop = player.isHyper ? Number.POSITIVE_INFINITY : spec.topSpeed * speedMul;
  const acc = spec.acc * (player.isHyper ? 2.45 : player.isSuper ? 1.8 : speedMul);

  if (player.speedShoesTimer > 0) player.speedShoesTimer--;
  if (player.invincibleTimer > 0) {
    player.invincibleTimer--;
    if (player.invincibleTimer % 5 === 0) {
      addParticle(
        ctx.particles,
        'sparkle',
        player.x + (Math.random() - 0.5) * 24,
        player.y + (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 1.5,
        -0.8 - Math.random(),
        player.invincibleTimer % 10 === 0 ? '#FACC15' : '#38BDF8',
        6,
        16
      );
    }
  }
  if (player.hurtTimer > 0) player.hurtTimer--;
  if (player.loopCooldown > 0) player.loopCooldown--;
  if (player.flyBoostCooldown > 0) player.flyBoostCooldown--;

  // Lightning Shield or Super Form Magnetic Ring Pull
  if (player.shield === 'lightning' || player.isSuper) {
    const minTx = Math.max(0, Math.floor((player.x - 96) / TILE_SIZE));
    const maxTx = Math.min(ctx.level.width - 1, Math.floor((player.x + 96) / TILE_SIZE));
    const minTy = Math.max(0, Math.floor((player.y - 96) / TILE_SIZE));
    const maxTy = Math.min(ctx.level.height - 1, Math.floor((player.y + 96) / TILE_SIZE));
    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (ctx.grid[ty][tx] === TileType.RING) {
          const rx = tx * TILE_SIZE + 16;
          const ry = ty * TILE_SIZE + 16;
          if (Math.hypot(player.x - rx, player.y - ry) < 92) {
            ctx.grid[ty][tx] = TileType.EMPTY;
            ctx.scatteredRings.push({
              id: nextScatteredRingId++,
              x: rx,
              y: ry,
              vx: (player.x - rx) * 0.16,
              vy: (player.y - ry) * 0.16,
              timer: 120,
            });
          }
        }
      }
    }
  }

  // Post-Death Egg Robot Defeat Cutscene Check:
  // Once the Death Egg Robot is defeated, ALL player controls are disabled and Sonic is forced to run forward until hitting a Goal Signpost!
  const deathEggDefeated = ctx.bosses.some(
    (b) => b.bossType === 'deathegg' && !b.alive
  );
  if (deathEggDefeated && player.state !== 'victory' && player.finishedTimeMs === null) {
    player.forcedCutsceneRun = true;
  }

  let input = rawInput;
  if (player.forcedCutsceneRun && player.state !== 'victory') {
    input = {
      left: false,
      right: true,
      up: false,
      down: false,
      jumpHeld: false,
      jumpJustPressed: false,
      specialHeld: false,
      specialJustPressed: false,
    };
    player.facing = 1;
    if (player.onGround && player.gsp < 7.2) {
      player.gsp = 7.2;
    }
  } else {
    const humanPressing =
      rawInput.left ||
      rawInput.right ||
      rawInput.up ||
      rawInput.down ||
      rawInput.jumpHeld ||
      rawInput.jumpJustPressed;

    if (player.isAI && leader && !humanPressing) {
      const dx = leader.x - player.x;
      const dy = leader.y - player.y;

      if (Math.abs(dx) > 640 || Math.abs(dy) > 480) {
        player.x = leader.x - leader.facing * 36;
        player.y = leader.y - 60;
        player.vx = leader.vx;
        player.vy = 0;
        player.inLoop = false;
        player.loopCooldown = 30;
      }

      const wantRight = dx > 38;
      const wantLeft = dx < -38;
      const wantJump =
        (dy < -48 && player.onGround && Math.abs(dx) < 140) ||
        (player.onGround && Math.abs(player.vx) < 0.2 && (wantRight || wantLeft));

      input = {
        left: wantLeft,
        right: wantRight,
        up: false,
        down: leader.state === 'spindash' || leader.state === 'crouch',
        jumpHeld: wantJump || leader.state === 'jump',
        jumpJustPressed: wantJump || (leader.state === 'spindash' && Math.random() < 0.25),
        specialHeld: false,
        specialJustPressed: false,
      };
    }
  }

  if (player.state === 'victory') {
    player.vx *= 0.88;
    player.gsp *= 0.88;
    player.x += player.vx;
    player.animTimer++;
    return;
  }

  // 1. Inside Redone 360° Loop-de-Loop (Tangential Gravity, Helical Track & Slingshot Exit Boost!)
  if (player.inLoop) {
    if (input.jumpJustPressed) {
      player.inLoop = false;
      player.loopCooldown = 36;
      player.onGround = false;
      player.groundAngle = 0;
      player.vy = -spec.jumpForce * 0.85;
      player.state = 'jump';
      soundFX.playJump();
    } else {
      const sinTheta = Math.sin(player.loopAngle); // >0 ascending, <0 descending
      const holdingForward =
        (player.loopDir === 1 && input.right) ||
        (player.loopDir === -1 && input.left);
      const holdingBack =
        (player.loopDir === 1 && input.left) ||
        (player.loopDir === -1 && input.right);

      if (holdingBack) {
        player.gsp -= player.loopDir * 0.34;
      } else {
        // Drive up the ascending wall and accelerate rapidly down the second half of the loop!
        const pedalBoost = holdingForward ? 0.24 : 0.14;
        const gravPull = sinTheta > 0 ? -sinTheta * 0.14 : -sinTheta * 0.34;
        player.gsp += player.loopDir * (pedalBoost + gravPull);
        if (Math.abs(player.gsp) < 6.4) {
          player.gsp = 6.4 * player.loopDir;
        }
        if (!player.isHyper && Math.abs(player.gsp) > 12.8) {
          player.gsp = 12.8 * player.loopDir;
        }
      }

      if (Math.abs(player.gsp) < 3.0) {
        // Stalled inside loop -> fall naturally back into the loop bowl!
        player.inLoop = false;
        player.loopCooldown = 32;
        player.onGround = false;
        player.groundAngle = 0;
        player.state = 'roll';
      } else {
        const angularStep = Math.max(0.065, Math.abs(player.gsp) / player.loopRadius);
        player.loopAngle += angularStep;
        player.loopProgress = Math.min(1, player.loopAngle / (Math.PI * 2));
        const signedAngle = -player.loopAngle * player.loopDir;
        player.groundAngle = signedAngle;

        // Helical front-to-back lane shift across the 360° loop
        const helicalShiftX =
          Math.cos(player.loopProgress * Math.PI) * -10 * player.loopDir;
        player.x =
          player.loopCenterX +
          Math.sin(-signedAngle) * player.loopRadius +
          helicalShiftX;
        player.y = player.loopCenterY + Math.cos(-signedAngle) * player.loopRadius;
        player.vx = Math.cos(signedAngle) * player.gsp;
        player.vy = Math.sin(signedAngle) * player.gsp;

        if (Math.floor(player.loopAngle * 10) % 3 === 0) {
          addParticle(
            ctx.particles,
            'sparkle',
            player.x - player.vx * 0.5,
            player.y - player.vy * 0.5,
            -player.vx * 0.15,
            -player.vy * 0.15,
            player.loopProgress > 0.5 ? '#38BDF8' : '#FACC15',
            5,
            14
          );
        }

        if (player.loopAngle >= Math.PI * 2) {
          player.inLoop = false;
          player.loopCooldown = 36;
          player.loopProgress = 0;
          player.groundAngle = 0;
          player.x = player.loopCenterX + player.loopDir * 44;
          player.y = player.loopCenterY + player.loopRadius;
          // Grant slingshot exit speed boost!
          player.gsp = player.loopDir * Math.max(Math.abs(player.gsp), 9.8);
          player.vx = player.gsp;
          player.vy = 0;
          player.onGround = true;
          player.state = 'dash';
          soundFX.playSpinDashRelease();
        }
        collectNearbyTiles(player, ctx);
        checkExtraLifeFromRings(player, ctx);
        updateCamera(player, input, ctx.level, ctx.bosses);
        return;
      }
    }
  }

  // 2. Enter Redone 360° Loop-de-Loop (Smooth Entry Ramp from either direction!)
  const horizSpeed = Math.max(Math.abs(player.gsp), Math.abs(player.vx));
  if (player.loopCooldown === 0 && horizSpeed >= 3.8) {
    const ptx = Math.floor(player.x / TILE_SIZE);
    const pty = Math.floor(player.y / TILE_SIZE);
    for (let ty = Math.max(0, pty - 8); ty <= Math.min(ctx.level.height - 1, pty + 2); ty++) {
      for (let tx = Math.max(0, ptx - 6); tx <= Math.min(ctx.level.width - 1, ptx + 2); tx++) {
        if (ctx.grid[ty][tx] === TileType.LOOP_HEAD) {
          const centerX = tx * TILE_SIZE + 96;
          const centerY = ty * TILE_SIZE + 96;
          const bottomY = ty * TILE_SIZE + 192;
          const moveDir = (
            Math.abs(player.gsp) >= Math.abs(player.vx)
              ? Math.sign(player.gsp)
              : Math.sign(player.vx)
          ) as 1 | -1;
          // Trigger as the player crosses the entry gate of the loop!
          if (
            Math.abs(player.x - centerX) <= 38 &&
            Math.abs(player.y + PLAYER_HALF_H - bottomY) <= 44
          ) {
            player.inLoop = true;
            player.loopDir = (moveDir || player.facing) as 1 | -1;
            player.loopCenterX = centerX;
            player.loopCenterY = centerY - PLAYER_HALF_H;
            player.loopRadius = 74;
            player.loopAngle = 0.08;
            player.loopProgress = 0;
            player.gsp = player.loopDir * Math.max(horizSpeed, 7.2);
            player.state = 'roll';
            soundFX.playSpinDashRev(3);
            break;
          }
        }
      }
    }
  }

  // 3. Wall Climb State (Knuckles)
  if (player.state === 'climb') {
    player.vx = 0;
    player.gsp = 0;
    const climbSpd = player.isSuper ? 3.5 : 2.2;
    if (input.up) {
      player.vy = -climbSpd;
      player.animTimer++;
    } else if (input.down) {
      player.vy = climbSpd;
      player.animTimer++;
    } else {
      player.vy = 0;
    }

    player.y += player.vy;

    const checkX = player.x + player.facing * (PLAYER_HALF_W + 4);
    const wallTile = getTileAt(
      ctx.grid,
      Math.floor(checkX / TILE_SIZE),
      Math.floor(player.y / TILE_SIZE)
    );
    if (!isSolidTile(wallTile)) {
      player.y -= 10;
      player.x += player.facing * 12;
      player.vy = 0;
      player.state = 'idle';
    } else if (input.jumpJustPressed) {
      player.facing = (player.facing * -1) as 1 | -1;
      player.vx = player.facing * 5.2;
      player.vy = -7.2;
      player.state = 'jump';
      soundFX.playJump();
    }

    collectNearbyTiles(player, ctx);
    updateCamera(player, input, ctx.level, ctx.bosses);
    return;
  }

  // 4. Ground Movement & Spin Dash / Peel-Out
  if (player.onGround) {
    player.flyStamina = 360; // Full 6 seconds of responsive flight for Tails!
    player.flyBoostCooldown = 0;
    player.shieldActionUsed = false;
    player.hyperFlashUsed = false;

    if (player.state === 'spindash') {
      player.gsp = 0;
      player.vx = 0;
      player.spindashRev = Math.max(0, player.spindashRev - 0.015);
      if (input.jumpJustPressed) {
        // Hyper Forms have no Spin Dash rev cap!
        player.spindashRev = player.isHyper
          ? player.spindashRev + 2.5
          : Math.min(8, player.spindashRev + 2);
        soundFX.playSpinDashRev(Math.min(12, player.spindashRev));
        addParticle(
          ctx.particles,
          'smoke',
          player.x - player.facing * 14,
          player.y + 10,
          -player.facing * (2 + Math.random() * 2),
          -Math.random() * 1.2,
          '#E2E8F0',
          7,
          18
        );
      }
      if (!input.down) {
        const launchSpeed = (8.4 + player.spindashRev * 0.62) * speedMul;
        player.gsp = launchSpeed * player.facing;
        player.vx = player.gsp;
        player.state = 'roll';
        soundFX.playSpinDashRelease();
      }
    } else if (player.state === 'peelout') {
      player.gsp = 0;
      player.vx = 0;
      player.peeloutCharge = player.isHyper
        ? player.peeloutCharge + 1.5
        : Math.min(36, player.peeloutCharge + 1);
      if (!input.up) {
        if (player.peeloutCharge >= 18) {
          const extraHyperBoost = player.isHyper ? (player.peeloutCharge - 18) * 0.45 : 0;
          player.gsp = (11.2 + extraHyperBoost) * speedMul * player.facing;
          player.vx = player.gsp;
          player.state = 'dash';
          soundFX.playSpinDashRelease();
        } else {
          player.state = 'idle';
        }
        player.peeloutCharge = 0;
      }
    } else {
      const sinA = Math.sin(player.groundAngle);
      if (player.state === 'roll') {
        const sameSign = (player.gsp >= 0 && sinA >= 0) || (player.gsp < 0 && sinA < 0);
        const rollFactor = sameSign ? 0.3125 : 0.095;
        player.gsp += sinA * rollFactor;
      } else {
        player.gsp += sinA * 0.14;
      }

      if (player.state === 'roll') {
        if (input.left && player.gsp > 0) player.gsp -= spec.rollDec;
        else if (input.right && player.gsp < 0) player.gsp += spec.rollDec;

        if (Math.abs(player.gsp) > spec.rollFrc) {
          player.gsp -= Math.sign(player.gsp) * spec.rollFrc;
        } else {
          player.gsp = 0;
          player.state = 'idle';
        }
      } else {
        if (input.left && !input.down) {
          if (player.gsp > 0) {
            player.gsp -= spec.dec;
            if (player.gsp <= 0) player.gsp = -0.5;
          } else if (player.gsp > -maxTop) {
            player.gsp = Math.max(-maxTop, player.gsp - acc);
          }
          player.facing = -1;
        } else if (input.right && !input.down) {
          if (player.gsp < 0) {
            player.gsp += spec.dec;
            if (player.gsp >= 0) player.gsp = 0.5;
          } else if (player.gsp < maxTop) {
            player.gsp = Math.min(maxTop, player.gsp + acc);
          }
          player.facing = 1;
        } else {
          if (Math.abs(player.gsp) > spec.frc) {
            player.gsp -= Math.sign(player.gsp) * spec.frc;
          } else {
            player.gsp = 0;
          }
        }

        if (Math.abs(player.gsp) < 0.35) {
          if (input.down) {
            player.gsp = 0;
            player.state = 'crouch';
            if (input.jumpJustPressed) {
              player.state = 'spindash';
              player.spindashRev = 2;
              soundFX.playSpinDashRev(2);
            }
          } else if (input.up) {
            player.gsp = 0;
            player.state = 'lookup';
            if (player.character === 'sonic' && input.jumpJustPressed) {
              player.state = 'peelout';
              player.peeloutCharge = 2;
              soundFX.playSpinDashRev(4);
            }
          } else {
            player.state = 'idle';
          }
        } else {
          if (input.down && Math.abs(player.gsp) > 1.2) {
            player.state = 'roll';
            soundFX.playSpinDashRev(1);
          } else if (Math.abs(player.gsp) >= 8.2) {
            player.state = 'dash';
          } else if (Math.abs(player.gsp) >= 4.5) {
            player.state = 'run';
          } else {
            player.state = 'walk';
          }
        }
      }

      if (
        input.jumpJustPressed &&
        player.state !== 'spindash' &&
        player.state !== 'peelout' &&
        player.state !== 'crouch' &&
        !(player.character === 'sonic' && player.state === 'lookup')
      ) {
        const sinG = Math.sin(player.groundAngle);
        const cosG = Math.cos(player.groundAngle);
        const jf = spec.jumpForce * jumpMul;
        player.vx = player.gsp * cosG - jf * sinG;
        player.vy = player.gsp * sinG - jf * cosG;
        player.onGround = false;
        player.groundAngle = 0;
        player.state = 'jump';
        player.dropdashTimer = 0;
        soundFX.playJump();
      } else {
        player.vx = player.gsp * Math.cos(player.groundAngle);
        player.vy = player.gsp * Math.sin(player.groundAngle);
      }
    }
  } else {
    // 5. Airborne Physics & Character / Shield Abilities
    // Hyper Forms have no airborne speed cap!
    const airSpeedCap = player.isHyper
      ? Number.POSITIVE_INFINITY
      : player.character === 'tails' && (player.state === 'fly' || player.state === 'fly_tired')
      ? player.isSuper
        ? 9.5
        : 7.0
      : maxTop;
    const airAcc = spec.airAcc * (player.isHyper ? 2.2 : 1.0);

    if (player.state !== 'ray_glide') {
      if (input.left) {
        player.vx = Math.max(-airSpeedCap, player.vx - airAcc);
        player.facing = -1;
      } else if (input.right) {
        player.vx = Math.min(airSpeedCap, player.vx + airAcc);
        player.facing = 1;
      }
    }

    if (!input.jumpHeld && player.vy < -4.0 && player.state === 'jump') {
      player.vy = -4.0;
    }

    if (player.character === 'sonic') {
      if (
        player.isHyper &&
        !player.hyperFlashUsed &&
        input.jumpJustPressed &&
        player.state === 'jump'
      ) {
        // HYPER SONIC'S HYPER FLASH DOUBLE-JUMP ATTACK (Adds uncapped speed!)
        player.hyperFlashUsed = true;
        if (input.left) {
          player.vx = -Math.max(12.2, Math.abs(player.vx) + 4.2);
          player.facing = -1;
        } else if (input.right) {
          player.vx = Math.max(12.2, Math.abs(player.vx) + 4.2);
          player.facing = 1;
        } else {
          player.vx = Math.max(11.2, Math.abs(player.vx) + 3.8) * player.facing;
        }
        player.vy = input.up ? -8.8 : input.down ? 8.5 : -5.2;
        soundFX.playSuperTransform();
        addParticle(
          ctx.particles,
          'score_popup',
          player.x,
          player.y - 20,
          0,
          -1.2,
          '#38BDF8',
          13,
          35,
          'HYPER FLASH!'
        );
        const flashColors = ['#4ADE80', '#60A5FA', '#FDE047', '#C084FC', '#F8FAFC', '#F87171'];
        for (let i = 0; i < 16; i++) {
          const ang = (i / 16) * Math.PI * 2;
          addParticle(
            ctx.particles,
            'sparkle',
            player.x,
            player.y,
            Math.cos(ang) * 7.5,
            Math.sin(ang) * 7.5,
            flashColors[i % flashColors.length],
            8,
            22
          );
        }
        // Destroy all on-screen Badniks within 260px!
        for (const b of ctx.badniks) {
          if (b.alive && Math.hypot(player.x - b.x, player.y - b.y) < 260) {
            b.alive = false;
            player.score += 100;
            soundFX.playPop();
            addParticle(ctx.particles, 'pop', b.x, b.y, 0, 0, '#F8FAFC', 22, 18);
          }
        }
      } else if (
        input.jumpJustPressed &&
        player.state === 'jump' &&
        !player.shieldActionUsed &&
        (player.shield === 'flame' || player.shield === 'lightning' || player.shield === 'bubble')
      ) {
        player.shieldActionUsed = true;
        if (player.shield === 'flame') {
          player.vx = 10.2 * player.facing;
          player.vy = 0;
          soundFX.playSpinDashRelease();
          for (let f = 0; f < 6; f++) {
            addParticle(
              ctx.particles,
              'smoke',
              player.x - player.facing * 10,
              player.y + (Math.random() - 0.5) * 14,
              -player.facing * (2 + Math.random() * 3),
              (Math.random() - 0.5) * 2,
              '#F97316',
              7,
              18
            );
          }
        } else if (player.shield === 'lightning') {
          player.vy = -7.8;
          soundFX.playJump();
          for (let s = 0; s < 6; s++) {
            addParticle(
              ctx.particles,
              'sparkle',
              player.x + (Math.random() - 0.5) * 20,
              player.y + 8,
              (Math.random() - 0.5) * 4,
              1 + Math.random() * 2,
              '#38BDF8',
              6,
              18
            );
          }
        } else if (player.shield === 'bubble') {
          player.vx *= 0.35;
          player.vy = 10.5;
          soundFX.playSpring(false);
        }
      } else if (player.state === 'jump' || player.state === 'dropdash_ready') {
        if (input.jumpHeld && player.vy > -2.5) {
          player.dropdashTimer++;
          if (player.dropdashTimer === 14) {
            player.state = 'dropdash_ready';
            soundFX.playSpinDashRev(5);
          }
        } else if (!input.jumpHeld && player.state === 'dropdash_ready') {
          player.state = 'jump';
          player.dropdashTimer = 0;
        }
      }
    } else if (player.character === 'tails') {
      // Restored Responsive Tails Propeller Flight!
      // Press Jump in mid-air to start flying; press or hold Jump while flying to climb smoothly!
      if (
        player.state !== 'fly' &&
        player.state !== 'fly_tired' &&
        player.state !== 'hurt' &&
        input.jumpJustPressed &&
        player.flyStamina > 0
      ) {
        player.state = 'fly';
        player.vy = -3.4;
        soundFX.playJump();
      } else if (player.state === 'fly') {
        if (!player.isSuper) {
          player.flyStamina--;
        }
        if (player.flyStamina <= 0) {
          player.state = 'fly_tired';
        } else if (input.jumpJustPressed) {
          player.vy = -3.8;
          soundFX.playJump();
        } else if (input.jumpHeld && player.vy > -3.3) {
          player.vy = Math.max(-3.3, player.vy - 0.35);
        }
      }
    } else if (player.character === 'knuckles') {
      if (player.state === 'jump' && input.jumpJustPressed) {
        player.state = 'glide';
        player.vy = Math.max(0, player.vy * 0.3);
        player.vx = player.facing * Math.max(4.5, Math.abs(player.vx));
      } else if (player.state === 'glide') {
        if (!input.jumpHeld) {
          player.state = 'jump';
          player.vx *= 0.5;
        } else if (player.isHyper) {
          // Hyper Knuckles has no glide speed cap!
          player.vx += player.facing * 0.34;
        } else {
          const targetGlideSpeed = (player.isSuper ? 11.5 : 8.4) * player.facing;
          player.vx += (targetGlideSpeed - player.vx) * 0.08;
        }
      }
    } else if (player.character === 'mighty') {
      // Mighty the Armadillo (Sonic Mania): Press Jump in mid-air for Hammer Drop!
      if (
        player.state !== 'hammer_drop' &&
        player.state !== 'hurt' &&
        input.jumpJustPressed
      ) {
        player.state = 'hammer_drop';
        player.vx *= 0.25;
        player.vy = 13.5;
        soundFX.playSpinDashRelease();
        for (let i = 0; i < 6; i++) {
          addParticle(
            ctx.particles,
            'sparkle',
            player.x + (Math.random() - 0.5) * 18,
            player.y - 6,
            (Math.random() - 0.5) * 3,
            -2 - Math.random() * 2,
            '#EF4444',
            6,
            16
          );
        }
      }
    } else if (player.character === 'ray') {
      // Ray the Flying Squirrel (Sonic Mania): Air Glide, Dive & Momentum Swoop!
      if (
        player.state !== 'ray_glide' &&
        player.state !== 'hurt' &&
        input.jumpJustPressed
      ) {
        player.state = 'ray_glide';
        player.raySwoopPitch = 2.0;
        player.vy = Math.min(player.vy, 1.2);
        player.vx = player.facing * Math.max(5.2, Math.abs(player.vx));
        soundFX.playJump();
      } else if (player.state === 'ray_glide') {
        const holdingForward =
          (player.facing === 1 && input.right) ||
          (player.facing === -1 && input.left) ||
          input.down;
        const holdingBack =
          (player.facing === 1 && input.left) ||
          (player.facing === -1 && input.right) ||
          input.up;

        if (holdingForward) {
          // Dive forward to build swoop momentum!
          player.raySwoopPitch = Math.min(10, (player.raySwoopPitch || 0) + 0.35);
          player.vy = Math.min(8.4, player.vy + 0.32);
          const diveTargetSpeed = (player.isSuper ? 12.2 : 10.4) * player.facing;
          player.vx += (diveTargetSpeed - player.vx) * 0.1;
        } else if (holdingBack) {
          // Pull back to Swoop Upward into the sky using stored dive energy!
          const storedEnergy = player.raySwoopPitch || 0;
          const swoopLift = Math.min(
            8.2,
            3.8 + storedEnergy * 0.48 + Math.abs(player.vx) * 0.25
          );
          if (player.vy > -swoopLift) {
            player.vy = Math.max(-swoopLift, player.vy - 0.85);
          }
          player.raySwoopPitch = Math.max(0, storedEnergy - 0.14);
          player.vx = player.facing * Math.max(4.6, Math.abs(player.vx) * 0.96);
          if (Math.random() < 0.35) {
            addParticle(
              ctx.particles,
              'sparkle',
              player.x - player.facing * 12,
              player.y + 6,
              -player.facing * 2,
              1.5,
              '#FACC15',
              5,
              14
            );
          }
        } else {
          // Neutral cape glide
          player.vy = Math.min(1.6, player.vy + 0.08);
          const cruiseSpeed = (player.isSuper ? 9.6 : 6.8) * player.facing;
          player.vx += (cruiseSpeed - player.vx) * 0.06;
        }
      }
    }

    // Apply Gravity
    if (player.state === 'fly') {
      player.vy = Math.min(3.8, player.vy + 0.11);
    } else if (player.state === 'fly_tired') {
      player.vy = Math.min(4.2, player.vy + 0.2);
    } else if (player.state === 'glide') {
      player.vy = Math.min(1.15, player.vy + 0.09);
    } else if (player.state === 'ray_glide') {
      player.vy = Math.min(8.6, player.vy + 0.06);
    } else if (player.state === 'hammer_drop') {
      player.vy = Math.min(15.5, player.vy + 0.55);
    } else {
      player.vy = Math.min(14, player.vy + spec.gravity);
    }
  }

  // 6. Integrate Velocity & Resolve Collisions (Substepped for uncapped Hyper speeds!)
  const maxStepVel = Math.max(Math.abs(player.vx), Math.abs(player.vy));
  const substeps = Math.max(1, Math.min(10, Math.ceil(maxStepVel / 11)));
  for (let s = 0; s < substeps; s++) {
    const prevSubX = player.x;
    player.x += player.vx / substeps;
    player.y += player.vy / substeps;

    if (player.onGround) {
      // Snap vertical height to slopes FIRST when grounded so horizontal sensors never clip slope seams!
      resolveVerticalCollision(player, ctx);
      resolveHorizontalCollision(player, ctx);
    } else {
      resolveHorizontalCollision(player, ctx);
      resolveVerticalCollision(player, ctx);
    }

    // Check 3-Block-Tall One-Way Doors: once the player goes through a door column, all 3 blocks become SOLID!
    updateOneWayDoorsForPlayer(player, prevSubX, ctx);

    // 7. Collect Tiles & Monitors along high-speed trajectory
    collectNearbyTiles(player, ctx);

    // 8. Badnik & Boss Interactions
    interactWithBadniks(player, ctx);
    interactWithBosses(player, ctx);
  }

  // If forcedCutsceneRun is active and Sonic hits a step/obstacle, auto-hop so he always reaches the Goal Signpost!
  if (
    player.forcedCutsceneRun &&
    player.finishedTimeMs === null &&
    player.onGround &&
    Math.abs(player.vx) < 0.5
  ) {
    player.vy = -7.5;
    player.onGround = false;
    player.state = 'jump';
  }
  interactWithProjectiles(player, ctx);
  interactWithHazards(player, ctx);

  // 9. Scattered Ring Pickup
  if (player.hurtTimer < 65) {
    for (let i = ctx.scatteredRings.length - 1; i >= 0; i--) {
      const sr = ctx.scatteredRings[i];
      if (Math.hypot(player.x - sr.x, player.y - sr.y) < 22) {
        player.rings++;
        soundFX.playRing();
        addParticle(ctx.particles, 'sparkle', sr.x, sr.y, 0, -1, '#FACC15', 5, 16);
        ctx.scatteredRings.splice(i, 1);
      }
    }
  }

  if (player.y > ctx.level.height * TILE_SIZE + 32) {
    killPlayerInVoid(player, ctx);
  }

  // Check if player reached 100 / 200 / 300+ rings for an extra life!
  checkExtraLifeFromRings(player, ctx);

  player.animTimer += 1 + Math.abs(player.gsp) * 0.25;
  player.animFrame = Math.floor(player.animTimer / 6) % 8;

  updateCamera(player, input, ctx.level, ctx.bosses);
}

function resolveHorizontalCollision(player: PlayerEntity, ctx: StepContext) {
  if (player.x < PLAYER_HALF_W) {
    player.x = PLAYER_HALF_W;
    player.vx = 0;
    player.gsp = 0;
  }
  const maxLevelX = ctx.level.width * TILE_SIZE - PLAYER_HALF_W;
  if (player.x > maxLevelX) {
    player.x = maxLevelX;
    player.vx = 0;
    player.gsp = 0;
  }

  // Enforce Locked Boss Arena Boundaries while an engaged Boss is alive!
  for (const boss of ctx.bosses) {
    if (boss.alive && boss.engaged) {
      if (player.x < boss.arenaLeft + PLAYER_HALF_W) {
        player.x = boss.arenaLeft + PLAYER_HALF_W;
        player.vx = Math.max(0, player.vx);
        player.gsp = Math.max(0, player.gsp);
      } else if (player.x > boss.arenaRight - PLAYER_HALF_W) {
        player.x = boss.arenaRight - PLAYER_HALF_W;
        player.vx = Math.min(0, player.vx);
        player.gsp = Math.min(0, player.gsp);
      }
    }
  }

  if (Math.abs(player.vx) < 0.001) return;

  const dir = player.vx >= 0 ? 1 : -1;
  const sensorX = player.x + dir * PLAYER_HALF_W;
  const tx = Math.floor(sensorX / TILE_SIZE);
  const sampleYs = player.onGround ? [player.y - 4] : [player.y - 6, player.y + 4];

  for (const sy of sampleYs) {
    const ty = Math.floor(sy / TILE_SIZE);
    const hitTile = getTileAt(ctx.grid, tx, ty);

    // Never treat a block directly underneath a slope tile or a walkable step-up as a wall!
    const tileAboveHit = getTileAt(ctx.grid, tx, ty - 1);
    if (isSlopeTile(tileAboveHit)) continue;
    if (
      hitTile !== TileType.BREAKABLE_ROCK &&
      ty * TILE_SIZE >= player.y + PLAYER_HALF_H - 18 &&
      !isSolidTile(tileAboveHit)
    ) {
      continue;
    }

    if (hitTile === TileType.BREAKABLE_ROCK) {
      const canSmash =
        player.isSuper ||
        player.character === 'knuckles' ||
        player.state === 'roll' ||
        player.state === 'spindash' ||
        (player.state === 'dash' && Math.abs(player.vx) >= 4.5);
      if (canSmash) {
        ctx.grid[ty][tx] = TileType.EMPTY;
        soundFX.playPop();
        for (let d = 0; d < 6; d++) {
          addParticle(
            ctx.particles,
            'brick_debris',
            tx * TILE_SIZE + 16,
            ty * TILE_SIZE + 16,
            (Math.random() - 0.5) * 6,
            -2 - Math.random() * 4,
            d % 2 === 0 ? '#B45309' : '#78350F',
            6,
            28
          );
        }
        continue;
      }
    }

    if (hitTile === TileType.LAVA) {
      if (player.shield !== 'flame' && !player.isSuper && player.invincibleTimer === 0) {
        soundFX.playLavaBurn();
        hurtPlayer(player, ctx);
        return;
      }
    }

    // Boiling Toxic Blue Chemical Pools: any shield protects the player!
    if (hitTile === TileType.GIMMICK_ACID_POOL && !isChemicallyShielded(player)) {
      soundFX.playLavaBurn();
      addParticle(ctx.particles, 'smoke', player.x, player.y, 0, -2, '#38BDF8', 6, 18);
      hurtPlayer(player, ctx);
      return;
    }

    // One-Way Door (unlocked): allows passing forward (dir > 0), blocks going backwards (dir < 0)!
    if (hitTile === TileType.ONE_WAY_DOOR && dir < 0) {
      player.x = (tx + 1) * TILE_SIZE + PLAYER_HALF_W;
      player.vx = 0;
      player.gsp = 0;
      return;
    }

    if (
      hitTile === TileType.GROUND_TOP ||
      hitTile === TileType.GROUND_DEEP ||
      hitTile === TileType.BREAKABLE_ROCK ||
      hitTile === TileType.SPIKES_UP ||
      hitTile === TileType.SPIKES_DOWN ||
      hitTile === TileType.LAVA ||
      hitTile === TileType.GIMMICK_ACID_POOL ||
      hitTile === TileType.GIMMICK_STEAM_VENT ||
      hitTile === TileType.GIMMICK_CRUSHER ||
      hitTile === TileType.GIMMICK_LAVA_SHOOTER_LEFT ||
      hitTile === TileType.GIMMICK_LAVA_SHOOTER_RIGHT ||
      hitTile === TileType.GIMMICK_CONVEYOR_RIGHT ||
      hitTile === TileType.GIMMICK_CONVEYOR_LEFT ||
      hitTile === TileType.ONE_WAY_DOOR_LOCKED ||
      isCustomBlockTile(hitTile)
    ) {
      if (
        player.character === 'knuckles' &&
        player.state === 'glide' &&
        !isSpikeHazardTile(hitTile)
      ) {
        player.state = 'climb';
        player.vx = 0;
        player.vy = 0;
        player.x =
          dir > 0 ? tx * TILE_SIZE - PLAYER_HALF_W : (tx + 1) * TILE_SIZE + PLAYER_HALF_W;
        return;
      }

      if (dir > 0) {
        player.x = tx * TILE_SIZE - PLAYER_HALF_W;
      } else {
        player.x = (tx + 1) * TILE_SIZE + PLAYER_HALF_W;
      }
      player.vx = 0;
      player.gsp = 0;
      return;
    }
  }
}

function resolveVerticalCollision(player: PlayerEntity, ctx: StepContext) {
  if (player.vy < 0) {
    const topY = player.y - PLAYER_HALF_H;
    const tx = Math.floor(player.x / TILE_SIZE);
    const ty = Math.floor(topY / TILE_SIZE);
    const ceilTile = getTileAt(ctx.grid, tx, ty);
    if (
      ceilTile === TileType.GROUND_TOP ||
      ceilTile === TileType.GROUND_DEEP ||
      ceilTile === TileType.BREAKABLE_ROCK ||
      ceilTile === TileType.SPIKES_UP ||
      ceilTile === TileType.SPIKES_DOWN ||
      ceilTile === TileType.GIMMICK_ACID_POOL ||
      ceilTile === TileType.GIMMICK_STEAM_VENT ||
      ceilTile === TileType.GIMMICK_CRUSHER ||
      ceilTile === TileType.GIMMICK_LAVA_SHOOTER_LEFT ||
      ceilTile === TileType.GIMMICK_LAVA_SHOOTER_RIGHT ||
      ceilTile === TileType.ONE_WAY_DOOR_LOCKED ||
      isCustomBlockTile(ceilTile)
    ) {
      player.y = (ty + 1) * TILE_SIZE + PLAYER_HALF_H;
      player.vy = 0;
      if (ceilTile === TileType.GIMMICK_CRUSHER) {
        hurtPlayer(player, ctx);
      }
      // Mystic Caverns Ceiling Spikes: jumping into the stalactite bed hurts!
      if (ceilTile === TileType.SPIKES_DOWN) {
        addParticle(
          ctx.particles,
          'score_popup',
          player.x,
          player.y - 20,
          0,
          -1.2,
          '#EF4444',
          11,
          30,
          'CEILING SPIKES!'
        );
        hurtPlayer(player, ctx, true);
      }
      if (!player.onGround) return;
    }
    // Only skip ground surface check if the player is actually airborne and moving upward!
    // When player.onGround is true (e.g. running uphill on a slope where vy < 0),
    // we MUST continue and check the ground surface so the slope ends properly!
    if (!player.onGround) {
      return;
    }
  }

  const footY = player.y + PLAYER_HALF_H;
  const txCenter = Math.floor(player.x / TILE_SIZE);
  const tyFoot = Math.floor(footY / TILE_SIZE);

  const candidateRows = player.onGround ? [tyFoot - 1, tyFoot, tyFoot + 1] : [tyFoot, tyFoot + 1];
  let bestSurface: { surfaceY: number; angle: number; tile: TileType } | null = null;

  for (const r of candidateRows) {
    const t = getTileAt(ctx.grid, txCenter, r);
    if (t === TileType.EMPTY) continue;
    if (t === TileType.PLATFORM && player.vy < 0) continue;

    const info = getTileSurfaceInfo(t, txCenter, r, player.x, ctx.grid);
    if (!info) continue;

    const minTol = player.onGround ? 20 : 8;
    const maxTol = player.onGround ? 22 : Math.max(14, player.vy + 8);
    if (footY >= info.surfaceY - minTol && footY <= info.surfaceY + maxTol) {
      if (!bestSurface || Math.abs(footY - info.surfaceY) < Math.abs(footY - bestSurface.surfaceY)) {
        bestSurface = { ...info, tile: t };
      }
    }
  }

  if (bestSurface) {
    const wasAirborne = !player.onGround;
    player.y = bestSurface.surfaceY - PLAYER_HALF_H;
    player.groundAngle = bestSurface.angle;
    player.onGround = true;

    if (bestSurface.tile === TileType.SPIKES_UP) {
      hurtPlayer(player, ctx, true);
      return;
    }

    // Mystic Caverns bed spikes / Chemical Plant floor hazards land as spikes too
    if (bestSurface.tile === TileType.SPIKES_DOWN) {
      hurtPlayer(player, ctx, true);
      return;
    }

    // Chemical Plant Steam Vents: periodic pressure burst launches players skyward!
    if (bestSurface.tile === TileType.GIMMICK_STEAM_VENT) {
      const ventCycle = Math.floor(ctx.elapsedMs / 16.67) % 150;
      if (ventCycle < 55) {
        player.vy = -12.8;
        player.gsp = player.vx;
        player.onGround = false;
        player.inLoop = false;
        player.state = 'spring';
        soundFX.playSpring(true);
        addParticle(ctx.particles, 'pop', player.x, player.y + 10, 0, 0, '#BAE6FD', 20, 18);
        for (let s = 0; s < 5; s++) {
          addParticle(
            ctx.particles,
            'smoke',
            player.x + (Math.random() - 0.5) * 20,
            player.y + 14,
            (Math.random() - 0.5) * 2.4,
            -3.4 - Math.random() * 2,
            '#E0F2FE',
            7,
            22
          );
        }
        return;
      }
    }

    // Boiling Toxic Blue Chemical Pools (any shield blocks the damage)
    if (bestSurface.tile === TileType.GIMMICK_ACID_POOL) {
      if (isChemicallyShielded(player)) {
        if (Math.abs(player.vx) > 0.5 && Math.random() < 0.35) {
          addParticle(
            ctx.particles,
            'sparkle',
            player.x + (Math.random() - 0.5) * 16,
            player.y + 14,
            -player.vx * 0.25,
            -1.5 - Math.random(),
            '#38BDF8',
            5,
            16
          );
        }
      } else {
        soundFX.playLavaBurn();
        for (let e = 0; e < 5; e++) {
          addParticle(
            ctx.particles,
            'smoke',
            player.x + (Math.random() - 0.5) * 18,
            player.y + 12,
            (Math.random() - 0.5) * 3,
            -2 - Math.random() * 2,
            '#0EA5E9',
            6,
            20
          );
        }
        hurtPlayer(player, ctx);
        return;
      }
    }

    // Neo Starlight Conveyor Belt Gimmick pushes grounded player!
    if (bestSurface.tile === TileType.GIMMICK_CONVEYOR_RIGHT) {
      player.x += 2.1;
      player.gsp += 0.14;
    } else if (bestSurface.tile === TileType.GIMMICK_CONVEYOR_LEFT) {
      player.x -= 2.1;
      player.gsp -= 0.14;
    }

    if (
      bestSurface.tile === TileType.LAVA ||
      bestSurface.tile === TileType.GIMMICK_LAVA_GEYSER
    ) {
      if (player.shield === 'flame' || player.isSuper || player.invincibleTimer > 0) {
        if (Math.abs(player.vx) > 0.5 && Math.random() < 0.35) {
          addParticle(
            ctx.particles,
            'sparkle',
            player.x + (Math.random() - 0.5) * 16,
            player.y + 14,
            -player.vx * 0.25,
            -1.5 - Math.random(),
            '#F97316',
            5,
            16
          );
        }
      } else {
        soundFX.playLavaBurn();
        for (let e = 0; e < 5; e++) {
          addParticle(
            ctx.particles,
            'smoke',
            player.x + (Math.random() - 0.5) * 18,
            player.y + 12,
            (Math.random() - 0.5) * 3,
            -2 - Math.random() * 2,
            '#EF4444',
            6,
            20
          );
        }
        hurtPlayer(player, ctx);
        return;
      }
    }

    if (wasAirborne) {
      if (player.shield === 'bubble' && player.shieldActionUsed && player.vy >= 7.0) {
        player.vy = -10.4;
        player.onGround = false;
        player.shieldActionUsed = false;
        player.state = 'jump';
        soundFX.playSpring(false);
        return;
      }

      if (player.character === 'sonic' && player.state === 'dropdash_ready') {
        const speedMul = player.isHyper
          ? 1.85
          : player.isSuper
          ? 1.45
          : player.speedShoesTimer > 0
          ? 1.3
          : 1.0;
        const baseDrop = player.isHyper
          ? Math.max(12.5 * speedMul, Math.abs(player.vx) + 4.5)
          : 10.6 * speedMul;
        player.gsp = baseDrop * player.facing;
        player.vx = player.gsp;
        player.state = 'roll';
        player.dropdashTimer = 0;
        soundFX.playSpinDashRelease();
        for (let s = 0; s < 5; s++) {
          addParticle(
            ctx.particles,
            'smoke',
            player.x - player.facing * 12,
            player.y + 12,
            -player.facing * (1.5 + Math.random() * 3),
            -Math.random() * 1.5,
            '#38BDF8',
            7,
            20
          );
        }
      } else if (player.character === 'mighty' && player.state === 'hammer_drop') {
        // Mighty the Armadillo (Sonic Mania): Seismic Hammer Drop Impact!
        // Shatters nearby Breakable Blocks underneath & around Mighty, pops monitors & stuns Badniks!
        soundFX.playLavaBurn();
        let shatteredBelow = false;
        for (let r = Math.max(0, tyFoot - 2); r <= Math.min(ctx.level.height - 1, tyFoot + 3); r++) {
          for (
            let c = Math.max(0, txCenter - 2);
            c <= Math.min(ctx.level.width - 1, txCenter + 2);
            c++
          ) {
            if (ctx.grid[r][c] === TileType.BREAKABLE_ROCK) {
              ctx.grid[r][c] = TileType.EMPTY;
              if (r >= tyFoot && Math.abs(c - txCenter) <= 1) {
                shatteredBelow = true;
              }
              for (let d = 0; d < 4; d++) {
                addParticle(
                  ctx.particles,
                  'brick_debris',
                  c * TILE_SIZE + 16,
                  r * TILE_SIZE + 16,
                  (Math.random() - 0.5) * 7,
                  -2.5 - Math.random() * 4,
                  d % 2 === 0 ? '#DC2626' : '#FACC15',
                  6,
                  26
                );
              }
            }
          }
        }
        // Destroy Badniks within seismic shockwave radius (115px)
        for (const b of ctx.badniks) {
          if (b.alive && Math.hypot(b.x - player.x, b.y - player.y) < 115) {
            b.alive = false;
            player.score += 100;
            soundFX.playPop();
            addParticle(ctx.particles, 'pop', b.x, b.y, 0, 0, '#F8FAFC', 20, 18);
          }
        }
        addParticle(
          ctx.particles,
          'score_popup',
          player.x,
          player.y - 20,
          0,
          -1.2,
          '#EF4444',
          12,
          30,
          'HAMMER DROP!'
        );
        if (shatteredBelow) {
          // Keep plummeting through the shattered breakable floor!
          player.onGround = false;
          player.vy = 5.5;
          player.state = 'roll';
          return;
        }
        player.gsp = player.vx;
        player.state = Math.abs(player.gsp) > 0.5 ? 'run' : 'idle';
      } else {
        const sinSlope = Math.sin(bestSurface.angle);
        // Preserve full horizontal speed on landing; only add downhill boost when landing with slope direction!
        if (Math.abs(bestSurface.angle) > 0.2 && player.vy > 0 && player.vx * sinSlope >= 0) {
          player.gsp = player.vx + player.vy * sinSlope * 0.5;
        } else {
          player.gsp = player.vx;
        }
        if (player.state !== 'roll' && player.state !== 'spindash') {
          player.state = Math.abs(player.gsp) > 0.5 ? 'run' : 'idle';
        }
      }
      player.vy = 0;
    } else {
      // Keep velocity vectors aligned with current groundAngle while grounded
      player.vx = player.gsp * Math.cos(player.groundAngle);
      player.vy = player.gsp * Math.sin(player.groundAngle);
    }
  } else {
    // Check Dynamic Moving Platforms & Swinging Pendulum Platforms!
    const globalTick = Math.round(ctx.elapsedMs / 16.67);
    let landedOnDynamicPlatform = false;
    if (player.vy >= -1.5) {
      const minC = Math.max(0, txCenter - 4);
      const maxC = Math.min(ctx.level.width - 1, txCenter + 4);
      const minR = Math.max(0, tyFoot - 4);
      const maxR = Math.min(ctx.level.height - 1, tyFoot + 3);

      for (let r = minR; r <= maxR && !landedOnDynamicPlatform; r++) {
        for (let c = minC; c <= maxC; c++) {
          const t = ctx.grid[r][c] as TileType;
          if (
            t === TileType.MOVING_PLATFORM ||
            t === TileType.SWINGING_PLATFORM ||
            t === TileType.MOVING_PLATFORM_VERT
          ) {
            const plat = getDynamicPlatformState(c, r, t, globalTick);
            const horizDist = Math.abs(player.x - plat.x);
            if (
              horizDist <= plat.width / 2 + 8 &&
              footY >= plat.y - 12 &&
              footY <= plat.y + Math.max(16, player.vy + 10)
            ) {
              const wasAirborne = !player.onGround;
              player.y = plat.y - PLAYER_HALF_H;
              // Carry the player along with the moving/swinging platform's frame delta!
              const substeps = Math.max(
                1,
                Math.min(10, Math.ceil(Math.max(Math.abs(player.vx), Math.abs(player.vy)) / 11))
              );
              player.x += (plat.x - plat.prevX) / substeps;
              player.y += (plat.y - plat.prevY) / substeps;
              player.vy = 0;
              player.groundAngle = 0;
              player.onGround = true;
              if (wasAirborne) {
                player.gsp = player.vx;
                if (player.state !== 'roll' && player.state !== 'spindash') {
                  player.state = Math.abs(player.gsp) > 0.5 ? 'run' : 'idle';
                }
              } else {
                player.vx = player.gsp;
              }
              landedOnDynamicPlatform = true;
              break;
            }
          }
        }
      }
    }

    if (!landedOnDynamicPlatform) {
      player.onGround = false;
      player.groundAngle = 0;
    }
  }
}

function updateOneWayDoorsForPlayer(
  player: PlayerEntity,
  prevX: number,
  ctx: StepContext
) {
  if (player.isAI) return;

  const minCol = Math.max(0, Math.floor((player.x - PLAYER_HALF_W - 40) / TILE_SIZE));
  const maxCol = Math.min(
    ctx.level.width - 1,
    Math.floor((player.x + PLAYER_HALF_W + 40) / TILE_SIZE)
  );
  const minRow = Math.max(0, Math.floor((player.y - 96) / TILE_SIZE));
  const maxRow = Math.min(
    ctx.level.height - 1,
    Math.floor((player.y + 96) / TILE_SIZE)
  );

  for (let col = minCol; col <= maxCol; col++) {
    // Find any ONE_WAY_DOOR tiles in this column near the player's vertical position
    const doorRows: number[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      if (ctx.grid[row][col] === TileType.ONE_WAY_DOOR) {
        doorRows.push(row);
      }
    }
    if (doorRows.length === 0) continue;

    // Ensure every One-Way Door is 3 blocks tall (expand upward if a single tile was placed)
    if (doorRows.length < 3) {
      const bottomRow = Math.max(...doorRows);
      for (let d = 1; d <= 2; d++) {
        const targetR = bottomRow - d;
        if (targetR >= 0 && ctx.grid[targetR][col] === TileType.EMPTY) {
          ctx.grid[targetR][col] = TileType.ONE_WAY_DOOR;
          doorRows.push(targetR);
        }
      }
    }

    const topDoorY = Math.min(...doorRows) * TILE_SIZE;
    const bottomDoorY = (Math.max(...doorRows) + 1) * TILE_SIZE;
    const doorRightEdge = (col + 1) * TILE_SIZE;

    // Check if the player's vertical body is within the 3-block-tall doorway span
    const verticallyInDoor =
      player.y + PLAYER_HALF_H > topDoorY - 8 &&
      player.y - PLAYER_HALF_H < bottomDoorY + 8;

    // Once the player goes through the door and clears its right edge, all 3 blocks lock SOLID!
    if (
      verticallyInDoor &&
      player.x - PLAYER_HALF_W >= doorRightEdge &&
      prevX - PLAYER_HALF_W < doorRightEdge + 6
    ) {
      for (let r = 0; r < ctx.level.height; r++) {
        if (ctx.grid[r][col] === TileType.ONE_WAY_DOOR) {
          ctx.grid[r][col] = TileType.ONE_WAY_DOOR_LOCKED;
        }
      }
      // Bring AI partner through the doorway so they aren't locked behind the solid door
      for (const p of ctx.players) {
        if (p.isAI && p.x < doorRightEdge + PLAYER_HALF_W) {
          p.x = doorRightEdge + PLAYER_HALF_W + 4;
          p.y = player.y;
        }
      }
      soundFX.playCheckpoint();
      addParticle(
        ctx.particles,
        'score_popup',
        col * TILE_SIZE + 16,
        topDoorY - 8,
        0,
        -1.0,
        '#FACC15',
        11,
        36,
        'DOOR LOCKED!'
      );
    }
  }
}

function collectNearbyTiles(player: PlayerEntity, ctx: StepContext) {
  const minTx = Math.max(0, Math.floor((player.x - 16) / TILE_SIZE));
  const maxTx = Math.min(ctx.level.width - 1, Math.floor((player.x + 16) / TILE_SIZE));
  const minTy = Math.max(0, Math.floor((player.y - 24) / TILE_SIZE));
  const maxTy = Math.min(ctx.level.height - 1, Math.floor((player.y + 24) / TILE_SIZE));

  const isCurledAttack =
    player.isSuper ||
    player.state === 'jump' ||
    player.state === 'roll' ||
    player.state === 'spindash' ||
    player.state === 'glide' ||
    player.state === 'hammer_drop' ||
    player.state === 'ray_glide' ||
    player.state === 'dropdash_ready';

  for (let ty = minTy; ty <= maxTy; ty++) {
    for (let tx = minTx; tx <= maxTx; tx++) {
      const tile = ctx.grid[ty][tx] as TileType;
      const tileCenterX = tx * TILE_SIZE + 16;
      const tileCenterY = ty * TILE_SIZE + 16;

      if (tile === TileType.RING) {
        ctx.grid[ty][tx] = TileType.EMPTY;
        player.rings++;
        player.score += 10;
        soundFX.playRing();
        addParticle(ctx.particles, 'sparkle', tileCenterX, tileCenterY, 0, -0.8, '#FACC15', 5, 18);
        continue;
      }

      if (tile === TileType.GIANT_RING) {
        ctx.grid[ty][tx] = TileType.EMPTY;
        soundFX.playCheckpoint();
        if (!player.isAI) {
          player.enteredGiantRing = true;
          player.collectedGiantRingKey = `${tx},${ty}`;
        }
        player.rings += 10;
        addParticle(
          ctx.particles,
          'score_popup',
          tileCenterX,
          tileCenterY - 12,
          0,
          -1.2,
          '#FACC15',
          14,
          45,
          'SPECIAL STAGE WARP!'
        );
        continue;
      }

      if (isMonitorTile(tile)) {
        if (isCurledAttack || player.vy > 0.5) {
          ctx.grid[ty][tx] = TileType.EMPTY;
          if (!player.onGround && player.vy > 0) player.vy = -5.2;
          soundFX.playPop();
          addParticle(ctx.particles, 'pop', tileCenterX, tileCenterY, 0, 0, '#F8FAFC', 18, 16);

          switch (tile) {
            case TileType.MONITOR_RING: {
              player.rings += 10;
              player.score += 100;
              soundFX.playRing();
              addParticle(
                ctx.particles,
                'score_popup',
                tileCenterX,
                tileCenterY - 8,
                0,
                -1.2,
                '#FACC15',
                12,
                35,
                '+10 RINGS'
              );
              break;
            }
            case TileType.MONITOR_SPEED: {
              player.speedShoesTimer = 900;
              player.score += 100;
              addParticle(
                ctx.particles,
                'score_popup',
                tileCenterX,
                tileCenterY - 8,
                0,
                -1.2,
                '#EF4444',
                12,
                35,
                'SPEED SHOES'
              );
              break;
            }
            case TileType.MONITOR_SHIELD: {
              player.shield = 'blue';
              player.score += 100;
              addParticle(
                ctx.particles,
                'score_popup',
                tileCenterX,
                tileCenterY - 8,
                0,
                -1.2,
                '#60A5FA',
                12,
                35,
                'BLUE SHIELD'
              );
              break;
            }
            case TileType.MONITOR_FLAME: {
              player.shield = 'flame';
              player.score += 100;
              addParticle(
                ctx.particles,
                'score_popup',
                tileCenterX,
                tileCenterY - 8,
                0,
                -1.2,
                '#F97316',
                12,
                35,
                'FLAME SHIELD'
              );
              break;
            }
            case TileType.MONITOR_LIGHTNING: {
              player.shield = 'lightning';
              player.score += 100;
              addParticle(
                ctx.particles,
                'score_popup',
                tileCenterX,
                tileCenterY - 8,
                0,
                -1.2,
                '#38BDF8',
                12,
                35,
                'LIGHTNING SHIELD'
              );
              break;
            }
            case TileType.MONITOR_BUBBLE: {
              player.shield = 'bubble';
              player.score += 100;
              addParticle(
                ctx.particles,
                'score_popup',
                tileCenterX,
                tileCenterY - 8,
                0,
                -1.2,
                '#34D399',
                12,
                35,
                'BUBBLE SHIELD'
              );
              break;
            }
            case TileType.MONITOR_INVINCIBILITY: {
              player.invincibleTimer = 900;
              player.score += 200;
              soundFX.playCheckpoint();
              addParticle(
                ctx.particles,
                'score_popup',
                tileCenterX,
                tileCenterY - 8,
                0,
                -1.2,
                '#FACC15',
                12,
                40,
                'INVINCIBLE!'
              );
              break;
            }
            case TileType.MONITOR_EGGMAN: {
              addParticle(
                ctx.particles,
                'score_popup',
                tileCenterX,
                tileCenterY - 8,
                0,
                -1.2,
                '#EF4444',
                12,
                40,
                'EGGMAN TRAP!'
              );
              hurtPlayer(player, ctx);
              break;
            }
            case TileType.MONITOR_SWAP: {
              const partner = ctx.players.find((p) => p.id !== player.id);
              if (partner) {
                const txSwap = player.x;
                const tySwap = player.y;
                player.x = partner.x;
                player.y = partner.y;
                partner.x = txSwap;
                partner.y = tySwap;
              } else {
                player.x = Math.min(
                  (ctx.level.width - 4) * TILE_SIZE,
                  player.x + 192 * player.facing
                );
              }
              soundFX.playCheckpoint();
              addParticle(
                ctx.particles,
                'score_popup',
                player.x,
                player.y - 16,
                0,
                -1.2,
                '#A855F7',
                12,
                40,
                'TELEPORT SWAP!'
              );
              break;
            }
            case TileType.MONITOR_SUPER: {
              // Super "S" Monitor: Grants +50 Rings and transforms into Super Form immediately!
              player.rings += 50;
              player.score += 500;
              triggerSuperTransformation(player, ctx);
              break;
            }
            case TileType.MONITOR_1UP: {
              // 1-UP Extra Life Monitor: Grants +1 Extra Life!
              player.lives = (player.lives || 3) + 1;
              player.livesDeltaThisFrame = (player.livesDeltaThisFrame || 0) + 1;
              player.score += 500;
              soundFX.playCheckpoint();
              addParticle(
                ctx.particles,
                'score_popup',
                tileCenterX,
                tileCenterY - 12,
                0,
                -1.3,
                '#22C55E',
                14,
                55,
                '1-UP! EXTRA LIFE!'
              );
              break;
            }
            default:
              break;
          }
        }
        continue;
      }

      switch (tile) {
        case TileType.SPRING_YELLOW: {
          player.vy = -10.5;
          player.onGround = false;
          player.inLoop = false;
          player.state = 'spring';
          soundFX.playSpring(false);
          break;
        }
        case TileType.SPRING_RED: {
          player.vy = -14.2;
          player.onGround = false;
          player.inLoop = false;
          player.state = 'spring';
          soundFX.playSpring(true);
          break;
        }
        case TileType.SPRING_RIGHT: {
          player.gsp = 11.5;
          player.vx = 11.5;
          player.facing = 1;
          soundFX.playSpring(true);
          break;
        }
        case TileType.SPRING_LEFT: {
          player.gsp = -11.5;
          player.vx = -11.5;
          player.facing = -1;
          soundFX.playSpring(true);
          break;
        }
        case TileType.BOOSTER_RIGHT: {
          player.gsp = Math.max(player.gsp, 11.8);
          player.vx = Math.max(player.vx, 11.8);
          player.facing = 1;
          soundFX.playSpinDashRelease();
          break;
        }
        case TileType.BOOSTER_LEFT: {
          player.gsp = Math.min(player.gsp, -11.8);
          player.vx = Math.min(player.vx, -11.8);
          player.facing = -1;
          soundFX.playSpinDashRelease();
          break;
        }
        case TileType.GIMMICK_BUMPER: {
          // Emerald Mountains 360° Pinball Star Bumper!
          const dx = player.x - tileCenterX;
          const dy = player.y - tileCenterY;
          const dist = Math.max(1, Math.hypot(dx, dy));
          player.vx = (dx / dist) * 8.6;
          player.vy = (dy / dist) * 8.6 - 1.5;
          player.gsp = player.vx;
          player.onGround = false;
          player.inLoop = false;
          player.state = 'spring';
          player.score += 10;
          soundFX.playSpring(true);
          addParticle(
            ctx.particles,
            'sparkle',
            tileCenterX,
            tileCenterY,
            (dx / dist) * 3,
            (dy / dist) * 3,
            '#FACC15',
            8,
            18
          );
          break;
        }
        case TileType.GIMMICK_DASH_RING: {
          // Emerald Mountains Mid-Air Rainbow Dash Ring!
          const dashDir = player.vx < -0.5 ? -1 : 1;
          player.facing = dashDir;
          player.vx = 13.4 * dashDir;
          player.gsp = player.vx;
          player.vy = -8.4;
          player.onGround = false;
          player.inLoop = false;
          player.state = 'spring';
          player.score += 50;
          soundFX.playSpinDashRelease();
          addParticle(
            ctx.particles,
            'sparkle',
            tileCenterX,
            tileCenterY,
            dashDir * 4,
            -2,
            '#38BDF8',
            9,
            20
          );
          break;
        }
        case TileType.GIMMICK_CRUSHER: {
          // Marble Zone Stomping Crusher Pillar bottom spikes hazard
          const crusherExtend = Math.sin(ctx.elapsedMs * 0.005 + tx * 1.3);
          if (crusherExtend > 0.2 && player.y > tileCenterY) {
            hurtPlayer(player, ctx);
          }
          break;
        }
        case TileType.GIMMICK_UPDRAFT: {
          // Hill Top Peaks Alpine Wind Updraft Fan!
          player.vy = Math.max(-7.6, player.vy - 1.15);
          player.onGround = false;
          player.state = 'spring';
          if (Math.random() < 0.35) {
            addParticle(
              ctx.particles,
              'sparkle',
              tileCenterX + (Math.random() - 0.5) * 22,
              tileCenterY + 8,
              0,
              -3.8,
              '#38BDF8',
              5,
              18
            );
          }
          break;
        }
        case TileType.GIMMICK_TUBE_ENTRY: {
          // Chemical Plant Travel Tube: fall into the intake & ride the pipe network!
          if (!player.tubeTravel && (player.tubeCooldown || 0) <= 0) {
            startTubeTravel(player, ctx, tx, ty);
          }
          break;
        }
        case TileType.GIMMICK_STEAM_VENT: {
          // Chemical Plant Steam Vent: riders above the grate get blasted upward!
          const ventTick = Math.floor(ctx.elapsedMs / 16.67) % 150;
          if (ventTick < 55 && player.y < tileCenterY) {
            player.vy = Math.max(-9.4, player.vy - 1.6);
            player.onGround = false;
            if (Math.random() < 0.3) {
              addParticle(
                ctx.particles,
                'sparkle',
                tileCenterX + (Math.random() - 0.5) * 20,
                tileCenterY - 12,
                0,
                -3.4,
                '#E0F2FE',
                5,
                18
              );
            }
          }
          break;
        }
        case TileType.SPIKES_DOWN: {
          // Ceiling Spikes: brush against the stalactite bed and take a hit
          if (
            Math.abs(player.x - tileCenterX) < 20 &&
            Math.abs(player.y - tileCenterY) < 22
          ) {
            hurtPlayer(player, ctx, true);
          }
          break;
        }
        case TileType.GIMMICK_ACID_POOL: {
          // Boiling Toxic Blue Chemical Pool: only shielded players swim safely
          if (
            Math.abs(player.x - tileCenterX) < 22 &&
            Math.abs(player.y - tileCenterY) < 22 &&
            !isChemicallyShielded(player)
          ) {
            soundFX.playLavaBurn();
            hurtPlayer(player, ctx);
          }
          break;
        }
        case TileType.GIMMICK_STALACTITE: {
          // Hanging rock stalactite brush = spike hit (before it even drops!)
          if (
            Math.abs(player.x - tileCenterX) < 20 &&
            Math.abs(player.y - tileCenterY) < 22
          ) {
            hurtPlayer(player, ctx, true);
          }
          break;
        }
        case TileType.GIMMICK_TELEPORT_ORB: {
          // Hill Top Peaks High-Altitude Cloud Cannon!
          player.vx = 12.2 * player.facing;
          player.gsp = player.vx;
          player.vy = -13.8;
          player.onGround = false;
          player.inLoop = false;
          player.state = 'roll';
          soundFX.playSpinDashRelease();
          addParticle(
            ctx.particles,
            'pop',
            tileCenterX,
            tileCenterY,
            0,
            0,
            '#60A5FA',
            20,
            18
          );
          break;
        }
        case TileType.CHECKPOINT: {
          if (Math.abs(player.checkpointX - tileCenterX) > 16) {
            player.checkpointX = tileCenterX;
            player.checkpointY = tileCenterY - 8;
            soundFX.playCheckpoint();
            addParticle(
              ctx.particles,
              'score_popup',
              tileCenterX,
              tileCenterY - 16,
              0,
              -1.1,
              '#38BDF8',
              12,
              40,
              'CHECKPOINT'
            );
          }
          break;
        }
        case TileType.GOAL_POST: {
          // Cannot clear the level while any Boss is still alive!
          const anyBossAlive = ctx.bosses.some((b) => b.alive);
          if (!anyBossAlive && player.finishedTimeMs === null && !player.isAI) {
            player.forcedCutsceneRun = false;
            player.finishedTimeMs = ctx.elapsedMs;
            player.state = 'victory';
            player.score += 1000 + player.rings * 100;
            soundFX.playGoalPost();
            addParticle(
              ctx.particles,
              'score_popup',
              tileCenterX,
              tileCenterY - 24,
              0,
              -1.0,
              '#FACC15',
              14,
              60,
              'ACT CLEAR!'
            );
          }
          break;
        }
        default:
          break;
      }
    }
  }

  // Also check if an Updraft Fan (GIMMICK_UPDRAFT) is 1 to 3 tiles below the player!
  const ptx = Math.floor(player.x / TILE_SIZE);
  const pty = Math.floor(player.y / TILE_SIZE);
  for (let checkR = pty + 1; checkR <= Math.min(ctx.level.height - 1, pty + 3); checkR++) {
    if (getTileAt(ctx.grid, ptx, checkR) === TileType.GIMMICK_UPDRAFT) {
      player.vy = Math.max(-6.8, player.vy - 0.65);
      player.onGround = false;
      if (Math.random() < 0.25) {
        addParticle(
          ctx.particles,
          'sparkle',
          player.x + (Math.random() - 0.5) * 20,
          player.y + 16,
          0,
          -3.2,
          '#7DD3FC',
          4,
          16
        );
      }
      break;
    }
  }
}

function interactWithBadniks(player: PlayerEntity, ctx: StepContext) {
  const isInvulnerableAttack = player.isSuper || player.invincibleTimer > 0;
  const isSpinAttacking =
    isInvulnerableAttack ||
    player.state === 'jump' ||
    player.state === 'roll' ||
    player.state === 'spindash' ||
    player.state === 'glide' ||
    player.state === 'hammer_drop' ||
    player.state === 'ray_glide' ||
    player.state === 'dropdash_ready';

  for (const b of ctx.badniks) {
    if (!b.alive) continue;
    const dist = Math.hypot(player.x - b.x, player.y - b.y);
    if (dist < 24) {
      // Spiked Caterkiller & Spike Orbinaut damage the player like spikes when jumped on!
      const isSpikedBadnik =
        b.type === TileType.BADNIK_CATERKILLER || b.type === TileType.BADNIK_ORBINAUT;
      const isJumpingOn =
        !player.onGround ||
        player.state === 'jump' ||
        player.state === 'dropdash_ready' ||
        player.y < b.y - 4;

      if (
        isSpikedBadnik &&
        !isInvulnerableAttack &&
        (b.type === TileType.BADNIK_ORBINAUT || isJumpingOn)
      ) {
        addParticle(
          ctx.particles,
          'score_popup',
          b.x,
          b.y - 16,
          0,
          -1.2,
          '#EF4444',
          11,
          30,
          'SPIKED!'
        );
        hurtPlayer(player, ctx);
        continue;
      }

      const stompingFromAbove = !player.onGround && player.vy > 0 && player.y < b.y - 8;
      if (isSpinAttacking || stompingFromAbove) {
        b.alive = false;
        player.score += 100;
        if (!player.onGround && player.vy > 0) {
          player.vy = -6.4;
        }
        soundFX.playPop();
        addParticle(ctx.particles, 'pop', b.x, b.y, 0, 0, '#F8FAFC', 20, 18);
        addParticle(
          ctx.particles,
          'score_popup',
          b.x,
          b.y - 10,
          0,
          -1.2,
          '#FACC15',
          11,
          32,
          '100'
        );
      } else {
        hurtPlayer(player, ctx);
      }
    }
  }
}

// Applies a hit to one of the new non-projectile mecha bosses, handles player
// rebound, spark particles, defeat explosion & score popups.
function damageMechBoss(
  boss: ActiveBoss,
  player: PlayerEntity,
  ctx: StepContext,
  hitX: number,
  hitY: number,
  label: string
) {
  if (boss.invulnTimer > 0) return;
  const hitDamage = player.isHyper ? 2 : 1;
  boss.hp = Math.max(0, boss.hp - hitDamage);
  boss.invulnTimer = 34;
  soundFX.playBossHit();

  // Rebound the player up & away from the mech chassis
  player.vy = player.y < boss.y ? -7.0 : -5.2;
  player.vx = (player.x < boss.x ? -1 : 1) * 5.6;
  player.gsp = player.vx;
  player.onGround = false;

  addParticle(ctx.particles, 'pop', hitX, hitY, 0, 0, '#F97316', 26, 20);
  addParticle(
    ctx.particles,
    'score_popup',
    hitX,
    hitY - 26,
    0,
    -1.2,
    player.isHyper ? '#38BDF8' : '#22C55E',
    12,
    34,
    player.isHyper ? `${label} 2X!` : label
  );

  if (boss.hp <= 0) {
    boss.alive = false;
    boss.engaged = false;
    boss.vortexActive = false;
    boss.mechVulnerable = false;
    boss.overheatFrames = 0;
    boss.floodLevel = 0;
    boss.ceilingBurrow = false;
    player.score += 5000;
    soundFX.playGoalPost();
    // Clear out all mech-made hazards (shockwaves, debris, steam) on defeat
    for (let i = ctx.hazards.length - 1; i >= 0; i--) {
      if (ctx.hazards[i].kind !== 'stalactite') ctx.hazards.splice(i, 1);
    }
    for (let k = 0; k < 22; k++) {
      addParticle(
        ctx.particles,
        'pop',
        boss.x + (Math.random() - 0.5) * 130,
        boss.y + (Math.random() - 0.5) * 110,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        k % 2 === 0 ? '#FACC15' : '#38BDF8',
        28,
        38
      );
    }
    addParticle(
      ctx.particles,
      'score_popup',
      boss.x,
      boss.y - 32,
      0,
      -1.2,
      '#FACC15',
      14,
      70,
      boss.bossType === 'chemical'
        ? 'SLIME-CRUSHER MECH DESTROYED +5000!'
        : 'EGG DRILL-CRUSHER DESTROYED +5000!'
    );
  }
}

function interactWithBosses(player: PlayerEntity, ctx: StepContext) {
  const isAttacking =
    player.isSuper ||
    player.state === 'jump' ||
    player.state === 'roll' ||
    player.state === 'spindash' ||
    player.state === 'glide' ||
    player.state === 'fly' ||
    player.state === 'dropdash_ready' ||
    player.invincibleTimer > 0;

  for (const boss of ctx.bosses) {
    if (!boss.alive) continue;

    // Engage Boss Arena Lock when a human player enters the arena!
    if (
      !boss.engaged &&
      !player.isAI &&
      player.x >= boss.arenaLeft &&
      player.x <= boss.arenaRight &&
      Math.abs(player.y - boss.startY) < 280
    ) {
      boss.engaged = true;
      addParticle(
        ctx.particles,
        'score_popup',
        boss.startX,
        boss.startY - 56,
        0,
        -0.8,
        '#EF4444',
        14,
        55,
        boss.bossType === 'silversonic'
          ? 'SILVER SONIC ACTIVATED!'
          : boss.bossType === 'deathegg'
          ? 'FINAL BOSS: DEATH EGG ROBOT!'
          : 'BOSS ARENA LOCKED!'
      );
    }

    // 1. Check collision with Boss Under-Attachment / Spike / Claw Hazards!
    if (boss.bossType === 'silversonic') {
      // Silver Sonic Sawblade Spindash phase (cycle 120..179): Spiked sawblade ball damages on contact unless Super/Invincible!
      const cycle = boss.attackTimer % 240;
      const isSawbladeBall = cycle >= 120 && cycle < 180;
      if (
        isSawbladeBall &&
        !player.isSuper &&
        player.invincibleTimer === 0 &&
        Math.hypot(player.x - boss.x, player.y - boss.y) < 26
      ) {
        addParticle(
          ctx.particles,
          'score_popup',
          boss.x,
          boss.y - 20,
          0,
          -1.2,
          '#EF4444',
          11,
          30,
          'SPIKED!'
        );
        hurtPlayer(player, ctx);
        continue;
      }
    } else if (boss.bossType === 'deathegg') {
      // SONIC 2 DEATH EGG ROBOT (2.4X BIGGER & 24 HP):
      const scale = 2.4;
      const baseOriginY = boss.y - 34;

      // 1) Completely off-screen during 'offscreen_targeting' (unreachable until descent)
      const phase = boss.deatheggPhase || 'walk_forward';
      if (phase === 'offscreen_targeting' || boss.y < boss.startY - 340) {
        continue;
      }

      // 2) Crushing descent onto the Targeting Reticle (2.4x bigger impact zone!)
      if (phase === 'descend_land') {
        if (
          Math.abs(player.x - boss.x) < 30 * scale &&
          Math.abs(player.y - (baseOriginY + 12 * scale)) < 34 * scale
        ) {
          if (!player.isSuper && player.invincibleTimer === 0) {
            addParticle(
              ctx.particles,
              'score_popup',
              boss.x,
              boss.y,
              0,
              -1.2,
              '#EF4444',
              11,
              32,
              'CRUSHED BY LANDING!'
            );
            hurtPlayer(player, ctx);
          }
        }
        continue;
      }

      // 3) On-Screen Multi-Part Hitboxes (Scaled 2.4x):
      // Everything around the front chest is a deadly hazard (Spiked Hands/Arms, Head Dome, Lower Body/Legs, Rear Jetpack)!
      const swing = boss.ballSwingAngle;
      const isPrepWindow =
        phase === 'stop_pause' ||
        phase === 'step_back_prep' ||
        phase === 'launch_up';
      const armsLaunched = boss.armsLaunched || 0;

      // Calculate attached Spiked Hand positions based on current phase (scaled 2.4x)
      const attachedHands: Array<{ x: number; y: number }> = [];
      if (isPrepWindow) {
        // During stop & step-back prep before upward launch, the robot lowers/pulls back its arms,
        // creating a narrow window above the hands to reach the front chest!
        attachedHands.push(
          {
            x: boss.x + boss.facing * (10 * scale),
            y: baseOriginY + 19 * scale,
          },
          {
            x: boss.x + boss.facing * (6 * scale),
            y: baseOriginY + 22 * scale,
          }
        );
      } else if (phase === 'fire_arms') {
        if (armsLaunched === 0) {
          attachedHands.push(
            {
              x: boss.x + boss.facing * (32 * scale),
              y: baseOriginY - 4 * scale,
            },
            {
              x: boss.x + boss.facing * (26 * scale),
              y: baseOriginY + 10 * scale,
            }
          );
        } else if (armsLaunched === 1) {
          // First hand fired as projectile; second hand still cocked at lower arm
          attachedHands.push({
            x: boss.x + boss.facing * (26 * scale),
            y: baseOriginY + 10 * scale,
          });
        }
        // When armsLaunched === 2, both spiked hands are flying across the arena as projectiles!
      } else {
        // Walking / Bomb deployment: Enormous spiked hands swing directly in front of the chest!
        attachedHands.push(
          {
            x: boss.x + boss.facing * ((30 + Math.sin(swing) * 7) * scale),
            y: baseOriginY + (-3 + Math.cos(swing) * 6) * scale,
          },
          {
            x: boss.x + boss.facing * ((22 - Math.sin(swing) * 5) * scale),
            y: baseOriginY + (9 - Math.cos(swing) * 5) * scale,
          }
        );
      }

      if (!player.isSuper && player.invincibleTimer === 0) {
        // A. Check Attached Spiked Hands (Jumping too low or running into guarding hands -> fatal!)
        let hitHazard = false;
        for (const hand of attachedHands) {
          if (Math.hypot(player.x - hand.x, player.y - hand.y) < 15 * scale) {
            addParticle(
              ctx.particles,
              'score_popup',
              hand.x,
              hand.y - 24,
              0,
              -1.2,
              '#EF4444',
              11,
              32,
              'SPIKED HAND!'
            );
            hurtPlayer(player, ctx);
            hitHazard = true;
            break;
          }
        }
        if (hitHazard) continue;

        // B. Check Top Head Dome (Cannot simply jump on top of the Death Egg Robot!)
        const headX = boss.x;
        const headY = baseOriginY - 34 * scale;
        if (
          Math.hypot(player.x - headX, player.y - headY) < 18 * scale ||
          (player.y < baseOriginY - 22 * scale &&
            Math.abs(player.x - boss.x) < 20 * scale)
        ) {
          addParticle(
            ctx.particles,
            'score_popup',
            boss.x,
            headY - 28,
            0,
            -1.2,
            '#EF4444',
            11,
            32,
            'HEAD HAZARD! HIT CHEST!'
          );
          hurtPlayer(player, ctx);
          continue;
        }

        // C. Check Lower Body & Heavy Stomping Legs (Jumping too low or running into legs -> fatal!)
        const legsX = boss.x;
        const legsY = baseOriginY + 24 * scale;
        if (Math.hypot(player.x - legsX, player.y - legsY) < 20 * scale) {
          addParticle(
            ctx.particles,
            'score_popup',
            boss.x,
            legsY - 18,
            0,
            -1.2,
            '#EF4444',
            11,
            32,
            'LEGS HAZARD!'
          );
          hurtPlayer(player, ctx);
          continue;
        }

        // D. Check Rear Jetpack & Bomb Bay (Back of the machine is hazardous; must attack the front chest!)
        const backX = boss.x - boss.facing * (18 * scale);
        const backY = baseOriginY - 4 * scale;
        if (
          (player.x - boss.x) * boss.facing < 0 &&
          Math.hypot(player.x - backX, player.y - backY) < 23 * scale
        ) {
          addParticle(
            ctx.particles,
            'score_popup',
            backX,
            backY - 24,
            0,
            -1.2,
            '#EF4444',
            11,
            32,
            'ARMORED BACK! HIT CHEST!'
          );
          hurtPlayer(player, ctx);
          continue;
        }
      }

      // 4) Check THE CHEST WEAK POINT (Front upper-middle chest of the 2.4x Death Egg Robot)
      const chestX = boss.x + boss.facing * (19 * scale);
      const chestY = baseOriginY - 6 * scale;
      if (Math.hypot(player.x - chestX, player.y - chestY) < 21 * scale) {
        if (isAttacking) {
          if (boss.invulnTimer === 0) {
            const hitDamage = player.isHyper ? 2 : 1;
            boss.hp = Math.max(0, boss.hp - hitDamage);
            boss.invulnTimer = 32;
            soundFX.playBossHit();

            // Rebound Sonic forward away from the chest so he clears the lower spiked hands safely!
            player.vx = boss.facing * 7.8;
            player.gsp = player.vx;
            player.vy = -5.8;

            addParticle(ctx.particles, 'pop', chestX, chestY, 0, 0, '#F97316', 28, 20);
            addParticle(
              ctx.particles,
              'score_popup',
              chestX,
              chestY - 28,
              0,
              -1.2,
              player.isHyper ? '#38BDF8' : '#22C55E',
              12,
              32,
              player.isHyper ? 'HYPER CHEST HIT 2X!' : 'CHEST WEAK POINT HIT!'
            );

            if (boss.hp <= 0) {
              boss.alive = false;
              boss.engaged = false;
              boss.targetReticleActive = false;
              ctx.projectiles.length = 0;
              player.score += 5000;
              // Force all players into the post-Death Egg Robot cutscene run toward the Goal Signpost!
              for (const p of ctx.players) {
                p.forcedCutsceneRun = true;
                p.facing = 1;
                p.vx = 6.2;
                p.gsp = 6.2;
              }
              soundFX.playGoalPost();
              for (let k = 0; k < 24; k++) {
                addParticle(
                  ctx.particles,
                  'pop',
                  boss.x + (Math.random() - 0.5) * 140,
                  chestY + (Math.random() - 0.5) * 140,
                  (Math.random() - 0.5) * 6,
                  (Math.random() - 0.5) * 6,
                  '#FACC15',
                  32,
                  38
                );
              }
              addParticle(
                ctx.particles,
                'score_popup',
                boss.x,
                chestY - 40,
                0,
                -1.2,
                '#FACC15',
                14,
                65,
                'DEATH EGG ROBOT DESTROYED +5000!'
              );
              addParticle(
                ctx.particles,
                'score_popup',
                player.x,
                player.y - 34,
                0,
                -0.9,
                '#38BDF8',
                13,
                85,
                'CUTSCENE: ESCAPING TO GOAL SIGN!'
              );
            }
          }
        } else {
          hurtPlayer(player, ctx);
        }
      }
      continue;
    } else if (boss.bossType === 'chemical') {
      // =====================================================================
      // CHEMICAL PLANT ACT 2 BOSS: HYDRAULIC SLIME-CRUSHER & SIPHON MECH
      // Non-projectile mech. Its armored hull deflects attacks at all times
      // EXCEPT during the 120-frame overheat venting window when the cooling
      // dome pops open and the cockpit core is exposed!
      // =====================================================================
      const floorY = boss.mechFloorY ?? boss.startY + 96;

      // 1) Chemical Flood: players caught under the bubbling surface are hurt
      //    unless they are shielded → climb the high catwalks!
      const flood = boss.floodLevel || 0;
      if (flood > 0.02) {
        const surfaceY = floorY - flood * TILE_SIZE * 3;
        const inArena =
          player.x >= boss.arenaLeft - 20 && player.x <= boss.arenaRight + 20;
        if (
          inArena &&
          player.y + PLAYER_HALF_H > surfaceY &&
          !isChemicallyShielded(player)
        ) {
          soundFX.playLavaBurn();
          addParticle(ctx.particles, 'smoke', player.x, player.y + 10, 0, -2, '#38BDF8', 7, 20);
          hurtPlayer(player, ctx);
          continue;
        }
      }

      // 2) Siphon Vortex intake turbine rotor: spiked fan blades hurt on contact
      if (
        boss.vortexActive &&
        !player.isSuper &&
        player.invincibleTimer === 0 &&
        Math.hypot(player.x - boss.x, player.y - (boss.startY + 26)) < 20
      ) {
        addParticle(
          ctx.particles,
          'score_popup',
          boss.x,
          boss.y + 6,
          0,
          -1.2,
          '#EF4444',
          11,
          30,
          'SIPHON BLADES!'
        );
        hurtPlayer(player, ctx, true);
        continue;
      }

      // 3) Hydraulic piston feet are always hazardous from the sides
      if (!player.isSuper && player.invincibleTimer === 0) {
        let stomped = false;
        for (const side of [-18, 18]) {
          const footX = boss.x + side;
          const footY = floorY - 16;
          if (Math.hypot(player.x - footX, player.y - footY) < 22) {
            addParticle(
              ctx.particles,
              'score_popup',
              footX,
              footY - 24,
              0,
              -1.2,
              '#EF4444',
              11,
              30,
              'PISTON STOMP!'
            );
            hurtPlayer(player, ctx);
            stomped = true;
            break;
          }
        }
        if (stomped) continue;
      }

      // 4) Cooling dome weak point (open only while overheated for 120 frames)
      const domeX = boss.x;
      const domeY = boss.y - 28;
      if (Math.hypot(player.x - domeX, player.y - domeY) < 32) {
        if (isAttacking) {
          if (boss.mechVulnerable) {
            damageMechBoss(boss, player, ctx, domeX, domeY, 'COOLING DOME WEAK POINT!');
          } else {
            // Armored dome deflects the attack — wait for the overheat venting!
            player.vx = (player.x < boss.x ? -1 : 1) * 7.4;
            player.gsp = player.vx;
            player.vy = -6.0;
            player.onGround = false;
            soundFX.playSpring(false);
            addParticle(
              ctx.particles,
              'score_popup',
              domeX,
              domeY - 26,
              0,
              -1.1,
              '#94A3B8',
              11,
              34,
              'ARMORED! WAIT FOR OVERHEAT!'
            );
          }
        } else {
          hurtPlayer(player, ctx);
        }
        continue;
      }

      // 5) Armored lower hull & vat body
      if (Math.hypot(player.x - boss.x, player.y - boss.y) < 36) {
        if (isAttacking) {
          player.vx = -boss.facing * 6.6;
          player.gsp = player.vx;
          player.vy = -5.4;
          soundFX.playSpring(false);
          addParticle(
            ctx.particles,
            'score_popup',
            boss.x,
            boss.y - 24,
            0,
            -1.1,
            '#94A3B8',
            11,
            32,
            'HULL DEFLECT!'
          );
        } else {
          hurtPlayer(player, ctx);
        }
        continue;
      }
      continue;
    } else if (boss.bossType === 'mystic') {
      // =====================================================================
      // MYSTIC CAVERNS ACT 2 BOSS: EGG DRILL-CRUSHER
      // Non-projectile mech. The rotating conical drill bit deflects head-on
      // attacks — the cockpit core only opens during the 115-frame
      // wall-crash stun after it buries itself into a reinforced cavern wall!
      // =====================================================================
      const phase = boss.mechPhase || 'drill_rev';
      const isBurrowing =
        phase === 'ceiling_burrow' || boss.ceilingBurrow || boss.y < boss.startY - 70;
      if (isBurrowing) continue; // Safely out of reach while inside the ceiling

      const isCharging = phase === 'drill_charge';
      const stunned = phase === 'wall_crash_stun' && (boss.stunFrames || 0) > 0;

      // 1) Rotating conical drill bit: hurts on contact & deflects head-on attacks
      const drillTipX = boss.x + boss.facing * 36;
      const drillTipY = boss.y + 8;
      if (
        Math.hypot(player.x - drillTipX, player.y - drillTipY) < 26 &&
        !player.isSuper &&
        player.invincibleTimer === 0
      ) {
        if (isAttacking) {
          // Head-on attacks are deflected by the spinning drill!
          player.vx = -boss.facing * 9.2;
          player.gsp = player.vx;
          player.vy = -6.4;
          player.onGround = false;
          soundFX.playSpring(false);
          addParticle(
            ctx.particles,
            'score_popup',
            drillTipX,
            drillTipY - 26,
            0,
            -1.2,
            '#22D3EE',
            12,
            34,
            'DRILL DEFLECTS ATTACK!'
          );
        } else {
          addParticle(
            ctx.particles,
            'score_popup',
            drillTipX,
            drillTipY - 22,
            0,
            -1.2,
            '#EF4444',
            11,
            30,
            isCharging ? 'DRILL CHARGE!' : 'DRILL SPIKE!'
          );
          hurtPlayer(player, ctx, true);
        }
        continue;
      }

      // 2) Cockpit weak point (jammed engine opens it during the 115-frame stun)
      const cockpitX = boss.x;
      const cockpitY = boss.y - 26;
      if (Math.hypot(player.x - cockpitX, player.y - cockpitY) < 32) {
        if (isAttacking) {
          if (stunned) {
            damageMechBoss(boss, player, ctx, cockpitX, cockpitY, 'JAMMED COCKPIT HIT!');
          } else {
            player.vx = -boss.facing * 7.8;
            player.gsp = player.vx;
            player.vy = -6.0;
            player.onGround = false;
            soundFX.playSpring(false);
            addParticle(
              ctx.particles,
              'score_popup',
              cockpitX,
              cockpitY - 26,
              0,
              -1.1,
              '#C084FC',
              11,
              34,
              'ARMORED! SLAM IT INTO A WALL!'
            );
          }
        } else {
          hurtPlayer(player, ctx);
        }
        continue;
      }

      // 3) Armored tread hull contact
      if (Math.hypot(player.x - boss.x, player.y - boss.y) < 36) {
        if (isAttacking) {
          player.vx = -boss.facing * 6.8;
          player.gsp = player.vx;
          player.vy = -5.6;
          soundFX.playSpring(false);
          addParticle(
            ctx.particles,
            'score_popup',
            boss.x,
            boss.y - 24,
            0,
            -1.1,
            '#C084FC',
            11,
            32,
            'HULL DEFLECT!'
          );
        } else {
          hurtPlayer(player, ctx);
        }
        continue;
      }
      continue;
    } else if (boss.bossType === 'marble') {
      // Unique Marble Zone Boss: Underslung Molten Magma Furnace Nozzle
      const nozzleX = boss.x;
      const nozzleY = boss.y + 24;
      if (!isAttacking && Math.hypot(player.x - nozzleX, player.y - nozzleY) < 16) {
        hurtPlayer(player, ctx);
      }
    } else if (boss.bossType === 'starlight') {
      // Unique Neo Starlight Boss: Underslung Rotating Cyber Spike-Mine Turbine (Damages like spikes!)
      const turbineX = boss.x;
      const turbineY = boss.y + 26;
      if (
        !player.isSuper &&
        player.invincibleTimer === 0 &&
        Math.hypot(player.x - turbineX, player.y - turbineY) < 18
      ) {
        hurtPlayer(player, ctx);
      }
    } else if (boss.bossType === 'hilltop') {
      // Unique Hill Top Peaks Boss: Underslung Volcanic Pyro-Sub Thruster Jet
      const jetX = boss.x;
      const jetY = boss.y + 26;
      if (
        !player.isSuper &&
        player.invincibleTimer === 0 &&
        player.shield !== 'flame' &&
        Math.hypot(player.x - jetX, player.y - jetY) < 18
      ) {
        hurtPlayer(player, ctx);
      }
    } else {
      // Standard Wrecking Ball Boss: Swinging Checkered Wrecking Ball
      const ballX = boss.x + Math.sin(boss.ballSwingAngle) * 58;
      const ballY = boss.y + Math.cos(boss.ballSwingAngle) * 58;
      if (Math.hypot(player.x - ballX, player.y - ballY) < 22) {
        hurtPlayer(player, ctx);
      }
    }

    // 2. Check collision with Boss Core / Cockpit / Torso
    const coreY = boss.y;
    const hitRadius = boss.bossType === 'silversonic' ? 26 : 30;
    const distToPod = Math.hypot(player.x - boss.x, player.y - coreY);
    if (distToPod < hitRadius) {
      if (isAttacking) {
        if (boss.invulnTimer === 0) {
          // Hyper Forms deal 2x damage to bosses!
          const hitDamage = player.isHyper ? 2 : 1;
          boss.hp = Math.max(0, boss.hp - hitDamage);
          boss.invulnTimer = 32;
          soundFX.playBossHit();
          // Rebound player off the Boss
          player.vy = player.y < coreY ? -6.8 : -4.8;
          player.vx = (player.x < boss.x ? -1 : 1) * 5.2;
          player.gsp = player.vx;

          addParticle(ctx.particles, 'pop', boss.x, coreY, 0, 0, '#F97316', 24, 20);
          if (player.isHyper && boss.hp > 0) {
            addParticle(
              ctx.particles,
              'score_popup',
              boss.x,
              coreY - 22,
              0,
              -1.2,
              '#38BDF8',
              12,
              32,
              'HYPER 2X HIT!'
            );
          }

          if (boss.hp <= 0) {
            boss.alive = false;
            boss.engaged = false;
            player.score += 1000;
            soundFX.playGoalPost();
            const popCount = 10;
            for (let k = 0; k < popCount; k++) {
              addParticle(
                ctx.particles,
                'pop',
                boss.x + (Math.random() - 0.5) * 64,
                coreY + (Math.random() - 0.5) * 64,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5,
                '#FACC15',
                24,
                34
              );
            }
            addParticle(
              ctx.particles,
              'score_popup',
              boss.x,
              coreY - 28,
              0,
              -1.2,
              '#FACC15',
              14,
              65,
              boss.bossType === 'silversonic'
                ? 'SILVER SONIC DEFEATED +1000!'
                : boss.bossType === 'marble'
                ? 'MARBLE BOSS DEFEATED +1000!'
                : boss.bossType === 'starlight'
                ? 'STARLIGHT BOSS DEFEATED +1000!'
                : boss.bossType === 'hilltop'
                ? 'HILL TOP BOSS DEFEATED +1000!'
                : 'EGGMAN DEFEATED +1000!'
            );
          }
        }
      } else {
        hurtPlayer(player, ctx);
      }
    }
  }
}

function interactWithHazards(player: PlayerEntity, ctx: StepContext) {
  for (const hz of ctx.hazards) {
    // Venting steam is a harmless force — it shoves players away from the mech
    if (hz.kind === 'steam' || hz.kind === 'steam_burst') {
      const dist = Math.hypot(player.x - hz.x, player.y - hz.y);
      if (dist < hz.radius + 24) {
        const push = hz.kind === 'steam_burst' ? 1.7 : 0.9;
        player.vy = Math.max(-9.2, player.vy - push);
        player.onGround = false;
      }
      continue;
    }

    if (!hz.damaging) continue;

    if (hz.kind === 'shockwave') {
      // Ground-hugging shockwave: only grounded players standing in its path
      const footY = player.y + PLAYER_HALF_H;
      const sameLevel = Math.abs(footY - (hz.y + 10)) < 30;
      if (sameLevel && player.onGround && Math.abs(player.x - hz.x) < hz.radius + 12) {
        addParticle(
          ctx.particles,
          'score_popup',
          player.x,
          player.y - 22,
          0,
          -1.2,
          '#EF4444',
          11,
          30,
          'SHOCKWAVE!'
        );
        hurtPlayer(player, ctx, true);
      }
      continue;
    }

    // Falling stalactites & rock debris behave like spiked hazards
    const dist = Math.hypot(player.x - hz.x, player.y - hz.y);
    if (dist < hz.radius + 13) {
      addParticle(
        ctx.particles,
        'score_popup',
        hz.x,
        hz.y - 18,
        0,
        -1.2,
        '#EF4444',
        11,
        30,
        hz.kind === 'debris' ? 'ROCK DEBRIS!' : 'STALACTITE!'
      );
      hurtPlayer(player, ctx, true);
    }
  }
}

function interactWithProjectiles(player: PlayerEntity, ctx: StepContext) {
  for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
    const proj = ctx.projectiles[i];
    const dist = Math.hypot(player.x - proj.x, player.y - proj.y);
    if (dist < proj.radius + 13) {
      if (
        player.isSuper ||
        player.invincibleTimer > 0 ||
        player.shield === 'flame' ||
        player.shield === 'lightning' ||
        player.shield === 'bubble'
      ) {
        ctx.projectiles.splice(i, 1);
        addParticle(ctx.particles, 'sparkle', proj.x, proj.y, -proj.vx * 0.5, -2, '#38BDF8', 6, 15);
      } else {
        ctx.projectiles.splice(i, 1);
        hurtPlayer(player, ctx, true);
      }
    }
  }
}

export function updateWorldEntities(ctx: StepContext) {
  // Update Badniks
  for (const b of ctx.badniks) {
    if (!b.alive) continue;
    b.timer++;
    if (b.attackCooldown > 0) b.attackCooldown--;

    let nearestPlayer: PlayerEntity | null = null;
    let minPlayerDist = Infinity;
    for (const p of ctx.players) {
      const d = Math.hypot(p.x - b.x, p.y - b.y);
      if (d < minPlayerDist) {
        minPlayerDist = d;
        nearestPlayer = p;
      }
    }

    if (b.type === TileType.BADNIK_MOTOBUG) {
      const playerInSight =
        nearestPlayer &&
        Math.abs(nearestPlayer.y - b.y) < 56 &&
        Math.abs(nearestPlayer.x - b.x) < 190 &&
        Math.sign(nearestPlayer.x - b.x) === b.facing;

      b.isCharging = Boolean(playerInSight);
      const speed = b.isCharging ? 3.9 : 1.9;
      b.vx = b.facing * speed;
      b.x += b.vx;

      if (b.isCharging && b.timer % 4 === 0) {
        addParticle(
          ctx.particles,
          'smoke',
          b.x - b.facing * 12,
          b.y + 6,
          -b.facing * 1.5,
          -0.5,
          '#94A3B8',
          4,
          14
        );
      }

      if (Math.abs(b.x - b.startX) > 104) {
        b.facing = (b.x > b.startX ? -1 : 1) as 1 | -1;
      }
    } else if (b.type === TileType.BADNIK_BUZZ) {
      const isAiming = b.attackCooldown > 55 && b.attackCooldown <= 75;
      if (!isAiming) {
        b.x += b.vx;
        b.y = b.startY + Math.sin(b.timer * 0.08) * 20;
        if (Math.abs(b.x - b.startX) > 130) {
          b.vx *= -1;
          b.facing = (b.vx >= 0 ? 1 : -1) as 1 | -1;
        }
      }

      if (
        nearestPlayer &&
        minPlayerDist < 250 &&
        b.attackCooldown === 0 &&
        nearestPlayer.y > b.y - 10
      ) {
        b.attackCooldown = 78;
        b.facing = (nearestPlayer.x >= b.x ? 1 : -1) as 1 | -1;
        b.vx = Math.abs(b.vx) * b.facing;
      }

      if (b.attackCooldown === 58 && nearestPlayer) {
        const angle = Math.atan2(nearestPlayer.y - b.y, nearestPlayer.x - b.x);
        ctx.projectiles.push({
          id: nextProjectileId++,
          x: b.x + b.facing * 8,
          y: b.y + 8,
          vx: Math.cos(angle) * 4.6,
          vy: Math.sin(angle) * 4.6,
          color: '#FACC15',
          radius: 5,
          life: 110,
        });
      }
    } else if (b.type === TileType.BADNIK_CRAB) {
      const isFiring = b.timer % 90 > 65;
      b.isCharging = isFiring;
      if (!isFiring) {
        b.x += b.vx;
        if (Math.abs(b.x - b.startX) > 90) {
          b.vx *= -1;
          b.facing = (b.vx >= 0 ? 1 : -1) as 1 | -1;
        }
      } else if (b.timer % 90 === 75 && minPlayerDist < 320) {
        ctx.projectiles.push(
          {
            id: nextProjectileId++,
            x: b.x - 12,
            y: b.y - 10,
            vx: -2.8,
            vy: -4.2,
            color: '#F43F5E',
            radius: 5,
            life: 95,
          },
          {
            id: nextProjectileId++,
            x: b.x + 12,
            y: b.y - 10,
            vx: 2.8,
            vy: -4.2,
            color: '#F43F5E',
            radius: 5,
            life: 95,
          }
        );
      }
    } else if (b.type === TileType.BADNIK_CHOPPER) {
      // Emerald Mountains Act 2 Exclusive: Leaping Chopper Piranha!
      b.y = b.startY + Math.sin(b.timer * 0.075) * 64;
      b.vy = Math.cos(b.timer * 0.075) * 4.8;
      b.isCharging = b.vy < 0;
    } else if (b.type === TileType.BADNIK_CATERKILLER) {
      // Marble Zone Enemy 1: Undulating Spiked Caterkiller!
      b.x += b.vx;
      if (Math.abs(b.x - b.startX) > 110) {
        b.vx *= -1;
        b.facing = (b.vx >= 0 ? 1 : -1) as 1 | -1;
      }
    } else if (b.type === TileType.BADNIK_BATBRAIN) {
      // Marble Zone Enemy 2: Swooping Cavern Batbrain!
      if (minPlayerDist < 280) {
        b.isCharging = true;
        b.x += b.vx;
        b.y = b.startY + 24 + Math.sin(b.timer * 0.11) * 32;
        if (Math.abs(b.x - b.startX) > 135) {
          b.vx *= -1;
          b.facing = (b.vx >= 0 ? 1 : -1) as 1 | -1;
        }
      } else {
        b.isCharging = false;
        b.y += (b.startY - b.y) * 0.1;
      }
    } else if (b.type === TileType.BADNIK_ORBINAUT) {
      // Neo Starlight Enemy 1: Orbiting Spike-Mine Orbinaut!
      b.x += b.vx * 0.65;
      b.y = b.startY + Math.sin(b.timer * 0.06) * 14;
      if (Math.abs(b.x - b.startX) > 96) {
        b.vx *= -1;
        b.facing = (b.vx >= 0 ? 1 : -1) as 1 | -1;
      }
      if (minPlayerDist < 290 && b.timer % 80 === 0) {
        ctx.projectiles.push({
          id: nextProjectileId++,
          x: b.x + b.facing * 14,
          y: b.y,
          vx: b.facing * 4.8,
          vy: 0,
          color: '#38BDF8',
          radius: 6,
          life: 100,
        });
      }
    } else if (b.type === TileType.BADNIK_BOMB) {
      // Neo Starlight Enemy 2: Proximity Shrapnel Walking Bomb!
      const isFusing = minPlayerDist < 150 && b.timer % 80 > 45;
      b.isCharging = isFusing;
      if (!isFusing) {
        b.x += b.vx * 0.55;
        if (Math.abs(b.x - b.startX) > 76) {
          b.vx *= -1;
          b.facing = (b.vx >= 0 ? 1 : -1) as 1 | -1;
        }
      } else if (b.timer % 80 === 75) {
        soundFX.playLavaBurn();
        const dirs = [
          [-3.4, -3.4],
          [3.4, -3.4],
          [-4.2, -1.2],
          [4.2, -1.2],
        ];
        for (const [svx, svy] of dirs) {
          ctx.projectiles.push({
            id: nextProjectileId++,
            x: b.x,
            y: b.y - 6,
            vx: svx,
            vy: svy,
            color: '#F97316',
            radius: 5,
            life: 75,
          });
        }
      }
    } else if (b.type === TileType.BADNIK_SPINY) {
      // Hill Top Peaks Enemy: Twin Plasma-Mortar Spiny!
      const isFiring = b.timer % 85 > 55;
      b.isCharging = isFiring;
      if (!isFiring) {
        b.x += b.vx * 0.7;
        if (Math.abs(b.x - b.startX) > 88) {
          b.vx *= -1;
          b.facing = (b.vx >= 0 ? 1 : -1) as 1 | -1;
        }
      } else if (b.timer % 85 === 70 && minPlayerDist < 320) {
        ctx.projectiles.push(
          {
            id: nextProjectileId++,
            x: b.x - 8,
            y: b.y - 10,
            vx: -2.4,
            vy: -5.2,
            color: '#F43F5E',
            radius: 5,
            life: 95,
          },
          {
            id: nextProjectileId++,
            x: b.x + 8,
            y: b.y - 10,
            vx: 2.4,
            vy: -5.2,
            color: '#F43F5E',
            radius: 5,
            life: 95,
          }
        );
      }
    }
  }

  // Update Wall-Mounted Lava Shooters (Neo Starlight Zone) & Magma Geysers (Marble Zone)
  const globalTick = Math.floor(ctx.elapsedMs / 16);
  const pRef = ctx.players[0];
  if (pRef) {
    const minTx = Math.max(0, Math.floor((pRef.x - 440) / TILE_SIZE));
    const maxTx = Math.min(ctx.level.width - 1, Math.floor((pRef.x + 440) / TILE_SIZE));
    const minTy = Math.max(0, Math.floor((pRef.y - 320) / TILE_SIZE));
    const maxTy = Math.min(ctx.level.height - 1, Math.floor((pRef.y + 320) / TILE_SIZE));

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        const t = ctx.grid[ty][tx] as TileType;
        if (
          t === TileType.GIMMICK_LAVA_SHOOTER_LEFT ||
          t === TileType.GIMMICK_LAVA_SHOOTER_RIGHT
        ) {
          const dir = t === TileType.GIMMICK_LAVA_SHOOTER_LEFT ? -1 : 1;
          if ((globalTick + tx * 11 + ty * 19) % 76 === 0) {
            const sx = tx * TILE_SIZE + 16 + dir * 18;
            const sy = ty * TILE_SIZE + 16;
            ctx.projectiles.push({
              id: nextProjectileId++,
              x: sx,
              y: sy,
              vx: dir * 5.6,
              vy: 0,
              color: '#EA580C',
              radius: 7,
              life: 105,
            });
            addParticle(
              ctx.particles,
              'sparkle',
              sx,
              sy,
              dir * 2.8,
              (Math.random() - 0.5) * 1.5,
              '#FACC15',
              6,
              14
            );
          }
        } else if (t === TileType.GIMMICK_LAVA_GEYSER) {
          if ((globalTick + tx * 17) % 88 === 0) {
            const gx = tx * TILE_SIZE + 16;
            const gy = ty * TILE_SIZE;
            ctx.projectiles.push({
              id: nextProjectileId++,
              x: gx,
              y: gy,
              vx: 0,
              vy: -7.2,
              color: '#FB923C',
              radius: 8,
              life: 86,
            });
            addParticle(ctx.particles, 'sparkle', gx, gy, 0, -3.5, '#F97316', 7, 18);
          }
        }
      }
    }
  }

  // ===========================================================================
  // MYSTIC CAVERNS FALLING STALACTITES
  // Hanging rock stalactites detach the moment a player runs underneath them!
  // ===========================================================================
  for (const p of ctx.players) {
    const pTx = Math.floor(p.x / TILE_SIZE);
    const pTy = Math.floor(p.y / TILE_SIZE);
    for (let ty = Math.max(1, pTy - 14); ty <= Math.max(1, pTy - 2); ty++) {
      for (
        let tx = Math.max(0, pTx - 1);
        tx <= Math.min(ctx.level.width - 1, pTx + 1);
        tx++
      ) {
        if (ctx.grid[ty][tx] !== TileType.GIMMICK_STALACTITE) continue;
        // Only stalactites anchored to a solid cavern ceiling (or a rock stem
        // reaching up to it) can break loose and drop.
        let anchored = false;
        for (let d = 1; d <= 4; d++) {
          if (isSolidTile(getTileAt(ctx.grid, tx, ty - d))) {
            anchored = true;
            break;
          }
        }
        if (!anchored) continue;
        ctx.grid[ty][tx] = TileType.EMPTY;
        spawnHazard(
          ctx.hazards,
          'stalactite',
          tx * TILE_SIZE + 16,
          ty * TILE_SIZE + 16,
          (Math.random() - 0.5) * 0.7,
          2.3,
          9,
          260,
          true,
          '#A855F7'
        );
        addParticle(ctx.particles, 'pop', tx * TILE_SIZE + 16, ty * TILE_SIZE + 12, 0, 0, '#E9D5FF', 12, 14);
        soundFX.playPop();
      }
    }
  }

  // ===========================================================================
  // HAZARD UPDATES (stalactites, rock debris, boss shockwaves, steam jets)
  // ===========================================================================
  for (let i = ctx.hazards.length - 1; i >= 0; i--) {
    const hz = ctx.hazards[i];
    hz.life--;

    if (hz.kind === 'stalactite' || hz.kind === 'debris') {
      hz.vy += hz.kind === 'debris' ? 0.34 : 0.2;
      hz.x += hz.vx;
      hz.y += hz.vy;
      const tx = Math.floor(hz.x / TILE_SIZE);
      const ty = Math.floor((hz.y + hz.radius) / TILE_SIZE);
      const hitTile = getTileAt(ctx.grid, tx, ty);
      if (isSolidTile(hitTile) || hitTile === TileType.PLATFORM) {
        // Shatter into rocky debris on impact!
        for (let d = 0; d < 8; d++) {
          addParticle(
            ctx.particles,
            'brick_debris',
            hz.x,
            hz.y,
            (Math.random() - 0.5) * 6,
            -2 - Math.random() * 4,
            d % 2 === 0 ? '#7E22CE' : '#C084FC',
            6,
            22
          );
        }
        soundFX.playPop();
        ctx.hazards.splice(i, 1);
        continue;
      }
      if (hz.life <= 0 || hz.y > ctx.level.height * TILE_SIZE + 40) {
        ctx.hazards.splice(i, 1);
        continue;
      }
      continue;
    }

    if (hz.kind === 'shockwave') {
      hz.x += hz.vx;
      if (hz.life <= 0) {
        ctx.hazards.splice(i, 1);
        continue;
      }
      if (hz.life % 4 === 0 && Math.random() < 0.6) {
        addParticle(
          ctx.particles,
          'sparkle',
          hz.x,
          hz.y + 6,
          hz.vx * 0.2,
          -1.4,
          '#FACC15',
          6,
          16
        );
      }
      continue;
    }

    // Steam jets venting from the overheated cooling dome
    if (hz.kind === 'steam' || hz.kind === 'steam_burst') {
      hz.y -= 1.4;
      hz.x += hz.vx;
      if (hz.life <= 0) {
        ctx.hazards.splice(i, 1);
        continue;
      }
      continue;
    }
  }

  // Update Dr. Eggman Bosses
  for (const boss of ctx.bosses) {
    if (!boss.alive) continue;
    if (boss.invulnTimer > 0) boss.invulnTimer--;
    boss.attackTimer++;

    if (boss.bossType === 'marble') {
      // UNIQUE MARBLE ZONE BOSS: Dr. Eggman's Magma Fireball Dropper!
      // Sweeps across the twin marble platforms and swoops low while dropping molten magma fireballs!
      const spd = boss.hp <= 4 ? 3.4 : 2.5;
      boss.x += boss.facing * spd;
      boss.y = boss.startY + Math.sin(boss.attackTimer * 0.06) * 24;
      boss.ballSwingAngle = Math.sin(boss.attackTimer * 0.12) * 0.35;

      if (Math.abs(boss.x - boss.startX) > 155) {
        boss.facing = (boss.x > boss.startX ? -1 : 1) as 1 | -1;
      }

      // Emit glowing magma sparks from the underslung furnace nozzle
      if (boss.attackTimer % 5 === 0) {
        addParticle(
          ctx.particles,
          'sparkle',
          boss.x + (Math.random() - 0.5) * 14,
          boss.y + 24,
          (Math.random() - 0.5) * 1.6,
          1.2 + Math.random() * 1.5,
          boss.attackTimer % 10 === 0 ? '#FACC15' : '#F97316',
          5,
          16
        );
      }

      const dropInterval = boss.hp <= 4 ? 42 : 56;
      if (boss.attackTimer % dropInterval === 0) {
        const target = ctx.players[0];
        if (target && Math.hypot(target.x - boss.x, target.y - boss.y) < 420) {
          soundFX.playLavaBurn();
          // Vertical Molten Magma Bomb dropped straight from the furnace nozzle
          ctx.projectiles.push({
            id: nextProjectileId++,
            x: boss.x,
            y: boss.y + 24,
            vx: 0,
            vy: 4.4,
            color: '#F97316',
            radius: 9,
            life: 110,
          });
          // Twin diagonal magma embers that arc onto the side platforms
          ctx.projectiles.push(
            {
              id: nextProjectileId++,
              x: boss.x - 10,
              y: boss.y + 20,
              vx: -2.4,
              vy: -2.6,
              color: '#FB923C',
              radius: 6,
              life: 95,
            },
            {
              id: nextProjectileId++,
              x: boss.x + 10,
              y: boss.y + 20,
              vx: 2.4,
              vy: -2.6,
              color: '#FB923C',
              radius: 6,
              life: 95,
            }
          );
        }
      }
    } else if (boss.bossType === 'starlight') {
      // UNIQUE NEO STARLIGHT ZONE BOSS: Dr. Eggman's Cyber Spike-Mine & Twin Laser Pod!
      const spd = boss.hp <= 4 ? 3.5 : 2.6;
      boss.x += boss.facing * spd;
      boss.y = boss.startY + Math.sin(boss.attackTimer * 0.065) * 22;
      boss.ballSwingAngle += boss.hp <= 4 ? 0.16 : 0.1;

      if (Math.abs(boss.x - boss.startX) > 150) {
        boss.facing = (boss.x > boss.startX ? -1 : 1) as 1 | -1;
      }

      // Cyber sparks from spinning electro-turbine
      if (boss.attackTimer % 6 === 0) {
        addParticle(
          ctx.particles,
          'sparkle',
          boss.x + (Math.random() - 0.5) * 18,
          boss.y + 24,
          (Math.random() - 0.5) * 2,
          1.2,
          boss.attackTimer % 12 === 0 ? '#38BDF8' : '#EC4899',
          5,
          15
        );
      }

      const target = ctx.players[0];
      if (target && Math.hypot(target.x - boss.x, target.y - boss.y) < 420) {
        // Attack 1: Drop Bouncing Cyber Spike-Bomb that bursts into floor shockwaves!
        const bombInterval = boss.hp <= 4 ? 48 : 64;
        if (boss.attackTimer % bombInterval === 0) {
          ctx.projectiles.push({
            id: nextProjectileId++,
            x: boss.x,
            y: boss.y + 24,
            vx: boss.facing * 1.6,
            vy: 4.2,
            color: '#0EA5E9',
            radius: 9,
            life: 110,
          });
        }
        // Attack 2: Twin Aimed Neon-Magenta Laser Salvo!
        if (boss.attackTimer % 78 === 39) {
          const ang = Math.atan2(target.y - boss.y, target.x - boss.x);
          ctx.projectiles.push(
            {
              id: nextProjectileId++,
              x: boss.x + boss.facing * 18,
              y: boss.y + 4,
              vx: Math.cos(ang - 0.12) * 5.8,
              vy: Math.sin(ang - 0.12) * 5.8,
              color: '#EC4899',
              radius: 6,
              life: 100,
            },
            {
              id: nextProjectileId++,
              x: boss.x + boss.facing * 18,
              y: boss.y + 4,
              vx: Math.cos(ang + 0.12) * 5.8,
              vy: Math.sin(ang + 0.12) * 5.8,
              color: '#38BDF8',
              radius: 6,
              life: 100,
            }
          );
        }
      }
    } else if (boss.bossType === 'hilltop') {
      // UNIQUE HILL TOP PEAKS ZONE BOSS: Dr. Eggman's Volcanic Pyro-Sub & Solar Cannon!
      const spd = boss.hp <= 4 ? 3.4 : 2.5;
      boss.x += boss.facing * spd;
      // Swoops between low volcanic strafing runs and high altitude mortar bombardment!
      boss.y = boss.startY + Math.sin(boss.attackTimer * 0.075) * 30;
      boss.ballSwingAngle = Math.cos(boss.attackTimer * 0.075) * 0.4;

      if (Math.abs(boss.x - boss.startX) > 152) {
        boss.facing = (boss.x > boss.startX ? -1 : 1) as 1 | -1;
      }

      // Volcanic thermal exhaust sparks
      if (boss.attackTimer % 5 === 0) {
        addParticle(
          ctx.particles,
          'sparkle',
          boss.x + (Math.random() - 0.5) * 16,
          boss.y + 24,
          (Math.random() - 0.5) * 1.8,
          1.8,
          boss.attackTimer % 10 === 0 ? '#EF4444' : '#FACC15',
          5,
          15
        );
      }

      const target = ctx.players[0];
      if (target && Math.hypot(target.x - boss.x, target.y - boss.y) < 420) {
        // Attack 1: 3-Way Volcanic Magma Mortar Eruption from top tubes!
        const mortarInterval = boss.hp <= 4 ? 50 : 68;
        if (boss.attackTimer % mortarInterval === 0) {
          soundFX.playLavaBurn();
          const mortarVxs = [-3.2, 0, 3.2];
          for (const mvx of mortarVxs) {
            ctx.projectiles.push({
              id: nextProjectileId++,
              x: boss.x,
              y: boss.y - 12,
              vx: mvx,
              vy: -5.4,
              color: '#FB923C',
              radius: 7,
              life: 105,
            });
          }
        }
        // Attack 2: Horizontal Blazing Solar Fireball Beam!
        if (boss.attackTimer % 74 === 37) {
          ctx.projectiles.push({
            id: nextProjectileId++,
            x: boss.x + boss.facing * 20,
            y: boss.y + 6,
            vx: boss.facing * 6.0,
            vy: 0,
            color: '#EA580C',
            radius: 8,
            life: 100,
          });
        }
      }
    } else if (boss.bossType === 'chemical') {
      // =====================================================================
      // HYDRAULIC SLIME-CRUSHER & SIPHON MECH (Chemical Plant Act 2 Boss)
      // Attacks: Piston Stomp Slam · Chemical Flood · Slime Siphon Vortex ·
      // 120-Frame Overheat Venting (primary attack opening). No projectiles!
      // =====================================================================
      const target = ctx.players[0];
      const floorY = boss.mechFloorY ?? boss.startY + 96;
      const leftBound = boss.arenaLeft + 56;
      const rightBound = boss.arenaRight - 56;
      boss.mechTimer = (boss.mechTimer || 0) + 1;
      const mt = boss.mechTimer;
      const mechPhase = boss.mechPhase || 'mech_advance';

      if (!boss.engaged) {
        // Parked above the vats until a player steps into the siphon arena
        boss.x = boss.startX;
        boss.y = boss.startY + Math.sin(mt * 0.05) * 8;
        boss.floodLevel = 0;
        boss.vortexActive = false;
        boss.overheatFrames = 0;
        boss.mechVulnerable = false;
        continue;
      }

      // Overheat venting timer (120 frames of exposed cooling dome)
      if (boss.overheatFrames && boss.overheatFrames > 0) {
        boss.overheatFrames--;
        if (boss.overheatFrames === 0) {
          boss.mechVulnerable = false;
          addParticle(
            ctx.particles,
            'score_popup',
            boss.x,
            boss.y - 44,
            0,
            -1.1,
            '#FACC15',
            12,
            42,
            'COOLING DOME SEALED!'
          );
        }
      } else {
        boss.mechVulnerable = false;
      }

      switch (mechPhase) {
        case 'mech_advance': {
          // Hydraulic legs carry the mech toward the player's side of the arena
          const spd = boss.hp <= 5 ? 2.0 : 1.45;
          if (target) boss.facing = (target.x >= boss.x ? 1 : -1) as 1 | -1;
          boss.x = Math.max(leftBound, Math.min(rightBound, boss.x + boss.facing * spd));
          boss.y = boss.startY + Math.abs(Math.sin(mt * 0.12)) * 4;
          boss.vortexActive = false;
          boss.floodLevel = Math.max(0, (boss.floodLevel || 0) - 0.02);
          if (mt % 22 === 0) {
            addParticle(
              ctx.particles,
              'smoke',
              boss.x + boss.facing * 20,
              floorY - 6,
              -boss.facing * 1.6,
              -0.8,
              '#94A3B8',
              7,
              16
            );
          }
          if (mt >= 70) {
            boss.mechPhase = 'piston_stomp';
            boss.mechTimer = 0;
          }
          break;
        }

        case 'piston_stomp': {
          // PISTON STOMP SLAM: wind up on both hydraulic feet, then slam the
          // floor hard enough to send shockwaves racing out in both directions!
          if (mt < 24) {
            boss.y = boss.startY - mt * 1.15;
          } else if (mt < 36) {
            boss.y = boss.startY - 26 + (mt - 24) * 6.4;
          } else {
            boss.y = boss.startY;
            if (mt === 36) {
              soundFX.playLavaBurn();
              const waveY = floorY - 12;
              spawnHazard(ctx.hazards, 'shockwave', boss.x - 26, waveY, -6.6, 0, 22, 64, true, '#FACC15', -1);
              spawnHazard(ctx.hazards, 'shockwave', boss.x + 26, waveY, 6.6, 0, 22, 64, true, '#FACC15', 1);
              for (let d = 0; d < 14; d++) {
                addParticle(
                  ctx.particles,
                  'brick_debris',
                  boss.x + (Math.random() - 0.5) * 76,
                  floorY - 6,
                  (Math.random() - 0.5) * 7,
                  -2.4 - Math.random() * 3.6,
                  d % 2 === 0 ? '#94A3B8' : '#38BDF8',
                  6,
                  24
                );
              }
            }
          }
          if (boss.y > boss.startY) boss.y = boss.startY;
          if (mt >= 74) {
            boss.mechPhase = 'chemical_flood';
            boss.mechTimer = 0;
          }
          break;
        }

        case 'chemical_flood': {
          // CHEMICAL FLOOD: open the vat valves — bubbling blue chemicals rise
          // over the arena floor & force everyone onto the high catwalks!
          if (mt === 1) {
            soundFX.playSpinDashRev(5);
            addParticle(
              ctx.particles,
              'score_popup',
              boss.x,
              boss.y - 46,
              0,
              -1.0,
              '#38BDF8',
              13,
              55,
              'CHEMICAL FLOOD! GET TO THE CATWALKS!'
            );
          }
          if (mt < 96) boss.floodLevel = Math.min(1, (boss.floodLevel || 0) + 0.0108);
          boss.y = boss.startY + Math.sin(mt * 0.1) * 6;
          boss.vortexActive = false;
          if (mt % 9 === 0 && (boss.floodLevel || 0) > 0.05) {
            const surfaceY = floorY - (boss.floodLevel || 0) * TILE_SIZE * 3;
            for (let b = 0; b < 4; b++) {
              addParticle(
                ctx.particles,
                'sparkle',
                boss.arenaLeft + Math.random() * (boss.arenaRight - boss.arenaLeft),
                surfaceY,
                0,
                -1.6 - Math.random() * 1.6,
                b % 2 === 0 ? '#7DD3FC' : '#38BDF8',
                6,
                22
              );
            }
          }
          if (mt >= 150) {
            boss.mechPhase = 'siphon_vortex';
            boss.mechTimer = 0;
          }
          break;
        }

        case 'siphon_vortex': {
          // SLIME SIPHON VORTEX: the intake turbine spools up to high speed and
          // drags players inward against their own momentum!
          if (mt === 1) {
            soundFX.playSpinDashRev(6);
            addParticle(
              ctx.particles,
              'score_popup',
              boss.x,
              boss.y - 46,
              0,
              -1.0,
              '#38BDF8',
              13,
              55,
              'SIPHON VORTEX — RUN AGAINST THE PULL!'
            );
          }
          boss.vortexActive = true;
          boss.vortexStrength = Math.min(1, mt / 30);
          boss.y = boss.startY + 6;
          boss.floodLevel = Math.max(0, (boss.floodLevel || 0) - 0.006);
          for (const p of ctx.players) {
            const dx = boss.x - p.x;
            const dy = boss.startY + 26 - p.y;
            const d = Math.max(48, Math.hypot(dx, dy));
            if (d < 470) {
              const strength = (boss.vortexStrength || 0) * (1 - (d / 470) * 0.35);
              p.vx += (dx / d) * 0.78 * strength;
              p.gsp += (dx / d) * 0.55 * strength;
              p.vy += (dy / d) * 0.5 * strength;
              if (d > 60) p.onGround = false;
            }
          }
          if (mt % 3 === 0) {
            const ang = mt * 0.44;
            addParticle(
              ctx.particles,
              'sparkle',
              boss.x + Math.cos(ang) * 56,
              boss.startY + 26 + Math.sin(ang) * 56,
              -Math.sin(ang) * 3.4,
              Math.cos(ang) * 3.4,
              '#38BDF8',
              6,
              16
            );
            addParticle(
              ctx.particles,
              'sparkle',
              boss.x - Math.cos(ang) * 40,
              boss.startY + 26 - Math.sin(ang) * 40,
              Math.sin(ang) * 2.6,
              -Math.cos(ang) * 2.6,
              '#7DD3FC',
              5,
              14
            );
          }
          if (mt >= 120) {
            boss.vortexActive = false;
            boss.vortexStrength = 0;
            boss.mechPhase = 'overheat_venting';
            boss.mechTimer = 0;
          }
          break;
        }

        case 'overheat_venting': {
          // OVERHEAT VENTING: cooling dome pops open and steam jets vent for a
          // full 120 frames — the ONLY window where the cockpit core is exposed!
          if (mt === 1) {
            boss.overheatFrames = OVERHEAT_VENT_FRAMES;
            boss.mechVulnerable = true;
            soundFX.playBossHit();
            addParticle(
              ctx.particles,
              'score_popup',
              boss.x,
              boss.y - 56,
              0,
              -1.0,
              '#FACC15',
              13,
              62,
              'OVERHEAT! DOME OPEN — ATTACK NOW!'
            );
          }
          boss.y = boss.startY - 8 + Math.sin(mt * 0.2) * 3;
          boss.floodLevel = Math.max(0, (boss.floodLevel || 0) - 0.012);
          if (mt % 6 === 0) {
            // Steam jets push players back — no damage, this is the safe opening!
            spawnHazard(ctx.hazards, 'steam_burst', boss.x - 16, boss.y - 32, -0.7, -3.2, 16, 46, false, '#E0F2FE');
            spawnHazard(ctx.hazards, 'steam_burst', boss.x + 16, boss.y - 32, 0.7, -3.2, 16, 46, false, '#E0F2FE');
          }
          if (mt % 5 === 0) {
            addParticle(
              ctx.particles,
              'smoke',
              boss.x + (Math.random() - 0.5) * 30,
              boss.y - 30,
              (Math.random() - 0.5) * 2.4,
              -3.6,
              '#E0F2FE',
              9,
              22
            );
          }
          if (mt >= OVERHEAT_VENT_FRAMES + 10) {
            boss.mechVulnerable = false;
            boss.overheatFrames = 0;
            boss.mechPhase = boss.hp <= 5 ? 'piston_stomp' : 'mech_advance';
            boss.mechTimer = 0;
          }
          break;
        }
      }
    } else if (boss.bossType === 'mystic') {
      // =====================================================================
      // EGG DRILL-CRUSHER (Mystic Caverns Act 2 Boss)
      // Attacks: Drill Charge (head-on deflections) · Wall-Crash Stun (115
      // frames) · Ceiling Burrow Tremors (falling debris) · Ground Slam. No projectiles!
      // =====================================================================
      const target = ctx.players[0];
      const floorY = boss.mechFloorY ?? boss.startY + 96;
      const ceilingY = boss.mechCeilingY ?? boss.startY - 160;
      const leftBound = boss.arenaLeft + 64;
      const rightBound = boss.arenaRight - 64;
      const hoverY = floorY - 46; // Closest chassis height to the cavern floor
      boss.mechTimer = (boss.mechTimer || 0) + 1;
      const mt = boss.mechTimer;
      const mechPhase = boss.mechPhase || 'drill_rev';

      if (!boss.engaged) {
        boss.x = boss.startX;
        boss.y = boss.startY + Math.sin(mt * 0.06) * 6;
        boss.drillSpinning = true;
        boss.ceilingBurrow = false;
        continue;
      }

      if (boss.stunFrames && boss.stunFrames > 0) boss.stunFrames--;

      switch (mechPhase) {
        case 'drill_rev': {
          // Rev the conical drill & lock onto the player's side of the arena
          boss.drillSpinning = true;
          boss.slamLanded = false;
          boss.y = hoverY + Math.sin(mt * 0.12) * 4;
          if (target) boss.facing = (target.x >= boss.x ? 1 : -1) as 1 | -1;
          if (mt % 5 === 0) {
            addParticle(
              ctx.particles,
              'sparkle',
              boss.x + boss.facing * 38,
              boss.y + 8,
              boss.facing * 2.4,
              -0.6,
              '#22D3EE',
              5,
              14
            );
          }
          if (mt >= 46) {
            boss.mechPhase = 'drill_charge';
            boss.mechTimer = 0;
            soundFX.playSpinDashRev(6);
          }
          break;
        }

        case 'drill_charge': {
          // DRILL CHARGE: accelerate across the cavern floor — the spinning
          // conical drill bit deflects any head-on attack!
          const spd = (boss.hp <= 5 ? 9.6 : 8.2) + Math.min(2.2, mt * 0.09);
          boss.x += boss.facing * spd;
          boss.y = hoverY + Math.abs(Math.sin(mt * 0.35)) * 3;
          boss.drillSpinning = true;
          boss.ballSwingAngle += 0.62;
          if (mt % 3 === 0) {
            addParticle(
              ctx.particles,
              'smoke',
              boss.x - boss.facing * 30,
              floorY - 10,
              -boss.facing * 2.6,
              -0.9,
              '#7E22CE',
              7,
              16
            );
          }
          const hitWall = boss.x <= leftBound || boss.x >= rightBound;
          if (hitWall) {
            boss.x = Math.max(leftBound, Math.min(rightBound, boss.x));
            // WALL-CRASH STUN: engine stalls & the drill jams for 115 frames!
            boss.mechPhase = 'wall_crash_stun';
            boss.mechTimer = 0;
            boss.stunFrames = DRILL_CRASH_STUN_FRAMES;
            boss.drillSpinning = false;
            boss.vx = 0;
            soundFX.playLavaBurn();
            addParticle(
              ctx.particles,
              'score_popup',
              boss.x,
              boss.y - 50,
              0,
              -1.0,
              '#FACC15',
              13,
              70,
              'WALL CRASH! DRILL JAMMED 115 FRAMES!'
            );
            for (let d = 0; d < 18; d++) {
              addParticle(
                ctx.particles,
                'brick_debris',
                boss.x + boss.facing * 30 + (Math.random() - 0.5) * 30,
                boss.y + (Math.random() - 0.5) * 60,
                -boss.facing * (2 + Math.random() * 5),
                -2 - Math.random() * 4,
                d % 2 === 0 ? '#7E22CE' : '#C084FC',
                7,
                26
              );
            }
          } else if (mt >= 110) {
            boss.mechPhase = 'ceiling_burrow';
            boss.mechTimer = 0;
          }
          break;
        }

        case 'wall_crash_stun': {
          // WALL-CRASH STUN: engine stalled, drill jammed & cockpit wide open!
          boss.y = hoverY + 2;
          boss.drillSpinning = false;
          if (mt % 8 === 0) {
            addParticle(
              ctx.particles,
              'sparkle',
              boss.x + boss.facing * 34,
              boss.y + 10,
              (Math.random() - 0.5) * 3,
              -1.2,
              '#22D3EE',
              6,
              16
            );
          }
          if (mt % 14 === 0) {
            addParticle(
              ctx.particles,
              'smoke',
              boss.x - boss.facing * 20,
              boss.y - 20,
              (Math.random() - 0.5) * 1.6,
              -2.2,
              '#C084FC',
              8,
              20
            );
          }
          if (mt >= DRILL_CRASH_STUN_FRAMES) {
            boss.mechPhase = 'ceiling_burrow';
            boss.mechTimer = 0;
          }
          break;
        }

        case 'ceiling_burrow': {
          // CEILING BURROW & TREMORS: drill up into the rock; tremors dislodge
          // falling rock debris across the arena!
          if (mt === 1) {
            boss.ceilingBurrow = true;
            soundFX.playSpinDashRev(4);
            addParticle(
              ctx.particles,
              'score_popup',
              boss.x,
              boss.y - 46,
              0,
              -1.0,
              '#C084FC',
              13,
              58,
              'CEILING BURROW — DEBRIS INCOMING!'
            );
          }
          boss.drillSpinning = true;
          boss.y = Math.max(ceilingY + 44, boss.y - 5.6);
          if (mt % 16 === 0) {
            // Dislodge a falling rock from the cavern roof
            const debrisX =
              boss.arenaLeft + 48 + Math.random() * Math.max(80, boss.arenaRight - boss.arenaLeft - 96);
            spawnHazard(ctx.hazards, 'debris', debrisX, ceilingY + 26, 0, 3.0, 10, 320, true, '#C084FC');
          }
          if (mt % 4 === 0) {
            addParticle(
              ctx.particles,
              'brick_debris',
              boss.x + (Math.random() - 0.5) * 44,
              boss.y + 18,
              (Math.random() - 0.5) * 4,
              2.6,
              '#6B21A8',
              6,
              20
            );
          }
          if (mt >= 96) {
            boss.mechPhase = 'ground_slam';
            boss.mechTimer = 0;
            boss.slamLanded = false;
          }
          break;
        }

        case 'ground_slam': {
          // GROUND SLAM: plunge from the ceiling with impact shockwaves
          boss.ceilingBurrow = false;
          boss.drillSpinning = true;
          if (!boss.slamLanded && target) {
            boss.x = Math.max(leftBound, Math.min(rightBound, target.x));
          }
          boss.y = Math.min(boss.startY, boss.y + 26);
          if (boss.y >= boss.startY) {
            boss.y = boss.startY;
            if (!boss.slamLanded) {
              boss.slamLanded = true;
              soundFX.playLavaBurn();
              const waveY = floorY - 12;
              spawnHazard(ctx.hazards, 'shockwave', boss.x - 28, waveY, -6.8, 0, 22, 62, true, '#FACC15', -1);
              spawnHazard(ctx.hazards, 'shockwave', boss.x + 28, waveY, 6.8, 0, 22, 62, true, '#FACC15', 1);
              boss.y = boss.startY;
              for (let d = 0; d < 16; d++) {
                addParticle(
                  ctx.particles,
                  'brick_debris',
                  boss.x + (Math.random() - 0.5) * 100,
                  floorY - 6,
                  (Math.random() - 0.5) * 8,
                  -2.6 - Math.random() * 4,
                  d % 2 === 0 ? '#C084FC' : '#7E22CE',
                  7,
                  26
                );
              }
              for (let d = 0; d < 6; d++) {
                spawnHazard(
                  ctx.hazards,
                  'debris',
                  boss.arenaLeft + 60 + Math.random() * Math.max(60, boss.arenaRight - boss.arenaLeft - 120),
                  ceilingY + 24,
                  0,
                  3.4,
                  9,
                  300,
                  true,
                  '#C084FC'
                );
              }
            }
          }
          if (boss.slamLanded && mt >= 60) {
            boss.slamLanded = false;
            boss.mechPhase = boss.hp <= 5 ? 'drill_charge' : 'drill_rev';
            boss.mechTimer = 0;
            if (target) boss.facing = (target.x >= boss.x ? 1 : -1) as 1 | -1;
          }
          break;
        }
      }
    } else if (boss.bossType === 'silversonic') {
      // SONIC 2 DEATH EGG SUB-BOSS: SILVER SONIC (Mecha Sonic Mk. I)!
      const cycle = boss.attackTimer % 240;
      const target = ctx.players[0];
      const leftBound = boss.arenaLeft + 44;
      const rightBound = boss.arenaRight - 44;

      if (cycle < 70) {
        // Phase 1: High-Speed Roller-Skate Jet Dash across the chamber floor!
        const skateSpd = boss.hp <= 4 ? 5.2 : 4.1;
        boss.x += boss.facing * skateSpd;
        boss.y = boss.startY;
        boss.ballSwingAngle = 0;
        if (boss.x <= leftBound) {
          boss.x = leftBound;
          boss.facing = 1;
        } else if (boss.x >= rightBound) {
          boss.x = rightBound;
          boss.facing = -1;
        }
        if (boss.attackTimer % 4 === 0) {
          addParticle(
            ctx.particles,
            'sparkle',
            boss.x - boss.facing * 12,
            boss.y + 12,
            -boss.facing * 2.5,
            -0.8,
            '#F97316',
            5,
            12
          );
        }
      } else if (cycle < 120) {
        // Phase 2: Upright Targeting Stance (Vulnerable window!)
        boss.y = boss.startY;
        boss.ballSwingAngle = 0;
        if (target) {
          boss.facing = (target.x >= boss.x ? 1 : -1) as 1 | -1;
        }
        if (cycle === 95) {
          soundFX.playSpinDashRev(4);
        }
      } else if (cycle < 180) {
        // Phase 3: Razor-Sharp Sawblade Spindash Roll & Rebound!
        const rollSpd = boss.hp <= 4 ? 6.2 : 5.0;
        boss.x += boss.facing * rollSpd;
        boss.y = boss.startY - Math.abs(Math.sin((cycle - 120) * 0.15)) * 28;
        boss.ballSwingAngle += 0.45;
        if (boss.x <= leftBound) {
          boss.x = leftBound;
          boss.facing = 1;
          soundFX.playSpring(false);
        } else if (boss.x >= rightBound) {
          boss.x = rightBound;
          boss.facing = -1;
          soundFX.playSpring(false);
        }
      } else {
        // Phase 4: High Parabolic Leap & 6-Spike Dorsal Projectile Volley!
        const leapProgress = (cycle - 180) / 60;
        boss.x += boss.facing * 3.0;
        if (boss.x <= leftBound) {
          boss.x = leftBound;
          boss.facing = 1;
        } else if (boss.x >= rightBound) {
          boss.x = rightBound;
          boss.facing = -1;
        }
        boss.y = boss.startY - Math.sin(leapProgress * Math.PI) * 96;
        boss.ballSwingAngle += 0.35;

        // At apex of leap, fire 6 metallic dorsal spikes radially!
        if (cycle === 210 && target && Math.hypot(target.x - boss.x, target.y - boss.y) < 480) {
          soundFX.playSpinDashRelease();
          for (let s = 0; s < 6; s++) {
            const ang = (s / 6) * Math.PI * 2;
            ctx.projectiles.push({
              id: nextProjectileId++,
              x: boss.x,
              y: boss.y,
              vx: Math.cos(ang) * 4.8,
              vy: Math.sin(ang) * 4.8,
              color: '#38BDF8',
              radius: 6,
              life: 85,
            });
          }
        }
      }
    } else if (boss.bossType === 'deathegg') {
      // SONIC 2 FINAL BOSS: THE GIANT DEATH EGG ROBOT (AUTHENTIC 8-STAGE CYCLE)
      const target = ctx.players[0];
      const leftBound = boss.arenaLeft + 68;
      const rightBound = boss.arenaRight - 68;

      if (!boss.engaged) {
        // Wait at starting post until Sonic enters the hangar
        boss.x = boss.startX;
        boss.y = boss.startY;
        boss.facing = -1;
        boss.deatheggPhase = 'walk_forward';
        boss.phaseTimer = 0;
        boss.targetReticleActive = false;
        boss.armsLaunched = 0;
        boss.ballSwingAngle = 0;
        continue;
      }

      if (!boss.deatheggPhase) {
        boss.deatheggPhase = 'walk_forward';
        boss.phaseTimer = 0;
      }
      boss.phaseTimer = (boss.phaseTimer || 0) + 1;
      const pt = boss.phaseTimer;

      switch (boss.deatheggPhase) {
        case 'walk_forward': {
          // 1. Walks toward Sonic: Enormous 2.4x body moves forward while spiked arms swing in front of chest
          boss.targetReticleActive = false;
          boss.armsLaunched = 0;
          if (pt === 1 && target) {
            boss.facing = (target.x >= boss.x ? 1 : -1) as 1 | -1;
          }
          const walkSpd = boss.hp <= 12 ? 1.5 : 1.18;
          boss.x = Math.max(
            leftBound,
            Math.min(rightBound, boss.x + boss.facing * walkSpd)
          );
          boss.y = boss.startY + Math.abs(Math.sin(pt * 0.14)) * 5;
          boss.ballSwingAngle = Math.sin(pt * 0.14) * 0.55;

          // Heavy mechanical footstep thuds
          if (pt % 22 === 0) {
            addParticle(
              ctx.particles,
              'smoke',
              boss.x + boss.facing * 20,
              boss.startY + 42,
              -boss.facing * 1.5,
              -0.5,
              '#94A3B8',
              9,
              16
            );
          }

          if (pt >= 100) {
            boss.deatheggPhase = 'stop_pause';
            boss.phaseTimer = 0;
          }
          break;
        }

        case 'stop_pause': {
          // 2. Stops marching and lowers arms slightly (Start of narrow chest opening!)
          boss.y = boss.startY;
          boss.ballSwingAngle *= 0.8;
          if (pt >= 28) {
            boss.deatheggPhase = 'step_back_prep';
            boss.phaseTimer = 0;
          }
          break;
        }

        case 'step_back_prep': {
          // 3. Takes a small step backward & braces arms down/back before upward launch!
          // NARROW TIMING WINDOW: The front chest is briefly unguarded by the spiked hands!
          boss.x = Math.max(
            leftBound,
            Math.min(rightBound, boss.x - boss.facing * 0.9)
          );
          boss.y = boss.startY + (pt > 28 ? 4 : 0);
          boss.ballSwingAngle = -0.35;

          // Pre-ignition jetpack exhaust sparks
          if (pt % 4 === 0) {
            addParticle(
              ctx.particles,
              'sparkle',
              boss.x - boss.facing * 62,
              boss.y - 16,
              -boss.facing * 1.8,
              2.6,
              '#FACC15',
              7,
              14
            );
          }

          if (pt >= 46) {
            boss.deatheggPhase = 'launch_up';
            boss.phaseTimer = 0;
            soundFX.playSpinDashRelease();
          }
          break;
        }

        case 'launch_up': {
          // 4. Launches straight upward via jet propulsion completely off-screen!
          boss.y -= 18.0;
          boss.ballSwingAngle = -0.5;
          if (pt % 2 === 0) {
            addParticle(
              ctx.particles,
              'smoke',
              boss.x - boss.facing * 56,
              boss.y + 10,
              (Math.random() - 0.5) * 3.5,
              5.5,
              '#F97316',
              14,
              18
            );
          }
          if (boss.y <= boss.startY - 520) {
            boss.y = boss.startY - 520;
            boss.deatheggPhase = 'offscreen_targeting';
            boss.phaseTimer = 0;
            boss.targetReticleActive = true;
            boss.targetReticleLocked = false;
            boss.targetReticleX = target
              ? Math.max(leftBound, Math.min(rightBound, target.x))
              : boss.x;
            boss.targetReticleY = boss.startY + 8;
          }
          break;
        }

        case 'offscreen_targeting': {
          // 5. Boss is completely off-screen; Targeting Reticle follows Sonic WITHOUT DELAY!
          boss.y = boss.startY - 520;
          boss.targetReticleActive = true;
          boss.targetReticleY = boss.startY + 8;

          if (pt < 72) {
            // Reticle follows Sonic horizontally WITHOUT DELAY (instant 1:1 tracking!)
            boss.targetReticleLocked = false;
            if (target) {
              boss.targetReticleX = Math.max(
                leftBound,
                Math.min(rightBound, target.x)
              );
            }
          } else {
            // Brief lock alert right before descent so Sonic can step in front of or behind the drop point!
            if (!boss.targetReticleLocked) {
              boss.targetReticleLocked = true;
              soundFX.playSpinDashRev(6);
            }
          }

          if (pt >= 94) {
            boss.x = boss.targetReticleX ?? boss.x;
            boss.deatheggPhase = 'descend_land';
            boss.phaseTimer = 0;
          }
          break;
        }

        case 'descend_land': {
          // 6. Gigantic 2.4x robot falls straight onto the Targeting Reticle position!
          boss.x = boss.targetReticleX ?? boss.x;
          boss.y = Math.min(boss.startY, boss.y + 24);
          boss.targetReticleActive = true;
          boss.targetReticleLocked = true;

          if (boss.y >= boss.startY) {
            boss.y = boss.startY;
            boss.targetReticleActive = false;
            boss.targetReticleLocked = false;
            soundFX.playLavaBurn();

            for (let d = 0; d < 12; d++) {
              addParticle(
                ctx.particles,
                'brick_debris',
                boss.x + (Math.random() - 0.5) * 110,
                boss.startY + 42,
                (Math.random() - 0.5) * 7,
                -2.6 - Math.random() * 4.0,
                '#FACC15',
                8,
                24
              );
            }

            // 7. Landing position relative to Sonic determines the next attack!
            // Did the robot land IN FRONT of Sonic (facing Sonic), or BEHIND Sonic (Sonic is behind its back)?
            const landedInFrontOfSonic = target
              ? (target.x - boss.x) * boss.facing >= 0
              : true;

            if (landedInFrontOfSonic) {
              boss.deatheggPhase = 'fire_arms';
              boss.phaseTimer = 0;
              boss.armsLaunched = 0;
            } else {
              boss.deatheggPhase = 'deploy_bombs';
              boss.phaseTimer = 0;
              boss.armsLaunched = 0;
            }
          }
          break;
        }

        case 'fire_arms': {
          // 7A. Robot landed IN FRONT of Sonic:
          // Crouches/settles into position and launches its two giant 2.4x spiked hands toward Sonic!
          boss.y = boss.startY + (pt < 88 ? 4 : 0);
          boss.ballSwingAngle = 0;
          const baseOriginY = boss.y - 34;

          if (pt === 26) {
            // Fire Spiked Hand #1 (Upper Front Hand, 2.4x scale)
            boss.armsLaunched = 1;
            soundFX.playSpinDashRelease();
            ctx.projectiles.push({
              id: nextProjectileId++,
              kind: 'deathegg_claw',
              facing: boss.facing,
              x: boss.x + boss.facing * (32 * 2.4),
              y: baseOriginY - 4 * 2.4,
              vx: boss.facing * 6.4,
              vy: 0,
              color: '#FACC15',
              radius: 28,
              life: 105,
            });
          } else if (pt === 58) {
            // Fire Spiked Hand #2 (Lower Hand, 2.4x scale) — Both hands now detached, exposing chest to a jump!
            boss.armsLaunched = 2;
            soundFX.playSpinDashRelease();
            ctx.projectiles.push({
              id: nextProjectileId++,
              kind: 'deathegg_claw',
              facing: boss.facing,
              x: boss.x + boss.facing * (26 * 2.4),
              y: baseOriginY + 10 * 2.4,
              vx: boss.facing * 6.4,
              vy: 0,
              color: '#FACC15',
              radius: 28,
              life: 105,
            });
          } else if (pt === 96) {
            // Reload hands back onto forearms
            boss.armsLaunched = 0;
          }

          if (pt >= 112) {
            if (target) {
              boss.facing = (target.x >= boss.x ? 1 : -1) as 1 | -1;
            }
            boss.deatheggPhase = 'walk_forward';
            boss.phaseTimer = 0;
          }
          break;
        }

        case 'deploy_bombs': {
          // 7B. Robot landed BEHIND Sonic:
          // Deploys nasty pursuing bombs from its back that chase Sonic's position!
          boss.y = boss.startY + (pt < 75 ? 4 : 0);
          boss.ballSwingAngle = 0.15;
          const baseOriginY = boss.y - 34;

          if (pt === 20 || pt === 42 || pt === 64) {
            soundFX.playLavaBurn();
            const dirToSonic = target
              ? (target.x >= boss.x ? 1 : -1)
              : (-boss.facing as 1 | -1);
            const launchSpeed = pt === 20 ? 2.8 : pt === 42 ? 4.0 : 2.0;
            ctx.projectiles.push({
              id: nextProjectileId++,
              kind: 'deathegg_bomb',
              facing: dirToSonic as 1 | -1,
              x: boss.x - boss.facing * (22 * 2.4),
              y: baseOriginY - 10 * 2.4,
              vx: dirToSonic * launchSpeed,
              vy: -5.4,
              color: '#EF4444',
              radius: 11,
              life: 140,
            });
          }

          if (pt >= 104) {
            if (target) {
              boss.facing = (target.x >= boss.x ? 1 : -1) as 1 | -1;
            }
            boss.deatheggPhase = 'walk_forward';
            boss.phaseTimer = 0;
          }
          break;
        }
      }
    } else {
      // Standard Wrecking Ball Boss
      const swingRate = boss.hp <= 4 ? 0.068 : 0.048;
      boss.ballSwingAngle = Math.sin(boss.attackTimer * swingRate) * 1.25;

      // Hover horizontally & bob vertically
      const spd = boss.hp <= 4 ? 3.1 : 2.2;
      boss.x += boss.facing * spd;
      boss.y = boss.startY + Math.sin(boss.attackTimer * 0.05) * 18;

      if (Math.abs(boss.x - boss.startX) > 135) {
        boss.facing = (boss.x > boss.startX ? -1 : 1) as 1 | -1;
      }

      // Fire Egg Mobile Plasma Cannon every 70 frames
      if (boss.attackTimer % 70 === 0) {
        const target = ctx.players[0];
        if (target && Math.hypot(target.x - boss.x, target.y - boss.y) < 380) {
          const ang = Math.atan2(target.y - boss.y, target.x - boss.x);
          ctx.projectiles.push({
            id: nextProjectileId++,
            x: boss.x + boss.facing * 18,
            y: boss.y + 6,
            vx: Math.cos(ang) * 5.2,
            vy: Math.sin(ang) * 5.2,
            color: '#EF4444',
            radius: 6,
            life: 110,
          });
        }
      }
    }
  }

  // Update Enemy Projectiles
  for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
    const proj = ctx.projectiles[i];
    proj.x += proj.vx;
    proj.y += proj.vy;

    // Death Egg Robot Pursuing Bombs: bounce along floor and actively pursue Sonic!
    if (proj.kind === 'deathegg_bomb') {
      proj.vy += 0.22;
      const target = ctx.players[0];
      if (target) {
        const dirToSonic = Math.sign(target.x - proj.x);
        proj.vx = Math.max(-4.2, Math.min(4.2, proj.vx + dirToSonic * 0.16));
        proj.facing = (proj.vx >= 0 ? 1 : -1) as 1 | -1;
      }
      const ptx = Math.floor(proj.x / TILE_SIZE);
      const pty = Math.floor((proj.y + proj.radius) / TILE_SIZE);
      const hitT = getTileAt(ctx.grid, ptx, pty);
      if ((isSolidTile(hitT) || hitT === TileType.PLATFORM) && proj.vy > 0) {
        proj.y = pty * TILE_SIZE - proj.radius;
        proj.vy = -3.8; // Hop and pursue Sonic across the hangar floor!
        addParticle(
          ctx.particles,
          'sparkle',
          proj.x,
          proj.y + 6,
          -proj.vx * 0.4,
          -1.5,
          '#FACC15',
          5,
          12
        );
      }
      proj.life--;
      if (proj.life <= 0) {
        addParticle(ctx.particles, 'pop', proj.x, proj.y, 0, 0, '#EF4444', 18, 18);
        ctx.projectiles.splice(i, 1);
      }
      continue;
    }

    if (proj.color === '#F43F5E' || proj.color === '#FB923C') {
      proj.vy += 0.16;
    }
    // Marble Boss Magma Bomb OR Starlight Cyber Bomb erupts into twin spreading shockwaves when hitting a platform or ground!
    if (proj.color === '#F97316' || proj.color === '#0EA5E9') {
      const isCyberBomb = proj.color === '#0EA5E9';
      const ptx = Math.floor(proj.x / TILE_SIZE);
      const pty = Math.floor((proj.y + 6) / TILE_SIZE);
      const hitT = getTileAt(ctx.grid, ptx, pty);
      if (isSolidTile(hitT) || hitT === TileType.PLATFORM) {
        const surfaceY = pty * TILE_SIZE - 6;
        ctx.projectiles.splice(i, 1);
        ctx.projectiles.push(
          {
            id: nextProjectileId++,
            x: proj.x - 8,
            y: surfaceY,
            vx: isCyberBomb ? -4.2 : -3.2,
            vy: 0,
            color: isCyberBomb ? '#38BDF8' : '#EA580C',
            radius: 7,
            life: 40,
          },
          {
            id: nextProjectileId++,
            x: proj.x + 8,
            y: surfaceY,
            vx: isCyberBomb ? 4.2 : 3.2,
            vy: 0,
            color: isCyberBomb ? '#38BDF8' : '#EA580C',
            radius: 7,
            life: 40,
          }
        );
        for (let f = 0; f < 6; f++) {
          addParticle(
            ctx.particles,
            'sparkle',
            proj.x + (Math.random() - 0.5) * 20,
            surfaceY,
            (Math.random() - 0.5) * 4,
            -1.5 - Math.random() * 2.5,
            isCyberBomb ? '#EC4899' : '#FACC15',
            6,
            18
          );
        }
        continue;
      }
    }
    proj.life--;
    if (proj.life <= 0) {
      ctx.projectiles.splice(i, 1);
    }
  }

  // Update Scattered Rings
  for (let i = ctx.scatteredRings.length - 1; i >= 0; i--) {
    const r = ctx.scatteredRings[i];
    r.x += r.vx;
    r.y += r.vy;
    r.vy += 0.28;
    r.timer--;

    const tx = Math.floor(r.x / TILE_SIZE);
    const ty = Math.floor((r.y + 8) / TILE_SIZE);
    if (isSolidTile(getTileAt(ctx.grid, tx, ty)) && r.vy > 0) {
      r.y = ty * TILE_SIZE - 8;
      r.vy = -r.vy * 0.72;
    }

    if (r.timer <= 0) {
      ctx.scatteredRings.splice(i, 1);
    }
  }

  // Update Particles
  for (let i = ctx.particles.length - 1; i >= 0; i--) {
    const p = ctx.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.type === 'brick_debris') p.vy += 0.32;
    p.life--;
    if (p.life <= 0) {
      ctx.particles.splice(i, 1);
    }
  }
}

function updateCamera(
  player: PlayerEntity,
  input: ControlInputState,
  level: LevelData,
  bosses: ActiveBoss[]
) {
  // Check if player is inside an active, engaged Boss Arena!
  const lockedBoss = bosses.find(
    (b) =>
      b.alive &&
      b.engaged &&
      player.x >= b.arenaLeft - 32 &&
      player.x <= b.arenaRight + 32
  );

  if (lockedBoss) {
    // Lock camera centered on the Boss Arena (for wide Death Egg chambers, follow player X within the locked chamber bounds!)
    const arenaWidth = lockedBoss.arenaRight - lockedBoss.arenaLeft;
    const lockX =
      arenaWidth > 620
        ? Math.max(
            lockedBoss.arenaLeft + 240,
            Math.min(lockedBoss.arenaRight - 240, player.x)
          )
        : (lockedBoss.arenaLeft + lockedBoss.arenaRight) / 2;
    const lockY =
      lockedBoss.bossType === 'deathegg'
        ? lockedBoss.startY - 76
        : lockedBoss.bossType === 'silversonic'
        ? lockedBoss.startY - 36
        : lockedBoss.startY + 24;
    player.camX += (lockX - player.camX) * 0.18;
    player.camY += (lockY - player.camY) * 0.18;
    return;
  }

  if (player.state === 'lookup' && input.up) {
    player.camLookOffsetY = Math.max(-72, player.camLookOffsetY - 2.5);
  } else if (player.state === 'crouch' && input.down) {
    player.camLookOffsetY = Math.min(72, player.camLookOffsetY + 2.5);
  } else {
    player.camLookOffsetY *= 0.85;
  }

  const targetX = player.x + player.facing * 42 + player.vx * 5;
  const targetY = player.y + player.camLookOffsetY;

  player.camX += (targetX - player.camX) * 0.14;
  player.camY += (targetY - player.camY) * 0.14;

  const maxW = level.width * TILE_SIZE;
  const maxH = level.height * TILE_SIZE;
  player.camX = Math.max(160, Math.min(maxW - 160, player.camX));
  player.camY = Math.max(120, Math.min(maxH - 120, player.camY));
}
