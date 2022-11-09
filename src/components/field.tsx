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
              const cell = cells[i][j]
              itemsJ.push(
                <MinoSquare
                  key={j}
                  bg={cell.color}
                  border={cell.color ? undefined : 'none'}
                  opacity={
                    cell.isGhost || cell.isCurrent
                      ? '0.8'
                      : ''
                  }
                  _before={
                    cell.isGhost
                      ? {
                          content: '""',
                          backgroundColor: 'black',
                          pos: 'absolute',
                          top: 0,
                          right: 0,
                          left: 0,
                          bottom: 0,
                          opacity: 0.4,
                        }
                      : undefined
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
