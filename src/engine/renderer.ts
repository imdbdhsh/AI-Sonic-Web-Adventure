import { CHARACTER_SPECS } from '../data/presets';
import {
  ActiveBadnik,
  ActiveBoss,
  ActiveHazard,
  BadnikProjectile,
  EditableTextureKey,
  LevelData,
  ParticleFX,
  PlayerEntity,
  ScatteredRing,
  TilesetConfig,
  TileType,
} from '../types/engine';
import {
  getDynamicPlatformState,
  isBackgroundTile,
  TILE_SIZE,
} from './physicsEngine';

const tileCanvasCache = new Map<string, Record<string, HTMLCanvasElement>>();
const uploadedImageCache = new Map<string, HTMLImageElement>();

const TILE_TO_TEXTURE_KEY: Partial<Record<TileType, EditableTextureKey>> = {
  [TileType.GROUND_TOP]: 'groundTop',
  [TileType.GROUND_DEEP]: 'groundDeep',
  [TileType.PLATFORM]: 'platform',
  [TileType.BREAKABLE_ROCK]: 'breakableRock',
  [TileType.SLOPE_UP_LOW]: 'slopeUpLow',
  [TileType.SLOPE_UP_HIGH]: 'slopeUpHigh',
  [TileType.SLOPE_DOWN_HIGH]: 'slopeDownHigh',
  [TileType.SLOPE_DOWN_LOW]: 'slopeDownLow',
  [TileType.SLOPE_45_UP]: 'slope45Up',
  [TileType.SLOPE_45_DOWN]: 'slope45Down',
  [TileType.DECO_WATERFALL]: 'decoWaterfall',
  [TileType.SPIKES_UP]: 'spikes',
  [TileType.LAVA]: 'lava',
  [TileType.SPRING_YELLOW]: 'springYellow',
  [TileType.SPRING_RED]: 'springRed',
  [TileType.SPRING_RIGHT]: 'springRight',
  [TileType.SPRING_LEFT]: 'springLeft',
  [TileType.BOOSTER_RIGHT]: 'boosterRight',
  [TileType.BOOSTER_LEFT]: 'boosterLeft',
  [TileType.GIMMICK_BUMPER]: 'bumper',
  [TileType.GIMMICK_DASH_RING]: 'dashRing',
  [TileType.GIMMICK_CRUSHER]: 'crusher',
  [TileType.GIMMICK_LAVA_GEYSER]: 'lavaGeyser',
  [TileType.GIMMICK_LAVA_SHOOTER_LEFT]: 'lavaShooterLeft',
  [TileType.GIMMICK_LAVA_SHOOTER_RIGHT]: 'lavaShooterRight',
  [TileType.GIMMICK_CONVEYOR_RIGHT]: 'conveyorRight',
  [TileType.GIMMICK_CONVEYOR_LEFT]: 'conveyorLeft',
  [TileType.GIMMICK_UPDRAFT]: 'updraft',
  [TileType.GIMMICK_TELEPORT_ORB]: 'teleportOrb',
  [TileType.SPIKES_DOWN]: 'ceilingSpikes',
  [TileType.GIMMICK_STALACTITE]: 'stalactite',
  [TileType.GIMMICK_ACID_POOL]: 'acidPool',
  [TileType.GIMMICK_STEAM_VENT]: 'steamVent',
  [TileType.GIMMICK_TUBE_ENTRY]: 'tubeEntry',
  [TileType.GIMMICK_TUBE_EXIT]: 'tubeExit',
  [TileType.RING]: 'ring',
  [TileType.GIANT_RING]: 'giantRing',
  [TileType.MONITOR_RING]: 'monitorRing',
  [TileType.MONITOR_SPEED]: 'monitorSpeed',
  [TileType.MONITOR_SHIELD]: 'monitorShield',
  [TileType.MONITOR_FLAME]: 'monitorFlame',
  [TileType.MONITOR_LIGHTNING]: 'monitorLightning',
  [TileType.MONITOR_BUBBLE]: 'monitorBubble',
  [TileType.MONITOR_INVINCIBILITY]: 'monitorInvincibility',
  [TileType.MONITOR_EGGMAN]: 'monitorEggman',
  [TileType.MONITOR_SWAP]: 'monitorSwap',
  [TileType.MONITOR_SUPER]: 'monitorSuper',
  [TileType.CHECKPOINT]: 'checkpoint',
  [TileType.GOAL_POST]: 'goalPost',
  [TileType.CUSTOM_BLOCK_1]: 'customBlock1',
  [TileType.CUSTOM_BLOCK_2]: 'customBlock2',
  [TileType.CUSTOM_BLOCK_3]: 'customBlock3',
  [TileType.CUSTOM_BLOCK_4]: 'customBlock4',
  [TileType.CUSTOM_BLOCK_5]: 'customBlock5',
  [TileType.CUSTOM_BLOCK_6]: 'customBlock6',
  [TileType.CUSTOM_BLOCK_7]: 'customBlock7',
  [TileType.CUSTOM_BLOCK_8]: 'customBlock8',
  [TileType.CUSTOM_BLOCK_9]: 'customBlock9',
  [TileType.CUSTOM_BLOCK_10]: 'customBlock10',
  [TileType.ONE_WAY_DOOR]: 'oneWayDoor',
  [TileType.ONE_WAY_DOOR_LOCKED]: 'oneWayDoorLocked',
  [TileType.BG_BRICK]: 'bgBrick',
  [TileType.BG_PILLAR]: 'bgPillar',
  [TileType.BG_WINDOW]: 'bgWindow',
  [TileType.BG_LATTICE]: 'bgLattice',
  [TileType.BG_FOLIAGE]: 'bgFoliage',
  [TileType.MOVING_PLATFORM]: 'movingPlatform',
  [TileType.SWINGING_PLATFORM]: 'swingingPlatform',
  [TileType.MOVING_PLATFORM_VERT]: 'movingPlatformVert',
  [TileType.MONITOR_1UP]: 'monitor1up',
};

export function invalidateTilesetCache(tilesetId?: string) {
  if (tilesetId) {
    tileCanvasCache.delete(tilesetId);
  } else {
    tileCanvasCache.clear();
  }
}

function getOrBuildTileTextures(tileset: TilesetConfig): Record<string, HTMLCanvasElement> {
  const cached = tileCanvasCache.get(tileset.id);
  if (cached) return cached;

  const result: Record<string, HTMLCanvasElement> = {};
  const pixels = tileset.customPixels;

  if (pixels) {
    (Object.keys(pixels) as EditableTextureKey[]).forEach((key) => {
      const matrix = pixels[key];
      if (!matrix || !Array.isArray(matrix)) return;
      const c = document.createElement('canvas');
      c.width = TILE_SIZE;
      c.height = TILE_SIZE;
      const g = c.getContext('2d');
      if (g) {
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const hex = matrix[y]?.[x];
            if (hex) {
              g.fillStyle = hex;
              g.fillRect(x * 2, y * 2, 2, 2);
            }
          }
        }
      }
      result[key] = c;
    });
  }

  // Ensure all 10 Custom Blocks have at least a default blank white 32x32 canvas
  for (let i = 1; i <= 10; i++) {
    const key = `customBlock${i}`;
    if (!result[key]) {
      const c = document.createElement('canvas');
      c.width = TILE_SIZE;
      c.height = TILE_SIZE;
      const g = c.getContext('2d');
      if (g) {
        g.fillStyle = '#FFFFFF';
        g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      }
      result[key] = c;
    }
  }

  tileCanvasCache.set(tileset.id, result);
  return result;
}

