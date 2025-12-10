/* ===================================
   COMPONENTE RAÍZ - FASE 2
   Archivo: src/app/app.ts
   
   ✅ Actualizado para usar Firebase
   ✅ Loading screen global mientras cargan los datos
   =================================== */

import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import { ProductosService } from './services/productos.service';
import { CategoriasService } from './services/categorias.service';
import { Sidebar } from './components/shared/sidebar/sidebar';
import { Toast } from './components/shared/toast/toast';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    Sidebar,
    Toast
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('inventario_pro1');
  
  // Inyección de servicios
  private productosService = inject(ProductosService);
  private categoriasService = inject(CategoriasService);
  
  // Observable que indica si el usuario está autenticado
  usuarioAutenticado$ = signal(false);
  cargandoAuth = signal(true);
  
  // 🆕 Estado de carga de datos (productos/categorías)
  cargandoDatos = signal(true);
  primeraNavegacion = signal(true);

  // 🆕 Computed: mostrar loading global solo en primera navegación tras login
  mostrarLoadingGlobal = computed(() => {
    return this.usuarioAutenticado$() && 
           this.primeraNavegacion() && 
           this.cargandoDatos();
  });

  // 🆕 Computed: mostrar layout completo cuando todo esté listo
  layoutListo = computed(() => {
    if (!this.usuarioAutenticado$()) return false;
    if (this.primeraNavegacion() && this.cargandoDatos()) return false;
    return true;
  });

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 App iniciada');

    // Suscribirse a cambios de autenticación
    this.firebaseService.currentUser$.subscribe(user => {
      console.log('👤 App - Estado de usuario:', user);

      // undefined = cargando
      if (user === undefined) {
        this.cargandoAuth.set(true);
        this.usuarioAutenticado$.set(false);
        return;
      }

      // null = no autenticado
      if (user === null) {
        this.cargandoAuth.set(false);
        this.usuarioAutenticado$.set(false);
        this.primeraNavegacion.set(true); // Reset para próximo login
        
        // Redirigir a login si no está en la página de login
        if (!this.router.url.includes('login')) {
          console.log('➡️ Redirigiendo a login');
          this.router.navigate(['/login']);
        }
        return;
      }

      // Usuario autenticado - iniciar verificación de carga de datos
      this.cargandoAuth.set(false);
      this.usuarioAutenticado$.set(true);
      console.log('✅ Usuario autenticado:', user.name);
      
      // 🆕 Esperar a que los datos se carguen
      this.esperarCargaDatos();
    });
  }

  /**
   * 🆕 Espera a que los productos y categorías se carguen
   */
  private esperarCargaDatos(): void {
    console.log('⏳ Esperando carga de datos...');
    this.cargandoDatos.set(true);

    // Verificar periódicamente si los datos ya están cargados
    const checkInterval = setInterval(() => {
      const productosListos = !this.productosService.cargando();
      const productos = this.productosService.productos();
      const categorias = this.categoriasService.categorias();
      
      console.log('🔍 Verificando datos:', {
        productosListos,
        productos: productos.length,
        categorias: categorias.length
      });

      // Considerar cargado cuando:
      // - El servicio de productos no esté cargando Y
      // - Haya al menos productos o categorías cargadas O hayan pasado 3 segundos
      if (productosListos && (productos.length > 0 || categorias.length > 0)) {
        clearInterval(checkInterval);
        clearTimeout(timeout);
        console.log('✅ Datos cargados, mostrando layout');
        this.cargandoDatos.set(false);
        this.primeraNavegacion.set(false);
      }
    }, 100);

    // Timeout de seguridad: después de 3 segundos, mostrar de todos modos
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      console.log('⚠️ Timeout de carga, mostrando layout');
      this.cargandoDatos.set(false);
      this.primeraNavegacion.set(false);
    }, 3000);
  }
}