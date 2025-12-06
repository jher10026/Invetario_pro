import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Inventario } from './components/inventario/inventario';
import { Categorias } from './components/categorias/categorias';
import { authGuard } from './guards/auth.guard';
import { roleGuard, adminGuard } from './guards/role.guard'; // 🆕 Importar

export const routes: Routes = [
  { path: 'login', component: Login },
  
  // Rutas con authGuard + roleGuard
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard, roleGuard(['admin', 'user'])] // Solo admin y user
  },
  
  {
    path: 'inventario',
    component: Inventario,
    canActivate: [authGuard, roleGuard(['admin', 'user'])]
  },
  
  {
    path: 'categorias',
    component: Categorias,
    canActivate: [authGuard, adminGuard] // 🆕 Solo admins
  },
  
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];