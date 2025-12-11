/* ===================================
   COMPONENTE INVENTARIO - IMPORTS CORREGIDOS
   Archivo: src/app/components/inventario/inventario.ts
   
   ✅ Importa AMBOS: ReactiveFormsModule Y FormsModule
   =================================== */

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Para los filtros (ngModel)
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // ✅ Para el formulario del modal
import { ProductosService } from '../../services/productos.service';
import { CategoriasService } from '../../services/categorias.service';
import { NotificationService } from '../../services/notification.service';
import { FirebaseService } from '../../services/firebase.service';
import { Producto, EstadoStock } from '../../models/producto.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,           // ✅ Para filtros con [(ngModel)]
    ReactiveFormsModule    // ✅ Para formulario reactivo del modal
  ],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario {
  private productosService = inject(ProductosService);
  private categoriasService = inject(CategoriasService);
  private notificationService = inject(NotificationService);
  private firebaseService = inject(FirebaseService);
  private fb = inject(FormBuilder);

  // Datos
  productos = this.productosService.productos;
  categorias = this.categoriasService.categorias;
  cargando = this.productosService.cargando;
  usuarioActual: Usuario | null = null;
  iniciales = '';

  // Estados de guardado
  guardando = signal(false);

  // Filtros (estos usan ngModel del FormsModule)
  searchTerm = signal('');
  categoriaSeleccionada = signal('');
  estadoSeleccionado = signal('');
  ordenamiento = signal('recent');

  // Modal
  mostrarModal = signal(false);
  editandoProducto = signal(false);
  productoSeleccionado = signal<Producto | null>(null);
  mostrarModalEliminar = signal(false);
  productoAEliminar = signal<{ id: number; nombre: string } | null>(null);

  // ✅ FORMULARIO REACTIVO (usa ReactiveFormsModule)
  productoForm!: FormGroup;

  // Computed para productos filtrados
  productosFiltrados = computed(() => {
    let resultado = [...this.productos()];

    const searchTerm = this.searchTerm().toLowerCase();
    if (searchTerm) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm)
      );
    }

    const categoriaSeleccionada = this.categoriaSeleccionada();
    if (categoriaSeleccionada) {
      resultado = resultado.filter(p => p.categoria === categoriaSeleccionada);
    }

    const estadoSeleccionado = this.estadoSeleccionado();
    if (estadoSeleccionado) {
      resultado = resultado.filter(p => 
        this.productosService.obtenerEstado(p.stock) === estadoSeleccionado
      );
    }

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
    this.inicializarFormulario();
  }

  /**
   * ✅ INICIALIZAR FORMULARIO REACTIVO CON VALIDACIONES
   */
  private inicializarFormulario(): void {
    this.productoForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      fecha: [new Date().toISOString().split('T')[0], [
        Validators.required
      ]],
      categoria: ['', [
        Validators.required
      ]],
      precio: [0, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999)
      ]],
      stock: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(999999)
      ]]
    });
  }

  /**
   * ✅ GETTER PARA ACCEDER A LOS CONTROLES
   */
  get f() {
    return this.productoForm.controls;
  }

  /**
   * ✅ VERIFICAR SI UN CONTROL TIENE UN ERROR ESPECÍFICO
   */
  hasError(controlName: string, errorType: string): boolean {
    const control = this.productoForm.get(controlName);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  /**
   * ✅ OBTENER MENSAJE DE ERROR PERSONALIZADO
   */
  getErrorMessage(controlName: string): string {
    const control = this.productoForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control.hasError('minlength')) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.hasError('maxlength')) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.hasError('min')) {
      return `El valor mínimo es ${control.errors['min'].min}`;
    }
    if (control.hasError('max')) {
      return `El valor máximo es ${control.errors['max'].max}`;
    }
    
    return '';
  }

  /**
   * Obtener usuario actual
   */
  private obtenerUsuarioActual(): void {
    this.firebaseService.currentUser$.subscribe(user => {
      this.usuarioActual = user || null;

      if (this.usuarioActual) {
        this.iniciales = this.usuarioActual.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase();
      }
    });
  }

  /**
   * Abrir modal para crear producto
   */
  abrirModalNuevo(): void {
    this.editandoProducto.set(false);
    this.productoSeleccionado.set(null);
    this.productoForm.reset({
      nombre: '',
      fecha: new Date().toISOString().split('T')[0],
      categoria: '',
      precio: 0,
      stock: 0
    });
    this.mostrarModal.set(true);
  }

  /**
   * Abrir modal para editar producto
   */
  abrirModalEditar(producto: Producto): void {
    this.editandoProducto.set(true);
    this.productoSeleccionado.set(producto);
    this.productoForm.patchValue({
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
    this.productoForm.reset();
  }

  /**
   * ✅ GUARDAR PRODUCTO CON VALIDACIÓN DEL FORMULARIO
   */
  async guardarProducto(): Promise<void> {
    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.productoForm.controls).forEach(key => {
      this.productoForm.get(key)?.markAsTouched();
    });

    // Validar formulario
    if (this.productoForm.invalid) {
      this.notificationService.error('Por favor completa todos los campos correctamente');
      return;
    }

    this.guardando.set(true);

    try {
      const formData = this.productoForm.value;

      if (this.editandoProducto() && this.productoSeleccionado()) {
        // Actualizar
        const actualizado = await this.productosService.actualizar(
          this.productoSeleccionado()!.id,
          formData
        );

        if (actualizado) {
          this.notificationService.exito('Producto actualizado exitosamente');
          this.cerrarModal();
        } else {
          this.notificationService.error('Error al actualizar el producto');
        }
      } else {
        // Crear nuevo
        const nuevoProducto = await this.productosService.agregar(formData);

        if (nuevoProducto) {
          this.notificationService.exito('Producto agregado exitosamente');
          this.cerrarModal();
        } else {
          this.notificationService.error('Error al agregar el producto');
        }
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      this.notificationService.error('Error inesperado al guardar');
    } finally {
      this.guardando.set(false);
    }
  }

  /**
   * Mostrar modal de confirmación para eliminar
   */
  eliminarProducto(id: number, nombre: string): void {
    this.productoAEliminar.set({ id, nombre });
    this.mostrarModalEliminar.set(true);
  }

  /**
   * Confirmar eliminación del producto
   */
  async confirmarEliminacion(): Promise<void> {
    const producto = this.productoAEliminar();
    if (!producto) return;

    this.guardando.set(true);

    try {
      const eliminado = await this.productosService.eliminar(producto.id);
      
      if (eliminado) {
        this.notificationService.exito('Producto eliminado exitosamente');
        this.mostrarModalEliminar.set(false);
        this.productoAEliminar.set(null);
      } else {
        this.notificationService.error('Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      this.notificationService.error('Error inesperado al eliminar');
    } finally {
      this.guardando.set(false);
    }
  }

  /**
   * Cancelar eliminación
   */
  cancelarEliminacion(): void {
    this.mostrarModalEliminar.set(false);
    this.productoAEliminar.set(null);
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
}