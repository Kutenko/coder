// Initialize the plugin
figma.showUI(__html__, { width: 400, height: 600 });

// Main function to handle plugin execution
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-selection') {
    // Get the currently selected node
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.ui.postMessage({ type: 'no-selection' });
      return;
    }
    
    const node = selection[0];
    
    // Generate code based on the selected node
    const result = await generateCodeForNode(node, msg.useVariables);
    
    // Send the result back to the UI
    figma.ui.postMessage({
      type: 'selection-data',
      node: {
        name: node.name,
        id: node.id,
        type: node.type
      },
      html: result.html,
      css: result.css,
      previewUrl: await getNodePreview(node)
    });
  } 
  else if (msg.type === 'get-component-tokens') {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.ui.postMessage({ type: 'no-selection' });
      return;
    }
    
    const node = selection[0];
    const tokens = getTokensForNode(node);
    
    figma.ui.postMessage({
      type: 'component-tokens',
      tokens: tokens
    });
  }
  else if (msg.type === 'get-all-variables') {
    const variables = getAllVariables();
    
    figma.ui.postMessage({
      type: 'all-variables',
      variables: variables
    });
  }
  else if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};

// Function to generate HTML/CSS code for a node
async function generateCodeForNode(node, useVariables = true) {
  let html = '';
  let css = '';
  
  switch (node.type) {
    case 'RECTANGLE':
      html = `<div class="figma-element figma-rectangle">${node.name}</div>`;
      css = `.figma-rectangle {\n  ${await getStyleForNode(node, useVariables)}\n}`;
      break;
    case 'TEXT':
      html = `<p class="figma-element figma-text">${node.characters || 'Sample Text'}</p>`;
      css = `.figma-text {\n  ${await getStyleForNode(node, useVariables)}\n}`;
      break;
    case 'FRAME':
      html = `<div class="figma-element figma-frame">${node.name}</div>`;
      css = `.figma-frame {\n  ${await getStyleForNode(node, useVariables)}\n}`;
      break;
    case 'COMPONENT':
    case 'INSTANCE':
      html = `<div class="figma-element figma-component">${node.name}</div>`;
      css = `.figma-component {\n  ${await getStyleForNode(node, useVariables)}\n}`;
      break;
    default:
      html = `<div class="figma-element">${node.name}</div>`;
      css = `.figma-element {\n  ${await getStyleForNode(node, useVariables)}\n}`;
  }
  
  return { html, css };
}

// Function to get styles for a node
async function getStyleForNode(node, useVariables = true) {
  let styles = [];
  
  // Get fill color
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID') {
      const color = rgbaToHex(fill.color);
      if (useVariables && fill.colorVariable) {
        styles.push(`background-color: var(--${fill.colorVariable.name}, ${color});`);
      } else {
        styles.push(`background-color: ${color};`);
      }
    }
  }
  
  // Get stroke
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    if (stroke.type === 'SOLID') {
      const color = rgbaToHex(stroke.color);
      if (useVariables && stroke.colorVariable) {
        styles.push(`border: ${node.strokeWeight || 1}px solid var(--${stroke.colorVariable.name}, ${color});`);
      } else {
        styles.push(`border: ${node.strokeWeight || 1}px solid ${color};`);
      }
    }
  }
  
  // Get dimensions
  if (node.width) {
    if (useVariables && node.widthVariable) {
      styles.push(`width: var(--${node.widthVariable.name}, ${node.width}px);`);
    } else {
      styles.push(`width: ${node.width}px;`);
    }
  }
  
  if (node.height) {
    if (useVariables && node.heightVariable) {
      styles.push(`height: var(--${node.heightVariable.name}, ${node.height}px);`);
    } else {
      styles.push(`height: ${node.height}px;`);
    }
  }
  
  // Get corner radius
  if (node.cornerRadius !== undefined) {
    if (useVariables && node.cornerRadiusVariable) {
      styles.push(`border-radius: var(--${node.cornerRadiusVariable.name}, ${node.cornerRadius}px);`);
    } else {
      styles.push(`border-radius: ${node.cornerRadius}px;`);
    }
  }
  
  // Get opacity
  if (node.opacity !== undefined && node.opacity !== 1) {
    if (useVariables && node.opacityVariable) {
      styles.push(`opacity: var(--${node.opacityVariable.name}, ${node.opacity});`);
    } else {
      styles.push(`opacity: ${node.opacity};`);
    }
  }
  
  // Get text styles for text nodes
  if (node.type === 'TEXT') {
    if (node.fontSize) {
      if (useVariables && node.fontSizeVariable) {
        styles.push(`font-size: var(--${node.fontSizeVariable.name}, ${node.fontSize}px);`);
      } else {
        styles.push(`font-size: ${node.fontSize}px;`);
      }
    }
    
    if (node.fontName) {
      styles.push(`font-family: "${node.fontName.family}", sans-serif;`);
    }
    
    if (node.textAlignHorizontal) {
      const alignmentMap = {
        LEFT: 'left',
        CENTER: 'center',
        RIGHT: 'right',
        JUSTIFIED: 'justify'
      };
      styles.push(`text-align: ${alignmentMap[node.textAlignHorizontal] || 'left'};`);
    }
    
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID') {
        const color = rgbaToHex(fill.color);
        if (useVariables && fill.colorVariable) {
          styles.push(`color: var(--${fill.colorVariable.name}, ${color});`);
        } else {
          styles.push(`color: ${color};`);
        }
      }
    }
  }
  
  return styles.join('\n  ');
}

