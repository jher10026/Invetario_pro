/* ===================================
   SERVICIO DE AUTENTICACIÓN
   Archivo: src/app/services/auth.service.ts
   =================================== */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Variable para guardar el usuario actual
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Lista de usuarios (como en tu app original)
  private usuarios: Usuario[] = [
    { 
      username: 'admin', 
      password: '12345', 
      name: 'Administrador', 
      email: 'admin@inventario.com', 
      role: 'admin' 
    },
    { 
      username: 'user', 
      password: '12345', 
      name: 'Usuario Demo', 
      email: 'user@inventario.com', 
      role: 'user' 
    }
  ];

  constructor() {
    // Cargar usuario guardado si existe
    this.cargarUsuarioGuardado();
  }

  /**
   * Intenta iniciar sesión con usuario y contraseña
   */
  login(username: string, password: string): boolean {
    const usuario = this.usuarios.find(
      u => u.username === username && u.password === password
    );

    if (usuario) {
      // Guardar usuario en localStorage
      localStorage.setItem('currentUser', JSON.stringify(usuario));
      this.currentUserSubject.next(usuario);
      return true;
    }

    return false;
  }

  /**
   * Registrar un nuevo usuario
   */
  registrar(usuario: Usuario): { success: boolean; message: string } {
    // Verificar si usuario ya existe
    if (this.usuarios.some(u => u.username === usuario.username)) {
      return { success: false, message: 'Este usuario ya existe' };
    }

    // Verificar si email ya existe
    if (this.usuarios.some(u => u.email === usuario.email)) {
      return { success: false, message: 'Este correo ya está registrado' };
    }

    // Agregar nuevo usuario
    this.usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(this.usuarios));

    return { success: true, message: '¡Registro exitoso!' };
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Obtener usuario actual
   */
  obtenerUsuarioActual(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si usuario está autenticado
   */
  estaAutenticado(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Cargar usuario guardado del localStorage
   */
  private cargarUsuarioGuardado(): void {
    const usuarioGuardado = localStorage.getItem('currentUser');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      this.currentUserSubject.next(usuario);
    }
  }

  /**
   * Limpiar todos los datos (para debugging)
   */
  limpiarDatos(): void {
    localStorage.clear();
    this.currentUserSubject.next(null);
  }
}