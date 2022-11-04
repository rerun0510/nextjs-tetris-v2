import { useCallback, useState } from 'react'

import { minos } from '@/enums'
import { Action, Cell, CurrentMino, Deg } from '@/types'

import { useGeneratingMinos } from './useGeneratingMinos'
import { useInterval } from './useInterval'

const emptyCells = (): Cell[][] => {
  const col: Cell[][] = []
  for (let i = 0; i < 20; i++) {
    const row: Cell[] = []
    for (let j = 0; j < 10; j++) {
      row.push({ color: '' })
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
      pointX: 3,
      pointY: 0,
      mino: 't',
      deg: 0,
    })
  const [cells, setCells] = useState([...emptyCells()])

  const updateCells = useCallback(() => {
    const { pointX, pointY, mino, deg } = currentMino
    const { points, color } = minos[mino]
    const newCells = emptyCells()
    for (let i = 0; i < points[deg].length; i++) {
      for (let j = 0; j < points[deg][i].length; j++) {
        if (points[deg][i][j]) {
          newCells[i + pointY][j + pointX] = { color }
        }
      }
    }
    setCells([...newCells])
  }, [currentMino])

  const [count, setCount] = useState(0)
  const down = useCallback(() => {
    if (count && count < 20) {
      // 操作中のミノを1セル分落下
      setCurrentMino({
        ...currentMino,
        pointY: currentMino.pointY + 1,
      })
      updateCells()
    } else {
      setCurrentMino({
        pointX: 3,
        pointY: 0,
        mino: popMino(),
        deg: 0,
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
