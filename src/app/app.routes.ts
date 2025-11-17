import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Inventario } from './components/inventario/inventario';
import { Categorias } from './components/categorias/categorias';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto - redirige al dashboard si está autenticado, sino al login
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Ruta de login (pública)
  { path: 'login', component: Login },
  
  // Rutas protegidas (requieren autenticación)
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
  { 
    path: 'categorias', 
    component: Categorias,
    canActivate: [authGuard]
  },
  
  // Ruta para URLs no encontradas
  { path: '**', redirectTo: '/dashboard' }
];