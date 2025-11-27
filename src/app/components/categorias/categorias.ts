/* ===================================
   COMPONENTE CATEGORÍAS
   Archivo: src/app/components/categorias/categorias.component.ts
   =================================== */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriasService } from '../../services/categorias.service';
import { ProductosService } from '../../services/productos.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Categoria } from '../../models/categoria.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias {
  private categoriasService = inject(CategoriasService);
  private productosService = inject(ProductosService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  // Datos
  categorias = this.categoriasService.categorias;
  usuarioActual: Usuario | null = null;
  iniciales = '';

  // Modal
  mostrarModal = signal(false);
  editandoCategoria = signal(false);
  categoriaSeleccionada = signal<Categoria | null>(null);

  // Formulario
  formCategoria = signal({
    nombre: '',
    color: '#6366f1'
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
   * Abrir modal para crear categoría
   */
  abrirModalNuevo(): void {
    this.editandoCategoria.set(false);
    this.categoriaSeleccionada.set(null);
    this.limpiarFormulario();
    this.mostrarModal.set(true);
  }

  /**
   * Abrir modal para editar categoría
   */
  abrirModalEditar(categoria: Categoria): void {
    this.editandoCategoria.set(true);
    this.categoriaSeleccionada.set(categoria);
    this.formCategoria.set({
      nombre: categoria.nombre,
      color: categoria.color
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
   * Guardar categoría
   */
  guardarCategoria(): void {
    const form = this.formCategoria();

    // Validaciones
    if (!form.nombre.trim()) {
      this.notificationService.error('El nombre de la categoría es requerido');
      return;
    }

    if (!form.color) {
      this.notificationService.error('Debes seleccionar un color');
      return;
    }

    if (this.editandoCategoria() && this.categoriaSeleccionada()) {
      // Actualizar
      const actualizado = this.categoriasService.actualizar(
        this.categoriaSeleccionada()!.id,
        {
          nombre: form.nombre,
          color: form.color
        }
      );

      if (actualizado) {
        this.notificationService.exito('Categoría actualizada exitosamente');
      }
    } else {
      // Verificar que no exista
      if (this.categoriasService.existe(form.nombre)) {
        this.notificationService.error('Esta categoría ya existe');
        return;
      }

      // Crear nueva
      this.categoriasService.agregar({
        nombre: form.nombre,
        color: form.color
      });

      this.notificationService.exito('Categoría creada exitosamente');
    }

    this.cerrarModal();
  }

  /**
   * Eliminar categoría
   */
  eliminarCategoria(id: number, nombre: string): void {
    // Verificar si tiene productos
    const productos = this.productosService.filtrarPorCategoria(nombre);

    if (productos.length > 0) {
      this.notificationService.error(
        `No se puede eliminar. Esta categoría tiene ${productos.length} producto(s) asociado(s)`
      );
      return;
    }

    if (confirm(`¿Estás seguro que deseas eliminar "${nombre}"?`)) {
      const eliminado = this.categoriasService.eliminar(id);

      if (eliminado) {
        this.notificationService.exito('Categoría eliminada exitosamente');
      }
    }
  }

  /**
   * Obtener cantidad de productos en una categoría
   */
  obtenerCantidadProductos(nombre: string): number {
    return this.productosService.filtrarPorCategoria(nombre).length;
  }

  /**
   * Limpiar formulario
   */
  private limpiarFormulario(): void {
    this.formCategoria.set({
      nombre: '',
      color: '#6366f1'
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
    const form = this.formCategoria();
    (form as any)[campo] = valor;
    this.formCategoria.set({...form});
  }
}