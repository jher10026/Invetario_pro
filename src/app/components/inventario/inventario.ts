/* ============================================================================
   📦 COMPONENTE INVENTARIO
   ============================================================================
   
   📌 PROPÓSITO:
   Este componente maneja la gestión completa de productos del inventario.
   Es el componente principal donde se ven, crean, editan y eliminan productos.
   
   🔧 FUNCIONALIDADES:
   - Ver lista de todos los productos
   - Buscar productos por nombre
   - Filtrar por categoría y estado de stock
   - Ordenar productos (recientes, antiguos, nombre, precio)
   - Crear nuevos productos con validaciones
   - Editar productos existentes
   - Eliminar productos con confirmación
   - Ver estado del stock (disponible, bajo, agotado)
   
   📁 Archivo: src/app/components/inventario/inventario.ts
   ============================================================================ */

// ==========================================
// 📦 IMPORTACIONES DE ANGULAR
// ==========================================
import { Component, inject, signal, computed } from '@angular/core';
// Component: Decorador para crear componentes
// inject: Inyección de dependencias moderna
// signal: Estado reactivo de Angular
// computed: Valores calculados que se actualizan automáticamente

import { CommonModule } from '@angular/common';
// CommonModule: Directivas como *ngIf, *ngFor, async pipe, etc.

import { FormsModule } from '@angular/forms';
// FormsModule: Para usar [(ngModel)] en los filtros

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// ReactiveFormsModule: Para formularios reactivos con validaciones
// FormBuilder: Servicio para crear formularios fácilmente
// FormGroup: Agrupa varios controles de formulario
// Validators: Validadores incorporados (required, min, max, etc.)

// ==========================================
// 📦 IMPORTACIONES DE SERVICIOS
// ==========================================
import { ProductosService } from '../../services/productos.service';
// ProductosService: CRUD de productos y operaciones relacionadas

import { CategoriasService } from '../../services/categorias.service';
// CategoriasService: Para obtener la lista de categorías disponibles

import { NotificationService } from '../../services/notification.service';
// NotificationService: Muestra mensajes de éxito/error al usuario

import { FirebaseService } from '../../services/firebase.service';
// FirebaseService: Autenticación y datos del usuario actual

// ==========================================
// 📦 IMPORTACIONES DE MODELOS
// ==========================================
import { Producto, EstadoStock } from '../../models/producto.model';
// Producto: Interfaz que define la estructura de un producto
// EstadoStock: Tipo para los estados ('disponible' | 'bajo' | 'agotado')

import { Usuario } from '../../models/usuario.model';
// Usuario: Interfaz que define la estructura del usuario

import { AvatarModal } from '../shared/avatar-modal/avatar-modal';
// AvatarModal: Componente modal para foto de perfil

