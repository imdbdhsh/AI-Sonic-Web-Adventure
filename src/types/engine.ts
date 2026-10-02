export type CharacterId = 'sonic' | 'tails' | 'knuckles' | 'mighty' | 'ray';

export type MultiplayerMode = 'solo_ai' | 'coop_shared' | 'coop_split' | 'versus_split';

export type SplitOrientation = 'horizontal' | 'vertical';

export type SpecialStageType = 'sonic1' | 'sonic3';

export type ShieldType = 'none' | 'blue' | 'flame' | 'lightning' | 'bubble';

export interface CharacterPhysicsSpec {
  id: CharacterId;
  name: string;
  fullName: string;
  superName: string;
  hyperName: string;
  tagline: string;
  abilityName: string;
  abilityDetails: string;
  acc: number;
  dec: number;
  frc: number;
  topSpeed: number;
  jumpForce: number;
  gravity: number;
  airAcc: number;
  rollFrc: number;
  rollDec: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  eyeColor: string;
  superColor: string;
}

export enum TileType {
  EMPTY = 0,
  GROUND_TOP = 1,
  GROUND_DEEP = 2,
  SLOPE_UP_LOW = 3,      // 0px -> 16px rise (gentle 26.5° slope part 1)
  SLOPE_UP_HIGH = 4,     // 16px -> 32px rise (gentle 26.5° slope part 2)
  SLOPE_DOWN_HIGH = 5,   // 32px -> 16px drop
  SLOPE_DOWN_LOW = 6,    // 16px -> 0px drop
  PLATFORM = 7,          // One-way cloud/girder platform
  SPIKES_UP = 8,         // Lethal spikes on top, solid block on left/right/bottom
  SPRING_YELLOW = 9,     // Medium vertical bounce (10.5)
  SPRING_RED = 10,       // High vertical bounce (15.2)
  RING = 11,             // Collectible Golden Ring
  MONITOR_RING = 12,     // +10 Rings Monitor
  MONITOR_SPEED = 13,    // Speed Shoes Monitor
  MONITOR_SHIELD = 14,   // Classic Blue Barrier Monitor
  CHECKPOINT = 15,       // Star Post Checkpoint
  GOAL_POST = 16,        // Act Clear Signpost (Requires Boss Defeat if Boss exists)
  BREAKABLE_ROCK = 17,   // Breakable Wall (Dirt-textured, smashable by Roll/Dash/Knuckles)
  BOOSTER_RIGHT = 18,    // Floor Dash Pad (->)
  BOOSTER_LEFT = 19,     // Floor Dash Pad (<-)
  SPRING_RIGHT = 20,     // Horizontal Spring (->)
  SPRING_LEFT = 21,      // Horizontal Spring (<-)
  SPAWN_P1 = 22,         // Player 1 Spawn Marker
  SPAWN_P2 = 23,         // Player 2 Spawn Marker
  BADNIK_MOTOBUG = 24,   // Patrol & Charge Ground Badnik
  BADNIK_BUZZ = 25,      // Aerial Swoop & Projectile Badnik
  BADNIK_CRAB = 26,      // Twin Plasma-Firing Crabmeat Badnik
  SLOPE_45_UP = 27,      // Steep 45° Slope Up (0 -> 32)
  SLOPE_45_DOWN = 28,    // Steep 45° Slope Down (32 -> 0)
  LOOP_HEAD = 29,        // 360° Full Loop-de-Loop Anchor (6x6 Tiles / 192x192px)
  MONITOR_FLAME = 30,    // Flame Shield Monitor (Fire Dash + Lava Immunity)
  MONITOR_LIGHTNING = 31,// Lightning Shield Monitor (Double Jump + Ring Magnet)
  MONITOR_BUBBLE = 32,   // Bubble Shield Monitor (High Bounce Attack)
  MONITOR_INVINCIBILITY = 33, // Invincibility Stars Monitor
  MONITOR_EGGMAN = 34,   // Eggman Trap Monitor (Damages Player)
  MONITOR_SWAP = 35,     // Teleport Swap Monitor (Swaps P1 & P2 Positions)
  MONITOR_SUPER = 36,    // Super "S" Monitor (Editor-exclusive instant Super/Hyper Form + 50 Rings)
  GIANT_RING = 37,       // Hidden Giant Special Stage Warp Ring (One-time use per Zone)
  BOSS_EGGMAN = 38,      // Zone Boss: Dr. Eggman Wrecking Ball & Plasma Pod
  LAVA = 39,             // Marble Zone Molten Lava Hazard (Flame Shield / Super / Hyper immune)
  BOSS_MARBLE = 40,      // Unique Marble Zone Boss: Dr. Eggman Magma Flamethrower & Fire Dropper
  // Zone-Specific Interactive Gimmicks
  GIMMICK_BUMPER = 41,           // Emerald Mountains: 360° Pinball Star Bumper
  GIMMICK_DASH_RING = 42,        // Emerald Mountains: Mid-Air Rainbow Dash Ring
  GIMMICK_CRUSHER = 43,          // Marble Zone: Stomping Marble Crusher Pillar
  GIMMICK_LAVA_GEYSER = 44,      // Marble Zone: Erupting Magma Plume Spawner
  GIMMICK_LAVA_SHOOTER_LEFT = 45,// Neo Starlight: Wall Lava Shooter (Fires Fireballs Left <-)
  GIMMICK_LAVA_SHOOTER_RIGHT = 46,// Neo Starlight: Wall Lava Shooter (Fires Fireballs Right ->)
  GIMMICK_CONVEYOR_RIGHT = 47,   // Neo Starlight: Neon Conveyor Belt (->)
  GIMMICK_CONVEYOR_LEFT = 48,    // Neo Starlight: Neon Conveyor Belt (<-)
  GIMMICK_UPDRAFT = 49,          // Hill Top Peaks: Alpine Wind Updraft Fan
  GIMMICK_TELEPORT_ORB = 50,     // Hill Top Peaks: High-Altitude Cloud Cannon
  // Zone-Specific Badnik Enemies & Scenic Decorations
  BADNIK_CHOPPER = 51,           // Emerald Mountains Act 2 Exclusive: Leaping Chopper Piranha
  BADNIK_CATERKILLER = 53,       // Marble Zone: Undulating Spiked Caterkiller (Damages like spikes if jumped on!)
  BADNIK_BATBRAIN = 54,          // Marble Zone: Swooping Cavern Batbrain
  BADNIK_ORBINAUT = 55,          // Neo Starlight: Orbiting Spike-Mine Orbinaut (Damages like spikes if jumped on!)
  BADNIK_BOMB = 56,              // Neo Starlight: Proximity Shrapnel Walking Bomb
  BADNIK_SPINY = 57,             // Hill Top Peaks: Twin Plasma-Mortar Spiny
  DECO_WATERFALL = 59,           // Emerald Mountains Act 2: Cascading Waterfall Decoration
  BOSS_STARLIGHT = 60,           // Unique Neo Starlight Boss: Dr. Eggman Cyber Spike-Mine & Laser Pod
  BOSS_HILLTOP = 61,             // Unique Hill Top Peaks Boss: Dr. Eggman Volcanic Pyro-Sub & Solar Cannon
  BOSS_SILVER_SONIC = 62,        // Sonic 2 Death Egg Sub-Boss: Silver Sonic (Mecha Sonic Mk. I)
  BOSS_DEATH_EGG_ROBOT = 63,     // Sonic 2 Death Egg Final Boss: Giant Death Egg Robot
  // 10 Custom Editable Blank White Blocks (Textures customizable in Tileset Studio!)
  CUSTOM_BLOCK_1 = 64,
  CUSTOM_BLOCK_2 = 65,
  CUSTOM_BLOCK_3 = 66,
  CUSTOM_BLOCK_4 = 67,
  CUSTOM_BLOCK_5 = 68,
  CUSTOM_BLOCK_6 = 69,
  CUSTOM_BLOCK_7 = 70,
  CUSTOM_BLOCK_8 = 71,
  CUSTOM_BLOCK_9 = 72,
  CUSTOM_BLOCK_10 = 73,
  // 3-Block-Tall One-Way Door (Passable once, then locks into a solid wall!)
  ONE_WAY_DOOR = 74,
  ONE_WAY_DOOR_LOCKED = 75,
  // Pass-through Background Tiles (Render behind foreground tiles, entities & players!)
  BG_BRICK = 76,
  BG_PILLAR = 77,
  BG_WINDOW = 78,
  BG_LATTICE = 79,
  BG_FOLIAGE = 80,
  // Dynamic Moving & Swinging Platforms + 1-UP Extra Life Monitor
  MOVING_PLATFORM = 81,
  SWINGING_PLATFORM = 82,
  MOVING_PLATFORM_VERT = 83,
  MONITOR_1UP = 84,
  // Chemical Plant Zone & Mystic Caverns Zone Tiles
  SPIKES_DOWN = 85,          // Ceiling Spikes (Lethal from below, solid plate on top)
  GIMMICK_STALACTITE = 86,   // Mystic Caverns: Falling Rock Stalactite (Detaches under players)
  GIMMICK_ACID_POOL = 87,    // Chemical Plant: Boiling Toxic Blue Chemical Pool (Non-shielded take damage)
  GIMMICK_STEAM_VENT = 88,   // Chemical Plant: Periodic Steam Vent (Launches players skyward)
  GIMMICK_TUBE_ENTRY = 89,   // Chemical Plant: Travel Tube Entrance (Fall in from above)
  GIMMICK_TUBE_EXIT = 90,    // Chemical Plant: Travel Tube Exit (Launches players out)
  BOSS_CHEMICAL = 91,        // Chemical Plant Act 2 Boss: Hydraulic Slime-Crusher & Siphon Mech
  BOSS_MYSTIC = 92,          // Mystic Caverns Act 2 Boss: Egg Drill-Crusher
}

