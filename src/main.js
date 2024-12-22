import * as THREE from "three";
import Player from "./classes/Player.js";
import Debris from "./classes/Debris.js";
import UiHandler from "./classes/UiHandler.js";
import { Asteroid } from "./classes/Enemies.js";
import { Explosion } from "./classes/Explosion.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";
import { DifficultyManager } from "./classes/DifficultyManager.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { checkCollision, playMusic, moveBackground } from "./utils.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

moveBackground();

let enemies = [];
let explosions = [];
let debrisArray = [];

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x111111, 0.0025);

const exrLoader = new EXRLoader();
exrLoader.load("/background.exr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.rotation.y = THREE.MathUtils.degToRad(90);
camera.position.set(15, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 10));

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,
  0.4,
  0.5
);
composer.addPass(bloomPass);

const colorGradingPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      saturation: { value: 1.2 },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float saturation;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec3 saturatedColor = mix(vec3(gray), color.rgb, saturation);
      gl_FragColor = vec4(saturatedColor, color.a);
    }
  `,
  })
);
composer.addPass(colorGradingPass);

const copyPass = new ShaderPass(CopyShader);
copyPass.renderToScreen = true;
composer.addPass(copyPass);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function spawnEnemies(deltaTime) {
  const { enemyInterval } = difficultyManager.update(deltaTime);
  if (timeToNewEnemy >= enemyInterval) {
    const position = {
      x: -500,
      y: Math.random() * (player.boundaries.y * 2) - player.boundaries.y,
      z: Math.random() * (player.boundaries.x * 2) - player.boundaries.x,
    };
    const velocity = difficultyManager.getEnemyVelocity();
    const enemy = new Asteroid(scene, { position, velocity });
    enemies.push(enemy);
    enemy.init();
    timeToNewEnemy = 0;
  } else {
    timeToNewEnemy += deltaTime;
  }
}

function spawnDebris(enemy) {
  const debrisAmmount = Math.random() * 10 + 20;
  for (let i = 0; i < debrisAmmount * enemy.radius; i++) {
    const debrisToPush = new Debris(scene, enemy.radius, {
      position: {
        x: enemy.position.x,
        y: enemy.position.y,
        z: enemy.position.z,
      },
      material: enemy.material,
    });
    debrisArray.push(debrisToPush);
  }
}

function createExplosion(enemy) {
  explosions.push(
    new Explosion({
      scene,
      radius: enemy.radius,
      position: {
        x: enemy.position.x,
        y: enemy.position.y,
        z: enemy.position.z,
      },
    })
  );
}

function stopGame() {
  uiHandler.interactiveElements.gameOver.style.display = "block";
  gameOver = true;
  enemies.forEach((enemy) => enemy.remove());
  explosions.forEach((explosion) => explosion.remove());
  debrisArray.forEach((debris) => debris.remove());
  player.remove();
}

function init() {
  gameOver = false;
  player = new Player(scene, camera);
  enemies = [];
  explosions = [];
  debrisArray = [];
  animate(0);
  playMusic();
}

let player = null;
const difficultyManager = new DifficultyManager();
const uiHandler = new UiHandler({ startGame: init });

let lastTime = 0;
let gameOver = false;
let timeToNewEnemy = 0;
function animate(timestamp) {
  if (gameOver) return;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  if (player.model) {
    player.update(deltaTime);
    spawnEnemies(deltaTime);
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      if (enemy.position.x >= 50) {
        enemy.remove();
        enemies.splice(i, 1);
        continue;
      }
      enemy.update();
      for (let j = player.projectiles.length - 1; j >= 0; j--) {
        const projectile = player.projectiles[j];
        const projectileCollision = checkCollision(
          enemy.hitboxFaces,
          projectile.hitboxFaces
        );
        if (
          projectileCollision.x &&
          projectileCollision.y &&
          projectileCollision.z
        ) {
          createExplosion(enemy);
          enemy.remove(scene);
          enemies.splice(i, 1);
          projectile.remove(scene);
          player.projectiles.splice(j, 1);
          spawnDebris(enemy);
          break;
        }
      }
      const playerCollision = checkCollision(
        player.hitboxFaces,
        enemy.hitboxFaces
      );
      if (playerCollision.x && playerCollision.y && playerCollision.z) {
        stopGame();
        break;
      }
    }
    debrisArray.forEach((debris, debrisIndex) => {
      if (debris.material.opacity <= 0) {
        debris.remove();
        debrisArray.splice(debrisIndex, 1);
      } else debris.update();
    });
    explosions.forEach((explosion, explosionIndex) => {
      if (explosion.material.opacity <= 0) {
        explosion.remove();
        explosions.splice(explosionIndex, 1);
      } else explosion.update();
    });
  }
  composer.render();
  requestAnimationFrame(animate);
}