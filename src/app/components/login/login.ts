import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // Formulario
  email: string = '';
  password: string = '';
  nombre: string = '';
  
  // Estado
  esRegistro: boolean = false;
  error: string = '';
  cargando: boolean = false;
  mensaje: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Iniciar sesión
   */
  onLogin(): void {
    this.error = '';
    this.cargando = true;

    // Validar campos
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      this.cargando = false;
      return;
    }

    // Intentar login
    const exito = this.authService.login(this.email, this.password);

    if (!exito) {
      this.error = 'Usuario o contraseña incorrectos';
      this.cargando = false;
    }
  }

  /**
   * Registrar nuevo usuario
   */
  onRegister(): void {
    this.error = '';
    this.mensaje = '';
    this.cargando = true;

    // Validar campos
    if (!this.nombre || !this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      this.cargando = false;
      return;
    }

    // Intentar registro
    const resultado = this.authService.register(this.nombre, this.email, this.password);

    if (resultado.success) {
      this.mensaje = '¡Registro exitoso! Ahora inicia sesión.';
      this.error = '';
      this.limpiarFormulario();
      
      // Cambiar a modo login después de 2 segundos
      setTimeout(() => {
        this.cambiarModo();
      }, 2000);
    } else {
      this.error = resultado.error || 'Error al registrar usuario';
    }

    this.cargando = false;
  }

  /**
   * Cambiar entre login y registro
   */
  cambiarModo(): void {
    this.esRegistro = !this.esRegistro;
    this.error = '';
    this.mensaje = '';
    this.limpiarFormulario();
  }

  /**
   * Limpiar formulario
   */
  private limpiarFormulario(): void {
    this.email = '';
    this.password = '';
    this.nombre = '';
  }
}