/* ===================================
   COMPONENTE CATEGORÍAS - CORREGIDO
   Archivo: src/app/components/categorias/categorias.ts
   
   ✅ Usa métodos async para Firebase
   =================================== */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriasService } from '../../services/categorias.service';
import { ProductosService } from '../../services/productos.service';
import { NotificationService } from '../../services/notification.service';
import { FirebaseService } from '../../services/firebase.service';
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
  private firebaseService = inject(FirebaseService);

  // Datos
  categorias = this.categoriasService.categorias;
  usuarioActual: Usuario | null = null;
  iniciales = '';

  // Modal
  mostrarModal = signal(false);
  editandoCategoria = signal(false);
  categoriaSeleccionada = signal<Categoria | null>(null);
  guardando = signal(false); // 🆕 Estado de guardando

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
    this.usuarioActual = this.firebaseService.obtenerUsuarioActual() || null;

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
   * Guardar categoría (ahora async para Firebase)
   */
  async guardarCategoria(): Promise<void> {
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

    // Mostrar estado de carga
    this.guardando.set(true);

    try {
      if (this.editandoCategoria() && this.categoriaSeleccionada()) {
        // 🔄 Actualizar en Firebase
        const actualizado = await this.categoriasService.actualizar(
          this.categoriaSeleccionada()!.id,
          {
            nombre: form.nombre,
            color: form.color
          }
        );

        if (actualizado) {
          this.notificationService.exito('Categoría actualizada exitosamente');
          this.cerrarModal();
        } else {
          this.notificationService.error('Error al actualizar la categoría');
        }
      } else {
        // Verificar que no exista
        if (this.categoriasService.existe(form.nombre)) {
          this.notificationService.error('Esta categoría ya existe');
          this.guardando.set(false);
          return;
        }

        // 💾 Crear nueva en Firebase
        const nuevaCategoria = await this.categoriasService.agregar({
          nombre: form.nombre,
          color: form.color
        });

        if (nuevaCategoria) {
          this.notificationService.exito('Categoría creada exitosamente');
          this.cerrarModal();
        } else {
          this.notificationService.error('Error al crear la categoría');
        }
      }
    } catch (error) {
      console.error('❌ Error al guardar categoría:', error);
      this.notificationService.error('Error al guardar la categoría');
    } finally {
      this.guardando.set(false);
    }
  }

  /**
   * Eliminar categoría (ahora async para Firebase)
   */
  async eliminarCategoria(id: number, nombre: string): Promise<void> {
    // Verificar si tiene productos
    const productos = this.productosService.filtrarPorCategoria(nombre);

    if (productos.length > 0) {
      this.notificationService.error(
        `No se puede eliminar. Esta categoría tiene ${productos.length} producto(s) asociado(s)`
      );
      return;
    }

    if (confirm(`¿Estás seguro que deseas eliminar "${nombre}"?`)) {
      try {
        // 🗑️ Eliminar de Firebase
        const eliminado = await this.categoriasService.eliminar(id);

        if (eliminado) {
          this.notificationService.exito('Categoría eliminada exitosamente');
        } else {
          this.notificationService.error('Error al eliminar la categoría');
        }
      } catch (error) {
        console.error('❌ Error al eliminar categoría:', error);
        this.notificationService.error('Error al eliminar la categoría');
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
    return this.firebaseService.esAdmin();
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