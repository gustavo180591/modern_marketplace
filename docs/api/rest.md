# API REST

## Autenticación

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Usuario Ejemplo",
    "email": "usuario@ejemplo.com",
    "role": "customer"
  }
}
```

## Usuarios

### Obtener Perfil de Usuario
```http
GET /api/users/me
Authorization: Bearer <token>
```

**Respuesta Exitosa (200 OK)**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Usuario Ejemplo",
  "email": "usuario@ejemplo.com",
  "avatar": "https://...",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Productos

### Listar Productos
```http
GET /api/products
?page=1
&limit=20
&category=electronics
&sort=price:asc
&minPrice=100
&maxPrice=1000
```

**Parámetros de Consulta**
- `page`: Número de página (por defecto: 1)
- `limit`: Items por página (por defecto: 20, máximo: 100)
- `category`: Filtrar por categoría
- `sort`: Ordenar por campo (prefijo `-` para orden descendente)
- `minPrice`/`maxPrice`: Rango de precios

**Respuesta Exitosa (200 OK)**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Smartphone XYZ",
      "price": 599.99,
      "images": ["https://..."],
      "rating": 4.5,
      "reviewCount": 42
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### Obtener Detalles de un Producto
```http
GET /api/products/{id}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Smartphone XYZ",
  "description": "Descripción detallada del producto...",
  "price": 599.99,
  "compareAtPrice": 699.99,
  "images": ["https://..."],
  "variants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "128GB Negro",
      "sku": "SP-XYZ-128-BK",
      "price": 599.99,
      "stock": 10
    }
  ],
  "specifications": [
    {
      "name": "Pantalla",
      "value": "6.5\" AMOLED"
    }
  ],
  "rating": 4.5,
  "reviewCount": 42,
  "inStock": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Carrito

### Añadir al Carrito
```http
POST /api/cart/items
Content-Type: application/json
Authorization: Bearer <token>

{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "variantId": "550e8400-e29b-41d4-a716-446655440001",
  "quantity": 1
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Smartphone XYZ 128GB Negro",
      "price": 599.99,
      "quantity": 1,
      "image": "https://...",
      "variant": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "128GB Negro"
      }
    }
  ],
  "total": 599.99,
  "itemCount": 1
}
```

## Órdenes

### Crear Orden
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "shippingAddress": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "address1": "Calle Falsa 123",
    "city": "Ciudad",
    "country": "País",
    "zipCode": "12345",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "sameAsShipping": true
  },
  "paymentMethod": "credit_card",
  "shippingMethod": "standard",
  "notes": "Por favor, dejar en recepción"
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "orderNumber": "ORD-20230001",
  "status": "pending_payment",
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Smartphone XYZ 128GB Negro",
      "price": 599.99,
      "quantity": 1,
      "subtotal": 599.99
    }
  ],
  "shippingCost": 9.99,
  "tax": 121.99,
  "total": 731.97,
  "paymentUrl": "https://payment-provider.com/checkout/...",
  "createdAt": "2023-01-01T12:00:00.000Z"
}
```

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 OK | La solicitud se completó exitosamente |
| 201 Created | Recurso creado exitosamente |
| 204 No Content | Operación exitosa, sin contenido que devolver |
| 400 Bad Request | La solicitud es inválida |
| 401 Unauthorized | Autenticación requerida |
| 403 Forbidden | No tiene permiso para acceder al recurso |
| 404 Not Found | El recurso no existe |
| 422 Unprocessable Entity | Error de validación |
| 500 Internal Server Error | Error del servidor |

## Manejo de Errores

Todas las respuestas de error siguen el siguiente formato:

```json
{
  "error": {
    "code": "resource_not_found",
    "message": "El recurso solicitado no existe",
    "details": {
      "resource": "product",
      "id": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

## Paginación

Todas las respuestas que devuelven una lista de recursos están paginadas:

```json
{
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## Ordenamiento

Los parámetros de ordenamiento se especifican en el query string:

```
GET /api/products?sort=price:asc,name:desc
```

## Filtrado

Los filtros se aplican como parámetros de consulta:

```
GET /api/products?category=electronics&minPrice=100&inStock=true
```

## Límites de Tasa (Rate Limiting)

- **Público**: 100 solicitudes por minuto por IP
- **Autenticado**: 1000 solicitudes por minuto por usuario
- **APIs de Pago**: 60 solicitudes por minuto por usuario

Los encabezados de respuesta incluyen información sobre los límites:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1617235200
```

## Versión de la API

La versión actual de la API es `v1` y se incluye en la ruta base:

```
https://api.example.com/v1/products
```

## Soporte

Para soporte técnico, contactar a:
- Email: soporte@example.com
- Documentación: https://docs.example.com/api
- Estado del servicio: https://status.example.com
