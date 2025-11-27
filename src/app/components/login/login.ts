/* ===================================
   COMPONENTE DE LOGIN - SIN CÓDIGO ADMIN
   Archivo: src/app/components/login/login.ts
   
   ✅ Sin campo de código admin
   ✅ Todos los usuarios tienen permisos completos
   =================================== */

import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private subscription?: Subscription;

  // Control de vista
  mostrarLogin = signal(true);
  cargando = signal(false);

  // Formulario de login
  loginEmail = signal('');
  loginPassword = signal('');

  // Formulario de registro (sin código admin)
  registroName = signal('');
  registroEmail = signal('');
  registroPassword = signal('');
  registroPasswordConfirm = signal('');

  // Mensajes
  mensajeError = signal('');
  mensajeExito = signal('');

  // URL de retorno
  private returnUrl: string = '/dashboard';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Verificar si ya está autenticado
    this.subscription = this.firebaseService.currentUser$.pipe(
      filter(user => user !== undefined),
      take(1)
    ).subscribe(user => {
      if (user) {
        console.log('✅ Usuario ya autenticado, redirigiendo a:', this.returnUrl);
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Procesar login
   */
  async handleLogin(): Promise<void> {
    this.limpiarMensajes();

    if (!this.loginEmail() || !this.loginPassword()) {
      this.mensajeError.set('Por favor completa todos los campos');
      return;
    }

    if (!this.validarEmail(this.loginEmail())) {
      this.mensajeError.set('El correo electrónico no es válido');
      return;
    }

    this.cargando.set(true);

    try {
      const resultado = await this.firebaseService.login(
        this.loginEmail(),
        this.loginPassword()
      );

      if (resultado.success) {
        this.mensajeExito.set('¡Bienvenido! Redirigiendo...');
        
        // Esperar a que el usuario se cargue
        this.firebaseService.currentUser$.pipe(
          filter(user => user !== null && user !== undefined),
          take(1)
        ).subscribe(user => {
          console.log('✅ Usuario cargado, redirigiendo a:', this.returnUrl);
          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 500);
        });
      } else {
        this.mensajeError.set(resultado.message);
      }
    } catch (error) {
      console.error('Error en login:', error);
      this.mensajeError.set('Error inesperado al iniciar sesión');
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * Login con cuenta de prueba
   * 🧪 Útil para desarrollo y testing
   */
  loginPrueba(): void {
    this.loginEmail.set('prueba@inventario.com');
    this.loginPassword.set('prueba123');
    this.handleLogin();
  }

  /**
   * Procesar registro (sin código admin)
   */
  async handleRegistro(): Promise<void> {
    this.limpiarMensajes();

    // Validaciones
    if (!this.registroName() || !this.registroEmail() || 
        !this.registroPassword() || !this.registroPasswordConfirm()) {
      this.mensajeError.set('Por favor completa todos los campos');
      return;
    }

    if (!this.validarEmail(this.registroEmail())) {
      this.mensajeError.set('El correo electrónico no es válido');
      return;
    }

    if (this.registroPassword().length < 6) {
      this.mensajeError.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.registroPassword() !== this.registroPasswordConfirm()) {
      this.mensajeError.set('Las contraseñas no coinciden');
      return;
    }

    this.cargando.set(true);

    try {
      const resultado = await this.firebaseService.registrarUsuario(
        this.registroEmail(),
        this.registroPassword(),
        this.registroName()
      );

      if (resultado.success) {
        this.mensajeExito.set(resultado.message + ' Por favor inicia sesión.');
        
        // Limpiar formulario y cambiar a login
        setTimeout(() => {
          this.limpiarFormularios();
          this.mostrarLogin.set(true);
          this.limpiarMensajes();
        }, 1000);
      } else {
        this.mensajeError.set(resultado.message);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      this.mensajeError.set('Error inesperado al registrar usuario');
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * Alternar entre login y registro
   */
  alternarFormulario(): void {
    this.mostrarLogin.update(val => !val);
    this.limpiarFormularios();
    this.limpiarMensajes();
  }

  /**
   * Validar formato de email
   */
  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Limpiar mensajes
   */
  private limpiarMensajes(): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  /**
   * Limpiar formularios
   */
  private limpiarFormularios(): void {
    this.loginEmail.set('');
    this.loginPassword.set('');
    this.registroName.set('');
    this.registroEmail.set('');
    this.registroPassword.set('');
    this.registroPasswordConfirm.set('');
  }
}