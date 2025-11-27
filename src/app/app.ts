/* ===================================
   COMPONENTE RAÍZ - FASE 2
   Archivo: src/app/app.ts
   
   ✅ Actualizado para usar Firebase
   =================================== */

import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
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
  cargandoAuth = signal(true);

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 App iniciada');

    // Suscribirse a cambios de autenticación
    this.firebaseService.currentUser$.subscribe(user => {
      console.log('👤 App - Estado de usuario:', user);

      // undefined = cargando
      if (user === undefined) {
        this.cargandoAuth.set(true);
        this.usuarioAutenticado$.set(false);
        return;
      }

      // null = no autenticado
      if (user === null) {
        this.cargandoAuth.set(false);
        this.usuarioAutenticado$.set(false);
        
        // Redirigir a login si no está en la página de login
        if (!this.router.url.includes('login')) {
          console.log('➡️ Redirigiendo a login');
          this.router.navigate(['/login']);
        }
        return;
      }

      // Usuario autenticado
      this.cargandoAuth.set(false);
      this.usuarioAutenticado$.set(true);
      console.log('✅ Usuario autenticado:', user.name);
    });
  }
}