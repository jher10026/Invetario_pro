/* ===================================
   COMPONENTE PANEL DE NOTIFICACIONES
   Archivo: src/app/components/shared/notification-panel/notification-panel.ts
   
   ✅ Panel desplegable de notificaciones en tiempo real
   =================================== */

import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtimeNotificationsService } from '../../../services/realtime-notifications.service';
import { Notificacion } from '../../../models/notificacion.model';

@Component({
    selector: 'app-notification-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-panel.html',
    styleUrl: './notification-panel.css'
})
export class NotificationPanel {
    private realtimeNotifications = inject(RealtimeNotificationsService);

    @Input() visible = false;
    @Output() cerrar = new EventEmitter<void>();

    notificaciones = this.realtimeNotifications.notificaciones;

    /**
     * Cerrar el panel
     */
    cerrarPanel(): void {
        this.cerrar.emit();
    }

    /**
     * Marcar notificación como leída
     */
    async marcarLeida(notificacion: Notificacion): Promise<void> {
        if (!notificacion.leida) {
            await this.realtimeNotifications.marcarComoLeida(notificacion.id);
        }
    }

    /**
     * Marcar todas como leídas
     */
    async marcarTodasLeidas(): Promise<void> {
        await this.realtimeNotifications.marcarTodasComoLeidas();
    }

    /**
     * Eliminar notificación
     */
    async eliminar(notificacion: Notificacion, event: Event): Promise<void> {
        event.stopPropagation();
        await this.realtimeNotifications.eliminarNotificacion(notificacion.id);
    }

    /**
     * Limpiar todas las notificaciones
     */
    async limpiarTodas(): Promise<void> {
        await this.realtimeNotifications.limpiarTodas();
    }

    /**
     * Formatear fecha relativa
     */
    formatearFecha(fecha: Date): string {
        const ahora = new Date();
        const diff = ahora.getTime() - fecha.getTime();
        const minutos = Math.floor(diff / 60000);
        const horas = Math.floor(diff / 3600000);
        const dias = Math.floor(diff / 86400000);

        if (minutos < 1) return 'Ahora mismo';
        if (minutos < 60) return `Hace ${minutos} min`;
        if (horas < 24) return `Hace ${horas}h`;
        if (dias < 7) return `Hace ${dias} días`;

        return fecha.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    }

    /**
     * Obtener clase CSS según tipo de notificación
     */
    obtenerClaseTipo(tipo: string): string {
        switch (tipo) {
            case 'producto_agregado': return 'tipo-agregado';
            case 'stock_bajo': return 'tipo-warning';
            case 'producto_editado': return 'tipo-editado';
            case 'producto_eliminado': return 'tipo-eliminado';
            default: return 'tipo-info';
        }
    }
}
