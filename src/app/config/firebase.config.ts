/* ===================================
   CONFIGURACIÓN DE FIREBASE
   Archivo: src/app/config/firebase.config.ts
   =================================== */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase (obtenerla desde Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDoW4ARfGWBCd2cbFeK9F4a_I89-3jNQyE",
  authDomain: "inventario-productos-c366d.firebaseapp.com",
  databaseURL: "https://inventario-productos-c366d-default-rtdb.firebaseio.com",
  projectId: "inventario-productos-c366d",
  storageBucket: "inventario-productos-c366d.firebasestorage.app",
  messagingSenderId: "56383434870",
  appId: "1:56383434870:web:e5aa493a421416d0b3af57"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);