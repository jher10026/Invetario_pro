/* ===================================
   RUTAS DE LA APLICACIÓN - CORREGIDAS
   Archivo: src/app/app.routes.ts
   
   ✅ Usa authGuard (funcional) correctamente
   =================================== */

import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Inventario } from './components/inventario/inventario';
import { Categorias } from './components/categorias/categorias';
import { authGuard } from './guards/auth.guard'; // ⚠️ Importa authGuard (funcional)

export const routes: Routes = [
  // Ruta de login (sin protección)
  {
    path: 'login',
    component: Login
  },

  // Rutas protegidas con authGuard
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard] // ⚠️ usa authGuard (minúscula)
  },

  {
    path: 'inventario',
    component: Inventario,
    canActivate: [authGuard]
  },

  {
    path: 'categorias',
    component: Categorias,
    canActivate: [authGuard]
  },

  // Ruta por defecto
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Ruta para URLs no encontradas
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];