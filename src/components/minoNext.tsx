import { FC, memo } from 'react'

import { Box, Flex } from '@chakra-ui/react'

import { MINO_POINTS_NEXT } from '@/constants/minoPointsNext'
import { Mino, minos } from '@/enums'

import { MinoSquare } from './minoSquare'

type Props = { mino: Mino }

export const MinoNext: FC<Props> = memo(function MinoNext({
  mino,
}) {
  const { point } = MINO_POINTS_NEXT[mino]
  const { color } = minos[mino]

  return (
    <Box>
      {(() => {
        const itemsI: JSX.Element[] = []
        for (let i = 0; i < point.length; i++) {
          const itemsJ: JSX.Element[] = []
          for (let j = 0; j < point[i].length; j++) {
            itemsJ.push(
              <MinoSquare
                key={j}
                size="15px"
                bg={point[i][j] ? color : ''}
                border={point[i][j] ? undefined : ''}
              />
            )
          }
          itemsI.push(<Flex key={i}>{itemsJ}</Flex>)
        }
        return <>{itemsI}</>
      })()}
    </Box>
  )
})
