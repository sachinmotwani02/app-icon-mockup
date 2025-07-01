import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { getSvgPath } from 'figma-squircle';

const DashedSquircle = ({ size, cornerRadius }) => {
  const path = getSvgPath({ width: size, height: size, cornerRadius, cornerSmoothing: 1 });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={path} stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
};

export default function IconCraftPromoCard() {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const base = import.meta.env.BASE_URL;
  const promoIcons = [
    `${base}marketing-icons/promo-icon-1.png`,
    `${base}marketing-icons/promo-icon-2.png`,
    `${base}marketing-icons/promo-icon-3.png`
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex(prevIndex => (prevIndex + 1) % promoIcons.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [promoIcons.length]);

  return (
    <a
      href="https://iconcraft.app"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: 'none',
        display: 'block',
      }}
    >
      <div
        style={{
          margin: '0 0 12px 0',
          padding: '16px',
          background: 'radial-gradient(circle at 50% 150%,rgb(143, 219, 252), #26CEF4)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          position: 'relative',
          boxSizing: 'border-box',
          cursor: 'pointer',
        }}>
        <h4 style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: '22px',
          color: 'white',
          letterSpacing: '-0.05em',
          lineHeight: '1.2',
          margin: 0,
          zIndex: 1,
          textAlign: 'center',
        }}>
          Create beautiful<br />app icons without<br />any design skills
        </h4>
        <div style={{
          position: 'relative',
          marginTop: '32px',
        }}>
          {/* Background/border with blend mode */}
          <div style={{
            padding: '8px 15px',
            border: '2px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '24px',
            mixBlendMode: 'soft-light',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            {/* Dashed box (left) */}
            <DashedSquircle size={48} cornerRadius={14} />
            {/* Placeholder for the icon (center) */}
            <div style={{ width: '60px', height: '48px' }}/>
            {/* Dashed box (right) */}
            <DashedSquircle size={48} cornerRadius={14} />
          </div>

          {/* Icon on top, with no blend mode, centered */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: 'calc(50% - 32px)',
            width: '64px',
            height: '64px',
          }}>
            <AnimatePresence>
              <motion.img
                key={currentIconIndex}
                src={promoIcons[currentIconIndex]}
                alt="promo icon"
                initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  position: 'absolute',
                }}
              />
            </AnimatePresence>
          </div>
        </div>
         <div style={{
          marginTop: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Explore IconCraft
          </span>
          <ArrowUpRight size={14} color="rgba(255, 255, 255, 0.9)" strokeWidth={2.5} />
        </div>
      </div>
    </a>
  );
} 