import { Component, OnInit } from '@angular/core';
import { read } from 'fs';
import { db } from 'src/app/db/model-db';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    db.notifications.where('id').equals(1).and(x => !x.read).toArray()
      .then(itens => {
        if (itens.length) {
          const wellcomeNotify = itens[0];
          this.notificationService.serviceWorkerNotify(wellcomeNotify);
          wellcomeNotify.read = true;
          db.notifications.update(wellcomeNotify.id!, wellcomeNotify)
        }
      })
      .catch(error => {
        console.error('Erro ao remover a lista ou os itens:', error);
      });
  }
}
