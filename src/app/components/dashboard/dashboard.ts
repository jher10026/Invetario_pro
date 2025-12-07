/* ===================================
   COMPONENTE DASHBOARD - FASE 3
   Archivo: src/app/components/dashboard/dashboard.ts
   
   ✅ Actualizado para Firestore
   =================================== */

import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { ProductosService } from '../../services/productos.service';
import { CategoriasService } from '../../services/categorias.service';
import { Usuario } from '../../models/usuario.model';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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
@ViewChild('chartCategorias') chartCategorias!: ElementRef<HTMLCanvasElement>;
@ViewChild('chartCircular') chartCircular!: ElementRef<HTMLCanvasElement>;

  private chartBarras?: Chart;
  private chartPie?: Chart;
  private firebaseService = inject(FirebaseService);
  private productosService = inject(ProductosService);
  private categoriasService = inject(CategoriasService);

  usuarioActual: Usuario | null = null;
  iniciales = '';

  // Acceso a los datos desde los servicios
  productos = this.productosService.productos;
  categorias = this.categoriasService.categorias;
  cargando = this.productosService.cargando;

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
  
  // 🔄 Efecto para recrear gráficas cuando cambien los datos
  effect(() => {
    // Observar cambios en productos y categorías
    const prods = this.productos();
    const cats = this.categorias();
    
    // Recrear gráficas si hay datos y las vistas están listas
    if (prods.length > 0 && cats.length > 0) {
      setTimeout(() => {
        this.crearGraficas();
      }, 100);
    }
  });
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
  ngAfterViewInit(): void {
  // Esperar un momento para que el DOM esté listo
  setTimeout(() => {
    this.crearGraficas();
  }, 100);
}

ngOnDestroy(): void {
  this.chartBarras?.destroy();
  this.chartPie?.destroy();
}

/**
 * Crear gráficas con Chart.js
 */
private crearGraficas(): void {
  this.crearGraficaBarras();
  this.crearGraficaCircular();
}

/**
 * Crear gráfica de barras
 */
private crearGraficaBarras(): void {
  const datos = this.datosGraficaCategorias();
  
  if (datos.length === 0 || !this.chartCategorias) return;

  // Destruir gráfica anterior si existe
  this.chartBarras?.destroy();

  const ctx = this.chartCategorias.nativeElement.getContext('2d');
  if (!ctx) return;

  this.chartBarras = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: datos.map(d => d.nombre),
      datasets: [{
        label: 'Stock por Categoría',
        data: datos.map(d => d.stock),
        backgroundColor: datos.map(d => d.color),
        borderColor: datos.map(d => d.color),
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#4f46e5',
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              return `Stock: ${context.parsed.y} unidades`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Crear gráfica circular (pie)
 */
private crearGraficaCircular(): void {
  const datos = this.datosValorCategoria();
  
  if (datos.length === 0 || !this.chartCircular) return;

  // Destruir gráfica anterior si existe
  this.chartPie?.destroy();

  const ctx = this.chartCircular.nativeElement.getContext('2d');
  if (!ctx) return;

  this.chartPie = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: datos.map(d => d.nombre),
      datasets: [{
        data: datos.map(d => d.valor),
        backgroundColor: datos.map(d => d.color),
        borderColor: '#fff',
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#4f46e5',
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const valor = context.parsed as number;
              return `${context.label}: S/ ${valor.toLocaleString('es-PE', {minimumFractionDigits: 2})}`;
            }
          }
        }
      }
    }
  });
}
}