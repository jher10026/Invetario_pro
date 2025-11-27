/* ===================================
   GUARD DE AUTENTICACIÓN - VERSIÓN CORREGIDA
   Archivo: src/app/guards/auth.guard.ts
   
   ✅ Espera correctamente a Firebase
   ✅ Maneja todos los estados posibles
   =================================== */

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { map, filter, take, timeout } from 'rxjs/operators';
import { catchError, of } from 'rxjs';

/**
 * Guard funcional que protege rutas
 * Solo permite acceso si el usuario está autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const firebaseService = inject(FirebaseService);
  const router = inject(Router);

  console.log('🛡️ Auth Guard activado para:', state.url);

  return firebaseService.currentUser$.pipe(
    // Esperar máximo 5 segundos a que Firebase cargue
    timeout(5000),
    
    // Filtrar undefined (estado de carga)
    filter(user => user !== undefined),
    
    // Tomar solo el primer valor válido
    take(1),
    
    // Evaluar si puede acceder
    map(user => {
      if (user === null) {
        // No autenticado - redirigir a login
        console.log('🚫 Auth Guard - No autenticado, redirigiendo a login');
        router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url } 
        });
        return false;
      }

      // Usuario autenticado - permitir acceso
      console.log('✅ Auth Guard - Acceso permitido para:', user.name);
      return true;
    }),
    
    // Manejo de errores (timeout, etc)
    catchError(error => {
      console.error('❌ Auth Guard - Error:', error);
      router.navigate(['/login']);
      return of(false);
    })
  );
};