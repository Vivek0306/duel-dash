import { CONFIG } from './config.js';
import { STATE, DOM, resizeCanvas } from './globals.js';
import { Circle } from './Circle.js';
import { Game } from './Game.js';

// Initialize canvas
resizeCanvas();

// Listen for window resize
window.addEventListener('resize', resizeCanvas);

// Initialize game
const game = new Game(DOM.canvas, DOM.ctx);

// Event Listeners
DOM.spawnBtn.addEventListener('click', () => {
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

DOM.testBtn.addEventListener('click', () => {
    STATE.testMode = !STATE.testMode;
    DOM.testBtn.textContent = STATE.testMode ? 'TEST MODE: ON' : 'TEST MODE: OFF';
    if (STATE.testMode) {
        game.winner = new Circle(120, 120, 1, 1, "#FFD700", 'TEST');
        game.gameOver = true;
        game.draw();
    } else {
        game.gameOver = false;
        game.winner = null;
        game.draw();
    }
});

DOM.pauseBtn.addEventListener('click', () => game.togglePause());
DOM.stopBtn.addEventListener('click', () => game.reset());

// Initial render
game.draw();