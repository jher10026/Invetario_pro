/* ===================================
   SERVICIO DE ALMACENAMIENTO
   Archivo: src/app/services/storage.service.ts
   
   ¿Qué hace? Gestiona el almacenamiento
   en localStorage de forma centralizada
   =================================== */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Claves del localStorage
  private readonly PRODUCTOS_KEY = 'inventarioProductos';
  private readonly CATEGORIAS_KEY = 'inventarioCategorias';
  private readonly REPORTES_KEY = 'inventarioReportes';

  constructor() {}

  /**
   * Guardar datos en localStorage
   */
  guardar<T>(clave: string, datos: T): void {
    try {
      localStorage.setItem(clave, JSON.stringify(datos));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  /**
   * Obtener datos del localStorage
   */
  obtener<T>(clave: string, valorPorDefecto?: T): T | null {
    try {
      const datos = localStorage.getItem(clave);
      return datos ? JSON.parse(datos) : valorPorDefecto || null;
    } catch (error) {
      console.error('Error al obtener del localStorage:', error);
      return valorPorDefecto || null;
    }
  }

  /**
   * Eliminar datos del localStorage
   */
  eliminar(clave: string): void {
    try {
      localStorage.removeItem(clave);
    } catch (error) {
      console.error('Error al eliminar del localStorage:', error);
    }
  }

  /**
   * Limpiar todo localStorage
   */
  limpiarTodo(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
    }
  }

  /**
   * Métodos específicos para productos
   */
  obtenerProductos<T>(valorPorDefecto: T[] = []): T[] {
    return this.obtener<T[]>(this.PRODUCTOS_KEY, valorPorDefecto) || valorPorDefecto;
  }

  guardarProductos<T>(productos: T[]): void {
    this.guardar(this.PRODUCTOS_KEY, productos);
  }

  /**
   * Métodos específicos para categorías
   */
  obtenerCategorias<T>(valorPorDefecto: T[] = []): T[] {
    return this.obtener<T[]>(this.CATEGORIAS_KEY, valorPorDefecto) || valorPorDefecto;
  }

  guardarCategorias<T>(categorias: T[]): void {
    this.guardar(this.CATEGORIAS_KEY, categorias);
  }

  /**
   * Métodos específicos para reportes
   */
  obtenerReportes<T>(valorPorDefecto: T[] = []): T[] {
    return this.obtener<T[]>(this.REPORTES_KEY, valorPorDefecto) || valorPorDefecto;
  }

  guardarReportes<T>(reportes: T[]): void {
    this.guardar(this.REPORTES_KEY, reportes);
  }
}