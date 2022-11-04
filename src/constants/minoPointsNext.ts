import { Mino } from '@/enums'

type MinoPointNext = {
  [key in Mino]: {
    point: number[][]
  }
}

export const MINO_POINTS_NEXT: MinoPointNext = {
  none: { point: [[]] },
  i: { point: [[1, 1, 1, 1]] },
  j: {
    point: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  l: {
    point: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  o: {
    point: [
      [1, 1],
      [1, 1],
    ],
  },
  s: {
    point: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  t: {
    point: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  z: {
    point: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
}