// Function to convert RGBA to HEX
function rgbaToHex(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Function to get preview URL for a node
async function getNodePreview(node) {
  try {
    const bytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 1 }
    });
    return `data:image/png;base64,${bytes.reduce((acc, curr) => acc + String.fromCharCode(curr), '')}`;
  } catch (error) {
    console.error('Error generating preview:', error);
    return null;
  }
}

// Function to get tokens for a node
function getTokensForNode(node) {
  const tokens = [];
  
  // Collect all variables used in the node
  if (node.fills && node.fills.length > 0) {
    node.fills.forEach(fill => {
      if (fill.type === 'SOLID' && fill.colorVariable) {
        tokens.push({
          name: fill.colorVariable.name,
          value: rgbaToHex(fill.color),
          type: 'COLOR'
        });
      }
    });
  }
  
  if (node.strokes && node.strokes.length > 0) {
    node.strokes.forEach(stroke => {
      if (stroke.type === 'SOLID' && stroke.colorVariable) {
        tokens.push({
          name: stroke.colorVariable.name,
          value: rgbaToHex(stroke.color),
          type: 'COLOR'
        });
      }
    });
  }
  
  if (node.widthVariable) {
    tokens.push({
      name: node.widthVariable.name,
      value: `${node.width}px`,
      type: 'NUMBER'
    });
  }
  
  if (node.heightVariable) {
    tokens.push({
      name: node.heightVariable.name,
      value: `${node.height}px`,
      type: 'NUMBER'
    });
  }
  
  if (node.cornerRadiusVariable) {
    tokens.push({
      name: node.cornerRadiusVariable.name,
      value: `${node.cornerRadius}px`,
      type: 'NUMBER'
    });
  }
  
  if (node.opacityVariable) {
    tokens.push({
      name: node.opacityVariable.name,
      value: node.opacity,
      type: 'NUMBER'
    });
  }
  
  if (node.type === 'TEXT') {
    if (node.fontSizeVariable) {
      tokens.push({
        name: node.fontSizeVariable.name,
        value: `${node.fontSize}px`,
        type: 'NUMBER'
      });
    }
  }
  
  return tokens;
}

// Function to get all variables in the document
function getAllVariables() {
  const variables = [];
  
  // Get all variable collections in the document
  const collections = figma.variables.getLocalVariableCollections();
  
  collections.forEach(collection => {
    const collVariables = figma.variables.getLocalVariables(collection.id);
    
    collVariables.forEach(variable => {
      variables.push({
        name: variable.name,
        value: getVariableValue(variable),
        type: variable.resolvedType,
        collection: collection.name
      });
    });
  });
  
  return variables;
}

// Helper function to get variable value
function getVariableValue(variable) {
  // This is a simplified approach - in a real implementation, 
  // you would need to resolve the actual value based on modes
  if (variable.resolvedType === 'COLOR') {
    // Get the value for the default mode (usually "Default")
    const modes = variable.modes;
    if (modes.length > 0) {
      const defaultValue = variable.valuesByMode[modes[0].modeId];
      if (defaultValue && typeof defaultValue === 'object' && 'color' in defaultValue) {
        return rgbaToHex(defaultValue.color);
      }
    }
  } else if (variable.resolvedType === 'FLOAT') {
    const modes = variable.modes;
    if (modes.length > 0) {
      return variable.valuesByMode[modes[0].modeId];
    }
  } else {
    const modes = variable.modes;
    if (modes.length > 0) {
      return variable.valuesByMode[modes[0].modeId];
    }
  }
  
  return 'unknown';
}