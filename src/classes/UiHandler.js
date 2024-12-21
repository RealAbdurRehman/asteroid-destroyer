export default class UiHandler {
  constructor(functionsObj) {
    this.functions = functionsObj;
    this.interactiveElements = {
      gameOver: document.getElementById("game-over"),
      restart: document.getElementById("restart-btn"),
      startGame: document.getElementById("start-game"),
    };
    this.init();
  }
  init() {
    this.interactiveElements.startGame.addEventListener("click", () => {
      this.interactiveElements.startGame.style.display = "none";
      this.functions.startGame();
    });
    this.interactiveElements.restart.addEventListener("click", () => {
      this.interactiveElements.gameOver.style.display = "none";
      this.functions.startGame();
    });
  }
}