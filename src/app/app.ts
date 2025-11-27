/* ===================================
   COMPONENTE RAÍZ
   Archivo: src/app/app.ts
   =================================== */

import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Sidebar } from './components/shared/sidebar/sidebar';
import { Toast } from './components/shared/toast/toast';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    Sidebar,
    Toast
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('inventario_pro1');
  
  // Observable que indica si el usuario está autenticado
  usuarioAutenticado$ = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios de autenticación
    this.authService.currentUser$.subscribe(user => {
      this.usuarioAutenticado$.set(user !== null);
    });

    // Si no está autenticado y no está en login, redirigir
    const usuarioActual = this.authService.obtenerUsuarioActual();
    if (!usuarioActual && !this.router.url.includes('login')) {
      this.router.navigate(['/login']);
    }
  }
}