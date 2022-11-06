import { FC, memo } from 'react'

import { Square } from '@chakra-ui/react'

import { Mino } from '@/enums'

import { MinoNext } from './minoNext'

type Props = {
  mino: Mino
}

export const MinoListItem: FC<Props> = memo(
  function MinoListItem({ mino }) {
    return (
      <Square
        borderRadius="10px"
        border="solid 2px black"
        size="60px"
        boxSizing="content-box"
        p="4px"
        m="4px"
      >
        <MinoNext mino={mino} />
      </Square>
    )
  }
)
