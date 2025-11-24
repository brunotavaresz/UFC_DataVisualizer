"""
Script para gerar um CSV com latitude e longitude para cada localização única encontrada no arquivo event_details.csv
"""

import csv
import time
import requests
from collections import defaultdict

# Configurações
INPUT_FILE = '../data/event_details.csv'
OUTPUT_FILE = '../data/locations_coordinates.csv'
NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
USER_AGENT = 'UFC_DataVisualizer/1.0'

# Delay entre requisições para respeitar a política de uso da API
REQUEST_DELAY = 1.0  # segundos

def get_coordinates(location):
    """
    Obtém as coordenadas (latitude, longitude) para uma localização
    usando a API Nominatim do OpenStreetMap
    """
    try:
        params = {
            'q': location,
            'format': 'json',
            'limit': 1
        }
        headers = {
            'User-Agent': USER_AGENT
        }
        
        response = requests.get(NOMINATIM_URL, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        if data and len(data) > 0:
            return {
                'lat': float(data[0]['lat']),
                'lon': float(data[0]['lon']),
                'display_name': data[0].get('display_name', location)
            }
        else:
            print(f"⚠️  Nenhum resultado encontrado para: {location}")
            return None
            
    except Exception as e:
        print(f"❌ Erro ao buscar coordenadas para '{location}': {e}")
        return None

def extract_unique_locations(input_file):
    """
    Extrai todas as localizações únicas do arquivo CSV
    """
    locations = set()
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            location = row['location'].strip()
            if location:
                locations.add(location)
    
    return sorted(locations)

def generate_locations_csv(input_file, output_file):
    """
    Gera o CSV com coordenadas para cada localização única
    """
    print("🔍 Extraindo localizações únicas...")
    locations = extract_unique_locations(input_file)
    print(f"✅ Encontradas {len(locations)} localizações únicas\n")
    
    results = []
    total = len(locations)
    
    print("🌍 Buscando coordenadas...")
    for i, location in enumerate(locations, 1):
        print(f"[{i}/{total}] Processando: {location}")
        
        coords = get_coordinates(location)
        
        if coords:
            results.append({
                'location': location,
                'latitude': coords['lat'],
                'longitude': coords['lon'],
                'display_name': coords['display_name']
            })
            print(f"  ✓ Lat: {coords['lat']}, Lon: {coords['lon']}")
        else:
            # Adiciona com coordenadas vazias para revisão manual
            results.append({
                'location': location,
                'latitude': '',
                'longitude': '',
                'display_name': ''
            })
            print(f"  ✗ Não encontrado")
        
        # Aguarda antes da próxima requisição
        if i < total:
            time.sleep(REQUEST_DELAY)
        
        print()
    
    # Salva o resultado
    print(f"💾 Salvando resultados em {output_file}...")
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['location', 'latitude', 'longitude', 'display_name']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)
    
    # Estatísticas
    successful = sum(1 for r in results if r['latitude'] != '')
    failed = total - successful
    
    print(f"\n✅ Concluído!")
    print(f"   Total de localizações: {total}")
    print(f"   Sucesso: {successful}")
    print(f"   Falhas: {failed}")
    
    if failed > 0:
        print(f"\n⚠️  {failed} localização(ões) não foi(ram) encontrada(s).")
        print("   Você pode editar o arquivo manualmente para adicionar as coordenadas.")

def main():
    try:
        generate_locations_csv(INPUT_FILE, OUTPUT_FILE)
    except FileNotFoundError:
        print(f"❌ Erro: Arquivo '{INPUT_FILE}' não encontrado!")
        print("   Certifique-se de executar o script da pasta 'scripts/'")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == '__main__':
    main()
