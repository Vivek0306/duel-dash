// TODO
// 1. Adjust radius based on screen sizes --- DONE
// 2. Random spawn for power ups --- DONE
// 3. Winner splash screen - [OPTIONAL] -- DONE FOR PC SCREEN
// 4. Adjust arena size for mobile devices --- DONE

// ============================================
// GLOBAL VARIABLES & DEVICE DETECTION
// ============================================
const canvas = document.getElementById('gameCanvas');
const canvasContainer = canvas.parentElement;
const ctx = canvas.getContext('2d');

// DOM Elements
const spawnBtn = document.getElementById('spawnBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const powerupBtn = document.getElementById('powerupBtn');
const circleCountEl = document.getElementById('circleCount');
const scoreBoard = document.getElementById('score-board');
const testBtn = document.getElementById('testBtn');

// Game Constants
const SPEED = 3;
const MAX_CIRCLES = 5;
const MAX_POWERUPS = 5;
const COLORS = ['#e94560', '#00d4ff', '#f39c12', '#9b59b6', '#2ecc71', '#e67e22', '#1abc9c'];

// Global Responsive Variables (updated on resize)
let CIRCLE_RADIUS = 0;
let POWERUP_RADIUS = 0;
let IS_MOBILE = false;
let IS_TABLET = false;
let IS_DESKTOP = false;
let BASE_SIZE = 0;
let DISPLAY_WIDTH = 0;

// Global Font Sizes (for consistency)
let TITLE_FONT_SIZE = 0;
let NAME_FONT_SIZE = 0;
let SCORE_FONT_SIZE = 0;
let TROPHY_FONT_SIZE = 0;
let PROMPT_FONT_SIZE = 0;
let CIRCLE_ID_FONT_SIZE = 0;

// Global Spacing (for consistency)
let CIRCLE_OFFSET_Y = 0;
let TITLE_OFFSET_Y = 0;
let NAME_OFFSET_Y = 0;
let SCORE_OFFSET_Y = 0;
let TROPHY_OFFSET_Y = 0;
let PROMPT_OFFSET_Y = 0;

// Test Mode
var testMode = false;

// ============================================
// RESPONSIVE CALCULATION FUNCTION
// ============================================
function updateResponsiveVariables() {
    DISPLAY_WIDTH = canvasContainer.clientWidth;
    BASE_SIZE = Math.min(canvas.width, canvas.height);
    
    // Device detection
    IS_MOBILE = DISPLAY_WIDTH < 480;
    IS_TABLET = DISPLAY_WIDTH >= 480 && DISPLAY_WIDTH < 1200;
    IS_DESKTOP = DISPLAY_WIDTH >= 1200;
    
    // Scale factors
    let circleScale, powerupScale;
    
    if (IS_MOBILE) {
        circleScale = 0.055;
        powerupScale = 0.033;
    } else if (IS_TABLET) {
        circleScale = 0.045;
        powerupScale = 0.027;
    } else {
        circleScale = 0.035;
        powerupScale = 0.021;
    }
    
    // Update sizes with bounds
    CIRCLE_RADIUS = Math.max(20, Math.min(70, DISPLAY_WIDTH * circleScale));
    POWERUP_RADIUS = Math.max(8, Math.min(25, DISPLAY_WIDTH * powerupScale));
    
    // Update font sizes based on device
    TITLE_FONT_SIZE = IS_MOBILE ? BASE_SIZE * 0.12 : IS_TABLET ? BASE_SIZE * 0.1 : BASE_SIZE * 0.08;
    NAME_FONT_SIZE = IS_MOBILE ? BASE_SIZE * 0.06 : IS_TABLET ? BASE_SIZE * 0.055 : BASE_SIZE * 0.04;
    SCORE_FONT_SIZE = IS_MOBILE ? BASE_SIZE * 0.05 : IS_TABLET ? BASE_SIZE * 0.045 : BASE_SIZE * 0.035;
    TROPHY_FONT_SIZE = IS_MOBILE ? BASE_SIZE * 0.15 : IS_TABLET ? BASE_SIZE * 0.13 : BASE_SIZE * 0.11;
    PROMPT_FONT_SIZE = IS_MOBILE ? BASE_SIZE * 0.035 : IS_TABLET ? BASE_SIZE * 0.03 : BASE_SIZE * 0.025;
    CIRCLE_ID_FONT_SIZE = IS_MOBILE ? BASE_SIZE * 0.08 : IS_TABLET ? BASE_SIZE * 0.07 : BASE_SIZE * 0.055;
    
    // Update spacing based on device
    CIRCLE_OFFSET_Y = IS_MOBILE ? -BASE_SIZE * 0.15 : IS_TABLET ? -BASE_SIZE * 0.13 : -BASE_SIZE * 0.12;
    TITLE_OFFSET_Y = IS_MOBILE ? BASE_SIZE * 0.12 : IS_TABLET ? BASE_SIZE * 0.1 : BASE_SIZE * 0.09;
    NAME_OFFSET_Y = IS_MOBILE ? BASE_SIZE * 0.22 : IS_TABLET ? BASE_SIZE * 0.18 : BASE_SIZE * 0.16;
    SCORE_OFFSET_Y = IS_MOBILE ? BASE_SIZE * 0.3 : IS_TABLET ? BASE_SIZE * 0.25 : BASE_SIZE * 0.22;
    TROPHY_OFFSET_Y = IS_MOBILE ? BASE_SIZE * 0.43 : IS_TABLET ? BASE_SIZE * 0.37 : BASE_SIZE * 0.33;
    PROMPT_OFFSET_Y = IS_MOBILE ? BASE_SIZE * 0.55 : IS_TABLET ? BASE_SIZE * 0.48 : BASE_SIZE * 0.43;
    
    console.log(`Device: ${IS_MOBILE ? 'Mobile' : IS_TABLET ? 'Tablet' : 'Desktop'} | Width: ${DISPLAY_WIDTH}px | Circle: ${CIRCLE_RADIUS}px | Powerup: ${POWERUP_RADIUS}px`);
}

// ============================================
// CANVAS RESIZE FUNCTION
// ============================================
function resizeCanvas() {
    const displayWidth = canvasContainer.clientWidth;
    canvas.width = displayWidth;
    
    // Responsive height
    if (displayWidth < 480) {
        // Mobile - taller canvas
        canvas.height = displayWidth * 1.5;
    } else if (displayWidth < 768) {
        // Tablet - medium height
        canvas.height = displayWidth * 0.8;
    } else {
        // Desktop - landscape
        canvas.height = displayWidth * 0.6;
    }
    
    // Update all responsive variables
    updateResponsiveVariables();
}

// Initialize canvas
resizeCanvas();

// Listen for window resize
window.addEventListener('resize', () => {
    resizeCanvas();
});

// ============================================
// CIRCLE CLASS
// ============================================
class Circle {
    constructor(x, y, vx, vy, color, id, powerup = null) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = CIRCLE_RADIUS;
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

            c1.vx = -Math.cos(angle) * SPEED;
            c1.vy = -Math.sin(angle) * SPEED;
            c2.vx = Math.cos(angle) * SPEED;
            c2.vy = Math.sin(angle) * SPEED;

            const overlap = minDistance - distance;
            const separationDistance = (overlap / 2) + 2;

            const separationX = Math.cos(angle) * separationDistance;
            const separationY = Math.sin(angle) * separationDistance;

            c1.x -= separationX;
            c1.y -= separationY;
            c2.x += separationX;
            c2.y += separationY;

            // Handle kills with proper tracking
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
        const minDistance = circle.radius + POWERUP_RADIUS;

        if (distance < minDistance && distance > 0) {
            circle.powerup = true;
            return true;
        }
        return false;
    }
}

