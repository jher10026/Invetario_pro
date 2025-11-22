/* ===================================
   CONFIGURACIÓN DE LA APLICACIÓN
   Archivo: src/app/app.config.ts
   
   ¿Qué hace? Configura los providers
   globales de la app
   =================================== */

import { 
  ApplicationConfig, 
  provideBrowserGlobalErrorListeners, 
  provideZoneChangeDetection 
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
    // FormsModule se importará directamente en cada componente que lo necesite
  ]
};