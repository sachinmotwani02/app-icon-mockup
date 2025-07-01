// Helper to convert [r,g,b] to hex
export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getComplementary(hex) {
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

export function lighten(hex, amt) {
  let c = hex.substring(1);
  let rgb = [parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16)];
  rgb = rgb.map(x => Math.min(255, Math.round(x + (255-x)*amt)));
  return `#${rgb.map(x=>x.toString(16).padStart(2,'0')).join('')}`;
}

// Helper to get HSL from hex
export function hexToHSL(hex) {
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
export function getAnalogous(hex, angle = 30) {
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
export function getSolidOptions(palette) {
  const hexes = palette.map(rgbToHex);
  const dominant = hexes[0] || '#ededed';
  return [
    lighten(dominant, 0.3),
    getComplementary(dominant),
    getAnalogous(dominant, 30)
  ];
}

export function getGradientOptions(palette) {
  const hexes = palette.map(rgbToHex);
  const dominant = hexes[0] || '#ededed';
  const comp = getComplementary(dominant);
  return [
    [dominant, comp],
    [dominant, lighten(dominant, 0.25)],
    [dominant, getAnalogous(dominant, 30)]
  ];
}

export function getMeshOptions(palette) {
  const hexes = palette.map(rgbToHex);
  const dominant = hexes[0] || '#ededed';
  const comp = getComplementary(dominant);
  return [
    [dominant, lighten(dominant, 0.2), getAnalogous(dominant, 30), comp],
    [dominant, comp, getAnalogous(dominant, -30), lighten(dominant, 0.4)],
    [dominant, hexes[1] || comp, hexes[2] || getAnalogous(dominant, 60), hexes[3] || lighten(dominant, 0.6)]
  ];
} 