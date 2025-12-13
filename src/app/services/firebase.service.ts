/* ============================================================================
   🔥 SERVICIO DE FIREBASE
   ============================================================================
   
   📌 PROPÓSITO:
   Es el servicio PRINCIPAL de la aplicación. Maneja toda la comunicación
   con Firebase (autenticación y base de datos Firestore).
   
   🔧 FUNCIONALIDADES:
   
   🔐 AUTENTICACIÓN:
   - Registrar nuevos usuarios
   - Iniciar sesión con email/password
   - Iniciar sesión con Google
   - Cerrar sesión
   - Verificar estado de autenticación
   - Detectar rol de usuario (admin/user)
   
   📦 PRODUCTOS (CRUD):
   - Obtener todos los productos
   - Agregar nuevo producto
   - Actualizar producto existente
   - Eliminar producto
   
   📂 CATEGORÍAS (CRUD):
   - Obtener todas las categorías
   - Crear categorías por defecto
   - Agregar nueva categoría
   - Actualizar categoría existente
   - Eliminar categoría
   
   👤 PERFIL DE USUARIO:
   - Actualizar foto de perfil
   - Eliminar foto de perfil
   
   📁 Archivo: src/app/services/firebase.service.ts
   ============================================================================ */

// ==========================================
// 📦 IMPORTACIONES DE ANGULAR
// ==========================================
import { Injectable, inject } from '@angular/core';
// Injectable: Decorador que permite que este servicio sea inyectado en otros componentes
// inject: Función moderna para inyectar dependencias

// ==========================================
// 🔐 IMPORTACIONES DE FIREBASE AUTH
// ==========================================
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from '@angular/fire/auth';
// Auth: Servicio de autenticación de Firebase
// createUserWithEmailAndPassword: Crear usuario con email y contraseña
// signInWithEmailAndPassword: Iniciar sesión con email y contraseña
// signInWithPopup: Iniciar sesión con popup (para Google, Facebook, etc.)
// GoogleAuthProvider: Proveedor de autenticación de Google
// signOut: Cerrar sesión
// onAuthStateChanged: Listener que detecta cambios en el estado de autenticación

// ==========================================
// 📊 IMPORTACIONES DE FIRESTORE
// ==========================================
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
// Firestore: Base de datos NoSQL de Firebase
// collection: Referencia a una colección (tabla)
// addDoc: Agregar documento con ID automático
// updateDoc: Actualizar documento existente
// deleteDoc: Eliminar documento
// doc: Referencia a un documento específico
// getDocs: Obtener múltiples documentos
// query: Crear consulta con filtros
// where: Filtro condicional
// orderBy: Ordenar resultados
// Timestamp: Tipo de dato para fechas en Firestore
// setDoc: Crear/sobrescribir documento con ID específico

// ==========================================
// 📦 IMPORTACIONES DE RXJS
// ==========================================
import { BehaviorSubject } from 'rxjs';
// BehaviorSubject: Observable que guarda el último valor emitido
// Útil para mantener el estado del usuario actual

// ==========================================
// 📦 IMPORTACIONES DE MODELOS
// ==========================================
import { Producto } from '../models/producto.model';
import { Categoria } from '../models/categoria.model';
import { Usuario } from '../models/usuario.model';

// ==========================================
// 🎨 CONFIGURACIÓN DEL SERVICIO
// ==========================================
@Injectable({
  providedIn: 'root'  // El servicio está disponible en toda la aplicación
})
export class FirebaseService {

  // ==========================================
  // 🔌 INYECCIÓN DE SERVICIOS DE FIREBASE
  // ==========================================

  private auth = inject(Auth);
  // Servicio de autenticación de Firebase

  private firestore = inject(Firestore);
  // Servicio de base de datos Firestore

  // ==========================================
  // 👤 ESTADO DEL USUARIO ACTUAL
  // ==========================================

  /**
   * BehaviorSubject para el usuario actual
   * 
   * Posibles valores:
   * - undefined: Aún no se ha verificado (estado inicial)
   * - null: No hay usuario autenticado
   * - Usuario: Usuario autenticado
   * 
   * Usamos BehaviorSubject porque:
   * 1. Guarda el último valor emitido
   * 2. Los nuevos suscriptores reciben el valor actual inmediatamente
   * 3. Podemos obtener el valor actual con .value
   */
  private currentUserSubject = new BehaviorSubject<Usuario | null | undefined>(undefined);

  // Observable público para que los componentes se suscriban
  public currentUser$ = this.currentUserSubject.asObservable();

