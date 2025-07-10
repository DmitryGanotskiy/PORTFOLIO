import { APP_CONFIG } from '../../core/config.js';

export class TranslationManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = new Map();
        this.observers = new Set();
    }

    async init() {
        // Load all translation files
        const loadPromises = APP_CONFIG.LANGUAGES.map(lang => 
            this.loadTranslation(lang)
        );
        
        await Promise.all(loadPromises);
        
        // Set initial language from localStorage or browser preference
        const savedLanguage = localStorage.getItem('portfolio-language');
        const browserLanguage = navigator.language.split('-')[0];
        
        this.setLanguage(
            savedLanguage || 
            (APP_CONFIG.LANGUAGES.includes(browserLanguage) ? browserLanguage : 'en')
        );
    }

    async loadTranslation(language) {
        try {
            const response = await fetch(`/src/data/translations/${language}.json`);
            const translations = await response.json();
            this.translations.set(language, translations);
        } catch (error) {
            console.error(`Failed to load translations for ${language}:`, error);
        }
    }

    setLanguage(language) {
        if (!APP_CONFIG.LANGUAGES.includes(language)) {
            console.warn(`Language ${language} not supported`);
            return;
        }

        this.currentLanguage = language;
        localStorage.setItem('portfolio-language', language);
        
        // Notify all observers
        this.observers.forEach(callback => callback(language));
        
        // Update DOM elements with data-translate attributes
        this.updateDOMElements();
    }

    get(key, fallback = key) {
        const translation = this.translations.get(this.currentLanguage);
        if (!translation) return fallback;

        const keys = key.split('.');
        let value = translation;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return fallback;
            }
        }
        
        return typeof value === 'string' ? value : fallback;
    }

    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    updateDOMElements() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.get(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
    }
}

// Global instance
export const translationManager = new TranslationManager();
