import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { VersionService } from 'src/app/services/version.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
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
