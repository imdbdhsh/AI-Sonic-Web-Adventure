import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Copy, Download, Upload, Volume2, VolumeX, X } from 'lucide-react';
import { SfxPatchKey, soundFX } from './audio/soundEngine';
import { AudioStudio } from './components/AudioStudio';
import { GameStage } from './components/GameStage';
import { LevelEditor } from './components/LevelEditor';
import { MultiplayerGuide } from './components/MultiplayerGuide';
import { SpecialStageStudio } from './components/SpecialStageStudio';
import { TilesetStudio } from './components/TilesetStudio';
import {
  DEFAULT_LEVELS,
  DEFAULT_SPECIAL_STAGES,
  DEFAULT_TILESETS,
  orderCampaignLevels,
} from './data/presets';
import { invalidateTilesetCache } from './engine/renderer';
import {
  CharacterId,
  CustomStagePackage,
  LevelCheckpointSession,
  LevelData,
  MultiplayerMode,
  SfxPatch,
  SpecialStageData,
  SpecialStageType,
  SplitOrientation,
  TilesetConfig,
} from './types/engine';
import { triggerJsonDownload } from './utils/exportHelper';

type ActiveWorkspaceTab =
  | 'play'
  | 'play-game'
  | 'editor'
  | 'special'
  | 'audio'
  | 'tilesets'
  | 'multiplayer';

