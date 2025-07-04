'use client';
import React from 'react';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'framer-motion';
import ControlsPanel from './ControlsPanel';

export default function MobileControls({ snap, setSnap, ...props }) {
  return (
    <Drawer.Root 
      open
      modal={false}
      snapPoints={[0.13, 0.6, 0.92]} 
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Portal>
        <Drawer.Content style={{
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '24px',
          height: '96%',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          outline: 'none',
          boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
          borderTop: '1px solid #e2e8f0'
        }}>
          <Drawer.Title className="sr-only">Controls</Drawer.Title>
          <Drawer.Description className="sr-only">Adjust the settings for the app icon mockup.</Drawer.Description>
          
          {/* Animated Drag Handle */}
          <motion.div 
            style={{
              padding: '16px 16px 16px 16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              position: 'relative'
            }}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              style={{
                width: '40px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: '#d1d5db',
                cursor: 'grab'
              }}
              animate={{ 
                backgroundColor: snap > 0.5 ? '#9ca3af' : '#d1d5db',
                width: snap > 0.5 ? '60px' : '40px'
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            />
            
            {/* Swipe to customise text */}
            <AnimatePresence mode="wait">
              {snap < 0.2 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.15, 
                    ease: "easeOut"
                  }}
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    fontFamily: "'SFProRegular', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontWeight: '500',
                    letterSpacing: '0.01em',
                    position: 'absolute',
                    top: '100%',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Swipe to customise
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Animated Content Container */}
          <motion.div 
            style={{
              flex: 1,
              padding: '8px 16px 16px 16px',
              overflowY: snap > 0.5 ? 'auto' : 'hidden',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y'
            }}
            animate={{
              opacity: snap > 0.3 ? 1 : 0.7,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              {snap > 0.2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.05 
                  }}
                >
                  <ControlsPanel {...props} isMobileContext />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
} 