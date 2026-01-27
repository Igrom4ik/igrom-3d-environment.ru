'use client';

import { useEffect, useRef } from 'react';
import { Flex } from '@once-ui-system/core';

export const JDoodleEmbed = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = "https://www.jdoodle.com/assets/jdoodle-pym.min.js";
      script.async = true;
      script.type = "text/javascript";
      
      const div = document.createElement('div');
      div.setAttribute('data-pym-src', "https://www.jdoodle.com/embed/v1/22f3da5fceabecdd");
      
      containerRef.current.appendChild(div);
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <Flex 
        fillWidth 
        background="surface" 
        border="neutral-medium" 
        radius="l" 
        padding="m"
        style={{ height: '80vh', overflow: 'hidden' }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </Flex>
  );
};
