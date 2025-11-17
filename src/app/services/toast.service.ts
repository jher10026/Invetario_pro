import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  /**
   * Mostrar notificación de éxito
   */
  success(mensaje: string): void {
    this.mostrar(mensaje, 'success');
  }

  /**
   * Mostrar notificación de error
   */
  error(mensaje: string): void {
    this.mostrar(mensaje, 'error');
  }

  /**
   * Mostrar notificación de información
   */
  info(mensaje: string): void {
    this.mostrar(mensaje, 'info');
  }

  /**
   * Mostrar notificación de advertencia
   */
  warning(mensaje: string): void {
    this.mostrar(mensaje, 'warning');
  }

  /**
   * Mostrar notificación
   */
  private mostrar(mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning'): void {
    const toast: Toast = {
      id: this.nextId++,
      mensaje,
      tipo,
      visible: true
    };

    const toasts = this.toastsSubject.value;
    toasts.push(toast);
    this.toastsSubject.next(toasts);

    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      this.ocultar(toast.id);
    }, 3000);
  }

  /**
   * Ocultar notificación
   */
  ocultar(id: number): void {
    const toasts = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(toasts);
  }
}