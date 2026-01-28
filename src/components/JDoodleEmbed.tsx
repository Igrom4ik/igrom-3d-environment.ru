'use client';

import { Flex } from '@once-ui-system/core';

export const JDoodleEmbed = () => {
  return (
    <Flex 
        fillWidth 
        background="surface" 
        border="neutral-medium" 
        radius="l" 
        overflow="hidden"
        style={{ height: '80vh' }}
    >
      <iframe
        src="https://onecompiler.com/embed/python?theme=dark&hideLanguageSelection=false"
        width="100%"
        height="100%"
        frameBorder="0"
        title="Online Compiler"
        allow="clipboard-write"
      />
    </Flex>
  );
};
