/* ===================================
   SERVICIO DE NOTIFICACIONES - ACTUALIZADO
   =================================== */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// ✅ Exportar interfaz Notification
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // ✅ Hacer público notifications$
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private queue: Notification[] = [];

  constructor() {
    console.log('🔔 NotificationService inicializado');
  }

  success(title: string, message: string, duration: number = 3000): void {
    this.mostrar({
      id: this.generarId(),
      type: 'success',
      title,
      message,
      timestamp: new Date(),
      duration,
      icon: '✅'
    });
  }

  error(title: string, message: string, duration: number = 4000): void {
    this.mostrar({
      id: this.generarId(),
      type: 'error',
      title,
      message,
      timestamp: new Date(),
      duration,
      icon: '❌'
    });
  }

  exito(message: string, duration: number = 3000): void {
    this.success('Éxito', message, duration);
  }

  warning(title: string, message: string, duration: number = 3500): void {
    this.mostrar({
      id: this.generarId(),
      type: 'warning',
      title,
      message,
      timestamp: new Date(),
      duration,
      icon: '⚠️'
    });
  }

  info(title: string, message: string, duration: number = 3000): void {
    this.mostrar({
      id: this.generarId(),
      type: 'info',
      title,
      message,
      timestamp: new Date(),
      duration,
      icon: 'ℹ️'
    });
  }

  private mostrar(notification: Notification): void {
    this.queue.push(notification);
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, notification]);

    if (notification.duration) {
      setTimeout(() => {
        this.eliminar(notification.id);
      }, notification.duration);
    }
  }

  eliminar(id: string): void {
    const current = this.notificationsSubject.value;
    const filtered = current.filter(n => n.id !== id);
    this.notificationsSubject.next(filtered);
    this.queue = this.queue.filter(n => n.id !== id);
  }

  private generarId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ✅ Métodos específicos que faltan
  productoCreado(nombre: string): void {
    this.success('Producto Creado', `"${nombre}" fue agregado exitosamente`);
  }

  productoActualizado(nombre: string): void {
    this.info('Producto Actualizado', `"${nombre}" fue modificado`);
  }

  productoEliminado(nombre: string): void {
    this.warning('Producto Eliminado', `"${nombre}" fue eliminado`);
  }

  categoriaCreada(nombre: string): void {
    this.success('Categoría Creada', `"${nombre}" fue agregada`);
  }

  categoriaActualizada(nombre: string): void {
    this.info('Categoría Actualizada', `"${nombre}" fue modificada`);
  }

  categoriaEliminada(nombre: string): void {
    this.warning('Categoría Eliminada', `"${nombre}" fue eliminada`);
  }

  // ✅ Métodos que faltaban
  imagenSubida(): void {
    this.success('Imagen Subida', 'La imagen se cargó correctamente');
  }

  errorImagen(mensaje: string): void {
    this.error('Error en Imagen', mensaje);
  }

  loginExitoso(nombre: string): void {
    this.success('¡Bienvenido!', `Hola ${nombre}, sesión iniciada`);
  }

  logoutExitoso(): void {
    this.info('Sesión Cerrada', 'Hasta pronto');
  }

  errorAutenticacion(mensaje: string): void {
    this.error('Error de Autenticación', mensaje);
  }
}