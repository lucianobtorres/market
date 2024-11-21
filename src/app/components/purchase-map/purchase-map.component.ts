import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, debounceTime, fromEvent, Observable, of, switchMap, take } from 'rxjs';
import { MapLocate, MapLocation, MapService } from 'src/app/services/map.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { PurchaseRecord } from 'src/app/services/db/inventory.service';
import * as L from 'leaflet';
import { db } from 'src/app/db/model-db';

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

const userMarkerIcon = L.divIcon({
  className: 'user-marker-icon',
  html: `<div style="
    width: 12px;
    height: 12px;
    background: #007aff;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  "></div>`
});

const ZOON_DEFAULT = 16;
const MAX_ZOOM_SEARCH = 14;

@Component({
  selector: 'app-purchase-map',
  templateUrl: './purchase-map.component.html',
  styleUrls: ['./purchase-map.component.scss']
})
export class PurchaseMapComponent implements OnInit {
  @ViewChild('btn3', { static: false }) btnCircleDefault!: MatButton;
  @Input() purchase: PurchaseRecord;
  @Output() closeEmit = new EventEmitter<void>();
  marketList: MapLocate[] = [];
  private activeButton: MatButton | null = null;
  loadingProgress = this.mapService.loadingProgress;
  loading = this.mapService.loading;
  detailBar = false;
  circleBar = false;
  isMobile = false;
  selectedMarket: MapLocate | null = null;
  userMarker?: L.Marker<any>;
  searchCircle?: L.Circle<any>;
  private map!: L.Map;

  constructor(
    private readonly mapService: MapService,
    private dialogRef: MatDialogRef<PurchaseMapComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { purchase: PurchaseRecord },
  ) {
    this.mapService.marketMarkersMap.clear();
    this.mapService.onMarkerClick = this.selectMarket;
    this.purchase = data?.purchase;
    console.log('purchase', this.purchase.store)
    if (this.purchase?.store) {
      const mapLocate: MapLocate = JSON.parse(this.purchase.store);
      if (mapLocate) {
        this.selectedMarket = mapLocate;
        this.marketList.push(mapLocate);
      }
    }

    this.mapService.list.subscribe((item: MapLocate) => {
      if (!this.marketList.some(x => x.id === item.id)) {
        this.marketList.push(item);
      }
    });
  }

  ngOnInit(): void {
    this.detectDeviceType();

    if (!this.map) {
      this.initializeMap();
    }
  }

  removerMarket() {
    if (this.selectedMarket) {
      const markerItem = this.mapService.marketMarkersMap.get(this.selectedMarket.id);
      markerItem?.marker.closePopup();
    }

    this.selectMarket(undefined);
    this.detailBar = false;
  }

  selectMarket = (market: MapLocate | null | undefined) => {
    this.selectedMarket = market ?? null;

    if (market && market.location) {
      const location = market.location;

      const markerItem = this.mapService.marketMarkersMap.get(market.id);
      if (markerItem?.marker) {
        markerItem?.marker.openPopup();
        this.mapService.centerMap(location, this.map);
      }

      this.detailBar = true;
    }
  }

  createSearchCircle(center: L.LatLng, radius: number): void {
    if (this.searchCircle) {
      this.map.removeLayer(this.searchCircle);
    }

    this.searchCircle = L.circle(center, {
      color: 'blue',
      fillColor: '#a0d8f0',
      fillOpacity: 0.3,
      radius: radius
    }).addTo(this.map);

    this.map.fitBounds(this.searchCircle.getBounds());
  }

  async salvar() {
    this.purchase.store = this.selectedMarket ? JSON.stringify(this.selectedMarket) : undefined;
    await db.purchasesHistory.update(this.purchase.id!, this.purchase);
    this.circleBar = false;
    this.dialogRef.close();
  }

  detectDeviceType() {
    const checkScreenSize = () => {
      this.isMobile = window.innerWidth < 768;
    };

    checkScreenSize();
    fromEvent(window, 'resize').subscribe(() => checkScreenSize());
  }

  toggleDetailbar() {
    this.detailBar = !this.detailBar;
    this.map.invalidateSize(); // Força o Leaflet a recalcular o tamanho
  }

  toggleSidebar() {
    this.circleBar = !this.circleBar;
    this.mapService.removeAllMarkers();

    const updateRadius = () => {
      setTimeout(() => {
        if (this.circleBar && this.btnCircleDefault) {
          this.btnCircleDefault._elementRef.nativeElement.click();
        }
      }, 200);
    }
    setTimeout(() => {
      this.map.invalidateSize(); // Força o Leaflet a recalcular o tamanho

      if (!this.circleBar && this.searchCircle) {
        this.map.removeLayer(this.searchCircle);
        this.showUserPosition();

        if (this.activeButton) {
          this.activeButton.disabled = false;
        }
      } else {
        updateRadius();
      }
    }, 700);
  }

