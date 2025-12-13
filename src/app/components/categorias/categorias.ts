/* ============================================================================
   📂 COMPONENTE CATEGORÍAS
   ============================================================================
   
   📌 PROPÓSITO:
   Este componente maneja la gestión de categorías del inventario.
   Permite crear, editar (CRUD) y eliminar categorías para organizar los productos.
   
   🔧 FUNCIONALIDADES:
   - Ver lista de todas las categorías
   - Crear nuevas categorías con nombre y color
   - Editar categorías existentes
   - Eliminar categorías (solo si no tienen productos)
   - Ver cantidad de productos por categoría
   
   📁 Archivo: src/app/components/categorias/categorias.ts
   ============================================================================ */

// ==========================================
// 📦 IMPORTACIONES DE ANGULAR
// ==========================================
import { Component, inject, signal } from '@angular/core';
// Component: Decorador para crear un componente Angular
// inject: Función para inyectar servicios sin usar el constructor
// signal: Sistema de reactividad de Angular para manejar estados

import { CommonModule } from '@angular/common';
// CommonModule: Directivas comunes como *ngIf, *ngFor, etc.

import { FormsModule } from '@angular/forms';
// FormsModule: Para usar [(ngModel)] en formularios template-driven

// ==========================================
// 📦 IMPORTACIONES DE SERVICIOS
// ==========================================
import { CategoriasService } from '../../services/categorias.service';
// CategoriasService: Maneja todas las operaciones CRUD de categorías

import { ProductosService } from '../../services/productos.service';
// ProductosService: Se usa para verificar si una categoría tiene productos

import { NotificationService } from '../../services/notification.service';
// NotificationService: Muestra mensajes de éxito/error al usuario

import { FirebaseService } from '../../services/firebase.service';
// FirebaseService: Maneja autenticación y datos del usuario actual

// ==========================================
// 📦 IMPORTACIONES DE MODELOS Y COMPONENTES
// ==========================================
import { Categoria } from '../../models/categoria.model';
// Categoria: Interfaz que define la estructura de una categoría

import { Usuario } from '../../models/usuario.model';
// Usuario: Interfaz que define la estructura del usuario

import { AvatarModal } from '../shared/avatar-modal/avatar-modal';
// AvatarModal: Componente modal para cambiar foto de perfil

// ==========================================
// 🎨 CONFIGURACIÓN DEL COMPONENTE
// ==========================================
@Component({
  selector: 'app-categorias',  // Cómo se usa en HTML: <app-categorias></app-categorias>
  standalone: true,            // Componente independiente (no necesita NgModule)
  imports: [CommonModule, FormsModule, AvatarModal],  // Módulos/componentes que utiliza
  templateUrl: './categorias.html',  // Archivo HTML del componente
  styleUrl: './categorias.css'       // Archivo CSS del componente
})
export class Categorias {

  // ==========================================
  // 🔌 INYECCIÓN DE SERVICIOS
  // ==========================================
  // inject() es la forma moderna de inyectar servicios en Angular
  // Equivale a recibirlos en el constructor pero más limpio

  private categoriasService = inject(CategoriasService);
  // Servicio para todas las operaciones con categorías (agregar, editar, eliminar)

  private productosService = inject(ProductosService);
  // Servicio para verificar productos asociados a una categoría

  private notificationService = inject(NotificationService);
  // Servicio para mostrar notificaciones (toast) al usuario

  private firebaseService = inject(FirebaseService);
  // Servicio para obtener datos del usuario autenticado

  // ==========================================
  // 📊 PROPIEDADES DE DATOS
  // ==========================================

  categorias = this.categoriasService.categorias;
  // Signal que contiene la lista de todas las categorías
  // Se actualiza automáticamente cuando hay cambios en Firebase

  usuarioActual: Usuario | null = null;
  // Almacena los datos del usuario que está logueado

  iniciales = '';
  // Iniciales del nombre del usuario (ej: "Juan Pérez" -> "JP")
  // Se usan cuando no hay foto de perfil

  // ==========================================
  // 🎛️ ESTADOS DEL MODAL
  // ==========================================
  // Usamos signal() para crear estados reactivos
  // Cuando cambian, Angular actualiza la vista automáticamente

  mostrarModal = signal(false);
  // Controla si el modal de crear/editar está visible

  editandoCategoria = signal(false);
  // true = editando categoría existente
  // false = creando categoría nueva

  categoriaSeleccionada = signal<Categoria | null>(null);
  // Guarda la categoría que se está editando actualmente

  guardando = signal(false);
  // Estado de carga mientras se guarda en Firebase
  // Se usa para mostrar spinner y desactivar botones

  // ==========================================
  // 📝 DATOS DEL FORMULARIO
  // ==========================================

  formCategoria = signal({
    nombre: '',              // Nombre de la categoría
    color: '#6366f1'         // Color en formato hexadecimal (por defecto: índigo)
  });

  // ==========================================
  // 🗑️ MODAL DE CONFIRMACIÓN PARA ELIMINAR
  // ==========================================

  mostrarModalEliminar = signal(false);
  // Controla si el modal de confirmación está visible

