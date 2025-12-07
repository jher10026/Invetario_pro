/* ===================================
   SERVICIO DE CATEGORÍAS - CORREGIDO CON FIREBASE
   Archivo: src/app/services/categorias.service.ts
   
   ✅ Ahora guarda en Firestore
   ✅ Sincronización en tiempo real
   =================================== */

import { Injectable, inject, signal } from '@angular/core';
import { Categoria } from '../models/categoria.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private firebaseService = inject(FirebaseService);

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

  constructor() {
    this.cargarCategorias();
    
    // 🔄 Recargar cuando cambie el usuario
    this.firebaseService.currentUser$.subscribe(user => {
      if (user) {
        this.cargarCategorias();
      }
    });
  }

  /**
   * Cargar categorías desde Firebase
   */
  private async cargarCategorias(): Promise<void> {
    try {
      const categorias = await this.firebaseService.obtenerCategorias();
      this.categoriasSignal.set(categorias);
      console.log('✅ Categorías cargadas desde Firebase:', categorias);
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
      this.categoriasSignal.set(this.categoriasPorDefecto);
    }
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
   * Agregar nueva categoría (ahora guarda en Firebase)
   */
  async agregar(categoria: Omit<Categoria, 'id'>): Promise<Categoria | null> {
    try {
      console.log('💾 Guardando categoría en Firebase:', categoria);
      
      // 🔥 Guardar en Firebase
      const nuevaCategoria = await this.firebaseService.agregarCategoria(categoria);
      
      if (nuevaCategoria) {
        // Actualizar signal local
        const actuales = this.categoriasSignal();
        this.categoriasSignal.set([...actuales, nuevaCategoria]);
        console.log('✅ Categoría guardada exitosamente');
        return nuevaCategoria;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error al agregar categoría:', error);
      return null;
    }
  }

  /**
   * Actualizar categoría existente (ahora actualiza en Firebase)
   */
  async actualizar(id: number, cambios: Partial<Categoria>): Promise<boolean> {
    try {
      const actuales = this.categoriasSignal();
      const categoria = actuales.find(c => c.id === id);

      if (!categoria) {
        console.error('❌ Categoría no encontrada');
        return false;
      }

      // 🔥 Actualizar en Firebase
      const firestoreId = (categoria as any)._firestoreId;
      if (firestoreId) {
        const actualizado = await this.firebaseService.actualizarCategoria(
          firestoreId,
          cambios
        );

        if (actualizado) {
          // Actualizar signal local
          const index = actuales.findIndex(c => c.id === id);
          actuales[index] = { ...actuales[index], ...cambios };
          this.categoriasSignal.set([...actuales]);
          console.log('✅ Categoría actualizada en Firebase');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error al actualizar categoría:', error);
      return false;
    }
  }

  /**
   * Eliminar categoría (ahora elimina de Firebase)
   */
  async eliminar(id: number): Promise<boolean> {
    try {
      const actuales = this.categoriasSignal();
      const categoria = actuales.find(c => c.id === id);

      if (!categoria) {
        console.error('❌ Categoría no encontrada');
        return false;
      }

      // 🔥 Eliminar de Firebase
      const firestoreId = (categoria as any)._firestoreId;
      if (firestoreId) {
        const eliminado = await this.firebaseService.eliminarCategoria(firestoreId);

        if (eliminado) {
          // Actualizar signal local
          const nuevasCategorias = actuales.filter(c => c.id !== id);
          this.categoriasSignal.set(nuevasCategorias);
          console.log('✅ Categoría eliminada de Firebase');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error al eliminar categoría:', error);
      return false;
    }
  }

  /**
   * Verificar si una categoría existe
   */
  existe(nombre: string): boolean {
    return this.categoriasSignal().some(
      c => c.nombre.toLowerCase() === nombre.toLowerCase()
    );
  }

  /**
   * Recargar categorías desde Firebase
   */
  async recargar(): Promise<void> {
    await this.cargarCategorias();
  }
}