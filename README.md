# Figma Code Generator Plugin

A Figma plugin that automatically generates HTML/CSS/SCSS code from Figma elements with support for Figma Variables. This plugin allows developers to quickly obtain ready-to-use code for integration into their projects.

## Features

- **Three main tabs**: "Current Element", "Component Tokens", and "All Variables"
- **Element preview**: Shows a 200×200 px thumbnail of the selected Figma element
- **Code generation**: Generates HTML and CSS/SCSS code with syntax highlighting
- **Variable support**: Option to use Figma Variables (with fallback values) or direct values
- **Token extraction**: Shows all variables used in the selected element
- **Variable export**: Full list of document variables grouped by type
- **Copy functionality**: One-click copying of generated code
- **Responsive design**: Adapts to different window sizes

## Installation and Usage

1. Download or clone this repository
2. In Figma, go to `Plugins` → `Development` → `Import plugin from manifest...`
3. Select the `manifest.json` file from this project
4. The plugin will be available in your plugins list

## How to Use

1. Select an element on the Figma canvas
2. Run the plugin
3. Choose between the three tabs:
   - **Current Element**: View and copy HTML/CSS for the selected element
   - **Component Tokens**: View and copy CSS variables used in the selected element
   - **All Variables**: View and copy all document variables

## Technical Details

- **API**: Figma Plugin API 1.0.0
- **Compatibility**: Figma Variables (all types: Color, Number, String, Boolean)
- **Platforms**: Works on macOS and Windows
- **UI Framework**: Pure HTML/CSS/JavaScript (no external dependencies)

## Configuration

The plugin supports:
- Color variables (with hex fallbacks)
- Dimension variables (width, height, corner radius)
- Text properties (font size, color)
- Opacity variables
- All Figma Variable types (Color, Number, String, Boolean)

## Development

To modify the plugin:

1. Edit `code.js` for the main plugin logic
2. Edit `ui.html` for the user interface
3. Update `manifest.json` for plugin metadata

## License

MIT License