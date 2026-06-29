import type { LootCategory } from '../types';

/**
 * Renders different loot items with unique visuals based on their category
 */

export function drawLoot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    category: LootCategory,
    damage: number,
    scale: number = 1.0
): void {
    const scaledSize = size * scale;
    const scaledX = x;
    const scaledY = y;

    // Add damage visual (cracks, wear)
    const damageAlpha = (damage / 100) * 0.4;

    switch (category) {
        case 'painting':
            drawPainting(ctx, scaledX, scaledY, scaledSize, damageAlpha);
            break;
        case 'jewelry':
            drawJewelry(ctx, scaledX, scaledY, scaledSize, damageAlpha);
            break;
        case 'electronics':
            drawElectronics(ctx, scaledX, scaledY, scaledSize, damageAlpha);
            break;
        case 'sculpture':
            drawSculpture(ctx, scaledX, scaledY, scaledSize, damageAlpha);
            break;
        case 'document':
            drawDocument(ctx, scaledX, scaledY, scaledSize, damageAlpha);
            break;
        case 'furniture':
            drawFurniture(ctx, scaledX, scaledY, scaledSize, damageAlpha);
            break;
        case 'oddity':
            drawOddity(ctx, scaledX, scaledY, scaledSize, damageAlpha);
            break;
        default:
            drawUnknown(ctx, scaledX, scaledY, scaledSize, damageAlpha);
    }
}

/**
 * Draw a painting - ornate frame with artwork
 */
function drawPainting(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    damageAlpha: number
): void {
    const w = size * 0.8;
    const h = size * 1.1;

    // Frame shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x - w / 2 + 1, y - h / 2 + 1, w, h);

    // Ornate frame
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x - w / 2, y - h / 2, w, h);

    // Frame border detail
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(x - w / 2 + 2, y - h / 2 + 2, w - 4, 2);
    ctx.fillRect(x - w / 2 + 2, y + h / 2 - 4, w - 4, 2);
    ctx.fillRect(x - w / 2 + 2, y - h / 2 + 2, 2, h - 4);
    ctx.fillRect(x + w / 2 - 4, y - h / 2 + 2, 2, h - 4);

    // Canvas
    ctx.fillStyle = '#f5e6d3';
    ctx.fillRect(x - w / 2 + 4, y - h / 2 + 4, w - 8, h - 8);

    // Artwork (simple abstract)
    const colors = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71'];
    const colorIdx = Math.floor((x + y) % 4);
    ctx.fillStyle = colors[colorIdx];
    ctx.beginPath();
    ctx.arc(x - w / 6, y - h / 8, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9b59b6';
    ctx.beginPath();
    ctx.arc(x + w / 6, y + h / 8, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Damage cracks
    if (damageAlpha > 0) {
        ctx.strokeStyle = `rgba(139, 69, 19, ${damageAlpha})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 2; i++) {
            const angle = (i * Math.PI) / 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * w / 3, y + Math.sin(angle) * h / 3);
            ctx.stroke();
        }
    }

    // Signature
    ctx.fillStyle = '#555';
    ctx.font = '8px serif';
    ctx.fillText('Art', x - 8, y + h / 2 - 4);
}

/**
 * Draw jewelry - sparkly gem/necklace
 */
function drawJewelry(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    damageAlpha: number
): void {
    // Necklace chain
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - size / 3, y - size / 4, size / 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size / 3, y - size / 4, size / 6, 0, Math.PI * 2);
    ctx.stroke();

    // Gem center
    ctx.fillStyle = '#ff1493';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Gem shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - size * 0.1, y - size * 0.1, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Facets
    ctx.strokeStyle = '#ffb6c1';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * size * 0.35, y + Math.sin(angle) * size * 0.35);
        ctx.stroke();
    }

    // Damage scratches
    if (damageAlpha > 0) {
        ctx.strokeStyle = `rgba(100, 100, 100, ${damageAlpha * 0.5})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle) * size * 0.25, y + Math.sin(angle) * size * 0.25);
            ctx.lineTo(x + Math.cos(angle + 0.3) * size * 0.2, y + Math.sin(angle + 0.3) * size * 0.2);
            ctx.stroke();
        }
    }
}

/**
 * Draw electronics - phone/tablet/gadget
 */
