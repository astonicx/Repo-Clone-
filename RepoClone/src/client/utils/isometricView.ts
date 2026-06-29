import type { Vector3, Room } from '../types';

export interface IsometricPos {
    x: number;
    y: number;
    depth: number; // for sorting
}

const COS_30 = Math.sqrt(3) / 2; // ~0.866
const SIN_30 = 0.5;
const ISOMETRIC_SCALE = 32; // pixels per unit

/**
 * Convert world position to isometric screen position.
 * Assumes camera is looking from (45, 45) angle in world space.
 */
export function toIsometricScreen(worldX: number, worldZ: number, worldY: number = 0): IsometricPos {
    // Isometric projection
    const screenX = (worldX - worldZ) * COS_30 * ISOMETRIC_SCALE;
    const screenY = (worldX + worldZ) * SIN_30 * ISOMETRIC_SCALE - worldY * ISOMETRIC_SCALE;

    // Depth for sorting (further back = higher Z, rendered first)
    const depth = worldZ + worldX;

    return { x: screenX, y: screenY, depth };
}

/**
 * Convert isometric screen position back to world position (approximate, no Z recovery).
 */
export function fromIsometricScreen(screenX: number, screenY: number): { x: number; z: number } {
    const sx = screenX / (COS_30 * ISOMETRIC_SCALE);
    const sy = screenY / (SIN_30 * ISOMETRIC_SCALE);

    const x = (sx + sy) / 2;
    const z = (sy - sx) / 2;

    return { x, z };
}

/**
 * Get room bounds in isometric screen space.
 */
export function getRoomScreenBounds(
    room: Room,
    centerScreenX: number,
    centerScreenY: number
): { minX: number; maxX: number; minY: number; maxY: number } {
    const c1 = toIsometricScreen(room.position.x, room.position.z, 0);
    const c2 = toIsometricScreen(room.position.x + room.width, room.position.z, 0);
    const c3 = toIsometricScreen(room.position.x, room.position.z + room.depth, 0);
    const c4 = toIsometricScreen(room.position.x + room.width, room.position.z + room.depth, 0);

    const xs = [c1.x, c2.x, c3.x, c4.x].map((x) => x + centerScreenX);
    const ys = [c1.y, c2.y, c3.y, c4.y].map((y) => y + centerScreenY);

    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
    };
}

/**
 * Draw isometric room floor and walls.
 */
export function drawIsometricRoom(
    ctx: CanvasRenderingContext2D,
    room: Room,
    centerX: number,
    centerY: number,
    skinColor: string,
    darkColor: string
): void {
    // Room bounds in isometric
    const nw = toIsometricScreen(room.position.x, room.position.z, 0);
    const ne = toIsometricScreen(room.position.x + room.width, room.position.z, 0);
    const sw = toIsometricScreen(room.position.x, room.position.z + room.depth, 0);
    const se = toIsometricScreen(room.position.x + room.width, room.position.z + room.depth, 0);

    // Floor (bottom face)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(centerX + nw.x, centerY + nw.y);
    ctx.lineTo(centerX + ne.x, centerY + ne.y);
    ctx.lineTo(centerX + se.x, centerY + se.y);
    ctx.lineTo(centerX + sw.x, centerY + sw.y);
    ctx.closePath();
    ctx.fill();

    // Left wall
    const wallH = 60;
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(centerX + nw.x, centerY + nw.y);
    ctx.lineTo(centerX + sw.x, centerY + sw.y);
    ctx.lineTo(centerX + sw.x, centerY + sw.y - wallH);
    ctx.lineTo(centerX + nw.x, centerY + nw.y - wallH);
    ctx.closePath();
    ctx.fill();

    // Right wall
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(centerX + ne.x, centerY + ne.y);
    ctx.lineTo(centerX + ne.x, centerY + ne.y - wallH);
    ctx.lineTo(centerX + se.x, centerY + se.y - wallH);
    ctx.lineTo(centerX + se.x, centerY + se.y);
    ctx.closePath();
    ctx.fill();

    // Floor grid for visual interest
    ctx.strokeStyle = `${skinColor}aa`;
    ctx.lineWidth = 1;
    const gridSpacing = 4;
    for (let i = 0; i <= room.width; i += gridSpacing) {
        const s1 = toIsometricScreen(room.position.x + i, room.position.z, 0);
        const s2 = toIsometricScreen(room.position.x + i, room.position.z + room.depth, 0);
        ctx.beginPath();
        ctx.moveTo(centerX + s1.x, centerY + s1.y);
        ctx.lineTo(centerX + s2.x, centerY + s2.y);
        ctx.stroke();
    }
    for (let i = 0; i <= room.depth; i += gridSpacing) {
        const s1 = toIsometricScreen(room.position.x, room.position.z + i, 0);
        const s2 = toIsometricScreen(room.position.x + room.width, room.position.z + i, 0);
        ctx.beginPath();
        ctx.moveTo(centerX + s1.x, centerY + s1.y);
        ctx.lineTo(centerX + s2.x, centerY + s2.y);
        ctx.stroke();
    }
}

/**
 * Draw isometric door on edge of room.
 */
export function drawIsometricDoor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    isOpen: boolean
): void {
    const now = Date.now();
    const pulse = 0.4 + 0.6 * Math.sin((now + 0) / 600);

    // Door frame
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);

    // Door handle glow
    ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
    ctx.beginPath();
    ctx.arc(x + width / 4, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Door status
    if (isOpen) {
        ctx.fillStyle = 'rgba(100, 200, 100, 0.3)';
        ctx.fillRect(x - width / 2 + 2, y - height / 2 + 2, width - 4, height - 4);
    } else {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.fillRect(x - width / 2 + 2, y - height / 2 + 2, width - 4, height - 4);
    }
}
