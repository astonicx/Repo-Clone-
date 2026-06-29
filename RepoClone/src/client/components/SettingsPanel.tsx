import React, { useState, useEffect } from 'react';
import { controlsManager, type ControlScheme } from '../systems/ControlsManager';

interface SettingsPanelProps {
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
    const [controls, setControls] = useState<ControlScheme>(controlsManager.getControls());
    const [listeningFor, setListeningFor] = useState<keyof ControlScheme | null>(null);
    const [conflicts, setConflicts] = useState<
        Array<{ action1: keyof ControlScheme; action2: keyof ControlScheme; key: string }>
    >([]);

    useEffect(() => {
        const unsubscribe = controlsManager.onChange((newControls) => {
            setControls(newControls);
            setConflicts(controlsManager.findConflicts());
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        setConflicts(controlsManager.findConflicts());
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent, action: keyof ControlScheme) => {
        if (listeningFor === action) {
            e.preventDefault();
            const key = e.key.toUpperCase();

            // Don't allow Escape to rebind
            if (key === 'ESCAPE') {
                setListeningFor(null);
                return;
            }

            controlsManager.setControl(action, key);
            setListeningFor(null);
        }
    };

    const getActionLabel = (action: keyof ControlScheme): string => {
        const labels: Record<keyof ControlScheme, string> = {
            moveForward: 'Move Forward',
            moveBack: 'Move Back',
            moveLeft: 'Strafe Left',
            moveRight: 'Strafe Right',
            sprint: 'Sprint',
            crouch: 'Crouch',
            interact: 'Interact',
            grab: 'Grab Item',
            drop: 'Drop Item',
            throw: 'Throw Item',
            map: 'Toggle Map',
            menu: 'Pause Menu',
        };
        return labels[action];
    };

    const handleReset = () => {
        if (confirm('Reset all controls to default?')) {
            controlsManager.resetToDefaults();
        }
    };

    const movementActions: (keyof ControlScheme)[] = ['moveForward', 'moveBack', 'moveLeft', 'moveRight'];
    const actionActions: (keyof ControlScheme)[] = ['sprint', 'crouch', 'interact', 'grab', 'drop', 'throw'];
    const systemActions: (keyof ControlScheme)[] = ['map', 'menu'];

    return (
        <div className="settings-panel">
            <div className="settings-container">
                <div className="settings-header">
                    <h2>Controls Settings</h2>
                    <button className="settings-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {conflicts.length > 0 && (
                    <div className="settings-warning">
                        <strong>⚠️ Keybind Conflicts:</strong>
                        <ul>
                            {conflicts.map((conflict, i) => (
                                <li key={i}>
                                    {getActionLabel(conflict.action1)} and {getActionLabel(conflict.action2)} both
                                    use "{conflict.key}"
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="settings-group">
                    <h3>Movement</h3>
                    <div className="controls-grid">
                        {movementActions.map((action) => (
                            <div key={action} className="control-item">
                                <label>{getActionLabel(action)}</label>
                                <button
                                    className={`control-button ${listeningFor === action ? 'listening' : ''} ${conflicts.some((c) => c.action1 === action || c.action2 === action)
                                            ? 'conflict'
                                            : ''
                                        }`}
                                    onClick={() => setListeningFor(listeningFor === action ? null : action)}
                                    onKeyDown={(e) => handleKeyDown(e, action)}
                                    onBlur={() => setListeningFor(null)}
                                >
                                    {listeningFor === action ? 'Press any key...' : controls[action]}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="settings-group">
                    <h3>Actions</h3>
                    <div className="controls-grid">
                        {actionActions.map((action) => (
                            <div key={action} className="control-item">
                                <label>{getActionLabel(action)}</label>
                                <button
                                    className={`control-button ${listeningFor === action ? 'listening' : ''} ${conflicts.some((c) => c.action1 === action || c.action2 === action)
                                            ? 'conflict'
                                            : ''
                                        }`}
                                    onClick={() => setListeningFor(listeningFor === action ? null : action)}
                                    onKeyDown={(e) => handleKeyDown(e, action)}
                                    onBlur={() => setListeningFor(null)}
                                >
                                    {listeningFor === action ? 'Press any key...' : controls[action]}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="settings-group">
                    <h3>System</h3>
                    <div className="controls-grid">
                        {systemActions.map((action) => (
                            <div key={action} className="control-item">
                                <label>{getActionLabel(action)}</label>
                                <button
                                    className={`control-button ${listeningFor === action ? 'listening' : ''} ${conflicts.some((c) => c.action1 === action || c.action2 === action)
                                            ? 'conflict'
                                            : ''
                                        }`}
                                    onClick={() => setListeningFor(listeningFor === action ? null : action)}
                                    onKeyDown={(e) => handleKeyDown(e, action)}
                                    onBlur={() => setListeningFor(null)}
                                >
                                    {listeningFor === action ? 'Press any key...' : controls[action]}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="btn btn-secondary" onClick={handleReset}>
                        Reset to Defaults
                    </button>
                    <button className="btn btn-primary" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>

            <style jsx>{`
                .settings-panel {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                .settings-container {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border: 2px solid #0f3460;
                    border-radius: 8px;
                    padding: 24px;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                }

                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #0f3460;
                    padding-bottom: 12px;
                }

                .settings-header h2 {
                    margin: 0;
                    color: #00d4ff;
                    font-size: 24px;
                    font-weight: bold;
                }

                .settings-close {
                    background: none;
                    border: none;
                    color: #00d4ff;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .settings-close:hover {
                    background: rgba(0, 212, 255, 0.1);
                    color: #ff6b6b;
                }

                .settings-warning {
                    background: rgba(255, 100, 100, 0.1);
                    border-left: 3px solid #ff6464;
                    padding: 12px;
                    margin-bottom: 16px;
                    border-radius: 4px;
                    color: #ffaa99;
                }

                .settings-warning strong {
                    color: #ff8888;
                }

                .settings-warning ul {
                    margin: 8px 0 0 0;
                    padding-left: 20px;
                }

                .settings-warning li {
                    margin: 4px 0;
                    font-size: 12px;
                }

                .settings-group {
                    margin-bottom: 20px;
                }

                .settings-group h3 {
                    color: #00d4ff;
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .controls-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }

                .control-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .control-item label {
                    color: #aaa;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .control-button {
                    background: rgba(15, 52, 96, 0.8);
                    border: 2px solid #0f3460;
                    color: #00d4ff;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                }

                .control-button:hover {
                    background: rgba(15, 52, 96, 1);
                    border-color: #00d4ff;
                    box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
                }

                .control-button.listening {
                    background: rgba(0, 212, 255, 0.2);
                    border-color: #00d4ff;
                    box-shadow: 0 0 12px rgba(0, 212, 255, 0.5), inset 0 0 8px rgba(0, 212, 255, 0.2);
                    animation: pulse 0.6s ease-in-out infinite;
                }

                .control-button.conflict {
                    border-color: #ff6464;
                    color: #ff8888;
                }

                @keyframes pulse {
                    0%,
                    100% {
                        box-shadow: 0 0 12px rgba(0, 212, 255, 0.5), inset 0 0 8px rgba(0, 212, 255, 0.2);
                    }
                    50% {
                        box-shadow: 0 0 24px rgba(0, 212, 255, 0.8), inset 0 0 12px rgba(0, 212, 255, 0.4);
                    }
                }

                .settings-footer {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                    padding-top: 12px;
                    border-top: 2px solid #0f3460;
                }

                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    color: #000;
                    border: 2px solid #00d4ff;
                }

                .btn-primary:hover {
                    box-shadow: 0 0 12px rgba(0, 212, 255, 0.5);
                    transform: translateY(-2px);
                }

                .btn-secondary {
                    background: transparent;
                    color: #aaa;
                    border: 2px solid #aaa;
                }

                .btn-secondary:hover {
                    color: #00d4ff;
                    border-color: #00d4ff;
                    box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
                }

                @media (max-width: 600px) {
                    .settings-container {
                        margin: 20px;
                        max-width: 100%;
                    }

                    .controls-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default SettingsPanel;
