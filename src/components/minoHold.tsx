import { FC, memo } from 'react'

import { Box, Text } from '@chakra-ui/react'

import { Mino } from '@/enums'
import { Action } from '@/types'

import { MinoListItem } from './minoListItem'

type Props = {
  holdMino: Mino
  actionHold: (action: Action) => void
}

export const MinoHold: FC<Props> = memo(function MinoHold({
  holdMino,
  actionHold,
}) {
  return (
    <Box textAlign="center">
      <Text>HOLD</Text>
      <Box onClick={() => actionHold('hold')}>
        <MinoListItem mino={holdMino} />
      </Box>
    </Box>
  )
})
