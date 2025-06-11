import React, { useState, useRef, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import ColorThief from 'colorthief';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Shuffle, Sun, Moon, Upload, Pencil, ChevronDown, ChevronUp } from 'lucide-react';

// Add global styles at the top of the file
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #f8f9fa;
  }

  #root {
    width: 100%;
    height: 100%;
  }
`;

// Helper to convert [r,g,b] to hex
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

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

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getComplementary(hex) {
  // Convert hex to HSL, shift hue by 180deg, return hex
  let c = hex.substring(1);
  let rgb = [parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16)];
  let r = rgb[0]/255, g = rgb[1]/255, b = rgb[2]/255;
  let max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if(max===min){h=s=0;}else{
    let d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h = (g-b)/d + (g<b?6:0); break;
      case g: h = (b-r)/d + 2; break;
      case b: h = (r-g)/d + 4; break;
    }
    h /= 6;
  }
  h = (h*360+180)%360; if(h<0) h+=360; h/=360;
  let q = l<0.5?l*(1+s):l+s-l*s;
  let p = 2*l-q;
  let toRGB = t=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
  let r2 = Math.round(toRGB(h+1/3)*255);
  let g2 = Math.round(toRGB(h)*255);
  let b2 = Math.round(toRGB(h-1/3)*255);
  return `#${((1<<24)+(r2<<16)+(g2<<8)+b2).toString(16).slice(1)}`;
}

function lighten(hex, amt) {
  let c = hex.substring(1);
  let rgb = [parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16)];
  rgb = rgb.map(x => Math.min(255, Math.round(x + (255-x)*amt)));
  return `#${rgb.map(x=>x.toString(16).padStart(2,'0')).join('')}`;
}

