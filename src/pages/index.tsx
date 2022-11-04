import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { Box, Center, Flex } from '@chakra-ui/react'

import { Controller } from '@/components/controller'
import { Field } from '@/components/field'
import { MinoNext } from '@/components/minoNext'
import { useGameController } from '@/hooks/useGameController'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { nextMinos, cells, action } = useGameController()

  useEffect(() => {
    if (router.isReady) {
      setLoading(false)
    }
  }, [router.isReady])

  if (loading) return <></>

  return (
    <Center>
      <Box>
        <Flex>
          <Field cells={cells} />
          <Box>
            {(() => {
              const items: JSX.Element[] = []
              for (let i = 0; i < 7; i++) {
                items.push(
                  <MinoNext key={i} mino={nextMinos[i]} />
                )
              }
              return items
            })()}
          </Box>
        </Flex>
        <Controller action={action} />
      </Box>
    </Center>
  )
}
