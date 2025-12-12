/* ===================================
   SERVICIO DE NOTIFICACIONES EN TIEMPO REAL
   Archivo: src/app/services/realtime-notifications.service.ts
   
   ✅ Escucha cambios en Firestore en tiempo real
   ✅ Mantiene contador de no leídas
   ✅ Genera notificaciones automáticas
   =================================== */

import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import {
    Firestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    writeBatch
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Notificacion, TipoNotificacion, obtenerIconoNotificacion } from '../models/notificacion.model';
import { Unsubscribe } from 'firebase/firestore';

@Injectable({
    providedIn: 'root'
})
export class RealtimeNotificationsService implements OnDestroy {
    private firestore = inject(Firestore);
    private auth = inject(Auth);

    // Signal con las notificaciones
    private notificacionesSignal = signal<Notificacion[]>([]);

    // Acceso público de solo lectura
    public notificaciones = this.notificacionesSignal.asReadonly();

    // Contador de notificaciones no leídas
    public noLeidas = computed(() =>
        this.notificacionesSignal().filter(n => !n.leida).length
    );

    // Unsubscribe del listener
    private unsubscribeListener: Unsubscribe | null = null;

    constructor() {
        console.log('🔔 RealtimeNotifications Service inicializado');
    }

    ngOnDestroy(): void {
        this.detenerListener();
    }

    /**
     * Iniciar listener de notificaciones en tiempo real
     */
    iniciarListener(): void {
        const user = this.auth.currentUser;
        if (!user) {
            console.log('⚠️ No hay usuario autenticado para notificaciones');
            return;
        }

        // Detener listener anterior si existe
        this.detenerListener();

        console.log('🔔 Iniciando listener de notificaciones en tiempo real');

        const notificacionesRef = collection(this.firestore, 'notificaciones');
        const q = query(
            notificacionesRef,
            orderBy('fecha', 'desc'),
            limit(50)
        );

        this.unsubscribeListener = onSnapshot(q, (snapshot) => {
            const notificaciones: Notificacion[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                notificaciones.push({
                    id: doc.id,
                    tipo: data['tipo'] as TipoNotificacion,
                    titulo: data['titulo'],
                    mensaje: data['mensaje'],
                    fecha: data['fecha']?.toDate() || new Date(),
                    leida: data['leida'] || false,
                    icono: data['icono'] || obtenerIconoNotificacion(data['tipo']),
                    _firestoreId: doc.id
                });
            });

            console.log(`🔔 Notificaciones actualizadas: ${notificaciones.length}`);
            this.notificacionesSignal.set(notificaciones);
        }, (error) => {
            console.error('❌ Error en listener de notificaciones:', error);
        });
    }

    /**
     * Detener listener de notificaciones
     */
    detenerListener(): void {
        if (this.unsubscribeListener) {
            console.log('🔔 Deteniendo listener de notificaciones');
            this.unsubscribeListener();
            this.unsubscribeListener = null;
        }
    }

    /**
     * Crear nueva notificación
     */
    async crearNotificacion(
        tipo: TipoNotificacion,
        titulo: string,
        mensaje: string
    ): Promise<void> {
        try {
            const notificacionData = {
                tipo,
                titulo,
                mensaje,
                fecha: Timestamp.now(),
                leida: false,
                icono: obtenerIconoNotificacion(tipo)
            };

            await addDoc(collection(this.firestore, 'notificaciones'), notificacionData);
            console.log('✅ Notificación creada:', titulo);
        } catch (error) {
            console.error('❌ Error al crear notificación:', error);
        }
    }

    /**
     * Marcar notificación como leída
     */
    async marcarComoLeida(notificacionId: string): Promise<void> {
        try {
            const docRef = doc(this.firestore, 'notificaciones', notificacionId);
            await updateDoc(docRef, { leida: true });
            console.log('✅ Notificación marcada como leída');
        } catch (error) {
            console.error('❌ Error al marcar notificación:', error);
        }
    }

    /**
     * Marcar todas las notificaciones como leídas
     */
    async marcarTodasComoLeidas(): Promise<void> {
        try {
            const noLeidas = this.notificacionesSignal().filter(n => !n.leida);

            if (noLeidas.length === 0) return;

            const batch = writeBatch(this.firestore);

            noLeidas.forEach((notificacion) => {
                const docRef = doc(this.firestore, 'notificaciones', notificacion.id);
                batch.update(docRef, { leida: true });
            });

            await batch.commit();
            console.log('✅ Todas las notificaciones marcadas como leídas');
        } catch (error) {
            console.error('❌ Error al marcar todas como leídas:', error);
        }
    }

    /**
     * Eliminar notificación
     */
    async eliminarNotificacion(notificacionId: string): Promise<void> {
        try {
            const docRef = doc(this.firestore, 'notificaciones', notificacionId);
            await deleteDoc(docRef);
            console.log('✅ Notificación eliminada');
        } catch (error) {
            console.error('❌ Error al eliminar notificación:', error);
        }
    }

    /**
     * Limpiar todas las notificaciones
     */
    async limpiarTodas(): Promise<void> {
        try {
            const notificaciones = this.notificacionesSignal();

            if (notificaciones.length === 0) return;

            const batch = writeBatch(this.firestore);

            notificaciones.forEach((notificacion) => {
                const docRef = doc(this.firestore, 'notificaciones', notificacion.id);
                batch.delete(docRef);
            });

            await batch.commit();
            console.log('✅ Todas las notificaciones eliminadas');
        } catch (error) {
            console.error('❌ Error al limpiar notificaciones:', error);
        }
    }

    // ============================================
    //  MÉTODOS HELPER PARA CREAR NOTIFICACIONES
    // ============================================

    /**
     * Notificar producto agregado
     */
    async notificarProductoAgregado(nombreProducto: string): Promise<void> {
        await this.crearNotificacion(
            'producto_agregado',
            'Nuevo Producto',
            `Se agregó "${nombreProducto}" al inventario`
        );
    }

    /**
     * Notificar stock bajo
     */
    async notificarStockBajo(nombreProducto: string, stock: number): Promise<void> {
        await this.crearNotificacion(
            'stock_bajo',
            '¡Stock Bajo!',
            `"${nombreProducto}" tiene solo ${stock} unidades`
        );
    }

    /**
     * Notificar producto editado
     */
    async notificarProductoEditado(nombreProducto: string): Promise<void> {
        await this.crearNotificacion(
            'producto_editado',
            'Producto Actualizado',
            `Se actualizó "${nombreProducto}"`
        );
    }

    /**
     * Notificar producto eliminado
     */
    async notificarProductoEliminado(nombreProducto: string): Promise<void> {
        await this.crearNotificacion(
            'producto_eliminado',
            'Producto Eliminado',
            `Se eliminó "${nombreProducto}" del inventario`
        );
    }
}
