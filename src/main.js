import p5 from "p5";
import fontUrl from "./assets/fonts/LibreBaskerville-Italic.ttf";
import { CANVAS_SIZE, CELL_SIZE, COLS, ROWS, FONT_SIZE, BG_COLOR, FG_COLOR, STEPS_PER_FRAME, DX, DY } from "./config.js";
import { saveHighRes } from "./utils.js";

const HISTORY_SIZE = 200;

const sketch = (p) => {
  let font;
  let grid;
  let ant;
  let running = false;
  let currentLetter = "A";

  // ---- History ----
  let history = [];

  function snapshotState() {
    history.push({ grid: grid.map((col) => col.slice()), ant: { ...ant } });
    if (history.length > HISTORY_SIZE) history.shift();
  }

  function restoreState(snapshot) {
    grid = snapshot.grid.map((col) => col.slice());
    ant = { ...snapshot.ant };
  }

  function tickBatch() {
    snapshotState();
    for (let i = 0; i < STEPS_PER_FRAME; i++) tick();
  }

  // ---- Setup ----
  p.setup = async () => {
    const canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent("sketch-container");
    canvas.elt.addEventListener("keydown", (e) => {
      if ([37, 39].includes(e.keyCode)) e.preventDefault();
    });
    canvas.elt.setAttribute("tabindex", "0");
    canvas.elt.focus();
    p.noLoop();
    font = await p.loadFont(fontUrl);
    reset();
    p.loop();
  };

  // ---- Draw ----
  p.draw = () => {
    if (running) tickBatch();
    render();
  };

  // ---- Input ----
  p.keyPressed = () => {
    if (p.key === " ") {
      running = !running;
      return false;
    }
    if (p.key === "/") {
      saveHighRes(p, grid, currentLetter);
      return false;
    }
    if (!running && p.keyCode === 39) {
      console.log("RIGHT", "history:", history.length);
      tickBatch();
      p.redraw();
      return false;
    }
    if (!running && p.keyCode === 37) {
      console.log("LEFT", "history:", history.length);
      if (history.length > 0) {
        restoreState(history.pop());
        p.redraw();
      }
      return false;
    }
    if (p.key.length === 1 && /[a-zA-Z0-9]/.test(p.key)) {
      currentLetter = p.key.toUpperCase();
      reset();
    }
  };

  // ---- Core ----
  function reset() {
    running = false;
    history = [];
    seedGrid(currentLetter);
    spawnAnt();
  }

  function seedGrid(letter) {
    grid = Array.from({ length: COLS }, () => new Uint8Array(ROWS));

    const buf = p.createGraphics(CANVAS_SIZE, CANVAS_SIZE);
    buf.pixelDensity(1);
    buf.background(255);
    buf.fill(0);
    buf.noStroke();
    buf.textFont(font);
    buf.textSize(FONT_SIZE);
    buf.textAlign(p.CENTER, p.CENTER);
    buf.text(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    buf.loadPixels();

    const px = buf.pixels;
    const w = buf.width;

    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const cx = col * CELL_SIZE + Math.floor(CELL_SIZE / 2);
        const cy = row * CELL_SIZE + Math.floor(CELL_SIZE / 2);
        const idx = (cy * w + cx) * 4;
        const luma = (px[idx] + px[idx + 1] + px[idx + 2]) / 3;
        grid[col][row] = luma < 128 ? 1 : 0;
      }
    }

    buf.remove();
  }

  function spawnAnt() {
    ant = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
      dir: Math.floor(Math.random() * 4),
    };
  }

  function tick() {
    const cell = grid[ant.x][ant.y];
    ant.dir = cell === 0 ? (ant.dir + 1) % 4 : (ant.dir + 3) % 4;
    grid[ant.x][ant.y] = cell === 0 ? 1 : 0;
    ant.x = (ant.x + DX[ant.dir] + COLS) % COLS;
    ant.y = (ant.y + DY[ant.dir] + ROWS) % ROWS;
  }

  function render() {
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        p.fill(grid[col][row] === 1 ? FG_COLOR : BG_COLOR);
        p.noStroke();
        p.rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
    const antColor = grid[ant.x][ant.y] === 1 ? BG_COLOR : FG_COLOR;
    p.fill(antColor);
    p.rect(ant.x * CELL_SIZE, ant.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
};

new p5(sketch);
