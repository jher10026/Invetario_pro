/* ===================================
   COMPONENTE DE TOAST
   Archivo: src/app/components/shared/toast/toast.component.ts
   =================================== */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {
  private notificationService = inject(NotificationService);
  toasts = this.notificationService.toasts;

  /**
   * Eliminar un toast
   */
  eliminarToast(id: string): void {
    this.notificationService.eliminar(id);
  }

  /**
   * Obtener icono según tipo
   */
  obtenerIcono(tipo: string): string {
    switch (tipo) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }
}