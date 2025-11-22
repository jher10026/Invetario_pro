/* ===================================
   SERVICIO DE NOTIFICACIONES
   Archivo: src/app/services/notification.service.ts
   
   ¿Qué hace? Gestiona los mensajes toast
   =================================== */

import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  mensaje: string;
  tipo: 'success' | 'error' | 'info';
  duracion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSignal = signal<Toast[]>([]);
  public toasts = this.toastsSignal.asReadonly();

  constructor() {}

  /**
   * Mostrar notificación de éxito
   */
  exito(mensaje: string, duracion: number = 3000): void {
    this.mostrar(mensaje, 'success', duracion);
  }

  /**
   * Mostrar notificación de error
   */
  error(mensaje: string, duracion: number = 3000): void {
    this.mostrar(mensaje, 'error', duracion);
  }

  /**
   * Mostrar notificación de información
   */
  info(mensaje: string, duracion: number = 3000): void {
    this.mostrar(mensaje, 'info', duracion);
  }

  /**
   * Mostrar notificación genérica
   */
  private mostrar(mensaje: string, tipo: 'success' | 'error' | 'info', duracion: number): void {
    const id = Math.random().toString(36).substring(7);

    const toast: Toast = {
      id,
      mensaje,
      tipo,
      duracion
    };

    const toastActual = this.toastsSignal();
    this.toastsSignal.set([...toastActual, toast]);

    // Eliminar después de la duración
    setTimeout(() => {
      this.eliminar(id);
    }, duracion);
  }

  /**
   * Eliminar una notificación
   */
  eliminar(id: string): void {
    const toasts = this.toastsSignal().filter(t => t.id !== id);
    this.toastsSignal.set(toasts);
  }
}