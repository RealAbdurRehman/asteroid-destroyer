import * as THREE from "three";
import Projectile from "./Projectile.js";
import { createHitbox } from "../utils.js";
import InputHandler from "./InputHandler.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class Player {
  constructor(scene, camera) {
    this.model = null;
    this.scene = scene;
    this.camera = camera;
    this.cameraConfig = {
      offset: new THREE.Vector3(15, 5, 0),
      lookAtOffset: new THREE.Vector3(2, 0, 0),
      lerpFactor: 0.075,
      tiltFactor: 0.3,
      lateralTiltFactor: 0.5,
      defaultZ: 0,
    };
    this.camera.position.copy(this.cameraConfig.offset);
    this.cameraTarget = new THREE.Vector3();
    this.lookAtTarget = new THREE.Vector3();
    this.input = new InputHandler(this);
    this.velocity = { y: 0, z: 0 };
    this.rotation = {
      x: { max: 0.4, min: -0.4 },
      z: { max: 0.4, min: -0.4 },
    };
    this.grip = 0.98;
    this.maxSpeed = 2;
    this.tiltSpeed = 0.015;
    this.deceleration = 0.001;
    this.acceleration = 0.0075;
    this.hitboxDimensions = { width: 4.5, height: 1, depth: 2 };
    this.hitbox = createHitbox(
      this.hitboxDimensions.width,
      this.hitboxDimensions.height,
      this.hitboxDimensions.depth
    );
    this.hitboxFaces = {
      top: this.hitbox.position.y + this.hitboxDimensions.height * 0.5,
      bottom: this.hitbox.position.y - this.hitboxDimensions.height * 0.5,
      left: this.hitbox.position.x - this.hitboxDimensions.width * 0.5,
      right: this.hitbox.position.x + this.hitboxDimensions.width * 0.5,
      front: this.hitbox.position.z - this.hitboxDimensions.depth * 0.5,
      back: this.hitbox.position.z + this.hitboxDimensions.depth * 0.5,
    };
    this.projectiles = [];
    this.timeToNewProjectile = 0;
    this.projectileInterval = 150;
    this.boundaries = {
      x: 19,
      y: 19,
    };
    this.soundSrcs = this.createSoundSrcs();
    this.engineSound = new Audio(this.soundSrcs.engine);
    this.init();
  }
  init() {
    const loader = new GLTFLoader();
    loader.load("/Player/scene.gltf", (gltf) => {
      this.model = gltf.scene;
      this.model.scale.set(0.1, 0.1, 0.1);
      this.model.rotation.set(0, Math.PI, 0);
      this.scene.add(this.model);
      this.hitbox.position.x = 2.5;
      this.hitbox.position.set(
        this.model.position.x,
        this.model.position.y,
        this.model.position.z
      );
      this.scene.add(this.hitbox);
    });
    this.engineSound.volume = 0.25;
    this.engineSound.loop = true;
    this.engineSound.play();
  }
  createSoundSrcs() {
    return {
      shoot: "/Audio/shoot.wav",
      engine: "/Audio/engine.wav",
    };
  }
  update(deltaTime) {
    if (this.model) {
      this.handleInput(deltaTime);
      this.move();
      this.updateHitbox();
      this.updateProjectiles(deltaTime);
      this.updateCamera();
    }
  }
  updateCamera() {
    if (!this.model) return;
    this.cameraTarget.copy(this.model.position).add(this.cameraConfig.offset);
    const movementTilt = new THREE.Vector3(
      0,
      this.velocity.y * this.cameraConfig.tiltFactor,
      this.velocity.z * this.cameraConfig.tiltFactor
    );
    const lateralOffset = new THREE.Vector3(
      0,
      0,
      this.velocity.z * this.cameraConfig.lateralTiltFactor
    );
    this.cameraTarget.add(movementTilt).add(lateralOffset);
    this.camera.position.lerp(this.cameraTarget, this.cameraConfig.lerpFactor);
    this.lookAtTarget
      .copy(this.model.position)
      .add(this.cameraConfig.lookAtOffset)
      .add(new THREE.Vector3(0, 0, this.velocity.z * 0.5));
    this.camera.lookAt(this.lookAtTarget);
  }
  updateHitbox() {
    this.hitbox.position.set(
      this.model.position.x + 2,
      this.model.position.y,
      this.model.position.z
    );
    this.hitboxFaces = {
      top: this.hitbox.position.y + this.hitboxDimensions.height * 0.5,
      bottom: this.hitbox.position.y - this.hitboxDimensions.height * 0.5,
      left: this.hitbox.position.x - this.hitboxDimensions.width * 0.5,
      right: this.hitbox.position.x + this.hitboxDimensions.width * 0.5,
      front: this.hitbox.position.z - this.hitboxDimensions.depth * 0.5,
      back: this.hitbox.position.z + this.hitboxDimensions.depth * 0.5,
    };
  }
  updateProjectiles(deltaTime) {
    this.projectiles.forEach((projectile, projectileIndex) => {
      if (projectile.projectile.position.x < -300) {
        projectile.remove(this.scene);
        this.projectiles.splice(projectileIndex, 1);
      } else projectile.update(deltaTime);
    });
  }
  shoot(deltaTime) {
    if (this.timeToNewProjectile >= this.projectileInterval) {
      const projectileRight = new Projectile({
        position: {
          x: this.model.position.x - 0.5,
          y: this.model.position.y - 0.275,
          z: this.model.position.z - 0.15,
        },
      });
      const projectileLeft = new Projectile({
        position: {
          x: this.model.position.x - 0.5,
          y: this.model.position.y - 0.275,
          z: this.model.position.z + 0.15,
        },
      });
      const projectileRightModel = projectileRight.projectile;
      const projectileLeftModel = projectileLeft.projectile;
      this.scene.add(projectileRightModel);
      this.scene.add(projectileRight.hitbox);
      this.scene.add(projectileLeftModel);
      this.scene.add(projectileLeft.hitbox);
      this.projectiles.push(projectileRight, projectileLeft);
      this.createMuzzleFlash(
        this.model.position.x - 0.5,
        this.model.position.y - 0.275,
        this.model.position.z - 0.15
      );
      this.createMuzzleFlash(
        this.model.position.x - 0.5,
        this.model.position.y - 0.275,
        this.model.position.z + 0.15
      );
      const sound = new Audio(this.soundSrcs.shoot);
      sound.volume = 0.5;
      sound.play();
      this.timeToNewProjectile = 0;
    } else this.timeToNewProjectile += deltaTime;
  }
  createMuzzleFlash(x, y, z) {
    const muzzleLight = new THREE.PointLight(0xffaa00, 2);
    muzzleLight.position.set(x, y, z);
    this.scene.add(muzzleLight);
    setTimeout(() => {
      let fadeOut = () => {
        if (muzzleLight.intensity > 0.1) {
          muzzleLight.intensity -= 0.1;
          requestAnimationFrame(fadeOut);
        } else {
          this.scene.remove(muzzleLight);
        }
      };
      fadeOut();
    }, 0);
  }
  handleInput(deltaTime) {
    if (this.input.keys.includes("Space")) this.shoot(deltaTime);
    if (this.input.keys.includes("KeyW")) {
      this.velocity.y = Math.min(
        this.velocity.y + this.acceleration,
        this.maxSpeed
      );
      if (this.model.rotation.z < this.rotation.z.max)
        this.model.rotation.z += this.tiltSpeed;
      this.cameraConfig.offset.y += 1;
    } else if (this.input.keys.includes("KeyS")) {
      this.velocity.y = Math.max(
        this.velocity.y - this.acceleration,
        -this.maxSpeed
      );
      if (this.model.rotation.z > this.rotation.z.min)
        this.model.rotation.z -= this.tiltSpeed;
      this.cameraConfig.offset.y -= 1;
    }
    if (this.input.keys.includes("KeyA")) {
      const speedFactor = 1 - (Math.abs(this.velocity.z) / this.maxSpeed) * 0.5;
      this.velocity.z = Math.min(
        this.velocity.z + this.tiltSpeed * speedFactor,
        this.maxSpeed * 0.75
      );
      if (this.model.rotation.x < this.rotation.x.max)
        this.model.rotation.x += this.tiltSpeed;
      this.cameraConfig.offset.z += 1;
    } else if (this.input.keys.includes("KeyD")) {
      const speedFactor = 1 - (Math.abs(this.velocity.y) / this.maxSpeed) * 0.5;
      this.velocity.z = Math.max(
        this.velocity.z - this.tiltSpeed * speedFactor,
        -this.maxSpeed * 0.75
      );
      if (this.model.rotation.x > this.rotation.x.min)
        this.model.rotation.x -= this.tiltSpeed;
      this.cameraConfig.offset.z -= 1;
    }
    this.cameraConfig.offset.y = THREE.MathUtils.clamp(
      this.cameraConfig.offset.y,
      3,
      7
    );
    this.cameraConfig.offset.z = THREE.MathUtils.clamp(
      this.cameraConfig.offset.z,
      -3,
      3
    );
    const epsilon = 0.0001;
    if (
      !this.input.keys.includes("KeyA") &&
      !this.input.keys.includes("KeyD")
    ) {
      this.cameraConfig.offset.z +=
        (this.cameraConfig.defaultZ - this.cameraConfig.offset.z) * 0.05;
      if (this.model.rotation.x > epsilon)
        this.model.rotation.x -= this.tiltSpeed;
      else if (this.model.rotation.x < -epsilon)
        this.model.rotation.x += this.tiltSpeed;
      else this.model.rotation.x = 0;
    }
    if (
      !this.input.keys.includes("KeyW") &&
      !this.input.keys.includes("KeyS")
    ) {
      this.cameraConfig.offset.y += (5 - this.cameraConfig.offset.y) * 0.05;
      if (this.model.rotation.z > epsilon)
        this.model.rotation.z -= this.tiltSpeed;
      else if (this.model.rotation.z < -epsilon)
        this.model.rotation.z += this.tiltSpeed;
      else this.model.rotation.z = 0;
    }
  }
  applyPhysics() {
    this.model.position.z += this.velocity.z;
    this.model.position.y += this.velocity.y;
    this.velocity.z *= this.grip;
    this.velocity.y *= this.grip;
    if (Math.abs(this.velocity.z) < 0.0001) this.velocity.z = 0;
    if (Math.abs(this.velocity.y) < 0.0001) this.velocity.y = 0;
  }
  handleBoundaries() {
    if (this.model.position.z >= this.boundaries.x) {
      this.model.position.setZ(this.boundaries.x);
      this.velocity.z = 0;
    } else if (this.model.position.z <= -this.boundaries.x) {
      this.model.position.setZ(-this.boundaries.x);
      this.velocity.z = 0;
    }
    if (this.model.position.y >= this.boundaries.y) {
      this.model.position.setY(this.boundaries.y);
      this.velocity.y = 0;
    } else if (this.model.position.y <= -this.boundaries.y) {
      this.model.position.setY(-this.boundaries.y);
      this.velocity.y = 0;
    }
  }
  move() {
    this.model.position.y += this.velocity.y;
    this.model.position.z += this.velocity.z;
    this.handleBoundaries();
  }
  remove() {
    this.engineSound.pause();
    this.scene.remove(this.model);
    this.scene.remove(this.hitbox);
    this.hitbox.geometry.dispose();
    this.hitbox.material.dispose();
    this.projectiles.forEach((projectile) => projectile.remove(this.scene));
  }
}