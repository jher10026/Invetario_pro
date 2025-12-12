/* ===================================
   RUTAS - VERSIÓN TEMPORAL
   Archivo: src/app/app.routes.ts
   
   ✅ Lazy loading en Reportes
   ⏸️ Detalle y 404 comentados hasta crear componentes
   =================================== */

import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Inventario } from './components/inventario/inventario';
import { Categorias } from './components/categorias/categorias';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

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
    canActivate: [authGuard]
  },

  {
    path: 'inventario',
    component: Inventario,
    canActivate: [authGuard]
  },

  // ⏸️ COMENTADO TEMPORALMENTE - Descomentar cuando crees el componente
  {
    path: 'inventario/:id',
    loadComponent: () => import('./components/inventario/detalle-producto/detalle-producto')
      .then(m => m.DetalleProducto),
    canActivate: [authGuard]
  },
  

  {
    path: 'categorias',
    component: Categorias,
    canActivate: [authGuard]
  },

  // ✅ LAZY LOADING - Reportes
  {
    path: 'reportes',
    loadComponent: () => import('./components/reportes/reportes')
      .then(m => m.Reportes),
    canActivate: [authGuard, roleGuard]
  },

  // Ruta por defecto
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },


  {
    path: 'not-found',
    loadComponent: () => import('./components/not-found/not-found')
      .then(m => m.NotFound)
  },
  

  // Ruta para URLs no encontradas (temporal)
  {
    path: '**',
    redirectTo: '/dashboard'  // ⚠️ Cambiar a '/not-found' después
  }
];