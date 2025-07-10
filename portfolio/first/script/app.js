import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer } from 'https://threejs.org/examples/jsm/renderers/CSS3DRenderer.js';
import TWEEN from "https://cdn.skypack.dev/@tweenjs/tween.js@18.6.4/dist/tween.umd.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { FirstPersonControls } from './FirstPersonControls.js';
import { ImprovedNoise } from './ImprovedNoise.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';
import { FontLoader } from 'https://threejs.org/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://threejs.org/examples/jsm/geometries/TextGeometry.js';
import {ObjectManager} from './object.js';
import {Translate} from './translate.js';
import {Sounds} from './sound.js';

class TerrainScene {
    constructor() {
        this.worldWidth = 64;
        this.worldDepth = 64;
        this.clock = new THREE.Clock();
        this.gravity = 9.8;
        this.velocityY = 0;
		this.snowflakes = [];
        this.materials = [];
        this.parameters = [];
		this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
		this.previousCameraPosition = new THREE.Vector3();
		this.modelName = 'English';
		this.ifStop = true;
		this.ifMobile = () => {
            let check = false;
            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
            return check;
        };
		console.log(this.ifMobile())

        this.init();
		this.sources();
		this.walls();

		this.moveDirection = new THREE.Vector3(); // Direction vector for movement
        this.movingForward = false;
        this.movingBackward = false;
        this.movingRight = false;
        this.movingLeft = false;

        if (this.ifMobile()) {
			this.controls.enabled = false;
            this.addMobileEventListeners();
        }

		document.addEventListener('click', (event) => this.onMouseMove(event), false);
    }

    init() {
        this.container = document.getElementById('container');
        const loader = new GLTFLoader();

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
        this.scene = new THREE.Scene();

        this.baseColor = new THREE.Color(0x0a0a0a); // Dark initial color
        this.targetColor = new THREE.Color(0xaaaaaa); // Bright target color
        this.scene.background = this.baseColor;
        this.scene.fog = new THREE.FogExp2(this.baseColor.getHex(), 0.02);

        const data = this.generateHeight(this.worldWidth, this.worldDepth);

        this.camera.position.set(-75, 35, 340);
		this.camera.rotation.y = Math.PI*3.9

        const geometry = new THREE.PlaneGeometry(1000, 1000, this.worldWidth - 1, this.worldDepth - 1);
        geometry.rotateX(-Math.PI / 2);

        const vertices = geometry.attributes.position.array;
        for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            vertices[j + 1] = data[i] / 5;
        }
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(1, 1, 1).normalize();
		this.scene.add(directionalLight);
	
        this.texture = new THREE.CanvasTexture(this.generateTexture(data, this.worldWidth, this.worldDepth));
        this.texture.wrapS = THREE.ClampToEdgeWrapping;
        this.texture.wrapT = THREE.ClampToEdgeWrapping;
        this.texture.colorSpace = THREE.SRGBColorSpace;

