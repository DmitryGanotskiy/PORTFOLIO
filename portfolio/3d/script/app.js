import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer } from 'https://threejs.org/examples/jsm/renderers/CSS3DRenderer.js';
import TWEEN from "https://cdn.skypack.dev/@tweenjs/tween.js@18.6.4/dist/tween.umd.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { FirstPersonControls } from './FirstPersonControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { Stars } from './stars.js';
import {AnimatedText} from './text.js';
import {ObjectManager} from './loader.js';
import {CharacterManager} from './character.js';

class TerrainScene {
	constructor() {
		this.worldWidth = 256;
		this.worldDepth = 256;
		this.clock = new THREE.Clock();
        this.gravity = 9.8;
        this.velocityY = 0;
        this.objectRadius = 80;
        this.centerPoint = new THREE.Vector3(81, 98, -800);
		this.previousCameraPosition = new THREE.Vector3();
		this.characterManager = null;
		this.characterManagerSeat = null;
		this.isMoving = false;
		this.isShowing = false;
		this.moveDirection = new THREE.Vector3(); // Direction vector for movement
        this.movingForward = false;
        this.movingBackward = false;
        this.movingRight = false;
        this.movingLeft = false;
		this.ifMobile = () => {
            let check = false;
            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
            return check;
        };
		console.log(this.ifMobile())
		this.book = document.getElementById('canvas');
        this.paths = [
            { name: 'hugo', path: 'art/hugo.jpg', position: { x: 230, y: 125, z: -1180 }, rotation: Math.PI },
            { name: 'napoleon', path: 'art/napoleon.jpg', position: { x: 320, y: 125, z: -1081 }, rotation: Math.PI /2 },
            { name: 'rembrandt', path: 'art/rembrandt.jpg', position: { x: 272, y: 125, z: -1031 }, rotation: Math.PI *3.15 },
            { name: 'shakespear', path: 'art/shakespear.jpg', position: { x: 180, y: 125, z: -1114 }, rotation: Math.PI *1.5 },
			{ name: 'dostoyevskiy', path: 'art/dostoyevskiy.jpg', position: { x: 230, y: 80, z: -1180 }, rotation: Math.PI },
            { name: 'caesar', path: 'art/caesar.jpg', position: { x: 320, y: 80, z: -1081 }, rotation: Math.PI /2 },
            { name: 'michelangelo', path: 'art/michelangelo.jpg', position: { x: 272, y: 80, z: -1031 }, rotation: Math.PI *3.15 },
            { name: 'rubens', path: 'art/rubens.jpg', position: { x: 180, y: 80, z: -1114 }, rotation: Math.PI *1.5 },
            { name: '1', path: 'me/1.png', position: { x: 209, y: 80, z: -810 }, rotation: Math.PI /2 },
			{ name: '2', path: 'me/2.png', position: { x: 209, y: 80, z: -774 }, rotation: Math.PI /2 },
			{ name: '3', path: 'me/3.png', position: { x: 209, y: 80, z: -740 }, rotation: Math.PI /2 },
			{ name: '4', path: 'me/4.png', position: { x: 209, y: 80, z: -705 }, rotation: Math.PI /2 },
			{ name: '5', path: 'me/5.png', position: { x: 209, y: 80, z: -670 }, rotation: Math.PI /2 },
			{ name: '6', path: 'me/6.png', position: { x: 290, y: 80, z: -810 }, rotation: Math.PI *1.5 },
			{ name: '7', path: 'me/7.png', position: { x: 290, y: 80, z: -774 }, rotation: Math.PI *1.5 },
			{ name: '8', path: 'me/8.png', position: { x: 290, y: 80, z: -740 }, rotation: Math.PI *1.5 },
			{ name: '9', path: 'me/9.png', position: { x: 290, y: 80, z: -705 }, rotation: Math.PI *1.5 },
			{ name: '10', path: 'me/10.png', position: { x: 290, y: 80, z: -670 }, rotation: Math.PI *1.5 },
			{ name: 'novel', path: 'me/novel.jpg', position: { x: -290, y: 110, z: -884 }, rotation: Math.PI/1.1 },
			{ name: 'article', path: 'me/article.jpg', position: { x: -245, y: 110, z: -1050 }, rotation: Math.PI/1.1 }
		];

		this.init();
        this.loadModelsInCircle().then(() => {
			this.hideLoadingScreen();
			this.startRendering();
		});
		this.loadResources();
		document.getElementById('back').addEventListener('click', this.moveCameraBack.bind(this));
		
		if (this.ifMobile()) {
			this.controls.enabled = false;
            this.addMobileEventListeners();
		}
	
	}

	init() {
		this.container = document.getElementById('container');
        const loader = new GLTFLoader()

		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
		this.scene = new THREE.Scene();

		this.scene.background = new THREE.Color(0x0a0a0a); // Darker background
		this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.005);

