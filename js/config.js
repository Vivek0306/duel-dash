// Game configuration constants
export const CONFIG = {
    SPEED: 3,
    MAX_CIRCLES: 5,
    MAX_POWERUPS: 5,
    COLORS: ['#e94560', '#00d4ff', '#f39c12', '#9b59b6', '#2ecc71', '#e67e22', '#1abc9c'],
    
    POWERUP_SPAWN: {
        MIN_INTERVAL: 4000,  // 4 seconds
        MAX_INTERVAL: 9000   // 9 seconds
    },
    
    BREAKPOINTS: {
        MOBILE: 480,
        TABLET: 1200
    },
    
    SCALE: {
        MOBILE: {
            CIRCLE: 0.055,
            POWERUP: 0.033,
            CANVAS_HEIGHT_RATIO: 1.5
        },
        TABLET: {
            CIRCLE: 0.045,
            POWERUP: 0.027,
            CANVAS_HEIGHT_RATIO: 0.8
        },
        DESKTOP: {
            CIRCLE: 0.035,
            POWERUP: 0.021,
            CANVAS_HEIGHT_RATIO: 0.6
        }
    },
    
    BOUNDS: {
        CIRCLE: { MIN: 20, MAX: 70 },
        POWERUP: { MIN: 8, MAX: 25 }
    },
    
    SPLASH_SCREEN: {
        MOBILE: {
            CIRCLE_SIZE: 1.2,
            GLOW_SIZE: 1.8,
            TITLE_FONT: 0.12,
            NAME_FONT: 0.06,
            SCORE_FONT: 0.05,
            TROPHY_FONT: 0.15,
            PROMPT_FONT: 0.035,
            CIRCLE_ID_FONT: 0.08,
            SPACING: {
                CIRCLE_Y: -0.15,
                TITLE_Y: 0.12,
                NAME_Y: 0.22,
                SCORE_Y: 0.3,
                TROPHY_Y: 0.43,
                PROMPT_Y: 0.55
            }
        },
        TABLET: {
            CIRCLE_SIZE: 1.4,
            GLOW_SIZE: 2,
            TITLE_FONT: 0.1,
            NAME_FONT: 0.055,
            SCORE_FONT: 0.045,
            TROPHY_FONT: 0.13,
            PROMPT_FONT: 0.03,
            CIRCLE_ID_FONT: 0.07,
            SPACING: {
                CIRCLE_Y: -0.13,
                TITLE_Y: 0.1,
                NAME_Y: 0.18,
                SCORE_Y: 0.25,
                TROPHY_Y: 0.37,
                PROMPT_Y: 0.48
            }
        },
        DESKTOP: {
            CIRCLE_SIZE: 1.5,
            GLOW_SIZE: 2,
            TITLE_FONT: 0.08,
            NAME_FONT: 0.04,
            SCORE_FONT: 0.035,
            TROPHY_FONT: 0.11,
            PROMPT_FONT: 0.025,
            CIRCLE_ID_FONT: 0.055,
            SPACING: {
                CIRCLE_Y: -0.12,
                TITLE_Y: 0.09,
                NAME_Y: 0.16,
                SCORE_Y: 0.22,
                TROPHY_Y: 0.33,
                PROMPT_Y: 0.43
            }
        }
    }
};