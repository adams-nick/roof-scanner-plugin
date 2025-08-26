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
      
      this.config = {
        mode: config.mode || 'overlay', // 'overlay' or 'trigger'
        position: config.position || 'bottom-right',
        apiKey: config.apiKey || '',
        serverUrl: config.serverUrl || 'http://localhost:3000',
        ...config
      };

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
            text-align: center;
            padding: 40px 20px;
          }
        </style>
        <div class="backdrop"></div>
        <div class="modal">
          <button class="close-button" aria-label="Close">&times;</button>
          <div class="content">
            <h2>Roof Scanner</h2>
            <p>Widget content will go here</p>
            <p>API Key: ${this.config.apiKey || 'Not configured'}</p>
            <p>Server: ${this.config.serverUrl}</p>
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
    apiKey: script?.getAttribute('data-api-key'),
    mode: script?.getAttribute('data-mode'),
    position: script?.getAttribute('data-position'),
    serverUrl: script?.getAttribute('data-server-url')
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