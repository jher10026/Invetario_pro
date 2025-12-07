/* ===================================
   GUARD DE ROLES
   Archivo: src/app/guards/role.guard.ts
   
   ✅ Protege rutas solo para admin
   =================================== */

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { map, filter, take, timeout } from 'rxjs/operators';
import { catchError, of } from 'rxjs';

/**
 * Guard que solo permite acceso a administradores
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const firebaseService = inject(FirebaseService);
  const router = inject(Router);

  console.log('🛡️ Role Guard activado para:', state.url);

  return firebaseService.currentUser$.pipe(
    timeout(5000),
    filter(user => user !== undefined),
    take(1),
    map(user => {
      if (user === null) {
        console.log('🚫 Role Guard - No autenticado');
        router.navigate(['/login']);
        return false;
      }

      if (user.role !== 'admin') {
        console.log('🚫 Role Guard - No es admin');
        router.navigate(['/dashboard']);
        return false;
      }

      console.log('✅ Role Guard - Admin permitido');
      return true;
    }),
    catchError(error => {
      console.error('❌ Role Guard - Error:', error);
      router.navigate(['/dashboard']);
      return of(false);
    })
  );
};