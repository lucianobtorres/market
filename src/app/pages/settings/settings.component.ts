import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { VersionService } from 'src/app/services/version.service';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(
    private versionService: VersionService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.notificationService.serviceWorkerNotify({
      title: 'Bem-vindo à sua lista de compras!',
      message: 'Explore as funcionalidades da sua aplicação.',
      read: false,
      timestamp: new Date()
    });
  }
}
