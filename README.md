# Modern Marketplace

## Visión General
Plataforma moderna y escalable de comercio electrónico inspirada en Mercado Libre. Este proyecto ofrece una solución completa para comprar y vender productos en línea, con autenticación de usuarios, listados de productos, carrito de compras, checkout, reseñas y más.

## Características Principales
- **Gestión de Usuarios**: Registro, autenticación y perfiles personalizados
- **Catálogo de Productos**: Búsqueda avanzada, filtros y categorías
- **Carrito de Compras**: Persistente con sincronización en tiempo real
- **Checkout Seguro**: Integración con múltiples pasarelas de pago
- **Sistema de Reseñas**: Valoraciones de productos y vendedores
- **Notificaciones en Tiempo Real**: Usando WebSockets
- **Diseño Adaptativo**: Compatible con móviles y escritorio
- **Temas Claros/Oscuros**: Personalización de la interfaz

## Tecnologías Clave
- **Frontend**: React 18, Vite, CSS Variables, React Router
- **Backend**: Node.js 20+, Express.js, CORS
- **Base de Datos**: PostgreSQL (configurado, no requerido para demo)
- **Caché**: Redis (configurado, no requerido para demo)
- **Testing**: Jest, React Testing Library, Supertest
- **Contenedores**: Docker, Docker Compose
- **CI/CD**: GitHub Actions (linting, tests, security)
- **Build Tools**: ESLint, Prettier, npm workspaces

## Estructura del Proyecto
```
modern-marketplace/
├── frontend/              # Aplicación React + Vite
│   ├── src/
│   │   ├── components/    # Componentes UI (Header, Footer, Layout)
│   │   ├── pages/         # Páginas (Home, Login, Register, Profile)
│   │   ├── contexts/      # React Context (Auth, Theme, Products)
│   │   ├── utils/         # Utilidades (api.js)
│   │   └── assets/        # Estilos e imágenes
│   ├── package.json
│   └── vite.config.js
├── backend/               # API Express.js
│   ├── src/
│   │   ├── app.js         # Configuración del servidor
│   │   ├── server-simple.js # Servidor simplificado para demo
│   │   ├── config/        # Configuración de base de datos
│   │   ├── models/        # Modelos de datos
│   │   ├── routes/        # Rutas de la API
│   │   ├── middleware/    # Middleware Express
│   │   └── utils/         # Utilidades del servidor
│   └── package.json
├── tests/                 # Pruebas unitarias e integración
├── .github/workflows/     # CI/CD con GitHub Actions
├── docker-compose.yml     # Configuración Docker
└── package.json           # Workspace raíz
```

## Características Implementadas

### ✅ Frontend Funcional
- **Navegación Completa**: React Router con lazy loading y rutas protegidas
- **Theme Switching**: Sistema de temas claro/oscuro con CSS variables
- **Diseño Responsivo**: Mobile-first con layouts adaptables
- **Componentes UI**: Header, Footer, Layout con navegación funcional
- **Páginas Completas**: Home, Login, Register, Profile, NotFound
- **Estados de Carga**: Loading spinners y manejo de errores
- **Context API**: Auth, Theme y Products contexts funcionales

### ✅ Backend API
- **Endpoints Funcionales**: `/api/products/featured`, `/api/categories`, `/health`
- **Datos de Demo**: Productos realistas y categorías predefinidas
- **CORS Configurado**: Comunicación segura con el frontend
- **Manejo de Errores**: 404 y 500 responses apropiados
- **Health Check**: Endpoint para monitoreo del sistema

### ✅ Desarrollo Profesional
- **Hot Reload**: Vite para frontend, nodemon para backend
- **Testing Suite**: Unit tests, integration tests, coverage reports
- **CI/CD Pipeline**: GitHub Actions con quality gates
- **Code Quality**: ESLint, Prettier, security scanning
- **Workspace Setup**: npm workspaces para monorepo

## Demo Rápida

La aplicación está lista para usar inmediatamente:

1. **Frontend**: http://localhost:5173/ - Interfaz completa del marketplace
2. **Backend**: http://localhost:3001/ - API con datos de demo
3. **Health Check**: http://localhost:3001/health - Estado del sistema

No requiere configuración de base de datos ni servicios externos para la demo.

## Empezando

### Requisitos Previos
- Node.js 20+
- PostgreSQL 14+
- Redis 6+
- Docker (opcional)

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/modern-marketplace.git
cd modern-marketplace

# Instalar dependencias (workspace completo)
npm install

# Iniciar ambos servicios (frontend + backend)
npm run dev

# O iniciar servicios por separado:
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:3001
```

## Soporte
Para reportar problemas o solicitar características, por favor [crea un issue](https://github.com/tu-usuario/modern-marketplace/issues).

## Licencia
Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más información.
