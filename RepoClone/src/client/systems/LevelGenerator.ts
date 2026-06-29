import type { Facility, Room, LootItem, Vector3 } from '../types';
import { FACILITY_TYPES, ROOM_TYPES, LOOT_VALUES } from '../utils/constants';

export class LevelGenerator {
  /**
   * Generate a random facility
   */
  generateFacility(
    type: 'museum' | 'laboratory' | 'academy' | 'residential',
    seed: number
  ): Facility {
    const rng = this.seededRandom(seed);

    const roomCount = Math.floor(rng() * 8) + 8; // 8-15 rooms
    const rooms = new Map<string, Room>();

    // Create extraction point
    const extractionPoint: Vector3 = {
      x: 0,
      y: 0,
      z: 0,
    };

    // Generate rooms
    for (let i = 0; i < roomCount; i++) {
      const room = this.generateRoom(i, type, rng);
      rooms.set(room.id, room);
    }

    this.connectRooms(rooms, roomCount, rng);

    // Add loot to rooms
    const lootItems: LootItem[] = [];
    rooms.forEach((room) => {
      const lootInRoom = this.generateLootForRoom(room, type, rng);
      lootItems.push(...lootInRoom);
      room.items = lootInRoom;
    });

    // Determine monster spawn room (farthest from extraction)
    let monsterSpawnRoom = Array.from(rooms.keys())[0];
    let maxDistance = 0;

    rooms.forEach((room, roomId) => {
      const distance = Math.sqrt(room.position.x * room.position.x + room.position.z * room.position.z);
      if (distance > maxDistance) {
        maxDistance = distance;
        monsterSpawnRoom = roomId;
      }
    });

    return {
      id: `facility-${Date.now()}`,
      type,
      rooms,
      extractionPoint,
      monsterSpawnRoom,
      seed,
    };
  }

  /**
   * Generate a single room
   */
  private generateRoom(index: number, facilityType: string, rng: () => number): Room {
    const roomType = ROOM_TYPES[Math.floor(rng() * ROOM_TYPES.length)];
    const roomTheme = this.getRoomTheme(roomType, facilityType, rng);
    const roomVariant = Math.floor(rng() * 4);

    // Place rooms in a grid-like pattern with some randomness
    const columns = 4;
    const gridX = (index % columns) * 24;
    const gridZ = Math.floor(index / columns) * 22;
    const offsetX = (rng() - 0.5) * 8;
    const offsetZ = (rng() - 0.5) * 8;

    const roomWidth = 12 + rng() * 16;
    const roomDepth = 10 + rng() * 14;

    return {
      id: `room-${index}`,
      name: this.generateRoomName(roomType, facilityType, rng),
      type: roomType,
      theme: roomTheme,
      variant: roomVariant,
      position: {
        x: gridX + offsetX,
        y: 0,
        z: gridZ + offsetZ,
      },
      width: roomWidth,
      height: 3 + rng() * 3,
      depth: roomDepth,
      items: [],
      connectedRooms: [],
    };
  }

  /**
   * Build room graph: linear backbone with branch shortcuts.
   */
  private connectRooms(rooms: Map<string, Room>, roomCount: number, rng: () => number): void {
    const ids = Array.from(rooms.keys());

    const link = (a: string, b: string): void => {
      const roomA = rooms.get(a);
      const roomB = rooms.get(b);
      if (!roomA || !roomB) return;
      if (!roomA.connectedRooms.includes(b)) roomA.connectedRooms.push(b);
      if (!roomB.connectedRooms.includes(a)) roomB.connectedRooms.push(a);
    };

    // Backbone path so the whole map is traversable.
    for (let i = 0; i < ids.length - 1; i++) {
      link(ids[i], ids[i + 1]);
    }

    // Extra branch links to avoid a strict corridor-like graph.
    for (let i = 0; i < roomCount; i++) {
      const target = i + 2 + Math.floor(rng() * 3);
      if (target < ids.length && rng() > 0.45) {
        link(ids[i], ids[target]);
      }
    }
  }

