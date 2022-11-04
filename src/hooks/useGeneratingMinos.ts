import { Mino, minos } from '@/enums'
import { shuffleArray } from '@/utils'
import { useCallback, useState } from 'react'

const initNextMinos = (): Mino[] =>
  shuffleArray(
    Object.keys(minos).filter((v) => v !== 'none')
  )

export const useGeneratingMinos = () => {
  const [nextMinos, setNextMinos] = useState<Mino[]>([
    ...initNextMinos(),
    ...initNextMinos(),
  ])

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
    setNextMinos(newNextMinos)
    return nextMino ?? initNextMinos()[0]
  }, [nextMinos])

  return { nextMinos, popMino }
}
