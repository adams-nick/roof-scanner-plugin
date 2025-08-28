/**
 * Roof Scanner Plugin - Main Entry Point
 * Barebones embeddable widget with two trigger modes:
 * 1. Overlay button (automatic)
 * 2. Data attribute trigger (manual)
 */

(function() {
  'use strict';

  // Prevent multiple loads
  if (window.__roofScannerLoaded) return;
  window.__roofScannerLoaded = true;

  class RoofScannerWidget {
    constructor() {
      this.config = {};
      this.isOpen = false;
      this.container = null;
      this.shadowRoot = null;
      this.triggerButton = null;
    }

    init(config = {}) {
      console.log('[RoofScanner] Initializing widget', config);
      
      // Extract API key from script src URL
      const apiKey = this.extractApiKeyFromScript();
      console.log('[RoofScanner] API Key extracted:', apiKey);
      
      this.config = {
        mode: config.mode || 'overlay', // 'overlay' or 'trigger'
        position: config.position || 'bottom-right',
        apiKey: apiKey,
        ...config
      };
      
      // Load configuration asynchronously
      this.loadConfiguration();

      // Create the widget container
      this.createContainer();

      // Setup triggers based on mode
      if (this.config.mode === 'overlay') {
        this.createOverlayButton();
      }
      
      // Always setup data-attribute triggers
      this.setupDataAttributeTriggers();

      console.log('[RoofScanner] Widget initialized');
    }

    extractApiKeyFromScript() {
      // Find the current script tag or the one with roof-scanner in the src
      const scriptTag = document.currentScript || 
                       document.querySelector('script[src*="roof-scanner"]') ||
                       document.querySelector('script[src*="main.js"]');
      
      if (!scriptTag || !scriptTag.src) {
        console.warn('[RoofScanner] Could not find script tag to extract API key');
        return 'demo-key-123'; // Default for development
      }
      
      try {
        const url = new URL(scriptTag.src);
        const apiKey = url.searchParams.get('key');
        return apiKey || 'demo-key-123'; // Default if no key provided
      } catch (error) {
        console.warn('[RoofScanner] Error extracting API key:', error);
        return 'demo-key-123'; // Default fallback
      }
    }

    async loadConfiguration() {
      try {
        console.log('[RoofScanner] Loading configuration for API key:', this.config.apiKey);
        
        // Mock configuration - in future this will be an API call
        const config = this.getMockConfiguration(this.config.apiKey);
        
        // Merge configuration into this.config
        this.config = {
          ...this.config,
          ...config
        };
        
        console.log('[RoofScanner] Configuration loaded:', this.config);
      } catch (error) {
        console.error('[RoofScanner] Failed to load configuration:', error);
        // Use fallback configuration
        this.config = {
          ...this.config,
          ...this.getFallbackConfiguration()
        };
      }
    }

    getMockConfiguration(apiKey) {
      // Mock configurations for different API keys
      const mockConfigs = {
        'demo-key-123': {
          serverUrl: 'http://localhost:3000',
          googleMapsApiKey: 'AIzaSyDEuztnki5fYeIsQ2qGcTd38sXOqE-v7bE',
          defaultLocation: {
            lat: 51.0447,
            lng: -114.0719,
            address: 'Calgary, AB, Canada',
            zoom: 13
          },
          theme: {
            primaryColor: '#2196F3',
            buttonStyle: 'rounded'
          },
          features: {
            addressSearch: true,
            solarAnalysis: true
          }
        },
        'demo-key-456': {
          serverUrl: 'http://localhost:3000',
          googleMapsApiKey: 'AIzaSyDEuztnki5fYeIsQ2qGcTd38sXOqE-v7bE',
          defaultLocation: {
            lat: 51.0447,
            lng: -114.0719,
            address: 'Calgary, AB, Canada',
            zoom: 13
          },
          theme: {
            primaryColor: '#4CAF50',
            buttonStyle: 'square'
          },
          features: {
            addressSearch: true,
            solarAnalysis: true
          }
        }
      };

      return mockConfigs[apiKey] || mockConfigs['demo-key-123'];
    }

    getFallbackConfiguration() {
      return {
        serverUrl: 'http://localhost:3000',
        googleMapsApiKey: 'AIzaSyDEuztnki5fYeIsQ2qGcTd38sXOqE-v7bE',
        defaultLocation: {
          lat: 51.0447,
          lng: -114.0719,
          address: 'Calgary, AB, Canada',
          zoom: 13
        },
        theme: {
          primaryColor: '#2196F3',
          buttonStyle: 'rounded'
        },
        features: {
          addressSearch: true,
          solarAnalysis: true
        }
      };
    }

    createContainer() {
      // Create custom element for Shadow DOM isolation
      if (!customElements.get('roof-scanner-widget')) {
        customElements.define('roof-scanner-widget', class extends HTMLElement {
          constructor() {
            super();
            this.attachShadow({ mode: 'open' });
          }
        });
      }

      // Create and append widget container
      this.container = document.createElement('roof-scanner-widget');
      document.body.appendChild(this.container);
      this.shadowRoot = this.container.shadowRoot;

      // Setup Shadow DOM content
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2147483647;
            display: none;
          }

          :host([data-open="true"]) {
            display: block;
          }

          .backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            pointer-events: auto;
          }

          .modal {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            pointer-events: auto;
            padding: 20px;
          }

          .close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
          }

          .content {
            padding: 20px;
          }

          .address-search-container {
            margin-bottom: 20px;
          }

          .address-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            margin-bottom: 10px;
            box-sizing: border-box;
          }

          .address-input:focus {
            outline: none;
            border-color: #4285F4;
            box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
          }

          .search-container {
            position: relative;
          }

          .loading-indicator {
            position: absolute;
            right: 12px;
            top: 12px;
            width: 20px;
            height: 20px;
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #4285F4;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .suggestions-dropdown {
            position: absolute;
            width: 100%;
            max-height: 200px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 4px 4px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            z-index: 20;
            display: none;
          }

          .suggestion-item {
            padding: 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            font-size: 14px;
          }

          .suggestion-item:last-child {
            border-bottom: none;
          }

          .suggestion-item:hover {
            background-color: #f5f5f5;
          }

          .helper-text {
            font-size: 14px;
            color: #666;
            margin-top: 8px;
          }

          .error-message {
            color: #d32f2f;
            background-color: #ffebee;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 16px;
            font-size: 14px;
          }


          .map-container {
            width: 100%;
            height: 300px;
            border-radius: 8px;
            overflow: hidden;
            margin: 20px 0;
            border: 1px solid #ddd;
          }

          #map {
            width: 100%;
            height: 100%;
          }
        </style>
        <div class="backdrop"></div>
        <div class="modal">
          <button class="close-button" aria-label="Close">&times;</button>
          <div class="content">
            <h2>Solar Roof Analysis</h2>
            
            <div class="error-message" id="error-message" style="display: none;"></div>
            
            <!-- Debug Section -->
            <div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; font-family: monospace; font-size: 12px; border-radius: 4px;">
              <strong>Plugin Configuration Debug:</strong><br>
              API Key: ${this.config.apiKey || 'undefined'}<br>
              Server URL: ${this.config.serverUrl || 'undefined'}<br>
              Google Maps Key: ${this.config.googleMapsApiKey ? this.config.googleMapsApiKey.substring(0, 20) + '...' : 'undefined'}<br>
              Default Location: ${this.config.defaultLocation ? `${this.config.defaultLocation.address} (${this.config.defaultLocation.lat}, ${this.config.defaultLocation.lng})` : 'undefined'}<br>
              Theme: ${this.config.theme ? JSON.stringify(this.config.theme) : 'undefined'}<br>
              Features: ${this.config.features ? JSON.stringify(this.config.features) : 'undefined'}
            </div>

            <div class="address-search-container">
              <label for="address-input">Enter your address to get started:</label>
              <div class="search-container">
                <input 
                  type="text" 
                  id="address-input" 
                  class="address-input" 
                  placeholder="Start typing your address..."
                  autocomplete="off"
                >
                <div class="loading-indicator" id="loading-indicator" style="display: none;">
                  <div class="spinner"></div>
                </div>
                <div class="suggestions-dropdown" id="suggestions-dropdown"></div>
              </div>
              <p class="helper-text">We'll search for your address and show available buildings</p>
            </div>

            <!-- Google Maps Container -->
            <div class="map-container">
              <div id="map"></div>
            </div>
          </div>
        </div>
      `;

      // Setup close handlers
      const backdrop = this.shadowRoot.querySelector('.backdrop');
      const closeButton = this.shadowRoot.querySelector('.close-button');
      
      backdrop.addEventListener('click', () => this.close());
      closeButton.addEventListener('click', () => this.close());

      // Handle ESC key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Setup address search functionality
      this.setupAddressSearch();

      // Initialize Google Maps
      this.initializeMap();
    }

    // Places API search functionality
    async searchPlaces(query) {
      if (!query || query.length < 3) return [];
      
      try {
        if (!this.config.googleMapsApiKey) {
          throw new Error('Google Maps API key not configured');
        }

        // Use Google Maps JavaScript API with Places Service
        if (window.google && window.google.maps && window.google.maps.places) {
          return await this.searchPlacesWithGoogleAPI(query);
        } else {
          // Load Google Maps API if not loaded
          await this.loadGoogleMapsAPI();
          return await this.searchPlacesWithGoogleAPI(query);
        }
        
      } catch (error) {
        console.error('Places search error:', error);
        this.showError(`Address search failed: ${error.message}`);
        return [];
      }
    }

    async loadGoogleMapsAPI() {
      if (window.google && window.google.maps) {
        return Promise.resolve();
      }
      
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.config.googleMapsApiKey}&libraries=places&loading=async&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        
        window.initGoogleMaps = () => {
          resolve();
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load Google Maps API'));
        };
        
        document.head.appendChild(script);
      });
    }

    async searchPlacesWithGoogleAPI(query) {
      const { AutocompleteSuggestion } = await google.maps.importLibrary("places");
      
      const request = {
        input: query,
        includedRegionCodes: ['us', 'ca'], // Limit to North America
        locationRestriction: null // Global search within region
      };

      // Get autocomplete suggestions
      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      
      if (!suggestions || suggestions.length === 0) {
        return [];
      }

      // Convert suggestions to our expected format and get place details
      const candidates = [];
      for (const suggestion of suggestions.slice(0, 5)) {
        if (suggestion.placePrediction) {
          const place = await this.getPlaceDetailsFromId(suggestion.placePrediction.placeId);
          if (place) {
            candidates.push({
              formatted_address: place.formattedAddress || suggestion.placePrediction.text.text,
              name: suggestion.placePrediction.structuredFormat?.mainText?.text || place.displayName || suggestion.placePrediction.text.text,
              geometry: {
                location: {
                  lat: place.location?.lat() || 0,
                  lng: place.location?.lng() || 0
                }
              },
              place_id: suggestion.placePrediction.placeId
            });
          }
        }
      }
      
      return candidates;
    }

    async getPlaceDetailsFromId(placeId) {
      const { Place } = await google.maps.importLibrary("places");
      
      const place = new Place({
        id: placeId,
        requestedLanguage: 'en'
      });

      // Fetch place details
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'id']
      });

      return place;
    }

    async initializeMap() {
      try {
        console.log('[RoofScanner] Initializing Google Maps');
        
        if (!this.config.googleMapsApiKey) {
          console.error('[RoofScanner] Google Maps API key not configured');
          return;
        }

        // Load Google Maps API if not loaded
        if (!window.google || !window.google.maps) {
          await this.loadGoogleMapsAPI();
        }

        // Get the map container
        const mapContainer = this.shadowRoot.querySelector('#map');
        if (!mapContainer) {
          console.error('[RoofScanner] Map container not found');
          return;
        }

        // Use default location from config
        const defaultLocation = this.config.defaultLocation || {
          lat: 51.0447,
          lng: -114.0719,
          zoom: 13
        };

        // Initialize the map
        this.map = new google.maps.Map(mapContainer, {
          center: { lat: defaultLocation.lat, lng: defaultLocation.lng },
          zoom: defaultLocation.zoom,
          mapTypeId: 'satellite', // Use satellite view for roof analysis
          tilt: 0, // Keep overhead view, no 45° angle
          gestureHandling: 'none', // Disable all map interactions
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
          keyboardShortcuts: false,
          clickableIcons: false,
          disableDefaultUI: true,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          draggable: false
        });

        // No marker needed - clean satellite view
        this.mapMarker = null;

        console.log('[RoofScanner] Google Maps initialized successfully');

      } catch (error) {
        console.error('[RoofScanner] Failed to initialize Google Maps:', error);
      }
    }

    setupAddressSearch() {
      const addressInput = this.shadowRoot.querySelector('#address-input');
      const loadingIndicator = this.shadowRoot.querySelector('#loading-indicator');
      const suggestionsContainer = this.shadowRoot.querySelector('#suggestions-dropdown');
      
      let searchTimeout;
      let selectedLocation = null;
      
      // Handle input changes
      addressInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
        
        // Hide suggestions if query is too short
        if (query.length < 3) {
          this.hideSuggestions();
          this.clearSelection();
          return;
        }
        
        // Debounce the search
        searchTimeout = setTimeout(async () => {
          this.showLoading(true);
          const suggestions = await this.searchPlaces(query);
          this.showLoading(false);
          this.renderSuggestions(suggestions);
        }, 300);
      });
      
      // Store reference for later use
      this.selectedLocation = null;
    }

    showLoading(show) {
      const loadingIndicator = this.shadowRoot.querySelector('#loading-indicator');
      loadingIndicator.style.display = show ? 'block' : 'none';
    }

    renderSuggestions(suggestions) {
      const suggestionsContainer = this.shadowRoot.querySelector('#suggestions-dropdown');
      
      // Clear previous suggestions
      suggestionsContainer.innerHTML = '';
      
      if (suggestions.length === 0) {
        this.hideSuggestions();
        return;
      }
      
      suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion.formatted_address || suggestion.name;
        
        item.addEventListener('click', () => {
          this.selectAddress(suggestion);
        });
        
        suggestionsContainer.appendChild(item);
      });
      
      suggestionsContainer.style.display = 'block';
    }

    hideSuggestions() {
      const suggestionsContainer = this.shadowRoot.querySelector('#suggestions-dropdown');
      suggestionsContainer.style.display = 'none';
    }

    selectAddress(suggestion) {
      const addressInput = this.shadowRoot.querySelector('#address-input');
      
      // Store selected location
      this.selectedLocation = {
        address: suggestion.formatted_address || suggestion.name,
        latitude: suggestion.geometry.location.lat,
        longitude: suggestion.geometry.location.lng,
        placeId: suggestion.place_id
      };
      
      // Update address input
      addressInput.value = this.selectedLocation.address;
      
      // Hide suggestions
      this.hideSuggestions();
      
      // Clear any errors
      this.hideError();

      // Update map location
      this.updateMapLocation(this.selectedLocation.latitude, this.selectedLocation.longitude, this.selectedLocation.address);
      
      console.log('[RoofScanner] Address selected:', this.selectedLocation);
    }

    updateMapLocation(lat, lng, address) {
      if (!this.map) {
        console.warn('[RoofScanner] Map not initialized, cannot update location');
        return;
      }

      const newPosition = { lat: lat, lng: lng };
      
      // Update map center and zoom, maintaining overhead view
      this.map.setCenter(newPosition);
      this.map.setZoom(18); // Zoom in closer for roof analysis
      this.map.setTilt(0); // Ensure overhead view is maintained
      
      console.log('[RoofScanner] Map updated to:', newPosition);
    }

    clearSelection() {
      this.selectedLocation = null;
    }

    showError(message) {
      const errorDiv = this.shadowRoot.querySelector('#error-message');
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }

    hideError() {
      const errorDiv = this.shadowRoot.querySelector('#error-message');
      errorDiv.style.display = 'none';
    }


    createOverlayButton() {
      console.log('[RoofScanner] Creating overlay button');
      
      // Create trigger button
      this.triggerButton = document.createElement('button');
      this.triggerButton.setAttribute('aria-label', 'Open Roof Scanner');
      this.triggerButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M10 2v2.26l2 1.33L14 4.26V2h-4M4.56 7L3 8.56l2.91 2.91c.3.3.79.3 1.09 0L12 6.47l4.91 4.91c.3.3.79.3 1.09 0L20.91 8.56L19.36 7L12 14.36L4.56 7z"/>
          <path d="M5 16v6h6v-5h2v5h6v-6l-7-5l-7 5z"/>
        </svg>
      `;

      // Position styles
      const positions = {
        'bottom-right': { bottom: '24px', right: '24px' },
        'bottom-left': { bottom: '24px', left: '24px' },
        'top-right': { top: '24px', right: '24px' },
        'top-left': { top: '24px', left: '24px' }
      };

      const pos = positions[this.config.position] || positions['bottom-right'];

      // Apply styles
      Object.assign(this.triggerButton.style, {
        position: 'fixed',
        bottom: pos.bottom || 'auto',
        top: pos.top || 'auto',
        left: pos.left || 'auto',
        right: pos.right || 'auto',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#2196F3',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        cursor: 'pointer',
        zIndex: '2147483646',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s ease'
      });

      // Add hover effect
      this.triggerButton.addEventListener('mouseenter', () => {
        this.triggerButton.style.transform = 'scale(1.05)';
      });

      this.triggerButton.addEventListener('mouseleave', () => {
        this.triggerButton.style.transform = 'scale(1)';
      });

      // Add click handler
      this.triggerButton.addEventListener('click', () => this.open());

      // Append to body
      document.body.appendChild(this.triggerButton);
    }

    setupDataAttributeTriggers() {
      console.log('[RoofScanner] Setting up data-attribute triggers');
      
      // Use event delegation for efficiency
      document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-roof-scanner-trigger]');
        if (trigger) {
          event.preventDefault();
          console.log('[RoofScanner] Data-attribute trigger clicked');
          this.open();
        }
      });
    }

    open() {
      if (this.isOpen) return;
      
      console.log('[RoofScanner] Opening modal');
      this.isOpen = true;
      this.container.setAttribute('data-open', 'true');
      
      // Hide trigger button when modal is open
      if (this.triggerButton) {
        this.triggerButton.style.display = 'none';
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    close() {
      if (!this.isOpen) return;
      
      console.log('[RoofScanner] Closing modal');
      this.isOpen = false;
      this.container.removeAttribute('data-open');
      
      // Show trigger button when modal is closed
      if (this.triggerButton) {
        this.triggerButton.style.display = 'flex';
      }

      // Restore body scroll
      document.body.style.overflow = '';
    }

    destroy() {
      console.log('[RoofScanner] Destroying widget');
      
      // Remove elements
      if (this.container) {
        this.container.remove();
      }
      
      if (this.triggerButton) {
        this.triggerButton.remove();
      }

      // Reset state
      this.container = null;
      this.shadowRoot = null;
      this.triggerButton = null;
      this.isOpen = false;
    }
  }

  // Create global instance
  const widget = new RoofScannerWidget();

  // Extract configuration from script tag
  const script = document.currentScript || document.querySelector('script[src*="roof-scanner"]');
  const config = {
    mode: script?.getAttribute('data-mode') || undefined,
    position: script?.getAttribute('data-position') || undefined
    // serverUrl and googleMapsApiKey are built into the widget from environment variables
  };

  // Initialize widget
  widget.init(config);

  // Expose API
  window.RoofScanner = {
    open: () => widget.open(),
    close: () => widget.close(),
    destroy: () => widget.destroy(),
    init: (newConfig) => widget.init(newConfig)
  };

  // Dispatch ready event
  window.dispatchEvent(new CustomEvent('roofscanner:ready'));

})();