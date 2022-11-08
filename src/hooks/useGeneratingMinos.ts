import { useCallback, useState } from 'react'

import _ from 'lodash'

import { Mino, minos } from '@/enums'
import { shuffleArray } from '@/utils'

const initNextMinos = (): Mino[] => [
  ...shuffleArray(
    Object.keys(minos).filter((v) => v !== 'none')
  ),
  ...shuffleArray(
    Object.keys(minos).filter((v) => v !== 'none')
  ),
]

export const useGeneratingMinos = () => {
  const [nextMinos, setNextMinos] = useState<Mino[]>(
    _.cloneDeep(initNextMinos())
  )

  const popMino = useCallback((): Mino => {
    const newNextMinos = [
      ...nextMinos,
      ...(() => {
        if (nextMinos.length <= 7) {
          return initNextMinos()
        }
        return []
      })(),
    ]
    const nextMino = newNextMinos.shift()
    setNextMinos(_.cloneDeep(newNextMinos))
    return nextMino ?? initNextMinos()[0]
  }, [nextMinos])

  const resetNextMinos = useCallback(() => {
    setNextMinos(_.cloneDeep(initNextMinos()))
  }, [])

  return { nextMinos, popMino, resetNextMinos }
}
