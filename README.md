# Roof Scanner Plugin

A lightweight, embeddable widget for roof analysis that can be integrated into any website.

## Features

- 🔒 **Complete Isolation** - Shadow DOM prevents CSS/JS conflicts
- 🎯 **Two Trigger Modes**:
  - Overlay button (automatic floating button)
  - Data attribute trigger (custom integration)
- 📦 **Lightweight** - Minimal vanilla JavaScript, no framework dependencies
- 🚀 **Easy Integration** - Single script tag embed

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Integration

Add this script to any website:

```html
<script 
  src="https://cdn.yourdomain.com/roof-scanner.js"
  data-api-key="your-api-key"
  data-mode="overlay"
  data-position="bottom-right"
  data-server-url="https://api.yourdomain.com">
</script>
```

## Configuration Options

| Option | Values | Description |
|--------|--------|-------------|
| `data-mode` | `overlay`, `trigger` | Overlay shows floating button, trigger uses data attributes |
| `data-position` | `bottom-right`, `bottom-left`, `top-right`, `top-left` | Position of overlay button |
| `data-api-key` | string | API key for authentication |
| `data-server-url` | URL | Backend server endpoint |

## Trigger Modes

### 1. Overlay Button Mode

Automatically adds a floating button to the page:

```html
<script 
  src="roof-scanner.js"
  data-mode="overlay"
  data-position="bottom-right">
</script>
```

### 2. Data Attribute Trigger Mode

Add `data-roof-scanner-trigger` to any element:

```html
<script 
  src="roof-scanner.js"
  data-mode="trigger">
</script>

<button data-roof-scanner-trigger>Open Scanner</button>
```

## JavaScript API

```javascript
// Open the modal
window.RoofScanner.open();

// Close the modal
window.RoofScanner.close();

// Destroy the widget
window.RoofScanner.destroy();

// Reinitialize with new config
window.RoofScanner.init({
  mode: 'overlay',
  position: 'bottom-left',
  apiKey: 'new-key'
});
```

## Architecture

- **Shadow DOM** for complete style/DOM isolation
- **Web Components** for encapsulation
- **Vanilla JavaScript** for minimal footprint
- **Vite** for modern build tooling

## Browser Support

- Chrome 63+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## Development

The widget is built with:
- Pure JavaScript (no framework dependencies)
- Shadow DOM for isolation
- Vite for bundling
- IIFE format for easy embedding

## License

Proprietary