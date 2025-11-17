import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  UserCredential
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc,
  docData
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private firebaseUser: User | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    // Escuchar cambios en el estado de autenticación
    onAuthStateChanged(this.auth, async (user) => {
      this.firebaseUser = user;
      if (user) {
        await this.loadUserData(user.uid);
        this.isAuthenticatedSubject.next(true);
      } else {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
    });
  }

  /**
   * Cargar datos del usuario desde Firestore
   */
  private async loadUserData(uid: string): Promise<void> {
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as Usuario;
      this.currentUserSubject.next(userData);
    }
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.loadUserData(userCredential.user.uid);
      this.router.navigate(['/dashboard']);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(
    nombre: string, 
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Crear documento del usuario en Firestore
      const nuevoUsuario: Usuario = {
        id: userCredential.user.uid,
        nombre,
        email,
        password: '', // No guardamos la contraseña en Firestore
        rol: 'usuario',
        fechaRegistro: new Date()
      };

      const userDocRef = doc(this.firestore, `usuarios/${userCredential.user.uid}`);
      await setDoc(userDocRef, nuevoUsuario);

      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin(): boolean {
    const usuario = this.getCurrentUser();
    return usuario?.rol === 'admin';
  }

  /**
   * Obtener UID de Firebase
   */
  getFirebaseUid(): string | null {
    return this.firebaseUser?.uid || null;
  }

  /**
   * Traducir códigos de error de Firebase
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión'
    };

    return errorMessages[errorCode] || 'Error de autenticación';
  }
}