export enum SpecialTileType {
  EMPTY = 0,
  WALL_BLUE = 1,
  WALL_YELLOW = 2,
  WALL_PINK = 3,
  BUMPER = 4,
  GOAL_EXIT = 5,
  REVERSE_ROT = 6,
  SPEED_UP = 7,
  RING = 8,
  GEM_BREAKABLE = 9,
  CHAOS_EMERALD = 10,
  PLAYER_START = 11,
  BLUE_SPHERE = 12,
  RED_SPHERE = 13,
  BUMPER_SPHERE = 14,
  YELLOW_SPRING_SPHERE = 15,
}

export interface SpecialStageData {
  stageNumber: number; // 1 to 7
  name: string;
  emeraldName: string;
  emeraldColor: string;
  // Sonic 1 Rotating 2D Maze Grid (18x18)
  s1Width: number;
  s1Height: number;
  s1Grid: number[][];
  // Sonic 3 "Get Blue Spheres" 3D Planetary Grid (16x16)
  s3Size: number;
  s3Grid: number[][];
}

export interface TilesetPalette {
  skyTop: string;
  skyBottom: string;
  mountainFar: string;
  hillNear: string;
  waterColor: string;
  surfaceTop: string;
  surfaceHighlight: string;
  soilPrimary: string;
  soilSecondary: string;
  platformTop: string;
  brickColor: string;
  brickMortar: string;
  hazardColor: string;
}

