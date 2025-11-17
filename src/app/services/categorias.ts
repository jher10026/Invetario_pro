import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Categoria } from '../models/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private categoriasSubject = new BehaviorSubject<Categoria[]>([]);
  public categorias$ = this.categoriasSubject.asObservable();

  constructor() {
    this.cargarCategorias();
  }

  /**
   * Cargar categorías desde localStorage
   */
  private cargarCategorias(): void {
    const categoriasGuardadas = localStorage.getItem('categorias');
    if (categoriasGuardadas) {
      const categorias = JSON.parse(categoriasGuardadas);
      this.categoriasSubject.next(categorias);
    } else {
      // Inicializar categorías por defecto
      this.inicializarCategoriasDefecto();
    }
  }

  /**
   * Guardar categorías en localStorage
   */
  private guardarCategorias(categorias: Categoria[]): void {
    localStorage.setItem('categorias', JSON.stringify(categorias));
    this.categoriasSubject.next(categorias);
  }

  /**
   * Inicializar categorías por defecto
   */
  private inicializarCategoriasDefecto(): void {
    const categoriasDefecto: Categoria[] = [
      { id: '1', nombre: 'Electrónica', icono: 'ELE', color: '#3b82f6', cantidadProductos: 0 },
      { id: '2', nombre: 'Ropa', icono: 'ROP', color: '#ef4444', cantidadProductos: 0 },
      { id: '3', nombre: 'Alimentos', icono: 'ALI', color: '#22c55e', cantidadProductos: 0 },
      { id: '4', nombre: 'Otros', icono: 'OTR', color: '#a855f7', cantidadProductos: 0 }
    ];
    this.guardarCategorias(categoriasDefecto);
  }

  /**
   * Obtener todas las categorías
   */
  obtenerCategorias(): Categoria[] {
    return this.categoriasSubject.value;
  }

  /**
   * Obtener categoría por ID
   */
  obtenerCategoriaPorId(id: string): Categoria | undefined {
    return this.categoriasSubject.value.find(c => c.id === id);
  }

  /**
   * Crear nueva categoría
   */
  crearCategoria(categoria: Omit<Categoria, 'id' | 'cantidadProductos'>): Categoria {
    const categorias = this.obtenerCategorias();
    
    const nuevaCategoria: Categoria = {
      ...categoria,
      id: this.generarId(),
      cantidadProductos: 0
    };

    categorias.push(nuevaCategoria);
    this.guardarCategorias(categorias);
    
    return nuevaCategoria;
  }

  /**
   * Actualizar categoría existente
   */
  actualizarCategoria(id: string, datosActualizados: Partial<Categoria>): boolean {
    const categorias = this.obtenerCategorias();
    const index = categorias.findIndex(c => c.id === id);

    if (index !== -1) {
      categorias[index] = {
        ...categorias[index],
        ...datosActualizados
      };
      this.guardarCategorias(categorias);
      return true;
    }

    return false;
  }

  /**
   * Eliminar categoría
   */
  eliminarCategoria(id: string): boolean {
    const categorias = this.obtenerCategorias();
    const categoriasFiltradas = categorias.filter(c => c.id !== id);

    if (categoriasFiltradas.length < categorias.length) {
      this.guardarCategorias(categoriasFiltradas);
      return true;
    }

    return false;
  }

  /**
   * Actualizar cantidad de productos en una categoría
   */
  actualizarCantidadProductos(nombreCategoria: string, cantidad: number): void {
    const categorias = this.obtenerCategorias();
    const categoria = categorias.find(c => c.nombre === nombreCategoria);
    
    if (categoria) {
      this.actualizarCategoria(categoria.id, { cantidadProductos: cantidad });
    }
  }

  /**
   * Obtener nombres de todas las categorías
   */
  obtenerNombresCategorias(): string[] {
    return this.obtenerCategorias().map(c => c.nombre);
  }

  /**
   * Generar ID único
   */
  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}