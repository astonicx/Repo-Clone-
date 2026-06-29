import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../systems/GameStateManager';
import type { Room, Vector3 } from '../types';
import { findRoomAtPosition } from '../utils/roomUtils';
import { drawCharacterSprite, PLAYER_ARCHETYPES, MONSTER_VARIANTS, getMonsterVariantByTier } from '../utils/archetypes';
import { drawRoomDecorations } from '../utils/roomDecorations';
import { toIsometricScreen, getRoomScreenBounds, drawIsometricRoom, drawIsometricDoor } from '../utils/isometricView';
import { drawLoot } from '../utils/lootVisuals';

interface GameCanvasProps {
    rooms: Room[];
    extractionPoint: Vector3;
}

const CANVAS_W = 960;
const CANVAS_H = 620;

const ROOM_SKINS: Record<Room['theme'], { wall: string; floor: string; accent: string; shadow: string }> = {
    sterile: { wall: '#2f3d44', floor: '#1a2428', accent: '#7ec7d8', shadow: '#102028' },
    industrial: { wall: '#4a3a2a', floor: '#2c2218', accent: '#d6a35b', shadow: '#20170f' },
    luxury: { wall: '#4a4632', floor: '#2a2416', accent: '#e1cf8d', shadow: '#1e1a11' },
    archive: { wall: '#3c4936', floor: '#21281c', accent: '#a4c189', shadow: '#131a11' },
    danger: { wall: '#4e2a2a', floor: '#2a1616', accent: '#e07474', shadow: '#201010' },
};

