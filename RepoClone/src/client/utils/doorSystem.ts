import type { Vector3, Room } from '../types';

export interface DoorLocation {
    roomId: string;
    connectedRoomId: string;
    position: Vector3;
    screenX: number;
    screenY: number;
    width: number;
    height: number;
    side: 'left' | 'right';
}

/**
 * Get all door positions for a room in screen space.
 */
export function getDoorLocationsInRoom(
    room: Room,
    centerX: number,
    floorY: number,
    roomScreenW: number,
    allRooms: Map<string, Room>
): DoorLocation[] {
    const doors: DoorLocation[] = [];

    room.connectedRooms.forEach((connectedId, index) => {
        const connectedRoom = allRooms.get(connectedId);
        if (!connectedRoom) return;

        const doorWidth = 34;
        const doorHeight = 90;
        const doorY = floorY - 110;

        if (index === 0) {
            // Left door
            const leftDoorX = centerX - roomScreenW / 2 + 14;
            doors.push({
                roomId: room.id,
                connectedRoomId: connectedId,
                position: connectedRoom.position,
                screenX: leftDoorX,
                screenY: doorY,
                width: doorWidth,
                height: doorHeight,
                side: 'left',
            });
        } else if (index === 1) {
            // Right door
            const rightDoorX = centerX + roomScreenW / 2 - 48;
            doors.push({
                roomId: room.id,
                connectedRoomId: connectedId,
                position: connectedRoom.position,
                screenX: rightDoorX,
                screenY: doorY,
                width: doorWidth,
                height: doorHeight,
                side: 'right',
            });
        }
    });

    return doors;
}

/**
 * Check if a click is on a door.
 */
export function checkDoorClick(
    clickX: number,
    clickY: number,
    doors: DoorLocation[]
): DoorLocation | null {
    for (const door of doors) {
        if (
            clickX >= door.screenX &&
            clickX <= door.screenX + door.width &&
            clickY >= door.screenY &&
            clickY <= door.screenY + door.height
        ) {
            return door;
        }
    }
    return null;
}

/**
 * Teleport player through a door.
 */
export function teleportThroughDoor(
    player: any,
    door: DoorLocation,
    fromRoom: Room,
    toRoom: Room
): void {
    // Calculate entry angle based on which door was used
    const angle = Math.atan2(toRoom.position.z - fromRoom.position.z, toRoom.position.x - fromRoom.position.x);

    // Place player just inside the new room
    player.position.x = toRoom.position.x - Math.cos(angle) * 3.2;
    player.position.z = toRoom.position.z - Math.sin(angle) * 3.2;

    // Optional: add a brief invulnerability window
    player.justTransitioned = true;
    setTimeout(() => {
        player.justTransitioned = false;
    }, 300);
}
