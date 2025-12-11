/* ===================================
   DETALLE DE PRODUCTO
   Archivo: src/app/components/inventario/detalle-producto/detalle-producto.ts
   
   ✅ Muestra información detallada de un producto específico
   ✅ Usa parámetros dinámicos de ruta
   =================================== */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductosService } from '../../../services/productos.service';
import { CategoriasService } from '../../../services/categorias.service';
import { Producto } from '../../../models/producto.model';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detalle-container">
      <!-- Botón volver -->
      <div class="header-actions">
        <button class="btn-back" routerLink="/inventario">
          ← Volver al Inventario
        </button>
      </div>

      <!-- Estado de carga -->
      <div *ngIf="cargando()" class="loading">
        <span class="spinner"></span>
        Cargando producto...
      </div>

      <!-- Producto no encontrado -->
      <div *ngIf="!cargando() && !producto()" class="not-found">
        <div class="not-found-icon">📦</div>
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o fue eliminado.</p>
        <button class="btn-primary" routerLink="/inventario">
          Volver al inventario
        </button>
      </div>

      <!-- Detalle del producto -->
      <div *ngIf="!cargando() && producto()" class="detalle-content">
        <!-- Encabezado -->
        <div class="producto-header">
          <div class="producto-icon" [style.background]="obtenerColorCategoria()">
            {{ obtenerIniciales() }}
          </div>
          <div class="producto-info">
            <h1>{{ producto()?.nombre }}</h1>
            <span 
              class="badge-categoria"
              [style.background]="obtenerColorCategoria() + '20'"
              [style.color]="obtenerColorCategoria()"
            >
              {{ producto()?.categoria }}
            </span>
          </div>
        </div>

        <!-- Detalles en grid -->
        <div class="detalles-grid">
          <!-- Precio -->
          <div class="detalle-card">
            <div class="card-icon precio">💰</div>
            <div class="card-content">
              <span class="card-label">Precio Unitario</span>
              <span class="card-value">S/ {{ producto()?.precio?.toFixed(2) ?? '0.00' }}</span>
            </div>
          </div>

          <!-- Stock -->
          <div class="detalle-card">
            <div class="card-icon stock">📦</div>
            <div class="card-content">
              <span class="card-label">Stock Disponible</span>
              <span class="card-value">{{ producto()?.stock ?? 0 }} unidades</span>
              <span 
                class="stock-badge"
                [ngClass]="obtenerEstadoStock()"
              >
                {{ obtenerTextoEstado() }}
              </span>
            </div>
          </div>

          <!-- Fecha de ingreso -->
          <div class="detalle-card">
            <div class="card-icon fecha">📅</div>
            <div class="card-content">
              <span class="card-label">Fecha de Ingreso</span>
              <span class="card-value">{{ producto()?.fecha | date: 'dd/MM/yyyy' }}</span>
            </div>
          </div>

          <!-- Valor total -->
          <div class="detalle-card">
            <div class="card-icon total">💵</div>
            <div class="card-content">
              <span class="card-label">Valor Total en Stock</span>
              <span class="card-value">S/ {{ calcularValorTotal() }}</span>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="info-adicional">
          <h3>📊 Información Adicional</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ID del Producto:</span>
              <span class="info-value">{{ producto()?.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado del Stock:</span>
              <span class="info-value" [ngClass]="'estado-' + obtenerEstadoStock()">
                {{ obtenerTextoEstado().toUpperCase() }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Categoría:</span>
              <span class="info-value">{{ producto()?.categoria }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Unidades Vendibles:</span>
              <span class="info-value">{{ producto()?.stock ?? 0 }} unidades</span>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="acciones-footer">
          <button 
            class="btn-secondary" 
            (click)="editarProducto()"
          >
            ✏️ Editar Producto
          </button>
          <button 
            class="btn-danger" 
            (click)="eliminarProducto()"
          >
            🗑️ Eliminar Producto
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detalle-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-actions {
      margin-bottom: 2rem;
    }

    .btn-back {
      padding: 0.75rem 1.5rem;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: #e5e7eb;
    }

    .loading, .not-found {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .not-found-icon {
      font-size: 5rem;
      margin-bottom: 1rem;
    }

    .producto-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 3rem;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .producto-icon {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: bold;
      color: white;
    }

    .producto-info h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: #1f2937;
    }

    .badge-categoria {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      display: inline-block;
    }

    .detalles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .detalle-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      gap: 1rem;
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .card-icon.precio { background: #fef3c7; }
    .card-icon.stock { background: #dbeafe; }
    .card-icon.fecha { background: #f3e8ff; }
    .card-icon.total { background: #d1fae5; }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .card-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .card-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #1f2937;
    }

    .stock-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
      width: fit-content;
      margin-top: 0.25rem;
    }

    .stock-badge.disponible {
      background: #d1fae5;
      color: #065f46;
    }

    .stock-badge.bajo {
      background: #fef3c7;
      color: #92400e;
    }

    .stock-badge.agotado {
      background: #fee2e2;
      color: #991b1b;
    }

    .info-adicional {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .info-adicional h3 {
      margin: 0 0 1.5rem 0;
      color: #1f2937;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .info-label {
      color: #6b7280;
      font-weight: 500;
    }

    .info-value {
      font-weight: 600;
      color: #1f2937;
    }

    .estado-disponible { color: #059669 !important; }
    .estado-bajo { color: #d97706 !important; }
    .estado-agotado { color: #dc2626 !important; }

    .acciones-footer {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-secondary, .btn-danger, .btn-primary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: #6366f1;
      color: white;
    }

    .btn-secondary:hover {
      background: #4f46e5;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-primary {
      background: #6366f1;
      color: white;
    }

    .btn-primary:hover {
      background: #4f46e5;
    }
  `]
})
export class DetalleProducto implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productosService = inject(ProductosService);
  private categoriasService = inject(CategoriasService);

  producto = signal<Producto | null>(null);
  cargando = signal(true);

  ngOnInit(): void {
    // Obtener ID del parámetro de ruta
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.cargarProducto(parseInt(id, 10));
    } else {
      this.cargando.set(false);
    }
  }

  private cargarProducto(id: number): void {
    setTimeout(() => {
      const prod = this.productosService.obtenerPorId(id);
      this.producto.set(prod || null);
      this.cargando.set(false);
    }, 500);
  }

  obtenerColorCategoria(): string {
    const prod = this.producto();
    if (!prod) return '#6366f1';
    
    const categoria = this.categoriasService.obtenerPorNombre(prod.categoria);
    return categoria?.color ?? '#6366f1';
  }

  obtenerIniciales(): string {
    const nombre = this.producto()?.nombre || '';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  obtenerEstadoStock(): 'disponible' | 'bajo' | 'agotado' {
    const stock = this.producto()?.stock ?? 0;
    if (stock === 0) return 'agotado';
    if (stock < 10) return 'bajo';
    return 'disponible';
  }

  obtenerTextoEstado(): string {
    const estado = this.obtenerEstadoStock();
    switch (estado) {
      case 'disponible': return 'Disponible';
      case 'bajo': return 'Stock Bajo';
      case 'agotado': return 'Agotado';
    }
  }

  calcularValorTotal(): string {
    const prod = this.producto();
    if (!prod) return '0.00';
    return (prod.precio * prod.stock).toFixed(2);
  }

  editarProducto(): void {
    this.router.navigate(['/inventario']);
    // Aquí podrías abrir el modal de edición
  }

  eliminarProducto(): void {
    const confirmar = confirm(`¿Eliminar "${this.producto()?.nombre}"?`);
    if (confirmar && this.producto()) {
      // Lógica de eliminación
      this.router.navigate(['/inventario']);
    }
  }
}