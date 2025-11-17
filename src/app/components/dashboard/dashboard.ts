import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Sidebar } from '../shared/sidebar/sidebar';
import { ToastComponent } from '../shared/toast/toast.component';
import { AuthService } from '../../services/auth';
import { ProductosService } from '../../services/productos';
import { CategoriasService } from '../../services/categorias';
import { ToastService } from '../../services/toast.service';
import { Estadisticas } from '../../models/estadisticas';
import { Producto } from '../../models/producto';
import { Usuario } from '../../models/usuario';
import { Categoria } from '../../models/categoria';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Sidebar, ToastComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('chartPie') chartPieRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartBar') chartBarRef!: ElementRef<HTMLCanvasElement>;

  estadisticas: Estadisticas = {
    totalProductos: 0,
    productosActivos: 0,
    productosInactivos: 0,
    stockBajo: 0,
    valorInventario: 0
  };

  usuarioActual: Usuario | null = null;
  chartPie: Chart | null = null;
  chartBar: Chart | null = null;

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

    this.usuarioActual = this.authService.getCurrentUser();
    this.cargarEstadisticas();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.crearGraficas();
    }, 100);
  }

  cargarEstadisticas(): void {
    this.estadisticas = this.productosService.obtenerEstadisticas();
  }

  crearGraficas(): void {
    const productos = this.productosService.obtenerProductos();
    const categorias = this.categoriasService.obtenerCategorias();

    // Contar productos por categoría
    const datosPorCategoria: { [key: string]: number } = {};
    const coloresPorCategoria: { [key: string]: string } = {};

    categorias.forEach(cat => {
      datosPorCategoria[cat.nombre] = 0;
      coloresPorCategoria[cat.nombre] = cat.color;
    });

    productos.forEach(prod => {
      if (datosPorCategoria[prod.categoria] !== undefined) {
        datosPorCategoria[prod.categoria]++;
      } else {
        datosPorCategoria[prod.categoria] = 1;
        coloresPorCategoria[prod.categoria] = '#6366f1';
      }
    });

    const labels = Object.keys(datosPorCategoria);
    const data = Object.values(datosPorCategoria);
    const colores = labels.map(label => coloresPorCategoria[label] || '#6366f1');

    // Gráfica Circular (Pie)
    if (this.chartPieRef) {
      const ctxPie = this.chartPieRef.nativeElement.getContext('2d');
      if (ctxPie) {
        this.chartPie = new Chart(ctxPie, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colores,
              borderColor: '#1e293b',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#f1f5f9',
                  padding: 15,
                  font: { size: 12 }
                }
              },
              title: {
                display: false
              }
            }
          }
        });
      }
    }

    // Gráfica de Barras (Stock por producto)
    const productosConStock = productos
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10);

    const labelsStock = productosConStock.map(p => p.nombre);
    const dataStock = productosConStock.map(p => p.stock);
    const coloresStock = productosConStock.map(p => {
      const cat = categorias.find(c => c.nombre === p.categoria);
      return cat ? cat.color : '#6366f1';
    });

    if (this.chartBarRef) {
      const ctxBar = this.chartBarRef.nativeElement.getContext('2d');
      if (ctxBar) {
        this.chartBar = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: labelsStock,
            datasets: [{
              label: 'Stock',
              data: dataStock,
              backgroundColor: coloresStock,
              borderColor: coloresStock,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: {
                beginAtZero: true,
                ticks: { 
                  color: '#94a3b8',
                  stepSize: 1 
                },
                grid: { color: '#334155' }
              },
              y: {
                ticks: { color: '#94a3b8' },
                grid: { color: '#334155' }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
    }
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  obtenerIniciales(): string {
    if (!this.usuarioActual) return 'U';
    return this.usuarioActual.nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  esAdmin(): boolean {
    return this.authService.isAdmin();
  }
}