const STORAGE_KEYS = {
  LEVELS: 'sonic_velocity_levels_v19',
  TILESETS: 'sonic_velocity_tilesets_v17',
  SPECIAL_STAGES: 'sonic_velocity_special_stages_v11',
  EMERALDS: 'sonic_velocity_emeralds_v11',
  SUPER_EMERALDS: 'sonic_velocity_super_emeralds_v11',
  CAMPAIGN_EMERALDS: 'sonic_velocity_campaign_emeralds_v11',
  CAMPAIGN_SUPER_EMERALDS: 'sonic_velocity_campaign_super_emeralds_v11',
  CAMPAIGN_LEVEL_ID: 'sonic_velocity_campaign_level_v11',
  LIVES: 'sonic_velocity_lives_v15',
  CAMPAIGN_LIVES: 'sonic_velocity_campaign_lives_v15',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('play');
  // Tracks whether the player entered a Special Stage from "Play Game" (No-Cheats Mode) vs "Play Zone"
  const [specialStageFromCampaign, setSpecialStageFromCampaign] =
    useState<boolean>(false);

  const [tilesets, setTilesets] = useState<TilesetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TILESETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((t: TilesetConfig) => t.id));
          const missingDefaults = DEFAULT_TILESETS.filter(
            (def) => !existingIds.has(def.id)
          );
          const updated = parsed.map((ts: TilesetConfig) => {
            if (ts.id === 'chemical-plant-zone' || ts.id === 'mystic-caverns') {
              return DEFAULT_TILESETS.find((d) => d.id === ts.id) || ts;
            }
            return ts;
          });
          return [...updated, ...missingDefaults];
        }
      }
    } catch {
      // Fallback to default tilesets
    }
    return DEFAULT_TILESETS;
  });

  const [levels, setLevels] = useState<LevelData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEVELS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return orderCampaignLevels(parsed);
        }
      }
    } catch {
      // Fallback to default levels
    }
    return orderCampaignLevels(DEFAULT_LEVELS);
  });

  const [specialStages, setSpecialStages] = useState<SpecialStageData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPECIAL_STAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
      }
    } catch {
      // Fallback to default 7 special stages
    }
    return DEFAULT_SPECIAL_STAGES;
  });

  // Sandbox ("Play Zone") Emeralds (Cheats allowed)
  const [chaosEmeralds, setChaosEmeralds] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMERALDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
      }
    } catch {
      // Fallback
    }
    return [false, false, false, false, false, false, false];
  });

  const [superEmeralds, setSuperEmeralds] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPER_EMERALDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
      }
    } catch {
      // Fallback
    }
    return [false, false, false, false, false, false, false];
  });

  // Legitimate Campaign ("Play Game") Emeralds & Level Progression (NO CHEATS ALLOWED!)
  const [campaignEmeralds, setCampaignEmeralds] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGN_EMERALDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
      }
    } catch {
      // Fallback
    }
    return [false, false, false, false, false, false, false];
  });

  const [campaignSuperEmeralds, setCampaignSuperEmeralds] = useState<boolean[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGN_SUPER_EMERALDS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === 7) return parsed;
        }
      } catch {
        // Fallback
      }
      return [false, false, false, false, false, false, false];
    }
  );

  const [campaignLevelId, setCampaignLevelId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGN_LEVEL_ID);
      if (
        saved &&
        saved !== 'broken-test-01' &&
        DEFAULT_LEVELS.some((l) => l.id === saved)
      ) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_LEVELS[0].id;
  });

  // Player Lives (Start with 3; +1 per 100 rings or 1-UP monitor; 0 lives = Game Over -> restart game with 0 Chaos Emeralds)
  const [lives, setLives] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEYS.LIVES));
      if (!Number.isNaN(saved) && saved >= 1) return saved;
    } catch {
      // Fallback
    }
    return 3;
  });

  const [campaignLives, setCampaignLives] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEYS.CAMPAIGN_LIVES));
      if (!Number.isNaN(saved) && saved >= 1) return saved;
    } catch {
      // Fallback
    }
    return 3;
  });

  // Per-level Checkpoint & Collected Giant Rings Session State
  const [checkpointSessions, setCheckpointSessions] = useState<
    Record<string, LevelCheckpointSession>
  >({});
  const [campaignCheckpointSessions, setCampaignCheckpointSessions] = useState<
    Record<string, LevelCheckpointSession>
  >({});

  const [activeLevelId, setActiveLevelId] = useState<string>(levels[0].id);
  const [activeTilesetId, setActiveTilesetId] = useState<string>(tilesets[0].id);
  const [activeSpecialStageNum, setActiveSpecialStageNum] = useState<number>(1);
  const [specialStageType, setSpecialStageType] =
    useState<SpecialStageType>('sonic1');

  const [p1Character, setP1Character] = useState<CharacterId>('sonic');
  const [p2Character, setP2Character] = useState<CharacterId>('tails');
  const [multiplayerMode, setMultiplayerMode] =
    useState<MultiplayerMode>('solo_ai');
  const [splitOrientation, setSplitOrientation] =
    useState<SplitOrientation>('horizontal');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [packageNotice, setPackageNotice] = useState<string | null>(null);
  const [exportModalData, setExportModalData] = useState<{
    filename: string;
    jsonText: string;
    stageName: string;
  } | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Persist custom levels, tilesets, special stages, and emeralds
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.TILESETS, JSON.stringify(tilesets));
      } catch {
        // Ignore quota errors
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [tilesets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(levels));
      } catch {
        // Ignore quota errors
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [levels]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SPECIAL_STAGES,
        JSON.stringify(specialStages)
      );
    } catch {
      // Ignore quota errors
    }
  }, [specialStages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMERALDS, JSON.stringify(chaosEmeralds));
    } catch {
      // Ignore quota errors
    }
  }, [chaosEmeralds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SUPER_EMERALDS,
        JSON.stringify(superEmeralds)
      );
    } catch {
      // Ignore quota errors
    }
  }, [superEmeralds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CAMPAIGN_EMERALDS,
        JSON.stringify(campaignEmeralds)
      );
    } catch {
      // Ignore quota errors
    }
  }, [campaignEmeralds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CAMPAIGN_SUPER_EMERALDS,
        JSON.stringify(campaignSuperEmeralds)
      );
    } catch {
      // Ignore quota errors
    }
  }, [campaignSuperEmeralds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGN_LEVEL_ID, campaignLevelId);
    } catch {
      // Ignore quota errors
    }
  }, [campaignLevelId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIVES, String(lives));
    } catch {
      // Ignore quota errors
    }
  }, [lives]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGN_LIVES, String(campaignLives));
    } catch {
      // Ignore quota errors
    }
  }, [campaignLives]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFX.setMuted(next);
  };

  const handleUpdateLevel = (updated: LevelData) => {
    setLevels((prev) =>
      orderCampaignLevels(
        prev.map((l) => (l.id === updated.id ? updated : l))
      )
    );
  };

  const handleCreateLevel = (newLevel: LevelData) => {
    setLevels((prev) => orderCampaignLevels([...prev, newLevel]));
  };

  const handleDeleteLevel = (id: string) => {
    // Death Egg Zone is always the final zone and cannot be deleted
    if (id === 'death-egg-zone') return;
    setLevels((prev) => {
      const filtered = orderCampaignLevels(
        prev.filter((l) => l.id !== id)
      );
      if (activeLevelId === id && filtered.length > 0) {
        setActiveLevelId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleUpdateTileset = (updated: TilesetConfig) => {
    setTilesets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleCreateTileset = (newTs: TilesetConfig) => {
    setTilesets((prev) => [...prev, newTs]);
  };

  const handleDeleteTileset = (id: string) => {
    setTilesets((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (activeTilesetId === id && filtered.length > 0) {
        setActiveTilesetId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleExportStagePackage = useCallback(
    (levelId?: string) => {
      const targetLevel =
        levels.find((l) => l.id === (levelId || activeLevelId)) || levels[0];
      const targetTileset =
        tilesets.find((t) => t.id === targetLevel.tilesetId) || tilesets[0];

      const stagePackage: CustomStagePackage = {
        packageFormat: 'sonic_velocity_custom_stage_v1',
        exportedAt: new Date().toISOString(),
        level: targetLevel,
        activeTileset: targetTileset,
        tilesets,
        audio: {
          sfxPatches: soundFX.getPatches(),
        },
      };

      const safeSlug = targetLevel.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const filename = `${safeSlug || targetLevel.id}-act-${targetLevel.act}.stage.json`;
      const jsonText = JSON.stringify(stagePackage, null, 2);

      // 1. Trigger reliable browser file download (with delayed URL revocation & clipboard backup)
      triggerJsonDownload(filename, jsonText);

      // 2. Also open interactive Export/Import JSON Modal so user can Copy/Download/Paste even in sandboxed iframes
      setCopiedJson(false);
      setExportModalData({
        filename,
        jsonText,
        stageName: `${targetLevel.name} (Act ${targetLevel.act})`,
      });

      setPackageNotice(
        `Exported "${targetLevel.name} (Act ${targetLevel.act})" package with edited textures & custom sounds.`
      );
    },
    [levels, activeLevelId, tilesets]
  );

  const handleImportStagePackage = useCallback(
    (rawJsonText: string) => {
      try {
        const parsed = JSON.parse(rawJsonText);
        if (!parsed || typeof parsed !== 'object') return;

        // 1. Restore all edited textures & custom tilesets
        const incomingTilesetList: TilesetConfig[] = [];
        if (Array.isArray(parsed.tilesets)) {
          for (const ts of parsed.tilesets) {
            if (ts && typeof ts === 'object' && ts.id && ts.palette) {
              incomingTilesetList.push(ts as TilesetConfig);
            }
          }
        }
        if (
          parsed.activeTileset &&
          typeof parsed.activeTileset === 'object' &&
          parsed.activeTileset.id &&
          parsed.activeTileset.palette
        ) {
          const activeTs = parsed.activeTileset as TilesetConfig;
          const existingIdx = incomingTilesetList.findIndex(
            (t) => t.id === activeTs.id
          );
          if (existingIdx !== -1) {
            incomingTilesetList[existingIdx] = activeTs;
          } else {
            incomingTilesetList.push(activeTs);
          }
        }

        if (incomingTilesetList.length > 0) {
          setTilesets((prev) => {
            const merged = [...prev];
            for (const inc of incomingTilesetList) {
              const idx = merged.findIndex((t) => t.id === inc.id);
              if (idx !== -1) {
                merged[idx] = inc;
              } else {
                merged.push(inc);
              }
            }
            return merged;
          });
          invalidateTilesetCache();
        }

        // 2. Restore all edited SFX patches
        let restoredAudio = false;
        const incomingSfx = parsed.audio?.sfxPatches || parsed.sfxPatches;

        if (incomingSfx && typeof incomingSfx === 'object') {
          soundFX.setAllPatches(incomingSfx as Record<SfxPatchKey, SfxPatch>);
          restoredAudio = true;
        }

        // 3. Import custom stage layout
        const rawLevel = (
          parsed.level && Array.isArray(parsed.level.grid)
            ? parsed.level
            : Array.isArray(parsed.grid)
            ? parsed
            : null
        ) as LevelData | null;

        if (
          rawLevel &&
          Array.isArray(rawLevel.grid) &&
          rawLevel.width &&
          rawLevel.height
        ) {
          const isBuiltInId = DEFAULT_LEVELS.some((d) => d.id === rawLevel.id);
          const importedId =
            !rawLevel.id || isBuiltInId
              ? `custom-stage-${Date.now().toString().slice(-5)}`
              : rawLevel.id;

          const importedLevel: LevelData = {
            ...rawLevel,
            id: importedId,
            name: rawLevel.name || 'Imported Custom Zone',
            act: Math.max(1, Number(rawLevel.act) || 1),
            author: rawLevel.author || 'Custom Stage Creator',
          };

          setLevels((prev) => {
            const existingIdx = prev.findIndex((l) => l.id === importedLevel.id);
            if (existingIdx !== -1) {
              const updated = [...prev];
              updated[existingIdx] = importedLevel;
              return orderCampaignLevels(updated);
            }
            return orderCampaignLevels([...prev, importedLevel]);
          });

          setActiveLevelId(importedLevel.id);
          if (importedLevel.tilesetId) {
            setActiveTilesetId(importedLevel.tilesetId);
          }

          soundFX.playRing();

          const extras: string[] = [];
          if (incomingTilesetList.length > 0) {
            extras.push('edited textures');
          }
          if (restoredAudio) {
            extras.push('edited SFX sounds');
          }
          setPackageNotice(
            `Imported stage "${importedLevel.name} (Act ${importedLevel.act})"${
              extras.length > 0 ? ` including ${extras.join(' and ')}!` : '!'
            }`
          );
        } else if (incomingTilesetList.length > 0 || restoredAudio) {
          soundFX.playRing();
          setPackageNotice('Imported edited textures and custom sound patches!');
        }
      } catch {
        setPackageNotice('Could not import stage file: invalid JSON format.');
      }
    },
    []
  );

  const handleUpdateSpecialStage = (updated: SpecialStageData) => {
    setSpecialStages((prev) =>
      prev.map((s) => (s.stageNumber === updated.stageNumber ? updated : s))
    );
  };

  const handleEarnEmerald = useCallback(
    (stageIndex: number) => {
      if (specialStageFromCampaign) {
        setCampaignEmeralds((prevChaos) => {
          if (!prevChaos.every(Boolean)) {
            const nextChaos = [...prevChaos];
            nextChaos[stageIndex] = true;
            return nextChaos;
          } else {
            setCampaignSuperEmeralds((prevSuper) => {
              const nextSuper = [...prevSuper];
              nextSuper[stageIndex] = true;
              return nextSuper;
            });
            return prevChaos;
          }
        });
      } else {
        setChaosEmeralds((prevChaos) => {
          if (!prevChaos.every(Boolean)) {
            const nextChaos = [...prevChaos];
            nextChaos[stageIndex] = true;
            return nextChaos;
          } else {
            setSuperEmeralds((prevSuper) => {
              const nextSuper = [...prevSuper];
              nextSuper[stageIndex] = true;
              return nextSuper;
            });
            return prevChaos;
          }
        });
      }
    },
    [specialStageFromCampaign]
  );

  const handleToggleAllEmeralds = () => {
    const allChaos = chaosEmeralds.every(Boolean);
    const allSuper = superEmeralds.every(Boolean);
    if (!allChaos) {
      setChaosEmeralds([true, true, true, true, true, true, true]);
    } else if (!allSuper) {
      setSuperEmeralds([true, true, true, true, true, true, true]);
    } else {
      setChaosEmeralds([false, false, false, false, false, false, false]);
      setSuperEmeralds([false, false, false, false, false, false, false]);
    }
  };

  const handleResetCampaign = useCallback(() => {
    setCampaignLives(3);
    setCampaignEmeralds([false, false, false, false, false, false, false]);
    setCampaignSuperEmeralds([false, false, false, false, false, false, false]);
    setCampaignCheckpointSessions({});
    setCampaignLevelId(levels[0].id);
  }, [levels]);

  const handlePlayZoneGameOver = useCallback(() => {
    setLives(3);
    setChaosEmeralds([false, false, false, false, false, false, false]);
    setSuperEmeralds([false, false, false, false, false, false, false]);
    setCheckpointSessions({});
    setActiveLevelId(levels[0].id);
  }, [levels]);

  const handleSaveCheckpointSession = useCallback(
    (session: LevelCheckpointSession) => {
      setCheckpointSessions((prev) => ({
        ...prev,
        [session.levelId]: session,
      }));
    },
    []
  );

  const handleClearCheckpointSession = useCallback((levelId: string) => {
    setCheckpointSessions((prev) => {
      const next = { ...prev };
      delete next[levelId];
      return next;
    });
  }, []);

  const handleSaveCampaignCheckpointSession = useCallback(
    (session: LevelCheckpointSession) => {
      setCampaignCheckpointSessions((prev) => ({
        ...prev,
        [session.levelId]: session,
      }));
    },
    []
  );

  const handleClearCampaignCheckpointSession = useCallback((levelId: string) => {
    setCampaignCheckpointSessions((prev) => {
      const next = { ...prev };
      delete next[levelId];
      return next;
    });
  }, []);

  const handleWarpToNextSpecialStage = useCallback(() => {
    setSpecialStageFromCampaign(false);
    const allChaos = chaosEmeralds.every(Boolean);
    const targetList = allChaos ? superEmeralds : chaosEmeralds;
    const nextUncollectedIdx = targetList.findIndex((owned) => !owned);
    const targetStageNum =
      nextUncollectedIdx !== -1 ? nextUncollectedIdx + 1 : activeSpecialStageNum;
    setActiveSpecialStageNum(targetStageNum);
    setActiveTab('special');
  }, [chaosEmeralds, superEmeralds, activeSpecialStageNum]);

  const handleWarpToCampaignSpecialStage = useCallback(() => {
    setSpecialStageFromCampaign(true);
    const allChaos = campaignEmeralds.every(Boolean);
    const targetList = allChaos ? campaignSuperEmeralds : campaignEmeralds;
    const nextUncollectedIdx = targetList.findIndex((owned) => !owned);
    const targetStageNum =
      nextUncollectedIdx !== -1 ? nextUncollectedIdx + 1 : 1;
    setActiveSpecialStageNum(targetStageNum);
    setActiveTab('special');
  }, [campaignEmeralds, campaignSuperEmeralds]);

  const handleReturnFromSpecialStage = useCallback(() => {
    if (specialStageFromCampaign) {
      setActiveTab('play-game');
    } else {
      setActiveTab('play');
    }
  }, [specialStageFromCampaign]);

  const isNoCheatView =
    activeTab === 'play-game' ||
    (activeTab === 'special' && specialStageFromCampaign);
  const displayedChaosEmeralds = isNoCheatView
    ? campaignEmeralds
    : chaosEmeralds;
  const displayedSuperEmeralds = isNoCheatView
    ? campaignSuperEmeralds
    : superEmeralds;
  const allChaosCollected = displayedChaosEmeralds.every(Boolean);
  const allSuperCollected = displayedSuperEmeralds.every(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-[#F8FAFC]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/90 bg-[#0B0F19]/95 sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#play"
          onClick={(e) => {
            e.preventDefault();
            setSpecialStageFromCampaign(false);
            setActiveTab('play');
          }}
          className="text-lg font-extrabold tracking-tight text-white font-display whitespace-nowrap"
        >
          Sonic: Web Adventure
        </a>

        {/* Zone 2: Clean text navigation links with "Play Game" right next to "Play Zone" */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => {
              setSpecialStageFromCampaign(false);
              setActiveTab('play');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'play'
                ? 'text-white underline underline-offset-8 decoration-blue-500 decoration-2'
                : 'hover:text-white'
            }`}
          >
            Play Zone
          </button>
          <button
            onClick={() => {
              setSpecialStageFromCampaign(true);
              setActiveTab('play-game');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'play-game'
                ? 'text-emerald-300 underline underline-offset-8 decoration-emerald-400 decoration-2 font-bold'
                : 'hover:text-emerald-300'
            }`}
          >
            Play Game
          </button>
          <button
            onClick={() => {
              setSpecialStageFromCampaign(false);
              setActiveTab('editor');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'editor'
                ? 'text-white underline underline-offset-8 decoration-blue-500 decoration-2'
                : 'hover:text-white'
            }`}
          >
            Level Editor
          </button>
          <button
            onClick={() => {
              setSpecialStageFromCampaign(false);
              setActiveTab('special');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'special'
                ? 'text-white underline underline-offset-8 decoration-blue-500 decoration-2'
                : 'hover:text-white'
            }`}
          >
            Special Stages (1–7)
          </button>
          <button
            onClick={() => {
              setSpecialStageFromCampaign(false);
              setActiveTab(activeTab === 'audio' ? 'tilesets' : 'audio');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'audio' ||
              activeTab === 'tilesets' ||
              activeTab === 'multiplayer'
                ? 'text-white underline underline-offset-8 decoration-blue-500 decoration-2'
                : 'hover:text-white'
            }`}
          >
            Audio & Tilesets
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-[#131B2E] border border-slate-800 rounded-lg hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            title={
              isMuted ? 'Unmute 16-Bit Synth Audio' : 'Mute 16-Bit Synth Audio'
            }
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>Audio Off</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>16-Bit Audio</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setSpecialStageFromCampaign(false);
              setActiveTab('audio');
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            SFX Sound Studio
          </button>
        </div>
      </header>

      {/* Secondary Studio Mode Switcher */}
      <div className="bg-[#0F1523] border-b border-slate-800/70 px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">Workspaces:</span>
          {(
            [
              ['play', 'Play Zone'],
              ['play-game', 'Play Game (No Cheats)'],
              ['editor', 'Level Editor'],
              ['special', 'Special Stages (S1 & S3)'],
              ['audio', 'SFX Sound Editor'],
              ['tilesets', 'Custom Tileset Studio'],
              ['multiplayer', '2P Split-Screen Setup'],
            ] as const
          ).map(([tabId, label]) => (
            <button
              key={tabId}
              onClick={() => {
                setSpecialStageFromCampaign(tabId === 'play-game');
                setActiveTab(tabId);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === tabId
                  ? tabId === 'play-game'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span>
            Lives:{' '}
            <strong className="text-rose-400 font-mono">
              ×{isNoCheatView ? campaignLives : lives}
            </strong>
          </span>
          <span>·</span>
          <span>
            Chaos Emeralds:{' '}
            <strong className="text-emerald-400 font-mono">
              {displayedChaosEmeralds.filter(Boolean).length}/7
            </strong>
          </span>
          {allChaosCollected && (
            <span>
              · Super Emeralds:{' '}
              <strong className="text-sky-400 font-mono">
                {displayedSuperEmeralds.filter(Boolean).length}/7
              </strong>
            </span>
          )}
          {isNoCheatView ? (
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              No-Cheats Active
            </span>
          ) : (
            <button
              onClick={handleToggleAllEmeralds}
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer"
            >
              {!allChaosCollected
                ? 'Unlock 7 Chaos Emeralds (Super Mode)'
                : !allSuperCollected
                ? 'Unlock 7 Super Emeralds (Hyper Mode)'
                : 'Reset All Emeralds'}
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Container */}
      {packageNotice && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-6 py-2 flex items-center justify-between gap-4 text-xs text-emerald-200">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{packageNotice}</span>
          </div>
          <button
            onClick={() => setPackageNotice(null)}
            className="p-1 text-emerald-300 hover:text-white rounded cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Stage Package Export / Copy / Paste Import Modal */}
      {exportModalData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#131B2E] border border-slate-700 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">
                  Stage Package Export &amp; Import ({exportModalData.stageName})
                </h2>
                <p className="text-xs text-slate-400">
                  Includes stage layout, all edited tile textures, and custom SFX sound patches.
                </p>
              </div>
              <button
                onClick={() => setExportModalData(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`data:application/json;charset=utf-8,${encodeURIComponent(
                  exportModalData.jsonText
                )}`}
                download={exportModalData.filename}
                onClick={() =>
                  triggerJsonDownload(
                    exportModalData.filename,
                    exportModalData.jsonText
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download {exportModalData.filename}
              </a>

              <button
                onClick={() => {
                  if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(exportModalData.jsonText);
                  }
                  setCopiedJson(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedJson ? 'Copied JSON to Clipboard!' : 'Copy JSON to Clipboard'}
              </button>

              <button
                onClick={() => {
                  handleImportStagePackage(exportModalData.jsonText);
                  setExportModalData(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Import JSON Below
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Stage Package JSON (Copy to save/share, or paste another Stage JSON here &amp; click &ldquo;Import JSON Below&rdquo;):
              </label>
              <textarea
                value={exportModalData.jsonText}
                onChange={(e) =>
                  setExportModalData({
                    ...exportModalData,
                    jsonText: e.target.value,
                  })
                }
                rows={10}
                spellCheck={false}
                className="w-full p-3 text-[11px] font-mono bg-[#090D16] border border-slate-800 rounded-lg text-emerald-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
      <main className="flex-1">
        {activeTab === 'play' && (
          <GameStage
            levels={levels}
            activeLevelId={activeLevelId}
            tilesets={tilesets}
            p1Character={p1Character}
            p2Character={p2Character}
            multiplayerMode={multiplayerMode}
            splitOrientation={splitOrientation}
            chaosEmeralds={chaosEmeralds}
            superEmeralds={superEmeralds}
            lives={lives}
            onChangeLives={setLives}
            onGameOver={handlePlayZoneGameOver}
            checkpointSession={checkpointSessions[activeLevelId] || null}
            noCheatsMode={false}
            onSaveCheckpointSession={handleSaveCheckpointSession}
            onClearCheckpointSession={handleClearCheckpointSession}
            onSelectLevel={setActiveLevelId}
            onChangeP1Character={setP1Character}
            onChangeP2Character={setP2Character}
            onChangeMultiplayerMode={setMultiplayerMode}
            onChangeSplitOrientation={setSplitOrientation}
            onOpenEditor={() => setActiveTab('editor')}
            onEnterSpecialStage={handleWarpToNextSpecialStage}
            onExportStagePackage={handleExportStagePackage}
            onImportStagePackage={handleImportStagePackage}
          />
        )}

        {activeTab === 'play-game' && (
          <GameStage
            levels={levels}
            activeLevelId={campaignLevelId}
            tilesets={tilesets}
            p1Character={p1Character}
            p2Character={p2Character}
            multiplayerMode={multiplayerMode}
            splitOrientation={splitOrientation}
            chaosEmeralds={campaignEmeralds}
            superEmeralds={campaignSuperEmeralds}
            lives={campaignLives}
            onChangeLives={setCampaignLives}
            onGameOver={handleResetCampaign}
            checkpointSession={
              campaignCheckpointSessions[campaignLevelId] || null
            }
            noCheatsMode={true}
            onResetCampaign={handleResetCampaign}
            onSaveCheckpointSession={handleSaveCampaignCheckpointSession}
            onClearCheckpointSession={handleClearCampaignCheckpointSession}
            onSelectLevel={setCampaignLevelId}
            onChangeP1Character={setP1Character}
            onChangeP2Character={setP2Character}
            onChangeMultiplayerMode={setMultiplayerMode}
            onChangeSplitOrientation={setSplitOrientation}
            onOpenEditor={() => {}}
            onEnterSpecialStage={handleWarpToCampaignSpecialStage}
          />
        )}

        {activeTab === 'editor' && (
          <LevelEditor
            levels={levels}
            activeLevelId={activeLevelId}
            tilesets={tilesets}
            onSelectLevel={setActiveLevelId}
            onUpdateLevel={handleUpdateLevel}
            onCreateLevel={handleCreateLevel}
            onDeleteLevel={handleDeleteLevel}
            onTestPlayLevel={() => setActiveTab('play')}
            onExportStagePackage={handleExportStagePackage}
            onImportStagePackage={handleImportStagePackage}
          />
        )}

        {activeTab === 'special' && (
          <SpecialStageStudio
            specialStages={specialStages}
            activeStageNumber={activeSpecialStageNum}
            specialStageType={specialStageType}
            chaosEmeralds={
              specialStageFromCampaign ? campaignEmeralds : chaosEmeralds
            }
            superEmeralds={
              specialStageFromCampaign ? campaignSuperEmeralds : superEmeralds
            }
            activeCharacter={p1Character}
            noCheatsMode={specialStageFromCampaign}
            onSelectStageNumber={setActiveSpecialStageNum}
            onChangeStageType={setSpecialStageType}
            onUpdateSpecialStage={handleUpdateSpecialStage}
            onEarnEmerald={handleEarnEmerald}
            onToggleAllEmeralds={handleToggleAllEmeralds}
            onReturnToZone={handleReturnFromSpecialStage}
          />
        )}

        {activeTab === 'audio' && <AudioStudio />}

        {activeTab === 'tilesets' && (
          <TilesetStudio
            tilesets={tilesets}
            activeTilesetId={activeTilesetId}
            onSelectTileset={setActiveTilesetId}
            onUpdateTileset={handleUpdateTileset}
            onCreateTileset={handleCreateTileset}
            onDeleteTileset={handleDeleteTileset}
          />
        )}

        {activeTab === 'multiplayer' && (
          <MultiplayerGuide
            p1Character={p1Character}
            p2Character={p2Character}
            multiplayerMode={multiplayerMode}
            splitOrientation={splitOrientation}
            onChangeP1Character={setP1Character}
            onChangeP2Character={setP2Character}
            onChangeMultiplayerMode={setMultiplayerMode}
            onChangeSplitOrientation={setSplitOrientation}
            onLaunchGame={() => setActiveTab('play')}
          />
        )}
      </main>
    </div>
  );
}
