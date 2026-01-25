import { CONFIG } from './config.js';
import { STATE } from './globals.js';

export class Circle {
    constructor(x, y, vx, vy, color, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = STATE.circleRadius;
        this.color = color;
        this.powerup = null;
        this.particles = [];
        this.score = 0;
        this.isAlive = true;
        this.killedBy = null;
    }

    update(canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;

        // Wall collisions
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvasWidth) {
            this.vx = -this.vx;
            this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
        }

        if (this.y - this.radius <= 0 || this.y + this.radius >= canvasHeight) {
            this.vy = -this.vy;
            this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
        }

        if (this.powerup) {
            this.particles.push({
                x: this.x,
                y: this.y,
                life: 1.0
            });

            this.particles = this.particles.filter(p => {
                p.life -= 0.01;
                return p.life > 0;
            });
        } else {
            this.particles = [];
        }
    }

    draw(ctx) {
        if (this.powerup) {
            this.particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, this.radius * p.life, 0, Math.PI * 2);
                ctx.fillStyle = this.color + Math.floor(p.life * 100).toString(16).padStart(2, '0');
                ctx.fill();
            });
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.fillStyle = '#000000ff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.id, this.x, this.y);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }

    static checkCollision(c1, c2, circles, game) {
        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = c1.radius + c2.radius;

        if (distance < minDistance && distance > 0) {
            const angle = Math.atan2(dy, dx);

            c1.vx = -Math.cos(angle) * CONFIG.SPEED;
            c1.vy = -Math.sin(angle) * CONFIG.SPEED;
            c2.vx = Math.cos(angle) * CONFIG.SPEED;
            c2.vy = Math.sin(angle) * CONFIG.SPEED;

            const overlap = minDistance - distance;
            const separationDistance = (overlap / 2) + 2;

            const separationX = Math.cos(angle) * separationDistance;
            const separationY = Math.sin(angle) * separationDistance;

            c1.x -= separationX;
            c1.y -= separationY;
            c2.x += separationX;
            c2.y += separationY;

            // Handle kills
            if (c1.powerup && !c2.powerup) {
                c2.isAlive = false;
                c2.killedBy = c1.id;
                circles.splice(circles.indexOf(c2), 1);
                c1.powerup = null;
                c1.score += 1;
                game.updateScoreBoard();
            }
            else if (!c1.powerup && c2.powerup) {
                c1.isAlive = false;
                c1.killedBy = c2.id;
                circles.splice(circles.indexOf(c1), 1);
                c2.powerup = null;
                c2.score += 1;
                game.updateScoreBoard();
            }
            else if (c1.powerup && c2.powerup) {
                c1.powerup = null;
                c2.powerup = null;
            }
        }
    }

    static checkPowerupCollision(circle, powerup) {
        const dx = powerup.x - circle.x;
        const dy = powerup.y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = circle.radius + STATE.powerupRadius;

        if (distance < minDistance && distance > 0) {
            circle.powerup = true;
            return true;
        }
        return false;
    }
}