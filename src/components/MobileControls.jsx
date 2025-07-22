'use client';
import React, { useEffect } from 'react';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'framer-motion';
import ControlsPanel from './ControlsPanel';

export default function MobileControls({ snap, setSnap, ...props }) {
  // Announce snap changes to screen readers
  useEffect(() => {
    const announceSnap = () => {
      let message = '';
      if (snap < 0.2) {
        message = 'Controls drawer closed. Swipe up to open customization options.';
      } else if (snap < 0.7) {
        message = 'Controls drawer partially open. Continue swiping up for full access.';
      } else {
        message = 'Controls drawer fully open. All customization options available.';
      }
      
      // Create a temporary element to announce the change
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    const timeoutId = setTimeout(announceSnap, 300);
    return () => clearTimeout(timeoutId);
  }, [snap]);

  return (
    <Drawer.Root 
      open
      modal={false}
      snapPoints={[0.13, 0.6, 0.92]} 
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Portal>
        <Drawer.Content 
          style={{
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
          }}
          aria-label={`App customization controls drawer. Currently ${snap > 0.7 ? 'fully open' : snap > 0.2 ? 'partially open' : 'closed'}.`}
        >
          <Drawer.Title className="sr-only">App Icon Mockup Controls</Drawer.Title>
          <Drawer.Description className="sr-only">
            Adjust the settings for the app icon mockup including app name, icon upload, background styles, 
            view modes, and export options. Swipe up or down to expand or collapse this controls panel.
          </Drawer.Description>
          
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
            role="button"
            aria-label={snap < 0.2 ? "Swipe up or tap to open controls" : "Drag handle to resize controls panel"}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Cycle through snap points
                if (snap < 0.2) {
                  setSnap(0.6);
                } else if (snap < 0.7) {
                  setSnap(0.92);
                } else {
                  setSnap(0.13);
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (snap < 0.9) {
                  setSnap(Math.min(0.92, snap + 0.3));
                }
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (snap > 0.2) {
                  setSnap(Math.max(0.13, snap - 0.3));
                }
              }
            }}
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
              aria-hidden="true"
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
                  aria-hidden="true"
                >
                  Swipe to customise
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Live region for announcing content changes */}
          <div 
            aria-live="polite" 
            aria-atomic="false"
            className="sr-only"
          >
            {snap > 0.2 ? 'Customization controls are now visible' : 'Customization controls are hidden'}
          </div>

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
            role="region"
            aria-label="App customization controls content"
            // Only make focusable when fully expanded
            tabIndex={snap > 0.5 ? 0 : -1}
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

          {/* Instructions for screen readers */}
          <div className="sr-only" role="region" aria-label="Usage instructions">
            To customize your app icon mockup: upload an icon, enter an app name, choose background styles, 
            select view modes, and adjust device settings. Use the download button to save your mockup when ready.
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
} 