import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { Usuario } from '../../../models/usuario';
import { ReporteModalComponent } from '../reporte-modal/reporte-modal';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReporteModalComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  @ViewChild(ReporteModalComponent) reporteModal!: ReporteModalComponent;
  
  usuarioActual: Usuario | null = null;
  rutaActiva: string = '';
  sidebarAbierto: boolean = false;
  esMobile: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.usuarioActual = this.authService.getCurrentUser();
    this.rutaActiva = this.router.url;
  }

  checkScreenSize(): void {
    this.esMobile = window.innerWidth <= 768;
    if (!this.esMobile) {
      this.sidebarAbierto = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSidebar(): void {
    if (this.esMobile) {
      this.sidebarAbierto = false;
    }
  }

  abrirReporte(): void {
    if (this.reporteModal) {
      this.reporteModal.abrir();
    }
    this.cerrarSidebar();
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  esAdmin(): boolean {
    return this.authService.isAdmin();
  }

  esUsuario(): boolean {
    return !this.esAdmin();
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
}