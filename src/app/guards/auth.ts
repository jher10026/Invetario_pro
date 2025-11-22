/* ===================================
   GUARD DE AUTENTICACIÓN
   Archivo: src/app/guards/auth.guard.ts
   
   ¿Qué hace? Protege las rutas para que
   solo usuarios autenticados puedan acceder
   =================================== */

import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

/**
 * Guard funcional para proteger rutas
 * En Angular 20 es mejor usar guards funcionales
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario está autenticado, permitir acceso
  if (authService.estaAutenticado()) {
    return true;
  }

  // Si no está autenticado, redirigir a login
  router.navigate(['/login']);
  return false;
};

/**
 * Guard basado en clase (alternativa, por si lo necesitas)
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.estaAutenticado()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}