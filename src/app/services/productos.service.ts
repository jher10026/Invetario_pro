/* ============================================================================
   📦 SERVICIO DE PRODUCTOS
   ============================================================================
   
   📌 PROPÓSITO:
   Este servicio maneja toda la lógica de negocio relacionada con productos.
   Actúa como intermediario entre los componentes y Firebase, manteniendo
   un estado local sincronizado.
   
   🔧 FUNCIONALIDADES:
   
   📋 CRUD (Crear, Leer, Actualizar, Eliminar):
   - Cargar productos desde Firebase
   - Agregar nuevos productos
   - Actualizar productos existentes
   - Eliminar productos
   
   📊 CONSULTAS:
   - Obtener producto por ID
   - Obtener productos con stock bajo
   - Filtrar por categoría
   - Buscar por nombre
   - Ordenar por diferentes criterios
   
   💰 CÁLCULOS:
   - Valor total del inventario
   - Estado del stock (disponible, bajo, agotado)
   
   🔔 NOTIFICACIONES:
   - Notificar cuando se agrega un producto
   - Notificar cuando se edita un producto
   - Notificar cuando se elimina un producto
   - Alertar sobre stock bajo
   
   📁 Archivo: src/app/services/productos.service.ts
   ============================================================================ */

// ==========================================
// 📦 IMPORTACIONES
// ==========================================
import { Injectable, signal, inject } from '@angular/core';
// Injectable: Permite que el servicio sea inyectable
// signal: Sistema de reactividad de Angular
// inject: Inyección de dependencias moderna

import { Producto, EstadoStock } from '../models/producto.model';
// Producto: Interfaz que define la estructura de un producto
// EstadoStock: Tipo para los estados ('disponible' | 'bajo' | 'agotado')

import { FirebaseService } from './firebase.service';
// FirebaseService: Comunicación con Firebase

import { RealtimeNotificationsService } from './realtime-notifications.service';
// RealtimeNotificationsService: Envía notificaciones en tiempo real

// ==========================================
// 🎨 CONFIGURACIÓN DEL SERVICIO
// ==========================================
@Injectable({
  providedIn: 'root'  // Singleton disponible en toda la aplicación
})
export class ProductosService {

  // ==========================================
  // 🔌 INYECCIÓN DE SERVICIOS
  // ==========================================

  private firebaseService = inject(FirebaseService);
  // Servicio principal para operaciones con Firebase

  private realtimeNotifications = inject(RealtimeNotificationsService);
  // Servicio para enviar notificaciones en tiempo real

  // ==========================================
  // 📊 ESTADO LOCAL CON SIGNALS
  // ==========================================

  /**
   * Signal privado con todos los productos
   * El array se mantiene sincronizado con Firestore.
   */
  private productosSignal = signal<Producto[]>([]);

  /**
   * Signal de solo lectura para los componentes
   * Previene modificaciones directas desde fuera del servicio.
   */
  productos = this.productosSignal.asReadonly();

  /**
   * Estado de carga
   * true mientras se están obteniendo productos de Firebase.
   * Se usa para mostrar spinners o skeletos de carga.
   */
  cargando = signal(false);

  // ==========================================
  // 🏗️ CONSTRUCTOR
  // ==========================================

  constructor() {
    console.log('📦 Productos Service inicializado');
    // Configurar el listener de autenticación
    this.inicializarListener();
  }

  // ==========================================
  // 👂 LISTENER DE AUTENTICACIÓN
  // ==========================================

  /**
   * 🔄 INICIALIZAR LISTENER DE USUARIO
   * ------------------------------------
   * Escucha cambios en el estado de autenticación.
   * 
   * Cuando un usuario inicia sesión:
   * - Carga sus productos desde Firebase
   * 
   * Cuando un usuario cierra sesión:
   * - Limpia los productos del estado local
   * 
   * Esto asegura que cada usuario solo vea sus propios datos.
   */
  private inicializarListener(): void {
    this.firebaseService.currentUser$.subscribe(async (user) => {
      if (user) {
        // Usuario autenticado: cargar sus productos
        console.log('👤 Usuario autenticado, cargando productos...');
        await this.cargarProductos();
      } else {
        // Sin usuario: limpiar productos
        console.log('👤 Sin usuario, limpiando productos');
        this.productosSignal.set([]);
      }
    });
  }

  // ==========================================
  // 📥 CARGAR DATOS DESDE FIREBASE
  // ==========================================

  /**
   * 📋 CARGAR PRODUCTOS DESDE FIRESTORE
   * -------------------------------------
   * Obtiene todos los productos del usuario actual desde Firebase.
   * 
   * FLUJO:
   * 1. Activar estado de carga (spinner)
   * 2. Llamar al servicio de Firebase
   * 3. Actualizar el signal local con los productos
   * 4. Desactivar estado de carga
   */
  async cargarProductos(): Promise<void> {
    try {
      // Activar indicador de carga
      this.cargando.set(true);
      console.log('📥 Cargando productos desde Firestore...');

      // Obtener productos de Firebase
      const productos = await this.firebaseService.obtenerProductos();

      // Actualizar estado local
      this.productosSignal.set(productos);

      console.log(`✅ ${productos.length} productos cargados`);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
    } finally {
      // Siempre desactivar el indicador de carga
      this.cargando.set(false);
    }
  }

