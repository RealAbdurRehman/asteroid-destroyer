import * as THREE from "three";
import { createHitbox } from "../utils.js";

export default class Projectile {
  constructor({ position = { x: 0, y: 0, z: 0 }, velocity = -0.075 }) {
    this.position = position;
    this.velocity = velocity;
    this.projectile = this.createProjectile();
    this.hitboxDimensions = { width: 0.2, height: 0.2, depth: 1.5 };
    this.hitbox = this.createHitbox({
      width: this.hitboxDimensions.width,
      height: this.hitboxDimensions.height,
      depth: this.hitboxDimensions.depth,
    });
    this.hitboxFaces = {
      top: this.hitbox.position.y + this.hitboxDimensions.height * 0.5,
      bottom: this.hitbox.position.y - this.hitboxDimensions.height * 0.5,
      left: this.hitbox.position.x - this.hitboxDimensions.width * 0.5,
      right: this.hitbox.position.x + this.hitboxDimensions.width * 0.5,
      front: this.hitbox.position.z - this.hitboxDimensions.depth * 0.5,
      back: this.hitbox.position.z + this.hitboxDimensions.depth * 0.5,
    };
  }
  createHitbox({ width = 1, height = 1, depth = 1 }) {
    const hitbox = createHitbox(width, height, depth);
    hitbox.position.set(
      this.projectile.position.x,
      this.projectile.position.y,
      this.projectile.position.z
    );
    hitbox.rotateY(THREE.MathUtils.degToRad(90));
    return hitbox;
  }
  createProjectile() {
    const projectileGeometry = new THREE.CapsuleGeometry(0.05, 1.5, 10, 10);
    const projectileMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xcc0000,
      roughness: 0.3,
      metalness: 0.8,
    });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    projectile.position.set(this.position.x, this.position.y, this.position.z);
    projectile.rotateZ(THREE.MathUtils.degToRad(90));
    return projectile;
  }
  updateHitbox() {
    this.hitbox.position.set(
      this.projectile.position.x,
      this.projectile.position.y,
      this.projectile.position.z
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
  remove(scene) {
    scene.remove(this.projectile);
    this.projectile.geometry.dispose();
    this.projectile.material.dispose();
    scene.remove(this.hitbox);
    this.hitbox.geometry.dispose();
    this.hitbox.material.dispose();
  }
  update(deltaTime) {
    this.projectile.position.x += this.velocity * deltaTime;
    this.updateHitbox();
  }
}