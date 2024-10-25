import { Component, OnInit } from '@angular/core';
import { NotificationModel } from 'src/app/services/notification.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  notifications: NotificationModel[] = [];

  constructor() { }

  ngOnInit(): void {
    // Exemplo de inicialização, você pode substituir por dados reais.
    this.notifications = [
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { message: 'Atualização disponível', read: true, timestamp: new Date() },
    ];
  }

  markAsRead(notification: NotificationModel) {
    notification.read = true;
    // Aqui, você pode salvar o estado atualizado em um backend ou localmente
  }
}