export type CoreEditableTextureKey =
  | 'groundTop'
  | 'groundDeep'
  | 'platform'
  | 'breakableRock';

export type EditableTextureKey =
  | CoreEditableTextureKey
  | 'slopeUpLow'
  | 'slopeUpHigh'
  | 'slopeDownHigh'
  | 'slopeDownLow'
  | 'slope45Up'
  | 'slope45Down'
  | 'decoWaterfall'
  | 'spikes'
  | 'lava'
  | 'springYellow'
  | 'springRed'
  | 'springRight'
  | 'springLeft'
  | 'boosterRight'
  | 'boosterLeft'
  | 'ceilingSpikes'
  | 'stalactite'
  | 'acidPool'
  | 'steamVent'
  | 'tubeEntry'
  | 'tubeExit'
  | 'bossChemical'
  | 'bossMystic'
  | 'bumper'
  | 'dashRing'
  | 'crusher'
  | 'lavaGeyser'
  | 'lavaShooterLeft'
  | 'lavaShooterRight'
  | 'conveyorRight'
  | 'conveyorLeft'
  | 'updraft'
  | 'teleportOrb'
  | 'ring'
  | 'giantRing'
  | 'monitorRing'
  | 'monitorSpeed'
  | 'monitorShield'
  | 'monitorFlame'
  | 'monitorLightning'
  | 'monitorBubble'
  | 'monitorInvincibility'
  | 'monitorEggman'
  | 'monitorSwap'
  | 'monitorSuper'
  | 'checkpoint'
  | 'goalPost'
  | 'customBlock1'
  | 'customBlock2'
  | 'customBlock3'
  | 'customBlock4'
  | 'customBlock5'
  | 'customBlock6'
  | 'customBlock7'
  | 'customBlock8'
  | 'customBlock9'
  | 'customBlock10'
  | 'oneWayDoor'
  | 'oneWayDoorLocked'
  | 'bgBrick'
  | 'bgPillar'
  | 'bgWindow'
  | 'bgLattice'
  | 'bgFoliage'
  | 'movingPlatform'
  | 'swingingPlatform'
  | 'movingPlatformVert'
  | 'monitor1up';

