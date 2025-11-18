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
            // Assumindo que DataLoader é acessível ou d3 é carregado.
            // Para manter a compatibilidade com o código original:
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
            // Supondo que DataLoader é definido ou carregando de CSV
            if (typeof DataLoader !== 'undefined' && DataLoader.events && DataLoader.events.length > 0) {
                this.eventsData = DataLoader.events;
                console.log('Using pre-loaded events data');
            } else {
                console.log('Loading events from CSV...');
                // Assumindo d3 é carregado
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

            // NOVO: Adicionar listener para o evento 'clusterclick' para abrir a lista de eventos
            this.markerClusterGroup.on('clusterclick', (a) => {
                // Se o cluster estiver no zoom máximo e for "spiderfied"
                if (a.propagated) {
                    // Prevenir o zoom padrão se quisermos abrir o modal imediatamente
                    // a.layer.zoomToBounds({padding: [20, 20]}); // Comportamento padrão de zoom
                    
                    // Em vez de esperar pelo 'spiderfied', podemos obter a lista de marcadores
                    // do cluster e usá-los para identificar a localização.
                    const childMarkers = a.layer.getAllChildMarkers();
                    if (childMarkers.length > 0) {
                        // Assumindo que todos os markers no cluster do zoom máximo representam o mesmo local
                        // Se houver mais do que um, usar o primeiro para obter o nome do local
                        const locationName = childMarkers[0].eventData.location; 
                        this.openEventsListForLocation(locationName, childMarkers);
                    }
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
                // Ajuste para um zoom menos apertado na vista inicial
                this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4 }); 
            } else {
                this.map.setView([20, 0], 2);
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
        
        // NOVO: Anexar os dados do evento ao marcador
        marker.eventData = event; 

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
            <button 
                onclick="EventsMap.openEventsListForLocation('${event.location}')" 
                style="margin-top: 0.25rem; padding: 0.5rem 1rem; background: #1c9cd9; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;"
            >
                Show All Events at ${event.location}
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

    // ==========================================================
    // NOVAS FUNÇÕES PARA ABRIR E FILTRAR A LISTA DE EVENTOS
    // ==========================================================
    
    openEventsListForLocation(locationName) {
        console.log(`Opening event list for location: ${locationName}`);
        
        // 1. Filtrar todos os eventos agrupados para este local
        const eventsAtLocation = this.groupedEvents.filter(e => e.location === locationName);
        
        if (eventsAtLocation.length === 0) {
            alert(`No events found for location: ${locationName}`);
            return;
        }

        const modal = document.getElementById('event-list-modal');
        const content = document.getElementById('event-list-content');
        
        if (!modal || !content) {
            console.error('Modal elements not found.');
            return;
        }
        
        // 2. Criar a interface da lista
        content.innerHTML = this.createLocationEventsList(eventsAtLocation, locationName);
        
        // 3. Mostrar o modal
        modal.style.display = 'block'; 
        
        // Fechar modal ao clicar fora
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        // Fechar modal ao pressionar ESC
        document.onkeydown = (e) => {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
            }
        };
        
        // 4. Configurar a lógica de filtro de data
        this.setupLocationListDateFilter(eventsAtLocation);
    },

    createLocationEventsList(events, locationName) {
        // Gera o HTML do modal, incluindo controlos e o conteúdo inicial
        const closeButton = `<span class="modal-close" onclick="document.getElementById('event-list-modal').style.display='none'">&times;</span>`;
        
        let html = `${closeButton}<h2>Events at ${locationName} (${events.length} total)</h2>`;
        
        // Controlo de Filtro de Data
        html += '<div id="location-list-controls">';
        html += '<label for="list-start-date">From:</label><input type="date" id="list-start-date">';
        html += '<label for="list-end-date">To:</label><input type="date" id="list-end-date">';
        html += '</div>';
        
        // NOVO: Container para a lista com cabeçalhos de ordenação
        html += '<div id="filtered-location-events">';
        
        // NOVO: Cabeçalhos de Ordenação
        html += '<div id="event-list-header" style="display: flex; justify-content: space-between; padding: 0.5rem 1.5rem 0.5rem 0.5rem; background: #2d2d2d; border-radius: 6px 6px 0 0; margin-top: 1rem;">';
        html += '<div data-sort="date" data-direction="desc" class="sortable-header active-sort" style="cursor: pointer; color: #d91c1c; font-weight: bold; flex: 3;">Date (▼)</div>';
        html += '<div data-sort="fights" data-direction="asc" class="sortable-header" style="cursor: pointer; color: #e0e0e0; font-weight: 500; flex: 1; text-align: right;">Fights (Asc)</div>';
        html += '</div>';

        html += '<div id="event-list-body-content">';
        html += this.renderEventsList(events, 'date', 'desc'); // Renderização inicial
        html += '</div>';
        
        html += '</div>'; // Fecha #filtered-location-events
        
        // Adicionar o listener para ordenação após a injeção do HTML
        setTimeout(() => {
            this.setupLocationListSorting(events);
        }, 0);
        
        return html;
    },

    setupLocationListSorting(allEvents) {
        const headers = document.querySelectorAll('#event-list-header .sortable-header');
        const listContainer = document.getElementById('event-list-body-content');
        
        headers.forEach(header => {
            header.addEventListener('click', (e) => {
                const sortBy = header.getAttribute('data-sort');
                let direction = header.getAttribute('data-direction');

                // Toggle direction
                direction = (direction === 'asc' ? 'desc' : 'asc');
                header.setAttribute('data-direction', direction);

                // Update active header and UI
                headers.forEach(h => {
                    h.classList.remove('active-sort');
                    h.style.color = '#e0e0e0';
                    h.style.fontWeight = '500';
                    let text = h.textContent.replace(/\s*\(.*\)/, '');
                    h.textContent = `${text} (Asc)`; // Resetting indicator
                });

                header.classList.add('active-sort');
                header.style.color = '#d91c1c';
                header.style.fontWeight = 'bold';
                
                let indicator = direction === 'desc' ? '▼' : '▲';
                header.textContent = `${header.textContent.replace(/\s*\(.*\)/, '')} (${indicator})`;


                // Obter filtros de data atuais (se existirem)
                const startDateInput = document.getElementById('list-start-date');
                const endDateInput = document.getElementById('list-end-date');
                
                // Obter a lista de eventos filtrada (a lógica de filtragem já deve ter sido aplicada)
                // É mais eficiente aplicar o filtro de data aqui novamente para garantir que a ordenação
                // é feita no subconjunto correto.
                
                const start = startDateInput.value ? new Date(startDateInput.value) : null;
                const end = endDateInput.value ? new Date(endDateInput.value) : null;
                
                let filtered = allEvents;
                
                if (start || end) {
                    filtered = allEvents.filter(event => {
                        const eventDate = new Date(event.date);
                        let isValid = true;
                        if (start) isValid = isValid && eventDate >= start;
                        if (end) {
                            const endPlusOne = new Date(end);
                            endPlusOne.setDate(endPlusOne.getDate() + 1);
                            isValid = isValid && eventDate < endPlusOne;
                        }
                        return isValid;
                    });
                }


                // Re-renderizar com a nova ordenação
                listContainer.innerHTML = this.renderEventsList(filtered, sortBy, direction);
            });
        });
    },

    setupLocationListDateFilter(allEvents) {
        const startDateInput = document.getElementById('list-start-date');
        const endDateInput = document.getElementById('list-end-date');
        const listContainer = document.getElementById('event-list-body-content'); // Mudar para o novo container
        
        // Obter estado de ordenação atual
        const getSortState = () => {
            const activeHeader = document.querySelector('#event-list-header .active-sort');
            return activeHeader ? {
                sortBy: activeHeader.getAttribute('data-sort'),
                direction: activeHeader.getAttribute('data-direction')
            } : { sortBy: 'date', direction: 'desc' };
        };

        const applyListFilter = () => {
            const { sortBy, direction } = getSortState(); // Obter a ordenação atual
            
            const start = startDateInput.value ? new Date(startDateInput.value) : null;
            const end = endDateInput.value ? new Date(endDateInput.value) : null;
            
            let filtered = allEvents;
            
            if (start || end) {
                filtered = allEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    let isValid = true;
                    
                    if (start) {
                        isValid = isValid && eventDate >= start;
                    }
                    
                    if (end) {
                        const endPlusOne = new Date(end);
                        endPlusOne.setDate(endPlusOne.getDate() + 1);
                        isValid = isValid && eventDate < endPlusOne;
                    }
                    
                    return isValid;
                });
            }
            
            listContainer.innerHTML = this.renderEventsList(filtered, sortBy, direction); // Aplicar ordenação
        };
        
        startDateInput.addEventListener('change', applyListFilter);
        endDateInput.addEventListener('change', applyListFilter);
    },

    // 2. Novo EventsMap.renderEventsList (Aplica a Ordenação)
    renderEventsList(events, sortBy = 'date', direction = 'desc') {
        // Função auxiliar para renderizar a lista de eventos
        
        events.sort((a, b) => {
            let valA, valB;
            
            if (sortBy === 'date') {
                valA = new Date(a.date);
                valB = new Date(b.date);
            } else if (sortBy === 'fights') {
                valA = a.fightCount;
                valB = b.fightCount;
            }
            
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        }); 
        
        if (events.length === 0) {
            return '<p>No events found in this date range.</p>';
        }
        
        let listHtml = '<ul>';
        events.forEach(event => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
                year: 'numeric', month: 'short', day: 'numeric' 
            });
            
            listHtml += `
                <li style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="flex: 3;">
                        <strong>${formattedDate}</strong>
                    </span>
                    <span style="flex: 1; text-align: right; margin-right: 1.5rem; font-weight: bold;">
                        ${event.fightCount}
                    </span>
                    <button onclick="EventsMap.showEventDetails('${event.event_id}'); document.getElementById('event-list-modal').style.display='none';">
                        View Details
                    </button>
                </li>
            `;
        });
        listHtml += '</ul>';
        return listHtml;
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
        // ... (o seu código existente para setupControls) ...
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
        // ... (o seu código existente para applyFilters) ...
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