import { useCallback, useMemo, useState } from 'react'

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

const initCurrentMino: CurrentMino = {
  pointX: INIT_MINO_POSITION_X,
  pointY: INIT_MINO_POSITION_Y,
  mino: 'none',
  deg: 0,
  isFixed: false,
}

export const useGameController = () => {
  const createEmptyCells = useMemo(
    (): Cell[][] =>
      Array.from({ length: CELL_SIZE_Y }, (_, i): Cell[] =>
        Array.from(
          { length: CELL_SIZE_X },
          (_, j): Cell => {
            const isWall = !(
              i < FIELD_SIZE_Y + FIELD_WALL_SIZE &&
              FIELD_WALL_SIZE <= j &&
              j < FIELD_SIZE_X + FIELD_WALL_SIZE
            )
            return {
              color: isWall ? 'gray' : '',
              isFixed: isWall,
              isCurrent: false,
              isGhost: false,
            }
          }
        )
      ),
    []
  )
  const { nextMinos, popMino } = useGeneratingMinos()
  const [currentMino, setCurrentMino] =
    useState<CurrentMino>(initCurrentMino)
  const [fixedCells, setFixedCells] = useState<Cell[][]>(
    createEmptyCells
  )
  const [cells, setCells] = useState(createEmptyCells)
  const [gameState, setGameState] = useState<
    'stop' | 'start' | 'gameOver'
  >('stop')
  const [deleteLineCount, setDeleteLineCount] = useState(0)

  const gameReset = useCallback(() => {
    setFixedCells([...createEmptyCells])
    setCells([...createEmptyCells])
    setCurrentMino(initCurrentMino)
    setDeleteLineCount(0)
    setGameState('stop')
  }, [createEmptyCells])

  const onClickGameStateBtn = useCallback(() => {
    if (gameState === 'stop') {
      setGameState('start')
    } else if (gameState === 'start') {
      setGameState('stop')
    } else {
      gameReset()
    }
  }, [gameReset, gameState])

  const calcDistanceToCollision = useCallback(
    (comparisonCells: Cell[][]) => {
      const { pointX, pointY, mino, deg } = currentMino
      const { points } = minos[mino]
      const point = points[deg]
      // 操作中のミノが衝突するまでの最短距離を算出
      let distance = CELL_SIZE_Y
      for (let i = 0; i < point.length; i++) {
        for (let j = 0; j < point[i].length; j++) {
          if (point[i][j]) {
            for (
              let k = i + pointY + 1;
              k < comparisonCells.length;
              k++
            ) {
              if (comparisonCells[k][j + pointX].isFixed) {
                distance =
                  distance > k - (i + pointY) - 1
                    ? k - (i + pointY) - 1
                    : distance
              }
            }
          }
        }
      }
      return distance
    },
    [currentMino]
  )

  const fixedDecision = useMemo(() => {
    const { pointX, pointY, mino, deg } = currentMino
    const { points } = minos[mino]
    const point = points[deg]
    for (let i = 0; i < point.length; i++) {
      for (let j = 0; j < point[i].length; j++) {
        if (point[i][j]) {
          // 着地判定
          if (cells[i + pointY + 1][j + pointX].isFixed) {
            return true
          }
        }
      }
    }
    return false
  }, [cells, currentMino])

  const gameDecision = useCallback(() => {
    const { pointX, pointY, mino, deg } = currentMino
    const { points } = minos[mino]
    const point = points[deg]
    for (let i = 0; i < point.length; i++) {
      for (let j = 0; j < point[i].length; j++) {
        if (point[i][j]) {
          const cell = cells[i + pointY][j + pointX]
          if (cell.isFixed && cell.color) {
            setGameState('gameOver')
            return
          }
        }
      }
    }
    return
  }, [cells, currentMino])

  const calcCells = useMemo(() => {
    const { pointX, pointY, mino, deg } = currentMino
    const { points, color } = minos[mino]
    const point = points[deg]
    const newCells = Array.from(fixedCells)

    // 1つ前の操作中ミノとその影を削除
    for (let i = 0; i < newCells.length; i++) {
      for (let j = 0; j < newCells[i].length; j++) {
        if (
          newCells[i][j].isCurrent ||
          newCells[i][j].isGhost
        ) {
          newCells[i][j] = {
            color: '',
            isFixed: false,
            isCurrent: false,
            isGhost: false,
          }
        }
      }
    }

    // 操作中のミノに関する処理
    for (let i = 0; i < point.length; i++) {
      for (let j = 0; j < point[i].length; j++) {
        if (point[i][j]) {
          // 操作中のミノを配置
          newCells[i + pointY][j + pointX] = {
            color,
            isFixed: false,
            isCurrent: true,
            isGhost: false,
          }
        }
      }
    }

    // 操作中のミノが衝突するまでの最短距離を算出
    const distance = calcDistanceToCollision(newCells)
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
            isGhost: true,
          }
        }
      }
    }
    return newCells
  }, [calcDistanceToCollision, currentMino, fixedCells])

  const updateCells = useCallback(() => {
    setCells([...calcCells])
  }, [calcCells])

  const deleteCells = useCallback(() => {
    // ミノの削除対象となる列を算出
    const newFixedCells = Array.from(fixedCells)
    const deleteIndex: number[] = []
    for (
      let i = FIELD_WALL_SIZE;
      i < newFixedCells.length - FIELD_WALL_SIZE;
      i++
    ) {
      let minoCount = 0
      for (
        let j = FIELD_WALL_SIZE;
        j < newFixedCells[i].length - FIELD_WALL_SIZE;
        j++
      ) {
        minoCount += newFixedCells[i][j].isFixed ? 1 : 0
      }
      if (FIELD_SIZE_X === minoCount) {
        deleteIndex.push(i)
      }
    }
    // セルの削除
    if (deleteIndex.length) {
      for (let i = 0; i < deleteIndex.length; i++) {
        newFixedCells.splice(deleteIndex[i], 1)
        newFixedCells.splice(
          FIELD_WALL_SIZE,
          0,
          Array.from({ length: CELL_SIZE_X }, (_, i) => {
            const isWall = !(
              FIELD_WALL_SIZE <= i &&
              i < FIELD_SIZE_X + FIELD_WALL_SIZE
            )
            return {
              color: isWall ? 'gray' : '',
              isFixed: isWall,
              isCurrent: false,
              isGhost: false,
            }
          })
        )
      }
      setFixedCells(newFixedCells)
      setDeleteLineCount(
        deleteLineCount + deleteIndex.length
      )
      updateCells()
    }
  }, [deleteLineCount, fixedCells, updateCells])

  const loop = useCallback(() => {
    if (gameState !== 'start') {
      return
    }

    gameDecision()

    const { pointX, pointY, mino, deg } = currentMino
    const { points, color } = minos[mino]
    const point = points[deg]

    // スタート時
    if (currentMino.mino === 'none') {
      setCurrentMino({
        pointX: INIT_MINO_POSITION_X,
        pointY: INIT_MINO_POSITION_Y,
        mino: popMino(),
        deg: 0,
        isFixed: false,
      })
      updateCells()
      return
    }

    // ミノの削除
    deleteCells()

    // ミノの落下
    if (currentMino.isFixed) {
      // 着地の再判定を行う(着地前の移動に対応)
      if (fixedDecision) {
        const newFixedCells = Array.from(fixedCells)
        for (let i = 0; i < point.length; i++) {
          for (let j = 0; j < point[i].length; j++) {
            if (point[i][j]) {
              newFixedCells[i + pointY][j + pointX] = {
                color,
                isFixed: true,
                isCurrent: false,
                isGhost: false,
              }
            }
          }
        }
        setFixedCells(newFixedCells)

        // 次のミノの落下開始
        setCurrentMino({
          pointX: INIT_MINO_POSITION_X,
          pointY: INIT_MINO_POSITION_Y,
          mino: popMino(),
          deg: 0,
          isFixed: false,
        })
      } else {
        setCurrentMino({
          ...currentMino,
          pointY: currentMino.pointY + 1,
        })
        updateCells()
        return
      }
    } else {
      if (fixedDecision) {
        setCurrentMino({
          ...currentMino,
          isFixed: true,
        })
      } else {
        // 操作中のミノを1セル分落下
        setCurrentMino({
          ...currentMino,
          pointY: currentMino.pointY + 1,
        })
      }
      updateCells()
    }
  }, [
    currentMino,
    deleteCells,
    fixedCells,
    fixedDecision,
    gameDecision,
    gameState,
    popMino,
    updateCells,
  ])

  useInterval({ onUpdate: () => loop() })

  const actionRotate90 = useCallback(
    (action: ActionRotate) => {
      // 回転後の角度を算出
      let newDeg = currentMino.deg
      switch (newDeg) {
        case 0:
          newDeg = action === 'rotate90CW' ? 90 : 270
          break
        case 90:
          newDeg = action === 'rotate90CW' ? 180 : 0
          break
        case 180:
          newDeg = action === 'rotate90CW' ? 270 : 90
          break
        case 270:
          newDeg = action === 'rotate90CW' ? 0 : 180
          break
      }
      // 回転後の状態を確認
      const { pointX, pointY, mino } = currentMino
      const { points } = minos[mino]
      const point = points[newDeg]
      for (let i = 0; i < point.length; i++) {
        for (let j = 0; j < point[i].length; j++) {
          if (
            point[i][j] &&
            cells[i + pointY][j + pointX].isFixed
          ) {
            return
          }
        }
      }
      setCurrentMino({
        ...currentMino,
        deg: newDeg,
      })
    },
    [cells, currentMino]
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

  const actionHardDrop = useCallback(() => {
    const distance = calcDistanceToCollision(cells)
    setCurrentMino({
      ...currentMino,
      pointY: currentMino.pointY + distance,
    })
    updateCells()
  }, [
    calcDistanceToCollision,
    cells,
    currentMino,
    updateCells,
  ])

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
        case 'hardDrop':
          actionHardDrop()
          break
      }
      updateCells()
    },
    [
      updateCells,
      actionHorizontal,
      actionRotate90,
      actionHardDrop,
    ]
  )

  return {
    nextMinos,
    cells,
    action,
    gameState,
    onClickGameStateBtn,
    deleteLineCount,
  }
}
