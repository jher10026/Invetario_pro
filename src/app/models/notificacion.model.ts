/* ===================================
   MODELO DE NOTIFICACIÓN
   Archivo: src/app/models/notificacion.model.ts
   
   ✅ Tipos de notificación en tiempo real
   =================================== */

export type TipoNotificacion =
    | 'producto_agregado'
    | 'stock_bajo'
    | 'producto_editado'
    | 'producto_eliminado'
    | 'categoria_agregada'
    | 'categoria_editada'
    | 'categoria_eliminada'
    | 'info'
    | 'warning';

export interface Notificacion {
    id: string;
    tipo: TipoNotificacion;
    titulo: string;
    mensaje: string;
    fecha: Date;
    leida: boolean;
    icono: string;
    _firestoreId?: string;
}

/**
 * Obtener icono según tipo de notificación
 */
export function obtenerIconoNotificacion(tipo: TipoNotificacion): string {
    switch (tipo) {
        case 'producto_agregado':
            return '📦';
        case 'stock_bajo':
            return '⚠️';
        case 'producto_editado':
            return '✏️';
        case 'producto_eliminado':
            return '🗑️';
        case 'categoria_agregada':
            return '📁';
        case 'categoria_editada':
            return '📝';
        case 'categoria_eliminada':
            return '🗂️';
        case 'warning':
            return '⚠️';
        case 'info':
        default:
            return 'ℹ️';
    }
}
