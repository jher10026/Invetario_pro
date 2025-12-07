import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../../services/reportes.service';
import { NotificationService } from '../../services/notification.service';
import { FirebaseService } from '../../services/firebase.service';
import { Reporte } from '../../models/reporte.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {
  private reportesService = inject(ReportesService);
  private notificationService = inject(NotificationService);
  private firebaseService = inject(FirebaseService);

  reportes = this.reportesService.reportes;
  usuarioActual: Usuario | null = null;
  iniciales = '';

  tipoSeleccionado = signal('');

  constructor() {
    this.obtenerUsuarioActual();
  }

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

  obtenerReportesFiltrados(): Reporte[] {
    const tipo = this.tipoSeleccionado();
    if (!tipo) return this.reportes();
    return this.reportesService.filtrarPorTipo(tipo);
  }

  eliminarReporte(id: number): void {
    if (confirm('¿Eliminar este reporte?')) {
      const eliminado = this.reportesService.eliminar(id);
      if (eliminado) {
        this.notificationService.exito('Reporte eliminado');
      }
    }
  }

  obtenerIconoTipo(tipo: string): string {
    const iconos: Record<string, string> = {
      'error-stock': '📦',
      'error-datos': '⚠️',
      'bug': '🐛',
      'mejora': '💡',
      'consulta': '❓',
      'otro': '📝'
    };
    return iconos[tipo] || '📋';
  }

  obtenerTextoTipo(tipo: string): string {
    const textos: Record<string, string> = {
      'error-stock': 'Error de Stock',
      'error-datos': 'Datos Incorrectos',
      'bug': 'Bug',
      'mejora': 'Mejora',
      'consulta': 'Consulta',
      'otro': 'Otro'
    };
    return textos[tipo] || tipo;
  }
}