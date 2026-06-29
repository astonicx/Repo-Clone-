import React from 'react';
import { useGameStore } from '../systems/GameStateManager';

interface MissionResultProps {
    success: boolean;
    quota: number;
    onPlayAgain: () => void;
    onMainMenu: () => void;
}

export const MissionResult: React.FC<MissionResultProps> = ({
    success,
    quota,
    onPlayAgain,
    onMainMenu,
}) => {
    const mission = useGameStore((s) => s.mission);
    const profit = mission?.totalProfit ?? 0;
    const items = mission?.extractedLoot ?? [];

    return (
        <div className="repo-menu">
            <div className="scanlines" />
            <div className="repo-menu-content">
                <div
                    className="loading-title glitch"
                    data-text={success ? 'EXTRACTED' : 'FAILED'}
                    style={{ color: success ? '#5ad65a' : '#8b0000' }}
                >
                    {success ? 'EXTRACTED' : 'FAILED'}
                </div>
                <div className="loading-subtitle">
                    {success ? 'Quota met — the crew survives another day' : 'Mission lost'}
                </div>

                <div className="repo-menu-card">
                    <div className="repo-result-row">
                        <span>Total Surplus (post-tax)</span>
                        <span className="repo-result-value">{Math.round(profit)}</span>
                    </div>
                    <div className="repo-result-row">
                        <span>Quota</span>
                        <span className="repo-result-value">{quota}</span>
                    </div>
                    <div className="repo-result-row">
                        <span>Items extracted</span>
                        <span className="repo-result-value">{items.length}</span>
                    </div>

                    {items.length > 0 && (
                        <div className="repo-result-items">
                            {items.map((item) => (
                                <div key={item.id} className="repo-result-item">
                                    <span>{item.name}</span>
                                    <span>{Math.round(item.currentValue)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="repo-result-actions">
                        <button className="repo-start" onClick={onPlayAgain}>
                            ↻ NEW MISSION
                        </button>
                        <button className="repo-secondary" onClick={onMainMenu}>
                            MAIN MENU
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionResult;
