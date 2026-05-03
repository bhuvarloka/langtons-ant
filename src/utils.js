import { CANVAS_SIZE, CELL_SIZE, COLS, ROWS, FG_COLOR, BG_COLOR } from "./config.js";

export function saveHighRes(p, grid, currentLetter) {
  const scale = 2;
  const size = CANVAS_SIZE * scale;
  const buf = p.createGraphics(size, size);
  buf.pixelDensity(1);
  buf.noStroke();
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      buf.fill(grid[col][row] === 1 ? FG_COLOR : BG_COLOR);
      buf.rect(col * CELL_SIZE * scale, row * CELL_SIZE * scale, CELL_SIZE * scale, CELL_SIZE * scale);
    }
  }
  p.save(buf, `langtons-ant-${currentLetter}.png`);
  buf.remove();
}
