/* ===================================
   COMPONENTE SIDEBAR - FASE 2
   Archivo: src/app/components/shared/sidebar/sidebar.ts
   
   ✅ Actualizado para usar Firebase
   =================================== */

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';
import { ReportesService } from '../../../services/reportes.service';
import { NotificationService } from '../../../services/notification.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  private firebaseService = inject(FirebaseService);
  private reportesService = inject(ReportesService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  usuarioActual: Usuario | null = null;
  mostrarModalReporte = signal(false);
  // Modal de confirmación para cerrar sesión
  mostrarModalLogout = signal(false);

  // Formulario de reporte
  formReporte = signal({
    tipo: '',
    descripcion: ''
  });

  ngOnInit(): void {
    // Obtener usuario actual desde Firebase
    this.firebaseService.currentUser$.subscribe(user => {
      this.usuarioActual = user || null;
    });
  }

  /**
   * Cerrar sesión con Firebase
   */
/**
   * Mostrar modal de confirmación para cerrar sesión
   */
  logout(): void {
    this.mostrarModalLogout.set(true);
  }

  /**
   * Confirmar cierre de sesión con Firebase
   */
  async confirmarLogout(): Promise<void> {
    console.log('👋 Cerrando sesión...');
    
    await this.firebaseService.logout();
    
    // Redirigir a login
    this.router.navigate(['/login']);
    
    this.mostrarModalLogout.set(false);
    console.log('✅ Sesión cerrada');
  }

  /**
   * Cancelar cierre de sesión
   */
  cancelarLogout(): void {
    this.mostrarModalLogout.set(false);
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