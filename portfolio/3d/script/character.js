import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/FBXLoader.js";
import { AudioManager } from './audio.js'; // Adjust the path as needed

class CharacterManager {
    constructor(scene, camera, path, position, rotation, scale) {
        this.scene = scene;
        this.camera = camera;
        this.path = path;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.mixers = [];
        this.currentAction = null;
        this.currentMixer = null;
        this.animations = {};
        this.gravity = 9.8;
        this.velocityY = 0;
        this.model = null;

        this.subtitlesabout = [
            { startTime: 0, endTime: 6, text: "In the heart of Leipzig, a young programmer's journey intertwines technology with a touch of creativity." },
            { startTime: 6, endTime: 18, text: "This is the story of Dmitry Ganotskiy, a software engineering student with a passion for innovation, storytelling, and the endless possibilities of the digital world." },
            { startTime: 18, endTime: 26, text: "Dmitry's path began at the Slovak Technical University Stu, where he delved into the world of programming." },
            { startTime: 26, endTime: 34, text: "It was here that he first tasted the thrill of creating something from nothing, a browser game built with JavaScript and HTML." },
            { startTime: 34, endTime: 41, text: "The scene is set with Dmitry working late into the night on his computer, the screen reflecting his focused expression." },
            { startTime: 41, endTime: 50, text: "Close-ups of JavaScript code and snippets of his game flash across the screen, showcasing his dedication and burgeoning skills." },
            { startTime: 50, endTime: 59, text: "His academic journey continued at Lancaster University, Leipzig, where he pursued BSc in software engineering." },
            { startTime: 59, endTime: 79, text: "This period of intense learning and growth equipped him with a robust understanding of programming languages and sparked a keen interest in various facets of it, particularly in software development." },
            { startTime: 79, endTime: 86, text: "Dmitry's proficiency extended to 3D programming, with three JS where he engaged in game development exploring." },
            { startTime: 86, endTime: 96, text: "Areas such as ray tracing, coordinate and vector systems, and 3D object imports." },
            { startTime: 96, endTime: 106, text: "Beyond his technical abilities, Dmitry is an enthusiastic writer, engaging in the creation of novels, essays, reports, articles, and poetry." },
            { startTime: 106, endTime: 116, text: "This multidisciplinary skill set enables him to approach problems with creativity and analytical thinking, fostering innovative solutions in multiple domains within IT." },
            { startTime: 116, endTime: 138, text: "The documentary captures Dmitry in different settings, coding on his laptop, sketching out ideas in a notebook, and reading his creative writings aloud." },
            { startTime: 138, endTime: 149, text: "His voiceover narrates his passion for writing, describing how it complements his technical work by providing a creative outlet and a new perspective on problem solving." },
            { startTime: 149, endTime: 157, text: "Dmitry is drawn to opportunities that offer a challenging and collaborative environment to further develop his skills in software development." },
            { startTime: 157, endTime: 164, text: "His enthusiasm and commitment to innovation aligned perfectly with the goals of forward-thinking IT departments." },
            { startTime: 164, endTime: 173, text: "He dreams of contributing to a team that values growth and creativity as much as." },
            { startTime: 173, endTime: 179, text: "In his own words, he expresses his excitement about the prospect of joining such a team and making meaningful contributions." },
            { startTime: 179, endTime: 182, text: "The documentary concludes with a hopeful note highlighting Dmitry's contact information and his eagerness to discuss how his skills and experiences align with the goals of potential collaborators." },
            { startTime: 182, endTime: 200, text: "The final scene shows Dmitry gazing thoughtfully out of a window. The city of Leipzig, bustling with possibilities behind him." },
            { startTime: 200, endTime: 210, text: "The narrator signs off, leaving the audience with a sense of Dmitry's potential and the promising future that lies ahead for this passionate young programmer and writer." }
        ];
        this.subtitlesart = [
            { startTime: 0, endTime: 21, text: "Dmitry Ganotskiy is a multifaceted individual whose passion for art transcends multiple disciplines, weaving a rich tapestry of interests that fuel his creative soul. Inspired by the grand canvases of Rubens and the masterful brushstrokes of Rembrandt, Dmitry's appreciation for painting goes beyond mere admiration," },
            { startTime: 21, endTime: 28, text: "delving into the depths of color, light, and emotion that these masterpieces evoke." },
            { startTime: 28, endTime: 41, text: "His literary journey is equally profound, shaped by the narratives of Victor Hugo, Fyodor Dostoyevsky, Honoré de Balzac, and the timeless plays of Shakespeare." },
            { startTime: 41, endTime: 56, text: "These authors' explorations of the human condition resonate deeply with Dmitry, influencing his own ventures into writing and poetry, where he channels his thoughts and emotions into expressive prose and verse." },
            { startTime: 56, endTime: 66, text: "Dmitry's interests also span the dramatic realms of opera and ballet, where the fusion of music, movement, and storytelling captivates his imagination." },
            { startTime: 66, endTime: 79, text: "The grandeur of these performances, reminiscent of historical figures like Caesar and Napoleon, whose lives were filled with drama and ambition, parallels Dmitry's fascination with history." },
            { startTime: 79, endTime: 93, text: "This historical intrigue extends to his appreciation of monumental events and characters that have shaped the world, providing a rich source of inspiration for his creative projects." },
            { startTime: 93, endTime: 106, text: "Dmitry's admiration for the art of sculpture reveals his deep respect for the ability to mold raw materials into evocative forms, much like how he shapes words into compelling narratives." },
            { startTime: 106, endTime: 125, text: "His comprehensive engagement with these diverse art forms enriches his perspective, allowing him to approach both his technical work in software engineering and his creative pursuits with a unique blend of analytical thinking and artistic sensitivity." },
            { startTime: 125, endTime: 136, text: "This multidisciplinary passion not only fuels Dmitry's creativity, but also defines his approach to innovation, making him a vibrant and dynamic force in any collaborative environment." },
            { startTime: 136, endTime: 150, text: "His journey is a testament to the endless possibilities that arise when one draws inspiration from the vast expanse of human creativity and history." }
        ];

        this.subtitleDisplay = document.createElement('div');
        this.setupSubtitleDisplay();

        this.audioManager = new AudioManager(this.subtitlesabout, this.subtitleDisplay);

        this.loadModelAndAnimations();
    }

