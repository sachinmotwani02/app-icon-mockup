import React from 'react';
import { motion } from 'framer-motion';
import { Squircle } from '@squircle-js/react';
import { Shuffle, Grip, Sun, Moon, Upload, Download, Monitor, Paintbrush, Frame, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, EyeOff, Sticker } from 'lucide-react';
import IconCraftPromoCard from './IconCraftPromoCard';
import ProductHuntBadge from './ProductHuntBadge';
import { getMeshOptions, shuffleArray, rgbToHex } from '../utils/colors';


export default function ControlsPanel({
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
  handleDownload,
  isMobileContext = false
}) {

  // SF Pro Font Constants
  const SF_PRO_REGULAR = "'SFProRegular', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";
  const SF_PRO_MEDIUM = "'SFProMedium', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

  const sidebarStyle = isMobileContext ? {
    width: '100%',
    height: 'auto',
    background: 'transparent',
    overflow: 'visible'
  } : {
    width: '340px',
    height: '100vh',
    background: '#ffffff',
    borderLeft: '1px solid #e2e8f0',
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: 100,
    boxShadow: '-2px 0 10px rgba(0,0,0,0.05)'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobileContext ? 0.1 : 0.05,
        delayChildren: isMobileContext ? 0.2 : 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="sidebar" 
      style={sidebarStyle}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sidebar Header */}
      {!isMobileContext && (
      <div style={{
        padding: isMobileContext ? '0 0 20px 0' : '24px 24px 20px 24px',
        borderBottom: isMobileContext ? 'none' : '1px solid #e2e8f0',
        background: 'transparent'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
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

          {/* Product Hunt Badge - Desktop Only */}
          {!isMobileContext && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px',
              marginTop: '12px'
            }}>
              <ProductHuntBadge isMobile={false} />
            </div>
          )}
            
          {!isMobileContext && (
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
          )}
          </div>
          )}
  
        {/* Scrollable Content */}
      <div style={{ padding: isMobileContext ? '0' : '0' }}>
        
        {/* App Icon Section */}
        <motion.div 
          variants={itemVariants}
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Sticker size={16} color="#475569" strokeWidth={2} />
            <h3 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              fontFamily: SF_PRO_MEDIUM
            }}>App Icon</h3>
          </div>
          
          {/* App Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px',
              fontFamily: SF_PRO_MEDIUM
            }}>
              Name
            </label>
            <input
              type="text"
              value={customAppName}
              onChange={(e) => setCustomAppName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: SF_PRO_REGULAR,
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                background: '#ffffff'
              }}
              maxLength={12}
              placeholder="Enter app name"
              onFocus={(e) => {
                e.target.style.borderColor = '#03B1FC';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
          </div>

          {/* App Icon */}
          <div style={{ marginBottom: '16px' }}>
            <motion.button
              onClick={handleIconClick}
              // whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25 
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#03B1FC',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: SF_PRO_MEDIUM,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(3, 177, 252, 0.2)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0299d4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#03B1FC'}
            >
              <motion.div
                // whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Upload size={16} strokeWidth={2} />
              </motion.div>
              Upload Icon
            </motion.button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* Icon Preview */}
          {customAppIcon && (
            <div style={{
              padding: '16px',
              background: '#f1f5f9',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              marginBottom: '16px'
            }}>
              <Squircle
                cornerRadius={16}
                cornerSmoothing={1}
                width={56}
                height={56}
                style={{
                  margin: '0 auto 8px auto',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <img
                  src={customAppIcon}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Squircle>
              <p style={{
                margin: '0',
                fontSize: '13px',
                color: '#64748b',
                fontFamily: SF_PRO_REGULAR,
                fontWeight: '400'
              }}>Preview</p>
            </div>
          )}

          {/* Edge Highlighting Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <label style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              fontFamily: SF_PRO_MEDIUM,
              cursor: 'pointer'
            }} onClick={() => setEdgeHighlighting(!edgeHighlighting)}>
              Edge Highlighting
            </label>
            <div 
              onClick={() => setEdgeHighlighting(!edgeHighlighting)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                background: edgeHighlighting ? '#03B1FC' : '#e2e8f0',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '2px',
                left: edgeHighlighting ? '22px' : '2px',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }} />
            </div>
          </div>
        </motion.div>

        {/* Background Section */}
        <motion.div 
          variants={itemVariants}
          style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Paintbrush size={16} color="#475569" strokeWidth={2} />
            <h3 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              fontFamily: SF_PRO_MEDIUM
            }}>Background</h3>
          </div>

          {/* Style Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px',
              fontFamily: SF_PRO_MEDIUM
            }}>
              Style
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {[
                { id: 'solid', label: 'Solid' },
                { id: 'mesh', label: 'Gradient' },
                { id: 'wallpaper', label: 'Wallpaper' },
              ].map(style => (
                <button
                  key={style.id}
                  onClick={() => setContainerStyle(style.id)}
                  style={{
                    padding: '10px 12px',
                    background: containerStyle === style.id ? '#03B1FC' : '#f8fafc',
                    color: containerStyle === style.id ? 'white' : '#374151',
                    border: '1px solid ' + (containerStyle === style.id ? '#03B1FC' : '#e2e8f0'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: SF_PRO_REGULAR,
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (containerStyle !== style.id) {
                      e.target.style.backgroundColor = '#f1f5f9';
                    } else {
                      e.target.style.backgroundColor = '#028bcc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (containerStyle !== style.id) {
                      e.target.style.backgroundColor = '#f8fafc';
                    } else {
                      e.target.style.backgroundColor = '#03B1FC';
                    }
                  }}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Controls */}
          <div style={{ marginBottom: '16px' }}>
            {containerStyle === 'solid' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                  fontFamily: SF_PRO_MEDIUM
                }}>
                  Color
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <input
                    type="color"
                    value={solidColor}
                    onChange={e => setSolidColor(e.target.value)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: '0',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="text"
                    value={solidColor}
                    onChange={e => setSolidColor(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'SF Mono, Monaco, monospace',
                      outline: 'none',
                      background: 'white'
                    }}
                  />
                </div>
              </div>
            )}

            {containerStyle === 'mesh' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                  fontFamily: SF_PRO_MEDIUM
                }}>
                  Gradient Options
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  marginBottom: '10px'
                }}>
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
                          width: '44px',
                          height: '32px',
                          borderRadius: '8px',
                          background: meshBg,
                          border: '1px solid #d1d5db',
                          boxShadow: selectedMesh === i ? '0 0 0 2px rgba(3, 177, 252, 0.55)' : 'none',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          overflow: 'hidden'
                        }}
                      />
                    );
                  })}
                  <button
                    onClick={() => {
                      const mesh = getMeshOptions(palette)[selectedMesh];
                      setMeshColors(shuffleArray(mesh));
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      background: '#f8fafc',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s ease',
                      outline: 'none',
                      padding: '0',
                      margin: '0',
                      font: 'inherit',
                      color: 'inherit',
                      textDecoration: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    title="Randomize Gradients"
                  >
                    <Shuffle size={16} strokeWidth={2} color="#374151" />
                  </button>
                </div>
              </div>
            )}

            {containerStyle === 'wallpaper' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '12px',
                  fontFamily: SF_PRO_MEDIUM
                }}>
                  Choose Wallpaper
                </label>
                
                {/* Wallpaper Gallery */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  {wallpaperOptions.map((wallpaper) => (
                    <button
                      key={wallpaper.id}
                      onClick={() => setSelectedWallpaper(wallpaper.id)}
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '4/3',
                        borderRadius: '8px',
                        border: selectedWallpaper === wallpaper.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        backgroundImage: `url("${base}${wallpaper.file}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        boxShadow: selectedWallpaper === wallpaper.id ? '0 0 0 1px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedWallpaper !== wallpaper.id) {
                          e.target.style.borderColor = '#9ca3af';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedWallpaper !== wallpaper.id) {
                          e.target.style.borderColor = '#e2e8f0';
                        }
                      }}
                    >
                      {/* Selected indicator */}
                      {selectedWallpaper === wallpaper.id && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '3px',
                            borderLeft: '1.5px solid white',
                            borderBottom: '1.5px solid white',
                            transform: 'rotate(-45deg) translateY(-0.5px)'
                          }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Wallpaper Background Color */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px',
                    fontFamily: SF_PRO_MEDIUM
                  }}>
                    Background Color
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <input
                      type="color"
                      value={wallpaperBgColor}
                      onChange={e => setWallpaperBgColor(e.target.value)}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: '0',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      value={wallpaperBgColor}
                      onChange={e => setWallpaperBgColor(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'SF Mono, Monaco, monospace',
                        outline: 'none',
                        background: 'white'
                      }}
                    />
                  </div>
                </div>


              </div>
            )}
          </div>

          {/* Wallpaper Blend - Only show when not using wallpaper style */}
          {containerStyle !== 'wallpaper' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px',
                fontFamily: SF_PRO_MEDIUM
              }}>
                Wallpaper Blend
              </label>
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#64748b',
                  fontFamily: SF_PRO_REGULAR,
                  minWidth: '28px'
                }}>0%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={wallpaperBlend}
                  onChange={(e) => setWallpaperBlend(Number(e.target.value))}
                  style={{
                    flex: 1,
                    height: '4px',
                    WebkitAppearance: 'none',
                    background: `linear-gradient(to right, #0f172a 0%, ${palette.length > 0 ? rgbToHex(palette[0]) : '#03B1FC'} 100%)`,
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  fontSize: '12px',
                  color: '#64748b',
                  fontFamily: SF_PRO_REGULAR,
                  minWidth: '28px',
                  textAlign: 'right'
                }}>100%</span>
              </div>
            </div>
          </div>
          )}
        </motion.div>

        {/* Display Section */}
        <motion.div 
          variants={itemVariants}
          style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Monitor size={16} color="#475569" strokeWidth={2} />
            <h3 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              fontFamily: SF_PRO_MEDIUM
            }}>Display</h3>
          </div>

          {/* View Mode */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px',
              fontFamily: SF_PRO_MEDIUM
            }}>
              View Mode
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '8px' 
            }}>
              {[
                { id: 'full', label: 'Full View', icon: <Frame size={14}/> },
                { id: 'dock-right', label: 'Dock Right', icon: <ArrowDownRight size={14} /> },
                { id: 'dock-left', label: 'Dock Left', icon: <ArrowDownLeft size={14} /> },
                { id: 'top-right', label: 'Top Right', icon: <ArrowUpRight size={14} /> },
                { id: 'top-left', label: 'Top Left', icon: <ArrowUpLeft size={14} /> }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  style={{
                    padding: '10px 8px',
                    background: viewMode === mode.id ? '#03B1FC' : '#f8fafc',
                    color: viewMode === mode.id ? 'white' : '#374151',
                    border: '1px solid ' + (viewMode === mode.id ? '#03B1FC' : '#e2e8f0'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: SF_PRO_REGULAR,
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background-color 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== mode.id) {
                      e.target.style.backgroundColor = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== mode.id) {
                      e.target.style.backgroundColor = '#f8fafc';
                    }
                  }}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Display Controls */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Focus Mode Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {focusMode ? <Sun size={14} strokeWidth={2} color="#374151" /> : <Moon size={14} strokeWidth={2} color="#374151" />}
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  fontFamily: SF_PRO_MEDIUM,
                  cursor: 'pointer'
                }} onClick={() => setFocusMode(!focusMode)}>
                  Focus Mode
                </label>
              </div>
              <div 
                onClick={() => setFocusMode(!focusMode)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: focusMode ? '#03B1FC' : '#e2e8f0',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: focusMode ? '22px' : '2px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }} />
              </div>
            </div>

            {/* Hide Icons Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <EyeOff size={14} strokeWidth={2} color="#374151" />
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  fontFamily: SF_PRO_MEDIUM,
                  cursor: 'pointer'
                }} onClick={() => setHideOtherIcons(!hideOtherIcons)}>
                  Hide Other Icons
                </label>
              </div>
              <div 
                onClick={() => setHideOtherIcons(!hideOtherIcons)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: hideOtherIcons ? '#03B1FC' : '#e2e8f0',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: hideOtherIcons ? '22px' : '2px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }} />
              </div>
            </div>

            {/* Randomize Button */}
            <motion.button
              onClick={randomizeAppPositions}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                duration: 0.2 
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                color: '#374151',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: SF_PRO_MEDIUM,
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s ease',
                outline: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #d1d5db 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ 
                  duration: 0.8,
                  ease: "easeInOut",
                  repeat: 0
                }}
                key={Math.random()} // Force re-animation on click
              >
                <Grip size={16} strokeWidth={2} />
              </motion.div>
              Randomise App Icons
            </motion.button>
          </div>
        </motion.div>

        {/* Device Selection Section */}
        <motion.div 
          variants={itemVariants}
          style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Frame size={16} color="#475569" strokeWidth={2} />
            <h3 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              fontFamily: SF_PRO_MEDIUM
            }}>Device Frame</h3>
          </div>

          {/* Device Options */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px',
              fontFamily: SF_PRO_MEDIUM
            }}>
              iPhone 16 Pro
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              {Object.entries(deviceOptions).map(([key, device]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDevice(key)}
                  style={{
                    padding: '12px 8px',
                    background: selectedDevice === key ? '#03B1FC' : '#f8fafc',
                    color: selectedDevice === key ? 'white' : '#374151',
                    border: '1px solid ' + (selectedDevice === key ? '#03B1FC' : '#e2e8f0'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: SF_PRO_REGULAR,
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDevice !== key) {
                      e.target.style.backgroundColor = '#f1f5f9';
                    } else {
                      e.target.style.backgroundColor = '#028bcc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDevice !== key) {
                      e.target.style.backgroundColor = '#f8fafc';
                    } else {
                      e.target.style.backgroundColor = '#03B1FC';
                    }
                  }}
                >
                  {device.name}
                </button>
              ))}
            </div>
          </div>

          {/* Device Zoom Slider */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px',
              fontFamily: SF_PRO_MEDIUM
            }}>
              Device Zoom
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input
                type="range"
                min={viewMode === 'full' ? 0.8 : 1.5}
                max={viewMode === 'full' ? 1.5 : 4}
                step={0.01}
                value={deviceZoom}
                onChange={(e) => setDeviceZoom(Number(e.target.value))}
                style={{
                  flex: 1,
                  height: '4px',
                  WebkitAppearance: 'none',
                  background: '#d1d5db',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '12px',
                color: '#64748b',
                fontFamily: SF_PRO_REGULAR,
                minWidth: '36px',
                textAlign: 'right'
              }}>{Math.round(deviceZoom * 100)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Export Section */}
        <motion.div 
          variants={itemVariants}
          style={{
          padding: '20px 24px 32px 24px'
        }}>
          <IconCraftPromoCard />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Download size={16} color="#475569" strokeWidth={2} />
            <h3 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              fontFamily: SF_PRO_MEDIUM
            }}>Export</h3>
          </div>

          {/* Frame Ratio */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px',
              fontFamily: SF_PRO_MEDIUM
            }}>
              Frame Ratio
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px'
            }}>
              {Object.keys(ratioMap).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setFrameRatio(ratio)}
                  style={{
                    padding: '10px 6px',
                    background: frameRatio === ratio ? '#03B1FC' : '#f8fafc',
                    color: frameRatio === ratio ? 'white' : '#374151',
                    border: '1px solid ' + (frameRatio === ratio ? '#03B1FC' : '#e2e8f0'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: SF_PRO_REGULAR,
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (frameRatio !== ratio) {
                      e.target.style.backgroundColor = '#f1f5f9';
                    } else {
                      e.target.style.backgroundColor = '#028bcc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (frameRatio !== ratio) {
                      e.target.style.backgroundColor = '#f8fafc';
                    } else {
                      e.target.style.backgroundColor = '#03B1FC';
                    }
                  }}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Download Button */}
          <motion.button
            onClick={() => {
              // Track download event with Google Analytics
              if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                  event_category: 'engagement',
                  event_label: 'mockup_download',
                  value: 1
                });
              }
              handleDownload();
            }}
            // whileHover={{ 
            //   scale: 1.02, 
            //   y: -2,
            //   boxShadow: '0 8px 25px rgba(3, 177, 252, 0.3)'
            // }}
            whileTap={{ 
              scale: 0.98,
              y: 0
            }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25 
            }}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: '#03B1FC',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: SF_PRO_MEDIUM,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s ease',
              outline: 'none',
              boxShadow: '0 4px 15px rgba(3, 177, 252, 0.2)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0299d4'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#03B1FC'}
          >
            <motion.div
              // whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Download size={16} strokeWidth={2} />
            </motion.div>
            Download Mockup
          </motion.button>
          
          {/* Product Hunt Badge - Mobile Only */}
          {isMobileContext && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '24px'
            }}>
              <ProductHuntBadge isMobile={true} />
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
} 