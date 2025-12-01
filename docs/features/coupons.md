# Sistema de Cupones

## Visión General
Sistema flexible de gestión de descuentos y promociones que permite crear y administrar diferentes tipos de ofertas para impulsar ventas y fidelizar clientes.

## Características Principales

### 1. Tipos de Cupones
- Descuento porcentual
- Descuento por monto fijo
- Envío gratuito
- Compra X lleve Y
- Descuento por categoría/marca

### 2. Reglas de Aplicación
- Mínimo de compra
- Límite de usos por cliente
- Validez temporal
- Combinable con otras ofertas
- Restricciones por categoría/producto

### 3. Distribución
- Códigos únicos o de un solo uso
- Códigos promocionales públicos
- Cupones por correo electrónico
- Generación masiva de códigos

## Estructura de Datos

### Cupón
```javascript
{
  code: string,                    // Código del cupón (ej: "VERANO20")
  name: string,                    // Nombre descriptivo
  description: string,             // Descripción para mostar al usuario
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo',
  value: number,                   // Valor del descuento (ej: 20 para 20% o $20)
  minPurchase: number | null,      // Mínimo de compra requerido
  maxDiscount: number | null,      // Descuento máximo (para porcentajes)
  startDate: Date,                 // Fecha de inicio de validez
  endDate: Date | null,            // Fecha de fin (null = sin fecha de expiración)
  maxUses: number | null,          // Usos máximos totales
  maxUsesPerUser: number | null,   // Usos máximos por usuario
  isActive: boolean,               // Si el cupón está activo
  isPublic: boolean,               // Si aparece en listados públicos
  
  // Restricciones
  allowedUsers: string[] | null,   // IDs de usuarios permitidos (null = todos)
  productRestrictions: {
    type: 'all' | 'products' | 'categories' | 'collections',
    items: string[]               // IDs de productos/categorías/colecciones
  },
  
  // Para cupones BOGO (Buy One Get One)
  bogoConfig: {
    buyQuantity: number,          // Cantidad a comprar
    getQuantity: number,          // Cantidad a obtener gratis
    discountType: 'cheapest' | 'lowest_price' | 'percentage',
    discountValue: number | null  // Solo si es porcentaje
  } | null,
  
  // Seguimiento
  timesUsed: number,              // Veces que se ha usado
  createdBy: string,              // ID del administrador que lo creó
  createdAt: Date,
  updatedAt: Date
}
```

### Uso de Cupón
```javascript
{
  id: string,
  couponCode: string,             // Referencia al cupón
  userId: string | null,          // Usuario que usó el cupón (puede ser null para invitados)
  orderId: string,                // Orden donde se aplicó
  discountAmount: number,         // Monto descontado
  originalTotal: number,          // Total antes de descuento
  finalTotal: number,             // Total después de descuento
  usedAt: Date,
  ipAddress: string,              // Para seguimiento de fraude
  userAgent: string               // Información del navegador
}
```

## Flujos de Trabajo

### 1. Aplicación de Cupón
1. Usuario ingresa código en el carrito
2. Sistema valida el cupón (fechas, usos, restricciones)
3. Se muestra el descuento aplicado
4. Se procesa el pago con el descuento
5. Se registra el uso del cupón

### 2. Creación de Cupón
1. Administrador define parámetros del cupón
2. Sistema genera código único (o se ingresa manual)
3. Se configuran restricciones y reglas
4. Se publica el cupón

## API Endpoints

### Gestión de Cupones
- `GET /api/coupons` - Listar cupones (con filtros)
- `POST /api/coupons` - Crear nuevo cupón
- `GET /api/coupons/:code` - Obtener detalles de cupón
- `PUT /api/coupons/:code` - Actualizar cupón
- `DELETE /api/coupons/:code` - Eliminar cupón

### Validación y Uso
- `POST /api/coupons/validate` - Validar cupón para un carrito
- `POST /api/coupons/:code/apply` - Aplicar cupón a una orden
- `GET /api/coupons/:code/usage` - Obtener historial de usos

## Reglas de Negocio

### Prioridad de Cupones
1. Cupones de categoría/marca específica
2. Cupones de carrito
3. Cupones de envío gratuito

### Restricciones
- Un cupón por orden (a menos que sean combinables)
- No aplicable a productos en oferta (a menos que se especifique)
- No reembolsable en devoluciones parciales

## Próximos Pasos
1. Implementar sistema básico de cupones
2. Crear interfaz de administración
3. Añadir seguimiento de conversión
4. Implementar generación masiva de códigos
5. Crear informes de efectividad
