import { useCallback, useState } from 'react'

import {
  CELL_SIZE_X,
  CELL_SIZE_Y,
  FIELD_SIZE_X,
  FIELD_SIZE_Y,
  FIELD_WALL_SIZE,
  INIT_MINO_POSITION_X,
  INIT_MINO_POSITION_Y,
} from '@/constants/settings'
import { minos } from '@/enums'
import { Action, Cell, CurrentMino, Deg } from '@/types'

import { useGeneratingMinos } from './useGeneratingMinos'
import { useInterval } from './useInterval'

const emptyCells = (): Cell[][] => {
  const col: Cell[][] = []
  for (let i = 0; i < CELL_SIZE_Y; i++) {
    const row: Cell[] = []
    for (let j = 0; j < CELL_SIZE_X; j++) {
      row.push({
        color:
          FIELD_WALL_SIZE <= i &&
          i < FIELD_SIZE_Y + FIELD_WALL_SIZE &&
          FIELD_WALL_SIZE <= j &&
          j < FIELD_SIZE_X + FIELD_WALL_SIZE
            ? ''
            : 'gray',
        isWall: !(
          FIELD_WALL_SIZE <= i &&
          i < FIELD_SIZE_Y + FIELD_WALL_SIZE &&
          FIELD_WALL_SIZE <= j &&
          j < FIELD_SIZE_X + FIELD_WALL_SIZE
        ),
      })
    }
    col.push(row)
  }
  return col
  // 本当はこんな感じに書きたい
  // return Array<Cell[]>(20).fill(Array<Cell>(10).fill({ color: '' }))
}

export const useGameController = () => {
  const { nextMinos, popMino } = useGeneratingMinos()
  const [currentMino, setCurrentMino] =
    useState<CurrentMino>({
      pointX: INIT_MINO_POSITION_X,
      pointY: INIT_MINO_POSITION_Y,
      mino: 'none',
      deg: 0,
      isFixed: false,
    })
  const [fixedCells, setFixedCells] = useState<Cell[][]>([])
  const [cells, setCells] = useState([...emptyCells()])

  const updateCells = useCallback(() => {
    const { pointX, pointY, mino, deg } = currentMino
    const { points, color } = minos[mino]
    const point = points[deg]
    const newCells = emptyCells()
    // TODO: 既存のミノを配置
    // 操作中のミノを配置
    let isFixed = false
    for (let i = 0; i < point.length; i++) {
      for (let j = 0; j < point[i].length; j++) {
        if (point[i][j]) {
          // 着地判定
          if (!isFixed) {
            isFixed =
              newCells[i + pointY + 1][j + pointX].isWall
            if (isFixed) {
              setCurrentMino({
                ...currentMino,
                isFixed: true,
              })
            }
          }
          newCells[i + pointY][j + pointX] = {
            color,
            isWall: false,
          }
        }
      }
    }
    setCells([...newCells])
  }, [currentMino])

  const [count, setCount] = useState(0)
  const down = useCallback(() => {
    if (!currentMino.isFixed) {
      // 操作中のミノを1セル分落下
      setCurrentMino({
        ...currentMino,
        pointY: currentMino.pointY + 1,
      })
      updateCells()
    } else {
      setCurrentMino({
        pointX: INIT_MINO_POSITION_X,
        pointY: INIT_MINO_POSITION_Y,
        mino: popMino(),
        deg: 0,
        isFixed: false,
      })
    }
    setCount(count + 1)
  }, [count, currentMino, popMino, updateCells])

  useInterval({ onUpdate: () => down() })

  const rotate90 = useCallback(
    (direction: 'cw' | 'ccw'): Deg => {
      switch (currentMino.deg) {
        case 0:
          return direction === 'cw' ? 90 : 270
        case 90:
          return direction === 'cw' ? 180 : 0
        case 180:
          return direction === 'cw' ? 270 : 90

        case 270:
          return direction === 'cw' ? 0 : 180
      }
    },
    [currentMino.deg]
  )

  const action = useCallback(
    (action: Action) => {
      switch (action) {
        case 'right':
          setCurrentMino({
            ...currentMino,
            pointX: currentMino.pointX + 1,
          })
          break
        case 'left':
          setCurrentMino({
            ...currentMino,
            pointX: currentMino.pointX - 1,
          })
          break
        case 'rotate90CW':
          setCurrentMino({
            ...currentMino,
            deg: rotate90('cw'),
          })
          break
        case 'rotate90CCW':
          setCurrentMino({
            ...currentMino,
            deg: rotate90('ccw'),
          })
          break
      }
      updateCells()
    },
    [currentMino, rotate90, updateCells]
  )

  return { nextMinos, cells, action }
}
