import type { Player, Monster, Mission, LootItem, Room } from '../types';
import { GAME_CONFIG } from '../utils/constants';
import { useGameStore } from './GameStateManager';
import { findRoomAtPosition, clampPositionToRoom, getNearbyConnectedRoom } from '../utils/roomUtils';
import { hasLineOfSight } from '../utils/lineOfSight';

export class GameEngine {
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private isRunning: boolean = false;
  private noiseLevel: number = 0;
  private noiseSource: { x: number; y: number; z: number } | null = null;
  private noiseSourceExpiresAt: number = 0;
  private roomsMap: Map<string, Room> = new Map();

  constructor() {
    this.lastFrameTime = Date.now();
  }

  setRoomMap(rooms: Map<string, Room>): void {
    this.roomsMap = rooms;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = Date.now();
    this.update();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main game update loop
   */
  private update = (): void => {
    const now = Date.now();
    const deltaTime = (now - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = now;

    if (!this.isRunning) return;

    const state = useGameStore.getState();

    if (state.state === 'PLAYING' && state.mission && state.mission.status === 'active') {
      // Noise naturally fades over time.
      this.noiseLevel = Math.max(0, this.noiseLevel - deltaTime * 16);

      // Update players
      let movementNoisePeak = 0;
      state.players.forEach((player) => {
        movementNoisePeak = Math.max(movementNoisePeak, this.updatePlayer(player, deltaTime, state));
      });
      this.noiseLevel = Math.min(100, Math.max(this.noiseLevel, movementNoisePeak));

      // Update monsters
      state.monsters.forEach((monster) => {
        this.updateMonster(monster, deltaTime, state);
      });

      // Check mission win/loss conditions
      this.checkMissionConditions(state);
    }

    this.animationFrameId = requestAnimationFrame(this.update);
  };

  /**
   * Update player state each frame
   */
  private updatePlayer(player: Player, deltaTime: number, state: any): number {
    // Update stamina
    let staminaChange = 0;

    if (player.isSprinting && player.stamina > 0) {
      staminaChange = -GAME_CONFIG.STAMINA_DRAIN_SPRINT * deltaTime;
    } else if (player.isCrouching) {
      staminaChange = GAME_CONFIG.STAMINA_REGEN_CROUCH * deltaTime;
    } else {
      staminaChange = GAME_CONFIG.STAMINA_REGEN * deltaTime;
    }

    const newStamina = Math.max(0, Math.min(player.maxStamina, player.stamina + staminaChange));

    // Stop sprinting if out of stamina
    const isSprinting = player.isSprinting && newStamina > 0;

    // Update position based on velocity
    if (player.velocity.x !== 0 || player.velocity.y !== 0) {
      player.position.x += player.velocity.x * deltaTime;
      player.position.y += player.velocity.y * deltaTime;
      player.position.z += player.velocity.z * deltaTime;
    }

    // Apply room boundaries and handle doorway transitions
    const currentRoom = findRoomAtPosition(player.position, Array.from(this.roomsMap.values()));
    if (currentRoom) {
      player.position = clampPositionToRoom(player.position, currentRoom);

      // Check for doorway transition to connected room
      const connectedRoom = getNearbyConnectedRoom(player.position, currentRoom, this.roomsMap, 2.8);
      if (connectedRoom && connectedRoom.id !== currentRoom.id) {
        // Smoothly position player just inside the new room
        const angle = Math.atan2(
          connectedRoom.position.z - currentRoom.position.z,
          connectedRoom.position.x - currentRoom.position.x
        );
        player.position.x = connectedRoom.position.x - Math.cos(angle) * 2.2;
        player.position.z = connectedRoom.position.z - Math.sin(angle) * 2.2;
      }
    }

    // Apply damping/friction
    player.velocity.x *= 0.9;
    player.velocity.y *= 0.9;
    player.velocity.z *= 0.9;

    // Update noise level based on movement
    const movementNoise = this.calculateNoise(player, isSprinting);
    if (movementNoise > 0) {
      this.noiseSource = { ...player.position };
      this.noiseSourceExpiresAt = Date.now() + 1200;
    }

    // Update player in store
    useGameStore.getState().updatePlayer(player.id, {
      stamina: newStamina,
      isSprinting,
      position: player.position,
      velocity: player.velocity,
    });

    return movementNoise;
  }

  /**
   * Update monster state each frame
   */
  private updateMonster(monster: Monster, deltaTime: number, state: any): void {
    const now = Date.now();
    const monsterRoom = findRoomAtPosition(monster.position, Array.from(this.roomsMap.values()));
    const allRooms = Array.from(this.roomsMap.values());

    // Check for player detection with line of sight
    let detectedPlayer: Player | null = null;

    state.players.forEach((player: Player) => {
      if (player.isDead) return;

      const distance = this.distance(monster.position, player.position);

      // Check detection radius first, then line of sight
      if (distance < monster.detectionRadius && monsterRoom) {
        if (hasLineOfSight(monster.position, player.position, monsterRoom, allRooms)) {
          detectedPlayer = player;
        }
      }
    });

    const hasActiveNoiseTarget =
      this.noiseLevel > GAME_CONFIG.MONSTER_SPAWN_THRESHOLD * 0.6 &&
      this.noiseSource !== null &&
      now < this.noiseSourceExpiresAt;

    // Update monster state
    if (detectedPlayer) {
      monster.state = 'hunt';
      monster.targetPosition = { ...detectedPlayer.position };
      monster.lastKnownPlayerPos = { ...detectedPlayer.position };
      this.moveToward(monster, detectedPlayer.position, deltaTime);
    } else if (hasActiveNoiseTarget && this.noiseSource) {
      // Investigate loud interactions first.
      monster.state = 'alert';
      monster.targetPosition = { ...this.noiseSource };
      this.moveToward(monster, this.noiseSource, deltaTime);
    } else if (monster.state === 'hunt' && monster.lastKnownPlayerPos) {
      // Hunt toward last known position
      this.moveToward(monster, monster.lastKnownPlayerPos, deltaTime);
      if (this.distance(monster.position, monster.lastKnownPlayerPos) < 0.8) {
        monster.state = 'return';
      }
    } else if (monster.state === 'alert') {
      if (monster.targetPosition) {
        this.moveToward(monster, monster.targetPosition, deltaTime);
      }
      if (!monster.targetPosition || this.distance(monster.position, monster.targetPosition) < 0.8) {
        monster.state = 'return';
      }
    } else if (monster.state === 'return') {
      // Soft reset to idle after investigation.
      monster.velocity = { x: 0, y: 0, z: 0 };
      if (this.noiseLevel < GAME_CONFIG.MONSTER_SPAWN_THRESHOLD * 0.45) {
        monster.state = 'idle';
      }
    } else {
      // Idle state
      if (this.noiseLevel < GAME_CONFIG.MONSTER_SPAWN_THRESHOLD * 0.5) {
        monster.state = 'idle';
      }
    }

    // Update monster in store
    useGameStore.getState().updateMonster(monster.id, {
      position: monster.position,
      state: monster.state,
      targetPosition: monster.targetPosition,
      lastKnownPlayerPos: monster.lastKnownPlayerPos,
    });
  }

  /**
   * Check mission win/loss conditions
   */
  private checkMissionConditions(state: any): void {
    if (!state.mission) return;

    const mission = state.mission as Mission;
    const now = Date.now();
    const elapsed = (now - mission.startTime) / 1000;

    // Check time limit
    if (elapsed > mission.timeLimit) {
      useGameStore.getState().endMission(false);
      useGameStore.getState().addNotification('Time limit exceeded!', 'danger');
      return;
    }

    // Check if all players dead
    const activePlayers = Array.from(state.players.values()).filter((p: Player) => !p.isDead);
    if (activePlayers.length === 0) {
      useGameStore.getState().endMission(false);
      useGameStore.getState().addNotification('All players eliminated!', 'danger');
    }
  }

  /**
   * Calculate noise level based on player movement
   */
  private calculateNoise(player: Player, isSprinting: boolean): number {
    const isMoving = player.velocity.x !== 0 || player.velocity.y !== 0;

    if (!isMoving) return 0;

    if (player.isCrouching) {
      return GAME_CONFIG.NOISE_CROUCH;
    } else if (isSprinting) {
      return GAME_CONFIG.NOISE_SPRINT;
    } else {
      return GAME_CONFIG.NOISE_WALK;
    }
  }

  /**
   * Calculate distance between two positions
   */
  private distance(a: any, b: any): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Move monster toward target
   */
  private moveToward(monster: Monster, target: any, deltaTime: number): void {
    const dx = target.x - monster.position.x;
    const dy = target.y - monster.position.y;
    const dz = target.z - monster.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance < 0.1) {
      monster.velocity = { x: 0, y: 0, z: 0 };
      return;
    }

    const speed = monster.moveSpeed;
    monster.velocity = {
      x: (dx / distance) * speed,
      y: (dy / distance) * speed,
      z: (dz / distance) * speed,
    };

    monster.position.x += monster.velocity.x * deltaTime;
    monster.position.y += monster.velocity.y * deltaTime;
    monster.position.z += monster.velocity.z * deltaTime;

    // Apply room boundaries for monsters too
    const monsterRoom = findRoomAtPosition(monster.position, Array.from(this.roomsMap.values()));
    if (monsterRoom) {
      monster.position = clampPositionToRoom(monster.position, monsterRoom);

      // Allow monsters to follow through doorways to adjacent rooms
      const connectedRoom = getNearbyConnectedRoom(monster.position, monsterRoom, this.roomsMap, 3.2);
      if (connectedRoom && connectedRoom.id !== monsterRoom.id) {
        const angle = Math.atan2(
          connectedRoom.position.z - monsterRoom.position.z,
          connectedRoom.position.x - monsterRoom.position.x
        );
        monster.position.x = connectedRoom.position.x - Math.cos(angle) * 2.4;
        monster.position.z = connectedRoom.position.z - Math.sin(angle) * 2.4;
      }
    }
  }

  /**
   * Handle damage to item
   */
  applyItemDamage(item: LootItem, damageAmount: number): void {
    const newDamage = Math.min(100, item.damage + damageAmount);
    useGameStore.getState().updateLoot(item.id, {
      damage: newDamage,
      currentValue: Math.max(0, item.baseValue * (1 - newDamage / 100)),
    });
  }

  /**
   * Handle player taking damage
   */
  applyPlayerDamage(playerId: string, damageAmount: number): void {
    const state = useGameStore.getState();
    const player = state.players.get(playerId);

    if (player) {
      const newHealth = Math.max(0, player.health - damageAmount);
      const isDead = newHealth === 0;

      state.updatePlayer(playerId, {
        health: newHealth,
        isDead,
      });

      if (isDead) {
        state.addNotification(`Player ${player.name} has been eliminated!`, 'danger');
      }
    }
  }

  /**
   * Spawn monsters
   */
  spawnMonsters(count: number, facility: any): void {
    const state = useGameStore.getState();
    const spawnRoom = facility.rooms.get(state.mission?.facility?.monsterSpawnRoom);

    if (!spawnRoom) return;

    for (let i = 0; i < count; i++) {
      const tier = Math.floor(Math.random() * 3) + 1 as 1 | 2 | 3;
      const monster: Monster = {
        id: `monster-${Date.now()}-${i}`,
        tier,
        position: { ...spawnRoom.position },
        velocity: { x: 0, y: 0, z: 0 },
        state: 'idle',
        targetPosition: null,
        lastKnownPlayerPos: null,
        detectionRadius:
          tier === 1
            ? GAME_CONFIG.MONSTER_DETECTION_RADIUS_T1
            : tier === 2
              ? GAME_CONFIG.MONSTER_DETECTION_RADIUS_T2
              : GAME_CONFIG.MONSTER_DETECTION_RADIUS_T3,
        moveSpeed:
          tier === 1
            ? GAME_CONFIG.MONSTER_SPEED_T1
            : tier === 2
              ? GAME_CONFIG.MONSTER_SPEED_T2
              : GAME_CONFIG.MONSTER_SPEED_T3,
        spawnRoom: state.mission?.facility?.monsterSpawnRoom || '',
        health: 100,
        maxHealth: 100,
      };

      state.addMonster(monster);
    }
  }

  /**
   * Get current noise level
   */
  getNoiseLevel(): number {
    return this.noiseLevel;
  }

  /**
   * Add an impulse noise event from interactions like grabbing/throwing items.
   */
  addNoiseEvent(amount: number, source: { x: number; y: number; z: number }, durationMs: number = 3200): void {
    this.noiseLevel = Math.min(100, Math.max(this.noiseLevel, amount));
    this.noiseSource = { ...source };
    this.noiseSourceExpiresAt = Date.now() + durationMs;
  }

  /**
   * Check if monsters should spawn
   */
  shouldSpawnMonsters(): boolean {
    return this.noiseLevel > GAME_CONFIG.MONSTER_SPAWN_THRESHOLD;
  }
}

// Export singleton
export const gameEngine = new GameEngine();