  private async initializeMap(): Promise<void> {
    await this.mapService.setUserCoordinates();

    const lat = this.mapService?.userCoordinates?.lat ?? 0;
    const lon = this.mapService?.userCoordinates?.lon ?? 0;

    // Inicializa o mapa na localização do usuário
    this.map = L.map('map').setView([lat, lon], ZOON_DEFAULT);
    this.mapService.marketMarkersGroup.addTo(this.map);

    L.control.scale({
      position: 'topright', // Altere para 'topleft' se necessário
      metric: true,         // Exibe a escala em metros
      imperial: false,      // Não exibe a escala imperial (pés e milhas)
    }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Adiciona um marcador na localização do usuário
    this.userMarker = L.marker([lat, lon], { icon: userMarkerIcon })
      .addTo(this.map)
      .bindPopup('Você está aqui!');

    this.createUserLocationButton();
    this.createNavigationButton();

    // this.map.on('click', (event: L.LeafletMouseEvent) => {
    //   this.handleMapClick(event);
    // });


    if (this.selectedMarket) {
      this.mapService.addMarkersToMap(this.selectedMarket);
      this.selectMarket(this.selectedMarket)
    } else {
      this.searchMarketsNearby();
    }

    this.map.on('moveend', () => this.searchMarketsNearby());
  }

  private createUserLocationButton = () => {
    const userMarker = this.userMarker;
    const closeSideBar = () => {
      this.circleBar = false;
    };
    const showUserPos = () => { this.showUserPosition() };

    const CenterControl = L.Control.extend({
      options: {
        position: 'topleft', // mesma posição dos botões de zoom
      },

      onAdd: function () {
        // Cria o container para o botão
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        // Adiciona estilo ao botão
        container.style.backgroundColor = '#fff';
        container.style.width = '30px';
        container.style.height = '30px';
        container.style.cursor = 'pointer';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.border = '2px solid rgba(0, 0, 0, 0.2)';
        container.style.backgroundClip = 'padding-box';

        // Adiciona o ícone ao botão (usando um Unicode de ícone, ou você pode adicionar uma imagem/SVG)
        container.innerHTML = '<span style="font-size: 18px;">📍</span>';

        // Adiciona evento de clique para centralizar o mapa
        container.onclick = (event) => {
          event.stopPropagation();
          closeSideBar();

          if (userMarker) {
            userMarker.openPopup();
            showUserPos();
          }
        };

        return container;
      },
    });

    // Adiciona o controle ao mapa
    this.map.addControl(new CenterControl());
  }

  private showUserPosition() {
    this.map.setView(this.userMarker!.getLatLng(), ZOON_DEFAULT, {
      animate: true,
    });
  }

  private handleMapClick(event: L.LeafletMouseEvent): void {
    const { lat, lng } = event.latlng;

    // Adiciona um marcador na posição clicada
    const newMarker = L.marker([lat, lng]).addTo(this.map);

    // Exibe o popup inicial com opções de salvar ou cancelar
    this.attachCreateMarket(newMarker, lat, lng);
  }

  createNavigationButton() {
    const navigationControl = L.Control.extend({
      options: {
        position: 'topright', // Posiciona abaixo da régua de distância
      },
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        container.style.backgroundColor = '#fff';
        container.style.width = '30px';
        container.style.height = '30px';
        container.style.cursor = 'pointer';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.border = '2px solid rgba(0, 0, 0, 0.2)';
        container.style.backgroundClip = 'padding-box';

        container.innerHTML = '<span style="font-size: 18px;">🚘</span>';

        container.onclick = () => {
          this.openNavigation();
        };

        return container;
      },
    });

    this.map.addControl(new navigationControl());
  }

