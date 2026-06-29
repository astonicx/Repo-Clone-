import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GameStore, GameState, Player, Monster, Mission, LootItem, Notification } from '../types';
import { GAME_CONFIG, LOOT_VALUES } from '../utils/constants';

interface GameStoreState extends GameStore {
  // State setters
  setGameState: (state: GameState) => void;
  setCurrentPlayer: (player: Player | null) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  
  // Mission management
  startMission: (mission: Mission) => void;
  endMission: (success: boolean) => void;
  updateMission: (updates: Partial<Mission>) => void;
  
  // Monster management
  addMonster: (monster: Monster) => void;
  updateMonster: (id: string, updates: Partial<Monster>) => void;
  removeMonster: (id: string) => void;
  
  // Loot management
  addLoot: (loot: LootItem) => void;
  updateLoot: (id: string, updates: Partial<LootItem>) => void;
  removeLoot: (id: string) => void;
  extractLoot: (lootId: string, playerId: string) => void;
  
  // UI management
  toggleMap: () => void;
  toggleInventory: () => void;
  toggleShop: () => void;
  addNotification: (message: string, type: 'info' | 'warning' | 'danger' | 'success') => void;
  removeNotification: (id: string) => void;
  
  // Upgrades & Currency
  addCurrency: (amount: number) => void;
  purchaseUpgrade: (upgradeId: string) => boolean;
  
  // Reset
  reset: () => void;
}

const initialState: GameStore = {
  state: 'MENU',
  mission: null,
  currentPlayer: null,
  players: new Map(),
  monsters: new Map(),
  lootItems: new Map(),
  uiState: {
    selectedMenu: null,
    showMap: false,
    showInventory: false,
    showShop: false,
    notifications: [],
  },
  upgrades: {},
  currency: 0,
};

export const useGameStore = create<GameStoreState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setGameState: (newState) =>
      set({ state: newState }),

    setCurrentPlayer: (player) =>
      set({ currentPlayer: player }),

    addPlayer: (player) =>
      set((state) => {
        const newPlayers = new Map(state.players);
        newPlayers.set(player.id, player);
        return { players: newPlayers };
      }),

    updatePlayer: (id, updates) =>
      set((state) => {
        const newPlayers = new Map(state.players);
        const player = newPlayers.get(id);
        if (player) {
          newPlayers.set(id, { ...player, ...updates });
        }
        return { players: newPlayers };
      }),

    removePlayer: (id) =>
      set((state) => {
        const newPlayers = new Map(state.players);
        newPlayers.delete(id);
        return { players: newPlayers };
      }),

    startMission: (mission) =>
      set({
        mission,
        state: 'MISSION_BRIEFING',
      }),

    endMission: (success) => {
      const state = get();
      if (state.mission) {
        const finalState = success ? 'MISSION_COMPLETE' : 'MISSION_FAILED';
        set({
          state: finalState,
          mission: { ...state.mission, status: success ? 'complete' : 'failed' },
        });
      }
    },

    updateMission: (updates) =>
      set((state) => {
        if (state.mission) {
          return { mission: { ...state.mission, ...updates } };
        }
        return state;
      }),

    addMonster: (monster) =>
      set((state) => {
        const newMonsters = new Map(state.monsters);
        newMonsters.set(monster.id, monster);
        return { monsters: newMonsters };
      }),

    updateMonster: (id, updates) =>
      set((state) => {
        const newMonsters = new Map(state.monsters);
        const monster = newMonsters.get(id);
        if (monster) {
          newMonsters.set(id, { ...monster, ...updates });
        }
        return { monsters: newMonsters };
      }),

    removeMonster: (id) =>
      set((state) => {
        const newMonsters = new Map(state.monsters);
        newMonsters.delete(id);
        return { monsters: newMonsters };
      }),

    addLoot: (loot) =>
      set((state) => {
        const newLootItems = new Map(state.lootItems);
        newLootItems.set(loot.id, loot);
        return { lootItems: newLootItems };
      }),

    updateLoot: (id, updates) =>
      set((state) => {
        const newLootItems = new Map(state.lootItems);
        const loot = newLootItems.get(id);
        if (loot) {
          newLootItems.set(id, { ...loot, ...updates });
        }
        return { lootItems: newLootItems };
      }),

    removeLoot: (id) =>
      set((state) => {
        const newLootItems = new Map(state.lootItems);
        newLootItems.delete(id);
        return { lootItems: newLootItems };
      }),

    extractLoot: (lootId, playerId) => {
      const state = get();
      const loot = state.lootItems.get(lootId);
      if (loot && state.mission) {
        // Calculate final value
        const category = loot.category;
        const categoryData = LOOT_VALUES[category];
        const damageMultiplier = Math.max(0, 1 - loot.damage / 100);
        const finalValue = loot.baseValue * damageMultiplier;
        const taxedValue = finalValue * (1 - GAME_CONFIG.TAX_RATE);

        // Add to extracted loot
        const updatedLoot = { ...loot, currentValue: taxedValue };
        const newExtracted = [...state.mission.extractedLoot, updatedLoot];
        const totalProfit = newExtracted.reduce((sum, item) => sum + item.currentValue, 0);

        set((prevState) => {
          const newMission = prevState.mission!;
          return {
            mission: {
              ...newMission,
              extractedLoot: newExtracted,
              totalProfit,
            },
          };
        });

        // Remove from loot items
        get().removeLoot(lootId);
      }
    },

    toggleMap: () =>
      set((state) => ({
        uiState: {
          ...state.uiState,
          showMap: !state.uiState.showMap,
        },
      })),

    toggleInventory: () =>
      set((state) => ({
        uiState: {
          ...state.uiState,
          showInventory: !state.uiState.showInventory,
        },
      })),

    toggleShop: () =>
      set((state) => ({
        uiState: {
          ...state.uiState,
          showShop: !state.uiState.showShop,
        },
      })),

    addNotification: (message, type) =>
      set((state) => {
        const notification: Notification = {
          id: `notif-${Date.now()}`,
          message,
          type,
          timestamp: Date.now(),
          duration: 3000,
        };
        return {
          uiState: {
            ...state.uiState,
            notifications: [...state.uiState.notifications, notification],
          },
        };
      }),

    removeNotification: (id) =>
      set((state) => ({
        uiState: {
          ...state.uiState,
          notifications: state.uiState.notifications.filter((n) => n.id !== id),
        },
      })),

    addCurrency: (amount) =>
      set((state) => ({
        currency: state.currency + amount,
      })),

    purchaseUpgrade: (upgradeId) => {
      const state = get();
      // TODO: Implement upgrade purchasing logic
      return true;
    },

    reset: () =>
      set(initialState),
  }))
);