// Helper to get HSL from hex
function hexToHSL(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

// Helper to get analogous color
function getAnalogous(hex, angle = 30) {
  let [h, s, l] = hexToHSL(hex);
  h = (h + angle) % 360;
  s = Math.max(0.2, s); // ensure some saturation
  l = Math.min(0.9, Math.max(0.1, l));
  // Convert back to hex
  l = Math.round(l * 100) / 100;
  s = Math.round(s * 100) / 100;
  h = Math.round(h);
  // HSL to RGB
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r1, g1, b1;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  let r = Math.round((r1 + m) * 255);
  let g = Math.round((g1 + m) * 255);
  let b = Math.round((b1 + m) * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Curated palette options
function getSolidOptions(palette) {
  const hexes = palette.map(rgbToHex);
  const dominant = hexes[0] || '#ededed';
  return [
    lighten(dominant, 0.3),
    getComplementary(dominant),
    getAnalogous(dominant, 30)
  ];
}

function getGradientOptions(palette) {
  const hexes = palette.map(rgbToHex);
  const dominant = hexes[0] || '#ededed';
  const comp = getComplementary(dominant);
  return [
    [dominant, comp],
    [dominant, lighten(dominant, 0.25)],
    [dominant, getAnalogous(dominant, 30)]
  ];
}

function getMeshOptions(palette) {
  const hexes = palette.map(rgbToHex);
  const dominant = hexes[0] || '#ededed';
  const comp = getComplementary(dominant);
  return [
    [dominant, lighten(dominant, 0.2), getAnalogous(dominant, 30), comp],
    [dominant, comp, getAnalogous(dominant, -30), lighten(dominant, 0.4)],
    [dominant, hexes[1] || comp, hexes[2] || getAnalogous(dominant, 60), hexes[3] || lighten(dominant, 0.6)]
  ];
}

export default function IOSHomeScreen() {
  const [customAppName, setCustomAppName] = useState("Your App");
  const [customAppIcon, setCustomAppIcon] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawIcon, setRawIcon] = useState(null);
  const [viewMode, setViewMode] = useState('full');
  const [containerStyle, setContainerStyle] = useState('gradient');
  const [solidColor, setSolidColor] = useState('#ededed');
  const [gradientMain, setGradientMain] = useState('#ededed');
  const [gradientSecondary, setGradientSecondary] = useState('#ededed');
  const [meshColors, setMeshColors] = useState(['#ededed', '#e0e0e0', '#cccccc']);
  const [wallpaperMeshColors, setWallpaperMeshColors] = useState(['#ededed', '#e0e0e0', '#cccccc']);
  const [palette, setPalette] = useState([
    [237, 237, 237], [200, 200, 200], [180, 180, 180], [220, 220, 220], [255, 255, 255]
  ]);
  const [wallpaperStyle, setWallpaperStyle] = useState('plain');
  const [frameRatio, setFrameRatio] = useState('4:3');
  const frameRef = useRef(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [selectedSolid, setSelectedSolid] = useState(0);
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [selectedMesh, setSelectedMesh] = useState(0);
  const [showSolidCustomize, setShowSolidCustomize] = useState(false);
  const [blendWallpaper, setBlendWallpaper] = useState(false);

  // Frame ratio map with smooth transitions
  const ratioMap = {
    '1:1': { w: 900, h: 900 },
    '4:5': { w: 720, h: 900 },
    '16:9': { w: 1200, h: 675 },
    '3:4': { w: 675, h: 900 },
    '9:16': { w: 506, h: 900 },
    '4:3': { w: 1200, h: 900 }
  };

  // Reset position when view mode changes
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
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

  // Randomize gradient colors (palette if possible, fallback to complementary/analogous)
  function randomizeGradient() {
    if (!palette.length) return;
    const shuffled = shuffleArray(palette);
    const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    if (shuffled.length >= 2 && rgbToHex(shuffled[0]) !== rgbToHex(shuffled[1])) {
      setGradientMain(rgbToHex(shuffled[0]));
      setGradientSecondary(rgbToHex(shuffled[1]));
    } else {
      const main = rgbToHex(shuffled[0]);
      const useComplementary = Math.random() > 0.5;
      let secondary = useComplementary ? getComplementary(main) : lighten(main, 0.3);
      setGradientMain(main);
      setGradientSecondary(secondary);
    }
  }

  // Randomize mesh colors for device container
  function randomizeMesh() {
    if (!palette.length) return;
    const shuffled = shuffleArray(palette);
    const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    let mesh = shuffled.slice(0, 4).map(rgbToHex);
    while (mesh.length < 4) mesh.push(lighten(rgbToHex(shuffled[0]), 0.2 * mesh.length));
    setMeshColors(mesh);
  }

  // Randomize mesh colors for wallpaper
  function randomizeWallpaperMesh() {
    if (!palette.length) return;
    const shuffled = shuffleArray(palette);
    const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    let mesh = shuffled.slice(0, 4).map(rgbToHex);
    while (mesh.length < 4) mesh.push(lighten(rgbToHex(shuffled[0]), 0.2 * mesh.length));
    setWallpaperMeshColors(mesh);
  }

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
    }
    return solidColor;
  };

  // Get wallpaper background
  const getWallpaperBackground = () => {
    if (!blendWallpaper) {
      return '#18181c';
    } else {
      // Blend with frame background using similar style but darker/more transparent
      if (containerStyle === 'solid') {
        // Use a darker version of the solid color
        const hex = solidColor;
        let c = hex.substring(1);
        let rgb = [parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16)];
        rgb = rgb.map(x => Math.max(0, Math.round(x * 0.6))); // More generous color pass-through
        return `#${rgb.map(x=>x.toString(16).padStart(2,'0')).join('')}`;
      } else if (containerStyle === 'mesh') {
        // Use mesh colors but darker with more generous pass-through
        const darkerMeshColors = meshColors.map(color => {
          let c = color.substring(1);
          let rgb = [parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16)];
          rgb = rgb.map(x => Math.max(0, Math.round(x * 0.4))); // More generous color pass-through
          return `#${rgb.map(x=>x.toString(16).padStart(2,'0')).join('')}`;
        });
        const positions = [
          '20% 30%', '80% 70%', '60% 20%', '70% 80%'
        ];
        return [
          ...darkerMeshColors.map((color, i) =>
            `radial-gradient(circle at ${positions[i % positions.length]}, ${color} 0%, transparent 60%)`
          ),
          `linear-gradient(120deg, ${darkerMeshColors[0]} 0%, ${darkerMeshColors[1] || darkerMeshColors[0]} 100%)`
        ].join(',\n');
      }
      return '#18181c';
    }
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

  const getViewStyles = () => {
    switch (viewMode) {
      case 'top-left':
        return {
          transform: 'scale(2.5)',
          transformOrigin: 'top left',
          marginLeft: '100px',
          marginTop: '100px'
        };
      case 'top-right':
        return {
          transform: 'scale(2.5)',
          transformOrigin: 'top right',
          marginRight: '100px',
          marginTop: '100px'
        };
      case 'dock-left':
        return {
          transform: 'scale(2.5)',
          transformOrigin: 'bottom left',
          marginLeft: '100px',
          marginBottom: '100px'
        };
      case 'dock-right':
        return {
          transform: 'scale(2.5)',
          transformOrigin: 'bottom right',
          marginRight: '100px',
          marginBottom: '100px'
        };
      default:
        return {};
    }
  };

  const renderDock = () => {
    const dockPositions = {
      'dock-left': 0,
      'dock-right': 3
    };

    const dockApps = [
      { name: "Phone", src: "src/assets/icons/call.png" },
      { name: "Safari", src: "src/assets/icons/safari.png" },
      { name: "Messages", src: "src/assets/icons/imessage.png" },
      { name: "Music", src: "src/assets/icons/applemusic.png" }
    ];

    return (
      <div style={{
        margin: '0 auto 0',
        width: '98%',
        height: '85px',
        background: focusMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(30px) saturate(180%)',
        borderRadius: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '26px',
        border: '0.5px solid rgba(255,255,255,0.2)',
        padding: '0 12px',
        position: 'relative',
        zIndex: focusMode ? 20 : 1
      }}>
        {dockApps.map((app, index) => {
          const isCustomApp = index === dockPositions[viewMode];
          const style = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: isCustomApp ? (focusMode ? 25 : 1) : 1,
          };

          if (isCustomApp && focusMode) {
            style.filter = 'brightness(1.1)';
            style.transform = 'scale(1.02)';
            style.transition = 'all 0.3s ease';
          }

          return isCustomApp ? (
            <div key={index} style={style}>
              <div
                onClick={handleIconClick}
                style={{
                  width: '62px',
                  height: '62px',
                  borderRadius: '14px',
                  backgroundColor: customAppIcon ? 'transparent' : '#34C759',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  border: customAppIcon ? 'none' : '2px dashed rgba(255,255,255,0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: 0
                }}
              >
                {customAppIcon ? (
                  <img
                    src={customAppIcon}
                    alt={customAppName}
                    style={{
                      width: '62px',
                      height: '62px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      imageRendering: 'auto',
                      display: 'block',
                    }}
                  />
                ) : (
                  <>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '16px',
                        height: '2px',
                        background: 'white'
                      }}></div>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '2px',
                        height: '16px',
                        background: 'white'
                      }}></div>
                    </div>
                    <span style={{
                      color: 'white',
                      fontSize: '11px',
                      marginTop: '2px',
                      fontWeight: '500'
                    }}>TAP</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div key={index} style={{
              ...style,
              opacity: focusMode ? 0.4 : 1,
              transition: 'all 0.3s ease'
            }}>
              <AppIcon 
                name={app.name} 
                src={app.src}
                nolabel={true}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderAppGrid = () => {
    const positions = {
      'full': 8, // 9th position (index 8)
      'top-left': 0, // First position
      'top-right': 3, // Fourth position
    };

    // Create array of default app icons
    const defaultApps = [
      { name: "Messages", src: "src/assets/icons/imessage.png" },
      { name: "Calendar", src: "src/assets/icons/calender.png" },
      { name: "Photos", src: "src/assets/icons/gallery.png" },
      { name: "Camera", src: "src/assets/icons/clock.png" },
      { name: "Mail", src: "src/assets/icons/mail.png" },
      { name: "Weather", src: "src/assets/icons/weather.png" },
      { name: "Notes", src: "src/assets/icons/fitness.png" },
      { name: "App Store", src: "src/assets/icons/appstore.png" }
    ];

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        rowGap: '24px',
        marginTop: '35px',
        justifyItems: 'center',
        position: 'relative',
        zIndex: focusMode ? 20 : 1
      }}>
        {Array(9).fill(null).map((_, index) => {
          const isCustomApp = index === positions[viewMode];
          const style = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: isCustomApp ? (focusMode ? 25 : 1) : 1,
          };

          if (isCustomApp && focusMode) {
            style.filter = 'brightness(1.1)';
            style.transform = 'scale(1.02)';
            style.transition = 'all 0.3s ease';
          }

          return isCustomApp ? (
            <div key={index} style={style}>
              <div
                onClick={handleIconClick}
                style={{
                  width: '62px',
                  height: '62px',
                  borderRadius: '14px',
                  backgroundColor: customAppIcon ? 'transparent' : '#34C759',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  border: customAppIcon ? 'none' : '2px dashed rgba(255,255,255,0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: 0
                }}
              >
                {customAppIcon ? (
                  <img
                    src={customAppIcon}
                    alt={customAppName}
                    style={{
                      width: '62px',
                      height: '62px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      imageRendering: 'auto',
                      display: 'block',
                    }}
                  />
                ) : (
                  <>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '16px',
                        height: '2px',
                        background: 'white'
                      }}></div>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '2px',
                        height: '16px',
                        background: 'white'
                      }}></div>
                    </div>
                    <span style={{
                      color: 'white',
                      fontSize: '11px',
                      marginTop: '2px',
                      fontWeight: '500'
                    }}>TAP</span>
                  </>
                )}
              </div>
              <span style={{
                color: 'white',
                fontSize: '12px',
                marginTop: '6px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                textAlign: 'center',
                maxWidth: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textShadow: focusMode ? '0 0 8px rgba(255,255,255,0.3)' : 'none'
              }}>
                {customAppName}
              </span>
            </div>
          ) : (
            <div key={index} style={{
              ...style,
              opacity: focusMode ? 0.4 : 1,
              transition: 'all 0.3s ease'
            }}>
              <AppIcon 
                name={defaultApps[index]?.name} 
                src={defaultApps[index]?.src}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
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
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, dragStart]);

  // Download frame as PNG with improved quality
  const handleDownload = async () => {
    if (!frameRef.current) return;
    
    // Create a temporary container to render the frame at full resolution
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);
    
    // Clone the frame and its contents
    const frameClone = frameRef.current.cloneNode(true);
    tempContainer.appendChild(frameClone);
    
    // Set the clone to the target size
    const { w, h } = ratioMap[frameRatio];
    frameClone.style.width = `${w}px`;
    frameClone.style.height = `${h}px`;
    
    // Ensure the app icon is rendered at full resolution
    const appIcon = frameClone.querySelector('img[alt="Preview"]');
    if (appIcon && customAppIcon) {
      appIcon.style.width = '62px';
      appIcon.style.height = '62px';
      appIcon.style.imageRendering = 'pixelated';
    }
    
    try {
      const canvas = await html2canvas(frameClone, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded
          const images = clonedDoc.getElementsByTagName('img');
          return Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          }));
        }
      });
      
      // Convert to PNG with maximum quality
      const link = document.createElement('a');
      const base = uploadedFileName || 'appicon';
      link.download = `${base}mockup.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } finally {
      // Clean up
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f8f9fa',
        padding: '40px'
      }}>
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            iOS App Icon Mockup Generator
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.5',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            Create beautiful iOS app icon mockups. Upload your icon, customize the name, and see how it looks on a realistic iPhone interface.
          </p>
        </div>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '40px',
        alignItems: 'center',
        justifyContent: 'center',
          flex: 1
        }}>
          {/* Device Frame Container with Framer Motion */}
          <motion.div
            ref={frameRef}
            style={{
          position: 'relative',
              width: ratioMap[frameRatio].w,
              height: ratioMap[frameRatio].h,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
              background: getContainerBackground(),
          borderRadius: '30px',
              padding: '20px',
              transition: 'background 0.7s cubic-bezier(.4,2,.6,1)'
            }}
            animate={{
              width: ratioMap[frameRatio].w,
              height: ratioMap[frameRatio].h
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
          {/* Device Frame */}
          <div 
            onMouseDown={handleDragStart}
            style={{
              position: 'relative',
              width: '450px',
              height: '920px',
              backgroundImage: 'url("src/assets/iPhone 16 Pro - Black Titanium - Portrait.png")',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: isDragging ? 'none' : 'all 0.3s ease',
              transform: `translate(${position.x}px, ${position.y}px) scale(${viewMode === 'full' ? 1 : 2.5})`,
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
            {/* Screen Content Container */}
            <div style={{
              width: '402px',
              height: '874px',
              position: 'relative',
                background: getWallpaperBackground(),
              borderRadius: '60px',
              overflow: 'hidden',
            }}>
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
              {/* Dynamic Island */}
              <div style={{
                position: 'absolute',
                top: '11px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '120px',
                height: '35px',
                background: '#010101',
                borderRadius: '20px',
                zIndex: 20
              }}></div>

              {/* Side Buttons */}
              <div style={{
                position: 'absolute',
                left: '-21px',
                top: '115px',
                width: '3px',
                height: '32px',
                background: '#1e1824',
                borderRadius: '2px',
                boxShadow: '0 60px #1e1824, 0 140px #1e1824'
              }}></div>

              {/* Power Button */}
              <div style={{
                position: 'absolute',
                right: '-21px',
                top: '200px',
                width: '3px',
                height: '100px',
                background: '#1e1824',
                borderRadius: '2px'
              }}></div>
            
              {/* Status Bar */}
              <div style={{
                position: 'absolute',
                top: '18px',
                left: '0',
                right: '0',
                height: '22px',
                padding: '0',
                zIndex: 10
              }}>
                <svg width="402" height="22" viewBox="0 0 402 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="61" y="17" fill="white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', fontSize: '17px', fontWeight: '600' }}>9:41</text>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M307.865 6.03301C307.865 5.39996 307.388 4.88678 306.798 4.88678H305.732C305.143 4.88678 304.665 5.39996 304.665 6.03301V15.967C304.665 16.6 305.143 17.1132 305.732 17.1132H306.798C307.388 17.1132 307.865 16.6 307.865 15.967V6.03301ZM300.431 7.33206H301.498C302.087 7.33206 302.564 7.85756 302.564 8.5058V15.9395C302.564 16.5877 302.087 17.1132 301.498 17.1132H300.431C299.842 17.1132 299.364 16.5877 299.364 15.9395V8.5058C299.364 7.85756 299.842 7.33206 300.431 7.33206ZM296.099 9.98111H295.033C294.444 9.98111 293.966 10.5133 293.966 11.1698V15.9245C293.966 16.581 294.444 17.1132 295.033 17.1132H296.099C296.688 17.1132 297.166 16.581 297.166 15.9245V11.1698C297.166 10.5133 296.688 9.98111 296.099 9.98111ZM290.798 12.4264H289.732C289.143 12.4264 288.665 12.951 288.665 13.5981V15.9415C288.665 16.5886 289.143 17.1132 289.732 17.1132H290.798C291.388 17.1132 291.865 16.5886 291.865 15.9415V13.5981C291.865 12.951 291.388 12.4264 290.798 12.4264Z" fill="white"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M323.436 7.30216C325.924 7.30226 328.316 8.22435 330.118 9.87783C330.254 10.0055 330.471 10.0039 330.604 9.87422L331.902 8.61075C331.97 8.54499 332.007 8.45591 332.007 8.36323C332.006 8.27055 331.967 8.18191 331.899 8.11691C327.168 3.7422 319.704 3.7422 314.973 8.11691C314.905 8.18186 314.866 8.27047 314.865 8.36316C314.865 8.45584 314.902 8.54494 314.97 8.61075L316.268 9.87422C316.401 10.0041 316.618 10.0057 316.754 9.87783C318.557 8.22424 320.949 7.30215 323.436 7.30216ZM323.433 11.5224C324.79 11.5223 326.099 12.0341 327.105 12.9582C327.242 13.0894 327.456 13.0865 327.589 12.9518L328.876 11.6325C328.944 11.5633 328.981 11.4694 328.98 11.3719C328.979 11.2743 328.94 11.1812 328.871 11.1134C325.807 8.2226 321.062 8.2226 317.998 11.1134C317.929 11.1812 317.89 11.2744 317.889 11.3719C317.888 11.4695 317.925 11.5634 317.993 11.6325L319.28 12.9518C319.413 13.0865 319.627 13.0894 319.763 12.9582C320.769 12.0347 322.077 11.523 323.433 11.5224ZM325.958 14.316C325.959 14.4213 325.922 14.5229 325.855 14.5967L323.678 17.0514C323.615 17.1236 323.528 17.1642 323.437 17.1642C323.346 17.1642 323.259 17.1236 323.195 17.0514L321.018 14.5967C320.951 14.5229 320.914 14.4212 320.916 14.3159C320.918 14.2105 320.959 14.1108 321.029 14.0402C322.419 12.7263 324.455 12.7263 325.845 14.0402C325.915 14.1108 325.956 14.2106 325.958 14.316Z" fill="white"/>
                  <rect opacity="0.35" x="339.507" y="5" width="24" height="12" rx="3.8" stroke="white"/>
                  <path opacity="0.4" d="M365.007 9.28113V13.3566C365.812 13.0114 366.335 12.2085 366.335 11.3189C366.335 10.4293 365.812 9.6263 365.007 9.28113" fill="white"/>
                  <rect x="341.007" y="6.5" width="21" height="9" rx="2.5" fill="white"/>
                </svg>
              </div>

              {/* Home Screen Content */}
              <div style={{
                position: 'absolute',
                top: '54px',
                left: '0',
                right: '0',
                bottom: '0',
                padding: '0 24px',
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
                    gap: '6px',
                    marginBottom: '18px'
                  }}>
                    <div style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'white'
                    }}></div>
                    <div style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.3)'
                    }}></div>
                  </div>
                  {renderDock()}
                  {/* Extra margin after dock */}
                  <div style={{ height: '32px' }} />
                </div>
              </div>
            </div>
          </div>
          </motion.div>

        {/* Controls Panel */}
        <div style={{
          width: '320px',
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
          minHeight: '400px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10
        }}>
          <h2 style={{
            margin: '0 0 24px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a1a1a',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }}>Customize App</h2>
            {/* App Name */}
            <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1a1a',
                marginBottom: '8px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}>
                App Name
            </label>
              <input
                type="text"
                value={customAppName}
                onChange={(e) => setCustomAppName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                maxLength={12}
                placeholder="Enter app name"
                onFocus={(e) => e.target.style.borderColor = '#007AFF'}
                onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
              />
            </div>
            {/* App Icon */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                App Icon
              </label>
              <button
                onClick={handleIconClick}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = '#0056CC'}
                onMouseLeave={(e) => e.target.style.background = '#007AFF'}
              >
                <Upload size={18} /> Upload Icon
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            {customAppIcon && (
            <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <img
                  src={customAppIcon}
                  alt="Preview"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '13px',
                    objectFit: 'cover'
                  }}
                />
                <p style={{
                  margin: '8px 0 0 0',
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                }}>Preview</p>
              </div>
            )}
            {/* View Mode */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                View Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { id: 'full', label: 'Full View' },
                { id: 'top-left', label: 'Top Left' },
                { id: 'top-right', label: 'Top Right' },
                { id: 'dock-left', label: 'Dock Left' },
                { id: 'dock-right', label: 'Dock Right' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  style={{
                    padding: '10px',
                    background: viewMode === mode.id ? '#007AFF' : '#f5f5f7',
                    color: viewMode === mode.id ? 'white' : '#1a1a1a',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
            {/* Focus Mode */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1a1a',
                marginBottom: '8px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              Focus Mode
            </label>
            <button
              onClick={() => setFocusMode(!focusMode)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: focusMode ? '#007AFF' : '#f5f5f7',
                color: focusMode ? 'white' : '#1a1a1a',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
                {focusMode ? <Sun size={16} /> : <Moon size={16} />}
              {focusMode ? 'Focus Mode On' : 'Focus Mode Off'}
            </button>
          </div>
            {/* Container Style */}
            <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '8px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}>
                Frame BG
            </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                {[
                  { id: 'solid', label: 'Solid' },
                  { id: 'mesh', label: 'Mesh' },
                ].map(style => (
                  <button
                    key={style.id}
                    onClick={() => setContainerStyle(style.id)}
              style={{
                      padding: '10px',
                      background: containerStyle === style.id ? '#007AFF' : '#f5f5f7',
                      color: containerStyle === style.id ? 'white' : '#1a1a1a',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Color Controls & Previews */}
            <div style={{ minHeight: 60, marginBottom: 24, position: 'relative' }}>
              {containerStyle === 'solid' && (
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '8px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                  }}>
                    Background Color
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <input
                      type="color"
                      value={solidColor}
                      onChange={e => setSolidColor(e.target.value)}
                      style={{
                        width: '40px',
                        height: '40px',
                        padding: '0',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={solidColor}
                      onChange={e => setSolidColor(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '2px solid #e1e5e9',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}
              {containerStyle === 'gradient' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  {getGradientOptions(palette).map(([main, secondary], i) => (
                    <button
                      key={main + secondary}
                      onClick={() => { setGradientMain(main); setGradientSecondary(secondary); setSelectedGradient(i); }}
                      style={{
                        width: 40,
                        height: 32,
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${main} 0%, ${secondary} 100%)`,
                        border: (gradientMain === main && gradientSecondary === secondary) ? '2.5px solid #007AFF' : '2px solid #e1e5e9',
                        cursor: 'pointer',
                        outline: 'none',
                        boxShadow: (gradientMain === main && gradientSecondary === secondary) ? '0 0 0 2px #b3d4fc' : 'none',
                        transition: 'all 0.2s'
                      }}
                      aria-label={`Set gradient ${main} to ${secondary}`}
                    />
                  ))}
                  <button
                    onClick={() => {
                      // Randomize direction or swap for selected gradient
                      const [main, secondary] = getGradientOptions(palette)[selectedGradient];
                      if (Math.random() > 0.5) {
                        setGradientMain(secondary);
                        setGradientSecondary(main);
                      } else {
                        // Slightly lighten or darken
                        const amt = Math.random() * 0.3 - 0.15;
                        setGradientMain(lighten(main, amt));
                        setGradientSecondary(lighten(secondary, -amt));
                      }
                    }}
                    title="Randomize Gradient BG"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888',
                      outline: 'none',
                      boxShadow: 'none',
                      fontSize: '22px',
                      marginLeft: 4
                    }}
                  >
                    <Shuffle size={20} />
                  </button>
                </div>
              )}
              {containerStyle === 'mesh' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  {getMeshOptions(palette).map((mesh, i) => {
                    const positions = [
                      '20% 30%', '80% 70%', '60% 20%', '70% 80%'
                    ];
                    const meshBg = [
                      ...mesh.map((color, i) =>
                        `radial-gradient(circle at ${positions[i % positions.length]}, ${color} 0%, transparent 70%)`
                      ),
                      `linear-gradient(120deg, ${mesh[0]} 0%, ${mesh[1] || mesh[0]} 100%)`
                    ].join(', ');
                    return (
                      <button
                        key={mesh.join('-')}
                        onClick={() => { setMeshColors(mesh); setSelectedMesh(i); }}
                        style={{
                          width: 48,
                          height: 32,
                          borderRadius: 8,
                          background: meshBg,
                          border: meshColors.join('-') === mesh.join('-') ? '2.5px solid #007AFF' : '2px solid #e1e5e9',
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: meshColors.join('-') === mesh.join('-') ? '0 0 0 2px #b3d4fc' : 'none',
                          transition: 'all 0.2s',
                          display: 'block',
                          overflow: 'hidden'
                        }}
                        aria-label={`Set mesh colors ${mesh.join(', ')}`}
                      />
                    );
                  })}
                  <button
                    onClick={() => {
                      // Shuffle the selected mesh colors
                      const mesh = getMeshOptions(palette)[selectedMesh];
                      setMeshColors(shuffleArray(mesh));
                    }}
                    title="Randomize Mesh BG"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888',
                      outline: 'none',
                      boxShadow: 'none',
                      fontSize: '22px',
                      marginLeft: 4
                    }}
                  >
                    <Shuffle size={20} />
                  </button>
                </div>
              )}
            </div>
            {/* Blend Wallpaper */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                <input
                  type="checkbox"
                  checked={blendWallpaper}
                  onChange={(e) => setBlendWallpaper(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#007AFF',
                    cursor: 'pointer'
                  }}
                />
                Blend wallpaper with frame background
              </label>
            </div>
            {/* Frame Ratio */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Frame Ratio
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {Object.keys(ratioMap).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setFrameRatio(ratio)}
                style={{
                      padding: '10px',
                      background: frameRatio === ratio ? '#007AFF' : '#f5f5f7',
                      color: frameRatio === ratio ? 'white' : '#1a1a1a',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {ratio}
                  </button>
                ))}
            </div>
            </div>
            {/* Download Button */}
            <button
              onClick={handleDownload}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '12px 0',
                background: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                cursor: 'pointer',
                transition: 'background 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              Download
            </button>
          </div>
        </div>
      </div>
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
                step={0.1}
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
                  background: '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    background: '#0056CC'
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

function AppIcon({ src, name, nolabel = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img
        src={src}
        alt={name}
        style={{
          width: '62px',
          height: '62px',
          borderRadius: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          objectFit: 'cover',
          background: '#222'
        }}
      />
      {!nolabel && (
        <span style={{
          color: 'white',
          fontSize: '11px',
          marginTop: '6px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          textAlign: 'center',
          maxWidth: '62px',
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