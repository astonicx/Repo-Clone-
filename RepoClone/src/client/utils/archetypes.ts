/**
 * Character archetype system for players and enemies.
 */

export type PlayerArchetype = 'infiltrator' | 'hacker' | 'enforcer' | 'courier';
export type MonsterVariant = 'patrol' | 'guard' | 'wraith' | 'heavy';

export interface ArchetypeStats {
    healthMult: number;
    speedMult: number;
    staminaMult: number;
    noise: number;
    color: string;
    icon: string;
    personality: 'calm' | 'alert' | 'aggressive' | 'focused';
}

export const PLAYER_ARCHETYPES: Record<PlayerArchetype, ArchetypeStats> = {
    infiltrator: {
        healthMult: 0.9,
        speedMult: 1.1,
        staminaMult: 1.15,
        noise: -15,
        color: '#51d8e8',
        icon: '🕵',
        personality: 'calm',
    },
    hacker: {
        healthMult: 0.75,
        speedMult: 0.95,
        staminaMult: 1.2,
        noise: -20,
        color: '#7fe784',
        icon: '💻',
        personality: 'focused',
    },
    enforcer: {
        healthMult: 1.3,
        speedMult: 0.85,
        staminaMult: 1.0,
        noise: 15,
        color: '#ff6b9d',
        icon: '💪',
        personality: 'aggressive',
    },
    courier: {
        healthMult: 1.0,
        speedMult: 1.05,
        staminaMult: 1.1,
        noise: 0,
        color: '#ffc857',
        icon: '📦',
        personality: 'alert',
    },
};

export const MONSTER_VARIANTS: Record<MonsterVariant, ArchetypeStats> = {
    patrol: {
        healthMult: 1.0,
        speedMult: 1.0,
        staminaMult: 1.0,
        noise: 0,
        color: '#a88659',
        icon: '🚶',
        personality: 'calm',
    },
    guard: {
        healthMult: 1.4,
        speedMult: 0.8,
        staminaMult: 0.9,
        noise: 0,
        color: '#d97c4a',
        icon: '🛡',
        personality: 'alert',
    },
    wraith: {
        healthMult: 0.7,
        speedMult: 1.3,
        staminaMult: 1.2,
        noise: 0,
        color: '#8b7bb8',
        icon: '👻',
        personality: 'aggressive',
    },
    heavy: {
        healthMult: 2.0,
        speedMult: 0.6,
        staminaMult: 0.7,
        noise: 0,
        color: '#5a4a3a',
        icon: '🤖',
        personality: 'calm',
    },
};

/**
 * Get player archetype by index (for cycle through types).
 */
export function getPlayerArchetypeByIndex(index: number): PlayerArchetype {
    const types: PlayerArchetype[] = ['infiltrator', 'hacker', 'enforcer', 'courier'];
    return types[index % types.length];
}

/**
 * Get monster variant by tier (1-3).
 */
export function getMonsterVariantByTier(tier: 1 | 2 | 3): MonsterVariant {
    if (tier === 1) return 'patrol';
    if (tier === 2) return 'guard';
    return 'wraith';
}

/**
 * Apply archetype stats to a character.
 */
export function applyArchetypeStats(
    character: any,
    stats: ArchetypeStats,
    baseHealth: number,
    baseSpeed: number,
    baseStamina: number
): void {
    character.maxHealth = baseHealth * stats.healthMult;
    character.health = character.maxHealth;
    character.moveSpeed = baseSpeed * stats.speedMult;
    character.maxStamina = baseStamina * stats.staminaMult;
    character.stamina = character.maxStamina;
}

/**
 * Draw a character sprite on canvas with personality expressions.
 */