    loadModelAndAnimations() {
        const loader = new FBXLoader();

        if(this.path === "knight"){
            loader.load(`3d/hero/knight.fbx`, (object) => {
                object.scale.set(this.scale.x, this.scale.y, this.scale.z);
                object.position.set(this.position.x, this.position.y, this.position.z);
                object.rotation.y = this.rotation;
                this.scene.add(object);
                this.model = object;  // Store the model object

                const mixer = new THREE.AnimationMixer(object);
                this.mixers.push(mixer);
                this.currentMixer = mixer;

                const animLoader = new FBXLoader();

                animLoader.load(`3d/hero/seat.fbx`, (anim) => {
                    const action = mixer.clipAction(anim.animations[0]);
                    action.setLoop(THREE.LoopRepeat);
                    this.animations[this.initialAnimation] = action;
                    action.play();
                    this.currentAction = action;
                }, undefined, (error) => {
                    console.error('An error occurred while loading the animation:', error);
                });

            }, undefined, (error) => {
                console.error('An error occurred while loading the model:', error);
            });
        }
    }

    collisionCamera() {
        const distance = this.camera.position.distanceTo(this.position);
        const withinDistance = distance < 150;

        if (this.path === 'demon') {
            if (withinDistance) {
                console.log('An error occurred while')
                if (!this.audioManager.audioPlayed && !this.audioManager.audioPaused) {
                    this.audioManager.subtitles = this.subtitlesart
                    this.audioManager.playAudio("3d/sounds/art.mp3");
                    this.audioManager.audioPlayed = true;
                } else if (this.audioManager.audioPaused) {
                    this.audioManager.audio.play();
                    this.audioManager.audioPaused = false;
                }
            } else {
                this.audioManager.pauseAudio();
                this.audioManager.clearSubtitles();
            }
        } else if (this.path === 'knight' && this.currentAction) {
            if (withinDistance) {
                if (!this.audioManager.audioPlayed && !this.audioManager.audioPaused) {
                    this.audioManager.subtitles = this.subtitlesabout
                    this.audioManager.playAudio("3d/sounds/about.mp3");
                    this.audioManager.audioPlayed = true;
                } else if (this.audioManager.audioPaused) {
                    this.audioManager.audio.play();
                    this.audioManager.audioPaused = false;
                }
            } else {
                this.audioManager.pauseAudio();
                this.audioManager.clearSubtitles();
            }
        }
    }

    update(delta) {
        this.velocityY -= this.gravity * delta;

        if (this.model) {
            this.model.rotation.y = this.rotation;  // Apply y-axis rotation
        }

        this.collisionCamera();

        this.mixers.forEach(mixer => {
            mixer.update(delta);
        });
    }

    setupSubtitleDisplay() {
        this.subtitleDisplay.style.position = 'absolute';
        this.subtitleDisplay.style.bottom = '10px';
        this.subtitleDisplay.style.width = '100%';
        this.subtitleDisplay.style.textAlign = 'center';
        this.subtitleDisplay.style.color = '#ffffff';
        this.subtitleDisplay.style.fontSize = '20px';
        this.subtitleDisplay.style.fontFamily = 'Arial, sans-serif';
        this.subtitleDisplay.style.pointerEvents = 'none';
        this.subtitleDisplay.style.zIndex = "990";
        document.body.appendChild(this.subtitleDisplay);
    }
}

export { CharacterManager };
