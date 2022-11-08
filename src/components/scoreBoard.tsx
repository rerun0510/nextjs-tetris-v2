import { FC, memo } from 'react'

import { Circle, Flex, Text } from '@chakra-ui/react'

type Props = {
  deleteLineCount: number
  level: number
}

export const ScoreBoard: FC<Props> = memo(
  function ScoreBoard({ deleteLineCount, level }) {
    return (
      <Flex mt="5px">
        <Circle size="70px" border="solid 2px" mr="15px">
          <Text textAlign="center">
            LINE
            <br />
            {deleteLineCount}
          </Text>
        </Circle>
        <Circle size="70px" border="solid 2px">
          <Text textAlign="center">
            LV.
            <br />
            {level}
          </Text>
        </Circle>
      </Flex>
    )
  }
)
