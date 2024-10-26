import { Injectable } from '@angular/core';
import { NotificationModel } from '../models/interfaces';

const pathIcon = 'assets/icons/icon-72x72.png';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  // Notifica mesmo se o usuário tiver com a app fechada
  async serviceWorkerNotify(model: NotificationModel) {
    if (model.read) return;

    if ('serviceWorker' in navigator && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(
        `${model.title}`, {
        body: model.message,
        icon: pathIcon,
      });
    }
  }

  // Notifica somente enquanto a app estiver aberta
  angularNotify(model: NotificationModel) {
    if (model.read) return;

    if (Notification.permission === 'granted') {
      new Notification(
        `${model.title}`, {
        body: model.message,
        icon: pathIcon,
      });
    }
  }
}