		const data = this.generateHeight(this.worldWidth, this.worldDepth);

		this.camera.position.set(81, 110, -850);
		this.camera.lookAt(2, 1, -2);

		const geometry = new THREE.PlaneGeometry(7500, 7500, this.worldWidth - 1, this.worldDepth - 1);
		geometry.rotateX(-Math.PI / 2);

		const vertices = geometry.attributes.position.array;
		for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
			vertices[j + 1] = data[i];
		}

		this.texture = new THREE.CanvasTexture(this.generateTexture(data, this.worldWidth, this.worldDepth));
		this.texture.wrapS = THREE.ClampToEdgeWrapping;
		this.texture.wrapT = THREE.ClampToEdgeWrapping;
		this.texture.colorSpace = THREE.SRGBColorSpace;

		this.mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: this.texture }));
		this.scene.add(this.mesh);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.container.appendChild(this.renderer.domElement);

		this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
		this.controls.movementSpeed = 50;
		this.controls.lookSpeed = 0.1;
        this.controls.enableDamping = true;

		this.walls()

        this.animatedText = new AnimatedText(this.scene, new THREE.Vector3(70, 110, -550));

        this.stars = new Stars(this.scene, 50);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1); // soft white light
        this.scene.add(ambientLight);
		
        this.loadModel = new ObjectManager(this.scene);

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

	async loadModelsInCircle() {
		const modelPaths = [
			{ path: './3d/img/postament.glb', position: { x: 250, y: 73, z: -625 }, rotation: Math.PI, collision: true },
			{ path: './3d/img/temple/scene.gltf', position: { x: 250, y: 43, z: -830 }, rotation: Math.PI, collision: true },
			{ path: './3d/img/temple1/scene1.gltf', position: { x: 250, y: 43, z: -1100 }, rotation: -Math.PI / 4, collision: true },
			{ path: './3d/img/torch/torch.gltf', position: { x: 10, y: 65, z: -1050 }, rotation: Math.PI / 1.5, collision: false },
			{ path: './3d/img/throne/throne.gltf', position: { x: -120, y: 70, z: -670 }, rotation: Math.PI / 1.5, collision: true },
			{ path: './3d/img/roman.glb', position: { x: -130, y: 57, z: -920 }, rotation: Math.PI / 2.5, collision: true },
			{ path: './3d/img/diane.glb', position: { x: 240, y: 57, z: -1120 }, rotation: Math.PI, collision: true },
			{ path: './3d/img/david.glb', position: { x: 270, y: 57, z: -1080 }, rotation: Math.PI * 1.5, collision: true },
			{ path: './3d/img/stand.glb', position: { x: -284, y: 75, z: -974 }, rotation: Math.PI / 2.5, collision: true },
			{ path: './3d/img/shelf/shelf.gltf', position: { x: -372, y: 73, z: -935 }, rotation: Math.PI / 2.5, collision: true },
			{ path: './3d/img/shelf/shelf.gltf', position: { x: -350, y: 73, z: -995 }, rotation: Math.PI / 2.5, collision: true },
			{ path: './3d/img/shelf/shelf.gltf', position: { x: -330, y: 73, z: -1050 }, rotation: Math.PI / 2.5, collision: true },
			{ path: './3d/img/stairs/stairs.gltf', position: { x: 150, y: 73, z: -700 }, rotation: Math.PI / 2, collision: true }
		];

		const imageLoadPromises = this.paths.map(path => this.loadModel.loadImages(path));
		const modelLoadPromises = modelPaths.map(model => this.loadModel.loadModel(model.path, model.position, model.rotation, model.collision));
		await Promise.all([...imageLoadPromises, ...modelLoadPromises]);
		
		const torchPosition = { x: 10, y: 110, z: -1050 };
		const pointLight = new THREE.PointLight(0xffa500, 1, 200);
		pointLight.position.set(torchPosition.x, torchPosition.y + 10, torchPosition.z);
		this.scene.add(pointLight);
		const spriteMap = new THREE.TextureLoader().load('3d/img/light.png');
		const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffa500 });
		this.sprite = new THREE.Sprite(spriteMaterial);
		this.sprite.position.set(torchPosition.x, torchPosition.y, torchPosition.z);
		this.sprite.scale.set(80, 80, 1);
		this.scene.add(this.sprite);
	}

	async loadResources() {
		try {
			await new Promise((resolve, reject) => {
				this.characterManager = new CharacterManager(this.scene, this.camera, "demon", new THREE.Vector3(250, 57, -1100), Math.PI*1.7, new THREE.Vector3(0.15, 0.15, 0.15));
				this.characterManagerSeat = new CharacterManager(this.scene, this.camera, "knight", new THREE.Vector3(-107, 76, -677), Math.PI/1.4, new THREE.Vector3(0.3, 0.3, 0.3));
				console.log("Resources loaded successfully");
				resolve();
			});
		} catch (error) {
			console.error("Error loading resources:", error);
			throw error;
		}
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.controls.handleResize();
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
		context.fillStyle = '#000';
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

			imageData[i] = (32 + shade * 64) * (0.2 + data[j] * 0.01);  // Adjusted for darker texture
			imageData[i + 1] = (32 + shade * 64) * (0.2 + data[j] * 0.01);
			imageData[i + 2] = (32 + shade * 64) * (0.2 + data[j] * 0.01);
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
			const v = ~~(Math.random() * 5);
			imageDataScaled[i] += v;
			imageDataScaled[i + 1] += v;
			imageDataScaled[i + 2] += v;
		}

		contextScaled.putImageData(imageScaled, 0, 0);

		return canvasScaled;
	}

	walls() {
        let wallGeometry = new THREE.CylinderGeometry(800, 800, 150, 16, 16, true);
        let wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0 });
        this.wall = new THREE.Mesh(wallGeometry, wallMaterial);
        this.wall.position.set(81, 60, -800);
        this.scene.add(this.wall);
    }

    collision(){
        this.velocityY -= this.gravity * this.clock.getDelta();
		const deltaMove = new THREE.Vector3(0, this.velocityY, 0);
		const raycaster = new THREE.Raycaster(this.camera.position, deltaMove.clone().normalize());
		const intersects = raycaster.intersectObject(this.mesh);

		if (intersects.length > 0) {
			const distance = intersects[0].distance;
			const collisionPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(distance));
			this.camera.position.y = collisionPoint.y + 30;
			this.velocityY = 0;
		}
		else {
			this.camera.position.add(deltaMove);
		}
    }

	collideWithModel(model) {
		if (model) {
			const directions = [
				new THREE.Vector3(1, 0, 0), // Right
				new THREE.Vector3(-1, 0, 0), // Left
				new THREE.Vector3(0, 0, 1), // Forward
				new THREE.Vector3(0, 0, -1) // Backward
			];
	
			for (const direction of directions) {
				const raycaster = new THREE.Raycaster(this.camera.position, direction.clone().normalize());
				const intersects = raycaster.intersectObject(model, true);
	
				if (intersects.length > 0 && intersects[0].distance < 15) {
					// Check if it's stairs - allow vertical movement
					if (model === this.loadModel.stairs) {
						return this.handleStairsCollision(intersects[0], direction);
					}
					
					// Normal collision - block movement
					this.camera.position.copy(this.previousCameraPosition);
					if(this.mobile) this.mobile.ifCollision = true;
					return true;
				}
			}
		}
		return false;
	}

	handleStairsCollision(intersection, direction) {
		const stairHeight = 3; // Height of each stair step
		const stairDepth = 5; // Depth of each stair step
		
		// Calculate which step the player is on
		const relativePosition = intersection.point.clone().sub(this.loadModel.stairs.position);
		const stepNumber = Math.floor(Math.abs(relativePosition.z) / stairDepth);
		const targetHeight = this.loadModel.stairs.position.y + (stepNumber * stairHeight) + 30;
		
		// Smooth height transition for stairs
		if (Math.abs(this.camera.position.y - targetHeight) > 2) {
			const newY = THREE.MathUtils.lerp(this.camera.position.y, targetHeight, 0.1);
			this.camera.position.y = newY;
		}
		
		// Allow horizontal movement along stairs
		const allowedDistance = 12;
		if (intersection.distance < allowedDistance) {
			// Only block if too close horizontally, but allow stair climbing
			if (direction.y === 0) { // Only horizontal directions
				const horizontalDistance = new THREE.Vector2(
					intersection.point.x - this.camera.position.x,
					intersection.point.z - this.camera.position.z
				).length();
				
				if (horizontalDistance < 8) {
					this.camera.position.copy(this.previousCameraPosition);
					return true;
				}
			}
		}
		
		return false;
	}

	// Enhanced collision system for all models
	checkAllCollisions() {
		let hasCollision = false;
		
		// Check collision with walls
		if (this.collideWithModel(this.wall)) hasCollision = true;
		
		// Check collision with all loaded models
		if (this.loadModel.postament && this.collideWithModel(this.loadModel.postament)) hasCollision = true;
		if (this.loadModel.temple && this.collideWithModel(this.loadModel.temple)) hasCollision = true;
		if (this.loadModel.temple1 && this.collideWithModel(this.loadModel.temple1)) hasCollision = true;
		if (this.loadModel.throne && this.collideWithModel(this.loadModel.throne)) hasCollision = true;
		if (this.loadModel.roman && this.collideWithModel(this.loadModel.roman)) hasCollision = true;
		if (this.loadModel.diane && this.collideWithModel(this.loadModel.diane)) hasCollision = true;
		if (this.loadModel.david && this.collideWithModel(this.loadModel.david)) hasCollision = true;
		if (this.loadModel.stand && this.collideWithModel(this.loadModel.stand)) hasCollision = true;
		if (this.loadModel.shelf && this.collideWithModel(this.loadModel.shelf)) hasCollision = true;
		
		// Special handling for stairs
		if (this.loadModel.stairs) {
			this.collideWithModel(this.loadModel.stairs);
		}
		
		return hasCollision;
	}

	appear(symbol, opacity){
		document.getElementById("back").style.zIndex = `${symbol}`;
		if(!this.ifMobile()){
			this.book.style.zIndex = `${symbol}`;
			this.book.style.opacity = `${opacity}`;
		} else if(this.ifMobile()){
			let carouselImages = document.querySelectorAll('.carousel-image');
			for (let i = 0; i < carouselImages.length; i++) carouselImages[i].style.zIndex = `${symbol}`;

			let arrows = document.querySelectorAll('.arrow');
			for (let i = 0; i < arrows.length; i++) arrows[i].style.zIndex = `${symbol}`;

			let imgs = document.querySelectorAll('.mobile-button');
			for (let i = 0; i < imgs.length; i++) imgs[i].style.zIndex = `${symbol * -1}`;
		}
	}

	standMove() {
		if (this.loadModel.stand && !this.isMoving) {
			const standModel = this.loadModel.stand;
			const distance = this.camera.position.distanceTo(standModel.position);
	
			if (distance < 40) {
				this.isMoving = true;
				
				if(this.mobile) this.mobile.ifCollision = true;
				this.controls.enabled = false;
				const newPosition = new THREE.Vector3(standModel.position.x + 4, standModel.position.y + 35, standModel.position.z + 1);
				const lookAtTarget = new THREE.Vector3(standModel.position.x, standModel.position.y + 26, standModel.position.z - 0.3);
	
				TWEEN.removeAll();
	
				new TWEEN.Tween(this.camera.position)
					.to(newPosition, 2000)
					.easing(TWEEN.Easing.Quadratic.Out)
					.onUpdate(() => {
						this.camera.lookAt(lookAtTarget);
					})
					.onComplete(() => {
						this.appear(999, 1);
					})
					.start();
			}
		}
	}

	moveCameraBack() {
		if (this.isMoving) {						
			if (!this.ifMobile()) this.controls.enabled = true;
			if (this.mobile) this.mobile.ifCollision = false;
			this.appear(-100, 0);
	
			this.book.style.zIndex = "-10";
			this.book.style.opacity = "0";
	
			const backDistance = 50;
			const backwardVector = this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-backDistance);
			const newPosition = this.camera.position.clone().add(backwardVector);
	
			TWEEN.removeAll();
	
			new TWEEN.Tween(this.camera.position)
				.to({ x: -200, y: 85, z: -974 }, 500)
				.easing(TWEEN.Easing.Quadratic.Out)
				.onUpdate(() => {
					this.camera.lookAt(new THREE.Vector3(0, 0, 0));
					this.camera.updateProjectionMatrix();
				})
				.onComplete(() => {
					this.isMoving = false;
					if (this.mobile) {
						this.mobile.stopMoving();
						this.mobile.stopTurning();
					}
				})
				.start();
		}
	}

	hideLoadingScreen() {
		const loadingScreen = document.getElementById('loadingScreen');
		loadingScreen.style.display = 'none';
	}

	startRendering() {
		this.renderer.setAnimationLoop(() => this.animate());
	}
	
	animate() {
		this.previousCameraPosition.copy(this.camera.position);
		this.render();
	}

    render() {
        const delta = this.clock.getDelta();
		this.controls.update(delta);
		this.sprite.lookAt(this.camera.position);
		if (this.characterManager) {
            this.characterManager.update(delta);
        }
		if (this.characterManagerSeat) {
            this.characterManagerSeat.update(delta);
        }

		if (this.moveForward) this.camera.translateZ(-this.controls.movementSpeed * delta);
        if (this.moveBackward) this.camera.translateZ(this.controls.movementSpeed * delta);
		
		// Set the rotation speed
		this.controls.rotationSpeed = Math.PI / 4; // 45 degrees per second

		// Rotate the camera based on input
		if (this.moveRight) {
			this.camera.rotation.y += this.controls.rotationSpeed * delta;
		}
		if (this.moveLeft) {
			this.camera.rotation.y -= this.controls.rotationSpeed * delta;
		}

		if(this.mobile) this.mobile.ifCollision = false;
        this.collision();
		
		// Use enhanced collision system
		this.checkAllCollisions();
 
		this.standMove()
		
		//console.log(this.camera.position)
        this.animatedText.update();
		TWEEN.update();
		this.renderer.render(this.scene, this.camera);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const terrainScene = new TerrainScene();
});
