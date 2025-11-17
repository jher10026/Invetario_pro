import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Sidebar } from '../shared/sidebar/sidebar';
import { ToastComponent } from '../shared/toast/toast.component';
import { AuthService } from '../../services/auth';
import { ProductosService } from '../../services/productos';
import { CategoriasService } from '../../services/categorias';
import { ToastService } from '../../services/toast.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, ToastComponent],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  // Filtros
  busqueda: string = '';
  categoriaFiltro: string = '';
  estadoFiltro: string = '';
  ordenamiento: string = 'recent';

  // Modal
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  productoSeleccionado: Producto | null = null;

  // Formulario
  formulario = {
    nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    precio: 0,
    stock: 0,
    stockMinimo: 5,
    estado: 'activo' as 'activo' | 'inactivo'
  };

  categorias: string[] = [];

  constructor(
    private authService: AuthService,
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos(): void {
    this.productos = this.productosService.obtenerProductos();
    this.aplicarFiltros();
  }

  cargarCategorias(): void {
    this.categorias = this.categoriasService.obtenerNombresCategorias();
  }

  aplicarFiltros(): void {
    let resultado = [...this.productos];

    // Filtro de búsqueda
    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.categoria.toLowerCase().includes(termino)
      );
    }

    // Filtro de categoría
    if (this.categoriaFiltro) {
      resultado = resultado.filter(p => p.categoria === this.categoriaFiltro);
    }

    // Filtro de estado (stock)
    if (this.estadoFiltro) {
      if (this.estadoFiltro === 'disponible') {
        resultado = resultado.filter(p => p.stock > p.stockMinimo);
      } else if (this.estadoFiltro === 'bajo') {
        resultado = resultado.filter(p => p.stock <= p.stockMinimo && p.stock > 0);
      } else if (this.estadoFiltro === 'agotado') {
        resultado = resultado.filter(p => p.stock === 0);
      }
    }

    // Ordenamiento
    if (this.ordenamiento === 'recent') {
      resultado.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
    } else if (this.ordenamiento === 'oldest') {
      resultado.sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime());
    } else if (this.ordenamiento === 'name') {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (this.ordenamiento === 'price') {
      resultado.sort((a, b) => b.precio - a.precio);
    }

    this.productosFiltrados = resultado;
  }

  abrirModalAgregar(): void {
    if (!this.esAdmin()) {
      this.toastService.error('No tienes permisos para agregar productos');
      return;
    }
    this.modoEdicion = false;
    this.productoSeleccionado = null;
    this.limpiarFormulario();
    this.mostrarModal = true;
  }

  abrirModalEditar(producto: Producto): void {
    if (!this.esAdmin()) {
      this.toastService.error('No tienes permisos para editar productos');
      return;
    }
    this.modoEdicion = true;
    this.productoSeleccionado = producto;
    this.formulario = {
      nombre: producto.nombre,
      fecha: new Date(producto.fechaCreacion).toISOString().split('T')[0],
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      stockMinimo: producto.stockMinimo,
      estado: producto.estado
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  guardarProducto(): void {
    if (!this.validarFormulario()) {
      this.toastService.error('Por favor completa todos los campos correctamente');
      return;
    }

    if (this.modoEdicion && this.productoSeleccionado) {
      this.productosService.actualizarProducto(this.productoSeleccionado.id, {
        nombre: this.formulario.nombre,
        descripcion: `Fecha de registro: ${this.formulario.fecha}`,
        categoria: this.formulario.categoria,
        precio: this.formulario.precio,
        stock: this.formulario.stock,
        stockMinimo: this.formulario.stockMinimo,
        estado: this.formulario.estado
      });
      this.toastService.success('✅ Producto actualizado correctamente');
    } else {
      this.productosService.crearProducto({
        nombre: this.formulario.nombre,
        descripcion: `Fecha de registro: ${this.formulario.fecha}`,
        categoria: this.formulario.categoria,
        precio: this.formulario.precio,
        stock: this.formulario.stock,
        stockMinimo: this.formulario.stockMinimo,
        estado: this.formulario.estado
      });
      this.toastService.success('✅ Producto creado correctamente');
    }

    this.cerrarModal();
    this.cargarProductos();
  }

  eliminarProducto(producto: Producto): void {
    if (!this.esAdmin()) {
      this.toastService.error('No tienes permisos para eliminar productos');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
      this.productosService.eliminarProducto(producto.id);
      this.toastService.success('🗑️ Producto eliminado correctamente');
      this.cargarProductos();
    }
  }

  validarFormulario(): boolean {
    return (
      this.formulario.nombre.trim() !== '' &&
      this.formulario.categoria !== '' &&
      this.formulario.precio > 0 &&
      this.formulario.stock >= 0 &&
      this.formulario.stockMinimo > 0
    );
  }

  limpiarFormulario(): void {
    this.formulario = {
      nombre: '',
      fecha: new Date().toISOString().split('T')[0],
      categoria: '',
      precio: 0,
      stock: 0,
      stockMinimo: 5,
      estado: 'activo'
    };
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getEstadoStock(producto: Producto): string {
    if (producto.stock === 0) return 'Agotado';
    if (producto.stock <= producto.stockMinimo) return 'Stock Bajo';
    return 'En Stock';
  }

  getClaseEstado(producto: Producto): string {
    if (producto.stock === 0) return 'badge inactive';
    if (producto.stock <= producto.stockMinimo) return 'badge low-stock';
    return 'badge active';
  }

  esAdmin(): boolean {
    return this.authService.isAdmin();
  }

  obtenerIniciales(): string {
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