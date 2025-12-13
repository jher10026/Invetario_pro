/* ============================================================================
   🔐 COMPONENTE LOGIN
   ============================================================================
   
   📌 PROPÓSITO:
   Maneja la autenticación de usuarios. Permite iniciar sesión con email/password
   o con Google, y también registrar nuevos usuarios.
   
   🔧 FUNCIONALIDADES:
   - Formulario de inicio de sesión con email y contraseña
   - Formulario de registro de nuevos usuarios
   - Inicio de sesión con Google (OAuth)
   - Validaciones de campos
   - Animaciones de transición entre formularios
   - Mostrar/ocultar contraseñas
   - Redirección después del login
   
   📁 Archivo: src/app/components/login/login.ts
   ============================================================================ */

// ==========================================
// 📦 IMPORTACIONES DE ANGULAR
// ==========================================
import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
// Component: Decorador para crear componentes
// signal: Estado reactivo
// inject: Inyección de dependencias
// OnInit: Hook del ciclo de vida (al inicializar)
// OnDestroy: Hook del ciclo de vida (al destruir)

import { CommonModule } from '@angular/common';
// CommonModule: Directivas comunes (*ngIf, *ngFor)

import { FormsModule } from '@angular/forms';
// FormsModule: Para usar [(ngModel)] en formularios

import { Router, ActivatedRoute } from '@angular/router';
// Router: Para navegar programáticamente entre rutas
// ActivatedRoute: Para obtener parámetros de la URL (como returnUrl)

import { FirebaseService } from '../../services/firebase.service';
// FirebaseService: Maneja autenticación con Firebase

import { Subscription } from 'rxjs';
// Subscription: Para manejar suscripciones a Observables

import { filter, take } from 'rxjs/operators';
// filter: Filtrar valores del Observable
// take: Tomar solo n valores y completar

import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
// Funciones para crear animaciones de Angular:
// trigger: Define un disparador de animación
// state: Define estados de la animación
// style: Define estilos CSS
// transition: Define transiciones entre estados
// animate: Define la animación (duración, timing)
// keyframes: Define frames intermedios de la animación

