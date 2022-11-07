// 操作可能なセルの範囲
export const FIELD_SIZE_X = 10
export const FIELD_SIZE_Y = 20

// 壁のサイズ
export const FIELD_WALL_SIZE = 1

// セル全体のサイズ
export const CELL_SIZE_X =
  FIELD_SIZE_X + FIELD_WALL_SIZE * 2
export const CELL_SIZE_Y =
  FIELD_SIZE_Y + FIELD_WALL_SIZE * 2

// 操作対象となるミノの初期位置
export const INIT_MINO_POSITION_X = FIELD_WALL_SIZE + 3
export const INIT_MINO_POSITION_Y = 0