// ==========================================
// 🎨 CONFIGURACIÓN DEL COMPONENTE
// ==========================================
@Component({
  selector: 'app-inventario',  // Se usa como: <app-inventario></app-inventario>
  standalone: true,            // Componente independiente
  imports: [
    CommonModule,              // Para directivas comunes (*ngIf, *ngFor)
    FormsModule,               // Para filtros con [(ngModel)]
    ReactiveFormsModule,       // Para el formulario del modal
    AvatarModal                // Para cambiar foto de perfil
  ],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario {

  // ==========================================
  // 🔌 INYECCIÓN DE SERVICIOS
  // ==========================================

  private productosService = inject(ProductosService);
  // Servicio principal para todas las operaciones con productos

  private categoriasService = inject(CategoriasService);
  // Para obtener la lista de categorías para el select

  private notificationService = inject(NotificationService);
  // Para mostrar mensajes toast al usuario

  private firebaseService = inject(FirebaseService);
  // Para obtener datos del usuario logueado

  private fb = inject(FormBuilder);
  // FormBuilder: Ayuda a crear formularios reactivos más fácilmente

  // ==========================================
  // 📊 DATOS PRINCIPALES
  // ==========================================

  productos = this.productosService.productos;
  // Signal con todos los productos (se actualiza automáticamente desde Firebase)

  categorias = this.categoriasService.categorias;
  // Signal con todas las categorías disponibles

  cargando = this.productosService.cargando;
  // Estado de carga mientras se obtienen productos de Firebase

  usuarioActual: Usuario | null = null;
  // Datos del usuario que está logueado

  iniciales = '';
  // Iniciales del nombre para mostrar en avatar (ej: "JP")

  // ==========================================
  // 🔄 ESTADOS DE LA UI
  // ==========================================

  guardando = signal(false);
  // true cuando se está guardando en Firebase (muestra spinner)

  // ==========================================
  // 🔍 FILTROS DE BÚSQUEDA
  // ==========================================
  // Estos signals se conectan a los inputs con [(ngModel)]

  searchTerm = signal('');
  // Término de búsqueda por nombre de producto

  categoriaSeleccionada = signal('');
  // Filtrar por categoría específica (vacío = todas)

  estadoSeleccionado = signal('');
  // Filtrar por estado de stock (vacío = todos)

  ordenamiento = signal('recent');
  // Cómo ordenar: 'recent', 'oldest', 'name', 'price'

  // ==========================================
  // 🎛️ ESTADOS DE MODALES
  // ==========================================

  mostrarModal = signal(false);
  // Controla visibilidad del modal de crear/editar

  editandoProducto = signal(false);
  // true = editando, false = creando nuevo

  productoSeleccionado = signal<Producto | null>(null);
  // Producto que se está editando actualmente

  mostrarModalEliminar = signal(false);
  // Controla visibilidad del modal de confirmación

  productoAEliminar = signal<{ id: number; nombre: string } | null>(null);
  // Datos del producto que se quiere eliminar

  // Modal de avatar
  mostrarModalAvatar = signal(false);
  // Controla visibilidad del modal de foto de perfil

  // ==========================================
  // 📝 FORMULARIO REACTIVO
  // ==========================================
  // FormGroup contiene todos los campos del formulario con validaciones

  productoForm!: FormGroup;
  // El "!" indica que se inicializa en el constructor

  // ==========================================
  // 🔄 PRODUCTOS FILTRADOS (computed)
  // ==========================================
  /**
   * computed() crea un valor que se recalcula automáticamente
   * cuando cambian sus dependencias (productos, filtros, etc.)
   * 
   * FLUJO:
   * 1. Toma todos los productos
   * 2. Aplica filtro de búsqueda por nombre
   * 3. Aplica filtro de categoría
   * 4. Aplica filtro de estado de stock
   * 5. Aplica ordenamiento seleccionado
   * 6. Retorna el resultado filtrado
   */
  productosFiltrados = computed(() => {
    // Empezar con copia de todos los productos
    let resultado = [...this.productos()];

    // ==========================================
    // FILTRO POR BÚSQUEDA (nombre)
    // ==========================================
    const searchTerm = this.searchTerm().toLowerCase();
    if (searchTerm) {
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm)
      );
    }

    // ==========================================
    // FILTRO POR CATEGORÍA
    // ==========================================
    const categoriaSeleccionada = this.categoriaSeleccionada();
    if (categoriaSeleccionada) {
      resultado = resultado.filter(p => p.categoria === categoriaSeleccionada);
    }

    // ==========================================
    // FILTRO POR ESTADO DE STOCK
    // ==========================================
    const estadoSeleccionado = this.estadoSeleccionado();
    if (estadoSeleccionado) {
      resultado = resultado.filter(p =>
        this.productosService.obtenerEstado(p.stock) === estadoSeleccionado
      );
    }

    // ==========================================
    // ORDENAMIENTO
    // ==========================================
    const ordenamiento = this.ordenamiento();
    switch (ordenamiento) {
      case 'recent':
        // Más recientes primero (por fecha)
        resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        break;
      case 'oldest':
        // Más antiguos primero
        resultado.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        break;
      case 'name':
        // Alfabéticamente A-Z
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'price':
        // Mayor precio primero
        resultado.sort((a, b) => b.precio - a.precio);
        break;
    }

    return resultado;
  });

  // ==========================================
  // 🏗️ CONSTRUCTOR
  // ==========================================

  constructor() {
    this.obtenerUsuarioActual();    // Cargar datos del usuario
    this.inicializarFormulario();   // Crear formulario con validaciones
  }

  // ==========================================
  // 👤 MÉTODOS DEL MODAL DE AVATAR
  // ==========================================

  /**
   * 📷 ABRIR MODAL DE AVATAR
   * Muestra el modal para cambiar la foto de perfil
   */
  abrirModalAvatar(): void {
    this.mostrarModalAvatar.set(true);
  }

  /**
   * ❌ CERRAR MODAL DE AVATAR
   * Oculta el modal de foto de perfil
   */
  cerrarModalAvatar(): void {
    this.mostrarModalAvatar.set(false);
  }

  /**
   * 📸 CUANDO LA FOTO SE ACTUALIZA
   * Callback ejecutado después de cambiar la foto
   */
  onFotoActualizada(url: string | null): void {
    console.log('📸 Foto actualizada:', url);
  }

  // ==========================================
  // 📝 INICIALIZACIÓN DEL FORMULARIO REACTIVO
  // ==========================================

  /**
   * 🔧 CREAR FORMULARIO CON VALIDACIONES
   * -------------------------------------
   * Configura el FormGroup con todos los campos y sus validaciones.
   * 
   * Validators disponibles:
   * - required: Campo obligatorio
   * - minLength(n): Mínimo n caracteres
   * - maxLength(n): Máximo n caracteres
   * - min(n): Valor mínimo numérico
   * - max(n): Valor máximo numérico
   */
  private inicializarFormulario(): void {
    this.productoForm = this.fb.group({
      // Campo: Nombre del producto
      nombre: ['', [
        Validators.required,        // Obligatorio
        Validators.minLength(3),    // Mínimo 3 caracteres
        Validators.maxLength(50)    // Máximo 50 caracteres
      ]],

      // Campo: Fecha de ingreso
      fecha: [new Date().toISOString().split('T')[0], [
        Validators.required         // Obligatorio
      ]],

      // Campo: Categoría
      categoria: ['', [
        Validators.required         // Obligatorio
      ]],

      // Campo: Precio
      precio: [0, [
        Validators.required,        // Obligatorio
        Validators.min(0.01),       // Mínimo $0.01
        Validators.max(999999)      // Máximo $999,999
      ]],

      // Campo: Stock (cantidad)
      stock: [0, [
        Validators.required,        // Obligatorio
        Validators.min(0),          // Mínimo 0
        Validators.max(999999)      // Máximo 999,999 unidades
      ]]
    });
  }

  // ==========================================
  // 🔍 ACCESO A CONTROLES DEL FORMULARIO
  // ==========================================

  /**
   * 📋 GETTER PARA ACCEDER A LOS CONTROLES
   * Permite acceder fácilmente a los controles en el template:
   * f['nombre'], f['precio'], etc.
   */
  get f() {
    return this.productoForm.controls;
  }

  /**
   * ❌ VERIFICAR SI UN CONTROL TIENE ERROR
   * Comprueba si un campo tiene un error específico Y ha sido tocado.
   * 
   * @param controlName - Nombre del control (ej: 'nombre')
   * @param errorType - Tipo de error (ej: 'required', 'minlength')
   * @returns true si tiene ese error específico
   */
  hasError(controlName: string, errorType: string): boolean {
    const control = this.productoForm.get(controlName);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  /**
   * 📝 OBTENER MENSAJE DE ERROR PERSONALIZADO
   * Retorna un mensaje legible según el tipo de error.
   * 
   * @param controlName - Nombre del control
   * @returns Mensaje de error en español
   */
  getErrorMessage(controlName: string): string {
    const control = this.productoForm.get(controlName);

    // Si no hay control, errores, o no ha sido tocado, no mostrar nada
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    // Retornar mensaje según el tipo de error
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

  // ==========================================
  // 👤 OBTENER USUARIO ACTUAL
  // ==========================================

  /**
   * 🔐 SUSCRIBIRSE A CAMBIOS DEL USUARIO
   * Obtiene y actualiza los datos del usuario autenticado.
   */
  private obtenerUsuarioActual(): void {
    this.firebaseService.currentUser$.subscribe(user => {
      this.usuarioActual = user || null;

      if (this.usuarioActual) {
        // Calcular iniciales del nombre
        this.iniciales = this.usuarioActual.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase();
      }
    });
  }

  // ==========================================
  // 📝 MÉTODOS DEL MODAL DE PRODUCTOS
  // ==========================================

  /**
   * ➕ ABRIR MODAL PARA NUEVO PRODUCTO
   * Prepara el formulario vacío para crear un producto nuevo.
   */
  abrirModalNuevo(): void {
    this.editandoProducto.set(false);
    this.productoSeleccionado.set(null);

    // Resetear formulario con valores por defecto
    this.productoForm.reset({
      nombre: '',
      fecha: new Date().toISOString().split('T')[0],  // Fecha actual
      categoria: '',
      precio: 0,
      stock: 0
    });

    this.mostrarModal.set(true);
  }

  /**
   * ✏️ ABRIR MODAL PARA EDITAR PRODUCTO
   * Carga los datos del producto en el formulario.
   * 
   * @param producto - Producto a editar
   */
  abrirModalEditar(producto: Producto): void {
    this.editandoProducto.set(true);
    this.productoSeleccionado.set(producto);

    // Cargar datos del producto en el formulario
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
   * ❌ CERRAR MODAL
   * Cierra el modal y resetea el formulario.
   */
  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.productoForm.reset();
  }

  // ==========================================
  // 💾 GUARDAR PRODUCTO EN FIREBASE
  // ==========================================

  /**
   * 💾 GUARDAR PRODUCTO (crear o actualizar)
   * -----------------------------------------
   * FLUJO:
   * 1. Marcar todos los campos como "touched" para mostrar errores
   * 2. Validar el formulario completo
   * 3. Si es edición: actualizar en Firebase
   * 4. Si es nuevo: crear en Firebase
   * 5. Mostrar mensaje de resultado
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

    this.guardando.set(true);  // Mostrar spinner

    try {
      const formData = this.productoForm.value;

      if (this.editandoProducto() && this.productoSeleccionado()) {
        // ==========================================
        // MODO EDICIÓN
        // ==========================================
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
        // ==========================================
        // MODO CREACIÓN
        // ==========================================
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
      this.guardando.set(false);  // Quitar spinner
    }
  }

  // ==========================================
  // 🗑️ ELIMINAR PRODUCTO
  // ==========================================

  /**
   * 🗑️ MOSTRAR CONFIRMACIÓN DE ELIMINACIÓN
   * Guarda los datos y muestra el modal de confirmación.
   * 
   * @param id - ID del producto
   * @param nombre - Nombre (para mostrar en el modal)
   */
  eliminarProducto(id: number, nombre: string): void {
    this.productoAEliminar.set({ id, nombre });
    this.mostrarModalEliminar.set(true);
  }

  /**
   * ✅ CONFIRMAR ELIMINACIÓN
   * Elimina el producto de Firebase.
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
   * ❌ CANCELAR ELIMINACIÓN
   * Cierra el modal sin eliminar.
   */
  cancelarEliminacion(): void {
    this.mostrarModalEliminar.set(false);
    this.productoAEliminar.set(null);
  }

  // ==========================================
  // 🔧 MÉTODOS AUXILIARES
  // ==========================================

  /**
   * 📊 OBTENER ESTADO DEL STOCK
   * Retorna 'disponible', 'bajo' o 'agotado' según la cantidad.
   * 
   * @param stock - Cantidad en inventario
   * @returns Estado del stock
   */
  obtenerEstado(stock: number): EstadoStock {
    return this.productosService.obtenerEstado(stock);
  }

  /**
   * 🎨 OBTENER COLOR DE CATEGORÍA
   * Busca el color asignado a una categoría.
   * 
   * @param nombreCategoria - Nombre de la categoría
   * @returns Color en formato hexadecimal
   */
  obtenerColorCategoria(nombreCategoria: string): string {
    const categoria = this.categorias().find(c => c.nombre === nombreCategoria);
    return categoria ? categoria.color : '#6366f1';  // Índigo por defecto
  }

  /**
   * 📝 OBTENER TEXTO DE ESTADO
   * Retorna texto legible con emoji según el estado del stock.
   * 
   * @param stock - Cantidad en inventario
   * @returns Texto para mostrar (ej: "En Stock (50)")
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