export type CustomPixelMatrix = Record<CoreEditableTextureKey, string[][]> &
  Partial<Record<EditableTextureKey, string[][]>>;

export interface TilesetConfig {
  id: string;
  name: string;
  zoneSubtitle: string;
  decorStyle:
    | 'palms'
    | 'chemical'
    | 'chemicalplant'
    | 'cave'
    | 'marble'
    | 'sanctuary'
    | 'deathegg';
  palette: TilesetPalette;
  customPixels?: CustomPixelMatrix;
  uploadedSheetDataUrl?: string;
  isCustom?: boolean;
  uploadedTileMapping?: {
    groundTopCol: number;
    groundTopRow: number;
    groundDeepCol: number;
    groundDeepRow: number;
    platformCol?: number;
    platformRow?: number;
    breakableCol?: number;
    breakableRow?: number;
    breakableRockCol?: number;
    breakableRockRow?: number;
    tilePixelSize: number;
  };
}

export interface LevelData {
  id: string;
  name: string;
  act: number;
  author: string;
  width: number;  // In 32x32 tiles
  height: number; // In 32x32 tiles
  tilesetId: string;
  grid: number[][]; // [row][col] Foreground layer
  bgGrid?: number[][]; // [row][col] Background layer (renders behind foreground & players!)
  p1Spawn: { x: number; y: number };
  p2Spawn: { x: number; y: number };
}

export interface LevelCheckpointSession {
  levelId: string;
  checkpointX: number; // World pixel X of newest checkpoint
  checkpointY: number; // World pixel Y of newest checkpoint
  collectedGiantRings: string[]; // Array of "col,row" coordinates already collected
  savedRings: number;
  savedScore: number;
  elapsedMs: number;
}

