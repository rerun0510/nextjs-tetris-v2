import { useEffect } from 'react'

type Params = {
  onUpdate: () => void
}

export const useInterval = ({ onUpdate }: Params) => {
  useEffect(() => {
    const timerId = setInterval(() => {
      onUpdate()
    }, 700)
    return () => clearInterval(timerId)
  })
}
