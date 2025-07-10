export const APP_CONFIG = {
    // Asset paths
    ASSETS: {
        IMAGES: '/assets/images/',
        MODELS: '/assets/models/',
        AUDIO: '/assets/audio/',
        FONTS: '/assets/fonts/'
    },
    
    // Scene configuration
    SCENE: {
        WORLD_WIDTH: 256,
        WORLD_DEPTH: 256,
        GRAVITY: 9.8,
        CAMERA_SPEED: 50,
        COLLISION_DISTANCE: 10
    },
    
    // Performance settings
    PERFORMANCE: {
        TARGET_FPS: 60,
        LOD_DISTANCE: 100,
        SHADOW_MAP_SIZE: 2048
    },
    
    // UI settings
    UI: {
        MOBILE_BREAKPOINT: 768,
        ANIMATION_DURATION: 500,
        FADE_DURATION: 2000
    },
    
    // Supported languages
    LANGUAGES: ['en', 'de', 'ru', 'es', 'fr'],
    
    // Project categories
    PROJECT_CATEGORIES: [
        'games',
        'web-apps',
        '3d-experiences',
        'tools',
        'experiments'
    ]
};
