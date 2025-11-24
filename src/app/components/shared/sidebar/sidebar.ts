/* ===================================
   COMPONENTE SIDEBAR
   Archivo: src/app/components/shared/sidebar/sidebar.component.ts
   =================================== */

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ReportesService } from '../../../services/reportes';
import { NotificationService } from '../../../services/notification';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  private authService = inject(AuthService);
  private reportesService = inject(ReportesService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  usuarioActual: Usuario | null = null;
  mostrarModalReporte = signal(false);

  // Formulario de reporte
  formReporte = signal({
    tipo: '',
    descripcion: ''
  });

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
  }

  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  abrirModalReporte(): void {
    this.mostrarModalReporte.set(true);
  }

  cerrarModalReporte(): void {
    this.mostrarModalReporte.set(false);
    this.limpiarFormulario();
  }

  enviarReporte(): void {
    const form = this.formReporte();

    if (!form.tipo || !form.descripcion) {
      this.notificationService.error('Por favor completa todos los campos');
      return;
    }

    // Crear el reporte
    this.reportesService.crear({
      usuario: this.usuarioActual?.name || 'Usuario',
      email: this.usuarioActual?.email || '',
      tipo: form.tipo as any,
      descripcion: form.descripcion,
      fecha: new Date().toISOString()
    });

    this.notificationService.exito('Reporte enviado exitosamente. ¡Gracias por tu feedback!');
    this.cerrarModalReporte();
  }

  private limpiarFormulario(): void {
    this.formReporte.set({
      tipo: '',
      descripcion: ''
    });
  }

  actualizarForm(campo: string, valor: any): void {
    const form = this.formReporte();
    (form as any)[campo] = valor;
    this.formReporte.set({...form});
  }
}