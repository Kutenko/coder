const PLUGIN_NAME = "Color Palette Generator";

// Store color entries
let colorEntries = [];

// Main plugin function
figma.showUI(__html__, { width: 400, height: 600 });

// Listen for messages from the UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'add-color') {
    // Add color to the list
    const colorEntry = {
      id: Date.now().toString(),
      name: msg.name,
      hue: msg.hue,
      saturation: msg.saturation,
      lightness: msg.lightness,
      shadeCount: msg.shadeCount
    };
    colorEntries.push(colorEntry);
  }
  else if (msg.type === 'generate-palette') {
    // Generate the color palette based on entries
    generatePalette();
  }
  else if (msg.type === 'export') {
    // Export to styles and tokens
    exportToStylesAndTokens();
  }
  else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// Function to generate color palette
function generatePalette() {
  const generatedColors = [];
  
  for (const entry of colorEntries) {
    const baseColor = hslToRgb(entry.hue, entry.saturation, entry.lightness);
    const baseColorHex = rgbToHex(baseColor.r, baseColor.g, baseColor.b);
    
    // Generate shades based on the specified count
    const shadeStep = 1000 / (entry.shadeCount - 1);
    
    for (let i = 0; i < entry.shadeCount; i++) {
      const shadeValue = Math.round(i * shadeStep);
      // Adjust lightness to create different shades
      const adjustedLightness = Math.max(0, Math.min(100, entry.lightness + (i - (entry.shadeCount-1)/2) * (20/(entry.shadeCount-1))));
      const shadeColor = hslToRgb(entry.hue, entry.saturation, adjustedLightness);
      const shadeHex = rgbToHex(shadeColor.r, shadeColor.g, shadeColor.b);
      
      generatedColors.push({
        name: `${entry.name}-${shadeValue}`,
        hex: shadeHex,
        originalEntryId: entry.id
      });
    }
  }
  
  // Send generated colors back to UI for display
  figma.ui.postMessage({
    type: 'palette-generated',
    colors: generatedColors
  });
}

// Function to export to styles and tokens
async function exportToStylesAndTokens() {
  // First generate the palette
  const generatedColors = [];
  
  for (const entry of colorEntries) {
    const baseColor = hslToRgb(entry.hue, entry.saturation, entry.lightness);
    const baseColorHex = rgbToHex(baseColor.r, baseColor.g, baseColor.b);
    
    // Generate shades based on the specified count
    const shadeStep = 1000 / (entry.shadeCount - 1);
    
    for (let i = 0; i < entry.shadeCount; i++) {
      const shadeValue = Math.round(i * shadeStep);
      // Adjust lightness to create different shades
      const adjustedLightness = Math.max(0, Math.min(100, entry.lightness + (i - (entry.shadeCount-1)/2) * (20/(entry.shadeCount-1))));
      const shadeColor = hslToRgb(entry.hue, entry.saturation, adjustedLightness);
      const shadeHex = rgbToHex(shadeColor.r, shadeColor.g, shadeColor.b);
      
      generatedColors.push({
        name: `${entry.name}-${shadeValue}`,
        hex: shadeHex,
        originalEntryId: entry.id
      });
    }
  }
  
  // Create paint styles for each color
  for (const color of generatedColors) {
    const paintStyle = figma.createPaintStyle();
    paintStyle.name = color.name;
    
    // Convert hex to RGB values
    const rgb = hexToRgb(color.hex);
    
    // Create solid paint
    const paint = {
      type: 'SOLID',
      color: {
        r: rgb.r / 255,
        g: rgb.g / 255,
        b: rgb.b / 255
      }
    };
    
    paintStyle.paints = [paint];
  }
  
  // Create color tokens (this would depend on the specific token system Pixso supports)
  // For now, we'll just show a success message
  figma.ui.postMessage({
    type: 'export-complete',
    count: generatedColors.length
  });
  
  figma.notify(`Exported ${generatedColors.length} colors to styles and tokens!`);
}

// Helper function to convert HSL to RGB
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / (1/3)) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255)
  };
}

// Helper function to convert RGB to Hex
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Helper function to convert Hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}