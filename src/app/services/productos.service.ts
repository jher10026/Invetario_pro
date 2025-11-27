/* ===================================
   SERVICIO DE PRODUCTOS - FASE 3
   Archivo: src/app/services/productos.service.ts
   
   ⚠️ REEMPLAZA COMPLETAMENTE EL ARCHIVO ANTERIOR
   ✅ Migrado a Firestore
   =================================== */

import { Injectable, signal, inject } from '@angular/core';
import { Producto, EstadoStock } from '../models/producto.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private firebaseService = inject(FirebaseService);

  // Signal con los productos
  private productosSignal = signal<Producto[]>([]);
  
  // Computed para acceso de solo lectura
  productos = this.productosSignal.asReadonly();

  // Estado de carga
  cargando = signal(false);

  constructor() {
    console.log('📦 Productos Service inicializado');
    this.inicializarListener();
  }

  /**
   * Inicializar listener de autenticación y cargar productos
   */
  private inicializarListener(): void {
    this.firebaseService.currentUser$.subscribe(async (user) => {
      if (user) {
        console.log('👤 Usuario autenticado, cargando productos...');
        await this.cargarProductos();
      } else {
        console.log('👤 Sin usuario, limpiando productos');
        this.productosSignal.set([]);
      }
    });
  }

  /**
   * Cargar productos desde Firestore
   */
  async cargarProductos(): Promise<void> {
    try {
      this.cargando.set(true);
      console.log('📥 Cargando productos desde Firestore...');
      
      const productos = await this.firebaseService.obtenerProductos();
      this.productosSignal.set(productos);
      
      console.log(`✅ ${productos.length} productos cargados`);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
    } finally {
      this.cargando.set(false);
    }
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
  async agregar(producto: Omit<Producto, 'id'>): Promise<Producto | null> {
    try {
      console.log('➕ Agregando producto:', producto.nombre);
      
      const nuevoProducto = await this.firebaseService.agregarProducto(producto);
      
      if (nuevoProducto) {
        // Agregar al signal local
        const actuales = this.productosSignal();
        this.productosSignal.set([...actuales, nuevoProducto]);
        
        console.log('✅ Producto agregado');
        return nuevoProducto;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error al agregar producto:', error);
      return null;
    }
  }

  /**
   * Actualizar producto existente
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
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      return false;
    }
  }

  /**
   * Eliminar producto
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
      
      const eliminado = await this.firebaseService.eliminarProducto(firestoreId);

      if (eliminado) {
        // Eliminar del signal local
        const nuevosProductos = actuales.filter(p => p.id !== id);
        this.productosSignal.set(nuevosProductos);
        
        console.log('✅ Producto eliminado');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      return false;
    }
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
}