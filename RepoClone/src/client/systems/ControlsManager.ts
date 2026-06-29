/**
 * Manages customizable game controls and key bindings.
 * Persists settings to localStorage.
 */

export interface ControlScheme {
    moveForward: string;
    moveBack: string;
    moveLeft: string;
    moveRight: string;
    sprint: string;
    crouch: string;
    interact: string;
    grab: string;
    drop: string;
    throw: string;
    map: string;
    menu: string;
}

const DEFAULT_CONTROLS: ControlScheme = {
    moveForward: 'W',
    moveBack: 'S',
    moveLeft: 'A',
    moveRight: 'D',
    sprint: 'Shift',
    crouch: 'Control',
    interact: 'E',
    grab: 'E',
    drop: 'Q',
    throw: 'Q',
    map: 'Tab',
    menu: 'Escape',
};

const STORAGE_KEY = 'game_controls_v1';

export class ControlsManager {
    private controls: ControlScheme;
    private listeners: Set<(controls: ControlScheme) => void> = new Set();

    constructor() {
        this.controls = this.loadControls();
    }

    /**
     * Load controls from localStorage or use defaults
     */
    private loadControls(): ControlScheme {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored) as ControlScheme;
            }
        } catch (error) {
            console.error('Failed to load controls:', error);
        }
        return { ...DEFAULT_CONTROLS };
    }

    /**
     * Save controls to localStorage
     */
    private saveControls(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.controls));
        } catch (error) {
            console.error('Failed to save controls:', error);
        }
    }

    /**
     * Get current control scheme
     */
    getControls(): ControlScheme {
        return { ...this.controls };
    }

    /**
     * Get a specific control key
     */
    getControl(action: keyof ControlScheme): string {
        return this.controls[action];
    }

    /**
     * Update a single control
     */
    setControl(action: keyof ControlScheme, key: string): void {
        this.controls[action] = key.toUpperCase();
        this.saveControls();
        this.notifyListeners();
    }

    /**
     * Update multiple controls at once
     */
    setControls(updates: Partial<ControlScheme>): void {
        Object.keys(updates).forEach((key) => {
            const action = key as keyof ControlScheme;
            const value = updates[action];
            if (value) {
                this.controls[action] = value.toUpperCase();
            }
        });
        this.saveControls();
        this.notifyListeners();
    }

    /**
     * Reset to default controls
     */
    resetToDefaults(): void {
        this.controls = { ...DEFAULT_CONTROLS };
        this.saveControls();
        this.notifyListeners();
    }

    /**
     * Check if a key is pressed for a specific action
     */
    isActionPressed(action: keyof ControlScheme, pressedKeys: Set<string>): boolean {
        const key = this.controls[action].toUpperCase();
        return pressedKeys.has(key);
    }

    /**
     * Check which actions match a pressed key
     */
    getActionsForKey(key: string): (keyof ControlScheme)[] {
        const upperKey = key.toUpperCase();
        return (Object.keys(this.controls) as (keyof ControlScheme)[]).filter(
            (action) => this.controls[action].toUpperCase() === upperKey
        );
    }

    /**
     * Get all conflicting controls
     */
    findConflicts(): Array<{ action1: keyof ControlScheme; action2: keyof ControlScheme; key: string }> {
        const conflicts: Array<{ action1: keyof ControlScheme; action2: keyof ControlScheme; key: string }> = [];
        const actions = Object.keys(this.controls) as (keyof ControlScheme)[];

        for (let i = 0; i < actions.length; i++) {
            for (let j = i + 1; j < actions.length; j++) {
                if (this.controls[actions[i]].toUpperCase() === this.controls[actions[j]].toUpperCase()) {
                    conflicts.push({
                        action1: actions[i],
                        action2: actions[j],
                        key: this.controls[actions[i]],
                    });
                }
            }
        }

        return conflicts;
    }

    /**
     * Subscribe to control changes
     */
    onChange(callback: (controls: ControlScheme) => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Notify all listeners of changes
     */
    private notifyListeners(): void {
        const controlsCopy = this.getControls();
        this.listeners.forEach((listener) => listener(controlsCopy));
    }
}

// Global singleton
export const controlsManager = new ControlsManager();