  // ==========================================
  // 📖 MÉTODOS DE LECTURA
  // ==========================================

  /**
   * 📋 OBTENER TODOS LOS PRODUCTOS
   * --------------------------------
   * Retorna el array completo de productos.
   * 
   * @returns Array de todos los productos
   */
  obtenerTodos(): Producto[] {
    return this.productosSignal();
  }

  /**
   * 🔍 OBTENER PRODUCTO POR ID
   * ---------------------------
   * Busca un producto específico por su ID.
   * 
   * @param id - ID del producto
   * @returns El producto encontrado o undefined
   */
  obtenerPorId(id: number): Producto | undefined {
    return this.productosSignal().find(p => p.id === id);
  }

  // ==========================================
  // ✏️ MÉTODOS DE ESCRITURA (CRUD)
  // ==========================================

  /**
   * ➕ AGREGAR NUEVO PRODUCTO
   * --------------------------
   * Crea un producto en Firebase y lo agrega al estado local.
   * También envía notificaciones relevantes.
   * 
   * FLUJO:
   * 1. Guardar en Firebase
   * 2. Si es exitoso, agregar al signal local
   * 3. Notificar que se agregó un producto
   * 4. Si tiene stock bajo, enviar alerta
   * 
   * @param producto - Datos del producto (sin ID)
   * @returns El producto creado o null si falla
   */
  async agregar(producto: Omit<Producto, 'id'>): Promise<Producto | null> {
    try {
      console.log('➕ Agregando producto:', producto.nombre);

      // Guardar en Firebase
      const nuevoProducto = await this.firebaseService.agregarProducto(producto);

      if (nuevoProducto) {
        // Agregar al signal local
        const actuales = this.productosSignal();
        this.productosSignal.set([...actuales, nuevoProducto]);

        console.log('✅ Producto agregado');

        // 🔔 Notificar producto agregado
        await this.realtimeNotifications.notificarProductoAgregado(producto.nombre);

        // 🔔 Verificar si tiene stock bajo (entre 1 y 9)
        if (producto.stock > 0 && producto.stock < 10) {
          await this.realtimeNotifications.notificarStockBajo(producto.nombre, producto.stock);
        }

        return nuevoProducto;
      }

      return null;
    } catch (error) {
      console.error('❌ Error al agregar producto:', error);
      return null;
    }
  }

