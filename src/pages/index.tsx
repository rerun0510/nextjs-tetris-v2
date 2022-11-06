import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { Box, Center, Flex } from '@chakra-ui/react'

import { Controller } from '@/components/controller'
import { Field } from '@/components/field'
import { MinoList } from '@/components/minoList'
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
          <Box w="15px" />
          <MinoList nextMinos={nextMinos} />
        </Flex>
        <Controller action={action} />
      </Box>
    </Center>
  )
}
