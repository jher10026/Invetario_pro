export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  estado: 'activo' | 'inactivo';
  fechaCreacion: Date;
  ultimaActualizacion: Date;
}