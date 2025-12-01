# Guía de Despliegue

## Entornos

### Desarrollo Local
1. **Requisitos**
   - Docker y Docker Compose
   - Node.js 16+
   - npm 8+

2. **Configuración**
   ```bash
   # Copiar archivo de entorno
   cp .env.example .env
   
   # Instalar dependencias
   npm install
   
   # Iniciar contenedores
   docker-compose up -d
   
   # Ejecutar migraciones
   npm run db:migrate
   
   # Iniciar servidor de desarrollo
   npm run dev
   ```

### Producción
1. **Requisitos**
   - Servidor Linux (Ubuntu 20.04+)
   - Docker y Docker Compose
   - Dominio y certificado SSL

2. **Despliegue con Docker**
   ```bash
   # Configurar variables de producción
   cp .env.production .env
   
   # Construir imágenes
   docker-compose -f docker-compose.prod.yml build
   
   # Iniciar servicios
   docker-compose -f docker-compose.prod.yml up -d
   
   # Verificar logs
   docker-compose logs -f
   ```

## Variables de Entorno

### Configuración Básica
```env
NODE_ENV=production
PORT=3000
API_URL=https://api.tudominio.com
FRONTEND_URL=https://tudominio.com
```

### Base de Datos
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=marketplace
DB_USER=user
DB_PASSWORD=securepassword
```

### Autenticación
```env
JWT_SECRET=tu_super_secreto_jwt
JWT_EXPIRES_IN=30d
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Escalabilidad

### Escalado Horizontal
```bash
# Escalar servicio de API a 3 instancias
docker-compose up -d --scale api=3

# Configurar balanceador de carga
# (configuración de Nginx o similar)
```

### Caché y Sesiones
- Redis para almacenamiento de sesiones
- CDN para activos estáticos
- Caché de consultas frecuentes

## Monitoreo
- Prometheus para métricas
- Grafana para visualización
- Sentry para seguimiento de errores

## Respaldos
```bash
# Respaldar base de datos
pg_dump -U user -d marketplace > backup_$(date +%Y%m%d).sql

# Programar respaldos diarios
0 3 * * * pg_dump -U user -d marketplace > /backups/backup_$(date +\%Y\%m\%d).sql
```
