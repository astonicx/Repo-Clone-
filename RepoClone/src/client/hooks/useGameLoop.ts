import { useEffect, useRef } from 'react';
import { gameEngine } from '../systems/GameEngine';
import { inputSystem } from '../systems/InputSystem';
import { useGameStore } from '../systems/GameStateManager';
import type { LootItem, Room, Vector3 } from '../types';
import { GAME_CONFIG } from '../utils/constants';
import { getDoorLocationsInRoom, checkDoorClick, teleportThroughDoor } from '../utils/doorSystem';
import { findRoomAtPosition } from '../utils/roomUtils';

interface UseGameLoopOptions {
    extractionPoint: Vector3;
    quota: number;
    rooms?: Room[];
}

/**
 * Drives the per-frame game simulation while a mission is active:
 * - feeds keyboard input into the player's velocity
 * - applies monster contact damage (with a short cooldown)
 * - resolves loot extraction near the extraction point
 * - checks the profit quota win condition
 */
export function useGameLoop({ extractionPoint, quota, rooms = [] }: UseGameLoopOptions): void {
    const rafRef = useRef<number | null>(null);
    const lastDamageRef = useRef<number>(0);

    useEffect(() => {
        if (rooms.length > 0) {
            const roomsMap = new Map<string, Room>();
            rooms.forEach((room) => roomsMap.set(room.id, room));
            gameEngine.setRoomMap(roomsMap);
        }

        gameEngine.start();

        const loop = (): void => {
            const store = useGameStore.getState();

            if (store.state === 'PLAYING' && store.mission?.status === 'active') {
                inputSystem.updatePlayerMovement();

                const currentId = store.currentPlayer?.id;
                const player = currentId ? store.players.get(currentId) : undefined;

                if (player && !player.isDead) {
                    const now = performance.now();

                    store.monsters.forEach((monster) => {
                        const dx = monster.position.x - player.position.x;
                        const dz = monster.position.z - player.position.z;
                        const dist = Math.hypot(dx, dz);

                        if (dist < 1.5 && now - lastDamageRef.current > 1000) {
                            lastDamageRef.current = now;
                            gameEngine.applyPlayerDamage(player.id, GAME_CONFIG.MONSTER_DAMAGE);
                        }
                    });

                    if ((store.mission?.totalProfit ?? 0) >= quota) {
                        store.endMission(true);
                        store.addNotification('Quota reached — extraction successful!', 'success');
                    }
                }
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        // Door click handler for room transitions
        const handleDoorClick = (e: MouseEvent): void => {
            const store = useGameStore.getState();
            if (store.state !== 'PLAYING') return;

            const currentId = store.currentPlayer?.id;
            const player = currentId ? store.players.get(currentId) : undefined;
            if (!player) return;

            const allRooms = new Map<string, Room>();
            if (rooms.length > 0) {
                rooms.forEach((room) => allRooms.set(room.id, room));
            }

            const currentRoom = findRoomAtPosition(player.position, rooms);
            if (!currentRoom) return;

            // Calculate door positions (simplified - using canvas center)
            const canvas = document.querySelector('canvas.game-canvas') as HTMLCanvasElement;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            const centerX = 960 / 2;
            const roomScreenW = 760;
            const floorY = 470;

            const doorLocations = getDoorLocationsInRoom(currentRoom, centerX, floorY, roomScreenW, allRooms);
            const clickedDoor = checkDoorClick(clickX, clickY, doorLocations);

            if (clickedDoor) {
                const toRoom = allRooms.get(clickedDoor.connectedRoomId);
                if (toRoom) {
                    teleportThroughDoor(player, clickedDoor, currentRoom, toRoom);
                    store.updatePlayer(player.id, { position: player.position });
                    store.addNotification(`Entered ${toRoom.name}`, 'info');
                }
            }
        };

        document.addEventListener('click', handleDoorClick);

        // Contextual interaction on E:
        //  - holding loot at the extraction point -> extract it
        //  - holding loot elsewhere -> drop it
        //  - empty-handed -> grab the nearest loot within reach
        const handleInteract = (e: KeyboardEvent): void => {
            const key = e.key.toLowerCase();
            if (key !== 'e' && key !== 'q') return;

            const store = useGameStore.getState();
            if (store.state !== 'PLAYING') return;

            const currentId = store.currentPlayer?.id;
            const player = currentId ? store.players.get(currentId) : undefined;
            if (!player || player.isDead) return;

            if (key === 'q') {
                if (!player.heldItem) {
                    store.addNotification('Need a held item to throw', 'warning');
                    return;
                }

                const headingX = player.velocity.x === 0 ? 1 : Math.sign(player.velocity.x);
                const headingZ = player.velocity.z * 0.25;
                const throwTarget = {
                    x: player.position.x + headingX * 3.6,
                    y: player.position.y,
                    z: player.position.z + headingZ,
                };

                const thrown = player.heldItem;
                gameEngine.applyItemDamage(thrown, 24);
                store.updateLoot(thrown.id, { position: throwTarget });
                store.updatePlayer(player.id, { heldItem: null });
                gameEngine.addNoiseEvent(82, throwTarget, 4200);
                store.addNotification(`Threw ${thrown.name}!`, 'warning');
                return;
            }

            if (player.heldItem) {
                const dx = extractionPoint.x - player.position.x;
                const dz = extractionPoint.z - player.position.z;

                if (Math.hypot(dx, dz) < 4) {
                    const itemName = player.heldItem.name;
                    store.extractLoot(player.heldItem.id, player.id);
                    store.updatePlayer(player.id, { heldItem: null });
                    gameEngine.addNoiseEvent(16, { ...player.position }, 1200);
                    store.addNotification(`Extracted ${itemName}!`, 'success');
                } else {
                    const itemName = player.heldItem.name;
                    store.updateLoot(player.heldItem.id, { position: { ...player.position } });
                    store.updatePlayer(player.id, { heldItem: null });
                    gameEngine.addNoiseEvent(36, { ...player.position }, 2200);
                    store.addNotification(`Dropped ${itemName}`, 'info');
                }
                return;
            }

            // Empty-handed: grab the nearest loot within reach.
            let nearest: LootItem | null = null;
            let minDist = 2.5;
            store.lootItems.forEach((loot) => {
                const dx = loot.position.x - player.position.x;
                const dz = loot.position.z - player.position.z;
                const dist = Math.hypot(dx, dz);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = loot;
                }
            });

            if (nearest) {
                const item = nearest as LootItem;
                store.updatePlayer(player.id, { heldItem: item });
                gameEngine.addNoiseEvent(28, { ...player.position }, 1800);
                store.addNotification(`Grabbed ${item.name}`, 'info');
            } else {
                store.addNotification('No loot within reach', 'warning');
            }
        };

        document.addEventListener('keydown', handleInteract);

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            document.removeEventListener('click', handleDoorClick);
            document.removeEventListener('keydown', handleInteract);
            gameEngine.stop();
        };
    }, [extractionPoint, quota, rooms]);
}
