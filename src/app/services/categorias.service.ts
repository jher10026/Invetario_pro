/* ============================================================================
   📂 SERVICIO DE CATEGORÍAS
   ============================================================================
   
   📌 PROPÓSITO:
   Este servicio actúa como intermediario entre los componentes y Firebase
   para todo lo relacionado con categorías. Mantiene un estado local (signal)
   sincronizado con Firestore.
   
   🔧 FUNCIONALIDADES:
   - Cargar categorías desde Firebase
   - Mantener estado local reactivo con signals
   - Agregar nuevas categorías
   - Actualizar categorías existentes
   - Eliminar categorías
   - Verificar si una categoría existe
   - Auto-recargar cuando cambia el usuario
   
   📁 Archivo: src/app/services/categorias.service.ts
   ============================================================================ */

// ==========================================
// 📦 IMPORTACIONES
// ==========================================
import { Injectable, inject, signal } from '@angular/core';
// Injectable: Permite que este servicio sea inyectable
// inject: Inyección de dependencias moderna
// signal: Sistema de reactividad de Angular

import { Categoria } from '../models/categoria.model';
// Categoria: Interfaz que define la estructura de una categoría

import { FirebaseService } from './firebase.service';
// FirebaseService: Servicio que maneja la comunicación con Firebase

// ==========================================
// 🎨 CONFIGURACIÓN DEL SERVICIO
// ==========================================
@Injectable({
  providedIn: 'root'  // Disponible en toda la aplicación (singleton)
})
export class CategoriasService {

  // ==========================================
  // 🔌 INYECCIÓN DE SERVICIOS
  // ==========================================

  private firebaseService = inject(FirebaseService);
  // Servicio principal para comunicación con Firebase

  // ==========================================
  // 📊 ESTADO LOCAL CON SIGNALS
  // ==========================================

  /**
   * Signal privado con las categorías
   * 
   * ¿Por qué usar signals?
   * - Son reactivos: cuando cambian, la vista se actualiza automáticamente
   * - Son síncronos: acceso inmediato al valor actual
   * - Son eficientes: solo notifican cuando el valor realmente cambia
   */
  private categoriasSignal = signal<Categoria[]>([]);

  /**
   * Signal de solo lectura para los componentes
   * 
   * asReadonly() evita que los componentes modifiquen el signal directamente.
   * Solo este servicio puede cambiar los valores.
   * Esto sigue el patrón de encapsulación.
   */
  categorias = this.categoriasSignal.asReadonly();

  // ==========================================
  // 🏗️ CATEGORÍAS POR DEFECTO
  // ==========================================

  /**
   * Categorías que se usan cuando:
   * - El usuario no está autenticado
   * - Hay un error al cargar desde Firebase
   */
  private categoriasPorDefecto: Categoria[] = [
    { id: 1, nombre: 'Electrónica', color: '#3b82f6' },  // Azul
    { id: 2, nombre: 'Ropa', color: '#ec4899' },         // Rosa
    { id: 3, nombre: 'Hogar', color: '#fb923c' },        // Naranja
    { id: 4, nombre: 'Gaming', color: '#a855f7' }        // Púrpura
  ];

  // ==========================================
  // 🏗️ CONSTRUCTOR
  // ==========================================

  constructor() {
    // Cargar categorías al inicializar el servicio
    this.cargarCategorias();

    /**
     * 🔄 RECARGAR CUANDO CAMBIE EL USUARIO
     * 
     * Cuando un usuario inicia o cierra sesión, las categorías
     * pueden ser diferentes (cada usuario puede tener sus propias categorías).
     * Por eso recargamos cuando detectamos un cambio de usuario.
     */
    this.firebaseService.currentUser$.subscribe(user => {
      if (user) {
        this.cargarCategorias();
      }
    });
  }

  // ==========================================
  // 📥 CARGAR DATOS DESDE FIREBASE
  // ==========================================

