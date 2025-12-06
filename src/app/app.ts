/* ===================================
   COMPONENTE RAÍZ - CON NOTIFICACIONES
   Archivo: src/app/app.ts
   
   ✅ Notificaciones integradas
   ✅ Animaciones habilitadas
   =================================== */

import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import { NotificationService } from './services/notification.service';
import { Sidebar } from './components/shared/sidebar/sidebar';
import { Toast } from './components/shared/toast/toast';
import { NotificationContainerComponent } from './components/notifications/notification-container.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    Sidebar,
    Toast,
    NotificationContainerComponent // 🆕 Contenedor de notificaciones
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('inventario_pro1');
  
  usuarioAutenticado$ = signal(false);
  cargandoAuth = signal(true);

  constructor(
    private firebaseService: FirebaseService,
    private notificationService: NotificationService, // 🆕 Servicio de notificaciones
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 App iniciada');

    // Suscribirse a cambios de autenticación
    this.firebaseService.currentUser$.subscribe(user => {
      console.log('👤 App - Estado de usuario:', user);

      if (user === undefined) {
        this.cargandoAuth.set(true);
        this.usuarioAutenticado$.set(false);
        return;
      }

      if (user === null) {
        this.cargandoAuth.set(false);
        this.usuarioAutenticado$.set(false);
        
        if (!this.router.url.includes('login')) {
          console.log('➡️ Redirigiendo a login');
          this.router.navigate(['/login']);
        }
        return;
      }

      // 🆕 Notificar login exitoso
      this.cargandoAuth.set(false);
      this.usuarioAutenticado$.set(true);
      console.log('✅ Usuario autenticado:', user.name);
      
      // Solo mostrar notificación si no venía de login
      if (this.router.url === '/login') {
        this.notificationService.loginExitoso(user.name);
      }
    });
  }
}