export type PlayerActionState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'dash'
  | 'jump'
  | 'roll'
  | 'crouch'
  | 'lookup'
  | 'spindash'
  | 'peelout'
  | 'dropdash_ready'
  | 'fly'
  | 'fly_tired'
  | 'glide'
  | 'climb'
  | 'hammer_drop'
  | 'ray_glide'
  | 'spring'
  | 'hurt'
  | 'victory';

export interface PlayerEntity {
  id: 1 | 2;
  character: CharacterId;
  isAI: boolean;
  isSuper: boolean;
  isHyper: boolean;
  superRingTimer: number;
  hyperFlashUsed: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gsp: number;
  groundAngle: number;
  onGround: boolean;
  facing: 1 | -1;
  state: PlayerActionState;
  spindashRev: number;
  peeloutCharge: number;
  dropdashTimer: number;
  flyStamina: number;
  flyBoostCooldown: number;
  shieldActionUsed: boolean;
  rings: number;
  score: number;
  shield: ShieldType;
  speedShoesTimer: number;
  invincibleTimer: number;
  hurtTimer: number;
  checkpointX: number;
  checkpointY: number;
  finishedTimeMs: number | null;
  enteredGiantRing: boolean;
  collectedGiantRingKey: string | null;
  animTimer: number;
  animFrame: number;
  inLoop: boolean;
  loopCenterX: number;
  loopCenterY: number;
  loopRadius: number;
  loopAngle: number;
  loopDir: 1 | -1;
  loopCooldown: number;
  // Chemical Plant Travel Tube state (set while riding a tube network)
  tubeTravel?: TubeTravelState | null;
  tubeCooldown?: number;
  camX: number;
  camY: number;
  camLookOffsetY: number;
  inputQueue: ControlInputState[];
  forcedCutsceneRun?: boolean;
  // Lives & 1-UP Tracking (Start with 3; +1 per 100 rings or 1-UP monitor; Game Over resets campaign & Chaos Emeralds)
  lives: number;
  nextExtraLifeRingThreshold: number;
  livesDeltaThisFrame?: number;
  gameOverTriggered?: boolean;
  // Redone 360° Loop-de-Loop state & Ray swoop pitch
  loopProgress?: number;
  raySwoopPitch?: number;
}

export interface TubeTravelState {
  // Poly-line route through the tube network (world pixel coordinates)
  points: Array<{ x: number; y: number }>;
  segment: number;       // Current segment index
  speed: number;         // Travel speed in px/frame
  exitVx: number;        // Launch velocity once the ride finishes
  exitVy: number;
  entryX: number;
  entryY: number;
}

export type MechHazardKind =
  | 'stalactite'
  | 'debris'
  | 'shockwave'
  | 'steam'
  | 'steam_burst';

export interface ActiveHazard {
  id: number;
  kind: MechHazardKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  damaging: boolean;
  color: string;
  facing?: 1 | -1;
}

export interface DynamicPlatform {
  col: number;
  row: number;
  type: TileType.MOVING_PLATFORM | TileType.SWINGING_PLATFORM | TileType.MOVING_PLATFORM_VERT;
  x: number; // Center X of platform deck
  y: number; // Top Y of platform deck
  prevX: number;
  prevY: number;
  width: number;
  height: number;
  pivotX: number;
  pivotY: number;
  angle: number;
}

export type BadnikTileType =
  | TileType.BADNIK_MOTOBUG
  | TileType.BADNIK_BUZZ
  | TileType.BADNIK_CRAB
  | TileType.BADNIK_CHOPPER
  | TileType.BADNIK_CATERKILLER
  | TileType.BADNIK_BATBRAIN
  | TileType.BADNIK_ORBINAUT
  | TileType.BADNIK_BOMB
  | TileType.BADNIK_SPINY;

export interface ActiveBadnik {
  id: string;
  type: BadnikTileType;
  x: number;
  y: number;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  alive: boolean;
  timer: number;
  attackCooldown: number;
  isCharging?: boolean;
}

