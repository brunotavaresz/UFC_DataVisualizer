#!/usr/bin/env python3
"""
Script de exemplo mostrando como fazer join entre event_details.csv 
e locations_coordinates.csv para adicionar lat/long aos eventos
"""

import csv
import json

def load_coordinates(coordinates_file):
    """
    Carrega o arquivo de coordenadas em um dicionário
    """
    coords_dict = {}
    
    with open(coordinates_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            location = row['location']
            coords_dict[location] = {
                'latitude': row['latitude'],
                'longitude': row['longitude'],
                'display_name': row['display_name']
            }
    
    return coords_dict

def enrich_events_with_coordinates(events_file, coordinates_file, output_file):
    """
    Adiciona latitude e longitude aos eventos
    """
    print("📍 Carregando coordenadas...")
    coords = load_coordinates(coordinates_file)
    print(f"✅ {len(coords)} localizações carregadas\n")
    
    print("🔗 Fazendo join dos dados...")
    enriched_events = []
    missing_coords = set()
    
    with open(events_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            location = row['location']
            
            # Adiciona as coordenadas se disponíveis
            if location in coords and coords[location]['latitude']:
                row['latitude'] = coords[location]['latitude']
                row['longitude'] = coords[location]['longitude']
            else:
                row['latitude'] = ''
                row['longitude'] = ''
                missing_coords.add(location)
            
            enriched_events.append(row)
    
    print(f"✅ {len(enriched_events)} eventos processados\n")
    
    # Salva o resultado
    print(f"💾 Salvando em {output_file}...")
    if enriched_events:
        fieldnames = list(enriched_events[0].keys())
        
        with open(output_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(enriched_events)
    
    print("✅ Concluído!")
    
    if missing_coords:
        print(f"\n⚠️  {len(missing_coords)} localização(ões) sem coordenadas:")
        for loc in sorted(missing_coords):
            print(f"   - {loc}")

def example_usage():
    """
    Exemplo de uso dos dados enriquecidos
    """
    EVENTS_FILE = '../data/event_details.csv'
    COORDS_FILE = '../data/locations_coordinates.csv'
    OUTPUT_FILE = '../data/event_details_with_coords.csv'
    
    try:
        enrich_events_with_coordinates(EVENTS_FILE, COORDS_FILE, OUTPUT_FILE)
        
        # Exemplo: criar um GeoJSON para visualização em mapas
        print("\n📊 Gerando exemplo GeoJSON...")
        create_geojson_example(OUTPUT_FILE, '../data/events_map.geojson')
        
    except FileNotFoundError as e:
        print(f"❌ Erro: Arquivo não encontrado - {e}")
    except Exception as e:
        print(f"❌ Erro: {e}")

def create_geojson_example(enriched_file, output_geojson):
    """
    Cria um arquivo GeoJSON com os eventos para visualização em mapas
    """
    features = []
    locations_count = {}
    
    with open(enriched_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            if row['latitude'] and row['longitude']:
                location = row['location']
                
                # Conta eventos por localização
                if location not in locations_count:
                    locations_count[location] = {
                        'count': 0,
                        'lat': float(row['latitude']),
                        'lon': float(row['longitude'])
                    }
                locations_count[location]['count'] += 1
    
    # Cria features do GeoJSON
    for location, data in locations_count.items():
        feature = {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [data['lon'], data['lat']]  # GeoJSON usa [lon, lat]
            },
            'properties': {
                'location': location,
                'events_count': data['count']
            }
        }
        features.append(feature)
    
    geojson = {
        'type': 'FeatureCollection',
        'features': features
    }
    
    with open(output_geojson, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False)
    
    print(f"✅ GeoJSON criado: {output_geojson}")
    print(f"   {len(features)} localizações únicas com coordenadas")

if __name__ == '__main__':
    example_usage()
