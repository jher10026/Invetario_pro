# 📦 InventarioPro - Sistema de Gestión de Inventario

Sistema web moderno de gestión de inventario desarrollado con Angular 18.

## 🚀 Características

✅ **Autenticación completa** - Sistema de login y registro de usuarios  
✅ **Dashboard interactivo** - Estadísticas en tiempo real del inventario  
✅ **Gestión de productos** - CRUD completo con filtros y búsqueda  
✅ **Gestión de categorías** - Organiza productos por categorías personalizables  
✅ **Alertas de stock** - Notificaciones cuando el stock está bajo  
✅ **Diseño responsive** - Funciona perfecto en móviles y tablets  
✅ **Tema oscuro** - Interfaz moderna y profesional  
✅ **Persistencia de datos** - Almacenamiento local con LocalStorage  

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Angular CLI (v18)

## 🔧 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd inventario-pro
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

## 👤 Usuario de Prueba

Para probar la aplicación, usa estas credenciales:

- **Email:** admin@inventario.com
- **Contraseña:** admin123

O crea una nueva cuenta desde la pantalla de registro.

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/           # Componentes de la aplicación
│   │   ├── login/           # Pantalla de login/registro
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── inventario/      # Gestión de productos
│   │   ├── categorias/      # Gestión de categorías
│   │   └── shared/          # Componentes compartidos
│   │       ├── sidebar/     # Menú lateral
│   │       └── toast/       # Notificaciones
│   ├── services/            # Servicios de lógica de negocio
│   │   ├── auth.service.ts          # Autenticación
│   │   ├── productos.service.ts     # Gestión de productos
│   │   ├── categorias.service.ts    # Gestión de categorías
│   │   └── toast.service.ts         # Notificaciones
│   ├── models/              # Interfaces TypeScript
│   │   ├── usuario.model.ts
│   │   ├── producto.model.ts
│   │   ├── categoria.model.ts
│   │   └── estadisticas.model.ts
│   ├── guards/              # Protección de rutas
│   │   └── auth.guard.ts
│   ├── app.routes.ts        # Configuración de rutas
│   └── app.config.ts        # Configuración de la app
└── styles.css               # Estilos globales
```

## 🎨 Características Principales

### Dashboard
- Visualización de estadísticas clave
- Productos recientes
- Alertas de stock bajo
- Accesos rápidos

### Inventario
- Tabla completa de productos
- Filtros por categoría y estado
- Búsqueda en tiempo real
- Agregar, editar y eliminar productos
- Cambiar estado (activo/inactivo)

### Categorías
- Vista de tarjetas coloridas
- Contador de productos por categoría
- Personalización de iconos y colores
- Protección de eliminación

## 🛠️ Tecnologías Utilizadas

- **Angular 18** - Framework principal
- **TypeScript** - Lenguaje de programación
- **RxJS** - Programación reactiva
- **LocalStorage** - Persistencia de datos
- **CSS3** - Estilos y animaciones

## 📱 Responsive Design

La aplicación está optimizada para:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px)
- 📱 Tablet (768px)
- 📱 Móvil (320px+)

## 🔒 Seguridad

- Rutas protegidas con Guards
- Validación de formularios
- Roles de usuario (Admin/Usuario)
- Sesiones persistentes

## 🚧 Futuras Mejoras

- [ ] Integración con backend (Firebase/API REST)
- [ ] Gráficas con Chart.js
- [ ] Exportación a Excel/PDF
- [ ] Modo claro/oscuro
- [ ] Historial de movimientos
- [ ] Reportes avanzados

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Desarrollado por j - Estudiante de Ingeniería de Sistemas UNAJMA

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, no dudes en contactar.

---

**¡Disfruta gestionando tu inventario! 🎉**