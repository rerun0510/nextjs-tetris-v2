import { FC, memo } from 'react'

import { Box, Flex, Text } from '@chakra-ui/react'

import { Mino } from '@/enums'

import { MinoListItem } from './minoListItem'

type Props = {
  nextMinos: Mino[]
}

export const MinoList: FC<Props> = memo(function MinoList({
  nextMinos,
}) {
  return (
    <Box>
      <Text pl="4px">NEXT</Text>
      <Flex alignItems="start">
        <MinoListItem key={0} mino={nextMinos[0]} />
        <MinoListItem key={1} mino={nextMinos[1]} />
        <Box>
          {(() => {
            const items: JSX.Element[] = []
            for (let i = 2; i < 7; i++) {
              items.push(
                <MinoListItem key={i} mino={nextMinos[i]} />
              )
            }
            return items
          })()}
        </Box>
      </Flex>
    </Box>
  )
})
