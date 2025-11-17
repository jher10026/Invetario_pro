import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Sidebar } from '../shared/sidebar/sidebar';
import { ToastComponent } from '../shared/toast/toast.component';
import { AuthService } from '../../services/auth';
import { CategoriasService } from '../../services/categorias';
import { ProductosService } from '../../services/productos';
import { ToastService } from '../../services/toast.service';
import { Categoria } from '../../models/categoria';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, ToastComponent],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias implements OnInit {
  categorias: Categoria[] = [];
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  categoriaSeleccionada: Categoria | null = null;

  formulario = {
    nombre: '',
    icono: '',
    color: '#4f46e5'
  };

  constructor(
    private authService: AuthService,
    private categoriasService: CategoriasService,
    private productosService: ProductosService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categorias = this.categoriasService.obtenerCategorias();
    this.actualizarConteoProductos();
  }

  actualizarConteoProductos(): void {
    const productos = this.productosService.obtenerProductos();
    this.categorias.forEach(categoria => {
      const cantidad = productos.filter(p => p.categoria === categoria.nombre).length;
      this.categoriasService.actualizarCantidadProductos(categoria.nombre, cantidad);
    });
    this.categorias = this.categoriasService.obtenerCategorias();
  }

  abrirModalAgregar(): void {
    if (!this.esAdmin()) {
      this.toastService.error('No tienes permisos para agregar categorías');
      return;
    }
    this.modoEdicion = false;
    this.categoriaSeleccionada = null;
    this.limpiarFormulario();
    this.mostrarModal = true;
  }

  abrirModalEditar(categoria: Categoria): void {
    if (!this.esAdmin()) {
      this.toastService.error('No tienes permisos para editar categorías');
      return;
    }
    this.modoEdicion = true;
    this.categoriaSeleccionada = categoria;
    this.formulario = {
      nombre: categoria.nombre,
      icono: categoria.icono,
      color: categoria.color
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  guardarCategoria(): void {
    if (!this.validarFormulario()) {
      this.toastService.error('Por favor completa todos los campos correctamente');
      return;
    }

    if (this.modoEdicion && this.categoriaSeleccionada) {
      const nombreAnterior = this.categoriaSeleccionada.nombre;
      this.categoriasService.actualizarCategoria(this.categoriaSeleccionada.id, this.formulario);

      if (nombreAnterior !== this.formulario.nombre) {
        this.actualizarProductosConNuevoNombre(nombreAnterior, this.formulario.nombre);
      }

      this.toastService.success('✅ Categoría actualizada correctamente');
    } else {
      this.categoriasService.crearCategoria(this.formulario);
      this.toastService.success('✅ Categoría creada correctamente');
    }

    this.cerrarModal();
    this.cargarCategorias();
  }

  actualizarProductosConNuevoNombre(nombreAnterior: string, nombreNuevo: string): void {
    const productos = this.productosService.obtenerProductos();
    productos.forEach(producto => {
      if (producto.categoria === nombreAnterior) {
        this.productosService.actualizarProducto(producto.id, { categoria: nombreNuevo });
      }
    });
  }

  eliminarCategoria(categoria: Categoria): void {
    if (!this.esAdmin()) {
      this.toastService.error('No tienes permisos para eliminar categorías');
      return;
    }

    const mensaje = categoria.cantidadProductos > 0
      ? `Esta categoría tiene ${categoria.cantidadProductos} producto(s). Si la eliminas, los productos quedarán sin categoría. ¿Deseas continuar?`
      : `¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`;

    if (confirm(mensaje)) {
      if (categoria.cantidadProductos > 0) {
        const productos = this.productosService.obtenerProductos();
        productos.forEach(producto => {
          if (producto.categoria === categoria.nombre) {
            this.productosService.actualizarProducto(producto.id, { categoria: 'Sin categoría' });
          }
        });
      }

      this.categoriasService.eliminarCategoria(categoria.id);
      this.toastService.success('🗑️ Categoría eliminada correctamente');
      this.cargarCategorias();
    }
  }

  validarFormulario(): boolean {
    return (
      this.formulario.nombre.trim() !== '' &&
      this.formulario.color.trim() !== ''
    );
  }

  limpiarFormulario(): void {
    this.formulario = {
      nombre: '',
      icono: '',
      color: '#4f46e5'
    };
  }

  obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map(palabra => palabra[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  esAdmin(): boolean {
    return this.authService.isAdmin();
  }

  obtenerInicialesUsuario(): string {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) return 'U';
    return usuario.nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}