  /**
   * ✏️ ACTUALIZAR PRODUCTO EXISTENTE
   * ----------------------------------
   * Modifica un producto en Firebase y actualiza el estado local.
   * 
   * FLUJO:
   * 1. Buscar el producto en el state local
   * 2. Obtener el _firestoreId
   * 3. Actualizar en Firebase
   * 4. Si es exitoso, actualizar el signal local
   * 5. Enviar notificaciones relevantes
   * 
   * @param id - ID del producto
   * @param producto - Campos a modificar
   * @returns true si se actualizó correctamente
   */
  async actualizar(id: number, producto: Partial<Producto>): Promise<boolean> {
    try {
      const actuales = this.productosSignal();
      const productoActual = actuales.find(p => p.id === id);

      if (!productoActual) {
        console.error('❌ Producto no encontrado');
        return false;
      }

      // Obtener el ID de Firestore
      const firestoreId = (productoActual as any)._firestoreId;

      if (!firestoreId) {
        console.error('❌ ID de Firestore no encontrado');
        return false;
      }

      console.log('✏️ Actualizando producto:', productoActual.nombre);

      // Actualizar en Firebase
      const actualizado = await this.firebaseService.actualizarProducto(
        firestoreId,
        producto
      );

      if (actualizado) {
        // Actualizar en el signal local
        const index = actuales.findIndex(p => p.id === id);
        if (index !== -1) {
          actuales[index] = { ...actuales[index], ...producto };
          this.productosSignal.set([...actuales]);
        }

        console.log('✅ Producto actualizado');

        // 🔔 Notificar producto editado
        await this.realtimeNotifications.notificarProductoEditado(productoActual.nombre);

        // 🔔 Verificar si ahora tiene stock bajo
        const stockActualizado = producto.stock ?? productoActual.stock;
        if (stockActualizado > 0 && stockActualizado < 10) {
          await this.realtimeNotifications.notificarStockBajo(productoActual.nombre, stockActualizado);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      return false;
    }
  }

  /**
   * 🗑️ ELIMINAR PRODUCTO
   * ----------------------
   * Elimina un producto de Firebase y del estado local.
   * 
   * FLUJO:
   * 1. Buscar el producto en el state local
   * 2. Obtener el _firestoreId
   * 3. Eliminar de Firebase
   * 4. Si es exitoso, remover del signal local
   * 5. Enviar notificación
   * 
   * @param id - ID del producto a eliminar
   * @returns true si se eliminó correctamente
   */
  async eliminar(id: number): Promise<boolean> {
    try {
      const actuales = this.productosSignal();
      const producto = actuales.find(p => p.id === id);

      if (!producto) {
        console.error('❌ Producto no encontrado');
        return false;
      }

      // Obtener el ID de Firestore
      const firestoreId = (producto as any)._firestoreId;

      if (!firestoreId) {
        console.error('❌ ID de Firestore no encontrado');
        return false;
      }

      console.log('🗑️ Eliminando producto:', producto.nombre);

      // Eliminar de Firebase
      const eliminado = await this.firebaseService.eliminarProducto(firestoreId);

      if (eliminado) {
        // Eliminar del signal local
        const nuevosProductos = actuales.filter(p => p.id !== id);
        this.productosSignal.set(nuevosProductos);

        console.log('✅ Producto eliminado');

        // 🔔 Notificar producto eliminado
        await this.realtimeNotifications.notificarProductoEliminado(producto.nombre);

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      return false;
    }
  }

  // ==========================================
  // 📊 MÉTODOS DE ESTADO DEL STOCK
  // ==========================================

  /**
   * 📊 OBTENER ESTADO DEL STOCK
   * ----------------------------
   * Determina el estado de un producto según su cantidad en stock.
   * 
   * Estados:
   * - 'agotado': stock = 0
   * - 'bajo': stock entre 1 y 9
   * - 'disponible': stock >= 10
   * 
   * @param stock - Cantidad actual en inventario
   * @returns 'disponible' | 'bajo' | 'agotado'
   */
  obtenerEstado(stock: number): EstadoStock {
    if (stock === 0) return 'agotado';
    if (stock < 10) return 'bajo';
    return 'disponible';
  }

  /**
   * ⚠️ OBTENER PRODUCTOS CON STOCK BAJO
   * -------------------------------------
   * Filtra los productos que tienen stock entre 1 y 9 unidades.
   * Estos productos necesitan reabastecimiento pronto.
   * 
   * @returns Array de productos con stock bajo
   */
  obtenerStockBajo(): Producto[] {
    return this.productosSignal().filter(p => p.stock > 0 && p.stock < 10);
  }

  // ==========================================
  // 💰 MÉTODOS DE CÁLCULO
  // ==========================================

  /**
   * 💰 OBTENER VALOR TOTAL DEL INVENTARIO
   * --------------------------------------
   * Calcula el valor monetario total de todos los productos.
   * 
   * Fórmula: Σ (precio × stock) de cada producto
   * 
   * @returns Valor total en la moneda del sistema
   */
  obtenerValorTotal(): number {
    return this.productosSignal().reduce((sum, p) => sum + (p.precio * p.stock), 0);
  }

  // ==========================================
  // 🔍 MÉTODOS DE FILTRADO Y BÚSQUEDA
  // ==========================================

  /**
   * 📂 FILTRAR PRODUCTOS POR CATEGORÍA
   * ------------------------------------
   * Retorna solo los productos de una categoría específica.
   * 
   * @param categoria - Nombre exacto de la categoría
   * @returns Array de productos de esa categoría
   */
  filtrarPorCategoria(categoria: string): Producto[] {
    return this.productosSignal().filter(p => p.categoria === categoria);
  }

  /**
   * 🔍 BUSCAR PRODUCTOS POR NOMBRE
   * -------------------------------
   * Búsqueda parcial e insensible a mayúsculas.
   * 
   * Ejemplo: buscar("laptop") encontrará "Laptop Gaming", "LAPTOP HP", etc.
   * 
   * @param termino - Texto a buscar
   * @returns Array de productos que coinciden
   */
  buscar(termino: string): Producto[] {
    const termino_lower = termino.toLowerCase();
    return this.productosSignal().filter(p =>
      p.nombre.toLowerCase().includes(termino_lower)
    );
  }

  // ==========================================
  // 📋 MÉTODOS DE ORDENAMIENTO
  // ==========================================

  /**
   * 📋 ORDENAR PRODUCTOS
   * ---------------------
   * Retorna los productos ordenados según el criterio especificado.
   * No modifica el array original, retorna una copia ordenada.
   * 
   * Criterios disponibles:
   * - 'reciente': Más nuevos primero (por fecha)
   * - 'antiguo': Más viejos primero
   * - 'nombre': Alfabéticamente A-Z
   * - 'precio': Mayor precio primero
   * 
   * @param tipo - Tipo de ordenamiento
   * @returns Array de productos ordenados (nueva copia)
   */
  ordenar(tipo: 'reciente' | 'antiguo' | 'nombre' | 'precio'): Producto[] {
    // Crear copia para no mutar el original
    const copia = [...this.productosSignal()];

    switch (tipo) {
      case 'reciente':
        // Ordenar por fecha descendente (más reciente primero)
        return copia.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      case 'antiguo':
        // Ordenar por fecha ascendente (más antiguo primero)
        return copia.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      case 'nombre':
        // Ordenar alfabéticamente usando localeCompare para acentos
        return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));

      case 'precio':
        // Ordenar por precio descendente (mayor primero)
        return copia.sort((a, b) => b.precio - a.precio);

      default:
        return copia;
    }
  }
}