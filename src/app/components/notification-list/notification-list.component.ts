import { Component, OnInit } from '@angular/core';
import { liveQuery } from 'dexie';
import { NotificationModel } from 'src/app/models/interfaces';
import { NotificationService } from 'src/app/services/notification.service';
import { db } from 'src/app/db/model-db';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  notifications: NotificationModel[] = [];

  constructor(private readonly dbService: NotificationService,) { }
  showNotifications = false;

  private itens$ = liveQuery(() => db.notifications.toArray());
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  ngOnInit(): void {
    this.itens$.subscribe((itens) => {
      console.log(itens)
      this.notifications = itens;
      this.notifications.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime())
    });
  }

  markAsRead(notification: NotificationModel) {
    notification.read = true;
    db.notifications.update(notification.id!, notification);
  }
}
