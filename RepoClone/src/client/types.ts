// Game Type Definitions
export type GameState = 'MENU' | 'LOADING' | 'MISSION_BRIEFING' | 'PLAYING' | 'PAUSED' | 'PLAYER_DEAD' | 'MISSION_COMPLETE' | 'MISSION_FAILED' | 'LOOT_SCREEN' | 'SHOP';

export type MonsterTier = 1 | 2 | 3;
export type LootCategory = 'painting' | 'sculpture' | 'electronics' | 'jewelry' | 'furniture' | 'document' | 'oddity' | 'unknown';
export type ExtractionType = 'singular' | 'locked' | 'multiple' | 'final';
export type PlayerArchetype = 'infiltrator' | 'hacker' | 'enforcer' | 'courier';
export type MonsterVariant = 'patrol' | 'guard' | 'wraith' | 'heavy';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Player {
  id: string;
  name: string;
  archetype?: PlayerArchetype;
  position: Vector3;
  velocity: Vector3;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  isSprinting: boolean;
  isCrouching: boolean;
  angle: number;
  heldItem: LootItem | null;
  isDead: boolean;
  lastNoise: number; // timestamp
}

export interface Monster {
  id: string;
  tier: MonsterTier;
  variant?: MonsterVariant;
  position: Vector3;
  velocity: Vector3;
  state: 'idle' | 'alert' | 'hunt' | 'return';
  targetPosition: Vector3 | null;
  lastKnownPlayerPos: Vector3 | null;
  detectionRadius: number;
  moveSpeed: number;
  spawnRoom: string;
  health: number;
  maxHealth: number;
}

export interface LootItem {
  id: string;
  name: string;
  category: LootCategory;
  baseValue: number;
  weight: number; // kg
  fragility: number; // 0-100
  position: Vector3;
  damage: number; // 0-100 (damage reduces value)
  currentValue: number;
}

export interface Room {
  id: string;
  name: string;
  type: 'corridor' | 'hall' | 'storage' | 'vault' | 'hazard';
  theme: 'sterile' | 'industrial' | 'luxury' | 'archive' | 'danger';
  variant: number;
  position: Vector3;
  width: number;
  height: number;
  depth: number;
  items: LootItem[];
  connectedRooms: string[];
}

export interface Facility {
  id: string;
  type: 'museum' | 'laboratory' | 'academy' | 'residential';
  rooms: Map<string, Room>;
  extractionPoint: Vector3;
  monsterSpawnRoom: string;
  seed: number;
}

export interface Mission {
  id: string;
  facilityId: string;
  difficulty: 'easy' | 'normal' | 'hard';
  timeLimit: number; // seconds
  startTime: number; // timestamp
  players: Player[];
  monsters: Monster[];
  extractedLoot: LootItem[];
  totalProfit: number;
  status: 'active' | 'complete' | 'failed';
}

export interface GameStore {
  state: GameState;
  mission: Mission | null;
  currentPlayer: Player | null;
  players: Map<string, Player>;
  monsters: Map<string, Monster>;
  lootItems: Map<string, LootItem>;
  uiState: {
    selectedMenu: string | null;
    showMap: boolean;
    showInventory: boolean;
    showShop: boolean;
    notifications: Notification[];
  };
  upgrades: Record<string, number>; // upgrade_id -> level
  currency: number; // SURPLUS
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  timestamp: number;
  duration: number; // ms
}

export interface GameConfig {
  PLAYER_SPEED_WALK: number;
  PLAYER_SPEED_SPRINT: number;
  PLAYER_SPEED_CROUCH: number;
  STAMINA_MAX: number;
  STAMINA_DRAIN_SPRINT: number;
  STAMINA_REGEN: number;
  STAMINA_REGEN_CROUCH: number;
  NOISE_WALK: number;
  NOISE_SPRINT: number;
  NOISE_CROUCH: number;
  MONSTER_SPAWN_THRESHOLD: number;
  MONSTER_DETECTION_RADIUS_T1: number;
  MONSTER_DETECTION_RADIUS_T2: number;
  MONSTER_DETECTION_RADIUS_T3: number;
  MONSTER_SPEED_T1: number;
  MONSTER_SPEED_T2: number;
  MONSTER_SPEED_T3: number;
  MONSTER_DAMAGE: number;
  PLAYER_HEALTH_MAX: number;
  TAX_RATE: number;
  REVIVAL_WINDOW: number;
  MISSION_TIME_LIMIT: number;
}
