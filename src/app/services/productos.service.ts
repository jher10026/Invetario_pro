/* ===================================
   SERVICIO DE PRODUCTOS
   Archivo: src/app/services/productos.service.ts
   
   ¿Qué hace? Gestiona todos los productos
   =================================== */

import { Injectable, signal, computed } from '@angular/core';
import { Producto, EstadoStock } from '../models/producto.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  // Signal con los productos (Angular 20 signals)
  private productosSignal = signal<Producto[]>([]);
  
  // Computed para acceso de solo lectura
  productos = this.productosSignal.asReadonly();

  constructor(private storageService: StorageService) {
    this.cargarProductos();
  }

  /**
   * Cargar productos del storage
   */
  private cargarProductos(): void {
    const productosGuardados = this.storageService.obtenerProductos<Producto>([]);
    this.productosSignal.set(productosGuardados);
  }

  /**
   * Obtener todos los productos
   */
  obtenerTodos(): Producto[] {
    return this.productosSignal();
  }

  /**
   * Obtener un producto por ID
   */
  obtenerPorId(id: number): Producto | undefined {
    return this.productosSignal().find(p => p.id === id);
  }

  /**
   * Agregar nuevo producto
   */
  agregar(producto: Omit<Producto, 'id'>): Producto {
    const nuevoProducto: Producto = {
      id: Date.now(),
      ...producto
    };

    const actuales = this.productosSignal();
    this.productosSignal.set([...actuales, nuevoProducto]);
    this.guardarEnStorage();

    return nuevoProducto;
  }

  /**
   * Actualizar producto existente
   */
  actualizar(id: number, producto: Partial<Producto>): boolean {
    const actuales = this.productosSignal();
    const index = actuales.findIndex(p => p.id === id);

    if (index === -1) {
      return false;
    }

    actuales[index] = { ...actuales[index], ...producto };
    this.productosSignal.set([...actuales]);
    this.guardarEnStorage();

    return true;
  }

  /**
   * Eliminar producto
   */
  eliminar(id: number): boolean {
    const actuales = this.productosSignal();
    const index = actuales.findIndex(p => p.id === id);

    if (index === -1) {
      return false;
    }

    actuales.splice(index, 1);
    this.productosSignal.set([...actuales]);
    this.guardarEnStorage();

    return true;
  }

  /**
   * Obtener estado del stock
   */
  obtenerEstado(stock: number): EstadoStock {
    if (stock === 0) return 'agotado';
    if (stock < 10) return 'bajo';
    return 'disponible';
  }

  /**
   * Obtener productos con stock bajo
   */
  obtenerStockBajo(): Producto[] {
    return this.productosSignal().filter(p => p.stock > 0 && p.stock < 10);
  }

  /**
   * Obtener valor total del inventario
   */
  obtenerValorTotal(): number {
    return this.productosSignal().reduce((sum, p) => sum + (p.precio * p.stock), 0);
  }

  /**
   * Filtrar productos por categoría
   */
  filtrarPorCategoria(categoria: string): Producto[] {
    return this.productosSignal().filter(p => p.categoria === categoria);
  }

  /**
   * Buscar productos por nombre
   */
  buscar(termino: string): Producto[] {
    const termino_lower = termino.toLowerCase();
    return this.productosSignal().filter(p =>
      p.nombre.toLowerCase().includes(termino_lower)
    );
  }

  /**
   * Ordenar productos
   */
  ordenar(tipo: 'reciente' | 'antiguo' | 'nombre' | 'precio'): Producto[] {
    const copia = [...this.productosSignal()];

    switch (tipo) {
      case 'reciente':
        return copia.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      case 'antiguo':
        return copia.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      case 'nombre':
        return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'precio':
        return copia.sort((a, b) => b.precio - a.precio);
      default:
        return copia;
    }
  }

  /**
   * Guardar en storage
   */
  private guardarEnStorage(): void {
    this.storageService.guardarProductos(this.productosSignal());
  }
}