// Events Map Module - Each event is a point on the map
const EventsMap = {
    map: null,
    markersLayer: null,
    markerClusterGroup: null,
    eventsData: [],
    groupedEvents: [],
    isInitialized: false,
    coordinatesData: {},

    async init() {
        if (this.isInitialized) {
            console.log('EventsMap already initialized, resizing map...');
            if (this.map) {
                setTimeout(() => {
                    this.map.invalidateSize();
                    console.log('Map resized');
                }, 100);
            }
            return;
        }

        console.log('Initializing Events Map...');
        
        try {
            if (typeof L === 'undefined') {
                console.error('❌ Leaflet library not loaded!');
                alert('Leaflet map library not loaded. Please check your internet connection.');
                return;
            }
            console.log('✅ Leaflet loaded');
            
            await this.loadCoordinates();
            await this.loadEvents();
            this.initMap();
            this.showAllEvents();
            this.setupControls();
            
            this.isInitialized = true;
            console.log('✅ Events Map initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Events Map:', error);
        }
    },

    async loadCoordinates() {
        try {
            console.log('Loading pre-calculated coordinates...');
            const data = await d3.csv('data/locations_coordinates.csv');
            
            data.forEach(row => {
                this.coordinatesData[row.location] = {
                    lat: parseFloat(row.latitude),
                    lng: parseFloat(row.longitude)
                };
            });
            
            console.log(`✅ Loaded ${Object.keys(this.coordinatesData).length} location coordinates`);
        } catch (error) {
            console.error('❌ Error loading coordinates:', error);
        }
    },

    async loadEvents() {
        try {
            if (DataLoader.events && DataLoader.events.length > 0) {
                this.eventsData = DataLoader.events;
                console.log('Using pre-loaded events data');
            } else {
                console.log('Loading events from CSV...');
                this.eventsData = await d3.csv('data/event_details.csv');
            }
            
            this.eventsData.forEach(event => {
                const parts = event.location.split(',').map(s => s.trim());
                event.city = parts[0] || '';
                event.region = parts[1] || '';
                event.country = parts[2] || parts[1] || '';
            });

            const eventGroups = d3.group(this.eventsData, d => d.event_id);
            
            this.groupedEvents = Array.from(eventGroups, ([eventId, fights]) => {
                const firstFight = fights[0];
                return {
                    event_id: eventId,
                    date: firstFight.date,
                    location: firstFight.location,
                    city: firstFight.city,
                    region: firstFight.region,
                    country: firstFight.country,
                    fightCount: fights.length,
                    fights: fights
                };
            });

            this.groupedEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

            const countries = new Set(this.groupedEvents.map(e => e.country));
            const cities = new Set(this.groupedEvents.map(e => `${e.city}, ${e.country}`));
            
            const countriesEl = document.getElementById('total-countries');
            const citiesEl = document.getElementById('total-cities');
            const eventsEl = document.getElementById('total-events-map');
            
            if (countriesEl) countriesEl.textContent = countries.size;
            if (citiesEl) citiesEl.textContent = cities.size;
            if (eventsEl) eventsEl.textContent = this.groupedEvents.length;
            
            console.log(`✅ Loaded ${this.groupedEvents.length} unique events`);
        } catch (error) {
            console.error('❌ Error loading events:', error);
            throw error;
        }
    },

    initMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('❌ Map element not found!');
            return;
        }

        console.log('Creating Leaflet map...');
        
        if (this.map) {
            this.map.remove();
        }

        try {
            this.map = L.map('map', {
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                touchZoom: true
            }).setView([20, 0], 2);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
                minZoom: 2
            }).addTo(this.map);

            // Criar grupo de clustering de marcadores
            this.markerClusterGroup = L.markerClusterGroup({
                maxClusterRadius: 80,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                iconCreateFunction: function(cluster) {
                    const count = cluster.getChildCount();
                    let size = 'small';
                    if (count > 10) size = 'medium';
                    if (count > 50) size = 'large';
                    
                    return L.divIcon({
                        html: `<div><span>${count}</span></div>`,
                        className: 'marker-cluster marker-cluster-' + size,
                        iconSize: L.point(40, 40)
                    });
                }
            });

            this.map.addLayer(this.markerClusterGroup);
            this.markersLayer = L.layerGroup().addTo(this.map);
            
            console.log('✅ Leaflet map created successfully');
            
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                    console.log('Map size invalidated and refreshed');
                }
            }, 300);
        } catch (error) {
            console.error('❌ Error creating map:', error);
        }
    },

    async showAllEvents() {
        console.log('Showing all events on map...');
        
        if (!this.markerClusterGroup) {
            console.error('Marker cluster group not initialized');
            return;
        }
        
        this.markerClusterGroup.clearLayers();

        let markersAdded = 0;
        let notFound = 0;

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'map-loading';
        loadingDiv.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 1000;';
        loadingDiv.textContent = 'Loading events on map...';
        document.querySelector('.map-container').appendChild(loadingDiv);

        for (let i = 0; i < this.groupedEvents.length; i++) {
            const event = this.groupedEvents[i];
            
            // Usar coordenadas pré-calculadas
            const coords = this.coordinatesData[event.location];
            
            if (coords) {
                this.addEventMarker(event, [coords.lat, coords.lng]);
                markersAdded++;
            } else {
                notFound++;
                console.warn(`Coordinates not found for: ${event.location}`);
            }

            if (i % 20 === 0) {
                loadingDiv.textContent = `Loading events: ${i + 1}/${this.groupedEvents.length}`;
            }
        }

        loadingDiv.remove();

        console.log(`✅ Added ${markersAdded} event markers (${notFound} locations not found)`);

        if (markersAdded > 0) {
            const bounds = this.markerClusterGroup.getBounds();
            if (bounds.isValid()) {
                this.map.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        setTimeout(() => {
            if (this.map) this.map.invalidateSize();
        }, 200);
    },

    addEventMarker(event, coords) {
        const marker = L.circleMarker(coords, {
            radius: 8,
            fillColor: '#d91c1c',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });

        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        marker.bindPopup(`
            <div class="popup-title">${event.location}</div>
            <div style="color: #888; font-size: 0.9rem; margin: 0.5rem 0;">${formattedDate}</div>
            <div class="popup-count">${event.fightCount} fight${event.fightCount > 1 ? 's' : ''}</div>
            <button 
                onclick="EventsMap.showEventDetails('${event.event_id}')" 
                style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #d91c1c; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;"
            >
                View Event Details
            </button>
        `);

        marker.on('mouseover', function() {
            this.setStyle({
                radius: 12,
                fillOpacity: 1
            });
        });

        marker.on('mouseout', function() {
            this.setStyle({
                radius: 8,
                fillOpacity: 0.8
            });
        });

        // Adicionar ao grupo de clustering
        this.markerClusterGroup.addLayer(marker);
    },

    showEventDetails(eventId) {
        console.log(`Showing details for event: ${eventId}`);
        
        const event = this.groupedEvents.find(e => e.event_id === eventId);
        if (!event) {
            console.error('Event not found:', eventId);
            return;
        }

        // Navigate to event details page
        if (typeof Navigation !== 'undefined') {
            Navigation.navigateTo('event-details');
            
            // Initialize event details with the event data
            if (typeof EventDetails !== 'undefined') {
                setTimeout(() => {
                    EventDetails.init(event);
                }, 100);
            }
        } else {
            console.error('Navigation module not found');
        }
    },

    setupControls() {
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Reset button clicked');
                this.map.setView([20, 0], 2);
                
                // Reset filters
                const searchInput = document.getElementById('event-search');
                const startDate = document.getElementById('start-date');
                const endDate = document.getElementById('end-date');
                
                if (searchInput) searchInput.value = '';
                if (startDate) startDate.value = '';
                if (endDate) endDate.value = '';
                
                this.showAllEvents();
            });
        }

        const searchInput = document.getElementById('event-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.applyFilters();
            });
        }

        // Date filters
        const startDate = document.getElementById('start-date');
        const endDate = document.getElementById('end-date');
        
        if (startDate) {
            startDate.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        if (endDate) {
            endDate.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    },

    applyFilters() {
        const searchInput = document.getElementById('event-search');
        const startDate = document.getElementById('start-date');
        const endDate = document.getElementById('end-date');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const startDateValue = startDate ? startDate.value : '';
        const endDateValue = endDate ? endDate.value : '';
        
        let filtered = this.groupedEvents;
        
        // Location filter
        if (searchTerm) {
            filtered = filtered.filter(event => 
                event.location.toLowerCase().includes(searchTerm) ||
                event.city.toLowerCase().includes(searchTerm) ||
                event.country.toLowerCase().includes(searchTerm) ||
                event.date.includes(searchTerm)
            );
        }
        
        // Date range filter
        if (startDateValue || endDateValue) {
            filtered = filtered.filter(event => {
                const eventDate = new Date(event.date);
                let isValid = true;
                
                if (startDateValue) {
                    const start = new Date(startDateValue);
                    isValid = isValid && eventDate >= start;
                }
                
                if (endDateValue) {
                    const end = new Date(endDateValue);
                    // Add one day to include the end date
                    end.setDate(end.getDate() + 1);
                    isValid = isValid && eventDate < end;
                }
                
                return isValid;
            });
        }
        
        // Update map markers
        this.markerClusterGroup.clearLayers();
        
        filtered.forEach(event => {
            const coords = this.coordinatesData[event.location];
            if (coords) {
                this.addEventMarker(event, [coords.lat, coords.lng]);
            }
        });
        
        // Update event count
        const eventsEl = document.getElementById('total-events-map');
        if (eventsEl) {
            eventsEl.textContent = filtered.length;
        }
        
        console.log(`Filtered to ${filtered.length} events`);
        
        // Adjust map bounds to filtered events
        if (filtered.length > 0) {
            setTimeout(() => {
                const bounds = this.markerClusterGroup.getBounds();
                if (bounds.isValid()) {
                    this.map.fitBounds(bounds, { padding: [50, 50] });
                }
            }, 100);
        }
    },

    filterEvents(searchTerm) {
        // This method is kept for backward compatibility
        // But now uses applyFilters()
        this.applyFilters();
    }
};