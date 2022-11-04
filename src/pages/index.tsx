import { MinoNext } from '@/components/minoNext'
import { Mino } from '@/enums'
import { useGeneratingMinos } from '@/hooks/useGeneratingMinos'
import { Box, Button, Center, Flex } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { nextMinos, popMino } = useGeneratingMinos()

  console.log(nextMinos)
  const [currentMino, setCurrentMino] =
    useState<Mino>('none')

  useEffect(() => {
    setCurrentMino(popMino())
  }, [])

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
          <MinoNext mino={currentMino} />
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
        <Button onClick={() => setCurrentMino(popMino())}>
          Next
        </Button>
      </Box>
    </Center>
  )
}
