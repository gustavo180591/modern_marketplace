# Características Sociales

## Visión General
Sistema que fomenta la interacción entre usuarios, creando una comunidad alrededor de los productos y marcas del marketplace.

## Características Principales

### 1. Perfiles de Usuario
- Biografía y foto de perfil
- Colecciones públicas
- Reseñas y valoraciones
- Actividad reciente

### 2. Interacción Social
- Seguir a vendedores y compradores
- Listas de deseos públicas
- Compartir productos en redes sociales
- Comentarios en productos

### 3. Comunidad
- Grupos de interés
- Foros de discusión
- Eventos y lanzamientos
- Programas de embajadores

## Estructura de Datos
```javascript
{
  userId: string,
  profile: {
    displayName: string,
    avatar: string,
    bio: string,
    location: string,
    website: string,
    socialLinks: {
      facebook?: string,
      twitter?: string,
      instagram?: string,
      tiktok?: string
    },
    isVerified: boolean,
    joinDate: Date
  },
  socialGraph: {
    followers: string[],    // IDs de seguidores
    following: string[],   // IDs de usuarios seguidos
    followingBrands: string[], // IDs de marcas seguidas
    blockedUsers: string[] // IDs de usuarios bloqueados
  },
  userGeneratedContent: {
    reviews: string[],     // IDs de reseñas
    questions: string[],   // IDs de preguntas
    answers: string[],     // IDs de respuestas
    collections: string[]  // IDs de colecciones
  },
  preferences: {
    privacy: {
      showCollections: 'public' | 'followers' | 'private',
      showWishlist: 'public' | 'followers' | 'private',
      showActivity: 'public' | 'followers' | 'private'
    },
    notifications: {
      newFollower: boolean,
      productInWishlistOnSale: boolean,
      newCollectionByFollowing: boolean
    }
  },
  stats: {
    followersCount: number,
    followingCount: number,
    reviewsCount: number,
    helpfulVotes: number
  },
  achievements: [{
    id: string,
    name: string,
    description: string,
    icon: string,
    earnedAt: Date,
    progress: number
  }]
}
```

## Flujos de Interacción

### 1. Seguir a un Usuario
1. Usuario visita perfil de otro usuario
2. Haz clic en "Seguir"
3. El usuario objetivo recibe notificación
4. Las publicaciones del usuario seguido aparecen en el feed

### 2. Crear una Colección
1. Usuario selecciona "Nueva colección"
2. Completa detalles (título, descripción, privacidad)
3. Añade productos a la colección
4. Comparte la colección (opcional)

## API Endpoints
- `GET /api/users/:userId/profile` - Obtener perfil de usuario
- `POST /api/users/:userId/follow` - Seguir a un usuario
- `GET /api/users/me/feed` - Obtir feed de actividad
- `POST /api/collections` - Crear nueva colección

## Integración con Redes Sociales
- Inicio de sesión con redes sociales
- Compartir productos/colecciones
- Importar contactos
- Mostrar feeds sociales

## Moderación
- Sistema de reportes de contenido
- Filtros de palabras prohibidas
- Bloqueo de usuarios
- Directrices de la comunidad

## Próximos Pasos
1. Implementar perfiles de usuario básicos
2. Desarrollar sistema de seguimiento
3. Crear flujos de interacción social
4. Implementar herramientas de moderación