  categoriaAEliminar = signal<{ id: number; nombre: string } | null>(null);
  // Guarda los datos de la categoría que se quiere eliminar

  // ==========================================
  // 👤 MODAL DE AVATAR
  // ==========================================

  mostrarModalAvatar = signal(false);
  // Controla si el modal de foto de perfil está visible

  // ==========================================
  // 🏗️ CONSTRUCTOR
  // ==========================================

  constructor() {
    // Al crear el componente, obtenemos los datos del usuario actual
    this.obtenerUsuarioActual();
  }

  // ==========================================
  // 🔐 MÉTODOS DE USUARIO
  // ==========================================

  /**
   * 👤 OBTENER USUARIO ACTUAL
   * --------------------------
   * Suscribe a los cambios del usuario autenticado.
   * Cuando el usuario cambia, actualiza los datos locales.
   * Calcula las iniciales del nombre para mostrar en el avatar.
   */
  private obtenerUsuarioActual(): void {
    // Suscribirse al Observable del usuario actual
    this.firebaseService.currentUser$.subscribe(user => {
      // Guardar el usuario (puede ser null si no hay sesión)
      this.usuarioActual = user || null;

      if (this.usuarioActual) {
        // Calcular iniciales: "Juan Pérez" -> ["Juan", "Pérez"] -> ["J", "P"] -> "JP"
        this.iniciales = this.usuarioActual.name
          .split(' ')           // Dividir por espacios
          .map(n => n[0])       // Tomar primera letra de cada palabra
          .join('')             // Unir las letras
          .toUpperCase();       // Convertir a mayúsculas
      }
    });
  }

  // ==========================================
  // 👤 MÉTODOS DEL MODAL DE AVATAR
  // ==========================================

  /**
   * 📷 ABRIR MODAL DE AVATAR
   * -------------------------
   * Muestra el modal para cambiar la foto de perfil.
   */
  abrirModalAvatar(): void {
    this.mostrarModalAvatar.set(true);
  }

  /**
   * ❌ CERRAR MODAL DE AVATAR
   * -------------------------
   * Oculta el modal de foto de perfil.
   */
  cerrarModalAvatar(): void {
    this.mostrarModalAvatar.set(false);
  }

  /**
   * 📸 CUANDO LA FOTO SE ACTUALIZA
   * -------------------------------
   * Callback que se ejecuta cuando el usuario cambia su foto.
   * La URL puede ser null si se elimina la foto.
   */
  onFotoActualizada(url: string | null): void {
    console.log('📸 Foto actualizada:', url);
  }

  // ==========================================
  // 📝 MÉTODOS DEL MODAL DE CATEGORÍAS
  // ==========================================

  /**
   * ➕ ABRIR MODAL PARA NUEVA CATEGORÍA
   * ------------------------------------
   * Prepara el modal para crear una categoría nueva.
   * Limpia todos los campos del formulario.
   */
  abrirModalNuevo(): void {
    this.editandoCategoria.set(false);       // No estamos editando
    this.categoriaSeleccionada.set(null);    // No hay categoría seleccionada
    this.limpiarFormulario();                // Limpiar campos
    this.mostrarModal.set(true);             // Mostrar modal
  }

  /**
   * ✏️ ABRIR MODAL PARA EDITAR CATEGORÍA
   * -------------------------------------
   * Prepara el modal para editar una categoría existente.
   * Carga los datos de la categoría en el formulario.
   * 
   * @param categoria - La categoría que se va a editar
   */
  abrirModalEditar(categoria: Categoria): void {
    this.editandoCategoria.set(true);                // Estamos en modo edición
    this.categoriaSeleccionada.set(categoria);       // Guardar categoría a editar
    this.formCategoria.set({
      nombre: categoria.nombre,                      // Cargar nombre actual
      color: categoria.color                         // Cargar color actual
    });
    this.mostrarModal.set(true);                     // Mostrar modal
  }

