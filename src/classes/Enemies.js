import * as THREE from "three";
import { createHitbox } from "../utils.js";

class Enemy {
  constructor(
    scene,
    {
      position,
      velocity,
      model = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 32),
        new THREE.MeshStandardMaterial({ color: "green" })
      ),
      soundSrcs,
      hitboxDimensions = { width: 2, height: 2, depth: 2 },
    }
  ) {
    this.scene = scene;
    this.position = position;
    this.velocity = velocity;
    this.soundSrcs = soundSrcs;
    this.sound = new Audio(this.soundSrcs.passBy);
    this.muted = false;
    this.hitboxDimensions = hitboxDimensions;
    this.model = model;
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
    if (this.model) this.init();
  }
  init() {
    this.model.position.set(this.position.x, this.position.y, this.position.z);
    this.hitbox.position.set(
      this.model.position.x,
      this.model.position.y,
      this.model.position.z
    );
    this.scene.add(this.model);
    this.scene.add(this.hitbox);
  }
  updateHitbox() {
    this.hitbox.position.set(
      this.model.position.x,
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
  move() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;
    this.model.position.x = this.position.x;
    this.model.position.y = this.position.y;
    this.model.position.z = this.position.z;
    if (this.position.x >= 50 && !this.muted) {
      this.sound.play();
      this.muted = true;
    }
  }
  update() {
    if (this.model) {
      this.move();
      this.updateHitbox();
    }
  }
  remove() {
    this.scene.remove(this.model);
    this.model.geometry.dispose();
    this.model.material.dispose();
    this.scene.remove(this.hitbox);
    this.hitbox.geometry.dispose();
    this.hitbox.material.dispose();
  }
}

export class Asteroid extends Enemy {
  constructor(
    scene,
    { position = { x: 0, y: 0, z: 0 }, velocity = { x: 0, y: 0, z: 0 } }
  ) {
    const radius = Math.random() * 3 + 1;
    const detailIcosahedron = Math.floor(Math.random() * 5);
    const detailOctahedron = Math.floor(Math.random() * 4 + 1);
    const geometry =
      Math.random() > 5
        ? new THREE.IcosahedronGeometry(radius, detailIcosahedron)
        : new THREE.OctahedronGeometry(radius, detailOctahedron);
    const textureLoader = new THREE.TextureLoader();
    const aoTexture = textureLoader.load("/Asteroid Texture/ao.jpg");
    const colorTexture = textureLoader.load("/Asteroid Texture/color.jpg");
    const heightTexture = textureLoader.load("/Asteroid Texture/height.jpg");
    const normalTexture = textureLoader.load("/Asteroid Texture/normal.jpg");
    const roughnessTexture = textureLoader.load(
      "/Asteroid Texture/roughness.jpg"
    );
    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      aoMap: aoTexture,
      displacementMap: heightTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      roughness: 1.0,
      metalness: 0.5,
      transparent: true,
      opacity: 1,
    });
    const model = new THREE.Mesh(geometry, material);
    const hitboxDimensions = {
      width: radius * 2,
      height: radius * 2,
      depth: radius * 2,
    };
    const soundSrcs = { passBy: "/Audio/asteroid.wav" };
    super(scene, { position, velocity, model, soundSrcs, hitboxDimensions });
    this.radius = radius;
    this.material = material;
  }
}