// ==========================================
// 🎨 CONFIGURACIÓN DEL COMPONENTE
// ==========================================
@Component({
  selector: 'app-login',       // Se usa como: <app-login></app-login>
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',

  // ==========================================
  // 🎬 ANIMACIONES DEL COMPONENTE
  // ==========================================
  animations: [

    /**
     * 🎴 ANIMACIÓN DE LA TARJETA
     * Efecto de entrada cuando aparece la tarjeta del login.
     * La tarjeta entra desde arriba con un efecto de rebote.
     */
    trigger('cardAnimation', [
      transition(':enter', [
        // Estado inicial: invisible, arriba y más pequeña
        style({
          opacity: 0,
          transform: 'translateY(-50px) scale(0.9)'
        }),
        // Animación de 600ms con curva de rebote
        animate('600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          })
        )
      ])
    ]),

    /**
     * 📝 ANIMACIÓN DEL FORMULARIO
     * Efecto de slide cuando cambia entre login y registro.
     */
    trigger('formAnimation', [
      // Al entrar: slide desde la izquierda
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
      // Al salir: slide hacia la derecha
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 0,
            transform: 'translateX(30px)'
          })
        )
      ])
    ]),

    /**
     * ⚠️ ANIMACIÓN DE ALERTAS
     * Efecto de bounce para mensajes de error/éxito.
     */
    trigger('alertAnimation', [
      transition(':enter', [
        // Animación con keyframes para efecto de rebote
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

    /**
     * ⏳ ANIMACIÓN DEL SPINNER
     * Efecto de escala cuando aparece el indicador de carga.
     */
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

    /**
     * 🔘 ANIMACIÓN DE BOTONES
     * Efecto de entrada para los botones.
     */
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

  // ==========================================
  // 🔌 INYECCIÓN DE SERVICIOS
  // ==========================================

  private firebaseService = inject(FirebaseService);
  // Servicio para manejar autenticación con Firebase

  private router = inject(Router);
  // Router para navegar después del login

  private route = inject(ActivatedRoute);
  // Para obtener parámetros de la URL (ej: returnUrl)

  private subscription?: Subscription;
  // Para almacenar la suscripción y poder limpiarla después

  // ==========================================
  // 🎛️ CONTROL DE VISTA
  // ==========================================

  mostrarLogin = signal(true);
  // true = mostrar formulario de login
  // false = mostrar formulario de registro

  cargando = signal(false);
  // Estado de carga para el botón de login/registro

  cargandoGoogle = signal(false);
  // Estado de carga específico para el botón de Google

  // ==========================================
  // 📝 CAMPOS DEL FORMULARIO DE LOGIN
  // ==========================================

  loginEmail = signal('');
  // Email ingresado en el login

  loginPassword = signal('');
  // Contraseña ingresada en el login

  // ==========================================
  // 📝 CAMPOS DEL FORMULARIO DE REGISTRO
  // ==========================================

  registroName = signal('');
  // Nombre completo del nuevo usuario

  registroEmail = signal('');
  // Email del nuevo usuario

  registroPassword = signal('');
  // Contraseña elegida

  registroPasswordConfirm = signal('');
  // Confirmación de contraseña (debe coincidir)

  // ==========================================
  // 💬 MENSAJES AL USUARIO
  // ==========================================

  mensajeError = signal('');
  // Mensaje de error (rojo) a mostrar

  mensajeExito = signal('');
  // Mensaje de éxito (verde) a mostrar

  // ==========================================
  // 👁️ CONTROL DE VISIBILIDAD DE CONTRASEÑAS
  // ==========================================

  mostrarPasswordLogin = signal(false);
  // true = mostrar contraseña en texto plano
  // false = mostrar como puntos (oculta)

  mostrarPasswordRegistro = signal(false);
  // Para el campo de contraseña en registro

  mostrarPasswordConfirm = signal(false);
  // Para el campo de confirmar contraseña

  // ==========================================
  // 🔗 URL DE RETORNO
  // ==========================================

  private returnUrl: string = '/dashboard';
  // A dónde redirigir después del login exitoso
  // Por defecto es dashboard, pero puede venir de un parámetro

  // ==========================================
  // 🔄 CICLO DE VIDA: INICIALIZACIÓN
  // ==========================================

  /**
   * 🚀 AL INICIALIZAR EL COMPONENTE
   * --------------------------------
   * 1. Obtener la URL de retorno de los query params
   * 2. Verificar si el usuario ya está autenticado
   * 3. Si ya está logueado, redirigir automáticamente
   */
  ngOnInit(): void {
    // Obtener returnUrl de los parámetros de la URL
    // Ejemplo: /login?returnUrl=/inventario → returnUrl = '/inventario'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Verificar si ya está autenticado
    this.subscription = this.firebaseService.currentUser$.pipe(
      filter(user => user !== undefined),  // Esperar a que se defina (no undefined)
      take(1)                              // Tomar solo el primer valor
    ).subscribe(user => {
      if (user) {
        // Usuario ya autenticado, redirigir
        console.log('✅ Usuario ya autenticado, redirigiendo a:', this.returnUrl);
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  /**
   * 🧹 AL DESTRUIR EL COMPONENTE
   * Limpiar suscripción para evitar memory leaks.
   */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // ==========================================
  // 🔐 MÉTODO DE LOGIN
  // ==========================================

  /**
   * 🔑 PROCESAR LOGIN CON EMAIL/PASSWORD
   * -------------------------------------
   * FLUJO:
   * 1. Limpiar mensajes anteriores
   * 2. Validar que los campos estén completos
   * 3. Validar formato del email
   * 4. Llamar al servicio de Firebase
   * 5. Si éxito: mostrar mensaje y redirigir
   * 6. Si error: mostrar mensaje de error
   */
  async handleLogin(): Promise<void> {
    // Limpiar mensajes anteriores
    this.limpiarMensajes();

    // Validar campos obligatorios
    if (!this.loginEmail() || !this.loginPassword()) {
      this.mensajeError.set('Por favor completa todos los campos');
      return;
    }

    // Validar formato del email
    if (!this.validarEmail(this.loginEmail())) {
      this.mensajeError.set('El correo electrónico no es válido');
      return;
    }

    // Mostrar estado de carga
    this.cargando.set(true);

    try {
      // Intentar iniciar sesión con Firebase
      const resultado = await this.firebaseService.login(
        this.loginEmail(),
        this.loginPassword()
      );

      if (resultado.success) {
        // Login exitoso
        this.mensajeExito.set('¡Bienvenido! Redirigiendo...');

        // Esperar a que el usuario se cargue completamente
        this.firebaseService.currentUser$.pipe(
          filter(user => user !== null && user !== undefined),
          take(1)
        ).subscribe(user => {
          console.log('✅ Usuario cargado, redirigiendo a:', this.returnUrl);
          // Pequeño delay para que el usuario vea el mensaje
          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 500);
        });
      } else {
        // Error en login
        this.mensajeError.set(resultado.message);
      }
    } catch (error) {
      console.error('Error en login:', error);
      this.mensajeError.set('Error inesperado al iniciar sesión');
    } finally {
      this.cargando.set(false);
    }
  }

  // ==========================================
  // 🔵 MÉTODO DE LOGIN CON GOOGLE
  // ==========================================

  /**
   * 🔵 INICIAR SESIÓN CON GOOGLE
   * -----------------------------
   * Usa el popup de Google para autenticar.
   * Si el usuario no existe en Firestore, se crea automáticamente.
   */
  async handleLoginGoogle(): Promise<void> {
    this.limpiarMensajes();
    this.cargandoGoogle.set(true);  // Spinner específico para Google

    try {
      const resultado = await this.firebaseService.loginConGoogle();

      if (resultado.success) {
        this.mensajeExito.set('¡Bienvenido! Redirigiendo...');

        // Esperar a que el usuario se cargue
        this.firebaseService.currentUser$.pipe(
          filter(user => user !== null && user !== undefined),
          take(1)
        ).subscribe(user => {
          console.log('✅ Usuario de Google cargado, redirigiendo a:', this.returnUrl);
          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 500);
        });
      } else {
        this.mensajeError.set(resultado.message);
      }
    } catch (error) {
      console.error('Error en login con Google:', error);
      this.mensajeError.set('Error inesperado al iniciar sesión con Google');
    } finally {
      this.cargandoGoogle.set(false);
    }
  }

  // ==========================================
  // 📝 MÉTODO DE REGISTRO
  // ==========================================

  /**
   * 📝 PROCESAR REGISTRO DE NUEVO USUARIO
   * --------------------------------------
   * FLUJO:
   * 1. Validar que todos los campos estén completos
   * 2. Validar formato del email
   * 3. Validar longitud de contraseña (mínimo 6)
   * 4. Validar que las contraseñas coincidan
   * 5. Llamar al servicio de Firebase para registrar
   * 6. Si éxito: mostrar mensaje y cambiar a pantalla de login
   * 7. Si error: mostrar mensaje de error
   */
  async handleRegistro(): Promise<void> {
    this.limpiarMensajes();

    // ==========================================
    // VALIDACIONES
    // ==========================================

    // Validar campos obligatorios
    if (!this.registroName() || !this.registroEmail() ||
      !this.registroPassword() || !this.registroPasswordConfirm()) {
      this.mensajeError.set('Por favor completa todos los campos');
      return;
    }

    // Validar formato del email
    if (!this.validarEmail(this.registroEmail())) {
      this.mensajeError.set('El correo electrónico no es válido');
      return;
    }

    // Validar longitud de contraseña
    if (this.registroPassword().length < 6) {
      this.mensajeError.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.registroPassword() !== this.registroPasswordConfirm()) {
      this.mensajeError.set('Las contraseñas no coinciden');
      return;
    }

    // Mostrar estado de carga
    this.cargando.set(true);

    try {
      // Registrar usuario en Firebase
      const resultado = await this.firebaseService.registrarUsuario(
        this.registroEmail(),
        this.registroPassword(),
        this.registroName()
      );

      if (resultado.success) {
        // Registro exitoso
        this.mensajeExito.set(resultado.message + ' Por favor inicia sesión.');

        // Después de 1 segundo, cambiar a la pantalla de login
        setTimeout(() => {
          this.limpiarFormularios();
          this.mostrarLogin.set(true);     // Cambiar a login
          this.limpiarMensajes();
        }, 1000);
      } else {
        // Error en registro
        this.mensajeError.set(resultado.message);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      this.mensajeError.set('Error inesperado al registrar usuario');
    } finally {
      this.cargando.set(false);
    }
  }

  // ==========================================
  // 🔄 ALTERNAR ENTRE FORMULARIOS
  // ==========================================

  /**
   * 🔄 CAMBIAR ENTRE LOGIN Y REGISTRO
   * Invierte el estado de mostrarLogin y limpia los campos.
   */
  alternarFormulario(): void {
    this.mostrarLogin.update(val => !val);  // Invertir valor
    this.limpiarFormularios();
    this.limpiarMensajes();
  }

  // ==========================================
  // 🔧 MÉTODOS AUXILIARES
  // ==========================================

  /**
   * 📧 VALIDAR FORMATO DE EMAIL
   * Usa una expresión regular para verificar el formato.
   * 
   * @param email - Email a validar
   * @returns true si es válido
   */
  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * 🧹 LIMPIAR MENSAJES
   * Quita los mensajes de error y éxito.
   */
  private limpiarMensajes(): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  /**
   * 🧹 LIMPIAR FORMULARIOS
   * Resetea todos los campos de ambos formularios.
   */
  private limpiarFormularios(): void {
    // Limpiar login
    this.loginEmail.set('');
    this.loginPassword.set('');

    // Limpiar registro
    this.registroName.set('');
    this.registroEmail.set('');
    this.registroPassword.set('');
    this.registroPasswordConfirm.set('');
  }

  // ==========================================
  // 👁️ MÉTODOS PARA MOSTRAR/OCULTAR CONTRASEÑAS
  // ==========================================

  /**
   * 👁️ ALTERNAR VISIBILIDAD - PASSWORD LOGIN
   */
  togglePasswordLogin(): void {
    this.mostrarPasswordLogin.update(val => !val);
  }

  /**
   * 👁️ ALTERNAR VISIBILIDAD - PASSWORD REGISTRO
   */
  togglePasswordRegistro(): void {
    this.mostrarPasswordRegistro.update(val => !val);
  }

  /**
   * 👁️ ALTERNAR VISIBILIDAD - CONFIRMAR PASSWORD
   */
  togglePasswordConfirm(): void {
    this.mostrarPasswordConfirm.update(val => !val);
  }
}