  // ==========================================
  // 🔄 ESTADO DE PROCESANDO REGISTRO
  // ==========================================

  /**
   * Bloquea los cambios de autenticación durante el registro.
   * 
   * Problema que resuelve:
   * Cuando un usuario se registra, Firebase automáticamente lo loguea.
   * Pero nosotros queremos que el usuario inicie sesión manualmente después.
   * Este flag evita que la UI responda al login automático.
   */
  private procesandoRegistroSubject = new BehaviorSubject<boolean>(false);
  public procesandoRegistro$ = this.procesandoRegistroSubject.asObservable();

  // ==========================================
  // 🏗️ CONSTRUCTOR
  // ==========================================

  constructor() {
    console.log('🔥 Firebase Service inicializado');
    // Iniciar el listener de autenticación
    this.inicializarAuthListener();
  }

  // ============================================
  //  🔄 LISTENER DE AUTENTICACIÓN
  // ============================================

  /**
   * 👂 INICIALIZAR LISTENER DE AUTENTICACIÓN
   * ------------------------------------------
   * Escucha cambios en el estado de autenticación de Firebase.
   * 
   * Se ejecuta cuando:
   * - El usuario inicia sesión
   * - El usuario cierra sesión
   * - La página se recarga (verifica si hay sesión activa)
   * 
   * FLUJO:
   * 1. Firebase notifica cambio de auth
   * 2. Si hay usuario: obtener datos de Firestore
   * 3. Si no hay usuario: establecer null
   * 4. Actualizar el BehaviorSubject
   */
  private inicializarAuthListener(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      // Ignorar cambios durante el proceso de registro
      if (this.procesandoRegistroSubject.value) {
        console.log('⏸️ Ignorando cambio de auth durante registro');
        return;
      }

      console.log('🔔 Firebase Auth cambió:', firebaseUser?.email || 'Sin usuario');

      if (firebaseUser) {
        // Usuario autenticado: obtener datos completos de Firestore
        const userData = await this.obtenerDatosUsuario(firebaseUser.uid);
        console.log('👤 Datos del usuario cargados:', userData);
        this.currentUserSubject.next(userData);
      } else {
        // Sin usuario autenticado
        console.log('👋 No hay usuario autenticado');
        this.currentUserSubject.next(null);
      }
    });
  }

  // ============================================
  //  🔐 AUTENTICACIÓN
  // ============================================

  /**
   * 📝 REGISTRAR NUEVO USUARIO
   * ---------------------------
   * Crea una cuenta nueva y guarda datos adicionales en Firestore.
   * 
   * FLUJO:
   * 1. Activar flag de "procesando" (bloquea el auth listener)
   * 2. Crear usuario en Firebase Auth
   * 3. Guardar datos adicionales (nombre, rol) en Firestore
   * 4. Cerrar sesión automáticamente
   * 5. Desactivar flag de "procesando"
   * 6. El usuario debe iniciar sesión manualmente
   * 
   * @param email - Email del nuevo usuario
   * @param password - Contraseña (mínimo 6 caracteres)
   * @param name - Nombre completo
   * @returns Objeto con success y message
   */
  async registrarUsuario(
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📝 Iniciando registro para:', email);

      // Bloquear el auth listener durante el registro
      this.procesandoRegistroSubject.next(true);

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      console.log('✅ Usuario creado en Auth:', userCredential.user.uid);

      // Preparar datos adicionales para Firestore
      const usuarioData = {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        role: 'user',  // Por defecto todos son usuarios normales
        createdAt: Timestamp.now()  // Fecha de creación
      };

      // Guardar en la colección 'usuarios' con el UID como ID del documento
      const usuarioRef = doc(this.firestore, 'usuarios', userCredential.user.uid);
      await setDoc(usuarioRef, usuarioData);

      console.log('✅ Datos guardados en Firestore:', usuarioData);

      // Cerrar sesión inmediatamente
      // (el usuario debe iniciar sesión manualmente después del registro)
      await signOut(this.auth);
      console.log('🔓 Sesión cerrada - usuario debe iniciar sesión manualmente');

      // Desactivar el bloqueo después de un pequeño delay
      setTimeout(() => {
        this.procesandoRegistroSubject.next(false);
      }, 500);

      return { success: true, message: '¡Registro exitoso!' };

    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      // Desactivar bloqueo en caso de error
      this.procesandoRegistroSubject.next(false);
      return this.manejarErrorAuth(error);
    }
  }

  /**
   * 🔑 INICIAR SESIÓN CON EMAIL/PASSWORD
   * --------------------------------------
   * @param email - Email del usuario
   * @param password - Contraseña
   * @returns Objeto con success y message
   */
  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔐 Iniciando sesión:', email);

      // Firebase Auth maneja la autenticación
      await signInWithEmailAndPassword(this.auth, email, password);

      console.log('✅ Sesión iniciada correctamente');
      return { success: true, message: 'Sesión iniciada correctamente' };

    } catch (error: any) {
      console.error('❌ Error en login:', error);
      return this.manejarErrorAuth(error);
    }
  }

  /**
   * 🔵 INICIAR SESIÓN CON GOOGLE
   * -----------------------------
   * Abre un popup de Google para autenticar.
   * Si el usuario es nuevo, crea su documento en Firestore.
   * 
   * @returns Objeto con success y message
   */
  async loginConGoogle(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔐 Iniciando sesión con Google...');

      // Crear proveedor de Google
      const provider = new GoogleAuthProvider();

      // Abrir popup de autenticación
      const userCredential = await signInWithPopup(this.auth, provider);

      console.log('✅ Sesión con Google iniciada:', userCredential.user.email);

      // Verificar si el usuario ya existe en Firestore
      const existingUser = await this.obtenerDatosUsuario(userCredential.user.uid);

      if (!existingUser) {
        // Usuario nuevo: crear documento en Firestore
        const usuarioData = {
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || 'Usuario Google',
          email: userCredential.user.email || '',
          role: 'user',
          createdAt: Timestamp.now(),
          provider: 'google'  // Marcar que viene de Google
        };

        const usuarioRef = doc(this.firestore, 'usuarios', userCredential.user.uid);
        await setDoc(usuarioRef, usuarioData);

        console.log('✅ Usuario de Google guardado en Firestore:', usuarioData);
      }

      return { success: true, message: 'Sesión iniciada con Google' };

    } catch (error: any) {
      console.error('❌ Error en login con Google:', error);

      // Manejar errores específicos de popup
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, message: 'Inicio de sesión cancelado' };
      }
      if (error.code === 'auth/popup-blocked') {
        return { success: false, message: 'El popup fue bloqueado. Permite ventanas emergentes.' };
      }

      return this.manejarErrorAuth(error);
    }
  }

  /**
   * 🚪 CERRAR SESIÓN
   * -----------------
   * Termina la sesión actual del usuario.
   */
  async logout(): Promise<void> {
    try {
      console.log('👋 Cerrando sesión...');
      await signOut(this.auth);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  }

  /**
   * 👤 OBTENER USUARIO ACTUAL (síncrono)
   * --------------------------------------
   * Retorna el valor actual del usuario sin suscribirse.
   * Útil para verificaciones rápidas.
   * 
   * @returns Usuario actual, null si no hay, undefined si no se ha verificado
   */
  obtenerUsuarioActual(): Usuario | null | undefined {
    return this.currentUserSubject.value;
  }

  /**
   * ✅ VERIFICAR SI ESTÁ AUTENTICADO
   * ---------------------------------
   * @returns true si hay un usuario logueado
   */
  estaAutenticado(): boolean {
    const usuario = this.currentUserSubject.value;
    return usuario !== null && usuario !== undefined;
  }

  /**
   * 👑 VERIFICAR SI ES ADMIN
   * -------------------------
   * @returns true si el usuario tiene rol de administrador
   */
  esAdmin(): boolean {
    const usuario = this.currentUserSubject.value;
    return usuario?.role === 'admin';
  }

  // ============================================
  //  📦 PRODUCTOS - CRUD
  // ============================================

  /**
   * 📋 OBTENER TODOS LOS PRODUCTOS
   * -------------------------------
   * Lee todos los documentos de la colección 'productos'.
   * Solo funciona si hay usuario autenticado.
   * 
   * @returns Array de productos ordenados por fecha
   */
  async obtenerProductos(): Promise<Producto[]> {
    try {
      const user = this.auth.currentUser;
      if (!user) return [];  // Sin usuario, sin productos

      // Referencia a la colección 'productos'
      const productosRef = collection(this.firestore, 'productos');

      // Crear consulta ordenada por fecha (más recientes primero)
      const q = query(
        productosRef,
        orderBy('fecha', 'desc')
      );

      // Ejecutar consulta
      const snapshot = await getDocs(q);

      // Mapear documentos a objetos Producto
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id) || Date.now(),
        ...doc.data(),
        _firestoreId: doc.id  // Guardar el ID de Firestore para actualizaciones
      } as any));
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  /**
   * ➕ AGREGAR NUEVO PRODUCTO
   * --------------------------
   * @param producto - Datos del producto (sin ID)
   * @returns El producto creado con su ID, o null si falla
   */
  async agregarProducto(producto: Omit<Producto, 'id'>): Promise<Producto | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      // Agregar documento con ID automático
      const docRef = await addDoc(collection(this.firestore, 'productos'), {
        ...producto,
        createdAt: Timestamp.now()  // Fecha de creación
      });

      // Retornar producto con IDs
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

  /**
   * ✏️ ACTUALIZAR PRODUCTO EXISTENTE
   * ----------------------------------
   * @param firestoreId - ID del documento en Firestore
   * @param producto - Campos a actualizar
   * @returns true si se actualizó correctamente
   */
  async actualizarProducto(
    firestoreId: string,
    producto: Partial<Producto>
  ): Promise<boolean> {
    try {
      // Obtener referencia al documento
      const docRef = doc(this.firestore, 'productos', firestoreId);

      // Actualizar campos
      await updateDoc(docRef, { ...producto });
      return true;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return false;
    }
  }

  /**
   * 🗑️ ELIMINAR PRODUCTO
   * ----------------------
   * @param firestoreId - ID del documento en Firestore
   * @returns true si se eliminó correctamente
   */
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
  //  📂 CATEGORÍAS - CRUD
  // ============================================

  /**
   * 📋 OBTENER TODAS LAS CATEGORÍAS
   * ---------------------------------
   * Lee las categorías desde Firestore.
   * Si no hay usuario, retorna array vacío.
   * Si no hay categorías, retorna array vacío (el usuario debe crearlas).
   * 
   * @returns Array de categorías
   */
  async obtenerCategorias(): Promise<Categoria[]> {
    try {
      const user = this.auth.currentUser;

      if (!user) {
        // Sin usuario: retornar array vacío
        return [];
      }

      // Obtener categorías de Firestore
      const categoriasRef = collection(this.firestore, 'categorias');
      const q = query(categoriasRef);
      const snapshot = await getDocs(q);

      // Si no hay categorías, retornar array vacío
      if (snapshot.empty) {
        return [];
      }

      // Mapear documentos a objetos Categoria
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

  // Método crearCategoriasDefecto eliminado - ya no se crean categorías automáticamente

  /**
   * ➕ AGREGAR NUEVA CATEGORÍA
   * ---------------------------
   * @param categoria - Datos de la categoría (sin ID)
   * @returns La categoría creada, o null si falla
   */
  async agregarCategoria(categoria: Omit<Categoria, 'id'>): Promise<Categoria | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      const docRef = await addDoc(collection(this.firestore, 'categorias'), {
        ...categoria,
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

  /**
   * ✏️ ACTUALIZAR CATEGORÍA EXISTENTE
   * -----------------------------------
   * @param firestoreId - ID del documento en Firestore
   * @param categoria - Campos a actualizar
   * @returns true si se actualizó correctamente
   */
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

  /**
   * 🗑️ ELIMINAR CATEGORÍA
   * -----------------------
   * @param firestoreId - ID del documento en Firestore
   * @returns true si se eliminó correctamente
   */
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
  //  👤 MÉTODOS PRIVADOS
  // ============================================

  /**
   * 🔍 OBTENER DATOS DEL USUARIO DESDE FIRESTORE
   * ----------------------------------------------
   * Busca los datos adicionales del usuario (nombre, rol, foto)
   * en la colección 'usuarios'.
   * 
   * Si el usuario no existe en Firestore (puede pasar con Google),
   * crea el documento automáticamente.
   * 
   * @param uid - UID del usuario de Firebase Auth
   * @returns Objeto Usuario con todos los datos
   */
  private async obtenerDatosUsuario(uid: string): Promise<Usuario | null> {
    try {
      console.log('🔥 Buscando datos del usuario en Firestore, UID:', uid);

      // Buscar por uid en la colección 'usuarios'
      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where('uid', '==', uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Usuario encontrado: mapear datos
        const userData = snapshot.docs[0].data();
        console.log('✅ Datos encontrados en Firestore:', userData);

        return {
          username: userData['email'],
          password: '',  // Nunca guardamos contraseñas
          name: userData['name'],
          email: userData['email'],
          role: (userData['role'] as 'admin' | 'user') || 'user',
          photoURL: userData['photoURL'] || undefined
        };
      }

      // Usuario no encontrado: crear documento
      const authUser = this.auth.currentUser;
      if (authUser) {
        console.warn('⚠️ Usuario no encontrado en Firestore, creando documento...');

        const nuevoUsuario = {
          uid: authUser.uid,
          name: authUser.displayName || authUser.email?.split('@')[0] || 'Usuario',
          email: authUser.email || '',
          role: 'user',
          createdAt: Timestamp.now(),
          photoURL: authUser.photoURL || ''
        };

        // Crear documento con UID como ID
        const usuarioRef = doc(this.firestore, 'usuarios', authUser.uid);
        await setDoc(usuarioRef, nuevoUsuario);

        console.log('✅ Documento de usuario creado en Firestore');

        return {
          username: nuevoUsuario.email,
          password: '',
          name: nuevoUsuario.name,
          email: nuevoUsuario.email,
          role: (nuevoUsuario.role as 'admin' | 'user') || 'user',
          photoURL: nuevoUsuario.photoURL || undefined
        };
      }

      console.error('❌ No se pudo obtener datos del usuario');
      return null;
    } catch (error) {
      console.error('❌ Error al obtener datos de usuario:', error);

      // Fallback: usar datos de Auth si falla Firestore
      const authUser = this.auth.currentUser;
      if (authUser) {
        console.warn('⚠️ Usando datos de Auth como fallback');
        return {
          username: authUser.email || 'Usuario',
          password: '',
          name: authUser.displayName || authUser.email?.split('@')[0] || 'Usuario',
          email: authUser.email || '',
          role: 'user',
          photoURL: authUser.photoURL || undefined
        };
      }

      return null;
    }
  }

  // ============================================
  //  👤 FOTO DE PERFIL
  // ============================================

  /**
   * 📷 ACTUALIZAR FOTO DE PERFIL
   * -----------------------------
   * Guarda la URL de la foto en Firestore y actualiza el estado local.
   * 
   * @param photoURL - URL de la imagen (de ImgBB u otro servicio)
   * @returns Objeto con success y message
   */
  async actualizarFotoPerfil(photoURL: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return { success: false, message: 'No hay usuario autenticado' };
      }

      console.log('📸 Actualizando foto de perfil:', photoURL);

      // Actualizar en Firestore
      const usuarioRef = doc(this.firestore, 'usuarios', user.uid);
      await updateDoc(usuarioRef, { photoURL });

      // Actualizar el estado local (BehaviorSubject)
      const currentUser = this.currentUserSubject.value;
      if (currentUser) {
        this.currentUserSubject.next({
          ...currentUser,
          photoURL
        });
      }

      console.log('✅ Foto de perfil actualizada');
      return { success: true, message: 'Foto actualizada correctamente' };

    } catch (error: any) {
      console.error('❌ Error al actualizar foto:', error);
      return { success: false, message: error.message || 'Error al actualizar foto' };
    }
  }

  /**
   * 🗑️ ELIMINAR FOTO DE PERFIL
   * ---------------------------
   * Quita la foto de perfil del usuario.
   * 
   * @returns Objeto con success y message
   */
  async eliminarFotoPerfil(): Promise<{ success: boolean; message: string }> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return { success: false, message: 'No hay usuario autenticado' };
      }

      console.log('🗑️ Eliminando foto de perfil');

      // Establecer photoURL vacío en Firestore
      const usuarioRef = doc(this.firestore, 'usuarios', user.uid);
      await updateDoc(usuarioRef, { photoURL: '' });

      // Actualizar estado local
      const currentUser = this.currentUserSubject.value;
      if (currentUser) {
        this.currentUserSubject.next({
          ...currentUser,
          photoURL: undefined
        });
      }

      console.log('✅ Foto de perfil eliminada');
      return { success: true, message: 'Foto eliminada correctamente' };

    } catch (error: any) {
      console.error('❌ Error al eliminar foto:', error);
      return { success: false, message: error.message || 'Error al eliminar foto' };
    }
  }

  // ============================================
  //  ❌ MANEJO DE ERRORES
  // ============================================

  /**
   * 🔧 CONVERTIR ERRORES DE FIREBASE A MENSAJES LEGIBLES
   * ------------------------------------------------------
   * Firebase retorna códigos de error en inglés.
   * Este método los convierte a mensajes amigables en español.
   * 
   * @param error - Error de Firebase
   * @returns Objeto con success: false y mensaje en español
   */
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