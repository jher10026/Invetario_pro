/* ============================================================================
   📊 COMPONENTE DASHBOARD
   ============================================================================
   
   📌 PROPÓSITO:
   Es la página principal después del login. Muestra un resumen visual del
   inventario con estadísticas, gráficas y alertas importantes.
   
   🔧 FUNCIONALIDADES:
   - Mostrar estadísticas generales (productos, valor total, categorías, alertas)
   - Gráfica de barras con stock por categoría
   - Gráfica circular (pie) con valor por categoría
   - Lista de productos con stock bajo (alertas)
   - Top 5 productos con mayor stock
   
   📁 Archivo: src/app/components/dashboard/dashboard.ts
   ============================================================================ */

// ==========================================
// 📦 IMPORTACIONES DE ANGULAR
// ==========================================
import { Component, inject, computed, effect, signal } from '@angular/core';
// Component: Decorador para crear componentes
// inject: Inyección de dependencias
// computed: Valores calculados reactivos
// effect: Ejecutar código cuando cambian signals
// signal: Estado reactivo

import { CommonModule } from '@angular/common';
// CommonModule: Directivas comunes (*ngIf, *ngFor, pipes)

import { FirebaseService } from '../../services/firebase.service';
// FirebaseService: Autenticación y datos del usuario

import { ProductosService } from '../../services/productos.service';
// ProductosService: Datos y operaciones de productos

import { CategoriasService } from '../../services/categorias.service';
// CategoriasService: Datos de categorías

import { Usuario } from '../../models/usuario.model';
// Usuario: Interfaz del usuario

import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
// ViewChild: Acceder a elementos del DOM desde el TypeScript
// ElementRef: Referencia a un elemento del DOM
// AfterViewInit: Hook del ciclo de vida (después de inicializar la vista)

import { Chart, registerables } from 'chart.js';
// Chart: Librería para crear gráficas
// registerables: Registrar todos los componentes de Chart.js

import { AvatarModal } from '../shared/avatar-modal/avatar-modal';
// AvatarModal: Modal para cambiar foto de perfil

// Registrar todos los componentes de Chart.js (líneas, barras, pie, etc.)
Chart.register(...registerables);

// ==========================================
// 📊 INTERFAZ PARA ESTADÍSTICAS
// ==========================================
/**
 * Define la estructura de una tarjeta de estadística.
 * Se usa para las 4 tarjetas principales del dashboard.
 */
export interface Estadistica {
  titulo: string;      // Título de la estadística (ej: "Productos")
  valor: string | number;  // Valor a mostrar (ej: 150 o "S/ 1,500.00")
  icono: string;       // Emoji del icono (ej: "📦")
  color: string;       // Color de la tarjeta (ej: "blue", "green")
}

