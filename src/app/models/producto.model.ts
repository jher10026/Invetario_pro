export interface Producto {
  id: number;
  nombre: string;
  fecha: string;  // Formato: YYYY-MM-DD
  categoria: string;
  precio: number;
  stock: number;
}

export type EstadoStock = 'disponible' | 'bajo' | 'agotado';