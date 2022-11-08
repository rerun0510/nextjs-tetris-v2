import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import {
  Box,
  Button,
  Center,
  Flex,
  VStack,
  Text,
} from '@chakra-ui/react'

import { Controller } from '@/components/controller'
import { Field } from '@/components/field'
import { MinoHold } from '@/components/minoHold'
import { MinoList } from '@/components/minoList'
import { ScoreBoard } from '@/components/scoreBoard'
import { useGameController } from '@/hooks/useGameController'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const {
    nextMinos,
    cells,
    action,
    gameState,
    onClickGameStateBtn,
    deleteLineCount,
    level,
    holdMino,
  } = useGameController()

  useEffect(() => {
    if (router.isReady) {
      setLoading(false)
    }
  }, [router.isReady])

  if (loading) return <></>

  return (
    <Center>
      <Box p="20px">
        <Flex>
          <MinoHold
            holdMino={holdMino}
            actionHold={action}
          />
          <VStack>
            <Field cells={cells} />
            <Controller action={action} />
          </VStack>
          <Box w="15px" />
          <Flex flexDir="column" align="center">
            <MinoList nextMinos={nextMinos} />
            <ScoreBoard
              deleteLineCount={deleteLineCount}
              level={level}
            />
            <Button
              onClick={onClickGameStateBtn}
              w="100%"
              mt="30px"
            >
              {(() => {
                if (gameState === 'stop') {
                  return 'START'
                } else if (gameState === 'start') {
                  return 'STOP'
                }
                return 'GAME OVER'
              })()}
            </Button>
          </Flex>
        </Flex>
        <Text>左移動：←</Text>
        <Text>右移動：→</Text>
        <Text>回転：↑</Text>
        <Text>ハードドロップ：↓</Text>
        <Text>ホールド：Shift</Text>
      </Box>
    </Center>
  )
}
