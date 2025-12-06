import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Este componente ya no se usa, las notificaciones las maneja NotificationContainer -->
  `,
  styles: [`
    :host {
      display: none;
    }
  `]
})
export class Toast {
  constructor(private notificationService: NotificationService) {}
}