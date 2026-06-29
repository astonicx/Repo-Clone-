import React, { useState, useEffect } from 'react';
import { controlsManager } from '../systems/ControlsManager';

interface HintOverlayProps {
    visible: boolean;
    onDismiss: () => void;
}

export const HintOverlay: React.FC<HintOverlayProps> = ({ visible, onDismiss }) => {
    const [hints, setHints] = useState<string[]>([]);

    useEffect(() => {
        const controls = controlsManager.getControls();
        const newHints = [
            `🖱️ Move mouse to look around`,
            `📍 Click the DOOR FRAMES to move to connected rooms`,
            `🎯 Green circle = Extraction point (drop off loot there)`,
            `🕹️ ${controls.moveForward}${controls.moveBack}${controls.moveLeft}${controls.moveRight} = Move | ${controls.sprint} = Sprint | ${controls.crouch} = Crouch`,
            `✋ ${controls.interact} = Grab/Drop loot at extraction point`,
            `🗺️ ${controls.map} = Toggle map`,
            `🤫 Sneak to avoid monsters detecting you`,
        ];
        setHints(newHints);
    }, []);

    if (!visible) return null;

    return (
        <div className="hint-overlay">
            <div className="hints-container">
                <h2>Quick Start Guide</h2>
                <div className="hints-list">
                    {hints.map((hint, i) => (
                        <div key={i} className="hint-item">
                            {hint}
                        </div>
                    ))}
                </div>
                <button className="hint-close" onClick={onDismiss}>
                    Got it! (Press ESC to hide)
                </button>
            </div>

            <style jsx>{`
                .hint-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 500;
                    backdrop-filter: blur(2px);
                }

                .hints-container {
                    background: linear-gradient(135deg, #0a1428 0%, #141d2d 100%);
                    border: 2px solid #00d4ff;
                    border-radius: 8px;
                    padding: 24px;
                    max-width: 500px;
                    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
                }

                .hints-container h2 {
                    color: #00d4ff;
                    margin: 0 0 16px 0;
                    font-size: 24px;
                    text-align: center;
                }

                .hints-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .hint-item {
                    color: #e8f4f8;
                    font-size: 14px;
                    padding: 8px 12px;
                    background: rgba(0, 212, 255, 0.05);
                    border-left: 3px solid #00d4ff;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                }

                .hint-close {
                    width: 100%;
                    padding: 10px;
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    border: none;
                    border-radius: 4px;
                    color: #000;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .hint-close:hover {
                    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};

export default HintOverlay;
