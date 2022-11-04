import { MINO_POINTS_NEXT } from '@/constants/minoPointsNext'
import { NEXT_MINO_SIZE } from '@/constants/settings'
import { Mino, minos } from '@/enums'
import { Box, Flex } from '@chakra-ui/react'
import { FC, memo } from 'react'
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
                size={NEXT_MINO_SIZE}
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
