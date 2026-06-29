import type { Room } from '../types';

/**
 * Draw decorative elements based on room theme and type for isometric view
 */
export function drawRoomDecorations(
    ctx: CanvasRenderingContext2D,
    room: Room,
    centerX: number,
    floorY: number,
    roomScreenW: number,
    roomDepthOffset: number,
    skin: { wall: string; floor: string; accent: string; shadow: string }
): void {
    // Draw theme-specific atmosphere
    drawThemeAtmosphere(ctx, room, centerX, floorY, roomScreenW, skin);

    // Draw main decorations
    const decorCount = room.variant + 2;
    const startX = centerX - roomScreenW / 2 + 60;
    const spacing = (roomScreenW - 120) / (decorCount + 1);

    for (let i = 0; i < decorCount; i++) {
        const x = startX + spacing * (i + 1);
        const baseY = floorY - 66;

        drawThemeDecoration(ctx, x, baseY, room, skin, i);
    }
}

/**
 * Draw atmosphere based on room theme
 */
function drawThemeAtmosphere(
    ctx: CanvasRenderingContext2D,
    room: Room,
    centerX: number,
    floorY: number,
    roomScreenW: number,
    skin: { wall: string; floor: string; accent: string; shadow: string }
): void {
    switch (room.theme) {
        case 'sterile':
            // Clean clinical lighting with slight blue tint
            const sterileGrad = ctx.createLinearGradient(centerX - roomScreenW / 2, 0, centerX + roomScreenW / 2, 0);
            sterileGrad.addColorStop(0, 'rgba(126,199,216,0.05)');
            sterileGrad.addColorStop(0.5, 'rgba(126,199,216,0.1)');
            sterileGrad.addColorStop(1, 'rgba(126,199,216,0.05)');
            ctx.fillStyle = sterileGrad;
            ctx.fillRect(centerX - roomScreenW / 2, 140, roomScreenW, 200);

            // Subtle grid on walls
            ctx.strokeStyle = 'rgba(126,199,216,0.08)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(centerX - roomScreenW / 2 + i * roomScreenW / 3, 140);
                ctx.lineTo(centerX - roomScreenW / 2 + i * roomScreenW / 3, 420);
                ctx.stroke();
            }
            break;

        case 'industrial':
            // Dark metal with warm highlights
            ctx.fillStyle = 'rgba(80,40,20,0.15)';
            ctx.fillRect(centerX - roomScreenW / 2, 140, roomScreenW, 200);

            // Rust streaks
            for (let i = 0; i < 3; i++) {
                ctx.strokeStyle = `rgba(200,100,50,${0.1 + i * 0.05})`;
                ctx.lineWidth = 2 + i;
                ctx.beginPath();
                ctx.moveTo(centerX - roomScreenW / 2 + 40 + i * 100, 140);
                ctx.lineTo(centerX - roomScreenW / 2 + 30 + i * 100, 400);
                ctx.stroke();
            }
            break;

        case 'luxury':
            // Golden shimmer with elegant tones
            const luxGrad = ctx.createLinearGradient(centerX, 140, centerX, 420);
            luxGrad.addColorStop(0, 'rgba(225,207,141,0.08)');
            luxGrad.addColorStop(0.5, 'rgba(225,207,141,0.12)');
            luxGrad.addColorStop(1, 'rgba(225,207,141,0.06)');
            ctx.fillStyle = luxGrad;
            ctx.fillRect(centerX - roomScreenW / 2, 140, roomScreenW, 280);

            // Subtle spotlight effect
            const spotGrad = ctx.createRadialGradient(centerX, 250, 50, centerX, 250, 300);
            spotGrad.addColorStop(0, 'rgba(255,255,200,0.05)');
            spotGrad.addColorStop(1, 'rgba(255,255,200,0)');
            ctx.fillStyle = spotGrad;
            ctx.fillRect(centerX - roomScreenW / 2, 140, roomScreenW, 280);
            break;

        case 'archive':
            // Dim, study-like atmosphere with aged tones
            ctx.fillStyle = 'rgba(164,193,137,0.06)';
            ctx.fillRect(centerX - roomScreenW / 2, 140, roomScreenW, 200);

            // Paper texture overlay
            for (let i = 0; i < 5; i++) {
                ctx.strokeStyle = `rgba(200,200,180,${0.02 + i * 0.01})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(centerX - roomScreenW / 2, 140 + i * 50);
                ctx.lineTo(centerX + roomScreenW / 2, 140 + i * 50);
                ctx.stroke();
            }
            break;

        case 'danger':
            // Red warning glow with hazard feel
            const dangerGrad = ctx.createLinearGradient(centerX - roomScreenW / 2, 140, centerX + roomScreenW / 2, 140);
            dangerGrad.addColorStop(0, 'rgba(224,116,116,0.08)');
            dangerGrad.addColorStop(0.5, 'rgba(224,116,116,0.12)');
            dangerGrad.addColorStop(1, 'rgba(224,116,116,0.08)');
            ctx.fillStyle = dangerGrad;
            ctx.fillRect(centerX - roomScreenW / 2, 140, roomScreenW, 200);

            // Pulsing warning stripes
            const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400);
            ctx.strokeStyle = `rgba(224,116,116,${0.05 + pulse * 0.08})`;
            ctx.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.moveTo(centerX - roomScreenW / 2, 150 + i * 30);
                ctx.lineTo(centerX + roomScreenW / 2, 150 + i * 30);
                ctx.stroke();
            }
            break;
    }
}

/**
 * Draw theme-specific decoration
 */
function drawThemeDecoration(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    room: Room,
    skin: { wall: string; floor: string; accent: string; shadow: string },
    index: number
): void {
    switch (room.theme) {
        case 'sterile':
            drawSterileDevice(ctx, x, y, index);
            break;
        case 'industrial':
            drawIndustrialMachine(ctx, x, y, index);
            break;
        case 'luxury':
            drawLuxuryDisplay(ctx, x, y, index);
            break;
        case 'archive':
            drawArchiveShelf(ctx, x, y, index);
            break;
        case 'danger':
            drawHazardStation(ctx, x, y, index);
            break;
    }
}

/**
 * Sterile theme - medical/lab equipment
 */
function drawSterileDevice(ctx: CanvasRenderingContext2D, x: number, y: number, index: number): void {
    // Device stand
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 2, y + 20, 4, 15);

    // Main device pod
    ctx.fillStyle = '#e0f7ff';
    ctx.beginPath();
    ctx.ellipse(x, y, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Device frame
    ctx.strokeStyle = '#7ec7d8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, 12, 16, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Status indicator
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400 + index);
    ctx.fillStyle = `rgba(126,199,216,${pulse})`;
    ctx.fillRect(x + 8, y - 10, 3, 3);

    // Screen
    ctx.fillStyle = '#0a5a6f';
    ctx.fillRect(x - 8, y - 5, 16, 8);
    ctx.strokeStyle = '#7ec7d8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 8, y - 5, 16, 8);
}

/**
 * Industrial theme - machinery and metal
 */
function drawIndustrialMachine(ctx: CanvasRenderingContext2D, x: number, y: number, index: number): void {
    // Main body
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x - 14, y - 12, 28, 24);

    // Metal frame highlight
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 14, y - 12, 28, 24);

    // Rotating part
    const rotation = Date.now() / 1000 + index;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = '#5a4830';
    ctx.fillRect(-4, -8, 8, 16);
    ctx.restore();

    // Bolts
    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(-12 + i * 8 + x, -10 + y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pressure gauge
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 8, y + 10, 4, 0, Math.PI * 2);
    ctx.stroke();

    const gaugeVal = 0.5 + 0.3 * Math.sin(Date.now() / 500 + index);
    ctx.strokeStyle = '#ff6432';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 8, y + 10, 4, Math.PI * 1.5, Math.PI * 1.5 + Math.PI * gaugeVal, false);
    ctx.stroke();
}

/**
 * Luxury theme - display cases and artwork
 */
function drawLuxuryDisplay(ctx: CanvasRenderingContext2D, x: number, y: number, index: number): void {
    // Display case base
    ctx.fillStyle = '#4a4632';
    ctx.fillRect(x - 16, y + 12, 32, 12);

    // Glass case
    ctx.fillStyle = 'rgba(200,200,200,0.15)';
    ctx.beginPath();
    ctx.moveTo(x - 16, y + 12);
    ctx.lineTo(x - 12, y - 20);
    ctx.lineTo(x + 12, y - 20);
    ctx.lineTo(x + 16, y + 12);
    ctx.closePath();
    ctx.fill();

    // Glass reflection
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 18);
    ctx.lineTo(x - 10, y - 12);
    ctx.stroke();

    // Display item (alternating)
    if (index % 2 === 0) {
        // Crown
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 8);
        ctx.lineTo(x - 2, y - 14);
        ctx.lineTo(x, y - 12);
        ctx.lineTo(x + 2, y - 14);
        ctx.lineTo(x + 4, y - 8);
        ctx.closePath();
        ctx.fill();
    } else {
        // Vase
        ctx.fillStyle = '#daa520';
        ctx.beginPath();
        ctx.ellipse(x, y - 10, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e1cf8d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x, y - 10, 5, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Light
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400 + index);
    ctx.fillStyle = `rgba(255,255,200,${pulse * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y - 22, 12, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Archive theme - shelves with documents
 */
function drawArchiveShelf(ctx: CanvasRenderingContext2D, x: number, y: number, index: number): void {
    // Shelf structure
    ctx.fillStyle = '#6b5738';
    ctx.fillRect(x - 14, y, 28, 3);
    ctx.fillRect(x - 14, y + 8, 28, 3);
    ctx.fillRect(x - 14, y + 16, 28, 3);

    // Supports
    ctx.fillStyle = '#5a4830';
    ctx.fillRect(x - 15, y, 2, 20);
    ctx.fillRect(x + 13, y, 2, 20);

    // Books/documents on shelves
    const colors = ['#8b0000', '#006400', '#000080', '#8b4513'];
    for (let shelf = 0; shelf < 3; shelf++) {
        for (let i = 0; i < 3; i++) {
            const bookX = x - 10 + i * 7;
            const bookY = y + shelf * 8 + 4;
            ctx.fillStyle = colors[(shelf + i) % colors.length];
            ctx.fillRect(bookX, bookY - 3, 5, 4);
            ctx.strokeStyle = '#a4c189';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(bookX, bookY - 3, 5, 4);
        }
    }

    // Label
    ctx.fillStyle = '#a4c189';
    ctx.font = '6px monospace';
    ctx.fillText('DOC', x - 8, y + 24);
}

/**
 * Danger theme - hazard stations
 */
function drawHazardStation(ctx: CanvasRenderingContext2D, x: number, y: number, index: number): void {
    // Warning light
    const pulse = 0.4 + 0.6 * Math.sin(Date.now() / 300 + index);
    ctx.fillStyle = `rgba(224,116,116,${pulse})`;
    ctx.beginPath();
    ctx.arc(x, y - 15, 6, 0, Math.PI * 2);
    ctx.fill();

    // Light glow
    ctx.fillStyle = `rgba(224,116,116,${pulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y - 15, 10, 0, Math.PI * 2);
    ctx.fill();

    // Mounting bracket
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 2, y - 9, 4, 10);
    ctx.fillRect(x - 8, y, 16, 4);

    // Radiation symbol
    ctx.strokeStyle = '#ff6432';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y + 2, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Radiation lines
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + 2);
        ctx.lineTo(x + Math.cos((i / 3) * Math.PI * 2) * 5, y + 2 + Math.sin((i / 3) * Math.PI * 2) * 5);
        ctx.stroke();
    }

    // Status panel
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(x - 6, y + 12, 12, 6);
    ctx.strokeStyle = '#ff6432';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 6, y + 12, 12, 6);

    // LED indicators
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x - 4, y + 14, 2, 2);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x - 1, y + 14, 2, 2);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x + 2, y + 14, 2, 2);
}

function drawVaultContainer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    skin: { wall: string; floor: string; accent: string; shadow: string },
    index: number
): void {
    const containerW = 30;
    const containerH = 50;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x - containerW / 2 + 4, y + 20, containerW, 8);

    // Container body
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x - containerW / 2, y, containerW, containerH);

    // Metal frame
    ctx.strokeStyle = skin.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - containerW / 2, y, containerW, containerH);

    // Lock detail
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x, y + containerH / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Glint
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - containerW / 2 + 4, y + 6);
    ctx.lineTo(x - containerW / 2 + 8, y + 10);
    ctx.stroke();
}

function drawHazardMarker(ctx: CanvasRenderingContext2D, x: number, y: number, index: number): void {
    const pulse = 0.4 + 0.6 * Math.sin(Date.now() / 500 + index);

    // Warning triangle
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x + 15, y + 10);
    ctx.lineTo(x - 15, y + 10);
    ctx.closePath();
    ctx.fillStyle = `rgba(255,100,50,${pulse * 0.6})`;
    ctx.fill();

    ctx.strokeStyle = '#ff6432';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hazard symbol
    ctx.fillStyle = 'rgba(255,200,0,0.8)';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠', x, y + 5);
}

function drawStorageShelf(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    skin: { wall: string; floor: string; accent: string; shadow: string },
    index: number
): void {
    const shelfW = 28;
    const shelfH = 45;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x - shelfW / 2 + 3, y + 15, shelfW, 6);

    // Frame
    ctx.strokeStyle = skin.accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - shelfW / 2, y, shelfW, shelfH);

    // Shelves (3 levels)
    for (let level = 0; level < 3; level++) {
        const levelY = y + 12 + level * 15;
        ctx.fillStyle = skin.accent;
        ctx.fillRect(x - shelfW / 2 + 2, levelY, shelfW - 4, 2);

        // Items on shelf
        for (let item = 0; item < 2; item++) {
            ctx.fillStyle = `hsl(${40 + index * 20},${70 - level * 5}%,${50 + level * 10}%)`;
            ctx.fillRect(x - shelfW / 2 + 5 + item * 10, levelY - 6, 7, 8);
        }
    }
}

function drawHallPillar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    skin: { wall: string; floor: string; accent: string; shadow: string },
    index: number
): void {
    const pillarW = 14;
    const pillarH = 60;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - pillarW / 2 + 2, y + 25, pillarW, 8);

    // Pillar body
    ctx.fillStyle = skin.accent;
    ctx.fillRect(x - pillarW / 2, y - 20, pillarW, pillarH);

    // Pillar shading
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x - pillarW / 2 + pillarW / 2, y - 20, pillarW / 2, pillarH);

    // Capital detail
    ctx.fillStyle = skin.wall;
    ctx.fillRect(x - pillarW / 2 - 3, y - 25, pillarW + 6, 5);
}

function drawGenericDecor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    skin: { wall: string; floor: string; accent: string; shadow: string },
    index: number
): void {
    const decorW = 20;
    const decorH = 35;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x - decorW / 2 + 2, y + 15, decorW, 5);

    ctx.fillStyle = skin.accent;
    ctx.fillRect(x - decorW / 2, y, decorW, decorH);

    ctx.strokeStyle = skin.wall;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - decorW / 2, y, decorW, decorH);

    // Pattern
    for (let i = 0; i < 2; i++) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x - decorW / 2 + 4, y + 8 + i * 12, decorW - 8, 2);
    }
}

function drawVaultWallDetails(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    floorY: number,
    roomScreenW: number,
    skin: { wall: string; floor: string; accent: string; shadow: string }
): void {
    // Security panels on walls
    const panelY = floorY - 200;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(centerX - roomScreenW / 2 + 10, panelY, 25, 20);
    ctx.fillRect(centerX + roomScreenW / 2 - 35, panelY, 25, 20);

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(centerX - roomScreenW / 2 + 12, panelY + 2, 4, 4);
    ctx.fillRect(centerX - roomScreenW / 2 + 12, panelY + 8, 4, 4);
    ctx.fillRect(centerX - roomScreenW / 2 + 18, panelY + 2, 4, 4);
}

function drawHazardWallDetails(ctx: CanvasRenderingContext2D, centerX: number, floorY: number, roomScreenW: number): void {
    // Pulsing hazard strips on walls
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400);
    const stripY = floorY - 150;

    ctx.fillStyle = `rgba(255,100,50,${pulse * 0.4})`;
    ctx.fillRect(centerX - roomScreenW / 2, stripY, 8, 80);
    ctx.fillRect(centerX + roomScreenW / 2 - 8, stripY, 8, 80);

    // Diagonal stripe pattern
    ctx.strokeStyle = 'rgba(255,100,50,0.8)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX - roomScreenW / 2 + 4, stripY + i * 18);
        ctx.lineTo(centerX - roomScreenW / 2 + 4, stripY + i * 18 + 12);
        ctx.stroke();
    }
}
