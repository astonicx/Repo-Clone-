import React, { useState } from 'react';
import type { Facility } from '../types';
import { FACILITY_TYPES } from '../utils/constants';

interface MainMenuProps {
    onStart: (facilityType: Facility['type']) => void;
}

const FACILITY_LABELS: Record<Facility['type'], string> = {
    museum: 'Museum — fragile high-value art',
    laboratory: 'Laboratory — volatile electronics',
    academy: 'Academy — rare documents & oddities',
    residential: 'Residential — mixed valuables',
};

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
    const [facility, setFacility] = useState<Facility['type']>('museum');

    return (
        <div className="repo-menu">
            <div className="scanlines" />
            <div className="repo-menu-content">
                <div className="loading-title glitch" data-text="R.E.P.O.">
                    R.E.P.O.
                </div>
                <div className="loading-subtitle">Retrieval Extraction Protocol Operations</div>

                <div className="repo-menu-card">
                    <h2>Select Facility</h2>
                    <div className="repo-facility-list">
                        {FACILITY_TYPES.map((type) => (
                            <button
                                key={type}
                                className={`repo-facility ${facility === type ? 'active' : ''}`}
                                onClick={() => setFacility(type)}
                            >
                                <span className="repo-facility-type">{type.toUpperCase()}</span>
                                <span className="repo-facility-desc">{FACILITY_LABELS[type]}</span>
                            </button>
                        ))}
                    </div>

                    <button className="repo-start" onClick={() => onStart(facility)}>
                        DEPLOY ▸
                    </button>

                    <div className="repo-controls">
                        <span>WASD move</span>
                        <span>Shift sprint</span>
                        <span>Ctrl crouch</span>
                        <span>E grab / extract</span>
                        <span>Esc pause</span>
                    </div>
                </div>

                <div className="loading-version">v1.0.0 - Early Access</div>
            </div>
        </div>
    );
};

export default MainMenu;
