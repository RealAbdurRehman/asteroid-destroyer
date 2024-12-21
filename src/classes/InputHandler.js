export default class InputHandler {
  constructor() {
    this.keys = [];
    this.intervalId = null;
    window.addEventListener("keydown", ({ code }) => {
      if (
        (code === "KeyW" ||
          code === "KeyS" ||
          code === "KeyA" ||
          code === "KeyD" ||
          code === "Space") &&
        !this.keys.includes(code)
      ) {
        this.keys.push(code);
      }
    });
    window.addEventListener("keyup", ({ code }) => {
      if (
        code === "KeyW" ||
        code === "KeyS" ||
        code === "KeyA" ||
        code === "KeyD" ||
        code === "Space"
      ) {
        this.keys.splice(this.keys.indexOf(code), 1);
      }
    });
  }
}