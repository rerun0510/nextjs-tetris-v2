import { useEffect, useState } from 'react'

import dayjs from 'dayjs'

type Params = {
  onUpdate: () => void
  level: number
}

export const useInterval = ({
  onUpdate,
  level,
}: Params) => {
  const [tmpTime, setTmpTime] = useState<Date>()

  useEffect(() => {
    const timerId = setInterval(() => {
      if (!tmpTime) {
        setTmpTime(new Date())
      }
      const diff = dayjs().diff(tmpTime)

      if (diff > 600 - (level - 1) * 150) {
        setTmpTime(new Date())
        onUpdate()
      }
    }, 100)
    return () => clearInterval(timerId)
  })
}
