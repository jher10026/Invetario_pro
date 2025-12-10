# 📦 Sistema de Gestión de Inventario

## 📖 Descripción del Proyecto

**Inventario Pro** es una aplicación web moderna para la gestión integral de inventarios empresariales. Desarrollada con Angular 20 y Firebase, permite administrar productos, categorías, generar reportes y visualizar estadísticas en tiempo real.

### ✨ Características Principales

- 🔐 **Autenticación segura** con Firebase Authentication
- 📊 **Dashboard interactivo** con estadísticas en tiempo real
- 📦 **Gestión de productos** (CRUD completo)
- 🏷️ **Categorización** de productos con colores personalizados
- 📈 **Reportes y gráficos** con Chart.js
- 🔔 **Notificaciones** en tiempo real
- 📱 **Diseño responsive** adaptable a cualquier dispositivo
- 🎨 **Interfaz moderna** con animaciones fluidas

---

## 🛠️ Tecnologías y Herramientas Utilizadas

### Frontend
- **Angular 20.3** - Framework principal
- **TypeScript 5.9** - Lenguaje de programación
- **RxJS 7.8** - Programación reactiva
- **Chart.js 4.5** - Gráficos y visualizaciones

### Backend y Base de Datos
- **Firebase 11.10** - Backend as a Service
  - Firebase Authentication - Gestión de usuarios
  - Cloud Firestore - Base de datos NoSQL
  - Firebase Hosting - Despliegue de aplicación

### Herramientas de Desarrollo
- **Angular CLI 20.3** - Herramienta de línea de comandos
- **Jasmine & Karma** - Testing
- **Prettier** - Formateo de código

---

## 📋 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener:

- **Node.js** (versión 18 o superior)
- **npm** (versión 9 o superior)
- **Angular CLI** (versión 20 o superior)
- Una cuenta de **Firebase**

### Verificar instalaciones

```bash
node --version  # Debe ser >= 18.x
npm --version   # Debe ser >= 9.x
ng version      # Debe ser >= 20.x
```

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/jher10026/Invetario_pro.git
cd inventario-pro1
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Firebase

#### a) Crear proyecto en Firebase Console

1. Ve a https://console.firebase.google.com/u/0/project/inventario-productos-c366d/overview?hl=es-419
2. Crea un nuevo proyecto
3. Habilita **Authentication** (Email/Password)
4. Crea una base de datos **Firestore** (modo producción)

#### b) Configurar credenciales

Edita el archivo `src/app/config/firebase.config.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### 4. Ejecutar la Aplicación

#### Modo Desarrollo
```bash
npm start
# o
ng serve
```

La aplicación estará disponible en: `http://localhost:4200`

#### Modo Producción
```bash
npm run build
```

