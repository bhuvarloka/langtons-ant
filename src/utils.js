import { CANVAS_SIZE, CELL_SIZE, COLS, ROWS, FG_COLOR, BG_COLOR } from "./config.js";

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
      const cell = grid[col][row];
      if (cell === null) buf.fill(BG_COLOR);
      else if (cell === "fg") buf.fill(FG_COLOR);
      else buf.fill(cell);
      buf.rect(x, row * scaledCell, scaledCell, scaledCell);
    }
  }
  p.save(buf, `langtons-ant-${currentLetter}.png`);
  buf.remove();
}
