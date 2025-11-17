import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { Estadisticas } from '../models/estadisticas';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  public productos$ = this.productosSubject.asObservable();

  constructor() {
    this.cargarProductos();
  }

  /**
   * Cargar productos desde localStorage
   */
  private cargarProductos(): void {
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      const productos = JSON.parse(productosGuardados);
      this.productosSubject.next(productos);
    }
  }

  /**
   * Guardar productos en localStorage
   */
  private guardarProductos(productos: Producto[]): void {
    localStorage.setItem('productos', JSON.stringify(productos));
    this.productosSubject.next(productos);
  }

  /**
   * Obtener todos los productos
   */
  obtenerProductos(): Producto[] {
    return this.productosSubject.value;
  }

  /**
   * Obtener producto por ID
   */
  obtenerProductoPorId(id: string): Producto | undefined {
    return this.productosSubject.value.find(p => p.id === id);
  }

  /**
   * Crear nuevo producto
   */
  crearProducto(producto: Omit<Producto, 'id' | 'fechaCreacion' | 'ultimaActualizacion'>): Producto {
    const productos = this.obtenerProductos();
    
    const nuevoProducto: Producto = {
      ...producto,
      id: this.generarId(),
      fechaCreacion: new Date(),
      ultimaActualizacion: new Date()
    };

    productos.push(nuevoProducto);
    this.guardarProductos(productos);
    
    return nuevoProducto;
  }

  /**
   * Actualizar producto existente
   */
  actualizarProducto(id: string, datosActualizados: Partial<Producto>): boolean {
    const productos = this.obtenerProductos();
    const index = productos.findIndex(p => p.id === id);

    if (index !== -1) {
      productos[index] = {
        ...productos[index],
        ...datosActualizados,
        ultimaActualizacion: new Date()
      };
      this.guardarProductos(productos);
      return true;
    }

    return false;
  }

  /**
   * Eliminar producto
   */
  eliminarProducto(id: string): boolean {
    const productos = this.obtenerProductos();
    const productosFiltrados = productos.filter(p => p.id !== id);

    if (productosFiltrados.length < productos.length) {
      this.guardarProductos(productosFiltrados);
      return true;
    }

    return false;
  }

  /**
   * Buscar productos por nombre o categoría
   */
  buscarProductos(termino: string): Producto[] {
    const productos = this.obtenerProductos();
    const terminoLower = termino.toLowerCase();

    return productos.filter(p => 
      p.nombre.toLowerCase().includes(terminoLower) ||
      p.categoria.toLowerCase().includes(terminoLower) ||
      p.descripcion.toLowerCase().includes(terminoLower)
    );
  }

  /**
   * Filtrar productos por categoría
   */
  filtrarPorCategoria(categoria: string): Producto[] {
    const productos = this.obtenerProductos();
    
    if (categoria === 'todas') {
      return productos;
    }

    return productos.filter(p => p.categoria === categoria);
  }

  /**
   * Filtrar productos por estado
   */
  filtrarPorEstado(estado: 'activo' | 'inactivo' | 'todos'): Producto[] {
    const productos = this.obtenerProductos();
    
    if (estado === 'todos') {
      return productos;
    }

    return productos.filter(p => p.estado === estado);
  }

  /**
   * Obtener productos con stock bajo
   */
  obtenerProductosStockBajo(): Producto[] {
    const productos = this.obtenerProductos();
    return productos.filter(p => p.stock <= p.stockMinimo && p.estado === 'activo');
  }

  /**
   * Obtener estadísticas del inventario
   */
  obtenerEstadisticas(): Estadisticas {
    const productos = this.obtenerProductos();

    const totalProductos = productos.length;
    const productosActivos = productos.filter(p => p.estado === 'activo').length;
    const productosInactivos = productos.filter(p => p.estado === 'inactivo').length;
    const stockBajo = this.obtenerProductosStockBajo().length;
    const valorInventario = productos
      .filter(p => p.estado === 'activo')
      .reduce((total, p) => total + (p.precio * p.stock), 0);

    return {
      totalProductos,
      productosActivos,
      productosInactivos,
      stockBajo,
      valorInventario
    };
  }

  /**
   * Obtener productos más recientes
   */
  obtenerProductosRecientes(cantidad: number = 5): Producto[] {
    const productos = this.obtenerProductos();
    return productos
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, cantidad);
  }

  /**
   * Actualizar stock de un producto
   */
  actualizarStock(id: string, nuevoStock: number): boolean {
    return this.actualizarProducto(id, { stock: nuevoStock });
  }

  /**
   * Cambiar estado de un producto
   */
  cambiarEstado(id: string, nuevoEstado: 'activo' | 'inactivo'): boolean {
    return this.actualizarProducto(id, { estado: nuevoEstado });
  }

  /**
   * Generar ID único
   */
  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}