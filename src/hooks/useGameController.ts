import { useCallback, useMemo, useState } from 'react'

import _ from 'lodash'
import { useKey } from 'react-use'

import {
  CELL_SIZE_X,
  CELL_SIZE_Y,
  FIELD_SIZE_X,
  FIELD_SIZE_Y,
  FIELD_WALL_SIZE,
  INIT_MINO_POSITION_X,
  INIT_MINO_POSITION_Y,
} from '@/constants/settings'
import { Mino, minos } from '@/enums'
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
  canHold: true,
  hardDrop: false,
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
  const { nextMinos, popMino, resetNextMinos } =
    useGeneratingMinos()
  const [currentMino, setCurrentMino] =
    useState<CurrentMino>(initCurrentMino)
  const [fixedCells, setFixedCells] = useState<Cell[][]>(
    _.cloneDeep(createEmptyCells)
  )
  const [cells, setCells] = useState(
    _.cloneDeep(createEmptyCells)
  )
  const [gameState, setGameState] = useState<
    'stop' | 'start' | 'gameOver'
  >('stop')
  const [deleteLineCount, setDeleteLineCount] = useState(0)
  const [level, setLevel] = useState(1)
  const [holdMino, setHoldMino] = useState<Mino>('none')

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

  const checkCellsOverFlow = useCallback(() => {
    for (
      let i = FIELD_WALL_SIZE;
      i < CELL_SIZE_X - FIELD_WALL_SIZE;
      i++
    ) {
      if (fixedCells[1][i].isFixed) {
        setGameState('gameOver')
      }
    }
    return
  }, [fixedCells])

  const calcCells = useMemo(() => {
    const { pointX, pointY, mino, deg } = currentMino
    const { points, color } = minos[mino]
    const point = points[deg]
    const newCells = _.cloneDeep(fixedCells)

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
    setCells(_.cloneDeep(calcCells))
  }, [calcCells])

  const calcDeleteCells = useMemo(() => {
    // ミノの削除対象となる列を算出
    const deleteIndex: number[] = []
    for (
      let i = FIELD_WALL_SIZE;
      i < fixedCells.length - FIELD_WALL_SIZE;
      i++
    ) {
      let minoCount = 0
      for (
        let j = FIELD_WALL_SIZE;
        j < fixedCells[i].length - FIELD_WALL_SIZE;
        j++
      ) {
        minoCount += fixedCells[i][j].isFixed ? 1 : 0
      }
      if (FIELD_SIZE_X === minoCount) {
        deleteIndex.push(i)
      }
    }
    return deleteIndex
  }, [fixedCells])

  const deleteCells = useCallback(() => {
    const newFixedCells = _.cloneDeep(fixedCells)
    const deleteIndex = _.cloneDeep(calcDeleteCells)
    // セルの削除・追加
    if (deleteIndex.length) {
      for (let i = 0; i < deleteIndex.length; i++) {
        // セルの削除
        newFixedCells.splice(deleteIndex[i], 1)
        // 先頭に空のセルを追加
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
      setFixedCells(_.cloneDeep(newFixedCells))

      // ライン数、レベルの更新
      const newDeleteLineCount =
        deleteLineCount + deleteIndex.length
      setDeleteLineCount(newDeleteLineCount)
      setLevel(Math.floor(newDeleteLineCount / 5) + 1)
    }
  }, [calcDeleteCells, deleteLineCount, fixedCells])

  const fallCurrentMino = useCallback(() => {
    const { pointX, pointY, mino, deg } = currentMino
    const { points, color } = minos[mino]
    const point = points[deg]

    if (currentMino.isFixed) {
      // 着地の再判定を行う(着地前の移動に対応)
      if (fixedDecision) {
        // 着地（確定）
        const newFixedCells = _.cloneDeep(fixedCells)
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
        setFixedCells(_.cloneDeep(newFixedCells))

        // 次のミノの落下開始
        setCurrentMino({
          ...initCurrentMino,
          mino: popMino(),
        })
      } else {
        // 着地直前に移動が発生した場合
        // 操作中のミノを1セル分落下
        setCurrentMino({
          ...currentMino,
          pointY: currentMino.pointY + 1,
        })
      }
    } else {
      if (fixedDecision) {
        // 着地（次のループで確定）
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
    }
  }, [currentMino, fixedCells, fixedDecision, popMino])

  const loop = useCallback(() => {
    if (gameState !== 'start') {
      return
    }
    // スタート時
    if (currentMino.mino === 'none') {
      setCurrentMino({
        ...initCurrentMino,
        mino: popMino(),
      })
      // Cellsを最新の状態に更新
      updateCells()
      return
    }
    // ミノの落下
    fallCurrentMino()
    // ミノの削除
    deleteCells()
    // ゲームオーバーの判定
    checkCellsOverFlow()
    // Cellsを最新の状態に更新
    updateCells()
  }, [
    gameState,
    currentMino.mino,
    fallCurrentMino,
    deleteCells,
    checkCellsOverFlow,
    updateCells,
    popMino,
  ])

  useInterval({ onUpdate: () => loop(), level })

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
      hardDrop: true,
    })
  }, [calcDistanceToCollision, cells, currentMino])

  const actionHold = useCallback(() => {
    if (currentMino.canHold) {
      // 次のミノの落下開始
      setCurrentMino({
        ...initCurrentMino,
        mino: holdMino === 'none' ? popMino() : holdMino,
        canHold: false,
      })
      setHoldMino(currentMino.mino)
    }
  }, [
    currentMino.canHold,
    currentMino.mino,
    holdMino,
    popMino,
  ])

  const action = useCallback(
    (action: Action) => {
      // ゲーム中以外は操作不能
      if (gameState !== 'start') {
        return
      }
      // HardDrop時は操作不能
      if (currentMino.hardDrop) {
        return
      }
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
        case 'hold':
          actionHold()
          break
      }
      updateCells()
    },
    [
      gameState,
      currentMino.hardDrop,
      updateCells,
      actionHorizontal,
      actionRotate90,
      actionHardDrop,
      actionHold,
    ]
  )

  const gameReset = useCallback(() => {
    setFixedCells(_.cloneDeep(createEmptyCells))
    setCells(_.cloneDeep(createEmptyCells))
    setCurrentMino({ ...initCurrentMino })
    setDeleteLineCount(0)
    setLevel(1)
    setHoldMino('none')
    setGameState('stop')
    resetNextMinos()
  }, [createEmptyCells, resetNextMinos])

  const onClickGameStateBtn = useCallback(() => {
    if (gameState === 'stop') {
      setGameState('start')
    } else if (gameState === 'start') {
      setGameState('stop')
    } else {
      gameReset()
    }
  }, [gameReset, gameState])

  // キーボードイベントの取得
  useKey('ArrowLeft', () => action('left'), {}, [action])
  useKey('ArrowRight', () => action('right'), {}, [action])
  useKey('ArrowUp', () => action('rotate90CW'), {}, [
    action,
  ])
  useKey('ArrowDown', () => action('hardDrop'), {}, [
    action,
  ])
  useKey('Shift', () => action('hold'), {}, [action])
  useKey('Enter', () => onClickGameStateBtn(), {}, [
    onClickGameStateBtn,
  ])

  return {
    nextMinos,
    cells,
    action,
    gameState,
    onClickGameStateBtn,
    deleteLineCount,
    level,
    holdMino,
  }
}