// ==========================================
// 🎨 CONFIGURACIÓN DEL COMPONENTE
// ==========================================
@Component({
  selector: 'app-dashboard',   // Se usa como: <app-dashboard></app-dashboard>
  standalone: true,
  imports: [CommonModule, AvatarModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  // ==========================================
  // 📍 REFERENCIAS A ELEMENTOS DEL DOM
  // ==========================================
  // ViewChild permite acceder a elementos del HTML desde TypeScript
  // Se usan para obtener el canvas donde se dibujarán las gráficas

  @ViewChild('chartCategorias') chartCategorias!: ElementRef<HTMLCanvasElement>;
  // Referencia al canvas de la gráfica de barras

  @ViewChild('chartCircular') chartCircular!: ElementRef<HTMLCanvasElement>;
  // Referencia al canvas de la gráfica circular (pie)

  // ==========================================
  // 📈 INSTANCIAS DE LAS GRÁFICAS
  // ==========================================

  private chartBarras?: Chart;
  // Instancia de la gráfica de barras (stock por categoría)

  private chartPie?: Chart;
  // Instancia de la gráfica circular (valor por categoría)

  // ==========================================
  // 🔌 INYECCIÓN DE SERVICIOS
  // ==========================================

  private firebaseService = inject(FirebaseService);
  // Para obtener datos del usuario autenticado

  private productosService = inject(ProductosService);
  // Para obtener datos de productos

  private categoriasService = inject(CategoriasService);
  // Para obtener datos de categorías

  // ==========================================
  // 👤 DATOS DEL USUARIO
  // ==========================================

  usuarioActual: Usuario | null = null;
  // Datos del usuario logueado

  iniciales = '';
  // Iniciales para el avatar (ej: "JP" para Juan Pérez)

  // Modal de avatar
  mostrarModalAvatar = signal(false);
  // Controla visibilidad del modal de foto de perfil

  // ==========================================
  // 📊 ACCESO A DATOS DE SERVICIOS
  // ==========================================
  // Exponemos los signals de los servicios para usar en el template

  productos = this.productosService.productos;
  // Lista de todos los productos

  categorias = this.categoriasService.categorias;
  // Lista de todas las categorías

  cargando = this.productosService.cargando;
  // Estado de carga

  // ==========================================
  // 📈 ESTADÍSTICAS (computed)
  // ==========================================
  /**
   * Computed que calcula las 4 estadísticas principales.
   * Se recalcula automáticamente cuando cambian productos o categorías.
   * 
   * Retorna un array con:
   * 1. Total de productos
   * 2. Valor total del inventario
   * 3. Número de categorías
   * 4. Alertas (productos con stock bajo)
   */
  estadisticas = computed(() => {
    // Calcular valores
    const totalProductos = this.productos().length;
    const valorTotal = this.productosService.obtenerValorTotal();
    const alertasStock = this.productosService.obtenerStockBajo().length;
    const totalCategorias = this.categorias().length;

    // Retornar array de estadísticas
    return [
      {
        titulo: 'Productos',
        valor: totalProductos,
        icono: '📦',
        color: 'blue'
      },
      {
        titulo: 'Valor Total',
        // Formatear como moneda peruana
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

  // ==========================================
  // 📊 DATOS PARA GRÁFICA DE BARRAS (computed)
  // ==========================================
  /**
   * Calcula los datos para la gráfica de barras.
   * Agrupa el stock total por cada categoría.
   */
  datosGraficaCategorias = computed(() => {
    return this.categorias().map(c => {
      // Filtrar productos de esta categoría
      const productsInCategory = this.productos().filter(p => p.categoria === c.nombre);

      // Sumar stock total de la categoría
      const stock = productsInCategory.reduce((sum, p) => sum + p.stock, 0);

      // Calcular porcentaje del total
      const total = this.productos().reduce((sum, p) => sum + p.stock, 0);
      const porcentaje = total > 0 ? (stock / total) * 100 : 0;

      return {
        nombre: c.nombre,
        stock,
        porcentaje,
        color: c.color
      };
    }).filter(d => d.stock > 0);  // Solo mostrar categorías con productos
  });

  // ==========================================
  // 🏆 TOP 5 PRODUCTOS (computed)
  // ==========================================
  /**
   * Obtiene los 5 productos con mayor stock.
   * Útil para ver qué productos tienen más inventario.
   */
  topProductos = computed(() => {
    return [...this.productos()]
      .sort((a, b) => b.stock - a.stock)  // Ordenar por stock (mayor a menor)
      .slice(0, 5);                        // Tomar solo los primeros 5
  });

  // ==========================================
  // 💰 DATOS PARA GRÁFICA CIRCULAR (computed)
  // ==========================================
  /**
   * Calcula el valor monetario por categoría para la gráfica pie.
   * Valor = precio × stock de cada producto.
   */
  datosValorCategoria = computed(() => {
    const datos = this.categorias().map(c => {
      // Filtrar productos de esta categoría
      const productsInCategory = this.productos().filter(p => p.categoria === c.nombre);

      // Calcular valor total (precio × stock)
      const valor = productsInCategory.reduce((sum, p) => sum + p.precio * p.stock, 0);

      return {
        nombre: c.nombre,
        valor,
        color: c.color
      };
    }).filter(d => d.valor > 0);  // Solo categorías con valor

    // Calcular porcentaje para barras de progreso
    const maxValor = Math.max(...datos.map(d => d.valor), 1);
    return datos.map(d => ({
      ...d,
      porcentaje: (d.valor / maxValor) * 100
    }));
  });

  // ==========================================
  // 🏗️ CONSTRUCTOR
  // ==========================================

  constructor() {
    // Obtener datos del usuario logueado
    this.obtenerUsuarioActual();

    /**
     * 🔄 EFFECT PARA ACTUALIZAR GRÁFICAS
     * -----------------------------------
     * effect() ejecuta código automáticamente cuando cambian
     * las dependencias (en este caso, productos y categorías).
     * 
     * Cuando llegan nuevos datos de Firebase, las gráficas
     * se recrean automáticamente.
     */
    effect(() => {
      // Observar cambios en productos y categorías
      const prods = this.productos();
      const cats = this.categorias();

      // Recrear gráficas solo si hay datos
      if (prods.length > 0 && cats.length > 0) {
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
          this.crearGraficas();
        }, 100);
      }
    });
  }

  // ==========================================
  // 👤 MÉTODOS DEL USUARIO
  // ==========================================

  /**
   * 🔐 OBTENER USUARIO ACTUAL
   * Suscribe a cambios del usuario y calcula iniciales.
   */
  private obtenerUsuarioActual(): void {
    this.firebaseService.currentUser$.subscribe(user => {
      this.usuarioActual = user || null;

      if (this.usuarioActual) {
        // Calcular iniciales: "Juan Pérez" → "JP"
        this.iniciales = this.usuarioActual.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase();
      }
    });
  }

  // ==========================================
  // 👤 MÉTODOS DEL MODAL DE AVATAR
  // ==========================================

  /**
   * 📷 ABRIR MODAL DE AVATAR
   */
  abrirModalAvatar(): void {
    this.mostrarModalAvatar.set(true);
  }

  /**
   * ❌ CERRAR MODAL DE AVATAR
   */
  cerrarModalAvatar(): void {
    this.mostrarModalAvatar.set(false);
  }

  /**
   * 📸 CUANDO LA FOTO SE ACTUALIZA
   * El usuario se actualiza automáticamente via el BehaviorSubject
   */
  onFotoActualizada(url: string | null): void {
    console.log('📸 Foto actualizada:', url);
  }

  // ==========================================
  // 🔧 MÉTODOS AUXILIARES
  // ==========================================

  /**
   * 🎨 OBTENER CLASE DE COLOR
   * Retorna la clase CSS según el color de la estadística.
   */
  obtenerClaseColor(color: string): string {
    return `stat-icon-${color}`;
  }

  /**
   * 📊 OBTENER ESTADO DEL PRODUCTO
   * Retorna texto legible del estado del stock.
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
   * ⚠️ OBTENER PRODUCTOS CON STOCK BAJO
   * Lista de productos que necesitan reabastecimiento.
   */
  obtenerStockBajo() {
    return this.productosService.obtenerStockBajo();
  }

  /**
   * 🎨 OBTENER COLOR DE CATEGORÍA
   */
  obtenerColorCategoria(nombreCategoria: string): string {
    const categoria = this.categorias().find(c => c.nombre === nombreCategoria);
    return categoria ? categoria.color : '#6366f1';
  }

  // ==========================================
  // 🔄 CICLO DE VIDA DEL COMPONENTE
  // ==========================================

  /**
   * 📐 DESPUÉS DE INICIALIZAR LA VISTA
   * Se ejecuta cuando el DOM está listo.
   * Aquí creamos las gráficas porque los canvas ya existen.
   */
  ngAfterViewInit(): void {
    // Pequeño delay para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      this.crearGraficas();
    }, 100);
  }

  /**
   * 🧹 AL DESTRUIR EL COMPONENTE
   * Limpiamos las gráficas para evitar memory leaks.
   */
  ngOnDestroy(): void {
    this.chartBarras?.destroy();
    this.chartPie?.destroy();
  }

  // ==========================================
  // 📈 CREACIÓN DE GRÁFICAS CON CHART.JS
  // ==========================================

  /**
   * 📊 CREAR AMBAS GRÁFICAS
   * Método principal que llama a las funciones de cada gráfica.
   */
  private crearGraficas(): void {
    this.crearGraficaBarras();
    this.crearGraficaCircular();
  }

  /**
   * 📊 CREAR GRÁFICA DE BARRAS
   * --------------------------
   * Muestra el stock total por cada categoría.
   * Usa los colores definidos en cada categoría.
   */
  private crearGraficaBarras(): void {
    const datos = this.datosGraficaCategorias();

    // Salir si no hay datos o el canvas no existe
    if (datos.length === 0 || !this.chartCategorias) return;

    // Destruir gráfica anterior para evitar duplicados
    this.chartBarras?.destroy();

    // Obtener contexto 2D del canvas
    const ctx = this.chartCategorias.nativeElement.getContext('2d');
    if (!ctx) return;

    // Crear nueva gráfica de barras
    this.chartBarras = new Chart(ctx, {
      type: 'bar',  // Tipo: gráfica de barras
      data: {
        labels: datos.map(d => d.nombre),  // Nombres de categorías en eje X
        datasets: [{
          label: 'Stock por Categoría',
          data: datos.map(d => d.stock),    // Valores de stock
          backgroundColor: datos.map(d => d.color),  // Colores de relleno
          borderColor: datos.map(d => d.color),      // Colores de borde
          borderWidth: 2,
          borderRadius: 8,  // Bordes redondeados
        }]
      },
      options: {
        responsive: true,          // Se adapta al contenedor
        maintainAspectRatio: false,  // Permite altura personalizada
        plugins: {
          legend: {
            display: false  // Ocultar leyenda
          },
          tooltip: {
            // Configuración del tooltip al pasar el mouse
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#4f46e5',
            borderWidth: 1,
            titleFont: { size: 13 },
            bodyFont: { size: 12 },
            callbacks: {
              // Personalizar texto del tooltip
              label: (context) => {
                return `Stock: ${context.parsed.y} unidades`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,  // Comenzar desde 0
            ticks: {
              font: {
                // Tamaño de fuente responsivo
                size: window.innerWidth < 768 ? 10 : 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'  // Líneas de cuadrícula suaves
            }
          },
          x: {
            ticks: {
              font: {
                size: window.innerWidth < 768 ? 10 : 12
              },
              // Rotar etiquetas en móvil para que quepan
              maxRotation: window.innerWidth < 768 ? 45 : 0,
              minRotation: window.innerWidth < 768 ? 45 : 0
            },
            grid: {
              display: false  // Sin líneas verticales
            }
          }
        }
      }
    });
  }

  /**
   * 🥧 CREAR GRÁFICA CIRCULAR (PIE)
   * --------------------------------
   * Muestra el valor monetario por categoría.
   * Cada porción representa el valor (precio × stock) de una categoría.
   */
  private crearGraficaCircular(): void {
    const datos = this.datosValorCategoria();

    // Salir si no hay datos o el canvas no existe
    if (datos.length === 0 || !this.chartCircular) return;

    // Destruir gráfica anterior
    this.chartPie?.destroy();

    // Obtener contexto 2D
    const ctx = this.chartCircular.nativeElement.getContext('2d');
    if (!ctx) return;

    // Crear gráfica circular
    this.chartPie = new Chart(ctx, {
      type: 'pie',  // Tipo: gráfica de pastel
      data: {
        labels: datos.map(d => d.nombre),  // Nombres de categorías
        datasets: [{
          data: datos.map(d => d.valor),   // Valores monetarios
          backgroundColor: datos.map(d => d.color),  // Colores
          borderColor: '#fff',             // Borde blanco entre porciones
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',  // Leyenda abajo de la gráfica
            labels: {
              padding: window.innerWidth < 768 ? 10 : 15,
              font: {
                size: window.innerWidth < 768 ? 10 : 12
              },
              // Tamaño de los cuadros de color
              boxWidth: window.innerWidth < 768 ? 12 : 15,
              boxHeight: window.innerWidth < 768 ? 12 : 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#4f46e5',
            borderWidth: 1,
            titleFont: { size: 13 },
            bodyFont: { size: 12 },
            callbacks: {
              // Mostrar valor formateado como moneda
              label: (context) => {
                const valor = context.parsed as number;
                return `${context.label}: S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        }
      }
    });
  }
}