function drawElectronics(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    damageAlpha: number
): void {
    const w = size * 0.6;
    const h = size * 0.9;

    // Device body
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - w / 2, y - h / 2, w, h);

    // Screen
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x - w / 2 + 2, y - h / 2 + 2, w - 4, h - 6);

    // Screen glow
    ctx.fillStyle = '#00ff00';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 8);
    ctx.globalAlpha = 1.0;

    // Screen pattern
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x - w / 2 + 4, y - h / 2 + 6 + i * 6);
        ctx.lineTo(x + w / 2 - 4, y - h / 2 + 6 + i * 6);
        ctx.stroke();
    }

    // Button
    ctx.fillStyle = '#444';
    ctx.fillRect(x - w / 2 - 2, y, 3, 4);

    // Damage - cracked screen
    if (damageAlpha > 0) {
        ctx.strokeStyle = `rgba(255, 0, 0, ${damageAlpha * 0.8})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - w / 2 + 4, y - h / 2 + 4);
        ctx.lineTo(x + w / 2 - 4, y + h / 2 - 3);
        ctx.stroke();
    }
}

/**
 * Draw sculpture - abstract statue
 */
function drawSculpture(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    damageAlpha: number
): void {
    // Base
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x - size * 0.25, y + size * 0.2, size * 0.5, size * 0.15);

    // Main body
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.25, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#c9945f';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.35, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x - size * 0.08, y - size * 0.45, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Damage - chips
    if (damageAlpha > 0) {
        ctx.fillStyle = `rgba(139, 69, 19, ${damageAlpha})`;
        for (let i = 0; i < 2; i++) {
            const chipX = x + (Math.random() - 0.5) * size * 0.3;
            const chipY = y + (Math.random() - 0.5) * size * 0.4;
            ctx.fillRect(chipX, chipY, size * 0.08, size * 0.08);
        }
    }
}

/**
 * Draw document - rolled scroll or papers
 */
function drawDocument(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    damageAlpha: number
): void {
    // Roll
    ctx.fillStyle = '#f5e6d3';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.2, y, size * 0.1, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e6d4b8';
    ctx.fillRect(x - size * 0.1, y - size * 0.25, size * 0.4, size * 0.5);

    // Paper lines
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x - size * 0.08, y - size * 0.2 + i * size * 0.1);
        ctx.lineTo(x + size * 0.3, y - size * 0.2 + i * size * 0.1);
        ctx.stroke();
    }

    // Seal
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(x + size * 0.15, y - size * 0.15, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★', x + size * 0.15, y - size * 0.1);

    // Damage - stains/tears
    if (damageAlpha > 0) {
        ctx.fillStyle = `rgba(100, 100, 100, ${damageAlpha * 0.3})`;
        ctx.fillRect(x - size * 0.05, y, size * 0.15, size * 0.1);
    }
}

/**
 * Draw furniture - small chair/desk piece
 */
function drawFurniture(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    damageAlpha: number
): void {
    // Wood color
    const woodColor = '#8b6f47';

    // Seat
    ctx.fillStyle = woodColor;
    ctx.fillRect(x - size * 0.25, y - size * 0.1, size * 0.5, size * 0.15);

    // Backrest
    ctx.fillStyle = '#6b5738';
    ctx.fillRect(x - size * 0.23, y - size * 0.3, size * 0.46, size * 0.25);

    // Left leg
    ctx.strokeStyle = '#5a4830';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, y + size * 0.05);
    ctx.lineTo(x - size * 0.2, y + size * 0.3);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(x + size * 0.2, y + size * 0.05);
    ctx.lineTo(x + size * 0.2, y + size * 0.3);
    ctx.stroke();

    // Wood grain
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x - size * 0.25, y - size * 0.1 + i * size * 0.08);
        ctx.lineTo(x + size * 0.25, y - size * 0.1 + i * size * 0.08);
        ctx.stroke();
    }

    // Damage - cracks
    if (damageAlpha > 0) {
        ctx.strokeStyle = `rgba(0, 0, 0, ${damageAlpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.2);
        ctx.lineTo(x + size * 0.15, y);
        ctx.stroke();
    }
}

/**
 * Draw oddity - mysterious/weird item
 */
function drawOddity(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    damageAlpha: number
): void {
    // Pulsing aura
    const now = Date.now();
    const pulse = 0.5 + 0.5 * Math.sin(now / 500);
    ctx.fillStyle = `rgba(200, 100, 255, ${pulse * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Main body - abstract shape
    ctx.fillStyle = '#9b59b6';
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.3);
    ctx.lineTo(x + size * 0.25, y + size * 0.1);
    ctx.lineTo(x + size * 0.1, y + size * 0.25);
    ctx.lineTo(x - size * 0.1, y + size * 0.25);
    ctx.lineTo(x - size * 0.25, y + size * 0.1);
    ctx.closePath();
    ctx.fill();

    // Crystalline detail
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * size * 0.25, y + Math.sin(angle) * size * 0.25);
        ctx.stroke();
    }

    // Eye of mystery
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.1, size * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Damage - interference
    if (damageAlpha > 0) {
        ctx.strokeStyle = `rgba(255, 0, 255, ${damageAlpha * 0.4})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(x + Math.cos(angle) * size * 0.15, y + Math.sin(angle) * size * 0.15, size * 0.05, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

/**
 * Draw unknown item - generic treasure
 */
function drawUnknown(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    damageAlpha: number
): void {
    // Box
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x - size * 0.3, y - size * 0.3, size * 0.6, size * 0.6);

    // Highlight
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(x - size * 0.28, y - size * 0.28, size * 0.56, size * 0.12);

    // Contents glow
    ctx.fillStyle = '#ffd700';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Question mark
    ctx.fillStyle = '#d4a574';
    ctx.font = 'bold ' + Math.floor(size * 0.3) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x, y + size * 0.05);

    // Damage - dents
    if (damageAlpha > 0) {
        ctx.strokeStyle = `rgba(0, 0, 0, ${damageAlpha * 0.4})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 2; i++) {
            const px = x + (Math.random() - 0.5) * size * 0.4;
            const py = y + (Math.random() - 0.5) * size * 0.4;
            ctx.beginPath();
            ctx.arc(px, py, size * 0.08, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}