  /**
   * ❌ CERRAR MODAL
   * ----------------
   * Cierra el modal y limpia el formulario.
   */
  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.limpiarFormulario();
  }

  // ==========================================
  // 💾 GUARDAR CATEGORÍA EN FIREBASE
  // ==========================================

  /**
   * 💾 GUARDAR CATEGORÍA
   * ---------------------
   * Método async que guarda o actualiza una categoría en Firebase.
   * 
   * FLUJO:
   * 1. Validar que los campos estén completos
   * 2. Mostrar estado de carga (spinner)
   * 3. Si es edición: actualizar en Firebase
   * 4. Si es nuevo: verificar que no exista y crear en Firebase
   * 5. Mostrar mensaje de éxito/error
   * 6. Cerrar modal
   */
  async guardarCategoria(): Promise<void> {
    const form = this.formCategoria();

    // ==========================================
    // VALIDACIONES
    // ==========================================

    if (!form.nombre.trim()) {
      this.notificationService.error('El nombre de la categoría es requerido');
      return;  // Detener ejecución si no hay nombre
    }

    if (!form.color) {
      this.notificationService.error('Debes seleccionar un color');
      return;  // Detener ejecución si no hay color
    }

    // Mostrar estado de carga (activa spinner en botón)
    this.guardando.set(true);

    try {
      // ==========================================
      // MODO EDICIÓN
      // ==========================================
      if (this.editandoCategoria() && this.categoriaSeleccionada()) {
        // Llamar al servicio para actualizar en Firebase
        const actualizado = await this.categoriasService.actualizar(
          this.categoriaSeleccionada()!.id,  // ID de la categoría
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
        // ==========================================
        // MODO CREACIÓN
        // ==========================================

        // Verificar que no exista una categoría con el mismo nombre
        if (this.categoriasService.existe(form.nombre)) {
          this.notificationService.error('Esta categoría ya existe');
          this.guardando.set(false);
          return;
        }

        // Crear nueva categoría en Firebase
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
      // Capturar cualquier error inesperado
      console.error('❌ Error al guardar categoría:', error);
      this.notificationService.error('Error al guardar la categoría');
    } finally {
      // Siempre quitar el estado de carga al terminar
      this.guardando.set(false);
    }
  }

  // ==========================================
  // 🗑️ ELIMINAR CATEGORÍA
  // ==========================================

  /**
   * 🗑️ INICIAR ELIMINACIÓN (mostrar confirmación)
   * -----------------------------------------------
   * No elimina directamente, primero muestra un modal de confirmación.
   * Verifica que la categoría no tenga productos asociados.
   * 
   * @param id - ID de la categoría a eliminar
   * @param nombre - Nombre de la categoría (para mostrar en el modal)
   */
  eliminarCategoria(id: number, nombre: string): void {
    // Verificar si tiene productos asociados
    const productos = this.productosService.filtrarPorCategoria(nombre);

    if (productos.length > 0) {
      // No se puede eliminar si tiene productos
      this.notificationService.error(
        `No se puede eliminar. Esta categoría tiene ${productos.length} producto(s) asociado(s)`
      );
      return;
    }

    // Guardar datos para el modal de confirmación
    this.categoriaAEliminar.set({ id, nombre });
    this.mostrarModalEliminar.set(true);  // Mostrar modal
  }

  /**
   * ✅ CONFIRMAR ELIMINACIÓN
   * -------------------------
   * Se ejecuta cuando el usuario confirma que quiere eliminar.
   * Elimina la categoría de Firebase.
   */
  async confirmarEliminacion(): Promise<void> {
    const categoria = this.categoriaAEliminar();
    if (!categoria) return;  // Salir si no hay categoría seleccionada

    this.guardando.set(true);  // Mostrar estado de carga

    try {
      // Eliminar de Firebase
      const eliminado = await this.categoriasService.eliminar(categoria.id);

      if (eliminado) {
        this.notificationService.exito('Categoría eliminada exitosamente');
        this.mostrarModalEliminar.set(false);     // Cerrar modal
        this.categoriaAEliminar.set(null);         // Limpiar selección
      } else {
        this.notificationService.error('Error al eliminar la categoría');
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      this.notificationService.error('Error inesperado al eliminar');
    } finally {
      this.guardando.set(false);  // Quitar estado de carga
    }
  }

  /**
   * ❌ CANCELAR ELIMINACIÓN
   * ------------------------
   * Cierra el modal de confirmación sin eliminar.
   */
  cancelarEliminacion(): void {
    this.mostrarModalEliminar.set(false);
    this.categoriaAEliminar.set(null);
  }

  // ==========================================
  // 🔧 MÉTODOS AUXILIARES
  // ==========================================

  /**
   * 📊 OBTENER CANTIDAD DE PRODUCTOS
   * ---------------------------------
   * Cuenta cuántos productos hay en una categoría específica.
   * Se usa para mostrar el badge con el conteo en cada tarjeta.
   * 
   * @param nombre - Nombre de la categoría
   * @returns Número de productos en esa categoría
   */
  obtenerCantidadProductos(nombre: string): number {
    return this.productosService.filtrarPorCategoria(nombre).length;
  }

  /**
   * 🧹 LIMPIAR FORMULARIO
   * ----------------------
   * Reinicia los campos del formulario a sus valores por defecto.
   */
  private limpiarFormulario(): void {
    this.formCategoria.set({
      nombre: '',
      color: '#6366f1'  // Color por defecto: índigo
    });
  }

  /**
   * 👑 VERIFICAR SI ES ADMIN
   * -------------------------
   * Comprueba si el usuario actual tiene rol de administrador.
   * Se usa para mostrar/ocultar opciones según permisos.
   * 
   * @returns true si es admin, false si no
   */
  esAdmin(): boolean {
    return this.firebaseService.esAdmin();
  }

  /**
   * 📝 ACTUALIZAR CAMPO DEL FORMULARIO
   * ------------------------------------
   * Actualiza un campo específico del formulario.
   * Se llama desde el HTML cuando cambia un input.
   * 
   * @param campo - Nombre del campo ('nombre' o 'color')
   * @param valor - Nuevo valor del campo
   */
  actualizarForm(campo: string, valor: any): void {
    const form = this.formCategoria();
    (form as any)[campo] = valor;            // Actualizar el campo
    this.formCategoria.set({ ...form });     // Crear nueva referencia para actualizar
  }
}