// ============================================
// POWERUP CLASS
// ============================================
class Powerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        const pulseTime = Date.now() / 200;
        const pulseSize = Math.sin(pulseTime) * 5 + 10;

        ctx.beginPath();
        ctx.arc(this.x, this.y, POWERUP_RADIUS + pulseSize, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            this.x, this.y, POWERUP_RADIUS,
            this.x, this.y, POWERUP_RADIUS + pulseSize
        );
        gradient.addColorStop(0, '#ff9100' + '80');
        gradient.addColorStop(1, '#ff9100' + '00');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, POWERUP_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#e72503ff';
        ctx.fill();
        ctx.strokeStyle = '#ff9100ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
}

// ============================================
// GAME CLASS
// ============================================
class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.circles = [];
        this.allCircles = [];
        this.powerups = [];
        this.isPaused = true;
        this.animationId = null;

        this.powerupTimer = null;
        this.minSpawnInterval = 4000;
        this.maxSpawnInterval = 9000;

        this.winner = null;
        this.gameOver = false;
    }

    schedulePowerUpSpawn() {
        if (this.powerupTimer) {
            clearTimeout(this.powerupTimer);
        }

        if (this.isPaused || this.powerups.length >= MAX_POWERUPS || this.gameOver) {
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
        if (this.powerups.length >= MAX_POWERUPS) return;
        const x = POWERUP_RADIUS + Math.random() * (this.canvas.width - 2 * POWERUP_RADIUS);
        const y = POWERUP_RADIUS + Math.random() * (this.canvas.height - 2 * POWERUP_RADIUS);

        const powerup = new Powerup(x, y);
        this.powerups.push(powerup);
        this.updateUI();
    }

    spawnCircle() {
        if (this.circles.length >= MAX_CIRCLES) return;

        const x = CIRCLE_RADIUS + Math.random() * (this.canvas.width - 2 * CIRCLE_RADIUS);
        const y = CIRCLE_RADIUS + Math.random() * (this.canvas.height - 2 * CIRCLE_RADIUS);

        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * SPEED;
        const vy = Math.sin(angle) * SPEED;

        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

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
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Use global responsive variables
        const circleSizeMultiplier = IS_MOBILE ? 1.2 : IS_TABLET ? 1.4 : 1.5;
        const glowMultiplier = IS_MOBILE ? 1.8 : 2;

        // Pulsing effect
        const pulseTime = Date.now() / 300;
        const pulseScale = Math.sin(pulseTime) * 0.1 + 1;

        // Winner circle
        this.ctx.save();
        this.ctx.translate(centerX, centerY + CIRCLE_OFFSET_Y);
        this.ctx.scale(pulseScale, pulseScale);

        // Glow effect
        const glowRadius = CIRCLE_RADIUS * glowMultiplier;
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        gradient.addColorStop(0, this.winner.color + 'ff');
        gradient.addColorStop(0.5, this.winner.color + '80');
        gradient.addColorStop(1, this.winner.color + '00');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Winner circle
        const winnerCircleRadius = CIRCLE_RADIUS * circleSizeMultiplier;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, winnerCircleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.winner.color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = IS_MOBILE ? 2 : IS_TABLET ? 3 : 4;
        this.ctx.stroke();

        // Circle ID
        this.ctx.fillStyle = '#000';
        this.ctx.font = `bold ${CIRCLE_ID_FONT_SIZE}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.winner.id, 0, 0);

        this.ctx.restore();

        // "YOU WON!" text
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = `bold ${TITLE_FONT_SIZE}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = IS_MOBILE ? 5 : 10;
        this.ctx.shadowOffsetX = IS_MOBILE ? 2 : 3;
        this.ctx.shadowOffsetY = IS_MOBILE ? 2 : 3;

        this.ctx.fillText('YOU WON!', centerX, centerY + TITLE_OFFSET_Y);

        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Winner info
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${NAME_FONT_SIZE}px Arial`;
        this.ctx.fillText(`Circle ${this.winner.id}`, centerX, centerY + NAME_OFFSET_Y);

        // Score
        this.ctx.font = `${SCORE_FONT_SIZE}px Arial`;
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillText(`Final Score: ${this.winner.score}`, centerX, centerY + SCORE_OFFSET_Y);

        // Trophy emoji
        this.ctx.font = `${TROPHY_FONT_SIZE}px Arial`;
        this.ctx.fillText('🏆', centerX, centerY + TROPHY_OFFSET_Y);

        // Play again prompt
        this.ctx.font = `${PROMPT_FONT_SIZE}px Arial`;
        this.ctx.fillStyle = '#aaa';

        if (IS_MOBILE && BASE_SIZE < 350) {
            this.ctx.fillText('Click "Reset"', centerX, centerY + PROMPT_OFFSET_Y - 10);
            this.ctx.fillText('to play again', centerX, centerY + PROMPT_OFFSET_Y + 10);
        } else {
            this.ctx.fillText('Click "Reset" to play again', centerX, centerY + PROMPT_OFFSET_Y);
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
        scoreBoard.innerHTML = '';

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

            scoreBoard.appendChild(row);
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
        pauseBtn.textContent = this.isPaused ? '▶️ Start' : '⏸️ Pause';

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
        circleCountEl.textContent = this.circles.length;
        spawnBtn.disabled = this.circles.length >= MAX_CIRCLES || this.gameOver;
        
        if (this.gameOver) {
            pauseBtn.disabled = true;
            pauseBtn.textContent = '🏁 Game Over';
        }
    }
}

// ============================================
// INITIALIZE GAME
// ============================================
const game = new Game(canvas, ctx);

// ============================================
// EVENT LISTENERS
// ============================================
spawnBtn.addEventListener('click', () => {
    if (game.circles.length < 2) {
        game.spawnCircle();
        game.spawnCircle();
    } else {
        game.spawnCircle();
    }
    if (game.isPaused) {
        game.togglePause();
    }
});

testBtn.addEventListener('click', () => {
    testMode = !testMode;
    testBtn.textContent = testMode ? 'TEST MODE: ON' : 'TEST MODE: OFF';
    if (testMode) {
        game.winner = new Circle(120, 120, 1, 1, "#FFD700", 'TEST');
        game.gameOver = true;
        game.draw();
    } else {
        game.gameOver = false;
        game.winner = null;
        game.draw();
    }
});

pauseBtn.addEventListener('click', () => game.togglePause());
stopBtn.addEventListener('click', () => game.reset());

// Initial render
game.draw();