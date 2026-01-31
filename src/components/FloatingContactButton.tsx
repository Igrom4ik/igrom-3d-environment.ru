"use client";

import React, { useState } from 'react';
import { Button, IconButton, Column, Row, Text } from "@once-ui-system/core";
import { Mail, X } from 'lucide-react';
import ContactForm from './ContactForm';
import { AnimatePresence, motion } from 'framer-motion';

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 9998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: '100%',
                maxWidth: '500px',
                zIndex: 9999
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Column
                fillWidth
                background="surface"
                border="neutral-medium"
                radius="l"
                overflow="hidden"
              >
                 <Row 
                    fillWidth 
                    padding="m" 
                    horizontal="between" 
                    vertical="center"
                    borderBottom="neutral-medium"
                >
                    <Text variant="heading-strong-m">Написать мне</Text>
                    <IconButton
                        icon="close"
                        variant="ghost"
                        size="s"
                        onClick={() => setIsOpen(false)}
                        tooltip="Закрыть"
                    />
                </Row>
                <ContactForm />
              </Column>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 9990
        }}
      >
        <Button
            variant="primary"
            size="l"
            onClick={() => setIsOpen(true)}
            prefixIcon="email"
            label="Написать мне"
            style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
        />
      </motion.div>
    </>
  );
}
