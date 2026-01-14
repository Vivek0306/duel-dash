const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const spawnBtn = document.getElementById('spawnBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const circleCountEl = document.getElementById('circleCount');

// Constants
const CIRCLE_RADIUS = 40;
const SPEED = 3;
const MAX_CIRCLES = 5;
const COLORS = ['#e94560', '#00d4ff', '#f39c12', '#9b59b6', '#2ecc71', '#e67e22', '#1abc9c'];

class Circle {
    constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = CIRCLE_RADIUS;
        this.color = color;
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
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }

    static checkCollision(c1, c2) {
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
        }
    }
}

class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.circles = [];
        this.isPaused = true;
        this.animationId = null;
    }

    spawnCircle() {
        if (this.circles.length >= MAX_CIRCLES) return;

        const x = CIRCLE_RADIUS + Math.random() * (this.canvas.width - 2 * CIRCLE_RADIUS);
        const y = CIRCLE_RADIUS + Math.random() * (this.canvas.height - 2 * CIRCLE_RADIUS);
        
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * SPEED;
        const vy = Math.sin(angle) * SPEED;
        
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        const circle = new Circle(x, y, vx, vy, color);
        this.circles.push(circle);
        
        this.updateUI();
    }

    update() {
        this.circles.forEach(circle => {
            circle.update(this.canvas.width, this.canvas.height);
        });

        for (let i = 0; i < this.circles.length; i++) {
            for (let j = i + 1; j < this.circles.length; j++) {
                Circle.checkCollision(this.circles[i], this.circles[j]);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.circles.forEach(circle => circle.draw(this.ctx));
    }

    gameLoop() {
        this.update();
        this.draw();

        if (!this.isPaused) {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        pauseBtn.textContent = this.isPaused ? 'Start' : 'Pause';

        if (!this.isPaused) {
            this.gameLoop();
        }
    }

    reset() {
        location.reload();
    }

    updateUI() {
        circleCountEl.textContent = this.circles.length;
        spawnBtn.disabled = this.circles.length >= MAX_CIRCLES;
    }
}

// Initialize game
const game = new Game(canvas, ctx);

// Event listeners
spawnBtn.addEventListener('click', () => game.spawnCircle());
pauseBtn.addEventListener('click', () => game.togglePause());
stopBtn.addEventListener('click', () => game.reset());

// Initial render
game.draw();