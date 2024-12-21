import * as THREE from "three";

export class Explosion {
  constructor({ scene, radius, position = { x: 0, y: 0, z: 0 } }) {
    this.scene = scene;
    this.radius = radius;
    this.position = position;
    this.size = (Math.random() * 2 + 2) * this.radius;
    this.geometry = new THREE.PlaneGeometry(this.size, this.size);
    this.material = this.createMaterial();
    this.explosion = new THREE.Mesh(this.geometry, this.material);
    this.light = this.createLight();
    this.soundSrc = "/public/Audio/explosion.flac";
    this.init();
  }
  init() {
    this.explosion.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );
    this.explosion.rotateY(THREE.MathUtils.degToRad(90));
    this.scene.add(this.explosion);
    this.scene.add(this.light);
    const sound = new Audio(this.soundSrc);
    sound.play();
  }
  remove() {
    this.scene.remove(this.explosion);
    this.explosion.geometry.dispose();
    this.explosion.material.dispose();
    this.scene.remove(this.light);
  }
  createLight() {
    const light = new THREE.PointLight(
      0xffaa00,
      Math.random() * this.radius + 1
    );
    light.position.set(this.position.x, this.position.y, this.position.z);
    return light;
  }
  createMaterial() {
    const textureLoader = new THREE.TextureLoader();
    const explosionTexture = textureLoader.load("/explosion.png");
    const material = new THREE.MeshBasicMaterial({
      map: explosionTexture,
      transparent: true,
      depthWrite: false,
    });
    return material;
  }
  update() {
    this.material.opacity -= 0.1;
  }
}