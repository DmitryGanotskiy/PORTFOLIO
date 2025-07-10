import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

class ObjectManager {
    constructor(scene) {
        this.scene = scene;
        this.clickableObjects = [];
        this.stair = null;
        this.ladder = null;
        this.lift = null;
        this.mixer = null;
        this.ben = null;
        this.kremlin = null;
        this.goethe = null;
        this.spanish = null;
        this.french = null;
        this.torch = null;
        this.column = null;
        this.me = null;
        this.arrs = null;
        this.email = null;
        this.git = null;
        this.ln = null;
        this.board = null; // Add board property
        this.collision = [];
        this.models = [];
    }

    async loadModel({ path, position, rotation }) {
        const loader = new GLTFLoader();

        try {
            const glb = await new Promise((resolve, reject) => {
                loader.load(
                    path,
                    (data) => resolve(data),
                    undefined,
                    (error) => reject(error)
                );
            });

            const object = glb.scene;
            const filename = path.split('/').pop();

            if (filename === "scene.gltf") {
                object.scale.set(1, 1, 1);
                object.position.set(position.x, position.y, position.z);
                object.rotation.y = rotation;
                this.stair = object;
            } else if (filename === "board.gltf") {
                object.scale.set(20, 20, 20); // Much larger scale
                object.position.set(position.x, position.y, position.z);
                object.rotation.y = rotation;
                this.board = object;
                console.log("Board loaded at position:", position);
            } else if (filename === "ladder.gltf") {
                object.scale.set(17, 15, 15);
                object.position.set(position.x, position.y, position.z);
                object.rotation.y = rotation;
                this.ladder = object;
            } else if (filename === "kremlin.gltf") {
                object.scale.set(1, 1, 1);
                object.position.set(position.x, position.y, position.z);
                object.rotation.y = rotation;
                this.kremlin = object;
            } else if (filename === "ben.gltf") {
                object.scale.set(2, 2, 2);
                object.position.set(position.x, position.y, position.z);
                object.rotation.y = rotation;
                this.ben = object;
            } else if (filename === "goethe.gltf") {
                object.scale.set(0.7, 0.7, 0.7);
                object.position.set(position.x, position.y, position.z);
                object.rotation.y = rotation;
                this.goethe = object;
            } else if (filename === "spanish.gltf") {
                object.scale.set(0.06, 0.06, 0.06);
                object.position.set(position.x, position.y, position.z);
                object.rotation.y = rotation;
                this.spanish = object;
            } else if (filename === "french.glb") {
                object.scale.set(1.2, 1.2, 1.2);
                object.position.set(position.x, position.y, position.z);
                object.rotation.y = rotation;
                this.french = object;
            } else if (filename === "torch.gltf") {
                object.scale.set(0.1, 0.1, 0.1);
                object.position.set(position.x, position.y, position.z); 
                object.rotation.y = rotation;
                this.models.push(object);
            } else if (filename === "column.glb") {
                object.scale.set(2, 2, 2);
                object.position.set(position.x, position.y, position.z); 
                object.rotation.y = rotation;
                this.models.push(object);
            } else if (filename === "ele.glb") {
                object.scale.set(1, 1, 1);
                object.position.set(position.x, position.y, position.z);
                object.rotation.y = rotation;
                this.lift = object;

                // Initialize the animation mixer
                this.mixer = new THREE.AnimationMixer(object);

                // Play all animations asynchronously
                glb.animations.forEach((clip) => {
                    const action = this.mixer.clipAction(clip);
                    action.play();
                    action.loop = THREE.LoopOnce; // Set animation to play once
                    action.clampWhenFinished = true; // Ensure animation stops at the end
                });
            }

            this.scene.add(object);
            console.log("Model loaded:", filename);
        } catch (error) {
            console.error('An error happened during model loading:', error);
        }
    }

    loadImages(img) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(img.path, (texture) => {
            const geometry = new THREE.PlaneGeometry(img.width, img.height);
            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
            const plane = new THREE.Mesh(geometry, material);
            plane.position.set(img.position.x, img.position.y, img.position.z);
            plane.rotation.y = img.rotationY;
            this.scene.add(plane);

            switch (img.name){
                case 'arrs':
                    this.arrs = plane;
                    break;
                case 'email':
                    this.email = plane;
                    break;
                case 'git':
                    this.git = plane;
                    break;
                case 'ln':
                    this.ln = plane;
                    break;
                default:
                    break;
            }

            plane.userData.clickable = true;
            this.clickableObjects.push(plane);
        });
    }

    async update(delta) {
        // Update the animation mixer if it exists
        if (this.mixer) {
            await new Promise((resolve) => {
                this.mixer.update(delta);
                resolve();
            });
        }
    }
}

export { ObjectManager };
