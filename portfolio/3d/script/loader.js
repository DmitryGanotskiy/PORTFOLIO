import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

class ObjectManager {
    constructor(scene) {
        this.scene = scene;
        this.clickableObjects = [];
        this.frame = null;
        this.door = null;
        this.road = null;
        this.column = null;
        this.postament = null;
        this.temple = null;
        this.temple1 = null;
        this.torch = null;
        this.throne = null;
        this.roman = null;
        this.david = null;
        this.diane = null;
        this.stand = null;
        this.shelf = null;
        this.collision = [];
        this.stairs = null;
    }

    loadModel(path, position, rotation, hasCollision = false) {
        const loader = new GLTFLoader();
        loader.load(
            path,
            (glb) => {
                const object = glb.scene;
    
                const filename = path.split('/').pop();
    
                if (filename === "stairs.gltf") {
                    object.scale.set(2, 2, 2);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.stairs = object;
                    
                    // Add collision geometry for stairs
                    if (hasCollision) {
                        this.addStairsCollisionGeometry(object, position);
                    }
                } else if (filename === "board.gltf") {
                    object.scale.set(1, 1, 1);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.postament = object;
                }else if (filename === "postament.glb") {
                    object.scale.set(25, 25, 25);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.postament = object;
                } 
                else if (filename === "scene.gltf") {
                    object.scale.set(8, 8, 8);
                    console.log("FIIIIIIIIIIIIILE",filename)
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.temple = object;
                } else if (filename === "scene1.gltf") {
                    object.scale.set(15, 15, 15);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.temple1 = object;
                } else if (filename === "torch.gltf") {
                    object.scale.set(0.15, 0.15, 0.15);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.torch = object;
                } else if (filename === "throne.gltf") {
                    object.scale.set(0.3, 0.3, 0.3);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.throne = object;
                } else if (filename === "roman.glb") {
                    object.scale.set(30, 30, 30);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    
                    // Make the model slightly darker by adjusting material properties
                    object.traverse((child) => {
                        if (child.isMesh) {
                            child.material.color.multiplyScalar(0.8); // Adjust the scalar to control darkness
                        }
                    });
                
                    this.roman = object;
                } else if (filename === "diane.glb") {
                    object.scale.set(3, 3, 3);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.diane = object;
                } else if (filename === "david.glb") {
                    object.scale.set(100, 100, 100);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.david = object;
                } else if (filename === "stand.glb") {
                    object.scale.set(20, 20, 20);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.stand = object;
                } else if (filename === "shelf.gltf") {
                    object.scale.set(0.1, 0.1, 0.1);
                    object.position.set(position.x, position.y, position.z); 
                    object.rotation.y = rotation;
                    this.shelf = object;
                }
                
    
                this.scene.add(object);
                console.log("Model loaded:", filename);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.log('An error happened', error);
            }
        );
    }    

    addStairsCollisionGeometry(stairsObject, position) {
        // Create invisible collision boxes for each stair step
        const stepCount = 8; // Number of steps
        const stepWidth = 20;
        const stepHeight = 3;
        const stepDepth = 5;
        
        for (let i = 0; i < stepCount; i++) {
            const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
            const stepMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff0000, 
                transparent: true, 
                opacity: 0,
                visible: false // Make invisible but keep for collision
            });
            
            const stepCollider = new THREE.Mesh(stepGeometry, stepMaterial);
            stepCollider.position.set(
                position.x,
                position.y + (i * stepHeight),
                position.z + (i * stepDepth)
            );
            
            // Add to stairs object for collision detection
            stairsObject.add(stepCollider);
        }
    }

    loadImages(img) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(`3d/img/${img.path}`, (texture) => {
            const geometry = new THREE.PlaneGeometry(24, 40);
            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
            const plane = new THREE.Mesh(geometry, material);
            plane.position.set(img.position.x, img.position.y, img.position.z);
            plane.rotation.y = img.rotation;
            this.scene.add(plane);
    
            plane.userData.clickable = true;
            this.clickableObjects.push(plane);
        });
    }
}

export { ObjectManager };
