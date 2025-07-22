import React, { useState } from 'react';

const ProductHuntBadge = ({ 
  isMobile = false, 
  width = "250", 
  height = "54",
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const officialBadgeUrl = "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=986584&theme=light&t=1751717025357";
  const fallbackBadgeUrl = "/featured.svg";
  const productHuntUrl = "https://www.producthunt.com/products/iconcraft-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ios&#0045;26&#0045;app&#0045;icon&#0045;mockup";
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  // Adjust dimensions for mobile
  const actualWidth = isMobile ? "220" : width;
  const actualHeight = isMobile ? "47" : height;
  
  return (
    <a 
      href={productHuntUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="iOS 26 App Icon Mockup featured on Product Hunt - View our listing. Opens in new window."
      style={{
        display: 'inline-block',
        borderRadius: '8px',
        overflow: 'hidden',
        ...style
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(productHuntUrl, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {/* Loading state for screen readers */}
      {!imageLoaded && (
        <div 
          className="sr-only" 
          aria-live="polite"
        >
          Loading Product Hunt badge...
        </div>
      )}
      
      {/* Error announcement for screen readers */}
      {imageError && (
        <div 
          className="sr-only" 
          aria-live="polite"
        >
          Product Hunt badge loaded with fallback image.
        </div>
      )}
      
      <img 
        src={imageError ? fallbackBadgeUrl : officialBadgeUrl}
        alt={imageError 
          ? "iOS 26 App Icon Mockup - Featured on Product Hunt (fallback image)"
          : "iOS 26 App Icon Mockup - Create app icon mockups featuring iOS 26 home screen | Product Hunt"
        }
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          width: actualWidth + 'px', 
          height: actualHeight + 'px',
          display: 'block',
          ...(isMobile && {
            maxWidth: '100%',
            height: 'auto'
          })
        }} 
        width={actualWidth} 
        height={actualHeight}
        // Provide loading state
        loading="lazy"
        // Provide better error recovery
        referrerPolicy="no-referrer"
      />
    </a>
  );
};

export default ProductHuntBadge; 