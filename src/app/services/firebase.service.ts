/* ===================================
   SERVICIO DE FIREBASE - CON SISTEMA DE ROLES
   Archivo: src/app/services/firebase.service.ts
   
   ✅ Sistema de roles implementado
   ✅ Métodos para verificar permisos
   =================================== */

import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../models/producto.model';
import { Categoria } from '../models/categoria.model';
import { Usuario, UserRole, RolePermissions } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private currentUserSubject = new BehaviorSubject<Usuario | null | undefined>(undefined);
  public currentUser$ = this.currentUserSubject.asObservable();

  private procesandoRegistroSubject = new BehaviorSubject<boolean>(false);
  public procesandoRegistro$ = this.procesandoRegistroSubject.asObservable();

  constructor() {
    console.log('🔥 Firebase Service inicializado');
    this.inicializarAuthListener();
  }

  // ============================================
  //  INICIALIZACIÓN
  // ============================================

  private inicializarAuthListener(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (this.procesandoRegistroSubject.value) {
        console.log('⏸️ Ignorando cambio de auth durante registro');
        return;
      }

      console.log('🔔 Firebase Auth cambió:', firebaseUser?.email || 'Sin usuario');
      
      if (firebaseUser) {
        const userData = await this.obtenerDatosUsuario(firebaseUser.uid);
        console.log('👤 Datos del usuario cargados:', userData);
        this.currentUserSubject.next(userData);
      } else {
        console.log('👋 No hay usuario autenticado');
        this.currentUserSubject.next(null);
      }
    });
  }

  // ============================================
  //  AUTENTICACIÓN
  // ============================================

  async registrarUsuario(
    email: string,
    password: string,
    name: string,
    role: UserRole = 'user' // 🆕 Parámetro de rol
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📝 Iniciando registro para:', email, 'con rol:', role);

      this.procesandoRegistroSubject.next(true);

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      console.log('✅ Usuario creado en Auth:', userCredential.user.uid);

      // 🆕 Guardar con rol
      const usuarioData = {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        role: role, // 🆕 Rol asignado
        createdAt: Timestamp.now()
      };

      const usuarioRef = doc(this.firestore, 'usuarios', userCredential.user.uid);
      await setDoc(usuarioRef, usuarioData);

      console.log('✅ Datos guardados en Firestore:', usuarioData);

      await signOut(this.auth);
      console.log('🔓 Sesión cerrada - usuario debe iniciar sesión manualmente');

      setTimeout(() => {
        this.procesandoRegistroSubject.next(false);
      }, 500);

      return { success: true, message: '¡Registro exitoso!' };

    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      this.procesandoRegistroSubject.next(false);
      return this.manejarErrorAuth(error);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔐 Iniciando sesión:', email);

      await signInWithEmailAndPassword(this.auth, email, password);
      
      // 🆕 Actualizar lastLogin
      const user = this.auth.currentUser;
      if (user) {
        const usuarioRef = doc(this.firestore, 'usuarios', user.uid);
        await updateDoc(usuarioRef, { lastLogin: Timestamp.now() });
      }
      
      console.log('✅ Sesión iniciada correctamente');
      return { success: true, message: 'Sesión iniciada correctamente' };

    } catch (error: any) {
      console.error('❌ Error en login:', error);
      return this.manejarErrorAuth(error);
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('👋 Cerrando sesión...');
      await signOut(this.auth);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  }

  obtenerUsuarioActual(): Usuario | null | undefined {
    return this.currentUserSubject.value;
  }

  estaAutenticado(): boolean {
    const usuario = this.currentUserSubject.value;
    return usuario !== null && usuario !== undefined;
  }

  // ============================================
  //  🆕 MÉTODOS DE ROLES Y PERMISOS
  // ============================================

  /**
   * Obtener rol del usuario actual
   */
  obtenerRolActual(): UserRole | null {
    const usuario = this.currentUserSubject.value;
    return usuario ? usuario.role : null;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  tieneRol(rol: UserRole): boolean {
    const usuario = this.currentUserSubject.value;
    return usuario?.role === rol;
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  tieneAlgunRol(roles: UserRole[]): boolean {
    const usuario = this.currentUserSubject.value;
    return usuario ? roles.includes(usuario.role) : false;
  }

  /**
   * Verificar si es admin
   */
  esAdmin(): boolean {
    return this.tieneRol('admin');
  }

  /**
   * Verificar si es usuario normal
   */
  esUsuario(): boolean {
    return this.tieneRol('user');
  }

  /**
   * Verificar si es invitado
   */
  esInvitado(): boolean {
    return this.tieneRol('guest');
  }

  /**
   * Obtener permisos del usuario actual
   */
  obtenerPermisos() {
    const rol = this.obtenerRolActual();
    return rol ? RolePermissions[rol] : null;
  }

  /**
   * Verificar si tiene permiso específico
   */
  tienePermiso(permiso: keyof typeof RolePermissions.admin): boolean {
    const permisos = this.obtenerPermisos();
    return permisos ? permisos[permiso] : false;
  }

  /**
   * 🆕 Actualizar rol de un usuario (solo admin)
   */
  async actualizarRol(userId: string, nuevoRol: UserRole): Promise<boolean> {
    try {
      if (!this.esAdmin()) {
        console.error('❌ Solo admins pueden cambiar roles');
        return false;
      }

      const usuarioRef = doc(this.firestore, 'usuarios', userId);
      await updateDoc(usuarioRef, { role: nuevoRol });
      
      console.log(`✅ Rol actualizado a: ${nuevoRol}`);
      return true;
    } catch (error) {
      console.error('❌ Error al actualizar rol:', error);
      return false;
    }
  }

  // ============================================
  //  PRODUCTOS (sin cambios)
  // ============================================

  async obtenerProductos(): Promise<Producto[]> {
    try {
      const user = this.auth.currentUser;
      if (!user) return [];

      const productosRef = collection(this.firestore, 'productos');
      const q = query(
        productosRef,
        where('userId', '==', user.uid),
        orderBy('fecha', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id) || Date.now(),
        ...doc.data(),
        _firestoreId: doc.id
      } as any));
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  async agregarProducto(producto: Omit<Producto, 'id'>): Promise<Producto | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      const docRef = await addDoc(collection(this.firestore, 'productos'), {
        ...producto,
        userId: user.uid,
        createdAt: Timestamp.now()
      });

      return {
        id: Date.now(),
        ...producto,
        _firestoreId: docRef.id
      } as any;
    } catch (error) {
      console.error('Error al agregar producto:', error);
      return null;
    }
  }

  async actualizarProducto(
    firestoreId: string,
    producto: Partial<Producto>
  ): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, 'productos', firestoreId);
      await updateDoc(docRef, { ...producto });
      return true;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return false;
    }
  }

  async eliminarProducto(firestoreId: string): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, 'productos', firestoreId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return false;
    }
  }

  // ============================================
  //  CATEGORÍAS (sin cambios)
  // ============================================

  async obtenerCategorias(): Promise<Categoria[]> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return [
          { id: 1, nombre: 'Electrónica', color: '#3b82f6' },
          { id: 2, nombre: 'Ropa', color: '#ec4899' },
          { id: 3, nombre: 'Hogar', color: '#fb923c' },
          { id: 4, nombre: 'Gaming', color: '#a855f7' }
        ];
      }

      const categoriasRef = collection(this.firestore, 'categorias');
      const q = query(categoriasRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return await this.crearCategoriasDefecto(user.uid);
      }

      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id) || Date.now(),
        ...doc.data(),
        _firestoreId: doc.id
      } as any));
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  }

  private async crearCategoriasDefecto(userId: string): Promise<Categoria[]> {
    const categoriasDefecto = [
      { nombre: 'Electrónica', color: '#3b82f6' },
      { nombre: 'Ropa', color: '#ec4899' },
      { nombre: 'Hogar', color: '#fb923c' },
      { nombre: 'Gaming', color: '#a855f7' }
    ];

    const categorias: Categoria[] = [];

    for (const cat of categoriasDefecto) {
      const docRef = await addDoc(collection(this.firestore, 'categorias'), {
        ...cat,
        userId,
        createdAt: Timestamp.now()
      });

      categorias.push({
        id: Date.now() + Math.random(),
        ...cat,
        _firestoreId: docRef.id
      } as any);
    }

    return categorias;
  }

  async agregarCategoria(categoria: Omit<Categoria, 'id'>): Promise<Categoria | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      const docRef = await addDoc(collection(this.firestore, 'categorias'), {
        ...categoria,
        userId: user.uid,
        createdAt: Timestamp.now()
      });

      return {
        id: Date.now(),
        ...categoria,
        _firestoreId: docRef.id
      } as any;
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      return null;
    }
  }

  async actualizarCategoria(
    firestoreId: string,
    categoria: Partial<Categoria>
  ): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, 'categorias', firestoreId);
      await updateDoc(docRef, { ...categoria });
      return true;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      return false;
    }
  }

  async eliminarCategoria(firestoreId: string): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, 'categorias', firestoreId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      return false;
    }
  }

  // ============================================
  //  MÉTODOS PRIVADOS
  // ============================================

  private async obtenerDatosUsuario(uid: string): Promise<Usuario | null> {
    try {
      console.log('🔥 Buscando datos del usuario en Firestore, UID:', uid);
      
      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where('uid', '==', uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        console.log('✅ Datos encontrados en Firestore:', userData);
        
        return {
          username: userData['email'],
          password: '',
          name: userData['name'],
          email: userData['email'],
          role: userData['role'] || 'user', // 🆕 Incluir rol
          photoURL: userData['photoURL'] || undefined // 🆕 Incluir foto
        };
      }

      const authUser = this.auth.currentUser;
      if (authUser) {
        console.warn('⚠️ Usuario no encontrado en Firestore, creando documento...');
        
        const nuevoUsuario = {
          uid: authUser.uid,
          name: authUser.displayName || authUser.email?.split('@')[0] || 'Usuario',
          email: authUser.email || '',
          role: 'user', // 🆕 Rol por defecto
          createdAt: Timestamp.now()
        };

        const usuarioRef = doc(this.firestore, 'usuarios', authUser.uid);
        await setDoc(usuarioRef, nuevoUsuario);
        
        console.log('✅ Documento de usuario creado en Firestore');

        return {
          username: nuevoUsuario.email,
          password: '',
          name: nuevoUsuario.name,
          email: nuevoUsuario.email,
          role: nuevoUsuario.role as UserRole
        };
      }

      console.error('❌ No se pudo obtener datos del usuario');
      return null;
    } catch (error) {
      console.error('❌ Error al obtener datos de usuario:', error);
      
      const authUser = this.auth.currentUser;
      if (authUser) {
        console.warn('⚠️ Usando datos de Auth como fallback');
        return {
          username: authUser.email || 'Usuario',
          password: '',
          name: authUser.displayName || authUser.email?.split('@')[0] || 'Usuario',
          email: authUser.email || '',
          role: 'user'
        };
      }
      
      return null;
    }
  }

  private manejarErrorAuth(error: any): { success: boolean; message: string } {
    let mensaje = 'Error desconocido';

    switch (error.code) {
      case 'auth/email-already-in-use':
        mensaje = 'Este correo ya está registrado';
        break;
      case 'auth/weak-password':
        mensaje = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/invalid-email':
        mensaje = 'El correo electrónico no es válido';
        break;
      case 'auth/user-not-found':
        mensaje = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        mensaje = 'Contraseña incorrecta';
        break;
      case 'auth/invalid-credential':
        mensaje = 'Credenciales inválidas. Verifica tu correo y contraseña';
        break;
      case 'auth/too-many-requests':
        mensaje = 'Demasiados intentos. Intenta más tarde';
        break;
      default:
        mensaje = `Error: ${error.message}`;
    }

    return { success: false, message: mensaje };
  }
}