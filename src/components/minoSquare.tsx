import { FC, memo } from 'react'

import {
  Square,
  SquareProps,
  SystemStyleObject,
} from '@chakra-ui/react'

type Props = {
  _before?: SystemStyleObject | undefined
} & SquareProps

export const MinoSquare: FC<Props> = memo(
  function MinoSquare({ _before, ...rest }) {
    return (
      <Square
        key={rest.key}
        pos="relative"
        bg={rest.bg || rest.backgroundColor}
        size={rest.size ?? '25px'}
        border={rest.border ?? 'solid 1px'}
        opacity={rest.opacity ?? ''}
        _before={_before}
      />
    )
  }
)
