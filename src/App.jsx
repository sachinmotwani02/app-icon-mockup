import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';

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
  }

  #root {
    width: 100%;
    height: 100%;
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

export default function IOSHomeScreen() {
  const [customAppName, setCustomAppName] = useState("Your App");
  const [customAppIcon, setCustomAppIcon] = useState(null);
  const fileInputRef = useRef(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawIcon, setRawIcon] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
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

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        display: 'flex',
        flexDirection: 'row', // side by side
        gap: '40px',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {/* Device Frame */}
        <div style={{
          position: 'relative',
          width: '450px',
          height: '920px',
          backgroundImage: 'url("src/assets/iPhone 16 Pro - Black Titanium - Portrait.png")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Screen Content Container */}
          <div style={{
            width: '402px',    // Content width
            height: '874px',   // Content height
            position: 'relative',
            background: '#000',
            borderRadius: '60px',
            overflow: 'hidden',
            backgroundImage: `
              radial-gradient(circle at 30% 20%, rgba(139, 69, 255, 0.8) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.6) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.4) 0%, transparent 50%),
              linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%)
            `
          }}>
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
              
              {/* App Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                rowGap: '24px',
                marginTop: '35px',
                justifyItems: 'center'
              }}>
                <AppIcon name="Messages" src="src/assets/icons/imessage.png" />
                <AppIcon name="Calendar" src="src/assets/icons/calender.png" />
                <AppIcon name="Photos" src="src/assets/icons/gallery.png" />
                <AppIcon name="Camera" src="src/assets/icons/clock.png" />
                <AppIcon name="Mail" src="src/assets/icons/mail.png" />
                <AppIcon name="Weather" src="src/assets/icons/weather.png" />
                <AppIcon name="Notes" src="src/assets/icons/fitness.png" />
                <AppIcon name="App Store" src="src/assets/icons/appstore.png" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    onClick={handleIconClick}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '14px',
                      backgroundColor: customAppIcon ? 'transparent' : '#34C759',
                      backgroundImage: customAppIcon ? `url(${customAppIcon})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      border: customAppIcon ? 'none' : '2px dashed rgba(255,255,255,0.5)',
                    }}
                  >
                    {!customAppIcon && (
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
                    whiteSpace: 'nowrap'
                  }}>
                    {customAppName}
                  </span>
                </div>
              </div>

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
                {/* Dock */}
                <div style={{
                  margin: '0 auto 0',
                  width: '98%',
                  height: '85px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  borderRadius: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '26px',
                  border: '0.5px solid rgba(255,255,255,0.2)',
                  padding: '0 12px'
                }}>
                  <AppIcon name="Phone" src="src/assets/icons/call.png" nolabel={true} />
                  <AppIcon name="Safari" src="src/assets/icons/safari.png" nolabel={true} />
                  <AppIcon name="Messages" src="src/assets/icons/imessage.png" nolabel={true} />
                  <AppIcon name="Music" src="src/assets/icons/applemusic.png" nolabel={true} />
                </div>
                {/* Extra margin after dock */}
                <div style={{ height: '32px' }} />
              </div>
            </div>
          </div>
        </div>
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
        }}>
          <h2 style={{
            margin: '0 0 24px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a1a1a',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }}>Customize App</h2>
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
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#0056CC'}
              onMouseLeave={(e) => e.target.style.background = '#007AFF'}
            >
              Choose Icon
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