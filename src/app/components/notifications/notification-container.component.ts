/* ===================================
   COMPONENTE DE CONTENEDOR DE NOTIFICACIONES
   Archivo: src/app/components/notifications/notification-container.component.ts
   
   ✅ Muestra notificaciones en tiempo real
   ✅ Animaciones suaves
   =================================== */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { notificationAnimation } from '../../config/animations';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  animations: [notificationAnimation],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications"
        [@notificationAnimation]
        class="notification"
        [class.success]="notification.type === 'success'"
        [class.error]="notification.type === 'error'"
        [class.warning]="notification.type === 'warning'"
        [class.info]="notification.type === 'info'"
        (click)="eliminar(notification.id)"
      >
        <div class="notification-icon">
          {{ notification.icon }}
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button class="notification-close" (click)="eliminar(notification.id)">
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      pointer-events: none;
    }

    .notification {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .notification:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .notification.success {
      border-left-color: #10b981;
      background: linear-gradient(to right, #f0fdf4, white);
    }

    .notification.error {
      border-left-color: #ef4444;
      background: linear-gradient(to right, #fef2f2, white);
    }

    .notification.warning {
      border-left-color: #f59e0b;
      background: linear-gradient(to right, #fffbeb, white);
    }

    .notification.info {
      border-left-color: #3b82f6;
      background: linear-gradient(to right, #eff6ff, white);
    }

    .notification-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      color: #1f2937;
      margin-bottom: 2px;
    }

    .notification-message {
      font-size: 13px;
      color: #6b7280;
    }

    .notification-close {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: #9ca3af;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .notification-close:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #4b5563;
    }

    @media (max-width: 640px) {
      .notification-container {
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `]
})
export class NotificationContainerComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  eliminar(id: string): void {
    this.notificationService.eliminar(id);
  }
}