function getUploadedSheetImage(dataUrl?: string): HTMLImageElement | null {
  if (!dataUrl) return null;
  let img = uploadedImageCache.get(dataUrl);
  if (!img) {
    img = new Image();
    img.src = dataUrl;
    uploadedImageCache.set(dataUrl, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

export function renderViewport(
  ctx: CanvasRenderingContext2D,
  viewWidth: number,
  viewHeight: number,
  camCenterX: number,
  camCenterY: number,
  level: LevelData,
  workingGrid: number[][],
  tileset: TilesetConfig,
  players: PlayerEntity[],
  badniks: ActiveBadnik[],
  bosses: ActiveBoss[],
  projectiles: BadnikProjectile[],
  scatteredRings: ScatteredRing[],
  particles: ParticleFX[],
  globalTick: number,
  showEditorGrid: boolean = false,
  hazards: ActiveHazard[] = []
) {
  ctx.save();

  // 1. Parallax Sky & Horizon
  const skyGrad = ctx.createLinearGradient(0, 0, 0, viewHeight);
  skyGrad.addColorStop(0, tileset.palette.skyTop);
  skyGrad.addColorStop(0.75, tileset.palette.skyBottom);
  skyGrad.addColorStop(1, tileset.palette.waterColor);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  if (tileset.decorStyle === 'deathegg') {
    // Sonic 2 Death Egg Zone Orbital Battle Station Background!
    // 1. Deep Space Starfield & Planet Earth Horizon through Panoramic Viewport Window
    ctx.fillStyle = '#02040A';
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    const starParallax = -((camCenterX * 0.05) % 320);
    for (let sx = starParallax - 320; sx < viewWidth + 320; sx += 160) {
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(sx + 18, viewHeight * 0.16, 2, 2);
      ctx.fillRect(sx + 74, viewHeight * 0.28, 3, 3);
      ctx.fillRect(sx + 126, viewHeight * 0.19, 2, 2);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(sx + 48, viewHeight * 0.36, 2, 2);
      ctx.fillRect(sx + 142, viewHeight * 0.32, 2, 2);
    }

    // Glowing Blue Curvature of Planet Earth in Lower Viewport Window
    const earthGrad = ctx.createLinearGradient(0, viewHeight * 0.42, 0, viewHeight * 0.72);
    earthGrad.addColorStop(0, 'rgba(56, 189, 248, 0.0)');
    earthGrad.addColorStop(0.45, 'rgba(14, 165, 233, 0.32)');
    earthGrad.addColorStop(1, 'rgba(37, 99, 235, 0.58)');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.ellipse(viewWidth * 0.5, viewHeight * 0.92, viewWidth * 0.85, viewHeight * 0.48, 0, Math.PI, 0);
    ctx.fill();

    // 2. Metallic Orbital Bulkhead Frames & Red/Yellow Hazard Conduits
    const bulkheadOffset = -((camCenterX * 0.22) % 240);
    for (let bx = bulkheadOffset - 240; bx < viewWidth + 240; bx += 240) {
      // Heavy Steel Vertical Support Struts framing the Space Window
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(bx, 0, 38, viewHeight);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, 0, 38, viewHeight);

      // Upper & Lower Bulkhead Girders
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(bx, 0, 240, viewHeight * 0.14);
      ctx.fillRect(bx, viewHeight * 0.68, 240, viewHeight * 0.32);

      // Blinking Death Egg Telemetry Lights
      ctx.fillStyle = globalTick % 24 < 12 ? '#EF4444' : '#22C55E';
      ctx.fillRect(bx + 12, viewHeight * 0.25, 14, 6);
      ctx.fillStyle = globalTick % 24 < 12 ? '#FACC15' : '#38BDF8';
      ctx.fillRect(bx + 12, viewHeight * 0.35, 14, 6);
      ctx.fillRect(bx + 12, viewHeight * 0.45, 14, 6);
    }
  } else if (tileset.decorStyle === 'chemical') {
    const farOffset = -((camCenterX * 0.12) % 320);
    for (let mx = farOffset - 320; mx < viewWidth + 320; mx += 320) {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(mx + 10, viewHeight * 0.25, 64, viewHeight * 0.75);
      ctx.fillRect(mx + 90, viewHeight * 0.36, 88, viewHeight * 0.64);
      ctx.fillRect(mx + 195, viewHeight * 0.2, 54, viewHeight * 0.8);
      ctx.fillRect(mx + 260, viewHeight * 0.42, 48, viewHeight * 0.58);

      ctx.strokeStyle = '#1E3A8A';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(mx, viewHeight * 0.7);
      ctx.lineTo(mx + 320, viewHeight * 0.3);
      ctx.stroke();

      for (let py = Math.floor(viewHeight * 0.3); py < viewHeight * 0.86; py += 16) {
        ctx.fillStyle = (py + globalTick) % 32 < 16 ? '#FACC15' : '#38BDF8';
        ctx.fillRect(mx + 22, py, 12, 3);
        ctx.fillRect(mx + 44, py, 12, 3);
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(mx + 106, py + 4, 24, 3);
        ctx.fillRect(mx + 142, py + 4, 20, 3);
        ctx.fillStyle = '#EC4899';
        ctx.fillRect(mx + 210, py, 16, 3);
      }
    }

    const nearOffset = -((camCenterX * 0.28) % 240);
    for (let hx = nearOffset - 240; hx < viewWidth + 240; hx += 240) {
      ctx.fillStyle = '#172554';
      ctx.fillRect(hx + 24, viewHeight * 0.45, 44, viewHeight * 0.55);
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx + 24, viewHeight * 0.45, 44, viewHeight * 0.55);

      ctx.fillStyle = '#0284C7';
      ctx.fillRect(hx + 110, viewHeight * 0.5, 22, viewHeight * 0.5);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(hx + 116, viewHeight * 0.5, 6, viewHeight * 0.5);
    }
  } else if (tileset.decorStyle === 'chemicalplant') {
    // Chemical Plant Zone: Blue chemical vats, glass pipes & steel gantries
    const farOffset = -((camCenterX * 0.12) % 300);
    for (let mx = farOffset - 300; mx < viewWidth + 300; mx += 300) {
      // Distant steel vat silhouettes
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(mx + 12, viewHeight * 0.3, 72, viewHeight * 0.7);
      ctx.fillRect(mx + 130, viewHeight * 0.42, 96, viewHeight * 0.58);
      ctx.fillRect(mx + 246, viewHeight * 0.24, 48, viewHeight * 0.76);
      // Light-grey metal caps & yellow trim
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(mx + 8, viewHeight * 0.3, 80, 10);
      ctx.fillRect(mx + 126, viewHeight * 0.42, 104, 8);
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(mx + 12, viewHeight * 0.62, 72, 4);
      ctx.fillRect(mx + 130, viewHeight * 0.72, 96, 4);
    }
    // Rising blue chemical pipes in the mid ground
    const pipeOffset = -((camCenterX * 0.22) % 260);
    for (let px = pipeOffset - 260; px < viewWidth + 260; px += 260) {
      ctx.fillStyle = 'rgba(125, 211, 252, 0.35)';
      ctx.fillRect(px + 40, viewHeight * 0.2, 14, viewHeight * 0.8);
      ctx.fillRect(px + 160, viewHeight * 0.34, 18, viewHeight * 0.66);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.5)';
      ctx.fillRect(px + 44, viewHeight * 0.2, 4, viewHeight * 0.8);
      ctx.fillRect(px + 165, viewHeight * 0.34, 5, viewHeight * 0.66);
    }
  } else if (tileset.decorStyle === 'cave') {
    // Mystic Caverns Zone: deep purple spooky cave with hanging rock formations
    const farOffset = -((camCenterX * 0.1) % 300);
    for (let mx = farOffset - 300; mx < viewWidth + 300; mx += 300) {
      ctx.fillStyle = '#2E1065';
      ctx.beginPath();
      ctx.moveTo(mx, viewHeight * 0.45);
      ctx.lineTo(mx + 40, viewHeight * 0.2);
      ctx.lineTo(mx + 70, viewHeight * 0.46);
      ctx.lineTo(mx + 120, viewHeight * 0.14);
      ctx.lineTo(mx + 160, viewHeight * 0.44);
      ctx.lineTo(mx + 220, viewHeight * 0.22);
      ctx.lineTo(mx + 300, viewHeight * 0.5);
      ctx.lineTo(mx + 300, 0);
      ctx.lineTo(mx, 0);
      ctx.closePath();
      ctx.fill();
    }
    // Sparkling crystal veins & distant torches
    const crystalOffset = -((camCenterX * 0.2) % 220);
    for (let cx = crystalOffset - 220; cx < viewWidth + 220; cx += 220) {
      ctx.fillStyle = globalTick % 40 < 20 ? '#22D3EE' : '#38BDF8';
      ctx.fillRect(cx + 36, viewHeight * 0.52, 5, 5);
      ctx.fillRect(cx + 96, viewHeight * 0.64, 4, 4);
      ctx.fillRect(cx + 170, viewHeight * 0.48, 6, 6);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.beginPath();
      ctx.arc(cx + 130, viewHeight * 0.7, 46, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = tileset.palette.mountainFar;
    const farOffset = -((camCenterX * 0.12) % 320);
    for (let mx = farOffset - 320; mx < viewWidth + 320; mx += 320) {
      ctx.beginPath();
      ctx.moveTo(mx, viewHeight);
      ctx.lineTo(mx + 90, viewHeight * 0.42);
      ctx.lineTo(mx + 180, viewHeight * 0.62);
      ctx.lineTo(mx + 250, viewHeight * 0.36);
      ctx.lineTo(mx + 320, viewHeight);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = tileset.palette.hillNear;
    const nearOffset = -((camCenterX * 0.28) % 240);
    for (let hx = nearOffset - 240; hx < viewWidth + 240; hx += 240) {
      ctx.beginPath();
      ctx.arc(hx + 120, viewHeight * 0.82, 110, Math.PI, 0);
      ctx.lineTo(hx + 240, viewHeight);
      ctx.lineTo(hx, viewHeight);
      ctx.closePath();
      ctx.fill();
    }
  }

  const camLeft = Math.floor(camCenterX - viewWidth / 2);
  const camTop = Math.floor(camCenterY - viewHeight / 2);
  ctx.translate(-camLeft, -camTop);

  const startCol = Math.max(0, Math.floor(camLeft / TILE_SIZE) - 6);
  const endCol = Math.min(level.width - 1, Math.ceil((camLeft + viewWidth) / TILE_SIZE) + 6);
  const startRow = Math.max(0, Math.floor(camTop / TILE_SIZE) - 6);
  const endRow = Math.min(level.height - 1, Math.ceil((camTop + viewHeight) / TILE_SIZE) + 6);

  const customTextures = getOrBuildTileTextures(tileset);
  const uploadedSheet = getUploadedSheetImage(tileset.uploadedSheetDataUrl);

  // 2. Render Background Decorative Scenery
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (workingGrid[r][c] === TileType.GROUND_TOP && c % 9 === 3 && r > 3) {
        if (workingGrid[r - 1][c] === TileType.EMPTY) {
          drawZoneDecoration(ctx, c * TILE_SIZE + 16, r * TILE_SIZE, tileset, globalTick);
        }
      }
    }
  }

  // 2B. Render Background Tiles (both level.bgGrid Layer AND pass-through BG_* tiles in workingGrid) BEHIND everything!
  const anyBossAlive = bosses.some((b) => b.alive);
  if (level.bgGrid) {
    ctx.save();
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const bgTile = (level.bgGrid[r]?.[c] ?? TileType.EMPTY) as TileType;
        if (bgTile === TileType.EMPTY) continue;
        const wx = c * TILE_SIZE;
        const wy = r * TILE_SIZE;
        drawTile(
          ctx,
          bgTile,
          wx,
          wy,
          tileset,
          customTextures,
          uploadedSheet,
          globalTick,
          showEditorGrid,
          anyBossAlive
        );
        // Subtle background depth shading so foreground objects pop clearly in front of background layer tiles!
        if (!isBackgroundTile(bgTile)) {
          ctx.fillStyle = 'rgba(9, 13, 22, 0.36)';
          ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
        }
      }
    }
    ctx.restore();
  }

  // Also draw any BG_* or DECO_WATERFALL tiles placed directly in workingGrid behind foreground tiles & entities!
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tile = workingGrid[r][c] as TileType;
      if (!isBackgroundTile(tile)) continue;
      drawTile(
        ctx,
        tile,
        c * TILE_SIZE,
        r * TILE_SIZE,
        tileset,
        customTextures,
        uploadedSheet,
        globalTick,
        showEditorGrid,
        anyBossAlive
      );
    }
  }

  // 3. Render Foreground Level Tiles, Moving/Swinging Platforms & Redone 360° Loops
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tile = workingGrid[r][c] as TileType;
      if (tile === TileType.EMPTY || isBackgroundTile(tile)) continue;
      const wx = c * TILE_SIZE;
      const wy = r * TILE_SIZE;

      drawTile(
        ctx,
        tile,
        wx,
        wy,
        tileset,
        customTextures,
        uploadedSheet,
        globalTick,
        showEditorGrid,
        anyBossAlive
      );
    }
  }

  if (showEditorGrid) {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 1;
    for (let c = startCol; c <= endCol + 1; c++) {
      ctx.beginPath();
      ctx.moveTo(c * TILE_SIZE, startRow * TILE_SIZE);
      ctx.lineTo(c * TILE_SIZE, (endRow + 1) * TILE_SIZE);
      ctx.stroke();
    }
    for (let r = startRow; r <= endRow + 1; r++) {
      ctx.beginPath();
      ctx.moveTo(startCol * TILE_SIZE, r * TILE_SIZE);
      ctx.lineTo((endCol + 1) * TILE_SIZE, r * TILE_SIZE);
      ctx.stroke();
    }
  }

  // 4. Render Badniks, Bosses & Projectiles
  for (const b of badniks) {
    if (!b.alive) continue;
    drawBadnik(ctx, b, globalTick);
  }

  for (const boss of bosses) {
    if (!boss.alive) continue;
    if (boss.engaged) {
      // Draw Locked Boss Arena Energy Barriers at arenaLeft and arenaRight
      ctx.save();
      const pulse = 0.55 + Math.sin(globalTick * 0.2) * 0.25;
      ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 6]);
      [boss.arenaLeft, boss.arenaRight].forEach((bx) => {
        ctx.beginPath();
        ctx.moveTo(bx, boss.startY - 220);
        ctx.lineTo(bx, boss.startY + 220);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();
    }
    drawEggmanBoss(ctx, boss, globalTick, customTextures);
  }

  for (const proj of projectiles) {
    ctx.save();
    if (proj.kind === 'deathegg_claw') {
      // Giant 2.4x Fired 3-Pronged Spiked Hand Projectile!
      ctx.translate(proj.x, proj.y);
      ctx.scale((proj.facing || -1) * 2.4, 2.4);

      // Rear Rocket Propulsion Plume
      ctx.fillStyle = globalTick % 4 < 2 ? '#F97316' : '#FACC15';
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.lineTo(-26 - (globalTick % 6), 0);
      ctx.lineTo(-14, 4);
      ctx.closePath();
      ctx.fill();

      // Forearm Socket & Yellow Armored Cuff
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(-14, -5, 10, 10);
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(-4, -9, 12, 18);
      ctx.strokeStyle = '#090D16';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-4, -9, 12, 18);

      // 3 Razor-Sharp Spiked Prongs
      ctx.fillStyle = '#F8FAFC';
      [-7, -1, 5].forEach((cy) => {
        ctx.beginPath();
        ctx.moveTo(8, cy);
        ctx.lineTo(18, cy + 2);
        ctx.lineTo(8, cy + 4);
        ctx.closePath();
        ctx.fill();
      });
    } else if (proj.kind === 'deathegg_bomb') {
      // Death Egg Robot Pursuing Bomb!
      ctx.translate(proj.x, proj.y);
      ctx.fillStyle = globalTick % 6 < 3 ? '#1E293B' : '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Flashing Red/Yellow Seeker Optic looking toward Sonic
      const eyeDir = proj.facing || 1;
      ctx.fillStyle = globalTick % 4 < 2 ? '#EF4444' : '#FACC15';
      ctx.beginPath();
      ctx.arc(eyeDir * 3, -1, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Top Thruster / Fuse Cap
      ctx.fillStyle = '#F97316';
      ctx.fillRect(-2, -proj.radius - 3, 4, 4);
    } else {
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(proj.x - 1, proj.y - 1, proj.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 4B. Render Non-Projectile Mech Hazards (stalactites, debris, shockwaves, steam)
  for (const hz of hazards) {
    ctx.save();
    const lifeRatio = Math.max(0, hz.life / hz.maxLife);
    if (hz.kind === 'stalactite') {
      ctx.translate(hz.x, hz.y);
      ctx.fillStyle = '#4C1D95';
      ctx.beginPath();
      ctx.moveTo(-9, -14);
      ctx.lineTo(9, -14);
      ctx.lineTo(0, 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7E22CE';
      ctx.beginPath();
      ctx.moveTo(-4, -12);
      ctx.lineTo(2, -12);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#22D3EE';
      ctx.fillRect(-2, 12, 4, 4);
    } else if (hz.kind === 'debris') {
      ctx.fillStyle = '#6B21A8';
      ctx.beginPath();
      ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#22D3EE';
      ctx.fillRect(hz.x - 2, hz.y - 2, 4, 4);
    } else if (hz.kind === 'shockwave') {
      const arcY = hz.y + 8;
      ctx.globalAlpha = Math.min(1, lifeRatio + 0.25);
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(hz.x, arcY, hz.radius, Math.PI, 0);
      ctx.stroke();
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hz.x, arcY, hz.radius * 0.6, Math.PI, 0);
      ctx.stroke();
    } else if (hz.kind === 'steam' || hz.kind === 'steam_burst') {
      ctx.globalAlpha = Math.min(1, lifeRatio + 0.2) * 0.65;
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(hz.x, hz.y, hz.radius * (1.2 - lifeRatio * 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(hz.x, hz.y - 6, hz.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 5. Render Scattered Rings
  for (const sr of scatteredRings) {
    if (sr.timer < 60 && Math.floor(sr.timer / 4) % 2 === 0) continue;
    drawRing(ctx, sr.x, sr.y, globalTick);
  }

  // 6. Render Players (chemical travel tube glass pipe drawn first while riding)
  for (let i = players.length - 1; i >= 0; i--) {
    const pl = players[i];
    if (pl.tubeTravel) {
      const route = pl.tubeTravel.points;
      if (route.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Outer glass tube shell
        ctx.strokeStyle = 'rgba(219, 234, 254, 0.45)';
        ctx.lineWidth = 42;
        ctx.beginPath();
        ctx.moveTo(route[0].x, route[0].y);
        for (let p = 1; p < route.length; p++) ctx.lineTo(route[p].x, route[p].y);
        ctx.stroke();
        // Blue chemicals rushing through the pipe
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 26;
        ctx.stroke();
        // Specular highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }
    }
    drawPlayerSprite(ctx, pl, globalTick);
  }

  // 7. Render Particles & Score Popups
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.type === 'score_popup' && p.text) {
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#090D16';
      ctx.fillText(p.text, p.x - 24 + 1, p.y + 1);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x - 24, p.y);
    } else if (p.type === 'sparkle') {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - 1, p.size, 2);
      ctx.fillRect(p.x - 1, p.y - p.size / 2, 2, p.size);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();

  // 8. Post-Death Egg Robot Defeat Cutscene Overlay (Screen-Space Cinematic Bars & Banner)
  const inCutsceneRun = players.some(
    (p) => p.forcedCutsceneRun && p.state !== 'victory' && !p.isAI
  );
  if (inCutsceneRun) {
    ctx.save();
    ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
    ctx.fillRect(0, 0, viewWidth, 34);
    ctx.fillRect(0, viewHeight - 30, viewWidth, 30);

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.lineTo(viewWidth, 34);
    ctx.moveTo(0, viewHeight - 30);
    ctx.lineTo(viewWidth, viewHeight - 30);
    ctx.stroke();

    ctx.fillStyle = globalTick % 16 < 8 ? '#FACC15' : '#38BDF8';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      '★ FINAL CUTSCENE — CONTROLS LOCKED: ESCAPING TO GOAL SIGNPOST! ★',
      viewWidth / 2,
      21
    );
    ctx.restore();
  }
}

function drawZoneDecoration(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  tileset: TilesetConfig,
  tick: number
) {
  ctx.save();
  if (tileset.decorStyle === 'palms') {
    ctx.fillStyle = tileset.palette.soilSecondary;
    for (let seg = 0; seg < 5; seg++) {
      ctx.fillRect(x - 5 + Math.sin(seg * 0.4) * 2, groundY - (seg + 1) * 14, 10, 12);
    }
    ctx.fillStyle = tileset.palette.surfaceTop;
    const topY = groundY - 70;
    [-32, -18, 18, 32].forEach((dx) => {
      ctx.beginPath();
      ctx.ellipse(x + dx * 0.6, topY + Math.abs(dx) * 0.2, 20, 6, dx * 0.02, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (tileset.decorStyle === 'deathegg') {
    // Sonic 2 Death Egg Computer Terminal & Blinking Status Beacon
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 14, groundY - 46, 28, 46);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 14, groundY - 46, 28, 46);
    ctx.fillStyle = '#090D16';
    ctx.fillRect(x - 10, groundY - 40, 20, 16);
    ctx.fillStyle = tick % 16 < 8 ? '#22C55E' : '#38BDF8';
    ctx.fillRect(x - 8, groundY - 36, 16, 3);
    ctx.fillRect(x - 8, groundY - 30, 11, 3);
    ctx.fillStyle = tick % 12 < 6 ? '#EF4444' : '#FACC15';
    ctx.beginPath();
    ctx.arc(x, groundY - 52, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (tileset.decorStyle === 'chemical') {
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x - 14, groundY - 58, 28, 58);
    const levelH = 30 + Math.sin(tick * 0.08) * 6;
    ctx.fillStyle = '#9333EA';
    ctx.fillRect(x - 10, groundY - 8 - levelH, 20, levelH);
    ctx.fillStyle = '#EC4899';
    ctx.fillRect(x - 6, groundY - 8 - levelH, 6, levelH);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 16, groundY - 62, 32, 5);
    ctx.fillRect(x - 16, groundY - 6, 32, 6);
  } else if (tileset.decorStyle === 'chemicalplant') {
    // Chemical Plant Zone: glass pipe with bubbling blue chemicals & a valve wheel
    ctx.fillStyle = '#64748B';
    ctx.fillRect(x - 16, groundY - 66, 32, 8);
    ctx.fillRect(x - 16, groundY - 8, 32, 8);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(x - 4, groundY - 58, 8, 50);
    // Glass tube with rising blue chemical fluid
    const fluidH = 34 + Math.sin(tick * 0.07) * 8;
    ctx.fillStyle = 'rgba(219, 234, 254, 0.75)';
    ctx.fillRect(x - 12, groundY - 58, 24, 50);
    ctx.fillStyle = '#0EA5E9';
    ctx.fillRect(x - 10, groundY - 10 - fluidH, 20, fluidH);
    ctx.fillStyle = '#7DD3FC';
    ctx.fillRect(x - 6, groundY - 10 - fluidH, 5, fluidH);
    // Bubbles
    ctx.fillStyle = '#E0F2FE';
    for (let b = 0; b < 3; b++) {
      const by = groundY - 12 - ((tick * 1.4 + b * 17) % 40);
      ctx.beginPath();
      ctx.arc(x - 4 + b * 4, by, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Yellow valve wheel
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, groundY - 62, 10, 0, Math.PI * 2);
    ctx.stroke();
  } else if (tileset.decorStyle === 'cave') {
    // Mystic Caverns Zone: purple stalagmite cluster, crystal shard & mine cart rail
    ctx.fillStyle = '#4C1D95';
    ctx.beginPath();
    ctx.moveTo(x - 14, groundY);
    ctx.lineTo(x - 6, groundY - 54);
    ctx.lineTo(x + 2, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5B21B6';
    ctx.beginPath();
    ctx.moveTo(x + 2, groundY);
    ctx.lineTo(x + 10, groundY - 36);
    ctx.lineTo(x + 18, groundY);
    ctx.closePath();
    ctx.fill();
    // Glowing crystal
    ctx.fillStyle = tick % 30 < 15 ? '#22D3EE' : '#67E8F9';
    ctx.beginPath();
    ctx.moveTo(x, groundY - 66);
    ctx.lineTo(x + 6, groundY - 52);
    ctx.lineTo(x - 6, groundY - 52);
    ctx.closePath();
    ctx.fill();
    // Mine cart rail tie
    ctx.fillStyle = '#B45309';
    ctx.fillRect(x - 18, groundY - 6, 36, 5);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 18, groundY - 10, 36, 3);
  } else {
    ctx.fillStyle = tileset.palette.soilPrimary;
    ctx.fillRect(x - 10, groundY - 64, 20, 64);
    ctx.fillStyle = tileset.palette.surfaceHighlight;
    ctx.fillRect(x - 14, groundY - 68, 28, 6);
    ctx.fillRect(x - 14, groundY - 6, 28, 6);
  }
  ctx.restore();
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileType,
  wx: number,
  wy: number,
  tileset: TilesetConfig,
  customTextures: Record<string, HTMLCanvasElement>,
  uploadedSheet: HTMLImageElement | null,
  tick: number,
  showSpawnMarkers: boolean,
  anyBossAlive: boolean = false
) {
  const pal = tileset.palette;
  const map = tileset.uploadedTileMapping;

  // Render any user-edited custom tile texture (including the 10 Blank White Custom Blocks!)
  const mappedTexKey = TILE_TO_TEXTURE_KEY[tile];
  if (
    mappedTexKey &&
    tile !== TileType.GROUND_TOP &&
    tile !== TileType.GROUND_DEEP &&
    tile !== TileType.PLATFORM &&
    tile !== TileType.BREAKABLE_ROCK &&
    tile !== TileType.MOVING_PLATFORM &&
    tile !== TileType.MOVING_PLATFORM_VERT &&
    tile !== TileType.SWINGING_PLATFORM &&
    tile !== TileType.MONITOR_1UP &&
    customTextures[mappedTexKey]
  ) {
    ctx.drawImage(customTextures[mappedTexKey], wx, wy);
    return;
  }

  switch (tile) {
    case TileType.GROUND_TOP: {
      if (uploadedSheet && map) {
        const s = map.tilePixelSize || 16;
        ctx.drawImage(
          uploadedSheet,
          map.groundTopCol * s,
          map.groundTopRow * s,
          s,
          s,
          wx,
          wy,
          TILE_SIZE,
          TILE_SIZE
        );
      } else if (customTextures.groundTop) {
        ctx.drawImage(customTextures.groundTop, wx, wy);
      } else {
        ctx.fillStyle = pal.soilPrimary;
        ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = pal.surfaceTop;
        ctx.fillRect(wx, wy, TILE_SIZE, 9);
      }
      break;
    }

    case TileType.GROUND_DEEP: {
      if (uploadedSheet && map) {
        const s = map.tilePixelSize || 16;
        ctx.drawImage(
          uploadedSheet,
          map.groundDeepCol * s,
          map.groundDeepRow * s,
          s,
          s,
          wx,
          wy,
          TILE_SIZE,
          TILE_SIZE
        );
      } else if (customTextures.groundDeep) {
        ctx.drawImage(customTextures.groundDeep, wx, wy);
      } else {
        ctx.fillStyle = pal.soilPrimary;
        ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
      }
      break;
    }

    case TileType.SLOPE_UP_LOW:
    case TileType.SLOPE_UP_HIGH:
    case TileType.SLOPE_DOWN_HIGH:
    case TileType.SLOPE_DOWN_LOW:
    case TileType.SLOPE_45_UP:
    case TileType.SLOPE_45_DOWN: {
      let yLeft = wy + TILE_SIZE;
      let yRight = wy + TILE_SIZE;
      if (tile === TileType.SLOPE_UP_LOW) {
        yLeft = wy + TILE_SIZE;
        yRight = wy + 16;
      } else if (tile === TileType.SLOPE_UP_HIGH) {
        yLeft = wy + 16;
        yRight = wy;
      } else if (tile === TileType.SLOPE_DOWN_HIGH) {
        yLeft = wy;
        yRight = wy + 16;
      } else if (tile === TileType.SLOPE_DOWN_LOW) {
        yLeft = wy + 16;
        yRight = wy + TILE_SIZE;
      } else if (tile === TileType.SLOPE_45_UP) {
        yLeft = wy + TILE_SIZE;
        yRight = wy;
      } else if (tile === TileType.SLOPE_45_DOWN) {
        yLeft = wy;
        yRight = wy + TILE_SIZE;
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(wx, yLeft);
      ctx.lineTo(wx + TILE_SIZE, yRight);
      ctx.lineTo(wx + TILE_SIZE, wy + TILE_SIZE);
      ctx.lineTo(wx, wy + TILE_SIZE);
      ctx.closePath();
      ctx.clip();

      if (customTextures.groundDeep) {
        ctx.drawImage(customTextures.groundDeep, wx, wy);
      } else {
        ctx.fillStyle = pal.soilPrimary;
        ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
      }

      if (tileset.decorStyle === 'chemical') {
        ctx.strokeStyle = '#090D16';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(wx, yLeft + 3);
        ctx.lineTo(wx + TILE_SIZE, yRight + 3);
        ctx.stroke();

        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(wx, yLeft + 2);
        ctx.lineTo(wx + TILE_SIZE, yRight + 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = pal.surfaceTop;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(wx, yLeft + 2);
        ctx.lineTo(wx + TILE_SIZE, yRight + 2);
        ctx.stroke();

        ctx.strokeStyle = pal.surfaceHighlight;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(wx, yLeft);
        ctx.lineTo(wx + TILE_SIZE, yRight);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case TileType.PLATFORM: {
      if (customTextures.platform) {
        ctx.drawImage(customTextures.platform, wx, wy);
      } else {
        ctx.fillStyle = pal.platformTop;
        ctx.fillRect(wx, wy, TILE_SIZE, 10);
      }
      break;
    }

    case TileType.BREAKABLE_ROCK: {
      // Breakable Wall: Pure natural dirt-matched block texture (no glass overlay!)
      if (customTextures.breakableRock) {
        ctx.drawImage(customTextures.breakableRock, wx, wy);
      } else if (customTextures.groundDeep) {
        ctx.drawImage(customTextures.groundDeep, wx, wy);
      } else {
        ctx.fillStyle = pal.soilPrimary;
        ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
      }
      break;
    }

    case TileType.LAVA: {
      // Marble Zone Animated Molten Lava
      ctx.save();
      const lavaGrad = ctx.createLinearGradient(wx, wy, wx, wy + TILE_SIZE);
      lavaGrad.addColorStop(0, '#FACC15');
      lavaGrad.addColorStop(0.25, '#F97316');
      lavaGrad.addColorStop(0.75, '#DC2626');
      lavaGrad.addColorStop(1, '#991B1B');
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(wx, wy + 3, TILE_SIZE, TILE_SIZE - 3);

      // Animated wavy molten crust on top
      ctx.fillStyle = tick % 12 < 6 ? '#FEF08A' : '#FACC15';
      for (let i = 0; i < 4; i++) {
        const waveY = wy + 2 + Math.sin(tick * 0.14 + (wx + i * 8) * 0.12) * 2;
        ctx.fillRect(wx + i * 8, waveY, 7, 4);
      }

      // Magma bubbles inside the tile
      const bubX = wx + 8 + ((tick + wx) % 18);
      const bubY = wy + 22 - ((tick * 0.4 + wx) % 12);
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(bubX, bubY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case TileType.SPIKES_UP: {
      ctx.fillStyle = '#334155';
      ctx.fillRect(wx, wy + 20, TILE_SIZE, 12);
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      ctx.strokeRect(wx + 0.5, wy + 20.5, TILE_SIZE - 1, 11);

      ctx.fillStyle = pal.hazardColor;
      for (let i = 0; i < 4; i++) {
        const sx = wx + i * 8;
        ctx.beginPath();
        ctx.moveTo(sx + 1, wy + 20);
        ctx.lineTo(sx + 4, wy + 2);
        ctx.lineTo(sx + 7, wy + 20);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case TileType.SPRING_YELLOW:
    case TileType.SPRING_RED: {
      const isRed = tile === TileType.SPRING_RED;
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(wx + 6, wy + 20, 20, 12);
      ctx.fillStyle = isRed ? '#EF4444' : '#FACC15';
      ctx.fillRect(wx + 2, wy + 12, 28, 8);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(wx + 6, wy + 14, 20, 3);
      break;
    }

    case TileType.SPRING_RIGHT:
    case TileType.SPRING_LEFT: {
      const isRight = tile === TileType.SPRING_RIGHT;
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(isRight ? wx : wx + 16, wy + 6, 16, 20);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(isRight ? wx + 14 : wx + 8, wy + 2, 8, 28);
      break;
    }

    case TileType.BOOSTER_RIGHT:
    case TileType.BOOSTER_LEFT: {
      const dir = tile === TileType.BOOSTER_RIGHT ? 1 : -1;
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(wx, wy + 22, TILE_SIZE, 10);
      ctx.fillStyle = tick % 12 < 6 ? '#FACC15' : '#EF4444';
      ctx.beginPath();
      if (dir === 1) {
        ctx.moveTo(wx + 6, wy + 24);
        ctx.lineTo(wx + 26, wy + 27);
        ctx.lineTo(wx + 6, wy + 30);
      } else {
        ctx.moveTo(wx + 26, wy + 24);
        ctx.lineTo(wx + 6, wy + 27);
        ctx.lineTo(wx + 26, wy + 30);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }

    case TileType.RING: {
      drawRing(ctx, wx + 16, wy + 16, tick);
      break;
    }

    case TileType.GIANT_RING: {
      // Giant Shimmering Special Stage Warp Ring!
      const phase = (tick * 0.1) % Math.PI;
      const rx = Math.max(5, Math.abs(Math.cos(phase)) * 18);
      ctx.save();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(wx + 16, wy + 10, rx, 19, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = tick % 10 < 5 ? '#38BDF8' : '#FEF08A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(wx + 16, wy + 10, Math.max(2, rx - 2), 16, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case TileType.MONITOR_RING:
    case TileType.MONITOR_SPEED:
    case TileType.MONITOR_SHIELD:
    case TileType.MONITOR_FLAME:
    case TileType.MONITOR_LIGHTNING:
    case TileType.MONITOR_BUBBLE:
    case TileType.MONITOR_INVINCIBILITY:
    case TileType.MONITOR_EGGMAN:
    case TileType.MONITOR_SWAP:
    case TileType.MONITOR_SUPER:
    case TileType.MONITOR_1UP: {
      ctx.fillStyle =
        tile === TileType.MONITOR_SUPER
          ? '#CA8A04'
          : tile === TileType.MONITOR_1UP
          ? '#1E3A8A'
          : '#475569';
      ctx.fillRect(wx + 3, wy + 4, 26, 24);
      ctx.fillStyle =
        tile === TileType.MONITOR_SUPER || tile === TileType.MONITOR_1UP
          ? '#FEF08A'
          : '#94A3B8';
      ctx.fillRect(wx + 4, wy + 5, 24, 2);
      ctx.fillStyle = '#090D16';
      ctx.fillRect(wx + 6, wy + 7, 20, 16);
      ctx.fillStyle = '#64748B';
      ctx.fillRect(wx + 8, wy + 28, 16, 4);

      const cx = wx + 16;
      const cy = wy + 15;

      if (tile === TileType.MONITOR_RING) {
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tile === TileType.MONITOR_SPEED) {
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(wx + 9, wy + 13, 14, 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(wx + 13, wy + 13, 3, 6);
      } else if (tile === TileType.MONITOR_SHIELD) {
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tile === TileType.MONITOR_FLAME) {
        ctx.fillStyle = '#F97316';
        ctx.beginPath();
        ctx.arc(cx, cy + 1, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(cx, cy + 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (tile === TileType.MONITOR_LIGHTNING) {
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.moveTo(cx + 2, cy - 6);
        ctx.lineTo(cx - 4, cy + 1);
        ctx.lineTo(cx + 1, cy + 1);
        ctx.lineTo(cx - 2, cy + 7);
        ctx.lineTo(cx + 5, cy - 1);
        ctx.lineTo(cx, cy - 1);
        ctx.closePath();
        ctx.fill();
      } else if (tile === TileType.MONITOR_BUBBLE) {
        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#A7F3D0';
        ctx.fillRect(cx - 3, cy - 4, 2, 2);
      } else if (tile === TileType.MONITOR_INVINCIBILITY) {
        ctx.fillStyle = tick % 8 < 4 ? '#FACC15' : '#FFFFFF';
        ctx.fillRect(cx - 6, cy - 1, 12, 3);
        ctx.fillRect(cx - 1, cy - 6, 3, 12);
        ctx.fillRect(cx - 4, cy - 4, 8, 8);
      } else if (tile === TileType.MONITOR_EGGMAN) {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(cx - 7, cy + 1, 14, 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 4, cy - 3, 3, 2);
        ctx.fillRect(cx + 1, cy - 3, 3, 2);
      } else if (tile === TileType.MONITOR_SWAP) {
        ctx.fillStyle = '#A855F7';
        ctx.fillRect(cx - 6, cy - 4, 8, 3);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(cx - 2, cy + 1, 8, 3);
      } else if (tile === TileType.MONITOR_SUPER) {
        // Super "S" Monitor Emblem
        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = tick % 6 < 3 ? '#FACC15' : '#FFFFFF';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText('S', cx - 3.5, cy + 4);
      } else if (tile === TileType.MONITOR_1UP) {
        // 1-UP Extra Life Monitor Emblem
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = tick % 10 < 5 ? '#FEF08A' : '#FFFFFF';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.fillText('1UP', cx - 7.5, cy + 3);
      }
      break;
    }

    case TileType.BG_BRICK: {
      // Pass-Through Background Castle/Tower Brick Wall (Renders behind foreground & players!)
      ctx.save();
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#0F172A';
      for (let by = 0; by < TILE_SIZE; by += 8) {
        ctx.fillRect(wx, wy + by, TILE_SIZE, 2);
        const offset = (by / 8) % 2 === 0 ? 0 : 8;
        for (let bx = offset; bx < TILE_SIZE; bx += 16) {
          ctx.fillRect(wx + bx, wy + by, 2, 8);
        }
      }
      ctx.fillStyle = 'rgba(148, 163, 184, 0.14)';
      ctx.fillRect(wx + 2, wy + 2, 12, 4);
      ctx.fillRect(wx + 10, wy + 10, 12, 4);
      ctx.restore();
      break;
    }

    case TileType.BG_PILLAR: {
      // Pass-Through Background Fluted Stone/Emerald Column
      ctx.save();
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(wx + 4, wy, 24, TILE_SIZE);
      ctx.fillStyle = '#334155';
      ctx.fillRect(wx + 7, wy, 18, TILE_SIZE);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(wx + 10, wy, 3, TILE_SIZE);
      ctx.fillRect(wx + 19, wy, 3, TILE_SIZE);
      ctx.fillStyle = '#475569';
      ctx.fillRect(wx + 2, wy, 28, 3);
      ctx.fillRect(wx + 2, wy + TILE_SIZE - 3, 28, 3);
      ctx.restore();
      break;
    }

    case TileType.BG_WINDOW: {
      // Pass-Through Background Tower Arch Window
      ctx.save();
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(wx + 16, wy + 12, 8, Math.PI, 0);
      ctx.lineTo(wx + 24, wy + 28);
      ctx.lineTo(wx + 8, wy + 28);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(wx + 15, wy + 5, 2, 23);
      ctx.fillRect(wx + 8, wy + 16, 16, 2);
      ctx.restore();
      break;
    }

    case TileType.BG_LATTICE: {
      // Pass-Through Background Girder/Vine Lattice
      ctx.save();
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.75)';
      ctx.lineWidth = 3;
      ctx.strokeRect(wx + 1.5, wy + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + TILE_SIZE, wy + TILE_SIZE);
      ctx.moveTo(wx + TILE_SIZE, wy);
      ctx.lineTo(wx, wy + TILE_SIZE);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case TileType.BG_FOLIAGE: {
      // Pass-Through Background Emerald Foliage Wall
      ctx.save();
      ctx.fillStyle = '#14532D';
      ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.arc(wx + 10, wy + 10, 9, 0, Math.PI * 2);
      ctx.arc(wx + 24, wy + 14, 8, 0, Math.PI * 2);
      ctx.arc(wx + 14, wy + 24, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(wx + 6, wy + 6, 4, 4);
      ctx.fillRect(wx + 20, wy + 12, 4, 4);
      ctx.restore();
      break;
    }

    case TileType.MOVING_PLATFORM:
    case TileType.MOVING_PLATFORM_VERT:
    case TileType.SWINGING_PLATFORM: {
      const col = Math.round(wx / TILE_SIZE);
      const row = Math.round(wy / TILE_SIZE);
      const plat = getDynamicPlatformState(col, row, tile, tick);
      ctx.save();

      if (tile === TileType.SWINGING_PLATFORM) {
        // Optional faint pendulum guide arc in editor
        if (showSpawnMarkers) {
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.28)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(plat.pivotX, plat.pivotY, 84, Math.PI * 0.16, Math.PI * 0.84);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Draw Anchor Hub at Pivot
        ctx.fillStyle = '#475569';
        ctx.fillRect(plat.pivotX - 7, plat.pivotY - 6, 14, 12);
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(plat.pivotX, plat.pivotY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw 6 Linked Chain Spheres from Pivot to Platform Deck!
        const links = 6;
        for (let i = 1; i <= links; i++) {
          const tFrac = i / (links + 1);
          const lx = plat.pivotX + (plat.x - plat.pivotX) * tFrac;
          const ly = plat.pivotY + (plat.y - plat.pivotY) * tFrac;
          ctx.fillStyle = i % 2 === 0 ? '#CBD5E1' : '#94A3B8';
          ctx.beginPath();
          ctx.arc(lx, ly, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#1E293B';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      } else if (showSpawnMarkers) {
        // Faint track guide in editor for Horizontal / Vertical Moving Platforms
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (tile === TileType.MOVING_PLATFORM) {
          ctx.moveTo(plat.pivotX - 72, plat.pivotY + 7);
          ctx.lineTo(plat.pivotX + 72, plat.pivotY + 7);
        } else {
          ctx.moveTo(plat.pivotX, plat.pivotY - 80);
          ctx.lineTo(plat.pivotX, plat.pivotY + 80);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw the 64x14 Platform Deck at (plat.x - 32, plat.y)
      const px = plat.x - plat.width / 2;
      const py = plat.y;
      ctx.fillStyle = pal.soilSecondary;
      ctx.fillRect(px + 4, py + 5, plat.width - 8, 10);
      ctx.fillStyle = pal.soilPrimary;
      for (let bx = 6; bx < plat.width - 8; bx += 10) {
        ctx.fillRect(px + bx, py + 6, 6, 7);
      }
      ctx.fillStyle = pal.platformTop || pal.surfaceTop;
      ctx.fillRect(px, py, plat.width, 6);
      ctx.fillStyle = pal.surfaceHighlight;
      ctx.fillRect(px + 2, py, plat.width - 4, 2);
      // Glowing Anti-Gravity Thruster Core under Moving Platforms
      if (tile !== TileType.SWINGING_PLATFORM) {
        ctx.fillStyle = tick % 8 < 4 ? '#38BDF8' : '#FACC15';
        ctx.fillRect(plat.x - 8, py + 14, 16, 3);
      }
      ctx.restore();
      break;
    }

    case TileType.ONE_WAY_DOOR: {
      // 3-Block-Tall One-Way Door (Passable going forward ->, locks solid once passed!)
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(wx + 6, wy, 20, TILE_SIZE);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx + 6, wy + 1, 20, TILE_SIZE - 2);

      // Left & Right Mechanical Door Pillars
      ctx.fillStyle = '#475569';
      ctx.fillRect(wx + 5, wy, 4, TILE_SIZE);
      ctx.fillRect(wx + 23, wy, 4, TILE_SIZE);

      // Animated Forward One-Way Laser Chevrons (>>)
      const pulseCol = tick % 12 < 6 ? '#38BDF8' : '#FACC15';
      ctx.strokeStyle = pulseCol;
      ctx.lineWidth = 2.5;
      for (let cy = 8; cy <= 24; cy += 14) {
        ctx.beginPath();
        ctx.moveTo(wx + 11, wy + cy - 5);
        ctx.lineTo(wx + 17, wy + cy);
        ctx.lineTo(wx + 11, wy + cy + 5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(wx + 16, wy + cy - 5);
        ctx.lineTo(wx + 22, wy + cy);
        ctx.lineTo(wx + 16, wy + cy + 5);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case TileType.ONE_WAY_DOOR_LOCKED: {
      // Locked Solid 3-Block-Tall Bulkhead Door (After player passes through it!)
      ctx.save();
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(wx + 2, wy, 28, TILE_SIZE);
      ctx.fillStyle = '#334155';
      ctx.fillRect(wx + 5, wy + 2, 22, TILE_SIZE - 4);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx + 3, wy + 1, 26, TILE_SIZE - 2);

      // Heavy Steel Cross-Bracing & Red Locked Status Indicator
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(wx + 5, wy + 3, 22, 4);
      ctx.fillRect(wx + 5, wy + TILE_SIZE - 7, 22, 4);

      ctx.fillStyle = tick % 16 < 8 ? '#EF4444' : '#991B1B';
      ctx.beginPath();
      ctx.arc(wx + 16, wy + 16, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case TileType.CHECKPOINT: {
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(wx + 14, wy + 8, 4, 24);
      ctx.fillStyle = tick % 20 < 10 ? '#EF4444' : '#38BDF8';
      ctx.beginPath();
      ctx.arc(wx + 16, wy + 8, 7, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case TileType.GOAL_POST: {
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(wx + 14, wy - 16, 4, 48);
      ctx.fillStyle = anyBossAlive ? '#991B1B' : '#2563EB';
      ctx.fillRect(wx + 1, wy - 20, 30, 20);
      ctx.strokeStyle = anyBossAlive ? '#EF4444' : '#FACC15';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx + 1, wy - 20, 30, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.fillText(anyBossAlive ? 'LOCK' : 'GOAL', wx + 5, wy - 7);
      break;
    }

    case TileType.LOOP_HEAD: {
      // REDONE 360° LOOP-DE-LOOP: Authentic 16-Bit 3D Faceted Checkerboard Loop Structure + Entry/Exit Foundations!
      const cx = wx + 96;
      const cy = wy + 96;
      const outerR = 94;
      const innerR = 68;
      ctx.save();

      // 1. Left & Right Ground Support Foundations so the Loop sits solidly on the terrain!
      const isTech = tileset.decorStyle === 'chemical' || tileset.decorStyle === 'deathegg';
      const basePrimary = isTech ? '#1E293B' : pal.soilPrimary;
      const baseSecondary = isTech ? '#0F172A' : pal.soilSecondary;
      const trackMain = isTech ? '#FACC15' : pal.surfaceTop;
      const trackHi = isTech ? '#38BDF8' : pal.surfaceHighlight;

      // Left & Right Support Pillars (wy + 128 .. wy + 192)
      ctx.fillStyle = baseSecondary;
      ctx.fillRect(wx + 4, wy + 132, 54, 60);
      ctx.fillRect(wx + 134, wy + 132, 54, 60);

      for (let py = wy + 136; py < wy + 190; py += 12) {
        for (let px = 0; px < 48; px += 12) {
          const isEven = ((px / 12) + ((py - wy) / 12)) % 2 === 0;
          ctx.fillStyle = isEven ? basePrimary : baseSecondary;
          ctx.fillRect(wx + 7 + px, py, 11, 11);
          ctx.fillRect(wx + 137 + px, py, 11, 11);
        }
      }

      // 2. 3D Faceted 24-Segment Checkerboard Loop Ring
      const segments = 24;
      for (let i = 0; i < segments; i++) {
        const a0 = (i / segments) * Math.PI * 2;
        const a1 = ((i + 1) / segments) * Math.PI * 2;

        // Outer structural ring wedge
        ctx.fillStyle = i % 2 === 0 ? basePrimary : baseSecondary;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, a0, a1);
        ctx.arc(cx, cy, innerR + 6, a1, a0, true);
        ctx.closePath();
        ctx.fill();

        // Inner offset checkerboard ring for authentic Sonic 3D depth!
        ctx.fillStyle = i % 2 === 0 ? baseSecondary : basePrimary;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR - 12, a0, a1);
        ctx.arc(cx, cy, innerR + 4, a1, a0, true);
        ctx.closePath();
        ctx.fill();
      }

      // Outer & Inner Bevel Outlines
      ctx.lineWidth = 3;
      ctx.strokeStyle = isTech ? '#475569' : '#090D16';
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Running Surface Track around the Inside of the Loop + Entry/Exit Ramps!
      ctx.lineWidth = 7;
      ctx.strokeStyle = trackMain;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR + 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = trackHi;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.stroke();

      // Bottom Entry / Exit Runway Caps & Animated Directional Gate Chevrons
      ctx.fillStyle = trackMain;
      ctx.fillRect(wx, wy + 184, 66, 8);
      ctx.fillRect(wx + 126, wy + 184, 66, 8);
      ctx.fillStyle = trackHi;
      ctx.fillRect(wx, wy + 183, 66, 3);
      ctx.fillRect(wx + 126, wy + 183, 66, 3);

      // Apex Star Emblem at Top of Loop & Dual Gate Indicators at Bottom
      ctx.fillStyle = tick % 16 < 8 ? '#FACC15' : '#38BDF8';
      ctx.beginPath();
      ctx.arc(cx, cy - innerR - 14, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      break;
    }

    case TileType.SPAWN_P1:
    case TileType.SPAWN_P2: {
      if (showSpawnMarkers) {
        ctx.fillStyle = tile === TileType.SPAWN_P1 ? '#3B82F6' : '#F59E0B';
        ctx.fillRect(wx + 4, wy + 4, 24, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText(tile === TileType.SPAWN_P1 ? 'P1' : 'P2', wx + 9, wy + 20);
      }
      break;
    }

    case TileType.BADNIK_MOTOBUG:
    case TileType.BADNIK_BUZZ:
    case TileType.BADNIK_CRAB:
    case TileType.BADNIK_CHOPPER:
    case TileType.BADNIK_CATERKILLER:
    case TileType.BADNIK_BATBRAIN:
    case TileType.BADNIK_ORBINAUT:
    case TileType.BADNIK_BOMB:
    case TileType.BADNIK_SPINY: {
      if (showSpawnMarkers) {
        drawBadnik(
          ctx,
          {
            id: 'preview',
            type: tile,
            x: wx + 16,
            y: wy + 16,
            startX: wx + 16,
            startY: wy + 16,
            vx: 0,
            vy: 0,
            facing: -1,
            alive: true,
            timer: tick,
            attackCooldown: 0,
          },
          tick
        );
      }
      break;
    }

    // --- ZONE-SPECIFIC GIMMICKS ---
    case TileType.GIMMICK_BUMPER: {
      // Emerald Mountains 360° Pinball Star Bumper
      const pulse = tick % 16 < 8 ? 14 : 13;
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(wx + 16, wy + 16, pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(wx + 16, wy + 16, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case TileType.GIMMICK_DASH_RING: {
      // Emerald Mountains Mid-Air Rainbow Dash Ring
      ctx.save();
      ctx.strokeStyle = tick % 8 < 4 ? '#38BDF8' : '#F43F5E';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(wx + 16, wy + 16, 8, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(wx + 16, wy + 16, 5, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case TileType.GIMMICK_CRUSHER: {
      // Marble Zone Stomping Marble Crusher Pillar
      const drop = Math.max(0, Math.sin(tick * 0.08 + wx * 0.04) * 10);
      ctx.fillStyle = '#4C1D95';
      ctx.fillRect(wx + 2, wy, 28, 22 + drop);
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx + 2, wy, 28, 22 + drop);
      // Bottom crusher spikes
      ctx.fillStyle = '#E2E8F0';
      for (let sx = 4; sx < 28; sx += 8) {
        ctx.beginPath();
        ctx.moveTo(wx + sx, wy + 22 + drop);
        ctx.lineTo(wx + sx + 4, wy + 30 + drop);
        ctx.lineTo(wx + sx + 8, wy + 22 + drop);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case TileType.GIMMICK_LAVA_GEYSER: {
      // Marble Zone Erupting Magma Geyser Vent
      ctx.fillStyle = '#9A3412';
      ctx.fillRect(wx, wy + 8, TILE_SIZE, 24);
      ctx.fillStyle = tick % 8 < 4 ? '#F97316' : '#FACC15';
      ctx.fillRect(wx + 4, wy + 2, 24, 10);
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.moveTo(wx + 8, wy + 4);
      ctx.lineTo(wx + 16, wy - 6 - (tick % 6));
      ctx.lineTo(wx + 24, wy + 4);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case TileType.GIMMICK_LAVA_SHOOTER_LEFT:
    case TileType.GIMMICK_LAVA_SHOOTER_RIGHT: {
      // Neo Starlight Wall-Mounted Lava / Fireball Shooter!
      const isLeft = tile === TileType.GIMMICK_LAVA_SHOOTER_LEFT;
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(wx + 2, wy + 2, 28, 28);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx + 2, wy + 2, 28, 28);
      // Molten Cannon Nozzle
      ctx.fillStyle = '#475569';
      ctx.fillRect(isLeft ? wx - 4 : wx + 18, wy + 9, 18, 14);
      ctx.fillStyle = tick % 10 < 5 ? '#EA580C' : '#FACC15';
      ctx.beginPath();
      ctx.arc(isLeft ? wx + 2 : wx + 30, wy + 16, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case TileType.GIMMICK_CONVEYOR_RIGHT:
    case TileType.GIMMICK_CONVEYOR_LEFT: {
      // Neo Starlight Neon Conveyor Belt
      const isRight = tile === TileType.GIMMICK_CONVEYOR_RIGHT;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(wx, wy, TILE_SIZE, 14);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx + 1, wy + 1, TILE_SIZE - 2, 12);
      const shift = ((tick * (isRight ? 1 : -1)) % 8 + 8) % 8;
      ctx.fillStyle = '#FACC15';
      for (let cx = shift; cx < TILE_SIZE - 4; cx += 8) {
        ctx.fillRect(wx + cx, wy + 4, 4, 6);
      }
      break;
    }

    case TileType.GIMMICK_UPDRAFT: {
      // Hill Top Peaks Alpine Wind Updraft Fan
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(wx + 2, wy + 20, 28, 12);
      ctx.fillStyle = '#38BDF8';
      const bladeW = Math.abs(Math.sin(tick * 0.45)) * 22;
      ctx.fillRect(wx + 16 - bladeW / 2, wy + 16, bladeW, 4);
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
      ctx.lineWidth = 1.5;
      for (let s = 0; s < 3; s++) {
        const sy = wy + 14 - ((tick * 1.8 + s * 12) % 36);
        ctx.beginPath();
        ctx.moveTo(wx + 6 + s * 8, sy);
        ctx.lineTo(wx + 6 + s * 8, sy - 8);
        ctx.stroke();
      }
      break;
    }

    case TileType.GIMMICK_TELEPORT_ORB: {
      // Hill Top Peaks Cloud Warp Cannon
      ctx.fillStyle = '#1D4ED8';
      ctx.beginPath();
      ctx.arc(wx + 16, wy + 16, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = tick % 8 < 4 ? '#38BDF8' : '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(wx + 16, wy + 16, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case TileType.GIMMICK_TUBE_ENTRY: {
      // Chemical Plant Travel Tube Intake: glass pipe mouth with blue chemicals
      ctx.fillStyle = '#64748B';
      ctx.fillRect(wx, wy, TILE_SIZE, 8);
      ctx.fillStyle = 'rgba(219, 234, 254, 0.65)';
      ctx.fillRect(wx + 4, wy + 6, 24, 26);
      const entryFluid = 12 + Math.sin(tick * 0.16 + wx * 0.05) * 4;
      ctx.fillStyle = '#0EA5E9';
      ctx.fillRect(wx + 6, wy + 32 - entryFluid, 20, entryFluid);
      ctx.fillStyle = '#7DD3FC';
      ctx.fillRect(wx + 10, wy + 32 - entryFluid, 4, entryFluid);
      // Downward intake arrows
      ctx.fillStyle = tick % 16 < 8 ? '#E0F2FE' : '#FACC15';
      for (let a = 0; a < 2; a++) {
        const ay = wy + 4 + ((tick * 1.6 + a * 10) % 20);
        ctx.beginPath();
        ctx.moveTo(wx + 12, ay);
        ctx.lineTo(wx + 20, ay);
        ctx.lineTo(wx + 16, ay + 6);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case TileType.GIMMICK_TUBE_EXIT: {
      // Chemical Plant Travel Tube Exit Nozzle: chrome throat & rising bubbles
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(wx + 2, wy + 6, TILE_SIZE - 4, TILE_SIZE - 6);
      ctx.fillStyle = '#475569';
      ctx.fillRect(wx, wy, TILE_SIZE, 8);
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(wx + 2, wy + 2, TILE_SIZE - 4, 3);
      // Glowing chemical throat
      ctx.fillStyle = '#0EA5E9';
      ctx.beginPath();
      ctx.ellipse(wx + 16, wy + 18, 10, 8 + Math.sin(tick * 0.2) * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7DD3FC';
      ctx.beginPath();
      ctx.ellipse(wx + 16, wy + 17, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Launch bubbles shooting upward
      ctx.fillStyle = '#E0F2FE';
      for (let b = 0; b < 3; b++) {
        const by = wy + 4 - ((tick * 2.4 + b * 12) % 30);
        ctx.beginPath();
        ctx.arc(wx + 8 + b * 8, by, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case TileType.GIMMICK_ACID_POOL: {
      // Chemical Plant Boiling Toxic Blue Chemical Pool
      ctx.save();
      const acidGrad = ctx.createLinearGradient(wx, wy, wx, wy + TILE_SIZE);
      acidGrad.addColorStop(0, '#E0F2FE');
      acidGrad.addColorStop(0.25, '#38BDF8');
      acidGrad.addColorStop(0.75, '#0284C7');
      acidGrad.addColorStop(1, '#075985');
      ctx.fillStyle = acidGrad;
      ctx.fillRect(wx, wy + 3, TILE_SIZE, TILE_SIZE - 3);
      // Wavy bubbling surface
      ctx.fillStyle = tick % 12 < 6 ? '#BAE6FD' : '#7DD3FC';
      for (let i = 0; i < 4; i++) {
        const waveY = wy + 2 + Math.sin(tick * 0.16 + (wx + i * 8) * 0.14) * 2.2;
        ctx.fillRect(wx + i * 8, waveY, 7, 4);
      }
      // Toxic bubbles rising through the vat
      const bubX = wx + 8 + ((tick + wx) % 18);
      const bubY = wy + 24 - ((tick * 0.45 + wx) % 14);
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(bubX, bubY, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case TileType.GIMMICK_STEAM_VENT: {
      // Chemical Plant Steam Vent: riveted grate with periodic white steam jets
      const ventTick = tick % 150;
      ctx.fillStyle = '#334155';
      ctx.fillRect(wx, wy + 8, TILE_SIZE, TILE_SIZE - 8);
      ctx.fillStyle = '#64748B';
      ctx.fillRect(wx, wy + 8, TILE_SIZE, 4);
      ctx.fillStyle = '#0F172A';
      for (let sx = 4; sx < TILE_SIZE - 2; sx += 6) {
        ctx.fillRect(wx + sx, wy + 14, 3, 14);
      }
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(wx + 3, wy + 11, 2, 2);
      ctx.fillRect(wx + TILE_SIZE - 5, wy + 11, 2, 2);
      if (ventTick < 55) {
        ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
        for (let s = 0; s < 3; s++) {
          const sy = wy + 8 - ((ventTick * 1.6 + s * 12) % 40);
          ctx.beginPath();
          ctx.arc(wx + 8 + s * 8, sy, 5 - s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case TileType.SPIKES_DOWN: {
      // Mystic Caverns Ceiling Spikes: steel plate above, spikes thrust downward
      ctx.fillStyle = '#334155';
      ctx.fillRect(wx, wy, TILE_SIZE, 12);
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      ctx.strokeRect(wx + 0.5, wy + 0.5, TILE_SIZE - 1, 11);
      ctx.fillStyle = pal.hazardColor;
      for (let i = 0; i < 4; i++) {
        const sx = wx + i * 8;
        ctx.beginPath();
        ctx.moveTo(sx + 1, wy + 12);
        ctx.lineTo(sx + 4, wy + 30);
        ctx.lineTo(sx + 7, wy + 12);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case TileType.GIMMICK_STALACTITE: {
      // Mystic Caverns hanging purple rock stalactite (ready to drop!)
      const sway = Math.sin(tick * 0.06 + wx * 0.03) * 1.2;
      ctx.fillStyle = '#4C1D95';
      ctx.beginPath();
      ctx.moveTo(wx + 2, wy);
      ctx.lineTo(wx + 30, wy);
      ctx.lineTo(wx + 18 + sway, wy + 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7E22CE';
      ctx.beginPath();
      ctx.moveTo(wx + 6, wy + 2);
      ctx.lineTo(wx + 16, wy + 2);
      ctx.lineTo(wx + 12 + sway, wy + 20);
      ctx.closePath();
      ctx.fill();
      // Twinkling crystal tip
      ctx.fillStyle = tick % 18 < 9 ? '#22D3EE' : '#A855F7';
      ctx.fillRect(wx + 14 + sway, wy + 26, 4, 4);
      break;
    }

    case TileType.DECO_WATERFALL: {
      // Emerald Mountains Act 2 Cascading Waterfall Decoration!
      ctx.save();
      ctx.fillStyle = 'rgba(14, 165, 233, 0.72)';
      ctx.fillRect(wx + 2, wy, 28, 32);

      // Deep aqua vertical currents
      ctx.fillStyle = 'rgba(2, 132, 199, 0.78)';
      ctx.fillRect(wx + 5, wy, 6, 32);
      ctx.fillRect(wx + 15, wy, 5, 32);
      ctx.fillRect(wx + 23, wy, 4, 32);

      // Animated cascading white/cyan foam streaks scrolling downward
      const scrollY = (tick * 2.4) % 16;
      ctx.fillStyle = 'rgba(224, 242, 254, 0.92)';
      for (let fy = -16; fy < 32; fy += 16) {
        const yPos = wy + fy + scrollY;
        if (yPos >= wy - 6 && yPos <= wy + 28) {
          const clampY = Math.max(wy, yPos);
          const clampH = Math.min(6, wy + 32 - clampY);
          if (clampH > 0) {
            ctx.fillRect(wx + 4, clampY, 4, clampH);
            ctx.fillRect(wx + 13, clampY, 6, clampH);
            ctx.fillRect(wx + 22, clampY, 5, clampH);
          }
        }
      }

      // Shimmering mist spray at left/right edges
      ctx.fillStyle = tick % 6 < 3 ? '#FFFFFF' : '#7DD3FC';
      ctx.fillRect(wx + 1, wy + ((tick * 3) % 28), 2, 4);
      ctx.fillRect(wx + 29, wy + ((tick * 3 + 14) % 28), 2, 4);
      ctx.restore();
      break;
    }

    case TileType.BOSS_EGGMAN:
    case TileType.BOSS_MARBLE:
    case TileType.BOSS_STARLIGHT:
    case TileType.BOSS_HILLTOP:
    case TileType.BOSS_SILVER_SONIC:
    case TileType.BOSS_DEATH_EGG_ROBOT: {
      if (showSpawnMarkers) {
        drawEggmanBoss(
          ctx,
          {
            id: 'preview_boss',
            bossType:
              tile === TileType.BOSS_MARBLE
                ? 'marble'
                : tile === TileType.BOSS_STARLIGHT
                ? 'starlight'
                : tile === TileType.BOSS_HILLTOP
                ? 'hilltop'
                : tile === TileType.BOSS_SILVER_SONIC
                ? 'silversonic'
                : tile === TileType.BOSS_DEATH_EGG_ROBOT
                ? 'deathegg'
                : 'eggman',
            x: wx + 16,
            y: wy + 16,
            startX: wx + 16,
            startY: wy + 16,
            arenaLeft: wx - 264,
            arenaRight: wx + 296,
            engaged: false,
            vx: 0,
            vy: 0,
            facing: -1,
            hp: tile === TileType.BOSS_DEATH_EGG_ROBOT ? 24 : 8,
            maxHp: tile === TileType.BOSS_DEATH_EGG_ROBOT ? 24 : 8,
            invulnTimer: 0,
            ballSwingAngle: 0.4,
            attackTimer: tick,
            alive: true,
          },
          tick
        );
      }
      break;
    }

    default:
      break;
  }
}

function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  const phase = (tick * 0.14) % Math.PI;
  const rx = Math.max(2, Math.abs(Math.cos(phase)) * 7);
  ctx.save();
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, 7, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x - 0.5, y - 0.5, Math.max(1, rx - 1), 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawEggmanBoss(
  ctx: CanvasRenderingContext2D,
  boss: ActiveBoss,
  tick: number,
  customTextures?: Record<string, HTMLCanvasElement>
) {
  ctx.save();

  // ==========================================================================
  // NEW MECHA BOSS 1: HYDRAULIC SLIME-CRUSHER & SIPHON MECH (Chemical Plant)
  // ==========================================================================
  if (boss.bossType === 'chemical') {
    // Arena-wide Chemical Flood (rises when the vat valves open!)
    const flood = boss.floodLevel || 0;
    const floorY = boss.mechFloorY ?? boss.y + 96;
    if (flood > 0.01) {
      const surfaceY = floorY - flood * TILE_SIZE * 3;
      ctx.save();
      ctx.globalAlpha = 0.72;
      const floodGrad = ctx.createLinearGradient(0, surfaceY, 0, floorY);
      floodGrad.addColorStop(0, '#7DD3FC');
      floodGrad.addColorStop(0.3, '#38BDF8');
      floodGrad.addColorStop(1, '#075985');
      ctx.fillStyle = floodGrad;
      ctx.fillRect(boss.arenaLeft, surfaceY, boss.arenaRight - boss.arenaLeft, floorY - surfaceY);
      // Bubbling crest + rising bubbles
      ctx.fillStyle = '#E0F2FE';
      for (let b = 0; b < 12; b++) {
        const bx = boss.arenaLeft + ((b * 71 + tick * 1.6) % Math.max(1, boss.arenaRight - boss.arenaLeft));
        const by = surfaceY + Math.sin(tick * 0.12 + b) * 3;
        ctx.beginPath();
        ctx.arc(bx, by, 3 + (b % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Siphon Vortex intake suction rings
    if (boss.vortexActive) {
      ctx.save();
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.75)';
      ctx.lineWidth = 3;
      for (let r = 0; r < 3; r++) {
        const rad = 30 + ((tick * 3 + r * 26) % 110);
        ctx.globalAlpha = Math.max(0.1, 0.8 - rad / 130);
        ctx.beginPath();
        ctx.arc(boss.x, boss.y + 26, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.translate(boss.x, boss.y);

    // Floating Boss Health Bar
    ctx.fillStyle = '#090D16';
    ctx.fillRect(-30, -54, 60, 7);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(-29, -53, Math.round(58 * (boss.hp / boss.maxHp)), 5);

    if (boss.invulnTimer > 0 && Math.floor(boss.invulnTimer / 2) % 2 === 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.scale(boss.facing, 1);

    // Optional custom chassis plate from the Tileset Studio boss slot
    if (customTextures?.bossChemical) {
      ctx.drawImage(customTextures.bossChemical, -26, -22, 52, 44);
    }

    // Dual hydraulic piston feet driving down toward the arena floor
    const pistonExtend =
      boss.mechPhase === 'piston_stomp'
        ? Math.max(0, Math.sin(tick * 0.35) * 12 + 12)
        : Math.abs(Math.sin(tick * 0.08)) * 4;
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(side * 26 - 6, 6, 12, 18 + pistonExtend);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(side * 26 - 9, 20 + pistonExtend, 18, 8);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(side * 26 - 6, 6, 12, 18 + pistonExtend);
    }

    // Steel vat chassis with yellow hazard trim
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-30, -24, 60, 34);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.strokeRect(-30, -24, 60, 34);
    ctx.fillStyle = '#FACC15';
    for (let sx = -28; sx < 28; sx += 10) {
      ctx.fillRect(sx, -20, 5, 26);
    }
    ctx.fillStyle = '#334155';
    ctx.fillRect(-26, -14, 52, 8);
    ctx.fillStyle = '#0EA5E9';
    ctx.fillRect(-24, -12, 48, 4);

    // Vat porthole bubbling with blue slime
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(0, -2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tick % 20 < 10 ? '#38BDF8' : '#7DD3FC';
    ctx.beginPath();
    ctx.arc(0, -2, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Cooling dome (OPEN while overheating & venting steam for 120 frames)
    const domeOpen = Boolean(boss.overheatFrames && boss.overheatFrames > 0);
    ctx.fillStyle = domeOpen ? '#1E293B' : '#CBD5E1';
    ctx.beginPath();
    ctx.ellipse(0, -30, 20, domeOpen ? 8 : 13, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = domeOpen ? '#FACC15' : '#64748B';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    if (domeOpen) {
      // Exposed glowing cockpit core + venting steam plumes
      ctx.fillStyle = tick % 8 < 4 ? '#FACC15' : '#FDE047';
      ctx.beginPath();
      ctx.arc(0, -24, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
      for (let s = 0; s < 4; s++) {
        const sy = -36 - ((tick * 2.2 + s * 14) % 46);
        ctx.beginPath();
        ctx.arc((s % 2 === 0 ? -1 : 1) * (8 + s * 3), sy, 8 - s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Underslung Slime Siphon intake turbine (spinning fan)
    ctx.save();
    ctx.translate(0, 26);
    ctx.rotate(boss.vortexActive ? tick * 0.9 : tick * 0.18);
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = boss.vortexActive ? '#7DD3FC' : '#64748B';
    for (let f = 0; f < 4; f++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(12, -3);
      ctx.lineTo(12, 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(0, 26, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // ==========================================================================
  // NEW MECHA BOSS 2: EGG DRILL-CRUSHER (Mystic Caverns)
  // ==========================================================================
  if (boss.bossType === 'mystic') {
    const phase = boss.mechPhase || 'drill_rev';
    const stunned = phase === 'wall_crash_stun' && (boss.stunFrames || 0) > 0;
    const burrowing = Boolean(boss.ceilingBurrow);

    ctx.translate(boss.x, boss.y);

    // Floating Boss Health Bar
    ctx.fillStyle = '#090D16';
    ctx.fillRect(-30, -50, 60, 7);
    ctx.fillStyle = '#A855F7';
    ctx.fillRect(-29, -49, Math.round(58 * (boss.hp / boss.maxHp)), 5);

    if (boss.invulnTimer > 0 && Math.floor(boss.invulnTimer / 2) % 2 === 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.scale(boss.facing, 1);

    // Optional custom chassis plate from the Tileset Studio boss slot
    if (customTextures?.bossMystic) {
      ctx.drawImage(customTextures.bossMystic, -24, -24, 48, 48);
    }

    // Rock tremor dust while burrowing through the ceiling
    if (burrowing) {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
      for (let d = 0; d < 4; d++) {
        ctx.beginPath();
        ctx.arc(-24 + d * 16, -26 - ((tick * 2 + d * 9) % 24), 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Heavy tracked treads
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(-32, 12, 64, 16, 7);
    ctx.fill();
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#475569';
    for (let w = -26; w <= 24; w += 10) {
      ctx.beginPath();
      ctx.arc(w, 20, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Purple hull with cyan trim
    ctx.fillStyle = '#6B21A8';
    ctx.beginPath();
    ctx.roundRect(-28, -24, 56, 38, 12);
    ctx.fill();
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#4C1D95';
    ctx.fillRect(-22, -6, 44, 10);
    ctx.fillStyle = '#C084FC';
    ctx.fillRect(-20, -4, 40, 3);

    // Cockpit dome (opens while the engine is stalled after the wall crash!)
    ctx.fillStyle = stunned ? '#0F172A' : '#A5B4FC';
    ctx.beginPath();
    ctx.arc(0, -22, 14, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = stunned ? '#FACC15' : '#818CF8';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (stunned) {
      // Jammed engine sparks & exposed pilot seat
      ctx.fillStyle = tick % 8 < 4 ? '#FACC15' : '#EF4444';
      ctx.beginPath();
      ctx.arc(0, -20, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-2, -30, 4, 10);
      ctx.fillStyle = '#22D3EE';
      for (let s = 0; s < 3; s++) {
        ctx.fillRect(-16 + s * 14, -34 - (tick % 6), 3, 3);
      }
    } else {
      // Dr. Eggman silhouette inside
      ctx.fillStyle = '#090D16';
      ctx.beginPath();
      ctx.arc(0, -22, 7, Math.PI, 0);
      ctx.fill();
    }

    // Rotating conical drill bit (jammed & tilted sideways while stunned)
    ctx.save();
    ctx.translate(26, -2);
    if (stunned) {
      ctx.rotate(0.42);
    } else if (boss.drillSpinning !== false) {
      ctx.rotate(tick * 0.55);
    }
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(26, 0);
    ctx.lineTo(0, 11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#475569';
    for (let g = 0; g < 3; g++) {
      ctx.beginPath();
      ctx.moveTo(4 + g * 7, -10 + g * 3);
      ctx.lineTo(12 + g * 7, 0);
      ctx.lineTo(4 + g * 7, 10 - g * 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Drill tail exhaust
    ctx.fillStyle = tick % 6 < 3 ? '#22D3EE' : '#7E22CE';
    ctx.beginPath();
    ctx.moveTo(-30, -6);
    ctx.lineTo(-42 - (tick % 5), 0);
    ctx.lineTo(-30, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    return;
  }

  // ==========================================================================
  // SPECIAL BOSS 1: SONIC 2 SILVER SONIC (Mecha Sonic Mk. I)
  // ==========================================================================
  if (boss.bossType === 'silversonic') {
    ctx.translate(boss.x, boss.y);

    // Floating Boss Health Bar
    ctx.fillStyle = '#090D16';
    ctx.fillRect(-26, -36, 52, 7);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(-25, -35, Math.round(50 * (boss.hp / boss.maxHp)), 5);

    if (boss.invulnTimer > 0 && Math.floor(boss.invulnTimer / 2) % 2 === 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.scale(boss.facing, 1);
    const cycle = boss.attackTimer % 240;
    const isCurled = cycle >= 120;

    if (isCurled) {
      // Sawblade Spindash / Leap Form: Spinning Chrome Sphere with 8 Razor Sawblade Spines!
      ctx.rotate(boss.ballSwingAngle);
      ctx.fillStyle = '#38BDF8';
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang - 0.22) * 12, Math.sin(ang - 0.22) * 12);
        ctx.lineTo(Math.cos(ang) * 23, Math.sin(ang) * 23);
        ctx.lineTo(Math.cos(ang + 0.22) * 12, Math.sin(ang + 0.22) * 12);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Upright / Roller-Skating Silver Sonic Form!
    // 1. Rear Sawblade Dorsal Quills
    ctx.fillStyle = '#94A3B8';
    [-14, -6, 2].forEach((qy, idx) => {
      ctx.beginPath();
      ctx.moveTo(-4, qy);
      ctx.lineTo(-22 - idx * 2, qy - 5);
      ctx.lineTo(-8, qy + 6);
      ctx.closePath();
      ctx.fill();
    });

    // 2. Chrome Steel Torso & Red Reactor Core
    ctx.fillStyle = '#64748B';
    ctx.fillRect(-9, -4, 18, 14);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-3, -1, 8, 8);

    // 3. Armored Mecha Head & Glowing Crimson-Gold Visor Eye
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.arc(0, -11, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing Visor
    ctx.fillStyle = tick % 8 < 4 ? '#EF4444' : '#FACC15';
    ctx.fillRect(2, -14, 9, 5);

    // 4. Clawed Steel Arm
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(4, 0, 11, 5);

    // 5. Motorized Red Roller-Skate Boots & Spinning Wheels
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-10, 10, 9, 6);
    ctx.fillRect(2, 10, 10, 6);
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(-6, 16, 3, 0, Math.PI * 2);
    ctx.arc(7, 16, 3, 0, Math.PI * 2);
    ctx.fill();

    // Skate Jet Exhaust Flame during Dash Phase
    if (cycle < 70) {
      ctx.fillStyle = tick % 4 < 2 ? '#F97316' : '#38BDF8';
      ctx.beginPath();
      ctx.moveTo(-11, 11);
      ctx.lineTo(-22, 13);
      ctx.lineTo(-11, 16);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
    return;
  }

  // ==========================================================================
  // SPECIAL BOSS 2: SONIC 2 FINAL BOSS — GIANT 2.4X DEATH EGG ROBOT!
  // ==========================================================================
  if (boss.bossType === 'deathegg') {
    const scale = 2.4;

    // 1. Render Off-Screen Targeting Reticle when the Death Egg Robot launches into the sky!
    if (boss.targetReticleActive && boss.targetReticleX !== undefined) {
      const rx = boss.targetReticleX;
      const ry = boss.targetReticleY ?? boss.startY + 8;
      const isLocked = Boolean(boss.targetReticleLocked);
      const flashFast = isLocked ? tick % 4 < 2 : tick % 10 < 5;
      const reticleColor = isLocked
        ? flashFast
          ? '#EF4444'
          : '#FACC15'
        : flashFast
        ? '#FACC15'
        : '#38BDF8';

      ctx.save();
      // Vertical drop trajectory line from upper hangar ceiling
      ctx.strokeStyle = isLocked
        ? 'rgba(239, 68, 68, 0.55)'
        : 'rgba(250, 204, 21, 0.35)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(rx, ry - 380);
      ctx.lineTo(rx, ry);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sonic 2 Crosshair Targeting Reticle at Landing Spot (Scaled for 2.4x Boss!)
      ctx.translate(rx, ry);
      ctx.strokeStyle = reticleColor;
      ctx.lineWidth = 3;

      // Outer Corner Brackets [ + ]
      const bSize = isLocked ? 44 : 50 + Math.sin(tick * 0.25) * 4;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(-bSize, -bSize + 14);
      ctx.lineTo(-bSize, -bSize);
      ctx.lineTo(-bSize + 14, -bSize);
      // Top-Right
      ctx.moveTo(bSize - 14, -bSize);
      ctx.lineTo(bSize, -bSize);
      ctx.lineTo(bSize, -bSize + 14);
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(-bSize, bSize - 14);
      ctx.lineTo(-bSize, bSize);
      ctx.lineTo(-bSize + 14, bSize);
      // Bottom-Right
      ctx.moveTo(bSize - 14, bSize);
      ctx.lineTo(bSize, bSize);
      ctx.lineTo(bSize, bSize - 14);
      ctx.stroke();

      // Inner Target Circle & Crosshair Ticks
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.moveTo(-34, 0);
      ctx.lineTo(-10, 0);
      ctx.moveTo(10, 0);
      ctx.lineTo(34, 0);
      ctx.moveTo(0, -34);
      ctx.lineTo(0, -10);
      ctx.moveTo(0, 10);
      ctx.lineTo(0, 34);
      ctx.stroke();

      // Center Lock Dot
      ctx.fillStyle = reticleColor;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Label above reticle
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillStyle = reticleColor;
      ctx.fillText(isLocked ? 'TARGET LOCKED!' : 'TARGETING...', -44, -bSize - 10);
      ctx.restore();
    }

    // If the Death Egg Robot has launched completely off-screen, only the Targeting Reticle is visible!
    if (boss.deatheggPhase === 'offscreen_targeting' || boss.y < boss.startY - 340) {
      ctx.restore();
      return;
    }

    // Anchor origin at (boss.x, boss.y - 34) so the 2.4x feet (at +34 * 2.4 = +81.6) stand on the hangar floor!
    const baseOriginY = boss.y - 34;
    ctx.translate(boss.x, baseOriginY);

    // Giant Floating Final Boss Health Bar (24 HP — 2x More Health!)
    ctx.fillStyle = '#090D16';
    ctx.fillRect(-64, -56 * scale, 128, 10);
    ctx.fillStyle = boss.hp > 8 ? '#EF4444' : '#FACC15';
    ctx.fillRect(-62, -56 * scale + 1.5, Math.round(124 * (boss.hp / boss.maxHp)), 7);

    // Scale entire Death Egg Robot by 2.4x!
    ctx.scale(boss.facing * scale, scale);

    if (boss.invulnTimer > 0 && Math.floor(boss.invulnTimer / 2) % 2 === 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -8, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    const phase = boss.deatheggPhase || 'walk_forward';
    const isPrepWindow =
      phase === 'stop_pause' ||
      phase === 'step_back_prep' ||
      phase === 'launch_up';
    const armsLaunched = boss.armsLaunched || 0;
    const legStride =
      phase === 'walk_forward' ? Math.sin(boss.ballSwingAngle * 2) * 9 : 0;

    // 1. Far-Side / Lower Articulated Arm & Spiked Hand (drawn behind torso)
    const backHandX = isPrepWindow
      ? 6
      : phase === 'fire_arms'
      ? 26
      : 22 - Math.sin(boss.ballSwingAngle) * 5;
    const backHandY = isPrepWindow
      ? 22
      : phase === 'fire_arms'
      ? 10
      : 9 - Math.cos(boss.ballSwingAngle) * 5;

    ctx.fillStyle = '#64748B';
    ctx.fillRect(2, backHandY - 4, Math.max(8, backHandX - 8), 8);
    if (armsLaunched < 2) {
      // Far-Side Spiked Hand Cuff & 3 Razor Prongs
      ctx.fillStyle = '#EAB308';
      ctx.fillRect(backHandX - 6, backHandY - 7, 10, 14);
      ctx.fillStyle = '#E2E8F0';
      [-5, 0, 5].forEach((cy) => {
        ctx.beginPath();
        ctx.moveTo(backHandX + 4, backHandY + cy);
        ctx.lineTo(backHandX + 12, backHandY + cy + 1.5);
        ctx.lineTo(backHandX + 4, backHandY + cy + 3);
        ctx.closePath();
        ctx.fill();
      });
    }

    // 2. Rear Jetpack Thruster Backpack & Exhaust Plume
    ctx.fillStyle = '#475569';
    ctx.fillRect(-32, -24, 12, 26);
    const jetActive =
      phase === 'launch_up' ||
      phase === 'descend_land' ||
      phase === 'step_back_prep';
    ctx.fillStyle = tick % 4 < 2 ? '#F97316' : '#FACC15';
    ctx.beginPath();
    ctx.moveTo(-31, 2);
    ctx.lineTo(-26, (jetActive ? 28 : 16) + (tick % 6) * 2.5);
    ctx.lineTo(-21, 2);
    ctx.closePath();
    ctx.fill();

    // 3. Heavy Articulated Mecha Legs & Stomping Yellow Feet
    ctx.fillStyle = '#64748B';
    ctx.fillRect(-14 - legStride * 0.5, 14, 10, 16);
    ctx.fillRect(4 + legStride * 0.5, 14, 10, 16);
    ctx.fillStyle = '#EAB308';
    ctx.fillRect(-18 - legStride * 0.5, 26, 18, 8);
    ctx.fillRect(2 + legStride * 0.5, 26, 18, 8);

    // 4. Enormous Spherical Crimson-and-Gold Eggman Mecha Belly & CHEST WEAK POINT
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(0, -4, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#090D16';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Eggman Jacket Yellow Stripes & Front Chest Core Target
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(-5, -28, 4, 48);
    ctx.fillRect(3, -28, 4, 48);

    // Front Upper-Middle Chest Weak Point Emblem (glows subtly when unguarded!)
    const chestExposed = isPrepWindow || armsLaunched >= 1;
    ctx.fillStyle =
      chestExposed && tick % 6 < 3 ? '#FEF08A' : '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(11, -13);
    ctx.lineTo(25, -6);
    ctx.lineTo(11, 1);
    ctx.closePath();
    ctx.fill();

    // 5. Giant Domed Mecha Eggman Head, Green Optic Eyes & Spiked Mustache (Top Hazard)
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(0, -34, 18, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Glowing Green Mecha Eyes
    ctx.fillStyle = '#090D16';
    ctx.fillRect(2, -43, 12, 7);
    ctx.fillStyle = tick % 10 < 5 ? '#22C55E' : '#4ADE80';
    ctx.fillRect(4, -42, 8, 5);

    // Jagged Steel Mustache & Red Nose Cone
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-4, -35, 22, 6);
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(14, -36, 4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Near-Side Shoulder Pauldron & Front 3-Pronged Spiked Hand!
    const frontHandX = isPrepWindow
      ? 10
      : phase === 'fire_arms'
      ? 32
      : 30 + Math.sin(boss.ballSwingAngle) * 7;
    const frontHandY = isPrepWindow
      ? 19
      : phase === 'fire_arms'
      ? -4
      : -3 + Math.cos(boss.ballSwingAngle) * 6;

    ctx.fillStyle = '#EAB308';
    ctx.beginPath();
    ctx.arc(-4, -8, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Near-Side Forearm
    ctx.fillStyle = '#94A3B8';
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-2, -6);
    ctx.lineTo(frontHandX - 4, frontHandY);
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#94A3B8';
    ctx.stroke();
    ctx.restore();

    // Near-Side Spiked Hand (only drawn if not currently launched as a projectile!)
    if (armsLaunched === 0) {
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(frontHandX - 6, frontHandY - 8, 11, 16);
      ctx.strokeStyle = '#090D16';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(frontHandX - 6, frontHandY - 8, 11, 16);
      // 3 Razor Claw Prongs
      ctx.fillStyle = '#F8FAFC';
      [-6, 0, 6].forEach((cy) => {
        ctx.beginPath();
        ctx.moveTo(frontHandX + 5, frontHandY + cy - 2);
        ctx.lineTo(frontHandX + 14, frontHandY + cy);
        ctx.lineTo(frontHandX + 5, frontHandY + cy + 2);
        ctx.closePath();
        ctx.fill();
      });
    }

    ctx.restore();
    return;
  }

  if (boss.bossType === 'marble') {
    // UNIQUE MARBLE ZONE BOSS: Underslung Molten Magma Torch & Fireball Dropper
    const nozzleX = boss.x;
    const nozzleY = boss.y + 20;

    // Glowing Magma Plume beneath the furnace nozzle
    const flameLen = 12 + (tick % 6) * 2.2;
    ctx.fillStyle = tick % 4 < 2 ? '#EA580C' : '#FACC15';
    ctx.beginPath();
    ctx.moveTo(nozzleX - 9, nozzleY + 4);
    ctx.lineTo(nozzleX, nozzleY + 6 + flameLen);
    ctx.lineTo(nozzleX + 9, nozzleY + 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(nozzleX, nozzleY + 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Underslung Magma Furnace Housing
    ctx.fillStyle = '#334155';
    ctx.fillRect(nozzleX - 11, boss.y + 12, 22, 11);
    ctx.strokeStyle = '#F97316';
    ctx.lineWidth = 2;
    ctx.strokeRect(nozzleX - 11, boss.y + 12, 22, 11);
  } else if (boss.bossType === 'starlight') {
    // UNIQUE NEO STARLIGHT ZONE BOSS: Rotating Cyber Spike-Mine Turbine & Twin Laser Emitter!
    const turbX = boss.x;
    const turbY = boss.y + 24;

    // Cyber Dispenser Bay Housing
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(turbX - 14, boss.y + 11, 28, 10);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.strokeRect(turbX - 14, boss.y + 11, 28, 10);

    // Spinning Electro-Spike Ring underneath the pod
    for (let s = 0; s < 6; s++) {
      const ang = boss.ballSwingAngle + (s * Math.PI) / 3;
      const sx = turbX + Math.cos(ang) * 14;
      const sy = turbY + Math.sin(ang) * 14;
      ctx.fillStyle = s % 2 === 0 ? '#38BDF8' : '#EC4899';
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Cyber Core
    ctx.fillStyle = tick % 6 < 3 ? '#EC4899' : '#38BDF8';
    ctx.beginPath();
    ctx.arc(turbX, turbY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(turbX, turbY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (boss.bossType === 'hilltop') {
    // UNIQUE HILL TOP PEAKS ZONE BOSS: Volcanic Pyro-Sub Thruster & Dual Mortar Tubes!
    const jetX = boss.x;
    const jetY = boss.y + 22;

    // Roaring Volcanic Thruster Plume beneath the Pyro-Sub
    const plumeH = 15 + (tick % 5) * 2.5;
    ctx.fillStyle = tick % 4 < 2 ? '#EF4444' : '#F97316';
    ctx.beginPath();
    ctx.moveTo(jetX - 12, jetY);
    ctx.lineTo(jetX - 5, jetY + plumeH);
    ctx.lineTo(jetX, jetY + plumeH + 6);
    ctx.lineTo(jetX + 5, jetY + plumeH);
    ctx.lineTo(jetX + 12, jetY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.moveTo(jetX - 6, jetY);
    ctx.lineTo(jetX, jetY + plumeH * 0.7);
    ctx.lineTo(jetX + 6, jetY);
    ctx.closePath();
    ctx.fill();

    // Armored Volcanic Thruster Skirt
    ctx.fillStyle = '#7F1D1D';
    ctx.fillRect(jetX - 14, boss.y + 12, 28, 10);
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.strokeRect(jetX - 14, boss.y + 12, 28, 10);
  } else {
    // 1. Chain & Swinging Checkered Wrecking Ball
    const ballX = boss.x + Math.sin(boss.ballSwingAngle) * 58;
    const ballY = boss.y + Math.cos(boss.ballSwingAngle) * 58;

    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const lx = boss.x + (ballX - boss.x) * t;
      const ly = boss.y + (ballY - boss.y) * t;
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Checkered Wrecking Ball
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(ballX - 8, ballY - 8, 8, 8);
    ctx.fillRect(ballX, ballY, 8, 8);
    ctx.strokeStyle = '#090D16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballX, ballY, 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 2. Egg Mobile Pod
  ctx.translate(boss.x, boss.y);

  // Floating Boss Health Bar above Egg Mobile
  ctx.fillStyle = '#090D16';
  ctx.fillRect(-26, -38, 52, 7);
  ctx.fillStyle =
    boss.bossType === 'marble'
      ? '#F97316'
      : boss.bossType === 'starlight'
      ? '#38BDF8'
      : boss.bossType === 'hilltop'
      ? '#EF4444'
      : boss.hp > 3
      ? '#EF4444'
      : '#FACC15';
  ctx.fillRect(-25, -37, Math.round(50 * (boss.hp / boss.maxHp)), 5);

  if (boss.invulnTimer > 0 && Math.floor(boss.invulnTimer / 2) % 2 === 0) {
    ctx.scale(boss.facing, 1);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.scale(boss.facing, 1);

  // Zone-specific top/front weapon barrels on the Egg Mobile!
  if (boss.bossType === 'starlight') {
    // Twin Forward Neon Laser Cannons
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(14, 0, 14, 6);
    ctx.fillStyle = tick % 6 < 3 ? '#EC4899' : '#38BDF8';
    ctx.fillRect(25, 1, 4, 4);
  } else if (boss.bossType === 'hilltop') {
    // Twin Upper Volcanic Mortar Silos & Forward Solar Flame Barrel
    ctx.fillStyle = '#475569';
    ctx.fillRect(-16, -16, 7, 12);
    ctx.fillRect(9, -16, 7, 12);
    ctx.fillStyle = '#F97316';
    ctx.fillRect(14, 1, 14, 7);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(25, 2, 4, 5);
  }

  // Rear Jet Thruster Flame
  ctx.fillStyle =
    boss.bossType === 'starlight'
      ? tick % 4 < 2
        ? '#38BDF8'
        : '#EC4899'
      : tick % 4 < 2
      ? '#F97316'
      : '#FACC15';
  ctx.beginPath();
  ctx.moveTo(-22, -2);
  ctx.lineTo(-34, 2);
  ctx.lineTo(-22, 6);
  ctx.closePath();
  ctx.fill();

  // Dr. Eggman inside cockpit
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(-8, -16, 16, 12);
  ctx.fillStyle = '#FDE68A';
  ctx.beginPath();
  ctx.arc(0, -18, 7, 0, Math.PI * 2);
  ctx.fill();
  // Mustache & Goggles
  ctx.fillStyle = '#B45309';
  ctx.fillRect(-2, -17, 11, 4);
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(1, -21, 5, 3);

  // Metallic Egg Mobile Hemisphere Hull (Unique armor tint per Zone Boss!)
  ctx.fillStyle =
    boss.bossType === 'marble'
      ? '#C084FC'
      : boss.bossType === 'starlight'
      ? '#0EA5E9'
      : boss.bossType === 'hilltop'
      ? '#DC2626'
      : '#CBD5E1';
  ctx.beginPath();
  ctx.arc(0, -2, 22, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#1E293B';
  ctx.fillRect(-22, -4, 44, 6);
  // Hazard Trim
  ctx.fillStyle =
    boss.bossType === 'marble'
      ? '#F97316'
      : boss.bossType === 'starlight'
      ? '#EC4899'
      : boss.bossType === 'hilltop'
      ? '#FACC15'
      : '#FACC15';
  for (let hx = -18; hx <= 14; hx += 8) {
    ctx.fillRect(hx, -3, 4, 4);
  }

  ctx.restore();
}

function drawBadnik(ctx: CanvasRenderingContext2D, b: ActiveBadnik, tick: number) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(b.facing, 1);

  if (b.type === TileType.BADNIK_MOTOBUG) {
    if (b.isCharging) {
      ctx.fillStyle = tick % 4 < 2 ? '#F97316' : '#FACC15';
      ctx.beginPath();
      ctx.moveTo(-10, 4);
      ctx.lineTo(-20, 1);
      ctx.lineTo(-10, 8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(0, 6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = b.isCharging ? '#EF4444' : '#DC2626';
    ctx.beginPath();
    ctx.arc(0, 2, 11, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-3, -6, 5, 5);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(5, -3, 4, 4);
  } else if (b.type === TileType.BADNIK_BUZZ) {
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(-10, -4, 18, 8);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(-4, 0, 12, 6);
    if (b.attackCooldown > 55) {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(8, 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
    const wingY = tick % 4 < 2 ? -12 : -7;
    ctx.fillRect(-4, wingY, 10, 6);
  } else if (b.type === TileType.BADNIK_CRAB) {
    const clawOffset = b.isCharging ? -4 : 0;
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-12, -6, 24, 12);
    ctx.fillRect(-16, -12 + clawOffset, 6, 8);
    ctx.fillRect(10, -12 + clawOffset, 6, 8);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-6, -10, 4, 5);
    ctx.fillRect(2, -10, 4, 5);
  } else if (b.type === TileType.BADNIK_CHOPPER) {
    // Retextured Emerald Mountains Act 2 Exclusive: 16-Bit Chopper Piranha Badnik!
    ctx.save();
    // Tilt vertically based on leap velocity (leaping up vs diving down)
    const pitch = b.vy < -0.5 ? -Math.PI * 0.42 : b.vy > 0.5 ? Math.PI * 0.38 : -Math.PI * 0.18;
    ctx.rotate(pitch);

    // Forked Aqua-Cyan Tail Fin
    ctx.fillStyle = '#06B6D4';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-19, -9);
    ctx.lineTo(-15, 0);
    ctx.lineTo(-19, 9);
    ctx.closePath();
    ctx.fill();

    // Spiky Dorsal Fin (Top)
    ctx.fillStyle = '#22D3EE';
    ctx.beginPath();
    ctx.moveTo(-6, -9);
    ctx.lineTo(-1, -17);
    ctx.lineTo(5, -9);
    ctx.closePath();
    ctx.fill();

    // Armored Vermilion/Crimson Piranha Body
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orange Scale Plate Highlights
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.ellipse(-1, -2, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Metallic Chrome Belly Plate
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.ellipse(1, 5, 9, 4, 0, 0, Math.PI);
    ctx.fill();

    // Articulated Steel Lower Jaw + Snapping Saw-Teeth
    const jawOpen = b.vy <= 0 && tick % 10 < 6 ? 4 : 1;
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(2, 2 + jawOpen, 11, 4);

    // Razor-Sharp White Piranha Fangs
    ctx.fillStyle = '#FFFFFF';
    for (let tx = 3; tx <= 11; tx += 3) {
      ctx.fillRect(tx, -1, 2, 3);
      ctx.fillRect(tx, 1 + jawOpen, 2, 2);
    }

    // Aqua Side Pectoral Fin
    ctx.fillStyle = '#0891B2';
    ctx.beginPath();
    ctx.moveTo(-2, 2);
    ctx.lineTo(-8, 8);
    ctx.lineTo(1, 6);
    ctx.closePath();
    ctx.fill();

    // Fierce Yellow Optic Sensor Eye & Black Pupil
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(6, -4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090D16';
    ctx.fillRect(7, -5, 2, 2);

    // Water Droplet Splashes when leaping!
    if (tick % 6 < 3) {
      ctx.fillStyle = '#7DD3FC';
      ctx.fillRect(-16, -12, 2, 2);
      ctx.fillRect(14, -8, 2, 2);
    }
    ctx.restore();
  } else if (b.type === TileType.BADNIK_CATERKILLER) {
    // Marble Zone 1: Undulating Spiked Caterkiller (Damages like spikes if jumped on!)
    for (let seg = 3; seg >= 0; seg--) {
      const sx = -seg * 7 + 8;
      const sy = Math.sin(tick * 0.25 + seg) * 3;
      ctx.fillStyle = seg === 0 ? '#EC4899' : '#A855F7';
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();
      if (seg > 0) {
        // Prominent metallic dorsal spikes on top of body segments
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.moveTo(sx - 2.5, sy - 5);
        ctx.lineTo(sx, sy - 12);
        ctx.lineTo(sx + 2.5, sy - 5);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(9, -4, 3, 3);
  } else if (b.type === TileType.BADNIK_BATBRAIN) {
    // Marble Zone 2: Swooping Cavern Batbrain
    const flap = Math.sin(tick * 0.45) * 7;
    ctx.fillStyle = '#6366F1';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, -6 + flap);
    ctx.lineTo(-8, 6);
    ctx.moveTo(0, 0);
    ctx.lineTo(15, -6 + flap);
    ctx.lineTo(8, 6);
    ctx.fill();
    ctx.fillStyle = '#312E81';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F43F5E';
    ctx.fillRect(1, -3, 4, 3);
  } else if (b.type === TileType.BADNIK_ORBINAUT) {
    // Neo Starlight 1: Orbiting Spike-Mine Orbinaut (Damages like spikes if jumped on!)
    ctx.fillStyle = '#0EA5E9';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(2, -3, 4, 4);
    for (let m = 0; m < 4; m++) {
      const ang = tick * 0.09 + (m * Math.PI) / 2;
      const mx = Math.cos(ang) * 16;
      const my = Math.sin(ang) * 16;
      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // Sharp spike points on each orbiting mine
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(mx - 1, my - 7, 2, 3);
      ctx.fillRect(mx - 1, my + 4, 2, 3);
      ctx.fillRect(mx - 7, my - 1, 3, 2);
      ctx.fillRect(mx + 4, my - 1, 3, 2);
    }
  } else if (b.type === TileType.BADNIK_BOMB) {
    // Neo Starlight 2: Proximity Shrapnel Walking Bomb
    ctx.fillStyle = b.isCharging && tick % 4 < 2 ? '#EF4444' : '#1E293B';
    ctx.beginPath();
    ctx.arc(0, 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(-2, -12, 4, 5);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2, -2, 4, 4);
  } else if (b.type === TileType.BADNIK_SPINY) {
    // Hill Top Peaks 1: Twin Plasma-Mortar Spiny
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.arc(0, 2, 11, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#F43F5E';
    for (let s = -8; s <= 8; s += 8) {
      ctx.beginPath();
      ctx.moveTo(s - 3, -6);
      ctx.lineTo(s, -14);
      ctx.lineTo(s + 3, -6);
      ctx.fill();
    }
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(4, -3, 4, 3);
  }
  ctx.restore();
}

function drawPlayerSprite(ctx: CanvasRenderingContext2D, p: PlayerEntity, tick: number) {
  if (p.hurtTimer > 0 && Math.floor(p.hurtTimer / 3) % 2 === 0) return;

  const spec = CHARACTER_SPECS[p.character];
  const hyperColors = ['#60A5FA', '#4ADE80', '#FDE047', '#C084FC', '#F8FAFC', '#22D3EE', '#F87171'];
  const bodyColor = p.isHyper
    ? hyperColors[Math.floor(tick / 2) % hyperColors.length]
    : p.isSuper
    ? tick % 8 < 4
      ? spec.superColor
      : '#FEF9C3'
    : spec.primaryColor;

  ctx.save();
  ctx.translate(p.x, p.y);

  // Hyper Form After-Image Ghost Trail when moving
  if (p.isHyper && (Math.abs(p.vx) > 1.5 || Math.abs(p.vy) > 1.5)) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = hyperColors[(Math.floor(tick / 2) + 3) % hyperColors.length];
    ctx.beginPath();
    ctx.arc(-p.vx * 1.6, -p.vy * 1.2, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = hyperColors[(Math.floor(tick / 2) + 5) % hyperColors.length];
    ctx.beginPath();
    ctx.arc(-p.vx * 3.2, -p.vy * 2.4, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (p.inLoop || (p.onGround && Math.abs(p.groundAngle) > 0.05)) {
    ctx.rotate(p.groundAngle);
  }

  // Super / Hyper Aura OR Invincibility / Elemental Shield Aura
  if (p.isSuper) {
    ctx.save();
    ctx.strokeStyle = p.isHyper
      ? hyperColors[(Math.floor(tick / 2) + 2) % hyperColors.length]
      : tick % 6 < 3
      ? '#FACC15'
      : '#FFFFFF';
    ctx.fillStyle = p.isHyper ? 'rgba(56, 189, 248, 0.25)' : 'rgba(250, 204, 21, 0.22)';
    ctx.lineWidth = p.isHyper ? 3 : 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 21 + Math.sin(tick * 0.5) * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Super Tails' 4 Orbiting Golden Flicky Birds!
    if (p.character === 'tails') {
      for (let f = 0; f < 4; f++) {
        const ang = tick * 0.1 + (f * Math.PI) / 2;
        const fx = Math.cos(ang) * 28;
        const fy = Math.sin(ang) * 18 - 8;
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(fx - 2, fy - 4, 4, 2);
      }
    }
    ctx.restore();
  } else if (p.invincibleTimer > 0) {
    ctx.save();
    ctx.strokeStyle = tick % 6 < 3 ? '#FACC15' : '#FEF08A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 20 + Math.sin(tick * 0.4) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (p.shield !== 'none') {
    ctx.save();
    ctx.strokeStyle =
      p.shield === 'flame'
        ? '#F97316'
        : p.shield === 'lightning'
        ? '#38BDF8'
        : p.shield === 'bubble'
        ? '#34D399'
        : '#60A5FA';
    ctx.fillStyle =
      p.shield === 'flame'
        ? 'rgba(249, 115, 22, 0.2)'
        : p.shield === 'lightning'
        ? 'rgba(56, 189, 248, 0.2)'
        : p.shield === 'bubble'
        ? 'rgba(52, 211, 153, 0.22)'
        : 'rgba(96, 165, 250, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 19 + Math.sin(tick * 0.2) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.scale(p.facing, 1);

  const isBall =
    p.state === 'roll' ||
    p.state === 'jump' ||
    p.state === 'spindash' ||
    p.state === 'hammer_drop' ||
    p.state === 'dropdash_ready';

  if (isBall) {
    const rot = tick * (p.state === 'hammer_drop' ? 0.75 : 0.45);
    ctx.save();
    if (p.state === 'spindash') {
      ctx.scale(1.18, 0.84);
      ctx.translate(0, 3);
    } else if (p.state === 'hammer_drop') {
      // Mighty's Hammer Drop downward slam aura!
      ctx.strokeStyle = tick % 4 < 2 ? '#EF4444' : '#FACC15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 4, 17, 0, Math.PI);
      ctx.stroke();
    }
    ctx.rotate(rot);

    ctx.fillStyle = p.state === 'dropdash_ready' && tick % 4 < 2 ? '#38BDF8' : bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    if (p.character === 'mighty') {
      // Mighty's armored crimson shell bands when curled!
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 11, -0.8, 0.8);
      ctx.stroke();
    } else {
      for (let a = 0; a < 4; a++) {
        const ang = (a * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 9, Math.sin(ang) * 9);
        ctx.lineTo(Math.cos(ang + 0.35) * 16, Math.sin(ang + 0.35) * 16);
        ctx.lineTo(Math.cos(ang + 0.7) * 9, Math.sin(ang + 0.7) * 9);
        ctx.fill();
      }
    }

    ctx.fillStyle = spec.secondaryColor;
    ctx.beginPath();
    ctx.arc(2, -2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (p.character === 'tails') {
      ctx.fillStyle = p.isSuper ? '#FDE047' : '#F59E0B';
      const wave = Math.sin(tick * 0.4) * 4;
      ctx.beginPath();
      ctx.ellipse(-15, 2 + wave, 8, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-22, wave, 5, 4);
    }
  } else {
    const crouchY = p.state === 'crouch' ? 5 : 0;

    if (p.character === 'tails') {
      if (p.state === 'fly' || p.state === 'fly_tired') {
        const rotorW = Math.sin(tick * (p.state === 'fly_tired' ? 0.3 : 0.8)) * 18;
        ctx.fillStyle = p.isSuper ? '#FDE047' : '#F59E0B';
        ctx.fillRect(-Math.abs(rotorW), -18, Math.abs(rotorW) * 2, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-16, -18, 5, 4);
        ctx.fillRect(11, -18, 5, 4);
      } else {
        const wag = Math.sin(tick * 0.3) * 3;
        ctx.fillStyle = p.isSuper ? '#FDE047' : '#F59E0B';
        ctx.beginPath();
        ctx.ellipse(-12, 2 + wag, 9, 4, 0.2, 0, Math.PI * 2);
        ctx.ellipse(-12, 7 - wag, 9, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-19, wag, 4, 5);
      }
    }

    ctx.fillStyle = bodyColor;

    if (p.character === 'sonic') {
      // Super Sonic quills point sharply upward!
      const superLift = p.isSuper ? -5 : 0;
      ctx.beginPath();
      ctx.moveTo(0, -13 + crouchY);
      ctx.lineTo(-16, -9 + crouchY + superLift);
      ctx.lineTo(-4, -3 + crouchY);
      ctx.lineTo(-17, 1 + crouchY + superLift);
      ctx.lineTo(-3, 5 + crouchY);
      ctx.closePath();
      ctx.fill();
    } else if (p.character === 'knuckles') {
      const glideExtend = p.state === 'glide' ? -6 : 0;
      ctx.fillRect(-13 + glideExtend, -8 + crouchY, 8, 15);
      ctx.fillRect(-10 + glideExtend, -4 + crouchY, 6, 14);
    } else if (p.character === 'tails') {
      ctx.beginPath();
      ctx.moveTo(-4, -10 + crouchY);
      ctx.lineTo(-8, -19 + crouchY);
      ctx.lineTo(1, -12 + crouchY);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-6, -16 + crouchY, 3, 4);
      ctx.fillStyle = bodyColor;
    } else if (p.character === 'mighty') {
      // Mighty the Armadillo: Signature Crimson Armored Shell on Back & Rounded Ears!
      ctx.fillStyle = p.isSuper ? spec.superColor : '#DC2626';
      ctx.beginPath();
      ctx.arc(-5, 0 + crouchY, 12, Math.PI * 0.55, Math.PI * 1.55);
      ctx.fill();
      ctx.strokeStyle = '#991B1B';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Rounded Armadillo Ear
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(-3, -13 + crouchY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1E293B';
    } else if (p.character === 'ray') {
      // Ray the Flying Squirrel: Fluffy Squirrel Tail & Patagium Wing Cape when Gliding!
      const tailWag = Math.sin(tick * 0.32) * 3;
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(-13, 1 + crouchY + tailWag, 8, 5, 0.35, 0, Math.PI * 2);
      ctx.fill();
      if (p.state === 'ray_glide') {
        // Outstretched Flying Squirrel Cape Membrane!
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.moveTo(-12, -2);
        ctx.lineTo(8, 2);
        ctx.lineTo(-4, 11);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      // Ray's upward hair tuft
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(-1, -13 + crouchY);
      ctx.lineTo(4, -18 + crouchY);
      ctx.lineTo(5, -11 + crouchY);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(0, -5 + crouchY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = spec.secondaryColor;
    ctx.fillRect(1, -5 + crouchY, 8, 5);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2, -10 + crouchY, 4, 6);
    ctx.fillStyle = p.isSuper ? '#EF4444' : spec.eyeColor;
    ctx.fillRect(4, -8 + crouchY, 2, 4);

    ctx.fillStyle = bodyColor;
    ctx.fillRect(-6, 2 + crouchY, 11, 8);
    if (p.character === 'sonic') {
      ctx.fillStyle = spec.secondaryColor;
      ctx.fillRect(-2, 3 + crouchY, 6, 6);
    } else if (p.character === 'knuckles') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-2, 3 + crouchY, 6, 3);
    }

    ctx.fillStyle = '#FFFFFF';
    const armSwing = p.state === 'run' || p.state === 'walk' ? Math.sin(p.animTimer * 0.5) * 5 : 0;
    const gloveX = p.state === 'glide' ? 10 : 4 + armSwing;
    ctx.fillRect(gloveX, 3 + crouchY, 6, 5);
    if (p.character === 'knuckles') {
      ctx.fillRect(gloveX + 6, 3 + crouchY, 2, 2);
      ctx.fillRect(gloveX + 6, 6 + crouchY, 2, 2);
    }

    const stride =
      p.state === 'walk' || p.state === 'run' || p.state === 'dash' || p.state === 'peelout'
        ? Math.sin(p.animTimer * 0.65) * 7
        : 0;

    if (p.state === 'dash' || p.state === 'peelout') {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 12, 10, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const shoeColor = p.character === 'ray' ? '#2563EB' : '#EF4444';
      ctx.fillStyle = shoeColor;
      ctx.fillRect(-7 - stride * 0.5, 10, 9, 5);
      ctx.fillRect(-1 + stride * 0.5, 10, 9, 5);
      ctx.fillStyle =
        p.character === 'knuckles' || p.character === 'mighty' ? '#FACC15' : '#FFFFFF';
      ctx.fillRect(-4 - stride * 0.5, 10, 3, 5);
      ctx.fillRect(2 + stride * 0.5, 10, 3, 5);
    }
  }

  ctx.scale(p.facing, 1);

  if (p.character === 'tails' && (p.state === 'fly' || p.state === 'fly_tired')) {
    const pct = Math.max(0, Math.min(1, p.flyStamina / 360));
    ctx.fillStyle = '#090D16';
    ctx.fillRect(-14, -32, 28, 4);
    ctx.fillStyle = pct > 0.25 ? '#F59E0B' : '#EF4444';
    ctx.fillRect(-13, -31, Math.round(26 * pct), 2);
  }

  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillStyle = p.isHyper
    ? '#38BDF8'
    : p.isSuper
    ? '#FACC15'
    : p.id === 1
    ? '#60A5FA'
    : '#FBBF24';
  ctx.fillText(
    p.isHyper ? 'HYPER' : p.isSuper ? 'SUPER' : p.isAI ? 'CPU' : `P${p.id}`,
    -12,
    -22
  );

  ctx.restore();
}