  openNavigation() {
    if (!this.selectedMarket) return;
    const location = this.selectedMarket.location;
    const geoUrl = `geo:${location.lat},${location.lon}?q=${location.lat},${location.lon}`;
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lon}`;

    try {
      window.open(geoUrl, '_blank');
    } catch {
      window.open(fallbackUrl, '_blank');
    }
  };

  // Método para anexar o popup inicial
  private attachCreateMarket(marker: L.Marker, lat: number, lng: number): void {
    this.mapService.getAddress({ lat: lat, lon: lng })
      .pipe(take(1))
      .subscribe((displayAddress) => {
        if (displayAddress === 'Erro ao buscar endereço.') marker.setPopupContent('Erro ao buscar endereço.');
        else {
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
              saveButton.onclick = () => this.saveMarket(marker, lat, lng);
            }

            if (cancelButton) {
              cancelButton.onclick = () => {
                this.map.removeLayer(marker);
              };
            }
          });
        }

        setTimeout(() => {
          marker.openPopup();
        }, 0);
      });
  }

  private saveMarket(marker: L.Marker, lat: number, lng: number): void {
    marker.closePopup();

    this.mapService.getAddress({ lat: lat, lon: lng })
      .pipe(take(1))
      .subscribe((displayAddress) => {
        if (displayAddress === 'Erro ao buscar endereço.') marker.setPopupContent('Erro ao buscar endereço.');
        else {
          marker.bindPopup(`
          <div>
            <strong>Mercado salvo</strong><br/>
            Endereço: ${displayAddress}<br/>
            <button id="remove-marker">Remover</button>
          </div>
        `);

          marker.on('popupopen', () => {
            const removeButton = document.getElementById('remove-marker');

            if (removeButton) {
              removeButton.onclick = () => {
                this.map.removeLayer(marker);
              };
            }
          });
        }

        setTimeout(() => {
          marker.openPopup();
        }, 0);
      });
  }

  private updateMarketsOnMap(markets: MapLocate[]) {
    return;
    markets.forEach(async (mapLocate: MapLocate) => {
      this.persistCoordinates(mapLocate);
    });
  }

  private persistCoordinates(mapLocate: MapLocate) {
    return;
    const mapped = this.mapService.marketMarkersMap.get(mapLocate.id)
    if (mapped) { return; }

    const marker = L.marker([mapLocate.location.lat, mapLocate.location.lon]);
    marker
      .bindPopup(this.createPopup(mapLocate))
      .on('click', () => this.selectMarket(mapLocate))
    // .addTo(this.marketMarkersGroup);

    this.mapService.marketMarkersMap.set(mapLocate.id, { marker: marker, details: mapLocate });
  }


  mapToArray(map: Map<string, { marker: L.Marker, details: MapLocate }>) {
    return Array.from(map.values());
  }

  private createPopup(market: MapLocate): string {
    return `
        <b>${market.name}</b>
        <br>${market.address} ${!!market.house_number ? ', ' + market.house_number : ''}
        ${market.suburb && market.city ? '<br>' + market.suburb + ', ' + market.city : ''}
        `.trim();
  }

  private getDataMarket(market: MapLocate): Observable<((layer: L.Layer) => L.Content) | L.Content | L.Popup> {
    const popupContent = `
        <b>${market.name}</b>
        <br>${market.address} ${!!market.house_number ? ', ' + market.house_number : ''}
        ${market.suburb && market.city ? '<br>' + market.suburb + ', ' + market.city : ''}
        `.trim();

    return of(popupContent);
  }

  focusOnMarket(market: MapLocate) {
    const lat = market.location.lat;
    const lon = market.location.lon;

    // Centraliza o mapa no mercado
    this.map.setView([lat, lon]);

    // Exibe um pop-up com o nome do mercado
    this.getDataMarket(market).subscribe((dataMaker) => {
      L.marker([lat, lon])
        .addTo(this.map)
        .bindPopup(dataMaker)
        .openPopup();
    });
  }

  searchMarketsNearby() {
    console.log('searchMarketsNearby')
    if (this.podeBuscarMarkets()) {
      console.log('podeBuscarMarkets')
      this.searchByUserLocalization();
    } else {
      console.log('não pode buscar', this.circleBar, this.map.getZoom())
    }
  }

  podeBuscarMarkets(): boolean {
    if (this.circleBar) return false;

    const currentZoom = this.map.getZoom();
    if (currentZoom < MAX_ZOOM_SEARCH) {
      this.mapService.removeAllMarkers();
      return false;
    }
    return true;
  }

  searchByRadius(location: L.LatLng, radius: number) {
    this.mapService.searchByCircle(location.lat, location.lng, radius);
  }


  updateSearchRadius(radius: number, button: MatButton): void {
    if (this.activeButton) {
      this.activeButton.disabled = false;
    }

    this.activeButton = button;
    this.activeButton.disabled = true;

    const userLocation = this.userMarker!.getLatLng();
    this.createSearchCircle(userLocation, radius);
    this.searchByRadius(this.userMarker!.getLatLng(), radius);
  }

  private searchByUserLocalization() {
    const bounds = this.map.getBounds(); // Pega os limites visíveis do mapa
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

    console.log('searchByUserLocalization', bbox, this.mapService.marketMarkersMap)
    this.mapService.getMarkets(bbox);

    // this.marketList$.subscribe((itens => {
    // this.updateMarketsOnMap(itens);
    // }))
  }
}
