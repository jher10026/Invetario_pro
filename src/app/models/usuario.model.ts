/* ===================================
   MODELO DE USUARIO - SIMPLIFICADO
   Archivo: src/app/models/usuario.model.ts
   
   ✅ Sin distinción de roles (todos son "admin")
   =================================== */

export interface Usuario {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'user'; // Ya no necesitamos 'admin', todos tienen permisos completos
}