import React, { useState, useRef, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import ColorThief from 'colorthief';
import { motion, AnimatePresence } from 'framer-motion';
import domtoimage from 'dom-to-image-more';
import { Squircle } from '@squircle-js/react';
import ControlsPanel from './components/ControlsPanel';
import MobileControls from './components/MobileControls';
import { useMediaQuery } from './hooks/useMediaQuery';
import {
  rgbToHex,
  shuffleArray,
  getComplementary,
  lighten,
} from './utils/colors';

// SF Pro Font Constants
const SF_PRO_REGULAR = "'SFProRegular', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";
const SF_PRO_MEDIUM = "'SFProMedium', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";
const SF_PRO_BOLD = "'SFProBold', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

// Add global styles at the top of the file
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    min-height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
    background: #f8f9fa;
  }

  #root {
    width: 100%;
    min-height: 100%;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* High DPI optimization */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    img {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
  }

  /* Force hardware acceleration for smoother animations */
  .device-frame-container, .device-frame {
    will-change: transform;
    transform: translateZ(0);
  }
`;

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/png');
}

// iOS-Style Glass Dock Component with Displacement Effects
function LiquidGlassDock({ children, style, cornerRadius, uiScale, frameScale, viewMode, isDragging }) {
  const [shaderId] = useState(() => 'dock-liquid-' + Math.random().toString(36).substr(2, 9));
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [displacementImage, setDisplacementImage] = useState(null);

  // Generate radial lens displacement map
  const generateDisplacementMap = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.max(rect.width, 300);
    const height = Math.max(rect.height, 80);
    const radius = parseInt(cornerRadius) || 32;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2;
    
        const svgString = `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Horizontal displacement gradient -->
          <linearGradient id="red-${shaderId}" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="red"/>
            <stop offset="15%" stop-color="hsl(0 100% 52%)"/>
            <stop offset="50%" stop-color="hsl(0 0% 50%)"/>
            <stop offset="85%" stop-color="hsl(0 100% 48%)"/>
            <stop offset="100%" stop-color="hsl(0 100% 46%)"/>
          </linearGradient>
          <!-- Vertical displacement gradient -->
          <linearGradient id="green-${shaderId}" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="lime"/>
            <stop offset="15%" stop-color="hsl(120 100% 52%)"/>
            <stop offset="50%" stop-color="hsl(0 0% 50%)"/>
            <stop offset="85%" stop-color="hsl(120 100% 48%)"/>
            <stop offset="100%" stop-color="hsl(120 100% 46%)"/>
          </linearGradient>
          <!-- Edge mask for rounded corners -->
          <mask id="edge-mask-${shaderId}">
            <rect x="0" y="0" width="${width}" height="${height}" fill="black"/>
            <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="white"/>
          </mask>
        </defs>
        <!-- Base neutral -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="hsl(0 0% 50%)"/>
        <!-- X displacement -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#red-${shaderId})" mask="url(#edge-mask-${shaderId})" style="mix-blend-mode: multiply"/>
        <!-- Y displacement -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#green-${shaderId})" mask="url(#edge-mask-${shaderId})" style="mix-blend-mode: multiply"/>
      </svg>
    `;
    
    const encoded = encodeURIComponent(svgString);
    const dataUri = `data:image/svg+xml,${encoded}`;
    setDisplacementImage(dataUri);
  }, [shaderId, cornerRadius, viewMode, isDragging]);

  // Generate displacement map when component mounts or dimensions change
  useEffect(() => {
    const timer = setTimeout(generateDisplacementMap, 100);
    return () => clearTimeout(timer);
  }, [generateDisplacementMap]);

         // Background distortion displacement filter
  const createIOSGlassFilter = useCallback(() => {
    const baseScale = viewMode !== 'full' ? 6 : isDragging ? 8 : 4;
    const displacementBlur = viewMode !== 'full' ? 0.5 : isDragging ? 0.7 : 0.3;
    
    return (
      <svg ref={svgRef} style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id={shaderId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            {/* Displacement map source */}
            <feImage
              x="0"
              y="0"
              width="100%"
              height="100%"
              href={displacementImage}
              result="displacementMap"
            />
            
            {/* Radial backdrop distortion */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale={baseScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            
            {/* Minimal blur for smooth edges */}
            <feGaussianBlur in="displaced" stdDeviation={displacementBlur} />
          </filter>
        </defs>
      </svg>
    );
  }, [shaderId, displacementImage, viewMode, isDragging]);

  return (
    <>
      {/* iOS-style displacement filter */}
      {createIOSGlassFilter()}

      {/* Dock Container with iOS glass styling */}
      <div
        ref={containerRef}
        style={{
          ...style,
          backdropFilter: `blur(12px) url(#${shaderId}) brightness(1.1) saturate(1.5)`,
          WebkitBackdropFilter: `blur(12px) url(#${shaderId}) brightness(1.1) saturate(1.5)`,
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: cornerRadius || '32px',
          boxShadow: 'inset 0 1.5px 2px -1px rgba(255, 255, 255, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.15), 0px 12px 40px rgba(0, 0, 0, 0.25)',
        }}
      >
        {children}
      </div>
    </>
  );
}

