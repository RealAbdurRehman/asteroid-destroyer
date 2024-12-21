import * as THREE from "three";

export function adjustCamera(camera, player) {
  if (player.model) camera.lookAt(player.model.position);
}

export function checkCollision(box1, box2) {
  return {
    x: box1.right >= box2.left && box1.left <= box2.right,
    y: box1.top >= box2.bottom && box1.bottom <= box2.top,
    z: box1.front <= box2.back && box1.back >= box2.front,
  };
}

export function createHitbox(width, height, depth) {
  const hitboxGeometry = new THREE.BoxGeometry(width, height, depth);
  const hitboxMaterial = new THREE.MeshBasicMaterial({ color: "red" });
  const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
  hitbox.visible = false;
  return hitbox;
}

export function playMusic() {
  const backgroundMusic = new Audio("/public/Audio/background.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.play();
}
export function moveBackground() {
  const parallax = document.querySelector("#start-game");
  const lightEffect = document.querySelector("#light-effect");

  document.addEventListener("mousemove", ({ clientX, clientY }) => {
    const mouseX = clientX;
    const mouseY = clientY;
    const moveX = (mouseX / window.innerWidth) * 30;
    const moveY = (mouseY / window.innerHeight) * 30;
    parallax.style.backgroundPosition = `${moveX}% ${moveY}%`;
    const lightMoveX = (mouseX / window.innerWidth - 0.5) * 10;
    const lightMoveY = (mouseY / window.innerHeight - 0.5) * 10;
    lightEffect.style.transform = `translate(${lightMoveX}px, ${lightMoveY}px)`;
  });
}