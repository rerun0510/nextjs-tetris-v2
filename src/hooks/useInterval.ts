import { useEffect, useState } from 'react'

import dayjs from 'dayjs'

type Params = {
  onUpdate: () => void
}

export const useInterval = ({ onUpdate }: Params) => {
  const [tmpTime, setTmpTime] = useState<Date>()

  useEffect(() => {
    const timerId = setInterval(() => {
      if (!tmpTime) {
        setTmpTime(new Date())
      }
      const diff = dayjs().diff(tmpTime)
      if (diff > 600) {
        setTmpTime(new Date())
        onUpdate()
      }
    }, 100)
    return () => clearInterval(timerId)
  })
}
