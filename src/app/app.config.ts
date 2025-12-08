import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

const firebaseConfig = {
  apiKey: "AIzaSyDoW4ARfGWBCd2cbFeK9F4a_I89-3jNQyE",
  authDomain: "inventario-productos-c366d.firebaseapp.com",
  databaseURL: "https://inventario-productos-c366d-default-rtdb.firebaseio.com",
  projectId: "inventario-productos-c366d",
  storageBucket: "inventario-productos-c366d.firebasestorage.app",
  messagingSenderId: "56383434870",
  appId: "1:56383434870:web:e5aa493a421416d0b3af57"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnimations()
  ]
};