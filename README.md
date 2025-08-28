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

# Copy environment template and configure
cp .env.example .env
# Edit .env and add your Google Maps API key

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your API keys in `.env`:**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   VITE_ROOF_SCANNER_SERVER_URL=http://localhost:3000
   ```

3. **Google Maps API Requirements:**
   - Enable **Places API** in Google Cloud Console
   - Configure HTTP referrer restrictions for security
   - For development, allow `localhost:3333`

### Integration

Add this script to any website:

```html
<script 
  src="https://cdn.yourdomain.com/roof-scanner.js"
  data-mode="overlay"
  data-position="bottom-right">
</script>
```

## Configuration Options

| Option | Values | Description |
|--------|--------|-------------|
| `data-mode` | `overlay`, `trigger` | Overlay shows floating button, trigger uses data attributes |
| `data-position` | `bottom-right`, `bottom-left`, `top-right`, `top-left` | Position of overlay button |

**Note**: Server URL and Google Maps API key are built into the widget from environment variables - no customer configuration needed.

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

## Address Search Integration

The widget includes built-in address search powered by Google Places API:

- **Smart Address Search**: Type-ahead suggestions as you type
- **Accurate Geocoding**: Precise latitude/longitude coordinates
- **Direct API Integration**: Uses Google Maps JavaScript API for minimal latency

### Google Maps API Setup

The widget includes a built-in Google Maps API key configured for:
- **Places API** enabled for address search
- **HTTP referrer restrictions** configured for security
- **Usage quotas** managed centrally

No customer API key configuration required.

### Address Search Flow

1. User types address → Google Maps API loads dynamically if needed
2. Places Service provides real-time suggestions as user types
3. User selects address → Coordinates extracted via Places Service
4. "Start Solar Analysis" button becomes enabled
5. Click to begin roof analysis workflow

**Note**: Address search works automatically with the built-in API key - no additional setup required.

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
  position: 'bottom-left'
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