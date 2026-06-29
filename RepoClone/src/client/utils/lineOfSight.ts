import type { Vector3, Room } from '../types';

/**
 * Check if a point is on a line segment (for wall intersection).
 */
function pointOnSegment(p: Vector3, a: Vector3, b: Vector3): boolean {
    const cross = (p.z - a.z) * (b.x - a.x) - (p.x - a.x) * (b.z - a.z);
    if (Math.abs(cross) > 0.0001) return false;

    if (p.x !== b.x) return a.x <= p.x <= b.x || b.x <= p.x <= a.x;
    if (p.z !== b.z) return a.z <= p.z <= b.z || b.z <= p.z <= a.z;
    return true;
}

/**
 * Check if two line segments intersect (CCW method).
 */
function doSegmentsIntersect(
    p1: Vector3,
    q1: Vector3,
    p2: Vector3,
    q2: Vector3
): boolean {
    const ccw = (A: Vector3, B: Vector3, C: Vector3): boolean => {
        return (C.z - A.z) * (B.x - A.x) > (B.z - A.z) * (C.x - A.x);
    };

    return ccw(p1, p2, q2) !== ccw(q1, p2, q2) && ccw(p1, q1, p2) !== ccw(p1, q1, q2);
}

/**
 * Get wall segments for a room's boundary.
 */
function getRoomWalls(room: Room): Array<[Vector3, Vector3]> {
    const halfW = room.width / 2;
    const halfD = room.depth / 2;
    const cx = room.position.x;
    const cz = room.position.z;

    return [
        [
            { x: cx - halfW, y: 0, z: cz - halfD },
            { x: cx + halfW, y: 0, z: cz - halfD },
        ],
        [
            { x: cx + halfW, y: 0, z: cz - halfD },
            { x: cx + halfW, y: 0, z: cz + halfD },
        ],
        [
            { x: cx + halfW, y: 0, z: cz + halfD },
            { x: cx - halfW, y: 0, z: cz + halfD },
        ],
        [
            { x: cx - halfW, y: 0, z: cz + halfD },
            { x: cx - halfW, y: 0, z: cz - halfD },
        ],
    ];
}

/**
 * Check if there's a line of sight between two positions.
 * Considers room boundaries as obstacles.
 */
export function hasLineOfSight(
    from: Vector3,
    to: Vector3,
    currentRoom: Room,
    allRooms: Room[]
): boolean {
    // Quick distance check first
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // If targets are within a reasonable distance, perform LOS check
    if (distance > 25) return false; // Too far away

    // Check if both are in the same room - line of sight exists
    const fromRoom = allRooms.find((r) => {
        const hw = r.width / 2;
        const hd = r.depth / 2;
        return (
            from.x >= r.position.x - hw &&
            from.x <= r.position.x + hw &&
            from.z >= r.position.z - hd &&
            from.z <= r.position.z + hd
        );
    });

    const toRoom = allRooms.find((r) => {
        const hw = r.width / 2;
        const hd = r.depth / 2;
        return (
            to.x >= r.position.x - hw &&
            to.x <= r.position.x + hw &&
            to.z >= r.position.z - hd &&
            to.z <= r.position.z + hd
        );
    });

    // If in same room, has line of sight
    if (fromRoom && toRoom && fromRoom.id === toRoom.id) {
        return true;
    }

    // If in adjacent rooms, also allow line of sight (doorway open)
    if (
        fromRoom &&
        toRoom &&
        fromRoom.connectedRooms.includes(toRoom.id) &&
        toRoom.connectedRooms.includes(fromRoom.id)
    ) {
        return true;
    }

    return false;
}

/**
 * Get all visible players from a monster's position.
 */
export function getVisiblePlayers(
    monsterPos: Vector3,
    detectionRadius: number,
    players: Array<{ position: Vector3; isDead: boolean }>,
    currentRoom: Room,
    allRooms: Room[]
): Array<{ position: Vector3; isDead: boolean }> {
    return players.filter((player) => {
        if (player.isDead) return false;

        const dx = player.position.x - monsterPos.x;
        const dz = player.position.z - monsterPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > detectionRadius) return false;

        // Must have line of sight
        return hasLineOfSight(monsterPos, player.position, currentRoom, allRooms);
    });
}