function CustomAppIcon({ size, scale, customAppIcon, customAppName, edgeHighlighting, palette, onClick, hasLabel = true, isFocused = false }) {
  const dominantColor = palette.length > 0 ? rgbToHex(palette[0]) : '#34C759';
  const showPlaceholder = !customAppIcon;

  const squircleStyle = {
    backgroundColor: edgeHighlighting && !showPlaceholder ? dominantColor : (showPlaceholder ? '#34C759' : 'transparent'),
    cursor: showPlaceholder ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    border: showPlaceholder && !edgeHighlighting ? '2px dashed rgba(255,255,255,0.5)' : 'none',
    position: 'relative',
    overflow: 'hidden',
    padding: 0
  };

  const borderSpanStyle = {
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: "none",
      borderRadius: `${16 * scale}px`,
      padding: "1px",
      WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      position: 'relative', 
      zIndex: isFocused ? 25 : 1, 
      filter: isFocused ? 'brightness(1.1)' : 'none',
      transition: 'filter 0.3s ease'
    }}>
      <Squircle cornerRadius={16 * scale} cornerSmoothing={1} width={size} height={size} onClick={showPlaceholder ? onClick : undefined} style={squircleStyle}>
        {customAppIcon ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={customAppIcon}
              alt={customAppName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: edgeHighlighting ? 0.95 : 1,
                imageRendering: 'crisp-edges',
                display: 'block',
              }}
            />
            {edgeHighlighting && (
              <>
                <span style={{ ...borderSpanStyle, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, transparent 60%)', mixBlendMode: 'soft-light' }} />
                <span style={{ ...borderSpanStyle, background: 'linear-gradient(135deg, transparent 60%, rgba(255, 255, 255, 0.3) 100%)', mixBlendMode: 'soft-light' }} />
                <span style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', boxShadow: 'inset 0px 1px 2px rgba(255,255,255,0.1)' }} />
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ width: `${24 * scale}px`, height: `${24 * scale}px`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: `${16 * scale}px`, height: `${2 * scale}px`, background: 'white' }}></div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: `${2 * scale}px`, height: `${16 * scale}px`, background: 'white' }}></div>
            </div>
            <span style={{ color: 'white', fontSize: `${11 * scale}px`, marginTop: `${2 * scale}px`, fontWeight: '500' }}>TAP</span>
          </>
        )}
      </Squircle>
      {hasLabel && (
        <span style={{
          color: 'white',
          fontSize: `${12 * scale}px`,
          marginTop: `${6 * scale}px`,
          fontFamily: SF_PRO_REGULAR,
          textAlign: 'center',
          maxWidth: `${60 * scale}px`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textShadow: isFocused ? '0 0 8px rgba(255,255,255,0.3)' : 'none'
        }}>
          {customAppName}
        </span>
      )}
    </div>
  );
}

const base = import.meta.env.BASE_URL;

// Device frame options
const deviceOptions = {
  'black-titanium': {
    name: 'Black Titanium',
    image: `${base}black-titanium-iphone16pro.png`,
    frameWidth: 629,
    frameHeight: 1304,
    screenWidth: 582,
    screenHeight: 1264
  },
  'natural-titanium': {
    name: 'Natural Titanium',
    image: `${base}natural-titanium-iphone16pro.png`,
    frameWidth: 629,
    frameHeight: 1304,
    screenWidth: 582,
    screenHeight: 1264
  }
};

// Frame ratio map with smooth transitions
const ratioMap = {
  '1:1': { w: 900, h: 900 },
  '4:5': { w: 720, h: 900 },
  '16:9': { w: 1200, h: 675 },
  '3:4': { w: 675, h: 900 },
  '9:16': { w: 506, h: 900 },
  '4:3': { w: 1200, h: 900 }
};

