/* ===================================
   COMPONENTE DE LOGIN
   Archivo: src/app/components/login/login.component.ts
   =================================== */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // Para mostrar/ocultar formularios
  mostrarLogin = signal(true);

  // Datos del formulario de login
  loginUsername = signal('');
  loginPassword = signal('');

  // Datos del formulario de registro
  registroName = signal('');
  registroEmail = signal('');
  registroUsername = signal('');
  registroPassword = signal('');
  registroPasswordConfirm = signal('');

  // Para mostrar mensajes de error
  mensajeError = signal('');
  mensajeExito = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Procesar login
   */
  handleLogin(): void {
    // Limpiar mensajes anteriores
    this.mensajeError.set('');
    this.mensajeExito.set('');

    // Validar campos vacíos
    if (!this.loginUsername() || !this.loginPassword()) {
      this.mensajeError.set('Por favor completa todos los campos');
      return;
    }

    // Intentar login
    if (this.authService.login(this.loginUsername(), this.loginPassword())) {
      this.mensajeExito.set('¡Login exitoso!');
      
      // Esperar un poco y luego redirigir al dashboard
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    } else {
      this.mensajeError.set('Usuario o contraseña incorrectos');
    }
  }

  /**
   * Procesar registro
   */
  handleRegistro(): void {
    // Limpiar mensajes anteriores
    this.mensajeError.set('');
    this.mensajeExito.set('');

    // Validar campos vacíos
    if (!this.registroName() || !this.registroEmail() || 
        !this.registroUsername() || !this.registroPassword()) {
      this.mensajeError.set('Por favor completa todos los campos');
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.registroPassword() !== this.registroPasswordConfirm()) {
      this.mensajeError.set('Las contraseñas no coinciden');
      return;
    }

    // Crear objeto usuario
    const nuevoUsuario: Usuario = {
      name: this.registroName(),
      email: this.registroEmail(),
      username: this.registroUsername(),
      password: this.registroPassword(),
      role: 'user'
    };

    // Intentar registrar
    const resultado = this.authService.registrar(nuevoUsuario);
    
    if (resultado.success) {
      this.mensajeExito.set(resultado.message);
      
      // Limpiar formulario y volver a login
      setTimeout(() => {
        this.mostrarLogin.set(true);
        this.limpiarFormularios();
      }, 1500);
    } else {
      this.mensajeError.set(resultado.message);
    }
  }

  /**
   * Cambiar entre login y registro
   */
  alternarFormulario(): void {
    this.mostrarLogin.update(val => !val);
    this.limpiarFormularios();
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  /**
   * Limpiar todos los formularios
   */
  private limpiarFormularios(): void {
    this.loginUsername.set('');
    this.loginPassword.set('');
    this.registroName.set('');
    this.registroEmail.set('');
    this.registroUsername.set('');
    this.registroPassword.set('');
    this.registroPasswordConfirm.set('');
  }

  /**
   * Limpiar datos (botón de debugging)
   */
  limpiarDatos(): void {
    if (confirm('Esto eliminará todos los datos. ¿Continuar?')) {
      this.authService.limpiarDatos();
      this.limpiarFormularios();
      this.mensajeExito.set('Datos limpiados. Recarga la página.');
    }
  }
}