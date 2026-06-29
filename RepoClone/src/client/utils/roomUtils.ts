import type { Room, Vector3 } from '../types';

/**
 * Find which room contains a position, or null if in hallway space.
 */
export function findRoomAtPosition(position: Vector3, rooms: Room[]): Room | null {
    for (const room of rooms) {
        if (isPositionInRoom(position, room)) {
            return room;
        }
    }
    return null;
}

/**
 * Check if a position is within a room's bounds.
 */
export function isPositionInRoom(position: Vector3, room: Room): boolean {
    const halfW = room.width / 2;
    const halfD = room.depth / 2;
    return (
        position.x >= room.position.x - halfW &&
        position.x <= room.position.x + halfW &&
        position.z >= room.position.z - halfD &&
        position.z <= room.position.z + halfD
    );
}

/**
 * Get the nearest room to a position (for positioning fallback).
 */
export function getNearestRoom(position: Vector3, rooms: Room[]): Room | null {
    if (rooms.length === 0) return null;
    let nearest = rooms[0];
    let minDist = Infinity;

    for (const room of rooms) {
        const dx = position.x - room.position.x;
        const dz = position.z - room.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minDist) {
            minDist = dist;
            nearest = room;
        }
    }
    return nearest;
}

/**
 * Clamp a position to stay within a room's bounds, or slide along edges.
 */
export function clampPositionToRoom(position: Vector3, room: Room): Vector3 {
    const halfW = room.width / 2;
    const halfD = room.depth / 2;
    const minX = room.position.x - halfW;
    const maxX = room.position.x + halfW;
    const minZ = room.position.z - halfD;
    const maxZ = room.position.z + halfD;

    return {
        x: Math.max(minX + 1.2, Math.min(position.x, maxX - 1.2)),
        y: position.y,
        z: Math.max(minZ + 1.2, Math.min(position.z, maxZ - 1.2)),
    };
}

/**
 * Check if two rooms are connected.
 */
export function areRoomsConnected(roomA: Room, roomB: Room): boolean {
    return roomA.connectedRooms.includes(roomB.id);
}

/**
 * Find all connected rooms (one-hop neighbors).
 */
export function getConnectedRooms(room: Room, allRooms: Map<string, Room>): Room[] {
    const connected: Room[] = [];
    for (const roomId of room.connectedRooms) {
        const neighbor = allRooms.get(roomId);
        if (neighbor) {
            connected.push(neighbor);
        }
    }
    return connected;
}

/**
 * Check if a position is near a doorway (threshold for room transitions).
 */
export function getNearbyConnectedRoom(
    position: Vector3,
    currentRoom: Room,
    allRooms: Map<string, Room>,
    doorwayThreshold: number = 2.4
): Room | null {
    // Check each connected room.
    for (const connectedId of currentRoom.connectedRooms) {
        const connectedRoom = allRooms.get(connectedId);
        if (!connectedRoom) continue;

        // Distance to connected room center.
        const dx = position.x - connectedRoom.position.x;
        const dz = position.z - connectedRoom.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        // If very close to neighboring room center, allow transition.
        if (dist < doorwayThreshold) {
            return connectedRoom;
        }
    }
    return null;
}
