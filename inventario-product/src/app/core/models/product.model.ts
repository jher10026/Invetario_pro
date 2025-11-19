export interface Product {
  id: number;
  nombre: string;
  fecha: string;
  categoria: string;
  precio: number;
  stock: number;
}
export type ProductStatus = 'disponible' | 'bajo' | 'agotado';