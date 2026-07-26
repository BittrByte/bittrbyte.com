// Map View - Skywall OS Simulator

(function() {
    'use strict';

    const mapView = document.getElementById('map-view');
    const mapBackBtn = document.getElementById('map-back-btn');
    const mapSearch = document.getElementById('map-search');
    const mapSearchResults = document.getElementById('map-search-results');
    const mapContainer = document.getElementById('map-container');

    let map = null;
    let markers = [];
    let userLocationMarker = null;
    let searchTimeout = null;
    let currentPin = null;
    let currentCircle = null;
    let radiusSlider = null;

    // Sample policy pins (empty - user will create policies)
    const samplePolicies = [];

    // User location (simulated) - Brooklyn Bridge for tour
    let userLocation = { lat: 40.7061, lng: -73.9969 };

    // Initialize map
    function initMap() {
        if (map) return;

        map = L.map('map-container', {
            center: [40.7350, -73.9900], // Optimized to show lower Manhattan and Brooklyn Bridge
            zoom: 12, // Wider view to see all Manhattan locations
            zoomControl: true
        });

        // OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
        }).addTo(map);

        // Add user location marker
        addUserLocationMarker();

        // Add policy pins
        addPolicyPins();
    }

    // Add user location with avatar
    function addUserLocationMarker() {
        const avatarIcon = L.divIcon({
            className: 'map-marker-avatar',
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            popupAnchor: [0, -25],
            html: `<div class="user-avatar-marker">
                <div class="avatar-pulse"></div>
                <div class="avatar-circle" style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 4px solid white; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7);">
                    <img src="../../../Linkedin Profile Image copy.png" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </div>`
        });

        userLocationMarker = L.marker([userLocation.lat, userLocation.lng], {
            icon: avatarIcon,
            draggable: false,
            zIndexOffset: 2000 // Keep user marker on top of everything
        }).addTo(map);

        userLocationMarker.bindPopup('<b>You are here</b><br>Brooklyn Bridge<br>7:30 PM');
    }

    // Add policy pins
    function addPolicyPins() {
        samplePolicies.forEach(policy => {
            // Add restriction zone pins (red)
            if (policy.restrictionZones) {
                policy.restrictionZones.forEach((zone, index) => {
                    addRestrictionPin(policy, zone, index);
                });
            }

            // Add enforcement zone pin (black)
            if (policy.enforcementZone) {
                addEnforcementPin(policy, policy.enforcementZone);
            }
        });
    }

    // Add red pin (restriction zone)
    function addRestrictionPin(policy, zone, index) {
        const redIcon = L.divIcon({
            className: 'map-marker-red',
            iconSize: [24, 24],
            iconAnchor: [12, 24]
        });

        const marker = L.marker([zone.lat, zone.lng], { icon: redIcon }).addTo(map);
        markers.push(marker);

        // Add circle
        const circle = L.circle([zone.lat, zone.lng], {
            color: '#E53935',
            fillColor: '#E53935',
            fillOpacity: 0.15,
            radius: zone.radiusM,
            weight: 2
        }).addTo(map);

        // Popup
        const popupContent = `
            <div class="pin-popup-title">${zone.label}</div>
            <div class="pin-popup-apps">${policy.apps.join(', ')}</div>
            <div class="pin-popup-actions">
                <div class="pin-popup-btn" onclick="window.MapModule.editPolicy('${policy.id}')">Edit</div>
                <div class="pin-popup-btn delete" onclick="window.MapModule.deleteZone('${policy.id}', ${index})">Delete</div>
            </div>
        `;
        marker.bindPopup(popupContent);
    }

    // Add black pin (enforcement zone)
    function addEnforcementPin(policy, zone) {
        const blackIcon = L.divIcon({
            className: 'map-marker-black',
            iconSize: [24, 24],
            iconAnchor: [12, 24]
        });

        const marker = L.marker([zone.lat, zone.lng], { icon: blackIcon }).addTo(map);
        markers.push(marker);

        // Add circle
        const circle = L.circle([zone.lat, zone.lng], {
            color: '#000',
            fillColor: '#000',
            fillOpacity: 0.15,
            radius: zone.radiusM,
            weight: 2
        }).addTo(map);

        // Popup
        const popupContent = `
            <div class="pin-popup-title">${policy.name}</div>
            <div class="pin-popup-apps">${policy.apps.join(', ')}</div>
            <div class="pin-popup-apps" style="margin-top: 8px;">Enforcement Zone</div>
            <div class="pin-popup-actions">
                <div class="pin-popup-btn" onclick="window.MapModule.editPolicy('${policy.id}')">Edit</div>
                <div class="pin-popup-btn delete" onclick="window.MapModule.deletePolicy('${policy.id}')">Delete Policy</div>
            </div>
        `;
        marker.bindPopup(popupContent);
    }

    // Search with Nominatim
    async function searchLocation(query) {
        if (!query || query.length < 3) {
            mapSearchResults.classList.remove('active');
            return;
        }

        try {
            const url = `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query)}, Manhattan, NYC&` +
                `format=json&limit=5&addressdetails=1`;

            const response = await fetch(url, {
                headers: { 'User-Agent': 'SkywallOS-Demo/1.0' }
            });

            const results = await response.json();
            displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    // Display search results
    function displaySearchResults(results) {
        mapSearchResults.innerHTML = '';

        if (results.length === 0) {
            mapSearchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = 'search-result-item';

                const name = document.createElement('div');
                name.className = 'search-result-name';
                name.textContent = result.name || result.display_name.split(',')[0];

                const address = document.createElement('div');
                address.className = 'search-result-address';
                address.textContent = result.display_name;

                item.appendChild(name);
                item.appendChild(address);

                item.addEventListener('click', () => {
                    const lat = parseFloat(result.lat);
                    const lng = parseFloat(result.lon);
                    map.setView([lat, lng], 16);
                    mapSearch.value = '';
                    mapSearchResults.classList.remove('active');
                });

                mapSearchResults.appendChild(item);
            });
        }

        mapSearchResults.classList.add('active');
    }

    // Search input handler
    mapSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 3) {
            mapSearchResults.classList.remove('active');
            return;
        }

        searchTimeout = setTimeout(() => {
            searchLocation(query);
        }, 500);
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!mapSearch.contains(e.target) && !mapSearchResults.contains(e.target)) {
            mapSearchResults.classList.remove('active');
        }
    });

    // Back button
    mapBackBtn.addEventListener('click', () => {
        mapView.classList.remove('active');
    });

    // Initialize map when view becomes active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                setTimeout(() => {
                    initMap();
                    if (map) {
                        map.invalidateSize();
                    }
                }, 100);
            }
        });
    });

    observer.observe(mapView, { attributes: true, attributeFilter: ['class'] });

    // Initialize map for tour with pre-existing policies
    function initTourMap(tourPolicies) {
        if (!map) {
            initMap();
        }
        
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Set user location to Brooklyn Bridge
        userLocation = tourPolicies.userState.currentLocation;
        if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
        }
        addUserLocationMarker();
        
        // Collect all pin locations for bounds
        const allLocations = [];
        
        // Add all policy pins
        tourPolicies.policies.forEach(policy => {
            // Add red restriction pin
            addTourRestrictionPin(policy);
            allLocations.push([policy.restrictionZone.lat, policy.restrictionZone.lng]);
            
            // Add black enforcement pin
            addTourEnforcementPin(policy);
            allLocations.push([policy.enforcementZone.lat, policy.enforcementZone.lng]);
        });
        
        // Add user location to bounds
        allLocations.push([userLocation.lat, userLocation.lng]);
        
        // Fit map to show all locations with padding
        if (allLocations.length > 0) {
            const bounds = L.latLngBounds(allLocations);
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 13
            });
        }
    }
    
    // Initialize map for China Enforcement Demo
    function initChinaEnforcementMap(chinaPolicies) {
        if (!map) {
            // Initialize map centered on Shenzhen
            map = L.map('map-container', {
                center: [22.5431, 114.0579],
                zoom: 11,
                zoomControl: true
            });
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19
            }).addTo(map);
        } else {
            map.setView([22.5431, 114.0579], 11);
        }
        
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Set user location to KFC Dongmen
        userLocation = chinaPolicies.userState.currentLocation;
        if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
        }
        
        // Add user marker with custom avatar image
        const avatarIcon = L.divIcon({
            className: 'map-marker-avatar',
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            popupAnchor: [0, -25],
            html: `<div class="user-avatar-marker">
                <div class="avatar-pulse"></div>
                <div class="avatar-circle" style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 4px solid white; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7);">
                    <img src="../../../Linkedin Profile Image copy.png" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </div>`
        });
        
        userLocationMarker = L.marker([userLocation.lat, userLocation.lng], {
            icon: avatarIcon,
            draggable: false,
            zIndexOffset: 2000
        }).addTo(map);
        
        userLocationMarker.bindPopup(`<b>You are here</b><br>${userLocation.name}<br>2:30 PM`);
        
        // Collect all pin locations for bounds
        const allLocations = [];
        
        // Add all policy pins
        chinaPolicies.policies.forEach(policy => {
            // Add red restriction pins (multiple KFC locations)
            policy.restrictionZones.forEach((zone, idx) => {
                addChinaRestrictionPin(policy, zone, idx);
                allLocations.push([zone.lat, zone.lng]);
            });
            
            // Add black enforcement pin (Shenzhen home)
            addChinaEnforcementPin(policy);
            allLocations.push([policy.enforcementZone.lat, policy.enforcementZone.lng]);
        });
        
        // Add user location to bounds
        allLocations.push([userLocation.lat, userLocation.lng]);
        
        // Fit map to show all locations with padding
        if (allLocations.length > 0) {
            const bounds = L.latLngBounds(allLocations);
            map.fitBounds(bounds, {
                padding: [60, 60],
                maxZoom: 12
            });
        }
    }
    
    // Add China restriction pin (red - KFC locations)
    function addChinaRestrictionPin(policy, zone, zoneIndex) {
        const redIcon = L.divIcon({
            className: 'map-marker-red-pro',
            html: `
                <div class="pin-marker-container">
                    <svg viewBox="0 0 32 48" width="32" height="48">
                        <defs>
                            <filter id="pin-shadow-red-china-${zoneIndex}">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4"/>
                            </filter>
                        </defs>
                        <path d="M16 0C7.163 0 0 7.163 0 16c0 13 16 32 16 32s16-19 16-32C32 7.163 24.837 0 16 0z" 
                              fill="#E53935" 
                              filter="url(#pin-shadow-red-china-${zoneIndex})"/>
                        <circle cx="16" cy="16" r="6" fill="white"/>
                    </svg>
                    <div class="pin-label">${zone.name}</div>
                </div>
            `,
            iconSize: [32, 48],
            iconAnchor: [16, 48],
            popupAnchor: [0, -48]
        });
        
        const marker = L.marker([zone.lat, zone.lng], {
            icon: redIcon,
            zIndexOffset: 100
        }).addTo(map);
        markers.push(marker);
        
        // Add colored geofence circle (RESTRICTION ZONE)
        const circle = L.circle([zone.lat, zone.lng], {
            color: '#E53935',
            fillColor: '#EF5350',
            fillOpacity: 0.25,
            radius: zone.radius,
            weight: 2,
            opacity: 0.8,
            dashArray: '5, 5'
        }).addTo(map);
        markers.push(circle);
        
        // Popup
        const popupContent = `
            <div class="pin-popup-title">${zone.name}</div>
            <div class="pin-popup-apps">${policy.apps.join(', ')} Blocked</div>
            <div class="pin-popup-schedule">${policy.schedule}</div>
            <div class="pin-popup-actions">
                <div class="pin-popup-btn" onclick="window.MapModule.goToChinaChat('${policy.id}')">Go to Chat</div>
            </div>
        `;
        marker.bindPopup(popupContent);
    }
    
    // Add China enforcement pin (black - Shenzhen home)
    function addChinaEnforcementPin(policy) {
        const blackIcon = L.divIcon({
            className: 'map-marker-black-pro',
            html: `
                <div class="pin-marker-container">
                    <svg viewBox="0 0 32 48" width="32" height="48">
                        <defs>
                            <filter id="pin-shadow-black-china">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.5"/>
                            </filter>
                        </defs>
                        <path d="M16 0C7.163 0 0 7.163 0 16c0 13 16 32 16 32s16-19 16-32C32 7.163 24.837 0 16 0z" 
                              fill="#1a1a1a" 
                              stroke="#000" 
                              stroke-width="1"
                              filter="url(#pin-shadow-black-china)"/>
                        <circle cx="16" cy="16" r="6" fill="white"/>
                    </svg>
                    <div class="pin-label">${policy.enforcementZone.name}</div>
                </div>
            `,
            iconSize: [32, 48],
            iconAnchor: [16, 48],
            popupAnchor: [0, -48]
        });
        
        const marker = L.marker([policy.enforcementZone.lat, policy.enforcementZone.lng], {
            icon: blackIcon,
            zIndexOffset: 100
        }).addTo(map);
        markers.push(marker);
        
        // Add colored geofence circle (ENFORCEMENT ZONE)
        const circle = L.circle([policy.enforcementZone.lat, policy.enforcementZone.lng], {
            color: '#424242',
            fillColor: '#616161',
            fillOpacity: 0.2,
            radius: policy.enforcementRadius,
            weight: 2,
            opacity: 0.7,
            dashArray: '10, 5'
        }).addTo(map);
        markers.push(circle);
        
        // Popup
        const popupContent = `
            <div class="pin-popup-title">${policy.name}</div>
            <div class="pin-popup-apps">Enforcement Zone</div>
            <div class="pin-popup-schedule">Editable: ${policy.enforcementTime.start}:00 - ${policy.enforcementTime.end}:00</div>
            <div class="pin-popup-actions">
                <div class="pin-popup-btn" onclick="window.MapModule.goToChinaChat('${policy.id}')">Go to Chat</div>
            </div>
        `;
        marker.bindPopup(popupContent);
    }
    
    // Add tour restriction pin (red)
    function addTourRestrictionPin(policy) {
        // Professional red pin marker with SVG
        const redIcon = L.divIcon({
            className: 'map-marker-red-pro',
            html: `
                <div class="pin-marker-container">
                    <svg viewBox="0 0 32 48" width="32" height="48">
                        <defs>
                            <filter id="pin-shadow-red-${policy.id}">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4"/>
                            </filter>
                        </defs>
                        <path d="M16 0C7.163 0 0 7.163 0 16c0 13 16 32 16 32s16-19 16-32C32 7.163 24.837 0 16 0z" 
                              fill="#E53935" 
                              filter="url(#pin-shadow-red-${policy.id})"/>
                        <circle cx="16" cy="16" r="6" fill="white"/>
                    </svg>
                    <div class="pin-label">${policy.restrictionZone.name}</div>
                </div>
            `,
            iconSize: [32, 48],
            iconAnchor: [16, 48],
            popupAnchor: [0, -48]
        });
        
        const marker = L.marker([policy.restrictionZone.lat, policy.restrictionZone.lng], {
            icon: redIcon,
            zIndexOffset: 100
        }).addTo(map);
        markers.push(marker);
        
        // Add colored geofence circle (RESTRICTION ZONE)
        const circle = L.circle([policy.restrictionZone.lat, policy.restrictionZone.lng], {
            color: '#E53935',
            fillColor: '#EF5350',
            fillOpacity: 0.25,
            radius: policy.restrictionRadius,
            weight: 2,
            opacity: 0.8,
            dashArray: '5, 5'
        }).addTo(map);
        markers.push(circle);
        
        // Popup with "Go to chat" option
        const popupContent = `
            <div class="pin-popup-title">${policy.name}</div>
            <div class="pin-popup-apps">${policy.apps.join(', ')}</div>
            <div class="pin-popup-schedule">${policy.schedule}</div>
            <div class="pin-popup-actions">
                <div class="pin-popup-btn" onclick="window.MapModule.goToChat('${policy.id}')">Go to Chat</div>
            </div>
        `;
        marker.bindPopup(popupContent);
    }
    
    // Add tour enforcement pin (black)
    function addTourEnforcementPin(policy) {
        // Professional black pin marker with SVG
        const blackIcon = L.divIcon({
            className: 'map-marker-black-pro',
            html: `
                <div class="pin-marker-container">
                    <svg viewBox="0 0 32 48" width="32" height="48">
                        <defs>
                            <filter id="pin-shadow-black-${policy.id}">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.5"/>
                            </filter>
                        </defs>
                        <path d="M16 0C7.163 0 0 7.163 0 16c0 13 16 32 16 32s16-19 16-32C32 7.163 24.837 0 16 0z" 
                              fill="#1a1a1a" 
                              stroke="#000" 
                              stroke-width="1"
                              filter="url(#pin-shadow-black-${policy.id})"/>
                        <circle cx="16" cy="16" r="6" fill="white"/>
                    </svg>
                    <div class="pin-label">${policy.enforcementZone.name}</div>
                </div>
            `,
            iconSize: [32, 48],
            iconAnchor: [16, 48],
            popupAnchor: [0, -48]
        });
        
        const marker = L.marker([policy.enforcementZone.lat, policy.enforcementZone.lng], {
            icon: blackIcon,
            zIndexOffset: 100
        }).addTo(map);
        markers.push(marker);
        
        // Add colored geofence circle (ENFORCEMENT ZONE)
        const circle = L.circle([policy.enforcementZone.lat, policy.enforcementZone.lng], {
            color: '#424242',
            fillColor: '#616161',
            fillOpacity: 0.2,
            radius: policy.enforcementRadius,
            weight: 2,
            opacity: 0.7,
            dashArray: '10, 5'
        }).addTo(map);
        markers.push(circle);
        
        // Popup
        const popupContent = `
            <div class="pin-popup-title">${policy.name}</div>
            <div class="pin-popup-apps">Enforcement Zone</div>
            <div class="pin-popup-schedule">Editable: ${policy.enforcementTime.start}:00 - ${policy.enforcementTime.end}:00</div>
            <div class="pin-popup-actions">
                <div class="pin-popup-btn" onclick="window.MapModule.goToChat('${policy.id}')">Go to Chat</div>
            </div>
        `;
        marker.bindPopup(popupContent);
    }

    // Initialize map for Manhattan Enforcement Demo
    function initManhattanEnforcementMap(manhattanPolicies) {
        if (!map) {
            // Initialize map centered on Manhattan
            map = L.map('map-container', {
                center: [40.7390, -73.9937],
                zoom: 12,
                zoomControl: true
            });
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19
            }).addTo(map);
        } else {
            map.setView([40.7390, -73.9937], 12);
        }
        
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Set user location to World Trade Center
        userLocation = manhattanPolicies.userState.currentLocation;
        if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
        }
        
        // Add user marker with custom avatar
        const avatarIcon = L.divIcon({
            className: 'map-marker-avatar',
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            popupAnchor: [0, -25],
            html: `<div class="user-avatar-marker">
                <div class="avatar-pulse"></div>
                <div class="avatar-circle" style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 4px solid white; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7);">
                    <img src="../../../Linkedin Profile Image copy.png" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </div>`
        });
        
        userLocationMarker = L.marker([userLocation.lat, userLocation.lng], {
            icon: avatarIcon,
            draggable: false,
            zIndexOffset: 2000
        }).addTo(map);
        
        userLocationMarker.bindPopup(`<b>You are here</b><br>${userLocation.name}<br>11:00 AM`);
        
        // Collect all pin locations for bounds
        const allLocations = [];
        
        // Add all policy pins
        manhattanPolicies.policies.forEach(policy => {
            // Add red restriction pin (work location)
            policy.restrictionZones.forEach((zone, idx) => {
                addManhattanRestrictionPin(policy, zone, idx);
                allLocations.push([zone.lat, zone.lng]);
            });
            
            // Add black enforcement pin (home)
            addManhattanEnforcementPin(policy);
            allLocations.push([policy.enforcementZone.lat, policy.enforcementZone.lng]);
        });
        
        // Add user location to bounds
        allLocations.push([userLocation.lat, userLocation.lng]);
        
        // Fit map to show all locations with padding
        if (allLocations.length > 0) {
            const bounds = L.latLngBounds(allLocations);
            map.fitBounds(bounds, {
                padding: [60, 60],
                maxZoom: 13
            });
        }
    }
    
    // Add Manhattan restriction pin (red - work location)
    function addManhattanRestrictionPin(policy, zone, zoneIndex) {
        const redIcon = L.divIcon({
            className: 'map-marker-red-pro',
            html: `
                <div class="pin-marker-container">
                    <svg viewBox="0 0 32 48" width="32" height="48">
                        <defs>
                            <filter id="pin-shadow-red-manhattan-${zoneIndex}">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4"/>
                            </filter>
                        </defs>
                        <path d="M16 0C7.163 0 0 7.163 0 16c0 13 16 32 16 32s16-19 16-32C32 7.163 24.837 0 16 0z" 
                              fill="#E53935" 
                              filter="url(#pin-shadow-red-manhattan-${zoneIndex})"/>
                        <circle cx="16" cy="16" r="6" fill="white"/>
                    </svg>
                    <div class="pin-label">${zone.name}</div>
                </div>
            `,
            iconSize: [32, 48],
            iconAnchor: [16, 48],
            popupAnchor: [0, -48]
        });
        
        const marker = L.marker([zone.lat, zone.lng], {
            icon: redIcon,
            zIndexOffset: 100
        }).addTo(map);
        markers.push(marker);
        
        // Add colored geofence circle (RESTRICTION ZONE)
        const circle = L.circle([zone.lat, zone.lng], {
            color: '#E53935',
            fillColor: '#EF5350',
            fillOpacity: 0.25,
            radius: zone.radius,
            weight: 2,
            opacity: 0.8,
            dashArray: '5, 5'
        }).addTo(map);
        markers.push(circle);
        
        // Popup
        const popupContent = `
            <div class="pin-popup-title">${zone.name}</div>
            <div class="pin-popup-apps">${policy.apps.join(', ')} Blocked</div>
            <div class="pin-popup-schedule">${policy.schedule}</div>
            <div class="pin-popup-actions">
                <div class="pin-popup-btn" onclick="window.MapModule.goToManhattanChat('${policy.id}')">Go to Chat</div>
            </div>
        `;
        marker.bindPopup(popupContent);
    }
    
    // Add Manhattan enforcement pin (black - home)
    function addManhattanEnforcementPin(policy) {
        const blackIcon = L.divIcon({
            className: 'map-marker-black-pro',
            html: `
                <div class="pin-marker-container">
                    <svg viewBox="0 0 32 48" width="32" height="48">
                        <defs>
                            <filter id="pin-shadow-black-manhattan">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.5"/>
                            </filter>
                        </defs>
                        <path d="M16 0C7.163 0 0 7.163 0 16c0 13 16 32 16 32s16-19 16-32C32 7.163 24.837 0 16 0z" 
                              fill="#1a1a1a" 
                              stroke="#000" 
                              stroke-width="1"
                              filter="url(#pin-shadow-black-manhattan)"/>
                        <circle cx="16" cy="16" r="6" fill="white"/>
                    </svg>
                    <div class="pin-label">${policy.enforcementZone.name}</div>
                </div>
            `,
            iconSize: [32, 48],
            iconAnchor: [16, 48],
            popupAnchor: [0, -48]
        });
        
        const marker = L.marker([policy.enforcementZone.lat, policy.enforcementZone.lng], {
            icon: blackIcon,
            zIndexOffset: 100
        }).addTo(map);
        markers.push(marker);
        
        // Add colored geofence circle (ENFORCEMENT ZONE)
        const circle = L.circle([policy.enforcementZone.lat, policy.enforcementZone.lng], {
            color: '#424242',
            fillColor: '#616161',
            fillOpacity: 0.2,
            radius: policy.enforcementRadius,
            weight: 2,
            opacity: 0.7,
            dashArray: '10, 5'
        }).addTo(map);
        markers.push(circle);
        
        // Popup
        const popupContent = `
            <div class="pin-popup-title">${policy.name}</div>
            <div class="pin-popup-apps">Enforcement Zone</div>
            <div class="pin-popup-schedule">Editable: ${policy.enforcementTime.start}:00 - ${policy.enforcementTime.end}:00</div>
            <div class="pin-popup-actions">
                <div class="pin-popup-btn" onclick="window.MapModule.goToManhattanChat('${policy.id}')">Go to Chat</div>
            </div>
        `;
        marker.bindPopup(popupContent);
    }
    
    // Export for other modules
    window.MapModule = {
        editPolicy: function(policyId) {
            console.log('Edit policy:', policyId);
            mapView.classList.remove('active');
            // Would navigate to chat with policy loaded
        },
        deletePolicy: function(policyId) {
            if (confirm('Delete this policy? This will remove all restrictions and zones.')) {
                console.log('Delete policy:', policyId);
                // Would make server call to delete policy
            }
        },
        deleteZone: function(policyId, zoneIndex) {
            if (confirm('Delete this restriction zone?')) {
                console.log('Delete zone:', policyId, zoneIndex);
                // Would make server call to remove zone
            }
        },
        updateUserLocation: function(lat, lng) {
            userLocation = { lat, lng };
            if (userLocationMarker && map) {
                userLocationMarker.setLatLng([lat, lng]);
                map.setView([lat, lng], 15);
            }
        },
        showLocationPicker: function(location, isEnforcement) {
            if (!map) {
                initMap();
            }
            
            // Clear existing pins and circles
            if (currentPin) {
                map.removeLayer(currentPin);
            }
            if (currentCircle) {
                map.removeLayer(currentCircle);
            }
            
            // Set map view to location with higher zoom (more zoomed in)
            map.setView([location.lat, location.lng], 17);
            
            // Add pin at the location
            const pinColor = isEnforcement ? 'black' : 'red';
            const pinIcon = L.divIcon({
                className: `map-marker-${pinColor}`,
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                html: `<div style="width: 24px; height: 24px; background: ${pinColor === 'black' ? '#000' : '#E53935'}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white;"></div>`
            });
            
            currentPin = L.marker([location.lat, location.lng], {
                icon: pinIcon,
                draggable: true
            }).addTo(map);
            
            // Start with larger radius, then refine down to smaller
            const finalRadius = isEnforcement ? 50 : 100;
            const startRadius = isEnforcement ? 150 : 250;
            
            // Add circle around pin starting with larger radius
            const circleColor = isEnforcement ? '#000000' : '#E53935';
            currentCircle = L.circle([location.lat, location.lng], {
                color: circleColor,
                fillColor: circleColor,
                fillOpacity: 0.25,  // Higher transparency so you can see through
                radius: startRadius,
                weight: 2,
                opacity: 0.8  // Border is more visible
            }).addTo(map);
            
            // Bind popup with location name
            currentPin.bindPopup(`<b>${location.name}</b><br>Radius: ${startRadius}m`).openPopup();
            
            // Update circle when marker is dragged
            currentPin.on('drag', function(e) {
                const newPos = e.target.getLatLng();
                currentCircle.setLatLng(newPos);
            });
            
            // Simulate radius refinement (user narrows down from large to precise)
            let currentRadius = startRadius;
            const radiusAnimation = setInterval(() => {
                if (currentRadius > finalRadius) {
                    currentRadius -= 10; // Gradually decrease
                    currentCircle.setRadius(currentRadius);
                    currentPin.getPopup().setContent(`<b>${location.name}</b><br>Radius: ${currentRadius}m`);
                } else {
                    currentRadius = finalRadius;
                    currentCircle.setRadius(currentRadius);
                    currentPin.getPopup().setContent(`<b>${location.name}</b><br>Radius: ${currentRadius}m`);
                    clearInterval(radiusAnimation);
                }
            }, 200);
            
            // Clear animation after 5 seconds (extended to match longer display time)
            setTimeout(() => {
                clearInterval(radiusAnimation);
            }, 5000);
        },
        initTourMap: initTourMap,
        goToChat: function(policyId) {
            // Close map
            mapView.classList.remove('active');
            
            // Find and load the policy chat
            const policy = window.TourPolicies.getPolicyById(policyId);
            if (policy && window.TourDemo) {
                window.TourDemo.viewPolicyChat(policy);
            }
        },
        panToBrooklynBridge: function() {
            // Smoothly pan and zoom to Brooklyn Bridge (user location)
            if (map && userLocation) {
                map.flyTo([userLocation.lat, userLocation.lng], 15, {
                    duration: 2, // 2 second animation
                    easeLinearity: 0.25
                });
            }
        },
        panToOverview: function() {
            // Pan back to overview showing all pins
            if (map) {
                const allLocations = [];
                
                // Collect all policy locations
                const policies = window.TourPolicies?.getPolicies() || [];
                policies.forEach(policy => {
                    allLocations.push([policy.restrictionZone.lat, policy.restrictionZone.lng]);
                    allLocations.push([policy.enforcementZone.lat, policy.enforcementZone.lng]);
                });
                
                // Add user location
                if (userLocation) {
                    allLocations.push([userLocation.lat, userLocation.lng]);
                }
                
                // Fit to bounds
                if (allLocations.length > 0) {
                    const bounds = L.latLngBounds(allLocations);
                    map.flyToBounds(bounds, {
                        padding: [50, 50],
                        maxZoom: 13,
                        duration: 2
                    });
                }
            }
        },
        initChinaEnforcementMap: initChinaEnforcementMap,
        goToChinaChat: function(policyId) {
            // Close map
            mapView.classList.remove('active');
            
            // Find and load the policy chat
            const policy = window.ChinaEnforcementPolicies.getPolicyById(policyId);
            if (policy && window.ChinaEnforcementDemo) {
                window.ChinaEnforcementDemo.viewPolicyChat(policy);
            }
        },
        panToKFCDongmen: function() {
            // Smoothly pan and zoom to KFC Dongmen (user location)
            if (map && userLocation) {
                map.flyTo([userLocation.lat, userLocation.lng], 15, {
                    duration: 2,
                    easeLinearity: 0.25
                });
            }
        },
        initManhattanEnforcementMap: initManhattanEnforcementMap,
        goToManhattanChat: function(policyId) {
            // Close map
            mapView.classList.remove('active');
            
            // Find and load the policy chat
            const policy = window.ManhattanEnforcementPolicies.getPolicyById(policyId);
            if (policy && window.ManhattanEnforcementDemo) {
                window.ManhattanEnforcementDemo.viewPolicyChat(policy);
            }
        },
        panToWorldTradeCenter: function() {
            // Smoothly pan and zoom to World Trade Center (user location)
            if (map && userLocation) {
                map.flyTo([userLocation.lat, userLocation.lng], 15, {
                    duration: 2,
                    easeLinearity: 0.25
                });
            }
        }
    };
})();

