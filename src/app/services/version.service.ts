import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwUpdate } from '@angular/service-worker';
import { catchError, combineLatest, map, Observable, of } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  private version: string = '';

  constructor(
    private http: HttpClient,
    private updates: SwUpdate,
    private notificationService: NotificationService,
  ) {
    this.loadVersion();
    this.checkForUpdates();
  }

  private loadVersion(): void {
    this.http.get<{ version: string }>('assets/version.json').subscribe(
      (data) => {
        this.version = data.version;
      },
      (error) => {
        console.error('Erro ao carregar a versão:', error);
      }
    );
  }

  checkForUpdates(): void {
    combineLatest([this.updates.versionUpdates, this.getVersion()])
      .subscribe(([event, currentVersion]) => {
        const notificacaoUpdate = {
          title: 'Atualização',
          message: `Nova versão disponível! Versão atual: ${currentVersion}`,
          read: false,
          timestamp: new Date()
        };

        if (event.type === 'VERSION_READY') {
          this.notificationService.serviceWorkerNotify(notificacaoUpdate);
          return;
        }

        if (currentVersion) {
          const storedVersion = localStorage.getItem('appVersion');
          if (storedVersion !== currentVersion) {
            this.notificationService.serviceWorkerNotify(notificacaoUpdate);
            localStorage.setItem('appVersion', currentVersion);
          }
        }
      });
  }

  getVersion(): Observable<string> {
    if (this.version) {
      // Se a versão já foi carregada, retorna diretamente
      return of(this.version);
    } else {
      // Caso contrário, retorna o Observable que será preenchido ao carregar
      return this.http.get<{ version: string }>('assets/version.json').pipe(
        map((data) => {
          this.version = data.version;
          return this.version;
        }),
        catchError((error) => {
          console.error('Erro ao carregar a versão:', error);
          return of('versão desconhecida');
        })
      );
    }
  }
}