  /**
   * Generate loot for a room
   */
  private generateLootForRoom(room: Room, facilityType: string, rng: () => number): LootItem[] {
    const loot: LootItem[] = [];

    // Determine what loot belongs in this facility type
    const lootCategories = this.getLootCategoriesForFacility(facilityType);

    // 3-8 items per room
    const itemCount = Math.floor(rng() * 6) + 3;

    for (let i = 0; i < itemCount; i++) {
      const category = lootCategories[Math.floor(rng() * lootCategories.length)];
      const values = LOOT_VALUES[category];

      const item: LootItem = {
        id: `loot-${room.id}-${i}`,
        name: this.generateLootName(category),
        category,
        baseValue: Math.floor(values.min + rng() * (values.max - values.min)),
        weight: 1 + rng() * 30, // 1-31 kg
        fragility: values.fragility,
        position: {
          x: room.position.x + (rng() - 0.5) * room.width,
          y: room.position.y + rng() * room.height,
          z: room.position.z + (rng() - 0.5) * room.depth,
        },
        damage: 0,
        currentValue: 0, // Will be calculated on extraction
      };

      loot.push(item);
    }

    return loot;
  }

  /**
   * Get loot categories for facility type
   */
  private getLootCategoriesForFacility(type: string): any[] {
    const lootMap: Record<string, any[]> = {
      museum: ['painting', 'sculpture', 'jewelry', 'document', 'oddity'],
      laboratory: ['electronics', 'document', 'oddity', 'furniture'],
      academy: ['document', 'sculpture', 'painting', 'oddity'],
      residential: ['jewelry', 'furniture', 'electronics', 'painting', 'oddity'],
    };

    return lootMap[type] || ['oddity'];
  }

  /**
   * Generate room name
   */
  private generateRoomName(roomType: string, facilityType: string, rng: () => number): string {
    const names: Record<string, string[]> = {
      corridor: ['Main Corridor', 'Side Passage', 'Connection Hall'],
      hall: ['Grand Hall', 'Main Exhibition', 'Central Chamber'],
      storage: ['Storage Room', 'Archive', 'Vault Chamber'],
      vault: ['Secure Vault', 'High Security Room', 'Lockdown Chamber'],
      hazard: ['Danger Zone', 'Restricted Area', 'Hazardous Room'],
    };

    const nameOptions = names[roomType] || ['Unknown Room'];
    return nameOptions[Math.floor(rng() * nameOptions.length)];
  }

  /**
   * Assign a visual room theme.
   */
  private getRoomTheme(roomType: string, facilityType: string, rng: () => number): Room['theme'] {
    const byFacility: Record<string, Room['theme'][]> = {
      museum: ['luxury', 'archive', 'sterile'],
      laboratory: ['sterile', 'industrial', 'danger'],
      academy: ['archive', 'sterile', 'industrial'],
      residential: ['luxury', 'archive', 'industrial'],
    };

    const pool = byFacility[facilityType] ?? ['sterile', 'industrial'];
    if (roomType === 'hazard') return 'danger';
    if (roomType === 'vault') return 'luxury';
    return pool[Math.floor(rng() * pool.length)];
  }

  /**
   * Generate loot name
   */
  private generateLootName(category: string): string {
    const names: Record<string, string[]> = {
      painting: ['Portrait', 'Landscape', 'Abstract Masterpiece', 'Still Life', 'Renaissance Work'],
      sculpture: ['Marble Statue', 'Bronze Figure', 'Stone Sculpture', 'Modern Art Piece'],
      electronics: ['Laptop Computer', 'Server Unit', 'Control Panel', 'Scientific Equipment'],
      jewelry: ['Gold Watch', 'Diamond Ring', 'Silver Bracelet', 'Gem Necklace'],
      furniture: ['Antique Chair', 'Wooden Desk', 'Ornate Cabinet', 'Classic Table'],
      document: ['Historical Record', 'Manuscript', 'Archive Folder', 'Important File'],
      oddity: ['Strange Device', 'Mysterious Object', 'Unusual Artifact', 'Curiosity'],
      unknown: ['Unknown Item'],
    };

    const nameOptions = names[category] || ['Unknown Item'];
    return nameOptions[Math.floor(Math.random() * nameOptions.length)];
  }

  /**
   * Seeded random number generator
   */
  private seededRandom(seed: number): () => number {
    let m_w = seed;
    let m_z = 987654321;
    const mask = 0xffffffff;

    return () => {
      m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
      m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
      let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
      result /= 4294967296;
      return result;
    };
  }
}

export const levelGenerator = new LevelGenerator();
