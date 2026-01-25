import { CONFIG } from './config.js';
import { STATE, DOM } from './globals.js';
import { Circle } from './Circle.js';
import { Powerup } from './Powerup.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.circles = [];
        this.allCircles = [];
        this.powerups = [];
        this.isPaused = true;
        this.animationId = null;

        this.powerupTimer = null;
        this.minSpawnInterval = CONFIG.POWERUP_SPAWN.MIN_INTERVAL;
        this.maxSpawnInterval = CONFIG.POWERUP_SPAWN.MAX_INTERVAL;

        this.winner = null;
        this.gameOver = false;
    }

    schedulePowerUpSpawn() {
        if (this.powerupTimer) {
            clearTimeout(this.powerupTimer);
        }

        if (this.isPaused || this.powerups.length >= CONFIG.MAX_POWERUPS || this.gameOver) {
            return;
        }

        const randomInterval = Math.random() * (this.maxSpawnInterval - this.minSpawnInterval) + this.minSpawnInterval;

        this.powerupTimer = setTimeout(() => {
            this.spawnPowerUp();
            this.schedulePowerUpSpawn();
        }, randomInterval);
    }

    stopPowerUpSpawn() {
        if (this.powerupTimer) {
            clearTimeout(this.powerupTimer);
            this.powerupTimer = null;
        }
    }

    spawnPowerUp() {
        if (this.powerups.length >= CONFIG.MAX_POWERUPS) return;
        const x = STATE.powerupRadius + Math.random() * (this.canvas.width - 2 * STATE.powerupRadius);
        const y = STATE.powerupRadius + Math.random() * (this.canvas.height - 2 * STATE.powerupRadius);

        const powerup = new Powerup(x, y);
        this.powerups.push(powerup);
        this.updateUI();
    }

    spawnCircle() {
        if (this.circles.length >= CONFIG.MAX_CIRCLES) return;

        const x = STATE.circleRadius + Math.random() * (this.canvas.width - 2 * STATE.circleRadius);
        const y = STATE.circleRadius + Math.random() * (this.canvas.height - 2 * STATE.circleRadius);

        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * CONFIG.SPEED;
        const vy = Math.sin(angle) * CONFIG.SPEED;

        const color = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];

        const id = this.allCircles.length + 1;

        const circle = new Circle(x, y, vx, vy, color, id);
        this.circles.push(circle);
        this.allCircles.push(circle);

        this.updateUI();
        this.updateScoreBoard();
    }

    checkWinner() {
        if (this.allCircles.length >= 2 && this.circles.length === 1) {
            this.winner = this.circles[0];
            this.gameOver = true;
            this.isPaused = true;
            this.stopPowerUpSpawn();
            console.log("Winner Circle:", this.winner);
        }
    }

    update() {
        if (this.gameOver) return;

        this.circles.forEach(circle => {
            circle.update(this.canvas.width, this.canvas.height);
        });

        for (let i = 0; i < this.circles.length; i++) {
            for (let j = i + 1; j < this.circles.length; j++) {
                Circle.checkCollision(this.circles[i], this.circles[j], this.circles, this);
            }
        }

        for (let i = this.circles.length - 1; i >= 0; i--) {
            for (let j = this.powerups.length - 1; j >= 0; j--) {
                if (Circle.checkPowerupCollision(this.circles[i], this.powerups[j])) {
                    this.powerups.splice(j, 1);
                }
            }
        }

        this.checkWinner();
        this.updateUI();
    }

    drawWinnerSplash() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        const splashConfig = STATE.isMobile ? CONFIG.SPLASH_SCREEN.MOBILE :
                            STATE.isTablet ? CONFIG.SPLASH_SCREEN.TABLET :
                            CONFIG.SPLASH_SCREEN.DESKTOP;

        const pulseTime = Date.now() / 300;
        const pulseScale = Math.sin(pulseTime) * 0.1 + 1;

        // Winner circle
        this.ctx.save();
        this.ctx.translate(centerX, centerY + STATE.circleOffsetY);
        this.ctx.scale(pulseScale, pulseScale);

        // Glow
        const glowRadius = STATE.circleRadius * splashConfig.GLOW_SIZE;
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        gradient.addColorStop(0, this.winner.color + 'ff');
        gradient.addColorStop(0.5, this.winner.color + '80');
        gradient.addColorStop(1, this.winner.color + '00');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Circle
        const winnerCircleRadius = STATE.circleRadius * splashConfig.CIRCLE_SIZE;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, winnerCircleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.winner.color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = STATE.isMobile ? 2 : STATE.isTablet ? 3 : 4;
        this.ctx.stroke();

        // ID
        this.ctx.fillStyle = '#000';
        this.ctx.font = `bold ${STATE.circleIdFontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.winner.id, 0, 0);

        this.ctx.restore();

        // Title
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = `bold ${STATE.titleFontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = STATE.isMobile ? 5 : 10;
        this.ctx.shadowOffsetX = STATE.isMobile ? 2 : 3;
        this.ctx.shadowOffsetY = STATE.isMobile ? 2 : 3;
        this.ctx.fillText('YOU WON!', centerX, centerY + STATE.titleOffsetY);

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Name
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${STATE.nameFontSize}px Arial`;
        this.ctx.fillText(`Circle ${this.winner.id}`, centerX, centerY + STATE.nameOffsetY);

        // Score
        this.ctx.font = `${STATE.scoreFontSize}px Arial`;
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillText(`Final Score: ${this.winner.score}`, centerX, centerY + STATE.scoreOffsetY);

        // Trophy
        this.ctx.font = `${STATE.trophyFontSize}px Arial`;
        this.ctx.fillText('🏆', centerX, centerY + STATE.trophyOffsetY);

        // Prompt
        this.ctx.font = `${STATE.promptFontSize}px Arial`;
        this.ctx.fillStyle = '#aaa';
        if (STATE.isMobile && STATE.baseSize < 350) {
            this.ctx.fillText('Click "Reset"', centerX, centerY + STATE.promptOffsetY - 10);
            this.ctx.fillText('to play again', centerX, centerY + STATE.promptOffsetY + 10);
        } else {
            this.ctx.fillText('Click "Reset" to play again', centerX, centerY + STATE.promptOffsetY);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.circles.forEach(circle => circle.draw(this.ctx));
        this.powerups.forEach(powerup => powerup.draw(this.ctx));

        if (this.winner && this.gameOver) {
            this.drawWinnerSplash();
        }
    }

    updateScoreBoard() {
        DOM.scoreBoard.innerHTML = '';

        const sortedCircles = [...this.allCircles].sort((a, b) => {
            if (a.isAlive && !b.isAlive) return -1;
            if (!a.isAlive && b.isAlive) return 1;
            return b.score - a.score;
        });

        sortedCircles.forEach(circle => {
            const row = document.createElement('tr');

            if (circle.isAlive) {
                row.innerHTML = `
                    <td>
                        <span class="badge" style="background-color: ${circle.color}">
                            Circle ${circle.id}
                        </span>
                        ${this.gameOver && this.winner && circle.id === this.winner.id ? '<span class="ms-1">🏆</span>' : ''}
                    </td>
                    <td class="fw-bold">${circle.score}</td>
                `;
                row.className = 'table-active';
            } else {
                row.innerHTML = `
                    <td class="text-muted">
                        <span class="badge bg-secondary">
                            Circle ${circle.id}
                        </span>
                        <small class="d-block text-danger">💀 Killed by Circle ${circle.killedBy}</small>
                    </td>
                    <td class="text-muted">${circle.score}</td>
                `;
                row.className = 'table-secondary opacity-50';
            }

            DOM.scoreBoard.appendChild(row);
        });
    }

    gameLoop() {
        this.update();
        this.draw();
        if (!this.isPaused) {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }
    }

    togglePause() {
        if (this.gameOver) return;

        this.isPaused = !this.isPaused;
        DOM.pauseBtn.textContent = this.isPaused ? '▶️ Start' : '⏸️ Pause';

        if (!this.isPaused) {
            this.gameLoop();
            this.schedulePowerUpSpawn();
        } else {
            this.stopPowerUpSpawn();
        }
    }

    reset() {
        this.stopPowerUpSpawn();
        location.reload();
    }

    updateUI() {
        DOM.circleCountEl.textContent = this.circles.length;
        DOM.spawnBtn.disabled = this.circles.length >= CONFIG.MAX_CIRCLES || this.gameOver;

        if (this.gameOver) {
            DOM.pauseBtn.disabled = true;
            DOM.pauseBtn.textContent = '🏁 Game Over';
        }
    }
}