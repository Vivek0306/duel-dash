import { STATE } from './globals.js';

export class Powerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        const pulseTime = Date.now() / 200;
        const pulseSize = Math.sin(pulseTime) * 5 + 10;

        ctx.beginPath();
        ctx.arc(this.x, this.y, STATE.powerupRadius + pulseSize, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            this.x, this.y, STATE.powerupRadius,
            this.x, this.y, STATE.powerupRadius + pulseSize
        );
        gradient.addColorStop(0, '#ff9100' + '80');
        gradient.addColorStop(1, '#ff9100' + '00');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, STATE.powerupRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#e72503ff';
        ctx.fill();
        ctx.strokeStyle = '#ff9100ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
}