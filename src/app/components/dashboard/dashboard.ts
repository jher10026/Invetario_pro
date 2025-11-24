/* ===================================
   COMPONENTE DASHBOARD
   Archivo: src/app/components/dashboard/dashboard.component.ts
   =================================== */

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { ProductosService } from '../../services/productos';
import { CategoriasService } from '../../services/categorias';
import { Usuario } from '../../models/usuario';

export interface Estadistica {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private authService = inject(AuthService);
  private productosService = inject(ProductosService);
  private categoriasService = inject(CategoriasService);

  usuarioActual: Usuario | null = null;
  iniciales = '';

  // Acceso a los datos desde los servicios
  productos = this.productosService.productos;
  categorias = this.categoriasService.categorias;

  // Computed para estadísticas
  estadisticas = computed(() => {
    const totalProductos = this.productos().length;
    const valorTotal = this.productosService.obtenerValorTotal();
    const alertasStock = this.productosService.obtenerStockBajo().length;
    const totalCategorias = this.categorias().length;

    return [
      {
        titulo: 'Productos',
        valor: totalProductos,
        icono: '📦',
        color: 'blue'
      },
      {
        titulo: 'Valor Total',
        valor: `S/ ${valorTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
        icono: '💰',
        color: 'green'
      },
      {
        titulo: 'Categorías',
        valor: totalCategorias,
        icono: '🏷️',
        color: 'purple'
      },
      {
        titulo: 'Alertas',
        valor: alertasStock,
        icono: '⚠️',
        color: 'red'
      }
    ] as Estadistica[];
  });

  // Computed para gráfica de categorías
  datosGraficaCategorias = computed(() => {
    return this.categorias().map(c => {
      const productsInCategory = this.productos().filter(p => p.categoria === c.nombre);
      const stock = productsInCategory.reduce((sum, p) => sum + p.stock, 0);
      const total = this.productos().reduce((sum, p) => sum + p.stock, 0);
      const porcentaje = total > 0 ? (stock / total) * 100 : 0;
      return {
        nombre: c.nombre,
        stock,
        porcentaje,
        color: c.color
      };
    }).filter(d => d.stock > 0);
  });

  // Computed para top 5 productos por stock
  topProductos = computed(() => {
    return [...this.productos()]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);
  });

  // Computed para valor por categoría
  datosValorCategoria = computed(() => {
    const datos = this.categorias().map(c => {
      const productsInCategory = this.productos().filter(p => p.categoria === c.nombre);
      const valor = productsInCategory.reduce((sum, p) => sum + p.precio * p.stock, 0);
      return {
        nombre: c.nombre,
        valor,
        color: c.color
      };
    }).filter(d => d.valor > 0);

    const maxValor = Math.max(...datos.map(d => d.valor), 1);
    return datos.map(d => ({
      ...d,
      porcentaje: (d.valor / maxValor) * 100
    }));
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
   * Obtener clase de color para estadísticas
   */
  obtenerClaseColor(color: string): string {
    return `stat-icon-${color}`;
  }

  /**
   * Obtener estado del producto
   */
  obtenerEstado(stock: number): string {
    const estado = this.productosService.obtenerEstado(stock);
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
   * Obtener productos con stock bajo
   */
  obtenerStockBajo() {
    return this.productosService.obtenerStockBajo();
  }

  /**
   * Obtener color de categoría
   */
  obtenerColorCategoria(nombreCategoria: string): string {
    const categoria = this.categorias().find(c => c.nombre === nombreCategoria);
    return categoria ? categoria.color : '#6366f1';
  }
}