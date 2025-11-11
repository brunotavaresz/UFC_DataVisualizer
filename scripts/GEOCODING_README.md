# Gerador de Coordenadas para Localizações

Este diretório contém scripts para adicionar coordenadas geográficas (latitude/longitude) às localizações dos eventos do UFC.

## Scripts Disponíveis

### 1. `generate_locations_csv.py`
Extrai todas as localizações únicas do `event_details.csv` e gera um novo arquivo `locations_coordinates.csv` com as coordenadas geográficas.

**Uso:**
```bash
cd scripts
python3 generate_locations_csv.py
```

**Saída:** `data/locations_coordinates.csv`
```csv
location,latitude,longitude,display_name
"Las Vegas, Nevada, USA",36.1715,-115.1391,"Las Vegas, Clark County, Nevada, United States"
"Paris, Ile-de-France, France",48.8566,2.3522,"Paris, Île-de-France, France"
...
```

### 2. `example_join_coordinates.py`
Exemplo de como fazer join entre os arquivos para adicionar coordenadas aos eventos.

**Uso:**
```bash
cd scripts
python3 example_join_coordinates.py
```

**Saídas:**
- `data/event_details_with_coords.csv` - Eventos com lat/long
- `data/events_map.geojson` - GeoJSON para visualização em mapas

## Requisitos

```bash
pip install requests
```

## Como Funciona

1. **Extração de Localizações**: O script lê o `event_details.csv` e identifica todas as localizações únicas.

2. **Geocodificação**: Para cada localização, faz uma requisição à API Nominatim (OpenStreetMap) para obter as coordenadas.

3. **Geração do CSV**: Cria um arquivo CSV mapeando cada localização para suas coordenadas.

4. **Join dos Dados**: Você pode então usar esse CSV para adicionar lat/long aos seus eventos através de um join pela coluna `location`.

## Uso no JavaScript (Frontend)

### Exemplo 1: Carregar coordenadas

```javascript
// Carregar o CSV de coordenadas
async function loadLocationCoordinates() {
    const response = await fetch('data/locations_coordinates.csv');
    const text = await response.text();
    const rows = d3.csvParse(text);
    
    // Criar um Map para lookup rápido
    const coordsMap = new Map();
    rows.forEach(row => {
        coordsMap.set(row.location, {
            lat: parseFloat(row.latitude),
            lon: parseFloat(row.longitude)
        });
    });
    
    return coordsMap;
}
```

### Exemplo 2: Join com event_details

```javascript
async function loadEventsWithCoordinates() {
    // Carregar ambos os arquivos
    const [events, coordsMap] = await Promise.all([
        d3.csv('data/event_details.csv'),
        loadLocationCoordinates()
    ]);
    
    // Adicionar coordenadas aos eventos
    events.forEach(event => {
        const coords = coordsMap.get(event.location);
        if (coords) {
            event.latitude = coords.lat;
            event.longitude = coords.lon;
        }
    });
    
    return events;
}
```

### Exemplo 3: Criar um mapa com Leaflet

```javascript
async function createEventsMap() {
    const events = await loadEventsWithCoordinates();
    
    // Agrupar eventos por localização
    const locationGroups = d3.group(events, d => d.location);
    
    // Criar mapa
    const map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    // Adicionar marcadores
    locationGroups.forEach((locationEvents, location) => {
        const firstEvent = locationEvents[0];
        if (firstEvent.latitude && firstEvent.longitude) {
            const marker = L.marker([firstEvent.latitude, firstEvent.longitude])
                .addTo(map);
            
            marker.bindPopup(`
                <b>${location}</b><br>
                ${locationEvents.length} evento(s)
            `);
        }
    });
}
```

## Notas Importantes

- ⏱️ O script respeita um delay de 1 segundo entre requisições para não sobrecarregar a API
- 🌍 A API Nominatim é gratuita mas tem limites de uso
- ✏️ Se alguma localização não for encontrada, você pode editar o CSV manualmente
- 📊 O arquivo `locations_coordinates.csv` serve como cache - execute o script apenas uma vez

## Estrutura dos Arquivos Gerados

```
data/
├── event_details.csv              (original)
├── locations_coordinates.csv       (novo - mapeamento location → lat/long)
├── event_details_with_coords.csv   (opcional - eventos com coordenadas)
└── events_map.geojson             (opcional - GeoJSON para mapas)
```

## Troubleshooting

**Erro: "No module named 'requests'"**
```bash
pip install requests
```

**Muitas localizações não encontradas:**
- Verifique se os nomes das localizações estão corretos no CSV original
- Edite manualmente o `locations_coordinates.csv` para adicionar coordenadas
- Considere usar uma API de geocodificação mais robusta (Google Maps, Mapbox, etc.)

**API muito lenta:**
- Ajuste o `REQUEST_DELAY` no script (mínimo recomendado: 1 segundo)
- Para muitas localizações, considere usar uma API paga com mais quota
