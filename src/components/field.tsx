import { FC, memo } from 'react'

import { Box, Flex } from '@chakra-ui/react'

import { Cell } from '@/types'

import { MinoSquare } from './minoSquare'

type Props = {
  cells: Cell[][]
}

export const Field: FC<Props> = memo(function Field({
  cells,
}) {
  return (
    <Box>
      {cells.length &&
        (() => {
          const itemsI: JSX.Element[] = []
          for (let i = 0; i < cells.length; i++) {
            const itemsJ: JSX.Element[] = []
            for (let j = 0; j < cells[i].length; j++) {
              itemsJ.push(
                <MinoSquare
                  key={j}
                  bg={cells[i][j].color}
                  opacity={
                    cells[i][j].isTargetPoint ? '0.7' : ''
                  }
                />
              )
            }
            itemsI.push(<Flex key={i}>{itemsJ}</Flex>)
          }
          return itemsI
        })()}
    </Box>
  )
})
