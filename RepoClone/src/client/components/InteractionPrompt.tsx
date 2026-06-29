import React from 'react';

interface InteractionPromptProps {
    x: number;
    y: number;
    text: string;
    type: 'door' | 'extraction' | 'loot';
    visible: boolean;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({ x, y, text, type, visible }) => {
    if (!visible) return null;

    return (
        <div
            className="interaction-prompt"
            style={{
                left: `${x}px`,
                top: `${y}px`,
                animation: 'float 2s ease-in-out infinite',
            }}
        >
            <div className={`prompt-box prompt-${type}`}>
                <div className="prompt-icon">
                    {type === 'door' && '🚪'}
                    {type === 'extraction' && '📦'}
                    {type === 'loot' && '💎'}
                </div>
                <div className="prompt-text">{text}</div>
            </div>

            <style jsx>{`
                .interaction-prompt {
                    position: fixed;
                    transform: translate(-50%, -100%);
                    z-index: 100;
                    pointer-events: none;
                }

                .prompt-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 2px solid #00d4ff;
                    border-radius: 4px;
                    padding: 8px 12px;
                    box-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
                    backdrop-filter: blur(4px);
                    white-space: nowrap;
                }

                .prompt-door {
                    border-color: #4db3d3;
                    box-shadow: 0 0 12px rgba(77, 179, 211, 0.3);
                }

                .prompt-extraction {
                    border-color: #7ec789;
                    box-shadow: 0 0 12px rgba(126, 199, 137, 0.3);
                }

                .prompt-loot {
                    border-color: #ffd700;
                    box-shadow: 0 0 12px rgba(255, 215, 0, 0.3);
                }

                .prompt-icon {
                    font-size: 16px;
                }

                .prompt-text {
                    color: #e8f4f8;
                    font-size: 11px;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                @keyframes float {
                    0%,
                    100% {
                        transform: translate(-50%, -100%);
                    }
                    50% {
                        transform: translate(-50%, -110%);
                    }
                }
            `}</style>
        </div>
    );
};

export default InteractionPrompt;
