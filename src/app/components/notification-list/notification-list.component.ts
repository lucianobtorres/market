import { Component, OnInit } from '@angular/core';
import { addDays } from 'date-fns';
import { NotificationModel } from 'src/app/services/notification.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  notifications: NotificationModel[] = [];

  constructor() { }
  showNotifications = true;

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  ngOnInit(): void {
    // Exemplo de inicialização, você pode substituir por dados reais.
    this.notifications = [
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
      { message: 'Você tem uma nova mensagem', read: false, timestamp: new Date() },
      { title: 'Feliz Aniversário 🎉',  message: 'Atualização disponível', read: true, timestamp: addDays(new Date(), -20) },
    ];
    this.notifications.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  markAsRead(notification: NotificationModel) {
    notification.read = true;
    // Aqui, você pode salvar o estado atualizado em um backend ou localmente
  }
}
