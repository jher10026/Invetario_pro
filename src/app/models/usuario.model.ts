/* ===================================
   MODELO DE USUARIO - CON FOTO DE PERFIL
   Archivo: src/app/models/usuario.model.ts
   
   ✅ Incluye photoURL para foto de perfil
   =================================== */

export interface Usuario {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  photoURL?: string; // URL de la foto de perfil (ImgBB)
}