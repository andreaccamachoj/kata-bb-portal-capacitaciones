# 🎓 Portal de Capacitaciones

Sistema de gestión de aprendizaje (LMS) construido con React, TypeScript y arquitectura moderna.


## 🎯 Descripción

El Portal de Capacitaciones es una plataforma de aprendizaje en línea que permite a las organizaciones gestionar cursos, usuarios y contenido educativo. La aplicación soporta múltiples roles de usuario y proporciona funcionalidades específicas para administradores, instructores y estudiantes.

### Funcionalidades Principales

- *Gestión de Usuarios*: Control completo de usuarios con diferentes roles
- *Catálogo de Cursos*: Exploración y búsqueda de contenido educativo
- *Sistema de Aprendizaje*: Seguimiento de progreso y completación
- *Administración*: Panel de control para gestión de contenido
- *Estudio/Creación*: Herramientas para instructores y creadores de contenido
- *Badges y Reconocimientos*: Sistema de gamificación
- *Responsive Design*: Optimizado para dispositivos móviles y desktop

## ✨ Características

### 🔐 Autenticación y Seguridad
- JWT-based authentication
- Protección de rutas por roles
- Manejo automático de sesiones expiradas
- Interceptors para manejo de errores
- Logout automático en caso de tokens inválidos

### 📱 Interfaz de Usuario
- Diseño responsive y moderno
- Componentes reutilizables con shadcn/ui
- Tema personalizable con Tailwind CSS
- Componentes atómicos, moleculares y organismos
- Toast notifications y feedback visual

### 🎨 Experiencia de Usuario
- Navegación intuitiva
- Búsqueda en tiempo real
- Carga lazy de contenido
- Estados de carga y error
- Optimización de performance

### 📊 Gestión de Datos
- React Query para manejo de estado servidor
- Cache inteligente y sincronización
- Mutaciones optimistas
- Manejo de errores centralizado

## 🏗 Arquitectura

### Patrón de Arquitectura

El proyecto sigue una *arquitectura por capas* y utiliza el patrón *Atomic Design* para los componentes:

```
+─────────────────────────────────────────+
│              UI Layer                   │
│   (Pages, Templates, Organisms)         │
+─────────────────────────────────────────+
│           Business Logic                │
│        (Hooks, Contexts)                │
+─────────────────────────────────────────+
│           Service Layer                 │
│        (API Services)                   │
+─────────────────────────────────────────+
│          Data Access Layer              │
│     (HTTP Client, Storage)              │
+─────────────────────────────────────────+
```
### Principios de Diseño

- *Separation of Concerns*: Separación clara entre UI, lógica de negocio y datos
- *Single Responsibility*: Cada componente tiene una responsabilidad específica
- *DRY (Don't Repeat Yourself)*: Reutilización de componentes y lógica
- *Component Composition*: Composición sobre herencia
- *Type Safety*: TypeScript para prevenir errores en tiempo de compilación


## 🛠 Tecnologías

- **React 18.3.1** + **TypeScript 5.8.3**
- **Vite 6.1.6** - Build tool y dev server
- **TanStack Query 5.90.2** - Estado del servidor
- **Tailwind CSS 3.4.17** + **Radix UI** - Componentes y estilos
- **React Router DOM 6.30.1** - Enrutamiento
- **Axios 1.12.2** - Cliente HTTP
- **Zod 3.25.76** - Validación de esquemas
- **React Hook Form** - Manejo de formularios

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes UI (Atomic Design)
│   ├── atoms/          # Básicos (button, input, etc.)
│   ├── molecules/      # Compuestos (card, form, etc.)
│   ├── organisms/      # Complejos (table, sidebar, etc.)
│   └── templates/      # Layouts (AppLayout, ProtectedRoute)
├── pages/              # Páginas principales
├── hooks/              # Custom hooks
├── contexts/           # React contexts
├── services/           # Servicios API
├── lib/                # Utilidades
├── types/              # Definiciones TypeScript
├── config/             # Configuración
└── utils/              # Funciones utilitarias
```

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/andreaccamachoj/kata-bb-portal-capacitaciones

# Instalar dependencias
bun install
# o con npm: npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
bun run dev
# Acceder en: http://localhost:8080
```

## ⚙️ Configuración

### Variables de Entorno (.env.local)

```env
VITE_BASE_URL=http://localhost:3000
VITE_COURSE_BASE_URL=http://localhost:3001
VITE_S3_BUCKET_URL=https://your-s3-bucket.amazonaws.com
```

## 🛣 Rutas Principales

```
/login, /register        # Autenticación
/dashboard              # Dashboard principal
/catalog                # Catálogo de cursos
/courses/:id           # Detalle y aprendizaje
/me/learning, /profile  # Área personal
/admin/*               # Gestión (solo ADMIN)
/studio/*              # Creación (INSTRUCTOR/ADMIN)
```

## 👥 Sistema de Roles

| Rol | Permisos |
|-----|----------|
| **STUDENT** | Ver catálogo, tomar cursos, perfil |
| **INSTRUCTOR** | + Crear cursos, gestionar contenido |
| **ADMIN** | + Gestionar usuarios, módulos, configuración |


## 🔄 Flujos de Usuario

### Flujo de Autenticación


Usuario accede → ¿Está autenticado? → No → Redirigir a /login
                                   → Sí → ¿Token válido? → No → /login
                                                        → Sí → Dashboard


### Flujo de Aprendizaje


Ver Catálogo → Seleccionar Curso → Ver Detalles → ¿Inscrito? → No → Inscribirse
                                                            → Sí → Continuar Aprendizaje


### Flujo Administrativo


Admin Dashboard → Seleccionar Gestión → Usuarios/Cursos/Módulos → CRUD Operations


### Flujo de Creación de Contenido


Instructor Dashboard → Crear Nuevo Curso → Información Básica → Agregar Módulos → Publicar