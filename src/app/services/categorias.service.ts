/* ===================================
   SERVICIO DE CATEGORÍAS
   Archivo: src/app/services/categorias.service.ts
   
   ¿Qué hace? Gestiona todas las categorías
   =================================== */

import { Injectable, signal } from '@angular/core';
import { Categoria } from '../models/categoria.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  // Signal con las categorías
  private categoriasSignal = signal<Categoria[]>([]);
  
  // Computed para acceso de solo lectura
  categorias = this.categoriasSignal.asReadonly();

  // Categorías por defecto
  private categoriasPorDefecto: Categoria[] = [
    { id: 1, nombre: 'Electrónica', color: '#3b82f6' },
    { id: 2, nombre: 'Ropa', color: '#ec4899' },
    { id: 3, nombre: 'Hogar', color: '#fb923c' },
    { id: 4, nombre: 'Gaming', color: '#a855f7' }
  ];

  constructor(private storageService: StorageService) {
    this.cargarCategorias();
  }

  /**
   * Cargar categorías del storage
   */
  private cargarCategorias(): void {
    const categoriasGuardadas = this.storageService.obtenerCategorias<Categoria>(
      this.categoriasPorDefecto
    );
    this.categoriasSignal.set(categoriasGuardadas);
  }

  /**
   * Obtener todas las categorías
   */
  obtenerTodas(): Categoria[] {
    return this.categoriasSignal();
  }

  /**
   * Obtener una categoría por ID
   */
  obtenerPorId(id: number): Categoria | undefined {
    return this.categoriasSignal().find(c => c.id === id);
  }

  /**
   * Obtener una categoría por nombre
   */
  obtenerPorNombre(nombre: string): Categoria | undefined {
    return this.categoriasSignal().find(c => c.nombre === nombre);
  }

  /**
   * Agregar nueva categoría
   */
  agregar(categoria: Omit<Categoria, 'id'>): Categoria {
    const nuevaCategoria: Categoria = {
      id: Date.now(),
      ...categoria
    };

    const actuales = this.categoriasSignal();
    this.categoriasSignal.set([...actuales, nuevaCategoria]);
    this.guardarEnStorage();

    return nuevaCategoria;
  }

  /**
   * Actualizar categoría existente
   */
  actualizar(id: number, categoria: Partial<Categoria>): boolean {
    const actuales = this.categoriasSignal();
    const index = actuales.findIndex(c => c.id === id);

    if (index === -1) {
      return false;
    }

    actuales[index] = { ...actuales[index], ...categoria };
    this.categoriasSignal.set([...actuales]);
    this.guardarEnStorage();

    return true;
  }

  /**
   * Eliminar categoría
   */
  eliminar(id: number): boolean {
    const actuales = this.categoriasSignal();
    const index = actuales.findIndex(c => c.id === id);

    if (index === -1) {
      return false;
    }

    actuales.splice(index, 1);
    this.categoriasSignal.set([...actuales]);
    this.guardarEnStorage();

    return true;
  }

  /**
   * Verificar si una categoría existe
   */
  existe(nombre: string): boolean {
    return this.categoriasSignal().some(c => c.nombre === nombre);
  }

  /**
   * Guardar en storage
   */
  private guardarEnStorage(): void {
    this.storageService.guardarCategorias(this.categoriasSignal());
  }
}