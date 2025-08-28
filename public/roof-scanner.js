var b=Object.defineProperty;var h=Object.getOwnPropertySymbols;var f=Object.prototype.hasOwnProperty,w=Object.prototype.propertyIsEnumerable;var u=(n,i,o)=>i in n?b(n,i,{enumerable:!0,configurable:!0,writable:!0,value:o}):n[i]=o,m=(n,i)=>{for(var o in i||(i={}))f.call(i,o)&&u(n,o,i[o]);if(h)for(var o of h(i))w.call(i,o)&&u(n,o,i[o]);return n};var d=(n,i,o)=>new Promise((p,c)=>{var e=r=>{try{s(o.next(r))}catch(a){c(a)}},t=r=>{try{s(o.throw(r))}catch(a){c(a)}},s=r=>r.done?p(r.value):Promise.resolve(r.value).then(e,t);s((o=o.apply(n,i)).next())});(function(){"use strict";(function(){if(window.__roofScannerLoaded)return;window.__roofScannerLoaded=!0;class n{constructor(){this.config={},this.isOpen=!1,this.container=null,this.shadowRoot=null,this.triggerButton=null}init(e={}){console.log("[RoofScanner] Initializing widget",e),this.config=m({mode:e.mode||"overlay",position:e.position||"bottom-right",apiKey:e.apiKey||"test-solar-api-key-123",serverUrl:e.serverUrl||"http://localhost:3000",googleMapsApiKey:e.googleMapsApiKey||"AIzaSyDEuztnki5fYeIsQ2qGcTd38sXOqE-v7bE"},e),this.createContainer(),this.config.mode==="overlay"&&this.createOverlayButton(),this.setupDataAttributeTriggers(),console.log("[RoofScanner] Widget initialized")}createContainer(){customElements.get("roof-scanner-widget")||customElements.define("roof-scanner-widget",class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}}),this.container=document.createElement("roof-scanner-widget"),document.body.appendChild(this.container),this.shadowRoot=this.container.shadowRoot,this.shadowRoot.innerHTML=`
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

          .selected-address {
            background-color: #e8f5e9;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 16px;
          }

          .selected-address h4 {
            margin: 0 0 8px 0;
            color: #2e7d32;
          }

          .selected-address p {
            margin: 0;
            font-size: 14px;
            color: #555;
          }

          .action-button {
            background: #4285F4;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            margin-top: 16px;
          }

          .action-button:hover:not(:disabled) {
            background: #3367d6;
          }

          .action-button:disabled {
            background: #cccccc;
            cursor: not-allowed;
          }
        </style>
        <div class="backdrop"></div>
        <div class="modal">
          <button class="close-button" aria-label="Close">&times;</button>
          <div class="content">
            <h2>Solar Roof Analysis</h2>
            
            <div class="error-message" id="error-message" style="display: none;"></div>
            
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
            
            <div class="selected-address" id="selected-address" style="display: none;">
              <h4>Selected Address:</h4>
              <p id="selected-address-text"></p>
              <p>Coordinates: <span id="selected-coordinates"></span></p>
            </div>
            
            <button class="action-button" id="analyze-button" disabled>
              Start Solar Analysis
            </button>
          </div>
        </div>
      `;const e=this.shadowRoot.querySelector(".backdrop"),t=this.shadowRoot.querySelector(".close-button");e.addEventListener("click",()=>this.close()),t.addEventListener("click",()=>this.close()),document.addEventListener("keydown",s=>{s.key==="Escape"&&this.isOpen&&this.close()}),this.setupAddressSearch()}searchPlaces(e){return d(this,null,function*(){if(!e||e.length<3)return[];try{if(!this.config.googleMapsApiKey)throw new Error("Google Maps API key not configured");if(this.config.serverUrl)try{const t=yield fetch(`${this.config.serverUrl}/api/v1/places/search?query=${encodeURIComponent(e)}`);if(t.ok)return(yield t.json()).candidates||[]}catch(t){console.log("Proxy method failed, trying direct Google Maps API integration")}return window.google&&window.google.maps&&window.google.maps.places?yield this.searchPlacesWithGoogleAPI(e):(yield this.loadGoogleMapsAPI(),yield this.searchPlacesWithGoogleAPI(e))}catch(t){return console.error("Places search error:",t),this.showError(`Address search failed: ${t.message}`),[]}})}loadGoogleMapsAPI(){return d(this,null,function*(){return window.google&&window.google.maps?Promise.resolve():new Promise((e,t)=>{const s=document.createElement("script");s.src=`https://maps.googleapis.com/maps/api/js?key=${this.config.googleMapsApiKey}&libraries=places&callback=initGoogleMaps`,s.async=!0,s.defer=!0,window.initGoogleMaps=()=>{e()},s.onerror=()=>{t(new Error("Failed to load Google Maps API"))},document.head.appendChild(s)})})}searchPlacesWithGoogleAPI(e){return d(this,null,function*(){return new Promise(t=>{const s=new google.maps.places.PlacesService(document.createElement("div")),r={query:e,fields:["formatted_address","name","geometry","place_id"]};s.findPlaceFromQuery(r,(a,l)=>{if(l===google.maps.places.PlacesServiceStatus.OK){const y=a.map(g=>({formatted_address:g.formatted_address,name:g.name,geometry:{location:{lat:g.geometry.location.lat(),lng:g.geometry.location.lng()}},place_id:g.place_id}));t(y)}else console.log("Places service status:",l),t([])})})})}setupAddressSearch(){const e=this.shadowRoot.querySelector("#address-input");this.shadowRoot.querySelector("#loading-indicator"),this.shadowRoot.querySelector("#suggestions-dropdown");const t=this.shadowRoot.querySelector("#analyze-button");let s;e.addEventListener("input",r=>d(this,null,function*(){const a=r.target.value.trim();if(s&&clearTimeout(s),a.length<3){this.hideSuggestions(),this.clearSelection();return}s=setTimeout(()=>d(this,null,function*(){this.showLoading(!0);const l=yield this.searchPlaces(a);this.showLoading(!1),this.renderSuggestions(l)}),300)})),t.addEventListener("click",()=>{}),this.selectedLocation=null}showLoading(e){const t=this.shadowRoot.querySelector("#loading-indicator");t.style.display=e?"block":"none"}renderSuggestions(e){const t=this.shadowRoot.querySelector("#suggestions-dropdown");if(t.innerHTML="",e.length===0){this.hideSuggestions();return}e.forEach(s=>{const r=document.createElement("div");r.className="suggestion-item",r.textContent=s.formatted_address||s.name,r.addEventListener("click",()=>{this.selectAddress(s)}),t.appendChild(r)}),t.style.display="block"}hideSuggestions(){const e=this.shadowRoot.querySelector("#suggestions-dropdown");e.style.display="none"}selectAddress(e){const t=this.shadowRoot.querySelector("#address-input"),s=this.shadowRoot.querySelector("#selected-address"),r=this.shadowRoot.querySelector("#selected-address-text"),a=this.shadowRoot.querySelector("#selected-coordinates"),l=this.shadowRoot.querySelector("#analyze-button");this.selectedLocation={address:e.formatted_address||e.name,latitude:e.geometry.location.lat,longitude:e.geometry.location.lng,placeId:e.place_id},t.value=this.selectedLocation.address,r.textContent=this.selectedLocation.address,a.textContent=`${this.selectedLocation.latitude.toFixed(6)}, ${this.selectedLocation.longitude.toFixed(6)}`,s.style.display="block",l.disabled=!1,this.hideSuggestions(),this.hideError(),console.log("[RoofScanner] Address selected:",this.selectedLocation)}clearSelection(){const e=this.shadowRoot.querySelector("#selected-address"),t=this.shadowRoot.querySelector("#analyze-button");this.selectedLocation=null,e.style.display="none",t.disabled=!0}showError(e){const t=this.shadowRoot.querySelector("#error-message");t.textContent=e,t.style.display="block"}hideError(){const e=this.shadowRoot.querySelector("#error-message");e.style.display="none"}startSolarAnalysis(e){return d(this,null,function*(){console.log("[RoofScanner] Starting solar analysis for:",e);const t=this.shadowRoot.querySelector("#analyze-button");t.textContent="Analysis starting...",t.disabled=!0,setTimeout(()=>{t.textContent="Analysis Complete! (Demo)",console.log("[RoofScanner] Analysis would start here with location:",e)},2e3)})}createOverlayButton(){console.log("[RoofScanner] Creating overlay button"),this.triggerButton=document.createElement("button"),this.triggerButton.setAttribute("aria-label","Open Roof Scanner"),this.triggerButton.innerHTML=`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M10 2v2.26l2 1.33L14 4.26V2h-4M4.56 7L3 8.56l2.91 2.91c.3.3.79.3 1.09 0L12 6.47l4.91 4.91c.3.3.79.3 1.09 0L20.91 8.56L19.36 7L12 14.36L4.56 7z"/>
          <path d="M5 16v6h6v-5h2v5h6v-6l-7-5l-7 5z"/>
        </svg>
      `;const e={"bottom-right":{bottom:"24px",right:"24px"},"bottom-left":{bottom:"24px",left:"24px"},"top-right":{top:"24px",right:"24px"},"top-left":{top:"24px",left:"24px"}},t=e[this.config.position]||e["bottom-right"];Object.assign(this.triggerButton.style,{position:"fixed",bottom:t.bottom||"auto",top:t.top||"auto",left:t.left||"auto",right:t.right||"auto",width:"56px",height:"56px",borderRadius:"50%",backgroundColor:"#2196F3",border:"none",boxShadow:"0 4px 12px rgba(0, 0, 0, 0.15)",cursor:"pointer",zIndex:"2147483646",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.2s ease"}),this.triggerButton.addEventListener("mouseenter",()=>{this.triggerButton.style.transform="scale(1.05)"}),this.triggerButton.addEventListener("mouseleave",()=>{this.triggerButton.style.transform="scale(1)"}),this.triggerButton.addEventListener("click",()=>this.open()),document.body.appendChild(this.triggerButton)}setupDataAttributeTriggers(){console.log("[RoofScanner] Setting up data-attribute triggers"),document.addEventListener("click",e=>{e.target.closest("[data-roof-scanner-trigger]")&&(e.preventDefault(),console.log("[RoofScanner] Data-attribute trigger clicked"),this.open())})}open(){this.isOpen||(console.log("[RoofScanner] Opening modal"),this.isOpen=!0,this.container.setAttribute("data-open","true"),this.triggerButton&&(this.triggerButton.style.display="none"),document.body.style.overflow="hidden")}close(){this.isOpen&&(console.log("[RoofScanner] Closing modal"),this.isOpen=!1,this.container.removeAttribute("data-open"),this.triggerButton&&(this.triggerButton.style.display="flex"),document.body.style.overflow="")}destroy(){console.log("[RoofScanner] Destroying widget"),this.container&&this.container.remove(),this.triggerButton&&this.triggerButton.remove(),this.container=null,this.shadowRoot=null,this.triggerButton=null,this.isOpen=!1}}const i=new n,o=document.currentScript||document.querySelector('script[src*="roof-scanner"]'),p={apiKey:(o==null?void 0:o.getAttribute("data-api-key"))||void 0,mode:(o==null?void 0:o.getAttribute("data-mode"))||void 0,position:(o==null?void 0:o.getAttribute("data-position"))||void 0,serverUrl:(o==null?void 0:o.getAttribute("data-server-url"))||void 0,googleMapsApiKey:(o==null?void 0:o.getAttribute("data-google-maps-api-key"))||void 0};i.init(p),window.RoofScanner={open:()=>i.open(),close:()=>i.close(),destroy:()=>i.destroy(),init:c=>i.init(c)},window.dispatchEvent(new CustomEvent("roofscanner:ready"))})()})();
//# sourceMappingURL=roof-scanner.js.map
