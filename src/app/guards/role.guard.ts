/* ===================================
   GUARD DE ROLES
   Archivo: src/app/guards/role.guard.ts
   
   ✅ Protege rutas por rol de usuario
   ✅ Funciona con authGuard existente
   =================================== */

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UserRole } from '../models/usuario.model';

/**
 * Guard para verificar roles específicos
 * Uso: canActivate: [roleGuard(['admin', 'user'])]
 */
export const roleGuard = (rolesPermitidos: UserRole[]): CanActivateFn => {
  return () => {
    const firebaseService = inject(FirebaseService);
    const router = inject(Router);

    const usuario = firebaseService.obtenerUsuarioActual();

    // Si no hay usuario, redirigir a login
    if (!usuario) {
      console.warn('⚠️ No hay usuario autenticado');
      router.navigate(['/login']);
      return false;
    }

    // Verificar si el rol del usuario está en la lista permitida
    const tieneAcceso = rolesPermitidos.includes(usuario.role);

    if (!tieneAcceso) {
      console.warn(`⛔ Acceso denegado. Rol requerido: ${rolesPermitidos.join(' o ')}, Rol actual: ${usuario.role}`);
      router.navigate(['/dashboard']); // Redirigir a dashboard si no tiene permiso
      return false;
    }

    console.log(`✅ Acceso permitido. Rol: ${usuario.role}`);
    return true;
  };
};

/**
 * Guard específico para admins
 * Uso: canActivate: [adminGuard]
 */
export const adminGuard: CanActivateFn = () => {
  const firebaseService = inject(FirebaseService);
  const router = inject(Router);

  const usuario = firebaseService.obtenerUsuarioActual();

  if (!usuario) {
    console.warn('⚠️ No hay usuario autenticado');
    router.navigate(['/login']);
    return false;
  }

  if (usuario.role !== 'admin') {
    console.warn('⛔ Se requiere rol de admin');
    router.navigate(['/dashboard']);
    return false;
  }

  console.log('✅ Acceso admin permitido');
  return true;
};

/**
 * Guard para verificar permisos específicos
 * Uso: canActivate: [permissionGuard('canDelete')]
 */
export const permissionGuard = (permiso: string): CanActivateFn => {
  return () => {
    const firebaseService = inject(FirebaseService);
    const router = inject(Router);

    const tienePermiso = firebaseService.tienePermiso(permiso as any);

    if (!tienePermiso) {
      console.warn(`⛔ Permiso denegado: ${permiso}`);
      router.navigate(['/dashboard']);
      return false;
    }

    console.log(`✅ Permiso concedido: ${permiso}`);
    return true;
  };
};