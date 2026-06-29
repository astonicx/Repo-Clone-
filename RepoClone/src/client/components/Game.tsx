import React, { useCallback, useMemo, useState } from 'react';
import '../styles/game.css';
import { useGameStore } from '../systems/GameStateManager';
import { levelGenerator } from '../systems/LevelGenerator';
import type { Facility, Mission, Monster, Player } from '../types';
import { GAME_CONFIG } from '../utils/constants';
import { getPlayerArchetypeByIndex, getMonsterVariantByTier } from '../utils/archetypes';
import { useGameLoop } from '../hooks/useGameLoop';
import { GameCanvas } from './GameCanvas';
import { HUD } from './HUD';
import { LoadingScreen } from './LoadingScreen';
import { MainMenu } from './MainMenu';
import { MissionResult } from './MissionResult';

const MISSION_TIME_LIMIT = 180; // 3 minutes for a playable slice
const QUOTA_FRACTION = 0.25; // need to extract 25% of available loot value

/** Builds the per-mission monster roster at the spawn room. */
function spawnMonsters(facility: Facility, count: number): Monster[] {
    const spawnRoom = facility.rooms.get(facility.monsterSpawnRoom);
    const monsters: Monster[] = [];
    if (!spawnRoom) return monsters;

    for (let i = 0; i < count; i++) {
        const tier = ((Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3);
        const variant = getMonsterVariantByTier(tier);
        monsters.push({
            id: `monster-${Date.now()}-${i}`,
            tier,
            variant,
            position: {
                x: spawnRoom.position.x + (Math.random() - 0.5) * 4,
                y: 0,
                z: spawnRoom.position.z + (Math.random() - 0.5) * 4,
            },
            velocity: { x: 0, y: 0, z: 0 },
            state: 'idle',
            targetPosition: null,
            lastKnownPlayerPos: null,
            detectionRadius:
                tier === 1
                    ? GAME_CONFIG.MONSTER_DETECTION_RADIUS_T1
                    : tier === 2
                        ? GAME_CONFIG.MONSTER_DETECTION_RADIUS_T2
                        : GAME_CONFIG.MONSTER_DETECTION_RADIUS_T3,
            moveSpeed:
                tier === 1
                    ? GAME_CONFIG.MONSTER_SPEED_T1
                    : tier === 2
                        ? GAME_CONFIG.MONSTER_SPEED_T2
                        : GAME_CONFIG.MONSTER_SPEED_T3,
            spawnRoom: facility.monsterSpawnRoom,
            health: 100,
            maxHealth: 100,
        });
    }
    return monsters;
}

interface GameViewProps {
    facility: Facility;
    quota: number;
}

/** Active mission view: mounts the loop and renders the canvas + HUD. */
const GameView: React.FC<GameViewProps> = ({ facility, quota }) => {
    const rooms = useMemo(() => Array.from(facility.rooms.values()), [facility]);
    const state = useGameStore((s) => s.state);
    const setGameState = useGameStore((s) => s.setGameState);
    const reset = useGameStore((s) => s.reset);

    useGameLoop({ extractionPoint: facility.extractionPoint, quota, rooms });

    return (
        <div className="game-view">
            <GameCanvas rooms={rooms} extractionPoint={facility.extractionPoint} />
            <HUD quota={quota} extractionPoint={facility.extractionPoint} rooms={rooms} />

            {state === 'PAUSED' && (
                <div className="repo-overlay">
                    <div className="repo-overlay-card">
                        <h2>PAUSED</h2>
                        <button className="repo-start" onClick={() => setGameState('PLAYING')}>
                            RESUME
                        </button>
                        <button className="repo-secondary" onClick={reset}>
                            ABANDON MISSION
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const Game: React.FC = () => {
    const state = useGameStore((s) => s.state);
    const setGameState = useGameStore((s) => s.setGameState);
    const startMission = useGameStore((s) => s.startMission);
    const reset = useGameStore((s) => s.reset);

    const [facility, setFacility] = useState<Facility | null>(null);
    const [quota, setQuota] = useState(0);

    const startGame = useCallback(
        (facilityType: Facility['type']) => {
            const store = useGameStore.getState();
            store.reset();

            const seed = Math.floor(Math.random() * 1_000_000);
            const generated = levelGenerator.generateFacility(facilityType, seed);

            // Load loot into the store and tally total available value.
            let totalValue = 0;
            generated.rooms.forEach((room) => {
                room.items.forEach((item) => {
                    totalValue += item.baseValue;
                    store.addLoot({ ...item, currentValue: item.baseValue });
                });
            });

            // Place the player in the first room.
            const firstRoom = generated.rooms.values().next().value;
            const player: Player = {
                id: 'player-1',
                name: 'Operative',
                archetype: getPlayerArchetypeByIndex(Math.floor(Math.random() * 4)),
                position: firstRoom
                    ? { ...firstRoom.position }
                    : { ...generated.extractionPoint },
                velocity: { x: 0, y: 0, z: 0 },
                health: GAME_CONFIG.PLAYER_HEALTH_MAX,
                maxHealth: GAME_CONFIG.PLAYER_HEALTH_MAX,
                stamina: GAME_CONFIG.STAMINA_MAX,
                maxStamina: GAME_CONFIG.STAMINA_MAX,
                isSprinting: false,
                isCrouching: false,
                angle: 0,
                heldItem: null,
                isDead: false,
                lastNoise: 0,
            };
            store.addPlayer(player);
            store.setCurrentPlayer(player);

            // Spawn monsters.
            spawnMonsters(generated, 4).forEach((m) => store.addMonster(m));

            const computedQuota = Math.max(500, Math.round(totalValue * QUOTA_FRACTION));

            const mission: Mission = {
                id: `mission-${Date.now()}`,
                facilityId: generated.id,
                difficulty: 'normal',
                timeLimit: MISSION_TIME_LIMIT,
                startTime: Date.now(),
                players: [],
                monsters: [],
                extractedLoot: [],
                totalProfit: 0,
                status: 'active',
            };

            startMission(mission); // sets state to MISSION_BRIEFING
            setFacility(generated);
            setQuota(computedQuota);
            setGameState('LOADING');
        },
        [setGameState, startMission]
    );

    const handlePlayAgain = useCallback(() => {
        reset();
        setFacility(null);
    }, [reset]);

    if (state === 'MENU' || !facility) {
        return <MainMenu onStart={startGame} />;
    }

    if (state === 'LOADING') {
        return <LoadingScreen onComplete={() => setGameState('PLAYING')} />;
    }

    if (state === 'MISSION_COMPLETE' || state === 'MISSION_FAILED') {
        return (
            <MissionResult
                success={state === 'MISSION_COMPLETE'}
                quota={quota}
                onPlayAgain={handlePlayAgain}
                onMainMenu={handlePlayAgain}
            />
        );
    }

    // PLAYING / PAUSED / MISSION_BRIEFING / PLAYER_DEAD
    return <GameView facility={facility} quota={quota} />;
};

export default Game;
