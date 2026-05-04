import p5 from "p5";
import fontUrl from "./assets/fonts/LibreBaskerville-Italic.ttf";
import { CANVAS_SIZE, CELL_SIZE, COLS, ROWS, FONT_SIZE, BG_COLOR, FG_COLOR, COLOR_A, COLOR_B, COLOR_LERP_DURATION, STEPS_PER_FRAME, DX, DY } from "./config.js";
import { saveHighRes } from "./utils.js";

const HISTORY_SIZE = 200;

// ---- Color helpers ----
function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

const RGB_A = hexToRgb(COLOR_A);
const RGB_B = hexToRgb(COLOR_B);

function currentLerpColor(f) {
  const t = (Math.sin((f / COLOR_LERP_DURATION) * Math.PI) + 1) / 2;
  return rgbToHex(lerpColor(RGB_A, RGB_B, t));
}

const sketch = (p) => {
  let font;
  // grid stores: null = OFF (bg), "fg" = seeded letter cell, or a hex color string for ant-painted cells
  let grid;
  let ant;
  let running = false;
  let currentLetter = "A";
  let frame = 0; // independent simulation frame counter

  // ---- History ----
  let history = [];

  function snapshotState() {
    history.push({ grid: grid.map((col) => col.slice()), ant: { ...ant }, frame });
    if (history.length > HISTORY_SIZE) history.shift();
  }

  function restoreState(snapshot) {
    grid = snapshot.grid.map((col) => col.slice());
    ant = { ...snapshot.ant };
    frame = snapshot.frame;
  }

  function tickBatch() {
    snapshotState();
    for (let i = 0; i < STEPS_PER_FRAME; i++) tick();
    frame++;
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
      tickBatch();
      p.redraw();
      return false;
    }
    if (!running && p.keyCode === 37) {
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
    frame = 0;
    seedGrid(currentLetter);
    ant = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
      dir: Math.floor(Math.random() * 4),
    };
  }

  function seedGrid(letter) {
    // null = background OFF, "fg" = seeded letter ON
    grid = Array.from({ length: COLS }, () => Array(ROWS).fill(null));

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
        if (luma < 128) grid[col][row] = "fg";
      }
    }

    buf.remove();
  }

  function tick() {
    const cell = grid[ant.x][ant.y];
    const isOn = cell !== null;
    ant.dir = isOn ? (ant.dir + 3) % 4 : (ant.dir + 1) % 4;
    // Paint: OFF→color, any ON→OFF
    grid[ant.x][ant.y] = isOn ? null : currentLerpColor(frame);
    ant.x = (ant.x + DX[ant.dir] + COLS) % COLS;
    ant.y = (ant.y + DY[ant.dir] + ROWS) % ROWS;
  }

  function render() {
    const antColor = currentLerpColor(frame);
    p.noStroke();
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[col][row];
        if (cell === null) p.fill(BG_COLOR);
        else if (cell === "fg") p.fill(FG_COLOR);
        else p.fill(cell);
        p.rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
    // Ant shown as current lerp color
    p.fill(antColor);
    p.rect(ant.x * CELL_SIZE, ant.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
};

new p5(sketch);
