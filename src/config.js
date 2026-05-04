export const CANVAS_SIZE = 720;
export const CELL_SIZE = 4;
export const BG_COLOR = "#FAF8F2";
export const FG_COLOR = "#0a0908";
export const FONT_SIZE = 540;

export const COLS = CANVAS_SIZE / CELL_SIZE;
export const ROWS = CANVAS_SIZE / CELL_SIZE;
export const STEPS_PER_FRAME = 30;

// ---- Color lerp ----
export const COLOR_A = "#3A7D44";
export const COLOR_B = "#D0DB97";
export const COLOR_LERP_DURATION = 12; // frames for one full A→B cycle

// Directions: 0=UP 1=RIGHT 2=DOWN 3=LEFT
export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];
