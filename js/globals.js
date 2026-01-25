import { CONFIG } from './config.js';

// DOM Elements
export const DOM = {
    canvas: document.getElementById('gameCanvas'),
    canvasContainer: null,
    ctx: null,
    spawnBtn: document.getElementById('spawnBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    stopBtn: document.getElementById('stopBtn'),
    powerupBtn: document.getElementById('powerupBtn'),
    circleCountEl: document.getElementById('circleCount'),
    scoreBoard: document.getElementById('score-board'),
    testBtn: document.getElementById('testBtn')
};

// Initialize canvas container and context
DOM.canvasContainer = DOM.canvas.parentElement;
DOM.ctx = DOM.canvas.getContext('2d');

// Global Responsive State
export const STATE = {
    // Sizes
    circleRadius: 0,
    powerupRadius: 0,
    baseSize: 0,
    displayWidth: 0,
    
    // Device flags
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    
    // Font sizes
    titleFontSize: 0,
    nameFontSize: 0,
    scoreFontSize: 0,
    trophyFontSize: 0,
    promptFontSize: 0,
    circleIdFontSize: 0,
    
    // Spacing
    circleOffsetY: 0,
    titleOffsetY: 0,
    nameOffsetY: 0,
    scoreOffsetY: 0,
    trophyOffsetY: 0,
    promptOffsetY: 0,
    
    // Test mode
    testMode: false
};

// Update all responsive variables
export function updateResponsiveVariables() {
    STATE.displayWidth = DOM.canvasContainer.clientWidth;
    STATE.baseSize = Math.min(DOM.canvas.width, DOM.canvas.height);
    
    // Device detection
    STATE.isMobile = STATE.displayWidth < CONFIG.BREAKPOINTS.MOBILE;
    STATE.isTablet = STATE.displayWidth >= CONFIG.BREAKPOINTS.MOBILE && STATE.displayWidth < CONFIG.BREAKPOINTS.TABLET;
    STATE.isDesktop = STATE.displayWidth >= CONFIG.BREAKPOINTS.TABLET;
    
    // Determine scale based on device
    let scale;
    if (STATE.isMobile) {
        scale = CONFIG.SCALE.MOBILE;
    } else if (STATE.isTablet) {
        scale = CONFIG.SCALE.TABLET;
    } else {
        scale = CONFIG.SCALE.DESKTOP;
    }
    
    // Update sizes
    STATE.circleRadius = Math.max(
        CONFIG.BOUNDS.CIRCLE.MIN,
        Math.min(CONFIG.BOUNDS.CIRCLE.MAX, STATE.displayWidth * scale.CIRCLE)
    );
    STATE.powerupRadius = Math.max(
        CONFIG.BOUNDS.POWERUP.MIN,
        Math.min(CONFIG.BOUNDS.POWERUP.MAX, STATE.displayWidth * scale.POWERUP)
    );
    
    // Get splash screen config
    const splashConfig = STATE.isMobile ? CONFIG.SPLASH_SCREEN.MOBILE :
                        STATE.isTablet ? CONFIG.SPLASH_SCREEN.TABLET :
                        CONFIG.SPLASH_SCREEN.DESKTOP;
    
    // Update font sizes
    STATE.titleFontSize = STATE.baseSize * splashConfig.TITLE_FONT;
    STATE.nameFontSize = STATE.baseSize * splashConfig.NAME_FONT;
    STATE.scoreFontSize = STATE.baseSize * splashConfig.SCORE_FONT;
    STATE.trophyFontSize = STATE.baseSize * splashConfig.TROPHY_FONT;
    STATE.promptFontSize = STATE.baseSize * splashConfig.PROMPT_FONT;
    STATE.circleIdFontSize = STATE.baseSize * splashConfig.CIRCLE_ID_FONT;
    
    // Update spacing
    STATE.circleOffsetY = STATE.baseSize * splashConfig.SPACING.CIRCLE_Y;
    STATE.titleOffsetY = STATE.baseSize * splashConfig.SPACING.TITLE_Y;
    STATE.nameOffsetY = STATE.baseSize * splashConfig.SPACING.NAME_Y;
    STATE.scoreOffsetY = STATE.baseSize * splashConfig.SPACING.SCORE_Y;
    STATE.trophyOffsetY = STATE.baseSize * splashConfig.SPACING.TROPHY_Y;
    STATE.promptOffsetY = STATE.baseSize * splashConfig.SPACING.PROMPT_Y;
    
}

// Resize canvas and update variables
export function resizeCanvas() {
    const displayWidth = DOM.canvasContainer.clientWidth;
    DOM.canvas.width = displayWidth;
    
    // Set height based on device
    let heightRatio;
    if (displayWidth < CONFIG.BREAKPOINTS.MOBILE) {
        heightRatio = CONFIG.SCALE.MOBILE.CANVAS_HEIGHT_RATIO;
    } else if (displayWidth < CONFIG.BREAKPOINTS.TABLET) {
        heightRatio = CONFIG.SCALE.TABLET.CANVAS_HEIGHT_RATIO;
    } else {
        heightRatio = CONFIG.SCALE.DESKTOP.CANVAS_HEIGHT_RATIO;
    }
    
    DOM.canvas.height = displayWidth * heightRatio;
    
    // Update all responsive variables
    updateResponsiveVariables();
}