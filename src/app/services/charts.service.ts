/* ===================================
   SERVICIO DE GRÁFICAS
   Archivo: src/app/services/charts.service.ts
   =================================== */

import { Injectable } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Producto } from '../models/producto';
import { Categoria } from '../models/categoria';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  constructor() {}

  /**
   * Obtener configuración para gráfica de categorías (Doughnut)
   */
  obtenerGraficaCategorias(
    productos: Producto[],
    categorias: Categoria[]
  ): ChartConfiguration<'doughnut'> {
    // Calcular stock por categoría
    const categoryData = categorias.map(c => {
      const productsInCategory = productos.filter(p => p.categoria === c.nombre);
      return productsInCategory.reduce((sum, p) => sum + p.stock, 0);
    });

    return {
      type: 'doughnut',
      data: {
        labels: categorias.map(c => c.nombre),
        datasets: [
          {
            data: categoryData,
            backgroundColor: categorias.map(c => c.color),
            borderWidth: 3,
            borderColor: '#1e293b'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                const percentage = (((context.parsed as number) / total) * 100).toFixed(
                  1
                );
                return `${context.label}: ${context.parsed} unidades (${percentage}%)`;
              }
            }
          }
        }
      }
    };
  }

  /**
   * Obtener configuración para gráfica de top stock (Bar)
   */
  obtenerGraficaTopStock(
    productos: Producto[],
    categorias: Categoria[]
  ): ChartConfiguration<'bar'> {
    const sortedProducts = [...productos]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);

    // Obtener colores según la categoría de cada producto
    const colors = sortedProducts.map(p => {
      const categoria = categorias.find(c => c.nombre === p.categoria);
      return categoria ? categoria.color : '#6366f1';
    });

    return {
      type: 'bar',
      data: {
        labels: sortedProducts.map(p => p.nombre),
        datasets: [
          {
            label: 'Stock',
            data: sortedProducts.map(p => p.stock),
            backgroundColor: colors,
            borderRadius: 8,
            hoverBackgroundColor: colors.map(c => c + 'dd')
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const product = sortedProducts[context.dataIndex];
                return [
                  `Stock: ${context.parsed.y} unidades`,
                  `Categoría: ${product.categoria}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#334155'
            },
            ticks: {
              color: '#94a3b8',
              font: { size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { size: 11 },
              maxRotation: 45,
              minRotation: 0
            }
          }
        }
      }
    };
  }

  /**
   * Obtener configuración para gráfica de valor por categoría (Bar)
   */
  obtenerGraficaValorCategoria(
    productos: Producto[],
    categorias: Categoria[]
  ): ChartConfiguration<'bar'> {
    const categoryValues = categorias.map(c => {
      const productsInCategory = productos.filter(p => p.categoria === c.nombre);
      return productsInCategory.reduce((sum, p) => sum + p.precio * p.stock, 0);
    });

    return {
      type: 'bar',
      data: {
        labels: categorias.map(c => c.nombre),
        datasets: [
          {
            label: 'Valor (S/)',
            data: categoryValues,
            backgroundColor: categorias.map(c => c.color),
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8'
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                return `S/ ${(context.parsed.y as number).toLocaleString('es-PE', {
                  minimumFractionDigits: 2
                })}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#334155'
            },
            ticks: {
              color: '#94a3b8',
              callback: (value) => {
                return `S/ ${value}`;
              }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#94a3b8'
            }
          }
        }
      }
    };
  }
}