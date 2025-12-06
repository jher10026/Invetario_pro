/* ===================================
   MODELO DE USUARIO CON ROLES
   =================================== */

export type UserRole = 'admin' | 'user' | 'guest';

export interface Usuario {
  uid?: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string; // ✅ Agregar photoURL
  createdAt?: Date;
  lastLogin?: Date;
}

export interface UsuarioFirestore {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
  createdAt: any;
  lastLogin?: any;
}

// ✅ Exportar RolePermissions
export const RolePermissions = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canViewReports: true,
    canManageUsers: true,
    canUploadImages: true
  },
  user: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canViewReports: true,
    canManageUsers: false,
    canUploadImages: true
  },
  guest: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canViewReports: true,
    canManageUsers: false,
    canUploadImages: false
  }
};