export type DeathEggPhase =
  | 'walk_forward'
  | 'stop_pause'
  | 'step_back_prep'
  | 'launch_up'
  | 'offscreen_targeting'
  | 'descend_land'
  | 'fire_arms'
  | 'deploy_bombs';

export type MechBossPhase =
  // Hydraulic Slime-Crusher & Siphon Mech (Chemical Plant Act 2)
  | 'mech_advance'
  | 'piston_stomp'
  | 'chemical_flood'
  | 'siphon_vortex'
  | 'overheat_venting'
  // Egg Drill-Crusher (Mystic Caverns Act 2)
  | 'drill_rev'
  | 'drill_charge'
  | 'wall_crash_stun'
  | 'ceiling_burrow'
  | 'ground_slam';

export interface ActiveBoss {
  id: string;
  bossType:
    | 'eggman'
    | 'marble'
    | 'starlight'
    | 'hilltop'
    | 'chemical'
    | 'mystic'
    | 'silversonic'
    | 'deathegg';
  x: number;
  y: number;
  startX: number;
  startY: number;
  arenaLeft: number;
  arenaRight: number;
  engaged: boolean;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  invulnTimer: number;
  ballSwingAngle: number;
  attackTimer: number;
  alive: boolean;
  deatheggPhase?: DeathEggPhase;
  phaseTimer?: number;
  targetReticleActive?: boolean;
  targetReticleX?: number;
  targetReticleY?: number;
  targetReticleLocked?: boolean;
  armsLaunched?: 0 | 1 | 2;
  // ===== Hydraulic Slime-Crusher & Siphon Mech / Egg Drill-Crusher shared state =====
  mechPhase?: MechBossPhase;
  mechTimer?: number;        // Frame counter inside the current mech phase
  mechFloorY?: number;       // World Y of the arena floor (top surface)
  mechCeilingY?: number;     // World Y of the burrowable ceiling underside
  mechVulnerable?: boolean;  // True while the cooling dome / cockpit is open
  overheatFrames?: number;   // 120-frame steam venting window (Chemical Plant boss)
  floodLevel?: number;       // 0..1 Chemical Flood height inside the arena
  vortexActive?: boolean;    // Siphon intake turbine currently pulling players inward
  vortexStrength?: number;   // 0..1 ramp for the siphon pull
  stunFrames?: number;       // 115-frame wall-crash stun (Drill-Crusher)
  drillSpinning?: boolean;
  ceilingBurrow?: boolean;
  slamLanded?: boolean;      // Ground-slam impact already resolved this phase
}

export interface BadnikProjectile {
  id?: number;
  kind?: 'standard' | 'deathegg_claw' | 'deathegg_bomb';
  facing?: 1 | -1;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
}

export interface ScatteredRing {
  id?: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  timer: number;
}

export interface ParticleFX {
  id: number;
  type: 'sparkle' | 'smoke' | 'pop' | 'brick_debris' | 'score_popup';
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  text?: string;
}

export interface ControlInputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jumpHeld: boolean;
  jumpJustPressed: boolean;
  specialHeld: boolean;
  specialJustPressed: boolean;
}

export type PitchCurveType = 'linear' | 'exponential' | 'vibrato' | 'arp_step';

export interface SfxPatch {
  name: string;
  category?: string;
  wave: OscillatorType;
  baseFreq: number;
  endFreq: number;
  durationMs: number;
  volume: number;
  attackMs: number;
  decayMs?: number;
  pitchCurve: PitchCurveType;
  fmDepth: number;
  fmRate: number;
  fmModRatio?: number;
  fmModDepth?: number;
  noiseMix: number;
  arpSemitones?: number;
}

export interface CustomStagePackage {
  packageFormat: 'sonic_velocity_custom_stage_v1';
  exportedAt: string;
  level: LevelData;
  activeTileset: TilesetConfig;
  tilesets: TilesetConfig[];
  audio: {
    sfxPatches: Record<string, SfxPatch>;
  };
}

