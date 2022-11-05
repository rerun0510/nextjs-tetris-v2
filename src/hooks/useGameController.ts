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
import {
  Action,
  ActionHorizontal,
  ActionRotate,
  Cell,
  CurrentMino,
} from '@/types'

import { useGeneratingMinos } from './useGeneratingMinos'
import { useInterval } from './useInterval'

const createEmptyCells = (): Cell[][] =>
  Array.from({ length: CELL_SIZE_Y }, (_, i) =>
    Array.from({ length: CELL_SIZE_X }, (_, j) => {
      const isWall = !(
        FIELD_WALL_SIZE <= i &&
        i < FIELD_SIZE_Y + FIELD_WALL_SIZE &&
        FIELD_WALL_SIZE <= j &&
        j < FIELD_SIZE_X + FIELD_WALL_SIZE
      )
      return {
        color: isWall ? 'gray' : '',
        isWall,
      } as Cell
    })
  )

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
  const [fixedCells, setFixedCells] = useState<Cell[][]>([
    ...createEmptyCells(),
  ])
  const [cells, setCells] = useState([
    ...createEmptyCells(),
  ])

  const updateCells = useCallback(() => {
    const { pointX, pointY, mino, deg } = currentMino
    const { points, color } = minos[mino]
    const point = points[deg]
    const newFixedCells = Array.from(fixedCells)
    const newCells = Array.from(createEmptyCells())

    // 既存のミノを配置
    for (let i = 0; i < newFixedCells.length; i++) {
      for (let j = 0; j < newFixedCells[i].length; j++) {
        if (newFixedCells[i][j].color) {
          newCells[i][j] = { ...newFixedCells[i][j] }
        }
      }
    }

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

    // 落下が完了したミノを固定
    if (isFixed) {
      for (let i = 0; i < point.length; i++) {
        for (let j = 0; j < point[i].length; j++) {
          if (point[i][j]) {
            newFixedCells[i + pointY][j + pointX] = {
              color,
              isWall: true,
            }
          }
        }
      }
      setFixedCells([...newFixedCells])
    }
    setCells([...newCells])
  }, [currentMino, fixedCells])

  const down = useCallback(() => {
    if (
      currentMino.isFixed ||
      currentMino.mino === 'none'
    ) {
      setCurrentMino({
        pointX: INIT_MINO_POSITION_X,
        pointY: INIT_MINO_POSITION_Y,
        mino: popMino(),
        deg: 0,
        isFixed: false,
      })
    } else {
      // 操作中のミノを1セル分落下
      setCurrentMino({
        ...currentMino,
        pointY: currentMino.pointY + 1,
      })
      updateCells()
    }
  }, [currentMino, popMino, updateCells])

  useInterval({ onUpdate: () => down() })

  const actionRotate90 = useCallback(
    (action: ActionRotate) => {
      let deg = currentMino.deg
      // TODO: 回転の判定処理を挟む
      switch (deg) {
        case 0:
          deg = action === 'rotate90CW' ? 90 : 270
          break
        case 90:
          deg = action === 'rotate90CW' ? 180 : 0
          break
        case 180:
          deg = action === 'rotate90CW' ? 270 : 90
          break
        case 270:
          deg = action === 'rotate90CW' ? 0 : 180
          break
      }
      setCurrentMino({
        ...currentMino,
        deg,
      })
    },
    [currentMino]
  )

  const actionHorizontal = useCallback(
    (action: ActionHorizontal) => {
      const { pointX, pointY, mino, deg } = currentMino
      const point = minos[mino].points[deg]
      // 壁の衝突判定処理
      for (let i = 0; i < point.length; i++) {
        for (let j = 0; j < point[i].length; j++) {
          if (
            point[i][j] &&
            cells[i + pointY][
              j + pointX + (action === 'right' ? 1 : -1)
            ].isWall
          ) {
            return
          }
        }
      }
      setCurrentMino({
        ...currentMino,
        pointX:
          currentMino.pointX +
          (action === 'right' ? 1 : -1),
      })
    },
    [cells, currentMino]
  )

  const action = useCallback(
    (action: Action) => {
      switch (action) {
        case 'right':
        case 'left':
          actionHorizontal(action)
          break
        case 'rotate90CW':
        case 'rotate90CCW':
          actionRotate90(action)
          break
      }
      updateCells()
    },
    [updateCells, actionHorizontal, actionRotate90]
  )

  return { nextMinos, cells, action }
}
