import { FC, memo } from 'react'

import { Box, Flex } from '@chakra-ui/react'

import { FIELD_WALL_SIZE } from '@/constants/settings'
import { Cell } from '@/types'

import { MinoSquare } from './minoSquare'

type Props = {
  cells: Cell[][]
}

export const Field: FC<Props> = memo(function Field({
  cells,
}) {
  return (
    <Box border="solid 2px">
      {cells.length &&
        (() => {
          const itemsI: JSX.Element[] = []
          for (
            let i = FIELD_WALL_SIZE;
            i < cells.length - FIELD_WALL_SIZE;
            i++
          ) {
            const itemsJ: JSX.Element[] = []
            for (
              let j = FIELD_WALL_SIZE;
              j < cells[i].length - FIELD_WALL_SIZE;
              j++
            ) {
              itemsJ.push(
                <MinoSquare
                  key={j}
                  bg={cells[i][j].color}
                  border={
                    cells[i][j].color ? undefined : 'none'
                  }
                  opacity={cells[i][j].isGhost ? '0.6' : ''}
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
