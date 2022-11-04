import { FC, memo } from 'react'

import { Button, HStack } from '@chakra-ui/react'
import {
  BsArrowRightCircle,
  BsArrowLeftCircle,
} from 'react-icons/bs'
import { FiRotateCcw, FiRotateCw } from 'react-icons/fi'

import { Action } from '@/types'

type Props = {
  action: (action: Action) => void
}

export const Controller: FC<Props> = memo(
  function Controller({ action }) {
    return (
      <HStack>
        <Button onClick={() => action('left')}>
          <BsArrowLeftCircle />
        </Button>
        <Button onClick={() => action('right')}>
          <BsArrowRightCircle />
        </Button>
        <Button onClick={() => action('rotate90CCW')}>
          <FiRotateCcw />
        </Button>
        <Button onClick={() => action('rotate90CW')}>
          <FiRotateCw />
        </Button>
      </HStack>
    )
  }
)
