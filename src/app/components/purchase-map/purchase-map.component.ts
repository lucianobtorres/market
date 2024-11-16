import { AfterContentInit, AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from 'src/app/services/map.service';

interface MapLocate {
  id: string,
  name: string,
  address: string,
  city: string,
  postcode: string,
  location: {
    lat: number,
    lon: number
  }
}

const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

@Component({
  selector: 'app-purchase-map',
  templateUrl: './purchase-map.component.html',
  styleUrls: ['./purchase-map.component.scss']
})
export class PurchaseMapComponent implements OnInit {
  private map!: L.Map;
  markets2 = new Map<string, MapLocate>();
  private existingMarkets: Set<string> = new Set(); // Para armazenar as coordenadas já mapeadas como string
  searchQuery: any;
  private marketMarkersGroup2: L.LayerGroup = L.layerGroup(); // Cria o grupo de marcadores

  marketMarkersGroup: L.LayerGroup = L.layerGroup();
  marketMarkersMap = new Map<string, { marker: L.Marker, details: MapLocate }>();


  constructor(
    private readonly mapService: MapService
  ) { }

  ngOnInit(): void {
    if (!this.map) {
      this.initializeMap();
    }
  }

  private initializeMap(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Inicializa o mapa na localização do usuário
          this.map = L.map('map').setView([userLat, userLng], 17);
          this.marketMarkersGroup.addTo(this.map);

          this.map.on('moveend', () => this.searchMarkets(this.searchQuery));

          this.map.on('click', (event: L.LeafletMouseEvent) => {
            this.handleMapClick(event);
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          }).addTo(this.map);

          // Adiciona um marcador na localização do usuário
          L.marker([userLat, userLng]).addTo(this.map)
            .bindPopup('Você está aqui!')
            .openPopup();
          this.getMarketsCallback();
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          this.fallbackMap(); // Chama um fallback em caso de erro
        }
      );
    } else {
      console.error('Geolocalização não é suportada pelo navegador.');
      this.fallbackMap();
    }
  }

  private handleMapClick(event: L.LeafletMouseEvent): void {
    const { lat, lng } = event.latlng;

    // Adiciona um marcador na posição clicada
    const newMarker = L.marker([lat, lng]).addTo(this.map);

    // Exibe o popup inicial com opções de salvar ou cancelar
    this.attachInitialPopup(newMarker, lat, lng);
  }

  // Método para anexar o popup inicial
  private attachInitialPopup(marker: L.Marker, lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const address = data.address;
        const displayAddress = address
          ? `${address.road || ''}, ${address.suburb || ''}, ${address.city || ''}, ${address.state || ''}, ${address.country || ''}`
          : 'Endereço não encontrado';

        marker.bindPopup(`
        <div id="popup-content">
          <strong>Novo mercado</strong><br/>
          Endereço: ${displayAddress}<br/>
          <button id="save-marker">Salvar</button>
          <button id="cancel-marker">Cancelar</button>
        </div>
        `);

        // Evento disparado quando o popup é aberto
        marker.on('popupopen', () => {
          // Vincula eventos aos botões somente após o popup estar completamente aberto
          const saveButton = document.getElementById('save-marker');
          const cancelButton = document.getElementById('cancel-marker');

          if (saveButton) {
            saveButton.onclick = () => this.saveMarker(marker, lat, lng);
          }

          if (cancelButton) {
            cancelButton.onclick = () => {
              this.map.removeLayer(marker); // Remove o marcador
            };
          }
        });

        marker.openPopup(); // Abre o popup imediatamente após criar
      })
      .catch(error => {
        console.error('Erro ao buscar endereço:', error);
        marker.setPopupContent('Erro ao buscar endereço.').openPopup();
      });
  }

  // Método para salvar o marcador
  private saveMarker(marker: L.Marker, lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const address = data.address;
        const displayAddress = address
          ? `${address.road || ''}, ${address.suburb || ''}, ${address.city || ''}, ${address.state || ''}, ${address.country || ''}`
          : 'Endereço não encontrado';

        // Atualiza o popup do marcador com o endereço e a opção de remover
        marker.bindPopup(`
          <div>
            <strong>Mercado salvo</strong><br/>
            Endereço: ${displayAddress}<br/>
            <button id="remove-marker">Remover</button>
          </div>
        `);

        // Fecha o popup e força a reabertura para associar o evento corretamente
        marker.closePopup();
        setTimeout(() => {
          marker.openPopup();

          // Listener para o botão "Remover" no popup reaberto
          const removeButton = document.getElementById('remove-marker');
          if (removeButton) {
            removeButton.onclick = () => {
              this.map.removeLayer(marker); // Remove o marcador do mapa
            };
          }
        }, 0); // Aguarda o DOM ser atualizado antes de reabrir o popup
      })
      .catch(error => {
        console.error('Erro ao buscar endereço:', error);
        marker.setPopupContent('Erro ao buscar endereço.').openPopup();
      });
  }


  private getMarketsCallback() {
    // this.markets.clear();
    this.marketMarkersMap.clear();
    const bounds = this.map.getBounds();
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

    if (this.searchQuery) this.searchMarkets(this.searchQuery)
    else {
      this.mapService.getMarkets(bbox).subscribe((markets: any[]) => {
        console.log('Mercados recebidos:', markets); // Inspecione os dados recebidos

        if (!markets || !Array.isArray(markets)) {
          console.warn('Nenhum mercado válido recebido.');
          return;
        }

        this.updateMarketsOnMap(markets);
      });
    }
  }

  private updateMarketsOnMap(markets: any[], resetExisting: boolean = false) {
    if (resetExisting) {
      this.removeAllMarkers();
    }

    markets.forEach((market) => {
      let lat: number | undefined;
      let lon: number | undefined;

      if (market.type === 'node') {
        // Objeto do tipo node
        lat = market.lat;
        lon = market.lon;
      } else if (market.type === 'way' || market.type === 'relation') {
        // Objeto do tipo way ou relation
        if (market.center) {
          lat = market.center.lat;
          lon = market.center.lon;
        }
      }

      if (lat !== undefined && lon !== undefined) {
        const marketItem = {
          id: market.id,
          name: market.tags.name || 'Mercado sem nome',
          address: `${market.tags['addr:street'] || ''},
                    ${market.tags['addr:housenumber'] || ''}`,
          city: market.tags['addr:city'] || '',
          postcode: market.tags['addr:postcode'] || '',
          location: { lat, lon },
        };

        const marketKey = `${lat},${lon}`;

        if (resetExisting) {
          this.existingMarkets = new Set();
        }

        console.log(this.existingMarkets)

        if (!this.existingMarkets.has(marketKey)) {
          console.log('nao tem', marketKey)
          // Adicione a coordenada ao conjunto para evitar duplicatas
          this.existingMarkets.add(marketKey);

          const marker = L.marker([lat, lon], {
            // icon: this.marketIcon,
          }).bindPopup(this.getDataMarket(marketItem));

          marker.addTo(this.marketMarkersGroup);
        }

        this.marketMarkersGroup.getLayers().find(layer => {
          if (layer instanceof L.Marker && layer.getLatLng().equals([lat ?? 0, lon ?? 0])) {
            this.marketMarkersMap.set(market.id, { marker: layer, details: marketItem });
          }
        });
      }
    });
  }
  highlightMarker(marketId: string): void {
    const marketData = this.marketMarkersMap.get(marketId); // Recupera o marcador pelo ID
    if (marketData) {
      marketData.marker.openPopup(); // Abre o popup do marcador
    }
  }

  unhighlightMarker(marketId: string): void {
    const marketData = this.marketMarkersMap.get(marketId); // Recupera o marcador pelo ID
    if (marketData) {
      marketData.marker.closePopup(); // Fecha o popup do marcador
    }
  }
  private removeAllMarkers(): void {
    this.marketMarkersGroup.clearLayers(); // Remove todos os marcadores
  }
  mapToArray(map: Map<string, { marker: L.Marker, details: MapLocate }>) {
    return Array.from(map.values());
  }
  private getDataMarket(market: any): ((layer: L.Layer) => L.Content) | L.Content | L.Popup {
    const addressParts = [
      (market.address || '').trim(),
      (market.housenumber || '').trim(),
      (market.city || '').trim(),
      (market.postcode || '').trim()
    ];

    // Filtra as partes vazias e junta as restantes com vírgulas
    let address = addressParts.filter(part => part !== '').join(', ').trim();

    if (address.trim().length === 1) address = '';
    // Conteúdo do popup
    const popupContent = `
        <b>${market.name || 'Mercado sem nome'}</b>
        ${address.trim().length !== 1 ? '<br>' + address.trim() : ''}
        `.trim();

    return popupContent;
  }


  // Fallback para iniciar o mapa em uma localização padrão
  private fallbackMap(): void {
    this.map = L.map('map').setView([-15.7942, -47.8822], 13); // Brasília como localização padrão

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  focusOnMarket(market: MapLocate) {
    const lat = market.location.lat;
    const lon = market.location.lon;

    // Centraliza o mapa no mercado
    this.map.setView([lat, lon]);

    // Exibe um pop-up com o nome do mercado
    L.marker([lat, lon])
      .addTo(this.map)
      .bindPopup(this.getDataMarket(market))
      .openPopup();
  }

  searchMarkets(query: string) {
    // this.markets.clear();

    this.marketMarkersMap.clear();

    const bounds = this.map.getBounds(); // Pega os limites visíveis do mapa
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

    this.mapService.getMarkets(bbox).subscribe((markets: any[]) => {
      console.log('Mercados recebidos após a busca:', markets);

      if (!markets || !Array.isArray(markets)) {
        console.warn('Nenhum mercado válido recebido.');
        return;
      }

      if (!this.searchQuery) {
        this.updateMarketsOnMap(markets);
        // console.log('Mercados na barra lateral:', this.markets);
      } else {
        // Filtra os mercados pelo nome e pela área visível
        const filteredMarkets = markets.filter((market) => {
          // Verifica se o nome do mercado contém o texto da pesquisa
          const matchesName = market.tags.name && market.tags.name.toLowerCase().includes(query.toLowerCase());

          // Verifica se o mercado está dentro da área visível (bounding box)
          const lat = market.lat || market.center?.lat;
          const lon = market.lon || market.center?.lon;
          const isWithinBounds = lat && lon && bounds.contains([lat, lon]);

          return matchesName && isWithinBounds;
        });

        this.updateMarketsOnMap(filteredMarkets, true);
        // console.log('Mercados na barra lateral:', this.markets);
      }
    });
  }

  private updateMarketsOnMap2(filteredMarkets: any[]) {/**
    // Limpa os marcadores existentes
    this.marketMarkers.forEach(marker => marker.remove());
    this.marketMarkers = [];

    filteredMarkets.forEach((market) => {
      let lat: number | undefined;
      let lon: number | undefined;

      if (market.type === 'node') {
        lat = market.lat;
        lon = market.lon;
      } else if (market.type === 'way' || market.type === 'relation') {
        if (market.center) {
          lat = market.center.lat;
          lon = market.center.lon;
        }
      }

      if (lat !== undefined && lon !== undefined) {
        const marketItem = {
          name: market.tags.name || 'Mercado sem nome',
          address: `${market.tags['addr:street'] || ''}, ${market.tags['addr:housenumber'] || ''}`,
          city: market.tags['addr:city'] || '',
          postcode: market.tags['addr:postcode'] || '',
          location: { lat, lon },
        };

        // Crie uma chave única para cada mercado com base nas coordenadas
        const marketKey = `${lat},${lon}`;

        // Adicione o marcador ao mapa se não houver duplicata
        if (!this.existingMarkets.has(marketKey)) {
          this.existingMarkets.add(marketKey);

          const marker = L.marker([lat, lon], {
            // icon: this.marketIcon,
          }).addTo(this.map)
            .bindPopup(this.getDataMarket(marketItem));

          this.marketMarkers.push(marker);
        }
      }
    });/**/
  }



}
