import * as THREE from "three";

export default class Debris {
  constructor(
    scene,
    radius,
    {
      position = { x: 0, y: 0, z: 0 },
      material = new THREE.MeshBasicMaterial({ color: "green", transparent: true, opacity: 1 }),
    }
  ) {
    this.scene = scene;
    this.radius = radius;
    this.position = position;
    this.velocity = {
      x: Math.random() * 0.9 - 0.45,
      y: Math.random() * 0.9 - 0.45,
      z: Math.random() * 0.9 - 0.45,
    };
    this.material = material;
    this.model = this.createModel();
    this.init();
  }
  init() {
    this.model.position.set(this.position.x, this.position.y, this.position.z);
    this.scene.add(this.model);
  }
  createModel() {
    const radius = this.radius * (Math.random() * 0.1 + 0.05);
    const detailIcosahedron = Math.floor(Math.random() * 5);
    const detailOctahedron = Math.floor(Math.random() * 4 + 1);
    const geometry =
      Math.random() > 5
        ? new THREE.IcosahedronGeometry(radius, detailIcosahedron)
        : new THREE.OctahedronGeometry(radius, detailOctahedron);
    const debris = new THREE.Mesh(geometry, this.material);
    return debris;
  }
  move() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;
    this.model.position.set(this.position.x, this.position.y, this.position.z);
  }
  remove() {
    this.scene.remove(this.model);
    this.model.geometry.dispose();
    this.model.material.dispose();
  }
  update() {
    this.move();
    this.material.opacity -= 0.0001;
  }
}