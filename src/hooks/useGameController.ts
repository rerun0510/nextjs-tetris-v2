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
  Array.from({ length: CELL_SIZE_Y }, (_, i): Cell[] =>
    Array.from({ length: CELL_SIZE_X }, (_, j): Cell => {
      const isWall = !(
        FIELD_WALL_SIZE <= i &&
        i < FIELD_SIZE_Y + FIELD_WALL_SIZE &&
        FIELD_WALL_SIZE <= j &&
        j < FIELD_SIZE_X + FIELD_WALL_SIZE
      )
      return {
        color: isWall ? 'gray' : '',
        isFixed: isWall,
        isCurrent: false,
        isTargetPoint: false,
      }
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
        if (newFixedCells[i][j].isFixed) {
          newCells[i][j] = { ...newFixedCells[i][j] }
        }
      }
    }

    // 操作中のミノに関する処理
    let isFixed = false
    for (let i = 0; i < point.length; i++) {
      for (let j = 0; j < point[i].length; j++) {
        if (point[i][j]) {
          // 着地判定
          if (!isFixed) {
            isFixed =
              newCells[i + pointY + 1][j + pointX].isFixed
            if (isFixed) {
              setCurrentMino({
                ...currentMino,
                isFixed: true,
              })
            }
          }
          // 操作中のミノを配置
          newCells[i + pointY][j + pointX] = {
            color,
            isFixed: false,
            isCurrent: true,
            isTargetPoint: false,
          }
        }
      }
    }

    if (!isFixed) {
      // 操作中のミノが衝突するまでの最短距離を算出
      let distance = CELL_SIZE_Y
      for (let i = 0; i < point.length; i++) {
        for (let j = 0; j < point[i].length; j++) {
          if (point[i][j]) {
            for (
              let k = i + pointY + 1;
              k < newCells.length;
              k++
            ) {
              if (newCells[k][j + pointX].isFixed) {
                distance =
                  distance > k - (i + pointY) - 1
                    ? k - (i + pointY) - 1
                    : distance
              }
            }
          }
        }
      }

      // 操作中のミノの落下予定地を設定
      for (let i = 0; i < point.length; i++) {
        for (let j = 0; j < point[i].length; j++) {
          if (
            point[i][j] &&
            !newCells[distance + i + pointY][j + pointX]
              .isCurrent
          ) {
            newCells[distance + i + pointY][j + pointX] = {
              color,
              isFixed: false,
              isCurrent: false,
              isTargetPoint: true,
            }
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
              isFixed: true,
              isCurrent: false,
              isTargetPoint: false,
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
            ].isFixed
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