export default function IOSHomeScreen() {
  const [customAppName, setCustomAppName] = useState("Your App");
  const [customAppIcon, setCustomAppIcon] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [wallpaperBlend, setWallpaperBlend] = useState(100);
  const fileInputRef = useRef(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawIcon, setRawIcon] = useState(null);
  const [viewMode, setViewMode] = useState('full');
  const [containerStyle, setContainerStyle] = useState('mesh');
  const [solidColor, setSolidColor] = useState('#ededed');
  const [gradientMain, setGradientMain] = useState('#ededed');
  const [gradientSecondary, setGradientSecondary] = useState('#ededed');
  const [meshColors, setMeshColors] = useState(['#ededed', '#e0e0e0', '#cccccc']);
  const [wallpaperMeshColors, setWallpaperMeshColors] = useState(['#ededed', '#e0e0e0', '#cccccc']);
  const [wallpaperColors, setWallpaperColors] = useState(['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']);
  const [palette, setPalette] = useState([
    [237, 237, 237], [200, 200, 200], [180, 180, 180], [220, 220, 220], [255, 255, 255]
  ]);
  const [frameRatio, setFrameRatio] = useState('4:3');
  const frameRef = useRef(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [selectedSolid, setSelectedSolid] = useState(0);
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [selectedMesh, setSelectedMesh] = useState(0);
  const [wallpaperBgColor, setWallpaperBgColor] = useState('#38bdf8');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hideOtherIcons, setHideOtherIcons] = useState(false);
  const [deviceZoom, setDeviceZoom] = useState(0.9);
  const [randomizeKey, setRandomizeKey] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('black-titanium');
  const [selectedWallpaper, setSelectedWallpaper] = useState('ios26-light');
  const [edgeHighlighting, setEdgeHighlighting] = useState(true);
  const [drawerSnap, setDrawerSnap] = useState(0.13);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const mainContentRef = useRef(null);
  const [containerDims, setContainerDims] = useState(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0, scale: 1 });
  const [isResizing, setIsResizing] = useState(false);

  // Wallpaper options with beautiful names and suggested background colors
  const wallpaperOptions = [
    { 
      id: 'ios26-light', 
      name: 'iOS 26', 
      file: 'ios26-light.jpg', 
      description: 'Official iOS 26 wallpaper',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      suggestedBgColor: '#f2f2f2' // Light blue
    },
    { 
      id: 'aurora-mountains', 
      name: 'Aurora Mountains', 
      file: 'aurora-mountains.jpg', 
      description: 'Majestic mountain aurora',
      backgroundSize: 'cover',
      backgroundPosition: 'center 30%',
      suggestedBgColor: '#e0eaff' // Deep purple
    },
    { 
      id: 'cosmic-nebula', 
      name: 'Cosmic Nebula', 
      file: 'cosmic-nebula.jpg', 
      description: 'Deep space colors',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      suggestedBgColor: '#f6ebff' // Deep purple
    },
    { 
      id: 'ocean-waves', 
      name: 'Ocean Waves', 
      file: 'ocean-waves.jpg', 
      description: 'Tranquil blue waters',
      backgroundSize: 'cover',
      backgroundPosition: 'center 40%',
      suggestedBgColor: '#c4d7fd' // Deep ocean blue
    },
    { 
      id: 'sunset-gradient', 
      name: 'Sunset Gradient', 
      file: 'sunset-gradient.jpg', 
      description: 'Warm evening tones',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      suggestedBgColor: '#eff6f2' // Warm red
    },
    { 
      id: 'forest-depths', 
      name: 'Forest Depths', 
      file: 'forest-depths.jpg', 
      description: 'Emerald forest canopy',
      backgroundSize: 'cover',
      backgroundPosition: 'center 20%',
      suggestedBgColor: '#012665' // Deep forest green
    },
    
  ];

  // UI scaling factor for the larger screen (580/402 ≈ 1.44)
  const getUIScale = () => {
    const device = deviceOptions[selectedDevice];
    // Scale based on screen width ratio
    return device.screenWidth / 402; // 402 was the original screen width
  };

  // Set default apps for initial view
  const defaultGridApps = [
    { name: "Calender", src: `${base}icons/calender.png` },
    { name: "Clock", src: `${base}icons/clock.png` },
    { name: "Facetime", src: `${base}icons/facetime.png` },
    { name: "App Store", src: `${base}icons/appstore.png` },
    { name: "Reminders", src: `${base}icons/reminder.png` },
    { name: "Photos", src: `${base}icons/gallery.png` },
    { name: "Camera", src: `${base}icons/camera.png` },
    { name: "Wallet", src: `${base}icons/wallet.png` },
    { name: "Weather", src: `${base}icons/weather.png` },
    { name: "Notes", src: `${base}icons/notes.png` },
    { name: "Books", src: `${base}icons/books.png` },
    { name: "Maps", src: `${base}icons/maps.png` },
  ];
  const defaultDockApps = [
      { name: "Phone", src: `${base}icons/call.png` },
      { name: "Safari", src: `${base}icons/safari.png` },
      { name: "Apple Music", src: `${base}icons/applemusic.png` },
      { name: "iMessage", src: `${base}icons/imessage.png` }
  ];

  const [gridApps, setGridApps] = useState(defaultGridApps);
  const [dockApps, setDockApps] = useState(defaultDockApps);

  // Function to randomize app positions
  const randomizeAppPositions = () => {
    const shuffledGridApps = shuffleArray([...defaultGridApps]);
    const shuffledDockApps = shuffleArray([...defaultDockApps]);
    setGridApps(shuffledGridApps);
    setDockApps(shuffledDockApps);
    setRandomizeKey(prev => prev + 1); // Force re-render with animation
  };

  const calculateSizes = useCallback(() => {
    if (!mainContentRef.current) return;

    const parentWidth = mainContentRef.current.clientWidth - 40; // Subtract padding
    const parentHeight = mainContentRef.current.clientHeight - 40; // Subtract padding
    
    if (parentWidth <= 0 || parentHeight <= 0) {
      return;
    }

    const ratioParts = ratioMap[frameRatio];
    const targetAspectRatio = ratioParts.w / ratioParts.h;
    
    let newWidth, newHeight;
    
    if (parentWidth / parentHeight > targetAspectRatio) {
      newHeight = parentHeight;
      newWidth = newHeight * targetAspectRatio;
    } else {
      newWidth = parentWidth;
      newHeight = newWidth / targetAspectRatio;
    }
    
    // Calculate iPhone frame size based on the new container dimensions
    const device = deviceOptions[selectedDevice];
    const baseWidth = device.frameWidth;
    const baseHeight = device.frameHeight;
    
    const maxWidth = newWidth * 0.9;
    const maxHeight = newHeight * 0.9;
    
    const scaleX = maxWidth / baseWidth;
    const scaleY = maxHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    // Batch state updates to prevent multiple re-renders
    React.startTransition(() => {
      setIsResizing(true);
      setContainerDims({ width: newWidth, height: newHeight });
    setFrameSize({
      width: baseWidth * scale,
      height: baseHeight * scale,
      scale: scale
      });
      // Reset resizing flag after a brief delay
      setTimeout(() => setIsResizing(false), 100);
    });
  }, [frameRatio, selectedDevice]);

  // Responsive frame sizing based on screen size
  useEffect(() => {
    const mainEl = mainContentRef.current;
    
    calculateSizes();
    
    // Debounce resize observer calls to prevent excessive re-renders
    let resizeTimeout;
    const debouncedCalculateSizes = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateSizes, 16); // 60fps throttling
    };
    
    const observer = new ResizeObserver(debouncedCalculateSizes);
    if (mainEl) {
        observer.observe(mainEl);
    }
    
    window.addEventListener('resize', debouncedCalculateSizes);
    
    return () => {
        clearTimeout(resizeTimeout);
        if (mainEl) {
            observer.unobserve(mainEl);
        }
        window.removeEventListener('resize', debouncedCalculateSizes);
    };
  }, [calculateSizes]);

  // Reset position when view mode changes
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    if (viewMode === 'full') {
      setDeviceZoom(0.9);
    } else {
      setDeviceZoom(2.5);
    }
  }, [viewMode]);

  // Use Color Thief to extract colors from the uploaded icon
  const extractColorsWithColorThief = (imageUrl) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const colorThief = new ColorThief();
      try {
        const dominant = colorThief.getColor(img);
        const pal = colorThief.getPalette(img, 6);
        setPalette(pal);
        const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        // Tasteful solid: lighten dominant
        setSolidColor(lighten(rgbToHex(dominant), 0.5));
        // Tasteful gradient: use palette if possible, fallback to complementary
        if (pal.length >= 2 && rgbToHex(pal[0]) !== rgbToHex(pal[1])) {
          setGradientMain(rgbToHex(pal[0]));
          setGradientSecondary(rgbToHex(pal[1]));
        } else {
          setGradientMain(rgbToHex(dominant));
          setGradientSecondary(getComplementary(rgbToHex(dominant)));
        }
        // Mesh: use up to 4 palette colors, fallback to variations
        let mesh = pal.slice(0, 4).map(rgbToHex);
        while (mesh.length < 4) mesh.push(lighten(rgbToHex(dominant), 0.2 * mesh.length));
        setMeshColors(mesh);
        setWallpaperMeshColors(mesh);
      } catch (e) {}
    };
    img.src = imageUrl;
  };

  // When a new app icon is uploaded and cropped, extract its colors
  useEffect(() => {
    if (customAppIcon) {
      extractColorsWithColorThief(customAppIcon);
    }
  }, [customAppIcon]);

  // Set suggested background color when switching wallpapers
  useEffect(() => {
    const currentWallpaper = wallpaperOptions.find(w => w.id === selectedWallpaper);
    if (currentWallpaper?.suggestedBgColor) {
      setWallpaperBgColor(currentWallpaper.suggestedBgColor);
    }
  }, [selectedWallpaper]);

  // Get container background based on style and extracted colors
  const getContainerBackground = () => {
    if (containerStyle === 'solid') {
      return solidColor;
    } else if (containerStyle === 'mesh') {
      const positions = [
        '20% 30%', '80% 70%', '60% 20%', '70% 80%'
      ];
      return [
        ...meshColors.map((color, i) =>
          `radial-gradient(circle at ${positions[i % positions.length]}, ${color} 0%, transparent 70%)`
        ),
        `linear-gradient(120deg, ${meshColors[0]} 0%, ${meshColors[1] || meshColors[0]} 100%)`
      ].join(',\n');
    } else if (containerStyle === 'wallpaper') {
      // Use solid color background for wallpaper mode
      return wallpaperBgColor;
    }
    return solidColor;
  };

  // Get wallpaper background with blend control
  const getWallpaperBackground = () => {
    // If wallpaper style is selected, use the selected wallpaper image
    if (containerStyle === 'wallpaper') {
      const selectedWallpaperFile = wallpaperOptions.find(w => w.id === selectedWallpaper)?.file || 'ios26-light.jpg';
      return `url("${base}${selectedWallpaperFile}")`;
    }
    
    // If no custom icon uploaded yet, keep wallpaper black
    if (!customAppIcon) {
      return '#000000';
    }
    
    // Calculate blend factor: 0% = black, 100% = full frame background
    const blendFactor = wallpaperBlend / 100;
    
    if (blendFactor === 0) {
      return '#000000'; // Pure black at 0%
    }
    
    // Blend with frame background
    if (containerStyle === 'solid') {
      // At 100%: show full frame color, at 0%: show black
      const hex = solidColor;
      let c = hex.substring(1);
      let frameRgb = [parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16)];
      // Interpolate between black (0,0,0) and frame color
      const blendedRgb = frameRgb.map(x => Math.round(x * blendFactor));
      return `#${blendedRgb.map(x=>x.toString(16).padStart(2,'0')).join('')}`;
    } else if (containerStyle === 'mesh') {
      // At 100%: show full mesh colors, at 0%: show black
      const blendedMeshColors = meshColors.map(color => {
        let c = color.substring(1);
        let frameRgb = [parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16)];
        // Interpolate between black (0,0,0) and frame color
        const blendedRgb = frameRgb.map(x => Math.round(x * blendFactor));
        return `#${blendedRgb.map(x=>x.toString(16).padStart(2,'0')).join('')}`;
      });
      const positions = [
        '20% 30%', '80% 70%', '60% 20%', '70% 80%'
      ];
      return [
        ...blendedMeshColors.map((color, i) =>
          `radial-gradient(circle at ${positions[i % positions.length]}, ${color} 0%, transparent 60%)`
        ),
        `linear-gradient(120deg, ${blendedMeshColors[0]} 0%, ${blendedMeshColors[1] || blendedMeshColors[0]} 100%)`
      ].join(',\n');
    }
    // Default: blend between black and dark gray
    const grayValue = Math.round(24 * blendFactor); // #18181c = rgb(24,24,28)
    return `rgb(${grayValue}, ${grayValue}, ${grayValue + Math.round(4 * blendFactor)})`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name.replace(/\.[^/.]+$/, ''));
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawIcon(event.target?.result);
        setShowCrop(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = useCallback(async () => {
    if (!rawIcon || !croppedAreaPixels) return;
    const croppedImgUrl = await getCroppedImg(rawIcon, croppedAreaPixels);
    setCustomAppIcon(croppedImgUrl);
    setShowCrop(false);
  }, [rawIcon, croppedAreaPixels]);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    // For touchmove, prevent default to stop scrolling
    if (e.touches) e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add event listeners for drag outside the frame
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [isDragging, dragStart]);

  const renderDock = () => {
    const dockPositions = {
      'dock-left': 0,
      'dock-right': 3
    };

    let dockRenderCounter = 0;
    const uiScale = getUIScale();

    return (
      <LiquidGlassDock
        cornerRadius={`${32 * uiScale * frameSize.scale}px`}
        uiScale={uiScale}
        frameScale={frameSize.scale}
        viewMode={viewMode}
        isDragging={isDragging}
        style={{
          margin: '0 auto 0',
          width: '98%',
          height: `${85 * uiScale * frameSize.scale}px`,
          position: 'relative',
          zIndex: focusMode ? 20 : 1,
          opacity: focusMode ? 0.9 : 1,
          padding: `0 ${12 * uiScale * frameSize.scale}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${26 * uiScale * frameSize.scale}px`,
          width: '100%',
          height: '100%'
        }}>
        {Array(4).fill(null).map((_, index) => {
          const isCustomApp = index === dockPositions[viewMode];
          const iconSize = 62 * uiScale * frameSize.scale;
          
          if (isCustomApp) {
            return (
              <CustomAppIcon
                key="custom-dock-icon"
                size={iconSize}
                scale={uiScale * frameSize.scale}
                customAppIcon={customAppIcon}
                customAppName={customAppName}
                edgeHighlighting={edgeHighlighting}
                palette={palette}
                onClick={handleIconClick}
                hasLabel={false}
                isFocused={focusMode}
              />
            );
          } else {
            const app = dockApps[dockRenderCounter++];
            return (
              <div key={`dock-${index}-${randomizeKey}`} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: hideOtherIcons ? 0 : (focusMode ? 0.4 : 1),
                visibility: hideOtherIcons ? 'hidden' : 'visible',
                pointerEvents: hideOtherIcons ? 'none' : 'auto',
                transition: 'opacity 0.3s ease'
              }}>
                <AppIcon 
                  name={app?.name} 
                  src={app?.src}
                  nolabel={true}
                  size={iconSize}
                  scale={uiScale * frameSize.scale}
                />
              </div>
            );
          }
        })}
        </div>
      </LiquidGlassDock>
    );
  };

  const renderAppGrid = () => {
    const positions = {
      'full': gridApps.length,
      'top-left': 0,
      'top-right': 3,
    };

    let appRenderCounter = 0;
    const uiScale = getUIScale();
    const iconSize = 62 * uiScale * frameSize.scale;
    const gridGap = 16 * uiScale * frameSize.scale;
    const rowGap = 24 * uiScale * frameSize.scale;

    return (
      <div className="app-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: `${gridGap}px`,
        rowGap: `${rowGap}px`,
        marginTop: `${35 * uiScale * frameSize.scale}px`,
        justifyItems: 'center',
        position: 'relative',
        zIndex: focusMode ? 20 : 1
      }}>
        {Array(gridApps.length + 1).fill(null).map((_, index) => {
          const isCustomApp = index === positions[viewMode];

          if (isCustomApp) {
            return (
              <CustomAppIcon
                key="custom-grid-icon"
                size={iconSize}
                scale={uiScale * frameSize.scale}
                customAppIcon={customAppIcon}
                customAppName={customAppName}
                edgeHighlighting={edgeHighlighting}
                palette={palette}
                onClick={handleIconClick}
                hasLabel={true}
                isFocused={focusMode}
              />
            );
          } else {
            const app = gridApps[appRenderCounter++];
            return (
              <div key={`${index}-${randomizeKey}`} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: hideOtherIcons ? 0 : (focusMode ? 0.4 : 1),
                visibility: hideOtherIcons ? 'hidden' : 'visible',
                pointerEvents: hideOtherIcons ? 'none' : 'auto',
                transition: 'opacity 0.3s ease'
              }}>
                <AppIcon 
                  name={app?.name} 
                  src={app?.src}
                  size={iconSize}
                  scale={uiScale * frameSize.scale}
                />
              </div>
            );
          }
        })}
      </div>
    );
  };

  // Export the frame exactly as-displayed using dom-to-image-more
  const handleDownload = async () => {
    if (!frameRef.current) return;

    try {
      // Ensure all fonts are loaded before capture
      await document.fonts.ready;
      
      // Add a small delay to ensure everything is fully rendered
      await new Promise(resolve => setTimeout(resolve, 300));

      const dataUrl = await domtoimage.toPng(frameRef.current, {
        quality: 1.0,
        pixelRatio: window.devicePixelRatio || 4,
        bgcolor: containerStyle === 'wallpaper' ? wallpaperBgColor : 'transparent',
        style: {
          // Force font rendering to be explicit
          fontDisplay: 'block',
          fontSmooth: 'always',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }
      });

      const link = document.createElement('a');
      const safeAppName = (customAppName || 'app-icon')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') || 'download';
        
      link.download = `iconcraft-mockup-${safeAppName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const controlProps = {
    customAppName, setCustomAppName,
    handleIconClick, fileInputRef, handleFileChange,
    customAppIcon,
    edgeHighlighting, setEdgeHighlighting,
    containerStyle, setContainerStyle,
    solidColor, setSolidColor,
    palette,
    meshColors, setMeshColors,
    selectedMesh, setSelectedMesh,
    wallpaperOptions, base,
    selectedWallpaper, setSelectedWallpaper,
    wallpaperBgColor, setWallpaperBgColor,
    wallpaperBlend, setWallpaperBlend,
    viewMode, setViewMode,
    focusMode, setFocusMode,
    hideOtherIcons, setHideOtherIcons,
    randomizeAppPositions,
    deviceOptions, selectedDevice, setSelectedDevice,
    deviceZoom, setDeviceZoom,
    frameRatio, setFrameRatio,
    ratioMap,
    handleDownload
  };

  const MobileHeader = () => (
          <div style={{
            padding: '24px 24px 20px 24px',
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <a href="https://iconcraft.app" target="_blank" rel="noopener">
                <img 
                  src={`${base}logo.svg`} 
                  alt="Iconcraft Logo" 
                  style={{
                    width: '90px',
                    height: '45px',
                    objectFit: 'contain',
                    opacity: 0.95
                  }}
                />
              </a>
            </div>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: '#2b2b2b',
              fontFamily: SF_PRO_MEDIUM,
              lineHeight: '1.4',
              textAlign: 'center',
              marginBottom: '12px',
               opacity: 0.9
            }}>
              iOS 26 App Icon Mockup Generator
            </h1>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: '#666',
              fontFamily: SF_PRO_REGULAR,
              lineHeight: '1.4',
              textAlign: 'center'
            }}>
            Create beautiful app icon mockups, showcasing your app icon on iphone 16 pro with ios 26 home screen and wallpapers.              
            </p>
          </div>
  );

                        return (
    <>
      <style>{globalStyles}</style>
      <div className="app-container" style={{
                          display: 'flex',
        height: '100vh',
        background: '#f8f9fa',
                            overflow: 'hidden',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Right Sidebar or Mobile Drawer */}
        {isMobile ? (
          <MobileControls {...controlProps} snap={drawerSnap} setSnap={setDrawerSnap} />
        ) : (
          <ControlsPanel {...controlProps} />
        )}

        {/* Main Content Area */}
        <div 
          className="main-content" 
          ref={mainContentRef}
                          style={{
          marginRight: isMobile ? '0' : '340px',
                            flex: 1,
          height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                flexDirection: 'column',
          padding: isMobile ? '20px 0' : '40px',
          background: '#f8f9fa'
        }}>
          {isMobile && (
            <AnimatePresence mode="wait">
              {drawerSnap < 0.2 && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ 
                    duration: 0.2, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    scale: { duration: 0.2 }
                  }}
                    style={{
                      position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100
                  }}
                >
                  <MobileHeader />
                </motion.div>
              )}
            </AnimatePresence>
          )}


          {/* Device Frame Container with Framer Motion */}
          {containerDims && (
          <motion.div
            ref={frameRef}
            className="device-frame-container"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: isMobile ? (drawerSnap - 0.13) * -500 : 0
            }}
            style={{
              position: 'relative',
              width: containerDims.width,
              height: containerDims.height,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              background: getContainerBackground(),
              borderRadius: '30px',
              padding: '20px',
              transition: isResizing 
                ? 'none' 
                : 'background 0.7s cubic-bezier(.4,2,.6,1), width 0.3s ease, height 0.3s ease',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              zIndex: 50
            }}
            transition={{
              type: "tween",
              duration: isResizing ? 0 : 0, 
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
          {/* Device Frame */}
          <div 
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="device-frame"
            style={{
              position: 'relative',
              width: `${frameSize.width}px`,
              height: `${frameSize.height}px`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: isDragging 
                ? 'none' 
                : isResizing 
                  ? 'width 0.3s ease, height 0.3s ease'
                  : 'all 0.3s ease',
              transform: `translate(${position.x}px, ${position.y}px) scale(${deviceZoom})`,
              transformOrigin: (() => {
                switch (viewMode) {
                  case 'top-left': return 'top left';
                  case 'top-right': return 'top right';
                  case 'dock-left': return 'bottom left';
                  case 'dock-right': return 'bottom right';
                  default: return 'center';
                }
              })(),
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              marginLeft: viewMode === 'top-left' || viewMode === 'dock-left' ? '100px' : 0,
              marginRight: viewMode === 'top-right' || viewMode === 'dock-right' ? '100px' : 0,
              marginTop: viewMode === 'top-left' || viewMode === 'top-right' ? '100px' : 0,
              marginBottom: viewMode === 'dock-left' || viewMode === 'dock-right' ? '100px' : 0,
            }}
          >
            {/* PNG Device Frame Background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url("${deviceOptions[selectedDevice].image}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              pointerEvents: 'none',
              zIndex: 2
            }}></div>
            
            {/* Screen Content Container */}
            <div 
              key={`screen-${selectedWallpaper}-${containerStyle}`}
              className="device-screen" 
              style={{
                width: `${deviceOptions[selectedDevice].screenWidth * frameSize.scale}px`,
                height: `${deviceOptions[selectedDevice].screenHeight * frameSize.scale}px`,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                ...(containerStyle === 'wallpaper' ? {
                  backgroundImage: getWallpaperBackground(),
                  backgroundSize: wallpaperOptions.find(w => w.id === selectedWallpaper)?.backgroundSize || 'cover',
                  backgroundPosition: wallpaperOptions.find(w => w.id === selectedWallpaper)?.backgroundPosition || 'center center',
                  backgroundRepeat: 'no-repeat',
                  backgroundAttachment: 'scroll'
                } : {
                  background: getWallpaperBackground(),
                  backgroundSize: 'initial',
                  backgroundPosition: 'initial',
                  backgroundRepeat: 'initial',
                  backgroundAttachment: 'initial'
                }),
                borderRadius: `${55 * frameSize.scale}px`,
                overflow: 'hidden',
                zIndex: 1
              }}>

              {/* Focus Mode Overlay */}
              {focusMode && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.75)',
                  zIndex: 15,
                  pointerEvents: 'none'
                }} />
              )}

              {/* Status Bar */}
              <div style={{
                position: 'absolute',
                top: `${24 * getUIScale() * frameSize.scale}px`,
                left: '0',
                right: '0',
                height: `${22 * getUIScale() * frameSize.scale}px`,
                padding: '0',
                zIndex: 10
              }}>
                <svg width={deviceOptions[selectedDevice].screenWidth * frameSize.scale} height={22 * getUIScale() * frameSize.scale} viewBox={`0 0 ${deviceOptions[selectedDevice].screenWidth} 22`} fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x={61 * getUIScale()} y="17" fill="white" style={{ fontFamily: SF_PRO_MEDIUM, fontSize: `${17 * getUIScale()}px`, fontWeight: '600' }}>9:41</text>
                  <g transform={`scale(${getUIScale()})`}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M307.865 6.03301C307.865 5.39996 307.388 4.88678 306.798 4.88678H305.732C305.143 4.88678 304.665 5.39996 304.665 6.03301V15.967C304.665 16.6 305.143 17.1132 305.732 17.1132H306.798C307.388 17.1132 307.865 16.6 307.865 15.967V6.03301ZM300.431 7.33206H301.498C302.087 7.33206 302.564 7.85756 302.564 8.5058V15.9395C302.564 16.5877 302.087 17.1132 301.498 17.1132H300.431C299.842 17.1132 299.364 16.5877 299.364 15.9395V8.5058C299.364 7.85756 299.842 7.33206 300.431 7.33206ZM296.099 9.98111H295.033C294.444 9.98111 293.966 10.5133 293.966 11.1698V15.9245C293.966 16.581 294.444 17.1132 295.033 17.1132H296.099C296.688 17.1132 297.166 16.581 297.166 15.9245V11.1698C297.166 10.5133 296.688 9.98111 296.099 9.98111ZM290.798 12.4264H289.732C289.143 12.4264 288.665 12.951 288.665 13.5981V15.9415C288.665 16.5886 289.143 17.1132 289.732 17.1132H290.798C291.388 17.1132 291.865 16.5886 291.865 15.9415V13.5981C291.865 12.951 291.388 12.4264 290.798 12.4264Z" fill="white"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M323.436 7.30216C325.924 7.30226 328.316 8.22435 330.118 9.87783C330.254 10.0055 330.471 10.0039 330.604 9.87422L331.902 8.61075C331.97 8.54499 332.007 8.45591 332.007 8.36323C332.006 8.27055 331.967 8.18191 331.899 8.11691C327.168 3.7422 319.704 3.7422 314.973 8.11691C314.905 8.18186 314.866 8.27047 314.865 8.36316C314.865 8.45584 314.902 8.54494 314.97 8.61075L316.268 9.87422C316.401 10.0041 316.618 10.0057 316.754 9.87783C318.557 8.22424 320.949 7.30215 323.436 7.30216ZM323.433 11.5224C324.79 11.5223 326.099 12.0341 327.105 12.9582C327.242 13.0894 327.456 13.0865 327.589 12.9518L328.876 11.6325C328.944 11.5633 328.981 11.4694 328.98 11.3719C328.979 11.2743 328.94 11.1812 328.871 11.1134C325.807 8.2226 321.062 8.2226 317.998 11.1134C317.929 11.1812 317.89 11.2744 317.889 11.3719C317.888 11.4695 317.925 11.5634 317.993 11.6325L319.28 12.9518C319.413 13.0865 319.627 13.0894 319.763 12.9582C320.769 12.0347 322.077 11.523 323.433 11.5224ZM325.958 14.316C325.959 14.4213 325.922 14.5229 325.855 14.5967L323.678 17.0514C323.615 17.1236 323.528 17.1642 323.437 17.1642C323.346 17.1642 323.259 17.1236 323.195 17.0514L321.018 14.5967C320.951 14.5229 320.914 14.4212 320.916 14.3159C320.918 14.2105 320.959 14.1108 321.029 14.0402C322.419 12.7263 324.455 12.7263 325.845 14.0402C325.915 14.1108 325.956 14.2106 325.958 14.316Z" fill="white"/>
                    <rect opacity="0.35" x="339.507" y="5" width="24" height="12" rx="3.8" stroke="white"/>
                    <path opacity="0.4" d="M365.007 9.28113V13.3566C365.812 13.0114 366.335 12.2085 366.335 11.3189C366.335 10.4293 365.812 9.6263 365.007 9.28113" fill="white"/>
                    <rect x="341.007" y="6.5" width="21" height="9" rx="2.5" fill="white"/>
                  </g>
                </svg>
              </div>

              {/* Home Screen Content */}
              <div style={{
                position: 'absolute',
                top: `${54 * getUIScale() * frameSize.scale}px`,
                left: '0',
                right: '0',
                bottom: '0',
                padding: `0 ${24 * getUIScale() * frameSize.scale}px`,
                display: 'flex',
                flexDirection: 'column'
              }}>
                {renderAppGrid()}

                {/* Spacer to push dock to bottom */}
                <div style={{ flex: 1 }} />

                {/* Bottom Section with Dock and Dots */}
                <div>
                  {/* Page Dots (Pagination UI) */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: `${6 * getUIScale() * frameSize.scale}px`,
                    marginBottom: `${18 * getUIScale() * frameSize.scale}px`
                  }}>
                    <div style={{
                      width: `${5 * getUIScale() * frameSize.scale}px`,
                      height: `${5 * getUIScale() * frameSize.scale}px`,
                      borderRadius: '50%',
                      background: 'white'
                    }}></div>
                    <div style={{
                      width: `${5 * getUIScale() * frameSize.scale}px`,
                      height: `${5 * getUIScale() * frameSize.scale}px`,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.3)'
                    }}></div>
                  </div>
                  {renderDock()}
                  {/* Extra margin after dock */}
                  <div style={{ height: `${32 * getUIScale() * frameSize.scale}px` }} />
                </div>
              </div>
            </div>
            

          </div>
          </motion.div>
        )}
        </div>
      </div>
      
      {!isMobile && (
      <a 
        href="https://iconcraft.app" 
        target="_blank" 
        rel="noopener" 
        style={{
          position: 'fixed',
          bottom: '15px',
          left: '24px',
          zIndex: 1001,
          textDecoration: 'none'
        }}
      >
        <img
          src={`${base}logo.svg`}
          alt="Iconcraft Logo"
          style={{
            width: '90px',
            height: 'auto',
            objectFit: 'contain',
            opacity: 0.4,
            transition: 'opacity 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = 0.7; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.4; }}
        />
      </a>
      )}
      
      {showCrop && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '90%',
            maxWidth: '500px',
            height: '600px',
            background: '#1a1a1a',
            borderRadius: '20px',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              color: 'white',
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: '600',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}>Crop App Icon</h3>
            
            <div style={{
              width: '100%',
              height: '400px',
              position: 'relative',
              background: '#000',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <Cropper
                image={rawIcon}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
                style={{
                  containerStyle: {
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000'
                  }
                }}
              />
            </div>

            {/* Zoom Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '20px',
              padding: '0 10px'
            }}>
              <span style={{
                color: 'white',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{
                  flex: 1,
                  height: '4px',
                  WebkitAppearance: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '2px',
                  outline: 'none'
                }}
              />
              <span style={{
                color: 'white',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                minWidth: '40px',
                textAlign: 'right'
              }}>{Math.round(zoom * 100)}%</span>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowCrop(false)}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    background: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                style={{
                  padding: '12px 24px',
                  background: '#03B1FC',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    background: '#028bcc'
                  }
                }}
              >
                Save Icon
              </button>
            </div>

            {/* Instructions */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              Drag to position • Pinch to zoom • Use slider for precise zoom
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AppIcon({ src, name, nolabel = false, size = 62, scale = 1 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Squircle
        cornerRadius={16 * scale}
        cornerSmoothing={1}
        width={size}
        height={size}
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          background: '#222',
          overflow: 'hidden'
        }}
      >
        <img
          src={src}
          alt={name}
          style={{
            width: '110%',
            height: '110%',
            objectFit: 'cover',
            transform: 'translate(-5%, -5%)',
            imageRendering: 'crisp-edges'
          }}
        />
      </Squircle>
      {!nolabel && (
        <span style={{
          color: 'white',
          fontSize: `${11 * scale}px`,
          marginTop: `${6 * scale}px`,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          textAlign: 'center',
          maxWidth: `${size}px`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {name}
        </span>
      )}
    </div>
  );
}