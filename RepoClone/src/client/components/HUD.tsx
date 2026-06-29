import React, { useEffect, useState } from 'react';
import { useGameStore } from '../systems/GameStateManager';
import { gameEngine } from '../systems/GameEngine';
import type { Room, Vector3 } from '../types';
import { MiniMap } from './MiniMap';

interface HUDProps {
    quota: number;
    extractionPoint: Vector3;
    rooms: Room[];
}

function formatTime(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
}

export const HUD: React.FC<HUDProps> = ({ quota, extractionPoint, rooms }) => {
    const players = useGameStore((s) => s.players);
    const currentPlayer = useGameStore((s) => s.currentPlayer);
    const mission = useGameStore((s) => s.mission);
    const notifications = useGameStore((s) => s.uiState.notifications);
    const removeNotification = useGameStore((s) => s.removeNotification);

    const [noise, setNoise] = useState(0);
    const [remaining, setRemaining] = useState(0);

    const player = currentPlayer ? players.get(currentPlayer.id) : undefined;

    // Poll engine-derived values (noise) and mission timer at a light cadence.
    useEffect(() => {
        const id = window.setInterval(() => {
            setNoise(gameEngine.getNoiseLevel());
            if (mission) {
                const elapsed = (Date.now() - mission.startTime) / 1000;
                setRemaining(mission.timeLimit - elapsed);
            }
        }, 100);
        return () => window.clearInterval(id);
    }, [mission]);

    // Auto-dismiss notifications after their duration.
    useEffect(() => {
        const timers = notifications.map((n) =>
            window.setTimeout(() => removeNotification(n.id), n.duration)
        );
        return () => timers.forEach((t) => window.clearTimeout(t));
    }, [notifications, removeNotification]);

    if (!player) return null;

    const healthPct = (player.health / player.maxHealth) * 100;
    const staminaPct = (player.stamina / player.maxStamina) * 100;
    const profit = mission?.totalProfit ?? 0;
    const quotaPct = Math.min(100, (profit / quota) * 100);

    const distToExtract = Math.hypot(
        extractionPoint.x - player.position.x,
        extractionPoint.z - player.position.z
    );

    return (
        <div className="hud">
            {/* Top-left: vitals */}
            <div className="hud-panel hud-vitals">
                <div className="hud-stat">
                    <span className="hud-label">HP</span>
                    <div className="hud-bar">
                        <div className="hud-bar-fill health" style={{ width: `${healthPct}%` }} />
                    </div>
                    <span className="hud-value">{Math.round(player.health)}</span>
                </div>
                <div className="hud-stat">
                    <span className="hud-label">STA</span>
                    <div className="hud-bar">
                        <div className="hud-bar-fill stamina" style={{ width: `${staminaPct}%` }} />
                    </div>
                    <span className="hud-value">{Math.round(player.stamina)}</span>
                </div>
                <div className="hud-stat">
                    <span className="hud-label">NOISE</span>
                    <div className="hud-bar">
                        <div
                            className="hud-bar-fill noise"
                            style={{
                                width: `${noise}%`,
                                background: noise > 60 ? '#ff3030' : noise > 30 ? '#d4af37' : '#5ad65a',
                            }}
                        />
                    </div>
                    <span className="hud-value">{Math.round(noise)}%</span>
                </div>
            </div>

            <div className="hud-panel hud-minimap-panel">
                <div className="hud-minimap-title">FACILITY MINIMAP</div>
                <MiniMap rooms={rooms} extractionPoint={extractionPoint} />
            </div>

            {/* Top-right: objective */}
            <div className="hud-panel hud-objective">
                <div className="hud-timer">{formatTime(remaining)}</div>
                <div className="hud-quota-label">
                    SURPLUS {Math.round(profit)} / {quota}
                </div>
                <div className="hud-bar wide">
                    <div className="hud-bar-fill quota" style={{ width: `${quotaPct}%` }} />
                </div>
            </div>

            {/* Bottom-center: held item / interaction prompt */}
            <div className="hud-panel hud-held">
                {player.heldItem ? (
                    <>
                        <span className="hud-held-name">{player.heldItem.name}</span>
                        <span className="hud-held-meta">
                            Value {Math.round(player.heldItem.baseValue)} · {player.heldItem.weight.toFixed(0)}kg ·
                            dmg {Math.round(player.heldItem.damage)}%
                        </span>
                        <span className="hud-prompt">
                            {distToExtract < 4 ? 'Press E to EXTRACT' : 'Press E to drop · carry to the green extraction point'}
                        </span>
                    </>
                ) : (
                    <span className="hud-prompt dim">Press E near loot to grab · Q throw · WASD move · Shift sprint · Ctrl crouch</span>
                )}
            </div>

            {/* Notifications */}
            <div className="hud-notifications">
                {notifications.map((n) => (
                    <div key={n.id} className={`hud-notif ${n.type}`}>
                        {n.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HUD;
