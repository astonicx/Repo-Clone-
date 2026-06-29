import React, { useMemo } from 'react';
import { useGameStore } from '../systems/GameStateManager';
import type { Room, Vector3 } from '../types';

interface MiniMapProps {
    rooms: Room[];
    extractionPoint: Vector3;
}

const MAP_W = 210;
const MAP_H = 160;

const ROOM_COLORS: Record<Room['theme'], string> = {
    sterile: '#4db3d3',
    industrial: '#d6a35b',
    luxury: '#ffd700',
    archive: '#7ec789',
    danger: '#ff6464',
};

export const MiniMap: React.FC<MiniMapProps> = ({ rooms, extractionPoint }) => {
    const store = useGameStore();

    const mapData = useMemo(() => {
        let minX = Infinity;
        let maxX = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;

        rooms.forEach((r) => {
            minX = Math.min(minX, r.position.x - r.width / 2);
            maxX = Math.max(maxX, r.position.x + r.width / 2);
            minZ = Math.min(minZ, r.position.z - r.depth / 2);
            maxZ = Math.max(maxZ, r.position.z + r.depth / 2);
        });

        minX = Math.min(minX, extractionPoint.x, 0);
        maxX = Math.max(maxX, extractionPoint.x, 0);
        minZ = Math.min(minZ, extractionPoint.z, 0);
        maxZ = Math.max(maxZ, extractionPoint.z, 0);

        const pad = 4;
        minX -= pad;
        maxX += pad;
        minZ -= pad;
        maxZ += pad;

        const worldW = maxX - minX || 1;
        const worldH = maxZ - minZ || 1;
        const scale = Math.min(MAP_W / worldW, MAP_H / worldH);

        const toMap = (x: number, z: number): [number, number] => [
            (x - minX) * scale,
            (z - minZ) * scale,
        ];

        return { toMap, scale };
    }, [rooms, extractionPoint]);

    return (
        <div className="mini-map" style={{ width: MAP_W, height: MAP_H }}>
            <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
                <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#0a0d0d" />

                {rooms.map((room) => {
                    const [x, y] = mapData.toMap(room.position.x - room.width / 2, room.position.z - room.depth / 2);
                    const w = room.width * mapData.scale;
                    const h = room.depth * mapData.scale;
                    return (
                        <g key={room.id}>
                            <rect x={x} y={y} width={w} height={h} fill={ROOM_COLORS[room.theme]} opacity="0.68" stroke="#2a2a1a" />
                            <text x={x + 3} y={y + 11} fontSize="7" fill="#dbe4c8">
                                {room.name}
                            </text>
                        </g>
                    );
                })}

                {rooms.map((room) =>
                    room.connectedRooms.map((id) => {
                        const peer = rooms.find((r) => r.id === id);
                        if (!peer || peer.id < room.id) return null;
                        const [x1, y1] = mapData.toMap(room.position.x, room.position.z);
                        const [x2, y2] = mapData.toMap(peer.position.x, peer.position.z);
                        return <line key={`${room.id}-${peer.id}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5a5a42" strokeWidth="1" opacity="0.7" />;
                    })
                )}

                {store.lootItems.size > 0 &&
                    Array.from(store.lootItems.values()).map((loot) => {
                        const [x, y] = mapData.toMap(loot.position.x, loot.position.z);
                        return <rect key={loot.id} x={x - 1.5} y={y - 1.5} width={3} height={3} fill="#d4af37" />;
                    })}

                {Array.from(store.monsters.values()).map((monster) => {
                    const [x, y] = mapData.toMap(monster.position.x, monster.position.z);
                    return <circle key={monster.id} cx={x} cy={y} r="3" fill={monster.state === 'hunt' ? '#ff4a4a' : '#bd5e43'} />;
                })}

                {Array.from(store.players.values()).map((player) => {
                    const [x, y] = mapData.toMap(player.position.x, player.position.z);
                    return <circle key={player.id} cx={x} cy={y} r="3.5" fill="#4ad6d6" stroke="#0f1111" strokeWidth="1" />;
                })}

                {(() => {
                    const [x, y] = mapData.toMap(extractionPoint.x, extractionPoint.z);
                    return <circle cx={x} cy={y} r="4" fill="#62d96a" />;
                })()}
            </svg>
        </div>
    );
};

export default MiniMap;
