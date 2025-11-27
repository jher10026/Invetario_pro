/* ===================================
   VARIABLES DE ENTORNO
   Archivo: src/environments/environment.ts
   
   IMPORTANTE: Reemplaza estos valores con tu
   configuración real de Firebase
   =================================== */

export const environment = {
  production: false,
  
  // Tu configuración de Firebase
  // La obtienes desde: Firebase Console > Project Settings > General
  firebaseConfig: {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
  }
};

/* ===================================
   PASOS PARA OBTENER TU CONFIGURACIÓN:
   
   1. Ve a Firebase Console: https://console.firebase.google.com
   2. Crea un nuevo proyecto o selecciona uno existente
   3. Ve a Project Settings (ícono de engranaje)
   4. En la sección "Your apps", selecciona Web (ícono </>)
   5. Registra tu app y copia la configuración
   6. Pega los valores aquí
   =================================== */