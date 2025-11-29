# Color Palette Generator Plugin for Pixso

A plugin for Pixso that allows users to generate color palettes with customizable HSL colors and multiple shades.

## Features

1. **Add unlimited colors** - Add as many colors as needed to your palette
2. **Name your colors** - Give each color a descriptive name
3. **HSL color selection** - Choose colors using the HSL color model (Hue, Saturation, Lightness)
4. **Adjustable shade count** - Generate 1-15 shades per color
5. **Automatic shade generation** - Creates shades from 0 to 1000 with proper naming
6. **Export functionality** - Export colors to Pixso styles and tokens

## How to Use

1. Enter a name for your color
2. Adjust the HSL values using the sliders:
   - Hue: 0-360 degrees
   - Saturation: 0-100%
   - Lightness: 0-100%
3. Select the number of shades to generate (1-15)
4. Click "Add Color" to add the color to your palette
5. Repeat steps 1-4 to add more colors
6. Click "Generate Palette" to preview the generated shades
7. Click "Export to Styles & Tokens" to save the colors to your Pixso document

## Shade Naming Convention

For each color added, the plugin generates shades named as:
`[Color Name]-[Shade Value]`

Where shade values range from 0 to 1000 based on the number of shades selected.

## Export

When you click "Export to Styles & Tokens", the plugin will:
- Create paint styles in your Pixso document for each generated color
- Make the colors available as tokens in Pixso

## Technical Details

- Plugin ID: `palette-generator`
- API Version: 1.0.0
- Permissions: styles, tokens

## Files

- `manifest.json` - Plugin metadata and configuration
- `main.js` - Main plugin logic that runs in the background
- `ui.html` - User interface for the plugin