export function drawCharacterSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    bodyW: number,
    bodyH: number,
    color: string,
    isDead: boolean,
    isMonster: boolean,
    animationPhase: number,
    personality: 'calm' | 'alert' | 'aggressive' | 'focused' = 'calm',
    state: 'idle' | 'alert' | 'hunt' | 'return' = 'idle'
): void {
    // Shadow under character
    ctx.beginPath();
    ctx.ellipse(x, y + bodyH * 0.45, bodyW * 0.8, bodyH * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();

    if (isDead) {
        // Dead character - laying down
        ctx.fillStyle = '#555';
        ctx.fillRect(x - bodyW * 0.45, y, bodyW * 0.9, bodyH * 0.4);
        ctx.fillRect(x - bodyW * 0.25, y + bodyH * 0.35, bodyW * 0.5, bodyH * 0.15);
        return;
    }

    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x - bodyW / 2, y - bodyH, bodyW, bodyH);

    // Body accent (armor plating)
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x - bodyW / 3, y - bodyH + 4, (bodyW * 2) / 3, 3);

    // Head
    const headW = (bodyW * 2) / 3;
    const headH = bodyH * 0.25;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x - headW / 2, y - bodyH - headH, headW, headH);

    // Monster-specific features
    if (isMonster) {
        drawMonsterExpression(ctx, x, y, bodyW, bodyH, animationPhase, state, personality);
    } else {
        drawPlayerExpression(ctx, x, y, bodyW, bodyH, animationPhase, personality, state);
    }

    // Animated bobbing/movement
    const bobOffset = Math.sin(animationPhase * 0.08) * 2;
    const strideOffset = Math.cos(animationPhase * 0.12) * 1.5;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    // Left leg
    ctx.beginPath();
    ctx.moveTo(x - bodyW / 3, y - bodyH * 0.3 + bobOffset);
    ctx.lineTo(x - bodyW / 3 - strideOffset, y + bobOffset);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(x + bodyW / 3, y - bodyH * 0.3 + bobOffset);
    ctx.lineTo(x + bodyW / 3 + strideOffset, y + bobOffset);
    ctx.stroke();
}

function drawMonsterExpression(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    bodyW: number,
    bodyH: number,
    animationPhase: number,
    state: string,
    personality: string
): void {
    if (state === 'hunt') {
        // Aggressive glare - angry eyes
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.arc(x - bodyW / 4, y - bodyH - bodyH * 0.15, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + bodyW / 4, y - bodyH - bodyH * 0.15, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Angry brow
        ctx.strokeStyle = '#ff5555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - bodyW / 4 - 3, y - bodyH - bodyH * 0.2);
        ctx.lineTo(x - bodyW / 4 + 2, y - bodyH - bodyH * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + bodyW / 4 + 3, y - bodyH - bodyH * 0.2);
        ctx.lineTo(x + bodyW / 4 - 2, y - bodyH - bodyH * 0.15);
        ctx.stroke();
    } else if (state === 'alert') {
        // Alert - wide eyes scanning
        const eyeGlow = 0.4 + Math.sin(animationPhase * 0.1) * 0.3;
        ctx.fillStyle = `rgba(255,180,50,${eyeGlow})`;
        ctx.beginPath();
        ctx.arc(x - bodyW / 4, y - bodyH - bodyH * 0.15, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + bodyW / 4, y - bodyH - bodyH * 0.15, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils moving
        const pupilOffset = Math.sin(animationPhase * 0.08) * 1;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - bodyW / 4 + pupilOffset, y - bodyH - bodyH * 0.15, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + bodyW / 4 + pupilOffset, y - bodyH - bodyH * 0.15, 1.5, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Calm - normal eyes
        const eyeGlow = 0.3 + Math.sin(animationPhase * 0.05) * 0.2;
        ctx.fillStyle = `rgba(255,100,100,${eyeGlow})`;
        ctx.beginPath();
        ctx.arc(x - bodyW / 4, y - bodyH - bodyH * 0.15, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + bodyW / 4, y - bodyH - bodyH * 0.15, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlayerExpression(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    bodyW: number,
    bodyH: number,
    animationPhase: number,
    personality: string,
    state: string
): void {
    const visorW = (bodyW * 2) / 3 - 2;
    const visorH = bodyH * 0.18;
    const visorX = x - visorW / 2;
    const visorY = y - bodyH - visorH - 1;

    if (state === 'hunt' || personality === 'aggressive') {
        // Combat visor - red glow
        ctx.fillStyle = 'rgba(255,80,80,0.5)';
        ctx.fillRect(visorX, visorY, visorW, visorH);
        ctx.strokeStyle = '#ff5555';
    } else if (personality === 'focused' || state === 'alert') {
        // Focus mode - green glow
        ctx.fillStyle = 'rgba(100,255,100,0.4)';
        ctx.fillRect(visorX, visorY, visorW, visorH);
        ctx.strokeStyle = '#7fe784';

        // Scanning lines
        const scanY = visorY + ((animationPhase % 3000) / 3000) * visorH;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(visorX + 2, scanY);
        ctx.lineTo(visorX + visorW - 2, scanY);
        ctx.stroke();
    } else {
        // Calm - blue glow
        ctx.fillStyle = 'rgba(100,200,255,0.4)';
        ctx.fillRect(visorX, visorY, visorW, visorH);
        ctx.strokeStyle = '#51d8e8';

        // Gentle pulse
        const pulse = 0.6 + Math.sin(animationPhase * 0.02) * 0.2;
        ctx.globalAlpha = pulse;
    }

    ctx.lineWidth = 1;
    ctx.strokeRect(visorX, visorY, visorW, visorH);
    ctx.globalAlpha = 1;
}
