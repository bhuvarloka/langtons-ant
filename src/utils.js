import { CANVAS_SIZE, CELL_SIZE, COLS, ROWS, FG_COLOR, ANT_COLOR, BG_COLOR } from "./config.js";

export const CELL_COLORS = [BG_COLOR, FG_COLOR, ANT_COLOR];

export function saveHighRes(p, grid, currentLetter) {
  const scale = 2;
  const size = CANVAS_SIZE * scale;
  const buf = p.createGraphics(size, size);
  buf.pixelDensity(1);
  buf.noStroke();
  const scaledCell = CELL_SIZE * scale;
  for (let col = 0; col < COLS; col++) {
    const x = col * scaledCell;
    for (let row = 0; row < ROWS; row++) {
      buf.fill(CELL_COLORS[grid[col][row]]);
      buf.rect(x, row * scaledCell, scaledCell, scaledCell);
    }
  }
  p.save(buf, `langtons-ant-${currentLetter}.png`);
  buf.remove();
}
