import { useGameStore } from './GameStateManager';
import { GAME_CONFIG } from '../utils/constants';
import { controlsManager } from './ControlsManager';
import type { Player, Vector3 } from '../types';

// Movement acceleration constants (Fortnite-style feel)
const ACCELERATION_WALK = 25; // units/s²
const ACCELERATION_SPRINT = 35; // units/s²
const ACCELERATION_CROUCH = 15; // units/s²
const DECELERATION = 20; // units/s² (when no keys pressed)
const MAX_VELOCITY = 15; // cap velocity to prevent overshooting

export class InputSystem {
  private keysPressed: Set<string> = new Set();
  private mousePos: { x: number; y: number } = { x: 0, y: 0 };
  private isMouseDown: boolean = false;
  private currentVelocity: Vector3 = { x: 0, y: 0, z: 0 };
  private lastUpdateTime: number = Date.now();
  private cameraOffset: { x: number; y: number } = { x: 0, y: 0 };
  private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };
  private mouseSensitivity: number = 0.25;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Setup keyboard and mouse event listeners
   */
  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('wheel', this.handleScroll, { passive: false });
  }

  /**
   * Handle key down events
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key.toUpperCase();
    this.keysPressed.add(key);

    // Handle toggle states using ControlsManager
    if (key === controlsManager.getControl('crouch').toUpperCase()) {
      this.toggleCrouch();
    } else if (key === controlsManager.getControl('sprint').toUpperCase()) {
      this.startSprint();
    } else if (key === controlsManager.getControl('map').toUpperCase()) {
      useGameStore.getState().toggleMap();
    } else if (key === controlsManager.getControl('menu').toUpperCase()) {
      // Pause game
      useGameStore.getState().setGameState('PAUSED');
    } else if (key === controlsManager.getControl('interact').toUpperCase()) {
      this.handleInteract();
    }
  };

  /**
   * Handle key up events
   */
  private handleKeyUp = (e: KeyboardEvent): void => {
    const key = e.key.toUpperCase();
    this.keysPressed.delete(key);
  };

  /**
   * Handle mouse movement - track camera look
   */
  private handleMouseMove = (e: MouseEvent): void => {
    const dx = e.clientX - this.lastMousePos.x;
    const dy = e.clientY - this.lastMousePos.y;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.mousePos = { x: e.clientX, y: e.clientY };
    
    // Update camera offset for look-around effect
    this.cameraOffset.x += dx * this.mouseSensitivity;
    this.cameraOffset.y += dy * this.mouseSensitivity;
    
    // Clamp camera offset to reasonable bounds
    this.cameraOffset.x = Math.max(-40, Math.min(40, this.cameraOffset.x));
    this.cameraOffset.y = Math.max(-30, Math.min(30, this.cameraOffset.y));
  };

  /**
   * Handle mouse down
   */
  private handleMouseDown = (e: MouseEvent): void => {
    // Grabbing/dropping is handled by the E key (see useGameLoop).
    if (e.button === 2) {
      // Right click
      this.handleRotate();
    }
  };

  /**
   * Handle mouse up
   */
  private handleMouseUp = (_e: MouseEvent): void => {
    // No-op: item pickup/drop is bound to the E key.
  };

  /**
   * Handle mouse scroll
   */
  private handleScroll = (e: WheelEvent): void => {
    e.preventDefault();

    if (e.deltaY > 0) {
      // Scroll down - pull
      this.handlePull();
    } else {
      // Scroll up - push
      this.handlePush();
    }
  };

  /**
   * Update player movement based on input with acceleration/deceleration
   */
  updatePlayerMovement(): void {
    const state = useGameStore.getState();
    const player = state.currentPlayer;

    if (!player || state.state !== 'PLAYING') return;

    // Calculate delta time
    const now = Date.now();
    const deltaTime = Math.min((now - this.lastUpdateTime) / 1000, 0.033); // Cap at 33ms
    this.lastUpdateTime = now;

    const isSprinting = controlsManager.isActionPressed('sprint', this.keysPressed) && player.stamina > 0;
    const isCrouching = controlsManager.isActionPressed('crouch', this.keysPressed);

    let acceleration = ACCELERATION_WALK;
    let moveSpeed = GAME_CONFIG.PLAYER_SPEED_WALK;

    if (isSprinting) {
      acceleration = ACCELERATION_SPRINT;
      moveSpeed = GAME_CONFIG.PLAYER_SPEED_SPRINT;
    } else if (isCrouching) {
      acceleration = ACCELERATION_CROUCH;
      moveSpeed = GAME_CONFIG.PLAYER_SPEED_CROUCH;
    }

    // Desired velocity based on input
    const desiredVelocity: Vector3 = { x: 0, y: 0, z: 0 };

    if (controlsManager.isActionPressed('moveForward', this.keysPressed)) {
      desiredVelocity.z += moveSpeed;
    }
    if (controlsManager.isActionPressed('moveBack', this.keysPressed)) {
      desiredVelocity.z -= moveSpeed;
    }
    if (controlsManager.isActionPressed('moveLeft', this.keysPressed)) {
      desiredVelocity.x -= moveSpeed;
    }
    if (controlsManager.isActionPressed('moveRight', this.keysPressed)) {
      desiredVelocity.x += moveSpeed;
    }

    // Normalize desired velocity for diagonal movement
    const desiredSpeed = Math.sqrt(desiredVelocity.x ** 2 + desiredVelocity.z ** 2);
    if (desiredSpeed > moveSpeed) {
      desiredVelocity.x = (desiredVelocity.x / desiredSpeed) * moveSpeed;
      desiredVelocity.z = (desiredVelocity.z / desiredSpeed) * moveSpeed;
    }

    // Smoothly accelerate/decelerate towards desired velocity
    const currentSpeed = Math.sqrt(this.currentVelocity.x ** 2 + this.currentVelocity.z ** 2);

    if (desiredSpeed > 0) {
      // Accelerate towards desired direction
      const accelAmount = acceleration * deltaTime;

      if (currentSpeed === 0) {
        // Start moving in desired direction
        this.currentVelocity.x = desiredVelocity.x;
        this.currentVelocity.z = desiredVelocity.z;
      } else {
        // Smoothly blend towards desired velocity
        const targetSpeed = Math.min(currentSpeed + accelAmount, moveSpeed);
        const speedRatio = targetSpeed / currentSpeed;

        this.currentVelocity.x = this.currentVelocity.x * speedRatio;
        this.currentVelocity.z = this.currentVelocity.z * speedRatio;

        // Adjust direction towards input
        const dirChange = 0.15; // How quickly we change direction
        this.currentVelocity.x = this.currentVelocity.x * (1 - dirChange) + desiredVelocity.x * dirChange;
        this.currentVelocity.z = this.currentVelocity.z * (1 - dirChange) + desiredVelocity.z * dirChange;
      }
    } else {
      // Decelerate when no input
      if (currentSpeed > 0) {
        const decelAmount = DECELERATION * deltaTime;
        const newSpeed = Math.max(currentSpeed - decelAmount, 0);
        const speedRatio = newSpeed / currentSpeed;

        this.currentVelocity.x *= speedRatio;
        this.currentVelocity.z *= speedRatio;
      }
    }

    // Cap velocity
    const finalSpeed = Math.sqrt(this.currentVelocity.x ** 2 + this.currentVelocity.z ** 2);
    if (finalSpeed > MAX_VELOCITY) {
      const ratio = MAX_VELOCITY / finalSpeed;
      this.currentVelocity.x *= ratio;
      this.currentVelocity.z *= ratio;
    }

    // Update player
    state.updatePlayer(player.id, {
      velocity: { ...this.currentVelocity },
      isSprinting: isSprinting && player.stamina > 0,
      isCrouching,
    });
  }

  /**
   * Handle grabbing items
   */
  private handleGrab = (): void => {
    const state = useGameStore.getState();
    const player = state.currentPlayer;

    if (!player || player.heldItem) return;

    // Find nearest loot item (within 2 units)
    let nearestLoot: any = null;
    let minDistance = 2;

    state.lootItems.forEach((loot) => {
      const dx = loot.position.x - player.position.x;
      const dy = loot.position.y - player.position.y;
      const dz = loot.position.z - player.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < minDistance) {
        minDistance = distance;
        nearestLoot = loot;
      }
    });

    if (nearestLoot) {
      state.updatePlayer(player.id, {
        heldItem: nearestLoot,
      });
      state.addNotification(`Grabbed: ${nearestLoot.name}`, 'info');
    }
  };

  /**
   * Handle dropping items
   */
  private handleDrop = (): void => {
    const state = useGameStore.getState();
    const player = state.currentPlayer;

    if (!player || !player.heldItem) return;

    // Drop item at player location
    const droppedItem = {
      ...player.heldItem,
      position: { ...player.position },
    };

    state.updateLoot(player.heldItem.id, {
      position: droppedItem.position,
    });

    state.updatePlayer(player.id, {
      heldItem: null,
    });

    state.addNotification(`Dropped: ${player.heldItem.name}`, 'info');
  };

  /**
   * Handle item rotation
   */
  private handleRotate = (): void => {
    const player = useGameStore.getState().currentPlayer;
    if (!player || !player.heldItem) return;

    // Increment rotation (could be animated)
    // For now, just a simple visual indicator
    console.log('Rotating item:', player.heldItem.name);
  };

  /**
   * Handle pushing items
   */
  private handlePush = (): void => {
    const player = useGameStore.getState().currentPlayer;
    if (!player || !player.heldItem) return;

    // Push item away (increase distance slightly)
    player.heldItem.position.z -= 0.5;
    useGameStore.getState().updateLoot(player.heldItem.id, {
      position: player.heldItem.position,
    });
  };

  /**
   * Handle pulling items
   */
  private handlePull = (): void => {
    const player = useGameStore.getState().currentPlayer;
    if (!player || !player.heldItem) return;

    // Pull item closer (decrease distance slightly)
    player.heldItem.position.z += 0.5;
    useGameStore.getState().updateLoot(player.heldItem.id, {
      position: player.heldItem.position,
    });
  };

  /**
   * Handle interaction
   */
  private handleInteract = (): void => {
    const state = useGameStore.getState();
    const player = state.currentPlayer;

    if (!player) return;

    // TODO: Check for extraction zones, objects, etc.
    console.log('Player interacted at position:', player.position);
  };

  /**
   * Toggle crouch
   */
  private toggleCrouch = (): void => {
    const state = useGameStore.getState();
    const player = state.currentPlayer;

    if (!player) return;

    state.updatePlayer(player.id, {
      isCrouching: !player.isCrouching,
    });
  };

  /**
   * Start sprinting
   */
  private startSprint = (): void => {
    const state = useGameStore.getState();
    const player = state.currentPlayer;

    if (!player || player.stamina <= 0) return;

    state.updatePlayer(player.id, {
      isSprinting: true,
    });
  };

  /**
   * Check if key is pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key.toUpperCase());
  }

  /**
   * Get mouse position
   */
  getMousePosition(): { x: number; y: number } {
    return this.mousePos;
  }

  /**
   * Get camera offset for look-around
   */
  getCameraOffset(): { x: number; y: number } {
    return { ...this.cameraOffset };
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('wheel', this.handleScroll);
  }
}

// Export singleton
export const inputSystem = new InputSystem();