  /**
   * 📋 CARGAR CATEGORÍAS DESDE FIREBASE
   * -------------------------------------
   * Método privado que obtiene las categorías de Firestore
   * y actualiza el signal local.
   * 
   * Es async porque la comunicación con Firebase es asíncrona.
   * Se usa await para esperar la respuesta.
   */
  private async cargarCategorias(): Promise<void> {
    try {
      // Obtener categorías desde Firebase
      const categorias = await this.firebaseService.obtenerCategorias();

      // Actualizar el signal local
      this.categoriasSignal.set(categorias);

      console.log('✅ Categorías cargadas desde Firebase:', categorias);
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);

      // En caso de error, usar categorías por defecto
      this.categoriasSignal.set(this.categoriasPorDefecto);
    }
  }

  // ==========================================
  // 📖 MÉTODOS DE LECTURA
  // ==========================================

  /**
   * 📋 OBTENER TODAS LAS CATEGORÍAS
   * ---------------------------------
   * Retorna el array de categorías actual.
   * Método síncrono que accede al valor del signal.
   * 
   * @returns Array de todas las categorías
   */
  obtenerTodas(): Categoria[] {
    return this.categoriasSignal();
  }

  /**
   * 🔍 OBTENER CATEGORÍA POR ID
   * ----------------------------
   * Busca una categoría específica por su ID numérico.
   * 
   * @param id - ID de la categoría
   * @returns La categoría encontrada o undefined si no existe
   */
  obtenerPorId(id: number): Categoria | undefined {
    return this.categoriasSignal().find(c => c.id === id);
  }

  /**
   * 🔍 OBTENER CATEGORÍA POR NOMBRE
   * --------------------------------
   * Busca una categoría por su nombre exacto.
   * 
   * @param nombre - Nombre de la categoría
   * @returns La categoría encontrada o undefined
   */
  obtenerPorNombre(nombre: string): Categoria | undefined {
    return this.categoriasSignal().find(c => c.nombre === nombre);
  }

  // ==========================================
  // ✏️ MÉTODOS DE ESCRITURA (CRUD)
  // ==========================================

  /**
   * ➕ AGREGAR NUEVA CATEGORÍA
   * ---------------------------
   * Crea una categoría en Firebase y la agrega al estado local.
   * 
   * FLUJO:
   * 1. Llamar a Firebase para guardar en Firestore
   * 2. Si es exitoso, agregar al signal local
   * 3. Retornar la categoría creada o null si falla
   * 
   * @param categoria - Datos de la categoría (sin ID, se genera automáticamente)
   * @returns La categoría creada con su ID, o null si hay error
   */
  async agregar(categoria: Omit<Categoria, 'id'>): Promise<Categoria | null> {
    try {
      console.log('💾 Guardando categoría en Firebase:', categoria);

      // Guardar en Firebase
      const nuevaCategoria = await this.firebaseService.agregarCategoria(categoria);

      if (nuevaCategoria) {
        // Actualizar signal local (agregar al final del array)
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
   * ✏️ ACTUALIZAR CATEGORÍA EXISTENTE
   * -----------------------------------
   * Modifica una categoría en Firebase y actualiza el estado local.
   * 
   * FLUJO:
   * 1. Buscar la categoría en el state local
   * 2. Obtener el _firestoreId (ID interno de Firebase)
   * 3. Actualizar en Firebase
   * 4. Si es exitoso, actualizar el signal local
   * 
   * @param id - ID de la categoría a actualizar
   * @param cambios - Campos a modificar (solo nombre y/o color)
   * @returns true si se actualizó correctamente
   */
  async actualizar(id: number, cambios: Partial<Categoria>): Promise<boolean> {
    try {
      const actuales = this.categoriasSignal();
      const categoria = actuales.find(c => c.id === id);

      if (!categoria) {
        console.error('❌ Categoría no encontrada');
        return false;
      }

      // Obtener el ID de Firestore (guardado como _firestoreId)
      const firestoreId = (categoria as any)._firestoreId;

      if (firestoreId) {
        // Actualizar en Firebase
        const actualizado = await this.firebaseService.actualizarCategoria(
          firestoreId,
          cambios
        );

        if (actualizado) {
          // Actualizar en el signal local
          const index = actuales.findIndex(c => c.id === id);
          actuales[index] = { ...actuales[index], ...cambios };

          // Crear nuevo array para que Angular detecte el cambio
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
   * 🗑️ ELIMINAR CATEGORÍA
   * -----------------------
   * Elimina una categoría de Firebase y del estado local.
   * 
   * ⚠️ IMPORTANTE:
   * Antes de llamar este método, el componente debe verificar
   * que no existan productos usando esta categoría.
   * 
   * FLUJO:
   * 1. Buscar la categoría en el state local
   * 2. Obtener el _firestoreId
   * 3. Eliminar de Firebase
   * 4. Si es exitoso, remover del signal local
   * 
   * @param id - ID de la categoría a eliminar
   * @returns true si se eliminó correctamente
   */
  async eliminar(id: number): Promise<boolean> {
    try {
      const actuales = this.categoriasSignal();
      const categoria = actuales.find(c => c.id === id);

      if (!categoria) {
        console.error('❌ Categoría no encontrada');
        return false;
      }

      // Obtener ID de Firestore
      const firestoreId = (categoria as any)._firestoreId;

      if (firestoreId) {
        // Eliminar de Firebase
        const eliminado = await this.firebaseService.eliminarCategoria(firestoreId);

        if (eliminado) {
          // Actualizar signal local (filtrar la categoría eliminada)
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

  // ==========================================
  // 🔧 MÉTODOS AUXILIARES
  // ==========================================

  /**
   * ✅ VERIFICAR SI UNA CATEGORÍA EXISTE
   * --------------------------------------
   * Comprueba si ya existe una categoría con el nombre dado.
   * La comparación es case-insensitive (no distingue mayúsculas).
   * 
   * Se usa antes de crear una nueva categoría para evitar duplicados.
   * 
   * @param nombre - Nombre de la categoría a verificar
   * @returns true si ya existe una categoría con ese nombre
   */
  existe(nombre: string): boolean {
    return this.categoriasSignal().some(
      c => c.nombre.toLowerCase() === nombre.toLowerCase()
    );
  }

  /**
   * 🔄 RECARGAR CATEGORÍAS
   * -----------------------
   * Método público para forzar una recarga de categorías desde Firebase.
   * Útil si se sospecha que los datos locales están desactualizados.
   */
  async recargar(): Promise<void> {
    await this.cargarCategorias();
  }
}