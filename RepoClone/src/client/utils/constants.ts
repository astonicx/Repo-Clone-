import type { GameConfig } from './types';

export const GAME_CONFIG: GameConfig = {
  // Player Movement
  PLAYER_SPEED_WALK: 5, // units/second
  PLAYER_SPEED_SPRINT: 12, // units/second
  PLAYER_SPEED_CROUCH: 2, // units/second

  // Stamina System
  STAMINA_MAX: 100,
  STAMINA_DRAIN_SPRINT: 20, // per second
  STAMINA_REGEN: 15, // per second (passive)
  STAMINA_REGEN_CROUCH: 25, // per second (when crouching)

  // Noise System
  NOISE_WALK: 20, // % noise level
  NOISE_SPRINT: 80, // % noise level
  NOISE_CROUCH: 5, // % noise level

  // Monster System
  MONSTER_SPAWN_THRESHOLD: 60, // noise level required to spawn
  MONSTER_DETECTION_RADIUS_T1: 3, // units
  MONSTER_DETECTION_RADIUS_T2: 5, // units
  MONSTER_DETECTION_RADIUS_T3: 8, // units
  MONSTER_SPEED_T1: 4, // units/second
  MONSTER_SPEED_T2: 6, // units/second
  MONSTER_SPEED_T3: 8, // units/second
  MONSTER_DAMAGE: 25, // HP per hit

  // Player Health
  PLAYER_HEALTH_MAX: 100,

  // Economy
  TAX_RATE: 0.2, // 20% tax (The Taxman)

  // Revival
  REVIVAL_WINDOW: 90, // seconds

  // Mission
  MISSION_TIME_LIMIT: 30 * 60, // 30 minutes in seconds
};

// Loot Categories
export const LOOT_VALUES = {
  painting: { min: 500, max: 2000, fragility: 80 },
  sculpture: { min: 800, max: 3000, fragility: 70 },
  electronics: { min: 300, max: 1500, fragility: 50 },
  jewelry: { min: 200, max: 1000, fragility: 20 },
  furniture: { min: 100, max: 500, fragility: 40 },
  document: { min: 50, max: 300, fragility: 60 },
  oddity: { min: 100, max: 5000, fragility: 50 },
  unknown: { min: 50, max: 500, fragility: 50 },
};

// Upgrades Shop
export const UPGRADES = {
  stamina_boost: { name: 'Endurance Training', cost: 500, tier: 1, effect: 'max_stamina +50' },
  health_boost: { name: 'Medical Kit', cost: 400, tier: 1, effect: 'max_health +25' },
  carry_weight: { name: 'Reinforced Suit', cost: 800, tier: 2, effect: 'carry heavier items' },
  speed_boost: { name: 'Jet Boots', cost: 1200, tier: 3, effect: 'sprint speed +2' },
  monster_radar: { name: 'Radar Device', cost: 600, tier: 2, effect: 'see monsters on map' },
  lockpick: { name: 'Lock Pick Set', cost: 300, tier: 1, effect: 'open locked boxes' },
  flare_gun: { name: 'Flare Gun', cost: 200, tier: 1, effect: 'distract monsters' },
  grapple: { name: 'Grapple Hook', cost: 700, tier: 2, effect: 'reach high shelves' },
};

// Controls
export const CONTROLS = {
  moveForward: 'W',
  moveBack: 'S',
  moveLeft: 'A',
  moveRight: 'D',
  jump: 'Space',
  crouch: 'Control',
  sprint: 'Shift',
  grab: 'MouseLeft',
  rotate: 'MouseRight',
  push: 'ScrollUp',
  pull: 'ScrollDown',
  interact: 'E',
  map: 'Tab',
  chat: 'T',
  voiceChat: 'V',
  tumble: 'Q',
  menu: 'Escape',
};

export const EXTRACTION_CHANNELS = {
  singular: { time: 2, difficulty: 'easy' },
  locked: { time: 4, difficulty: 'medium' },
  multiple: { time: 7, difficulty: 'hard' },
  final: { time: 12, difficulty: 'very_hard' },
};

export const FACILITY_TYPES = ['museum', 'laboratory', 'academy', 'residential'] as const;
export const ROOM_TYPES = ['corridor', 'hall', 'storage', 'vault', 'hazard'] as const;
export const MONSTER_TIERS = [1, 2, 3] as const;
