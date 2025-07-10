import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Utils } from '../../core/utils.js';
import { APP_CONFIG } from '../../core/config.js';

export class AssetManager {
    constructor() {
        this.assets = new Map();
        this.loadingQueue = new Map();
        this.loadingPromises = new Map();
        
        // Initialize loaders
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new GLTFLoader();
        this.audioLoader = new THREE.AudioLoader();
    }

    async preloadAssets(assetList) {
        const loadPromises = assetList.map(asset => this.loadAsset(asset));
        return Promise.all(loadPromises);
    }

    async loadAsset(assetConfig) {
        const { type, name, path, options = {} } = assetConfig;
        
        // Check if already loaded
        if (this.assets.has(name)) {
            return this.assets.get(name);
        }
        
        // Check if currently loading
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        const loadPromise = this._loadAssetByType(type, path, options);
        this.loadingPromises.set(name, loadPromise);

        try {
            const asset = await loadPromise;
            this.assets.set(name, asset);
            this.loadingPromises.delete(name);
            return asset;
        } catch (error) {
            console.error(`Failed to load asset ${name}:`, error);
            this.loadingPromises.delete(name);
            throw error;
        }
    }

    async _loadAssetByType(type, path, options) {
        const fullPath = this._getFullPath(type, path);
        
        switch (type) {
            case 'texture':
                return this._loadTexture(fullPath, options);
            case 'model':
                return this._loadModel(fullPath, options);
            case 'audio':
                return this._loadAudio(fullPath, options);
            default:
                throw new Error(`Unknown asset type: ${type}`);
        }
    }

    _loadTexture(path, options) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    if (options.wrapS) texture.wrapS = options.wrapS;
                    if (options.wrapT) texture.wrapT = options.wrapT;
                    if (options.colorSpace) texture.colorSpace = options.colorSpace;
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }

    _loadModel(path, options) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    const model = gltf.scene;
                    if (options.scale) model.scale.setScalar(options.scale);
                    if (options.position) model.position.copy(options.position);
                    if (options.rotation) model.rotation.y = options.rotation;
                    resolve({ model, animations: gltf.animations });
                },
                undefined,
                reject
            );
        });
    }

    _loadAudio(path, options) {
        return new Promise((resolve, reject) => {
            this.audioLoader.load(path, resolve, undefined, reject);
        });
    }

    _getFullPath(type, path) {
        const baseDir = {
            'texture': APP_CONFIG.ASSETS.IMAGES,
            'model': APP_CONFIG.ASSETS.MODELS,
            'audio': APP_CONFIG.ASSETS.AUDIO
        }[type];
        
        return `${baseDir}${path}`;
    }

    getAsset(name) {
        return this.assets.get(name);
    }

    hasAsset(name) {
        return this.assets.has(name);
    }

    dispose() {
        this.assets.forEach((asset, name) => {
            if (asset.dispose) asset.dispose();
            if (asset.geometry) asset.geometry.dispose();
            if (asset.material) {
                if (Array.isArray(asset.material)) {
                    asset.material.forEach(mat => mat.dispose());
                } else {
                    asset.material.dispose();
                }
            }
        });
        this.assets.clear();
    }
}
