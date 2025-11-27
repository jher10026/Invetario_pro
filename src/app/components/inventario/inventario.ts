/* ===================================
   COMPONENTE INVENTARIO
   Archivo: src/app/components/inventario/inventario.component.ts
   =================================== */

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos.service';
import { CategoriasService } from '../../services/categorias.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Producto, EstadoStock } from '../../models/producto.model';
import { Categoria } from '../../models/categoria.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario {
  private productosService = inject(ProductosService);
  private categoriasService = inject(CategoriasService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  // Datos
  productos = this.productosService.productos;
  categorias = this.categoriasService.categorias;
  usuarioActual: Usuario | null = null;
  iniciales = '';

  // Filtros
  searchTerm = signal('');
  categoriaSeleccionada = signal('');
  estadoSeleccionado = signal('');
  ordenamiento = signal('recent');

  // Modal
  mostrarModal = signal(false);
  editandoProducto = signal(false);
  productoSeleccionado = signal<Producto | null>(null);

  // Formulario
  formProducto = signal({
    nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    precio: 0,
    stock: 0
  });

  // Computed para productos filtrados
  productosFiltrados = computed(() => {
    let resultado = [...this.productos()];

    // Filtrar por búsqueda
    const searchTerm = this.searchTerm().toLowerCase();
    if (searchTerm) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por categoría
    const categoriaSeleccionada = this.categoriaSeleccionada();
    if (categoriaSeleccionada) {
      resultado = resultado.filter(p => p.categoria === categoriaSeleccionada);
    }

    // Filtrar por estado
    const estadoSeleccionado = this.estadoSeleccionado();
    if (estadoSeleccionado) {
      resultado = resultado.filter(p => 
        this.productosService.obtenerEstado(p.stock) === estadoSeleccionado
      );
    }

    // Ordenar
    const ordenamiento = this.ordenamiento();
    switch (ordenamiento) {
      case 'recent':
        resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        break;
      case 'oldest':
        resultado.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        break;
      case 'name':
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'price':
        resultado.sort((a, b) => b.precio - a.precio);
        break;
    }

    return resultado;
  });

  constructor() {
    this.obtenerUsuarioActual();
  }

  /**
   * Obtener usuario actual
   */
  private obtenerUsuarioActual(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();

    if (this.usuarioActual) {
      this.iniciales = this.usuarioActual.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
  }

  /**
   * Abrir modal para crear producto
   */
  abrirModalNuevo(): void {
    this.editandoProducto.set(false);
    this.productoSeleccionado.set(null);
    this.limpiarFormulario();
    this.mostrarModal.set(true);
  }

  /**
   * Abrir modal para editar producto
   */
  abrirModalEditar(producto: Producto): void {
    this.editandoProducto.set(true);
    this.productoSeleccionado.set(producto);
    this.formProducto.set({
      nombre: producto.nombre,
      fecha: producto.fecha,
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock
    });
    this.mostrarModal.set(true);
  }

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.limpiarFormulario();
  }

  /**
   * Guardar producto
   */
  guardarProducto(): void {
    const form = this.formProducto();

    // Validaciones
    if (!form.nombre.trim()) {
      this.notificationService.error('El nombre del producto es requerido');
      return;
    }

    if (!form.categoria) {
      this.notificationService.error('Debes seleccionar una categoría');
      return;
    }

    if (form.precio <= 0) {
      this.notificationService.error('El precio debe ser mayor a 0');
      return;
    }

    if (form.stock < 0) {
      this.notificationService.error('El stock no puede ser negativo');
      return;
    }

    if (this.editandoProducto() && this.productoSeleccionado()) {
      // Actualizar
      const actualizado = this.productosService.actualizar(
        this.productoSeleccionado()!.id,
        {
          nombre: form.nombre,
          fecha: form.fecha,
          categoria: form.categoria,
          precio: form.precio,
          stock: form.stock
        }
      );

      if (actualizado) {
        this.notificationService.exito('Producto actualizado exitosamente');
      }
    } else {
      // Crear nuevo
      this.productosService.agregar({
        nombre: form.nombre,
        fecha: form.fecha,
        categoria: form.categoria,
        precio: form.precio,
        stock: form.stock
      });

      this.notificationService.exito('Producto agregado exitosamente');
    }

    this.cerrarModal();
  }

  /**
   * Eliminar producto
   */
  eliminarProducto(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro que deseas eliminar "${nombre}"?`)) {
      const eliminado = this.productosService.eliminar(id);
      
      if (eliminado) {
        this.notificationService.exito('Producto eliminado exitosamente');
      }
    }
  }

  /**
   * Obtener estado del producto
   */
  obtenerEstado(stock: number): EstadoStock {
    return this.productosService.obtenerEstado(stock);
  }

  /**
   * Obtener color de categoría
   */
  obtenerColorCategoria(nombreCategoria: string): string {
    const categoria = this.categorias().find(c => c.nombre === nombreCategoria);
    return categoria ? categoria.color : '#6366f1';
  }

  /**
   * Obtener texto de estado
   */
  obtenerTextoEstado(stock: number): string {
    const estado = this.obtenerEstado(stock);
    switch (estado) {
      case 'disponible':
        return `En Stock (${stock})`;
      case 'bajo':
        return `Stock Bajo (${stock})`;
      case 'agotado':
        return 'Agotado';
      default:
        return '';
    }
  }

  /**
   * Limpiar formulario
   */
  private limpiarFormulario(): void {
    this.formProducto.set({
      nombre: '',
      fecha: new Date().toISOString().split('T')[0],
      categoria: '',
      precio: 0,
      stock: 0
    });
  }

  /**
   * Es admin?
   */
  esAdmin(): boolean {
    return this.usuarioActual?.role === 'admin';
  }

  /**
   * Actualizar formulario
   */
  actualizarForm(campo: string, valor: any): void {
    const form = this.formProducto();
    (form as any)[campo] = valor;
    this.formProducto.set({...form});
  }
}