        this.mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: this.texture }));
        this.scene.add(this.mesh);

		this.ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(this.ambientLight);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.animate());
        this.container.appendChild(this.renderer.domElement);

        this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
        this.controls.movementSpeed = 50;
        this.controls.lookSpeed = 0.1;
        this.controls.enableDamping = true;
		this.controls.enabled = false;

		this.translate = new Translate();
		this.sound = new Sounds();

        window.addEventListener('resize', () => this.onWindowResize());
    }

	addMobileEventListeners() {
        if (document.getElementById('right')) {
            document.getElementById('right').addEventListener('touchstart', () => this.moveRight = true);
            document.getElementById('right').addEventListener('touchend', () => this.moveRight = false);
        }
        if (document.getElementById('left')) {
            document.getElementById('left').addEventListener('touchstart', () => this.moveLeft = true);
            document.getElementById('left').addEventListener('touchend', () => this.moveLeft = false);
        }
        if (document.getElementById('up')) {
            document.getElementById('up').addEventListener('touchstart', () => this.moveForward = true);
            document.getElementById('up').addEventListener('touchend', () => this.moveForward = false);
        }
        if (document.getElementById('down')) {
            document.getElementById('down').addEventListener('touchstart', () => this.moveBackward = true);
            document.getElementById('down').addEventListener('touchend', () => this.moveBackward = false);
        }
    }

	sources() {
		this.loadObjects = new ObjectManager(this.scene);
	
		const torchPositions = [
			{ x: -95, y: 13, z: 285 },
			{ x: -85, y: 13, z: 250 },
			{ x: -75, y: 13, z: 220 },
			{ x: -65, y: 13, z: 190 },
			{ x: -25, y: 13, z: 310 },
			{ x: -10, y: 13, z: 270 },
			{ x: 0, y: 13, z: 245 },
			{ x: 10, y: 13, z: 220 },
		];
	
		const modelPromises = [
			this.loadObjects.loadModel({ path: './first/img/stair/scene.gltf', position: { x: 10.8, y: 0, z: 100 }, rotation: Math.PI / 2.5 }),
			this.loadObjects.loadModel({ path: './first/img/board/board.gltf', position: { x: 50, y: 1, z: 180 }, rotation: Math.PI * 1.6 }), // Left side of stairs, facing kremlin
			this.loadObjects.loadModel({ path: './first/img/ladder/ladder.gltf', position: { x: 42, y: 70, z: -18 }, rotation: Math.PI / 1.15 }),
			this.loadObjects.loadModel({ path: './first/img/ele.glb', position: { x: -240, y: 155, z: -25 }, rotation: Math.PI * 2.2 }),
			this.loadObjects.loadModel({ path: './first/img/ben/ben.gltf', position: { x: -35, y: 15, z: 215 }, rotation: Math.PI / 2 }),
			this.loadObjects.loadModel({ path: './first/img/kremlin/kremlin.gltf', position: { x: -25, y: 20, z: 225 }, rotation: Math.PI * 1.7 }),
			this.loadObjects.loadModel({ path: './first/img/goethe/goethe.gltf', position: { x: -60, y: 20, z: 215 }, rotation: Math.PI / 2 }),
			this.loadObjects.loadModel({ path: './first/img/spanish/spanish.gltf', position: { x: -5, y: 13, z: 235 }, rotation: Math.PI / 2 }),
			this.loadObjects.loadModel({ path: './first/img/french.glb', position: { x: -60, y: 13, z: 218 }, rotation: Math.PI / 3.4 }),
			this.loadObjects.loadModel({ path: './first/img/column.glb', position: { x: -186, y: 154, z: -60 }, rotation: Math.PI / 1.5 }),
			this.loadObjects.loadModel({ path: './first/img/column.glb', position: { x: -154, y: 154, z: -18 }, rotation: Math.PI / 1.5 }),
			...torchPositions.map(pos => this.loadObjects.loadModel({ path: './3d/img/torch/torch.gltf', position: pos, rotation: Math.PI / 3.4 }))
		];
	
		// Load images in parallel
		const imagePromises = [
			this.loadObjects.loadImages({ name: 'me', path: './first/img/me1.png', width: 40, height: 35, position: { x: -265, y: 193, z: 24 }, rotationY: Math.PI / 1.4 }),
			this.loadObjects.loadImages({ name: 'arrs', path: './first/img/arrs.png', width: 20, height: 15, position: { x: -55, y: 20, z: 280 }, rotationY: Math.PI*1.9}),
			this.loadObjects.loadImages({ name: 'email', path: './first/img/email.png', width: 50, height: 4, position: { x: 15, y: 68.5, z: 97 }, rotationY: Math.PI*1.9}),
			
			this.loadObjects.loadImages({ name: 'git', path: './first/img/git.png', width: 7, height: 7, position: { x: -186, y: 185, z: -60 }, rotationY: Math.PI/1.7}),
			this.loadObjects.loadImages({ name: 'ln', path: './first/img/ln.png', width: 7, height: 7, position: { x: -154, y: 185, z: -18 }, rotationY: Math.PI/1.2}),
		];
	
		// Wait for all models and images to load
		Promise.all([...modelPromises, ...imagePromises]).then(() => {
			console.log("All models and images loaded.");
	
			// Additional setup after all models and images are loaded
			const geometry1 = new THREE.PlaneGeometry(130, 62);
			const darkWhite = new THREE.Color(0xd0d0d0);
			const material = new THREE.MeshBasicMaterial({
				color: darkWhite,
				side: THREE.DoubleSide,
				transparent: false,
				opacity: 1.0
			});
	
			this.plane = new THREE.Mesh(geometry1, material);
			this.plane.position.set(-217, 155, -5);
			this.plane.rotation.x = Math.PI / 2;
			this.plane.rotation.z = Math.PI / 1.25;
			this.scene.add(this.plane);
	
			const pointLight = new THREE.PointLight(0xffd700, 1, 50);
			pointLight.position.set(-257, 186, 14);
			this.scene.add(pointLight);
	
			// Add a point light and sprite for each torch
			torchPositions.forEach(pos => {
				const pointLight = new THREE.PointLight(0xffa500, 1, 200);
				pointLight.position.set(pos.x, pos.y + 25, pos.z);
				this.scene.add(pointLight);
	
				const spriteMap = new THREE.TextureLoader().load('3d/img/light.png');
				const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffa500 });
				const sprite = new THREE.Sprite(spriteMaterial);
				sprite.position.set(pos.x, pos.y + 25, pos.z);
				sprite.scale.set(30, 30, 1);
				this.scene.add(sprite);
			});
	
			this.fontLoader = new FontLoader();
			this.fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
				this.createText(font, "Click to choose\n   language");
			});
	
			// Call the start method after everything is loaded and set up
			this.start();
	
		}).catch(error => {
			console.error('Error loading models or images:', error);
		});
	}
	
	start(){
		if(!this.ifMobile())this.controls.enabled = true;
		else if(this.ifMobile())
		{
			this.ifStop = false;
			document.querySelectorAll('.mobile-button').forEach(button => {
                button.style.opacity = '1';
            });
		}
		const load = document.getElementById('load');
		const dark = document.getElementById('dark');
		const texts = document.getElementById('texts');
		load.style.opacity = 0;
		dark.style.opacity = 0;
		texts.style.opacity = 0;
		setTimeout(() => {
            load.style.zIndex = '-1000';
            dark.style.zIndex = '-1000';
			texts.style.zIndex = '-1000';
			document.getElementById('texts').removeAttribute('id');
            this.animate();
        }, 2000);
	}

	onMouseMove(event) {
		if (!this.loadObjects.goethe || !this.loadObjects.ben || !this.loadObjects.kremlin || !this.loadObjects.spanish || !this.loadObjects.french || !this.loadObjects.git || !this.loadObjects.ln || !this.loadObjects.email) {
			console.log("Models are not yet loaded.");
			return;
		}
	
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	
		this.raycaster.setFromCamera(this.mouse, this.camera);
	
		const objectsToTest = [this.loadObjects.goethe, this.loadObjects.ben, this.loadObjects.kremlin, this.loadObjects.spanish, this.loadObjects.french, this.loadObjects.git, this.loadObjects.ln, this.loadObjects.email];
		const intersects = this.raycaster.intersectObjects(objectsToTest, true);
	
		if (intersects.length > 0) {
			const intersectedObject = intersects[0].object;
	
			objectsToTest.forEach((object) => {
				if (this.isChildOf(intersectedObject, object)) {
					switch (object) {
						case this.loadObjects.goethe:
							this.modelName = 'Deutsch';
							this.translate.updateData(this.modelName)
							this.sound.play('music', 'german')
							break;
						case this.loadObjects.ben:
							this.modelName = 'English';
							this.translate.updateData(this.modelName)
							this.sound.play('music', 'english')
							break;
						case this.loadObjects.kremlin:
							this.modelName = 'Russian';
						 this.translate.updateData(this.modelName)
						 this.sound.play('music', 'russian')
						 break;
						case this.loadObjects.spanish:
							this.modelName = 'Spanish';
						 this.translate.updateData(this.modelName)
						 this.sound.play('music', 'spanish')
						 break;
						case this.loadObjects.french:
							this.modelName = 'French';
						 this.translate.updateData(this.modelName)
						 this.sound.play('music', 'french')
						 break;
						default:
							break;
					}
				}
			});
			if (intersectedObject === this.loadObjects.git) {
				window.open('https://github.com/DmitryGanotskiy?tab=repositories', '_blank');
				this.modelName = 0;
			} else if(intersectedObject === this.loadObjects.ln) {
				window.open('https://www.linkedin.com/in/dmitry-ganotskiy-7233b42a9/', '_blank');
				this.modelName = 0;
			} else if(intersectedObject === this.loadObjects.email) {
				window.location.href = `mailto:dmitryganotskiy@gmail.com?subject=${encodeURIComponent("from website")}`;
				this.modelName = 0;
			}
	
			if (this.modelName) {
				this.updateText(this.modelName);
				console.log(this.modelName);
				if (this.textMesh) {
					this.textMesh.position.copy(intersectedObject.position).add(new THREE.Vector3(0, 10, 0));
				}
			}
		}
	}
	
	isChildOf(child, parent) {
		while (child.parent) {
			if (child.parent === parent) {
				return true;
			}
			child = child.parent;
		}
		return false;
	}	
	
	updateText(text) {
		if (this.textMesh) {
			this.scene.remove(this.textMesh);
			this.textMesh.geometry.dispose();
			this.textMesh.material.dispose();
			this.textMesh = null;
		}
	
		this.fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
			this.createText(font, text);
		});
	}
	
	createText(font, text) {
		if (this.textMesh) {
			this.scene.remove(this.textMesh); 
			this.textMesh.geometry.dispose();
			this.textMesh.material.dispose();
			this.textMesh = null;
		}
	
		const geometry = new TextGeometry(text, {
			font: font,
			size: 2,
			depth: 0.3,
			curveSegments: 12
		});
	
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		this.textMesh = new THREE.Mesh(geometry, material);
		this.textMesh.position.set(-42, 18, 225);
		this.textMesh.rotation.y = Math.PI * 3.9;
		this.scene.add(this.textMesh);
	}
	
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.controls.handleResize();
    }

	appearText() {
		const sections = [
			{ element: document.getElementById('intro'), xRange: [175, 218] },
			{ element: document.getElementById('author'), xRange: [105, 175] },
			{ element: document.getElementById('p1'), zRange: [52, 68] },
			{ element: document.getElementById('p2'), zRange: [68, 84] },
			{ element: document.getElementById('p3'), zRange: [84, 100] },
			{ element: document.getElementById('p4'), zRange: [100, 116] },
			{ element: document.getElementById('p5'), zRange: [116, 132] },
			{ element: document.getElementById('p6'), zRange: [132, 148] },
			{ element: document.getElementById('p7'), zRange: [148, 157] },
			{ element: document.getElementById('p8'), zRange: [157, 168] },
			{ element: document.getElementById('p9'), zRange: [169, 180] }
		];
	
		const cameraZ = this.camera.position.y;
		const cameraX = this.camera.position.z;
	
		function toggleVisibility(showElement, hideElements) {
			showElement.style.zIndex = '999';
			showElement.style.opacity = '1';
	
			hideElements.forEach(({ element }) => {
				element.style.opacity = '0';
				element.addEventListener('transitionend', () => {
					if (element.style.opacity === '0') {
						element.style.zIndex = '-999';
					}
				}, { once: true });
			});
		}
	
		let visibleSection = null;
		for (let i = 0; i < sections.length; i++) {
			const { element, xRange, zRange } = sections[i];
	
			if ((xRange && cameraX > xRange[0] && cameraX < xRange[1]) ||
				(zRange && cameraZ > zRange[0] && cameraZ < zRange[1])) {
				visibleSection = sections[i];
				break;
			}
		}
	
		if (visibleSection) {
			const hideSections = sections.filter(section => section !== visibleSection);
			toggleVisibility(visibleSection.element, hideSections);
		} else {
			// Hide everything if the camera is out of the specified ranges
			sections.forEach(({ element }) => {
				element.style.opacity = '0';
				element.addEventListener('transitionend', () => {
					if (element.style.opacity === '0') {
						element.style.zIndex = '-999';
					}
				}, { once: true });
			});
		}
	}

    generateHeight(width, height) {
        let seed = Math.PI / 4;
        window.Math.random = function () {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        const size = width * height, data = new Uint8Array(size);
        const perlin = new ImprovedNoise(), z = Math.random() * 100;
        let quality = 1;

        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < size; i++) {
                const x = i % width, y = ~~(i / width);
                data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
            }
            quality *= 5;
        }

        return data;
    }

	generateTexture(data, width, height) {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');
		context.fillStyle = '#555555';
		context.fillRect(0, 0, width, height);
	
		const image = context.getImageData(0, 0, canvas.width, canvas.height);
		const imageData = image.data;
	
		const vector3 = new THREE.Vector3(0, 0, 0);
		const sun = new THREE.Vector3(1, 1, 1);
		sun.normalize();
	
		for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
			vector3.x = data[j - 2] - data[j + 2];
			vector3.y = 2;
			vector3.z = data[j - width * 2] - data[j + width * 2];
			vector3.normalize();
			const shade = vector3.dot(sun);
	
			const baseColor = 100 + data[j] * 0.6;
			const adjustedShade = 0.5 + shade * 0.6;
	
			imageData[i] = baseColor * adjustedShade;
			imageData[i + 1] = baseColor * adjustedShade;
			imageData[i + 2] = baseColor * adjustedShade;
		}
	
		context.putImageData(image, 0, 0);
	
		const canvasScaled = document.createElement('canvas');
		canvasScaled.width = width * 4;
		canvasScaled.height = height * 4;
		const contextScaled = canvasScaled.getContext('2d');
		contextScaled.scale(4, 4);
		contextScaled.drawImage(canvas, 0, 0);
	
		const imageScaled = contextScaled.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
		const imageDataScaled = imageScaled.data;
	
		for (let i = 0, l = imageDataScaled.length; i < l; i += 4) {
			const v = ~~(Math.random() * 3);
			imageDataScaled[i] += v;
			imageDataScaled[i + 1] += v;
			imageDataScaled[i + 2] += v;
		}
	
		contextScaled.putImageData(imageScaled, 0, 0);
	
		return canvasScaled;
	}

	walls() {
        let wallGeometry = new THREE.BoxGeometry(500, 300, 500); // Creates a rectangular wall
		let wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0 });
		this.wall = new THREE.Mesh(wallGeometry, wallMaterial);
		this.wall.position.set(-59, 60, 150);
		this.wall.rotation.y = Math.PI;
		this.scene.add(this.wall);
    }

	collision() {
        this.velocityY -= this.gravity * this.clock.getDelta();
        const deltaMove = new THREE.Vector3(0, this.velocityY, 0);
        const raycaster = new THREE.Raycaster(this.camera.position, deltaMove.clone().normalize());

        if (this.loadObjects.stair && this.loadObjects.ladder) {
            const objects = [this.mesh, this.loadObjects.stair, this.loadObjects.ladder, this.plane, this.loadObjects.lift];
            const intersects = raycaster.intersectObjects(objects, true);

            if (intersects.length > 0) {
                let closestObject = intersects[0];
                for (const intersect of intersects) {
                    if (intersect.distance < closestObject.distance) {
                        closestObject = intersect;
                    }
                }

                const distance = closestObject.distance;
                const collisionPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(distance));

                // Special handling for stairs - allow climbing
                if (closestObject.object.parent === this.loadObjects.stair) {
                    const stairHeight = collisionPoint.y + 35; // Allow climbing stairs
                    new TWEEN.Tween(this.camera.position)
                        .to({ y: stairHeight }, 250) 
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start();
                } else {
                    // Normal collision for other objects
                    new TWEEN.Tween(this.camera.position)
                        .to({ y: collisionPoint.y + 30 }, 250) 
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start();
                }

                this.velocityY = 0;
            } else {
                this.camera.position.add(deltaMove);
            }
        }
    }

	objectCollision(object){
		if (object) {
			const directions = [
				new THREE.Vector3(1, 0, 0), // Right
				new THREE.Vector3(-1, 0, 0), // Left
				new THREE.Vector3(0, 0, 1), // Forward
				new THREE.Vector3(0, 0, -1) // Backward
			];
	
			for (const direction of directions) {
				const raycaster = new THREE.Raycaster(this.camera.position, direction.clone().normalize());
				const intersects = raycaster.intersectObject(object, true);
	
				if (intersects.length > 0 && intersects[0].distance < 12) {
					// Special handling for stairs - allow movement but guide up steps
					if (object === this.loadObjects.stair) {
						const intersection = intersects[0];
						const stairPosition = intersection.point;
						
						// Calculate stair step height based on position
						const relativeY = stairPosition.y - this.loadObjects.stair.position.y;
						const stepHeight = Math.floor(relativeY / 3) * 3; // 3 units per step
						const targetY = this.loadObjects.stair.position.y + stepHeight + 35;
						
						// Smoothly adjust camera height for stair climbing
						if (Math.abs(this.camera.position.y - targetY) > 2) {
							this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, 0.1);
						}
						
						// Only block movement if moving into solid parts of stairs
						if (intersection.distance < 8) {
							this.camera.position.copy(this.previousCameraPosition);
						}
						return;
					}
					
					// Normal collision for other objects
					this.camera.position.copy(this.previousCameraPosition);
					return;
				}
			}
		}
	}

	updateBackgroundColor() {
		const cameraHeight = this.camera.position.y;
		const minHeight = 50; // Minimum height
		const maxHeight = 170; 
	
		const normalizedHeight = Math.min(Math.max((cameraHeight - minHeight) / (maxHeight - minHeight), 0), 1);
		const veryDarkColor = new THREE.Color(0x0a0a0a); // Black
		const brightColor = new THREE.Color(0xFFFFFF); // White
		const newColor = veryDarkColor.clone().lerp(brightColor, normalizedHeight);
	
		this.scene.background = newColor;
		this.scene.fog.color = newColor;
	}

	move(delta){
		if (this.moveForward && !this.ifStop) this.camera.translateZ(-this.controls.movementSpeed * delta);
        if (this.moveBackward && !this.ifStop) this.camera.translateZ(this.controls.movementSpeed * delta);
        //if (this.moveRight && !this.ifStop) this.camera.translateX(this.controls.movementSpeed * delta);
        //if (this.moveLeft && !this.ifStop) this.camera.translateX(-this.controls.movementSpeed * delta);
		this.controls.rotationSpeed = Math.PI / 4;
		if (this.moveRight && !this.ifStop) {
			this.camera.rotation.y -= this.controls.rotationSpeed * delta;
		}
		if (this.moveLeft && !this.ifStop) {
			this.camera.rotation.y += this.controls.rotationSpeed * delta;
		}
	}
	
    animate() {
		TWEEN.update();
		this.updateBackgroundColor();
		this.appearText();
		if(this.loadObjects.git)this.loadObjects.git.lookAt(this.camera.position);
		if(this.loadObjects.ln)this.loadObjects.ln.lookAt(this.camera.position);
        this.render();
    }

    render() {
		const delta = this.clock.getDelta();

		this.move(delta);
        this.controls.update(delta);
        this.collision();
		this.objectCollision(this.loadObjects.lift)
		this.objectCollision(this.loadObjects.wall)
		this.objectCollision(this.loadObjects.board) // Add board collision
		this.loadObjects.models.forEach( x=> {this.objectCollision(x)});

		if(this.camera.position.x <= -160 && this.camera.position.x >= -220) this.loadObjects.update(delta);

		if(this.camera.position.x <= -240 && this.camera.position.x >= -260 && this.camera.position.y > 170) {
			document.querySelector('body').style.opacity = 0
			setTimeout(()=>{ 
				window.location.href = "./main.html"
			}, 3000)
		}

		const time = Date.now() * 0.00005;
        this.renderer.render(this.scene, this.camera);

		this.previousCameraPosition.copy(this.camera.position);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const terrainScene = new TerrainScene();
});

export {TerrainScene};
