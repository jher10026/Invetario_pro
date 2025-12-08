/* ===================================
   COMPONENTE DE LOGIN - MEJORADO
   Archivo: src/app/components/login/login.ts
   
   ✅ Cambio inmediato a login después del registro
   ✅ Animación de carga en login
   =================================== */

import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',

  animations: [
    // Animación para la tarjeta del login
    trigger('cardAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateY(-50px) scale(0.9)' 
        }),
        animate('600ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ 
            opacity: 1, 
            transform: 'translateY(0) scale(1)' 
          })
        )
      ])
    ]),

    // Animación para los formularios (entrada y salida)
    trigger('formAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateX(-30px)' 
        }),
        animate('400ms 200ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 1, 
            transform: 'translateX(0)' 
          })
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 0, 
            transform: 'translateX(30px)' 
          })
        )
      ])
    ]),

    // Animación para alertas (mensajes de error/éxito)
    trigger('alertAnimation', [
      transition(':enter', [
        animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)', keyframes([
          style({ opacity: 0, transform: 'translateY(-20px) scale(0.9)', offset: 0 }),
          style({ opacity: 1, transform: 'translateY(5px) scale(1.02)', offset: 0.7 }),
          style({ opacity: 1, transform: 'translateY(0) scale(1)', offset: 1 })
        ]))
      ]),
      transition(':leave', [
        animate('200ms ease-out', 
          style({ 
            opacity: 0, 
            transform: 'translateY(-10px) scale(0.95)' 
          })
        )
      ])
    ]),

    // Animación del spinner de carga
    trigger('spinnerAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'scale(0)' 
        }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ 
            opacity: 1, 
            transform: 'scale(1)' 
          })
        )
      ])
    ]),

    // Animación para los botones
    trigger('buttonAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateY(20px)' 
        }),
        animate('400ms 300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 1, 
            transform: 'translateY(0)' 
          })
        )
      ])
    ])
  ]


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

  // Formulario de registro
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
   */

  /**
   * Procesar registro
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
        
        // 🆕 Cambiar a login más rápido (1 segundo)
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