function findContainingRoom(position: Vector3, rooms: Room[]): Room | null {
    return findRoomAtPosition(position, rooms);
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ rooms, extractionPoint }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let raf = 0;

        const draw = (): void => {
            const store = useGameStore.getState();
            const currentPlayer = store.currentPlayer ? store.players.get(store.currentPlayer.id) : null;
            const focus = currentPlayer ?? Array.from(store.players.values())[0] ?? null;
            const room = focus ? findContainingRoom(focus.position, rooms) : rooms[0] ?? null;

            if (!room) {
                raf = requestAnimationFrame(draw);
                return;
            }

            const skin = ROOM_SKINS[room.theme];
            const centerX = CANVAS_W / 2;
            const centerY = CANVAS_H / 2 + 20;

            // Clear background
            ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
            const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
            sky.addColorStop(0, '#0b1215');
            sky.addColorStop(0.35, skin.shadow);
            sky.addColorStop(1, '#050605');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            // Draw isometric room
            drawIsometricRoom(ctx, room, centerX, centerY, skin.floor, skin.wall);

            const entities: Array<{ depth: number; draw: () => void }> = [];

            // Loot in current room
            store.lootItems.forEach((loot) => {
                const inRoom =
                    loot.position.x >= room.position.x &&
                    loot.position.x <= room.position.x + room.width &&
                    loot.position.z >= room.position.z &&
                    loot.position.z <= room.position.z + room.depth;
                if (!inRoom) return;

                const iso = toIsometricScreen(loot.position.x - room.position.x, loot.position.z - room.position.z, 0);
                entities.push({
                    depth: iso.depth,
                    draw: () => {
                        drawLoot(
                            ctx,
                            centerX + iso.x,
                            centerY + iso.y,
                            16,
                            loot.category,
                            loot.damage,
                            0.8
                        );
                    },
                });
            });

            // Monsters in current room
            store.monsters.forEach((monster) => {
                const monsterRoom = findContainingRoom(monster.position, rooms);
                if (!monsterRoom || monsterRoom.id !== room.id) return;
                const iso = toIsometricScreen(
                    monster.position.x - room.position.x,
                    monster.position.z - room.position.z,
                    monster.position.y
                );
                const variant = monster.variant || getMonsterVariantByTier(monster.tier);
                const monsterStats = MONSTER_VARIANTS[variant];
                const stateColor =
                    monster.state === 'hunt'
                        ? '#ff5757'
                        : monster.state === 'alert'
                            ? '#ffb357'
                            : monsterStats.color;

                entities.push({
                    depth: iso.depth,
                    draw: () => {
                        const bodyH = 34;
                        const bodyW = 18;
                        const animPhase = Date.now() % 3000;
                        drawCharacterSprite(
                            ctx,
                            centerX + iso.x,
                            centerY + iso.y,
                            bodyW,
                            bodyH,
                            stateColor,
                            false,
                            true,
                            animPhase,
                            monsterStats.personality,
                            monster.state
                        );

                        if (monster.state !== 'idle') {
                            ctx.strokeStyle =
                                monster.state === 'hunt' ? 'rgba(255,80,80,0.55)' : 'rgba(255,180,80,0.5)';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(centerX + iso.x, centerY + iso.y - bodyH, 14, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                    },
                });
            });

            // Players in current room
            store.players.forEach((player) => {
                const playerRoom = findContainingRoom(player.position, rooms);
                if (!playerRoom || playerRoom.id !== room.id) return;
                const iso = toIsometricScreen(
                    player.position.x - room.position.x,
                    player.position.z - room.position.z,
                    player.position.y
                );
                const isCurrent = player.id === store.currentPlayer?.id;
                const archetype = player.archetype || 'courier';
                const archetypeStats = PLAYER_ARCHETYPES[archetype];
                const playerColor = isCurrent ? archetypeStats.color : '#5c9094';
                const playerState = player.isSprinting ? 'hunt' : player.isCrouching ? 'alert' : 'idle';

                entities.push({
                    depth: iso.depth,
                    draw: () => {
                        const bodyH = 42;
                        const bodyW = 16;
                        const animPhase = Date.now() % 3000;

                        drawCharacterSprite(
                            ctx,
                            centerX + iso.x,
                            centerY + iso.y,
                            bodyW,
                            bodyH,
                            playerColor,
                            player.isDead,
                            false,
                            animPhase,
                            archetypeStats.personality,
                            playerState
                        );

                        if (player.heldItem) {
                            ctx.fillStyle = '#d4af37';
                            ctx.fillRect(centerX + iso.x + bodyW / 2 - 2, centerY + iso.y - bodyH + 5, 7, 7);
                        }
                    },
                });
            });

            // Draw extraction point
            const extractionInRoom =
                extractionPoint.x >= room.position.x &&
                extractionPoint.x <= room.position.x + room.width &&
                extractionPoint.z >= room.position.z &&
                extractionPoint.z <= room.position.z + room.depth;
            if (extractionInRoom) {
                const iso = toIsometricScreen(
                    extractionPoint.x - room.position.x,
                    extractionPoint.z - room.position.z,
                    0
                );
                const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 300);
                ctx.beginPath();
                ctx.ellipse(centerX + iso.x, centerY + iso.y + 6, 26, 8, 0, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(90,214,90,${0.16 + pulse * 0.2})`;
                ctx.fill();
                ctx.fillStyle = '#7fe784';
                ctx.font = 'bold 12px "Courier New", monospace';
                ctx.fillText('EXTRACT', centerX + iso.x - 22, centerY + iso.y - 8);
                entities.push({
                    depth: iso.depth,
                    draw: () => { }, // Already drawn above
                });
            }

            // Sort by depth and draw
            entities.sort((a, b) => a.depth - b.depth).forEach((entity) => entity.draw());

            // Draw doors
            const doorWidth = 34;
            const doorHeight = 90;
            room.connectedRooms.forEach((connectedId, index) => {
                if (index >= 2) return; // Only draw 2 doors
                const connectedRoom = rooms.find((r) => r.id === connectedId);
                if (!connectedRoom) return;

                let doorX = 0;
                let doorY = 0;

                if (index === 0) {
                    // Left door
                    const nw = toIsometricScreen(0, 0, 0);
                    const sw = toIsometricScreen(0, room.depth, 0);
                    doorX = centerX + (nw.x + sw.x) / 2;
                    doorY = centerY + (nw.y + sw.y) / 2;
                } else {
                    // Right door
                    const ne = toIsometricScreen(room.width, 0, 0);
                    const se = toIsometricScreen(room.width, room.depth, 0);
                    doorX = centerX + (ne.x + se.x) / 2;
                    doorY = centerY + (ne.y + se.y) / 2;
                }

                drawIsometricDoor(ctx, doorX, doorY, doorWidth, doorHeight, true);
            });

            // Room title and style stamp
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 18px "Courier New", monospace';
            ctx.fillText(room.name.toUpperCase(), 24, 42);
            ctx.fillStyle = skin.accent;
            ctx.font = '12px "Courier New", monospace';
            ctx.fillText(`${room.type.toUpperCase()} · ${room.theme.toUpperCase()}`, 24, 62);

            // Vignette
            const vignette = ctx.createRadialGradient(centerX, centerY, 180, centerX, centerY, 620);
            vignette.addColorStop(0, 'rgba(0,0,0,0)');
            vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            raf = requestAnimationFrame(draw);
        };

        raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
    }, [rooms, extractionPoint]);

    return <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="game-canvas" />;
};

export default GameCanvas;
