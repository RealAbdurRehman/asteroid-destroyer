export class DifficultyManager {
  constructor() {
    this.enemyInterval = 500;
    this.minEnemyInterval = 25;
    this.baseEnemySpeed = 1;
    this.maxEnemySpeed = 10;
    this.difficultyInterval = 5000;
    this.elapsedTime = 0;
  }
  update(deltaTime) {
    this.elapsedTime += deltaTime;
    this.enemyInterval = Math.max(
      this.minEnemyInterval,
      500 - (this.elapsedTime / 1000) * 2
    );
    const speedIncrease = Math.min(
      (this.elapsedTime / 1000) * 0.01,
      this.maxEnemySpeed - this.baseEnemySpeed
    );
    return {
      enemyInterval: this.enemyInterval,
      enemySpeed: this.baseEnemySpeed + speedIncrease,
    };
  }
  getEnemyVelocity() {
    const { enemySpeed } = this.update(0);
    return {
      x: Math.random() * 3.25 + enemySpeed,
      y: 0,
      z: 0,
    };
  }
}