Los archivos compilados estarán en: `dist/inventario_pro1/browser`

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
src/app/
├── components/           # Componentes de la aplicación
│   ├── login/           # Autenticación de usuarios
│   ├── dashboard/       # Panel principal
│   ├── inventario/      # Gestión de productos
│   ├── categorias/      # Gestión de categorías
│   ├── reportes/        # Generación de reportes
│   └── shared/          # Componentes compartidos
│       ├── header/      # Cabecera de la app
│       ├── sidebar/     # Menú lateral
│       └── toast/       # Notificaciones
├── services/            # Servicios de la aplicación
│   ├── firebase.service.ts      # Conexión con Firebase
│   ├── productos.service.ts     # Lógica de productos
│   ├── categorias.service.ts    # Lógica de categorías
│   ├── reportes.service.ts      # Generación de reportes
│   ├── notification.service.ts  # Sistema de notificaciones
│   └── storage.service.ts       # Gestión de almacenamiento
├── guards/              # Protección de rutas
│   ├── auth.guard.ts    # Verificación de autenticación
│   └── role.guard.ts    # Verificación de roles
├── models/              # Interfaces y tipos
│   ├── producto.model.ts
│   ├── categoria.model.ts
│   ├── usuario.model.ts
│   ├── estadisticas.model.ts
│   └── reporte.model.ts
├── config/              # Configuraciones
│   └── firebase.config.ts
├── app.routes.ts        # Definición de rutas
└── app.config.ts        # Configuración de la app
```

### Componentes Principales

#### 1. **Login Component**
- Gestión de autenticación (login y registro)
- Validación de credenciales
- Integración con Firebase Auth

#### 2. **Dashboard Component**
- Visualización de estadísticas generales
- Gráficos con Chart.js
- Tarjetas informativas

#### 3. **Inventario Component**
- Tabla de productos con búsqueda y filtros
- Formulario de agregar/editar productos
- Operaciones CRUD completas

#### 4. **Categorías Component**
- Gestión de categorías de productos
- Selector de colores personalizado
- Validación de nombres únicos

#### 5. **Reportes Component**
- Generación de reportes por fechas
- Exportación de datos
- Visualización de gráficos

### Servicios Principales

#### 1. **FirebaseService**
```typescript
// Métodos principales
- login(email, password)           // Autenticación
- registrarUsuario(...)            // Registro de nuevos usuarios
- logout()                         // Cerrar sesión
- obtenerProductos()               // Consultar productos
- agregarProducto(producto)        // Crear producto
- actualizarProducto(id, cambios)  // Actualizar producto
- eliminarProducto(id)             // Eliminar producto
```

#### 2. **ProductosService**
```typescript
// Gestión de productos con Signals
- productos: Signal<Producto[]>    // Lista reactiva
- cargarProductos()                // Sincronizar con Firestore
- agregar(producto)                // Agregar producto
- actualizar(id, cambios)          // Actualizar producto
- eliminar(id)                     // Eliminar producto
- obtenerEstado(stock)             // Calcular estado del stock
- obtenerValorTotal()              // Calcular valor total
```

#### 3. **CategoriasService**
```typescript
// Gestión de categorías
- categorias: Signal<Categoria[]>  // Lista reactiva
- agregar(categoria)               // Agregar categoría
- actualizar(id, cambios)          // Actualizar categoría
- eliminar(id)                     // Eliminar categoría
- existe(nombre)                   // Verificar existencia
```

### Guards (Protección de Rutas)

#### 1. **authGuard**
- Verifica si el usuario está autenticado
- Redirige a `/login` si no hay sesión activa
- Implementado como función guard (Angular 20)

#### 2. **roleGuard**
- Verifica el rol del usuario (admin/user)
- Restringe acceso a rutas administrativas
- Trabaja en conjunto con `authGuard`

### Modelos de Datos

#### Producto
```typescript
interface Producto {
  id: number;
  nombre: string;
  fecha: string;      // YYYY-MM-DD
  categoria: string;
  precio: number;
  stock: number;
}
```

#### Categoría
```typescript
interface Categoria {
  id: number;
  nombre: string;
  color: string;      // Formato hexadecimal #RRGGBB
}
```

#### Usuario
```typescript
interface Usuario {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
```

---

## 🔥 Configuración de Firebase

### Colecciones en Firestore

#### 1. **usuarios**
```javascript
{
  uid: string,           // ID único de Firebase Auth
  name: string,          // Nombre completo
  email: string,         // Correo electrónico
  role: string,          // 'admin' | 'user'
  createdAt: Timestamp   // Fecha de creación
}
```

#### 2. **productos**
```javascript
{
  nombre: string,        // Nombre del producto
  categoria: string,     // Categoría asignada
  precio: number,        // Precio unitario
  stock: number,         // Cantidad disponible
  fecha: string,         // Fecha de registro (YYYY-MM-DD)
  createdAt: Timestamp   // Fecha de creación en Firebase
}
```

#### 3. **categorias**
```javascript
{
  nombre: string,        // Nombre de la categoría
  color: string,         // Color en formato hexadecimal
  createdAt: Timestamp   // Fecha de creación
}
```

### Reglas de Seguridad (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Los usuarios autenticados pueden leer y escribir sus propios datos
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Productos: solo usuarios autenticados
    match /productos/{productId} {
      allow read, write: if request.auth != null;
    }
    
    // Categorías: solo usuarios autenticados
    match /categorias/{categoriaId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🌐 Despliegue en Firebase Hosting

### URL de la Aplicación Desplegada
```
🔗 https://inventario-productos-c366d.web.app
```

### Pasos para Desplegar

#### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

#### 2. Login en Firebase
```bash
firebase login
```

#### 3. Inicializar Firebase
```bash
firebase init hosting
```

Selecciona:
- Carpeta pública: `dist/inventario_pro1/browser`
- Configurar como SPA: **Sí**
- Sobrescribir index.html: **No**

#### 4. Compilar Proyecto
```bash
ng build --configuration production
```

#### 5. Desplegar
```bash
firebase deploy --only hosting
```

---

## 🎥 Video Demostrativo

### 🔗 URL del Video
```
📹 [INSERTAR URL DEL VIDEO AQUÍ]
```

### Contenido del Video (5-8 minutos)

1. **Introducción** (30 seg)
   - Presentación del proyecto
   - Tecnologías utilizadas

2. **Funcionalidades Principales** (2-3 min)
   - Dashboard con estadísticas
   - Gestión de productos (agregar, editar, eliminar)
   - Gestión de categorías
   - Sistema de búsqueda y filtros
   - Generación de reportes

3. **Flujo de Autenticación** (1-2 min)
   - Registro de nuevo usuario
   - Inicio de sesión
   - Protección de rutas
   - Cierre de sesión

4. **Firestore en Acción** (1-2 min)
   - Demostración de lectura en tiempo real
   - Creación de documentos
   - Actualización de datos
   - Eliminación de registros

5. **Explicación del Código** (2-3 min)
   - Estructura de componentes
   - Servicios principales (FirebaseService, ProductosService)
   - Guards de autenticación
   - Modelos de datos

---

## 📚 Manual de Usuario

### 1. Registro e Inicio de Sesión

#### Registrarse
1. Accede a la aplicación
2. Haz clic en **"¿No tienes cuenta? Regístrate"**
3. Completa el formulario:
   - Nombre completo
   - Correo electrónico
   - Contraseña (mínimo 6 caracteres)
   - Confirmar contraseña
4. Haz clic en **"Registrarse"**
5. Tras el registro exitoso, inicia sesión con tus credenciales

#### Iniciar Sesión
1. Ingresa tu correo electrónico
2. Ingresa tu contraseña
3. Haz clic en **"Iniciar Sesión"**
4. Serás redirigido al Dashboard

### 2. Dashboard Principal

El dashboard muestra:
- **Total de productos** en inventario
- **Valor total** del inventario
- **Productos con stock bajo** (menos de 10 unidades)
- **Productos agotados**
- **Gráfico de categorías** (distribución de productos)
- **Gráfico de stock** (productos disponibles, bajo stock y agotados)

### 3. Gestión de Productos

#### Agregar Producto
1. Ve a **"Inventario"** en el menú lateral
2. Haz clic en **"+ Agregar Producto"**
3. Completa el formulario:
   - Nombre del producto
   - Selecciona una categoría
   - Precio (números decimales permitidos)
   - Stock inicial
4. Haz clic en **"Guardar"**

#### Editar Producto
1. En la tabla de productos, haz clic en el botón **"Editar"** (ícono de lápiz)
2. Modifica los campos deseados
3. Haz clic en **"Actualizar"**

#### Eliminar Producto
1. Haz clic en el botón **"Eliminar"** (ícono de basura)
2. Confirma la eliminación en el cuadro de diálogo

#### Buscar y Filtrar
- **Barra de búsqueda**: Ingresa el nombre del producto
- **Filtro por categoría**: Selecciona una categoría del desplegable
- **Filtro por stock**: Selecciona "Disponible", "Bajo" o "Agotado"
- **Ordenar**: Por fecha (reciente/antiguo), nombre o precio

### 4. Gestión de Categorías

#### Agregar Categoría
1. Ve a **"Categorías"** en el menú lateral
2. Haz clic en **"+ Agregar Categoría"**
3. Ingresa el nombre de la categoría
4. Selecciona un color identificador
5. Haz clic en **"Guardar"**

#### Editar Categoría
1. Haz clic en el botón **"Editar"** de la categoría
2. Modifica el nombre o el color
3. Haz clic en **"Actualizar"**

#### Eliminar Categoría
1. Haz clic en el botón **"Eliminar"**
2. Confirma la eliminación

⚠️ **Nota**: No puedes eliminar una categoría si hay productos asociados a ella.

### 5. Reportes

#### Generar Reporte
1. Ve a **"Reportes"** en el menú lateral
2. Selecciona el rango de fechas:
   - Fecha de inicio
   - Fecha de fin
3. Haz clic en **"Generar Reporte"**
4. El sistema mostrará:
   - Lista de productos en ese período
   - Valor total
   - Gráficos estadísticos

#### Exportar Reporte
1. Una vez generado el reporte
2. Haz clic en **"Exportar PDF"** o **"Exportar Excel"**
3. El archivo se descargará automáticamente

### 6. Cerrar Sesión

1. Haz clic en tu nombre de usuario en la esquina superior derecha
2. Selecciona **"Cerrar Sesión"**
3. Serás redirigido a la página de login

---

## 🧪 Testing

### Ejecutar Pruebas Unitarias
```bash
npm test
```

### Ejecutar Pruebas con Cobertura
```bash
ng test --code-coverage
```

---

## 📝 Commits y Desarrollo

### Estructura de Commits
Este proyecto sigue la convención de commits semánticos:

```bash
feat: Nueva funcionalidad
fix: Corrección de errores
docs: Actualización de documentación
style: Cambios de formato
refactor: Refactorización de código
test: Adición de pruebas
chore: Tareas de mantenimiento
```

### Ejemplo de Commits
```bash
git commit -m "feat: Implementar autenticación con Firebase"
git commit -m "fix: Corregir validación de formulario de productos"
git commit -m "docs: Actualizar README con instrucciones de instalación"
```

---

## 🤝 Colaboradores

- **Docente**: ivansoriasolis (GitHub)
- **Desarrollador**: Jhermy Hitsuko Yupanqui Aquise

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico y está destinado únicamente para fines educativos.

---

## 🐛 Reporte de Errores

Si encuentras algún error o tienes sugerencias:

1. Abre un **Issue** en GitHub
2. Describe el problema detalladamente
3. Incluye capturas de pantalla si es posible
4. Indica los pasos para reproducir el error

---

## 📞 Contacto

Para consultas sobre el proyecto:
- **GitHub**: https://github.com/jher10026/Invetario_pro.git
- **Email**: 1002620232@unajma.edu.pe

---

## 🎯 Próximas Mejoras

- [ ] Implementar modo oscuro
- [ ] Agregar exportación de reportes a Excel
- [ ] Integrar notificaciones push
- [ ] Implementar búsqueda avanzada con filtros múltiples
- [ ] Agregar gráficos interactivos adicionales
- [ ] Implementar sistema de permisos más granular
- [ ] Agregar historial de cambios en productos

---

**Desarrollado con ❤️ usando Angular y Firebase**