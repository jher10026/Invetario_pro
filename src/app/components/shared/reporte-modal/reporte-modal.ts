import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultasService } from '../../../services/consultas';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-reporte-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal" [class.active]="mostrarModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>📝 Reportar Problema</h2>
        </div>
        <form (ngSubmit)="enviarReporte()">
          <div class="form-group">
            <label class="form-label">Tipo de Problema</label>
            <select class="form-input" [(ngModel)]="tipoReporte" name="tipo" required>
              <option value="">Seleccione un tipo...</option>
              <option value="error-stock">Error de Stock</option>
              <option value="error-datos">Datos Incorrectos</option>
              <option value="bug">Error en la Plataforma (Bug)</option>
              <option value="mejora">Sugerencia de Mejora</option>
              <option value="consulta">Consulta General</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <textarea 
              class="form-input" 
              [(ngModel)]="mensaje" 
              name="mensaje"
              rows="5" 
              placeholder="Por favor, describe el problema o consulta en detalle..." 
              required
              style="resize: vertical; min-height: 120px;"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" (click)="cerrar()">Cancelar</button>
            <button type="submit" class="btn-save">Enviar Reporte</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ReporteModalComponent {
  mostrarModal: boolean = false;
  tipoReporte: string = '';
  mensaje: string = '';

  constructor(
    private consultasService: ConsultasService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  abrir(): void {
    this.mostrarModal = true;
    this.tipoReporte = '';
    this.mensaje = '';
  }

  cerrar(): void {
    this.mostrarModal = false;
    this.tipoReporte = '';
    this.mensaje = '';
  }

  enviarReporte(): void {
    if (!this.tipoReporte || !this.mensaje.trim()) {
      this.toastService.error('Por favor completa todos los campos');
      return;
    }

    const usuario = this.authService.getCurrentUser();
    if (usuario) {
      const mensajeCompleto = `[${this.tipoReporte}] ${this.mensaje}`;
      this.consultasService.crearConsulta(
        usuario.id,
        usuario.nombre,
        mensajeCompleto
      );
      this.toastService.success('✅ Reporte enviado correctamente');
      this.cerrar();
    }
  }
}