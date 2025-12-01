# Sistema de Afiliados

## Visión General
Programa de marketing de afiliados que permite a los usuarios ganar comisiones promocionando productos del marketplace a través de enlaces de referencia únicos.

## Características Principales

### 1. Gestión de Afiliados
- Registro y aprobación de afiliados
- Niveles de afiliados (basados en rendimiento)
- Documentación y recursos para afiliados

### 2. Seguimiento de Conversiones
- Cookies de seguimiento (30 días por defecto)
- Atribución de ventas
- Detección de fraude

### 3. Comisiones y Pagos
- Múltiples estructuras de comisión
- Programación de pagos
- Umbral mínimo de retiro

## Estructura de Datos

### Afiliado
```javascript
{
  affiliateId: string,
  userId: string,                    // Usuario que es afiliado
  company: string | null,            // Opcional: empresa/red de afiliados
  paymentEmail: string,              // Para pagos
  taxId: string | null,              // Para facturación
  referralCode: string,              // Código único de referencia
  customDomain: string | null,       // Dominio personalizado
  commissionRate: number,            // % de comisión base
  status: 'pending' | 'approved' | 'suspended' | 'rejected',
  
  // Métricas
  totalEarnings: number,             // Ganancias totales
  availableBalance: number,          // Saldo disponible para retiro
  totalPaid: number,                 // Total pagado
  
  // Configuración
  paymentMethod: {
    type: 'paypal' | 'bank_transfer' | 'crypto',
    details: object                 // Detalles específicos del método
  },
  
  // Configuración de notificaciones
  notifications: {
    newReferral: boolean,
    commissionEarned: boolean,
    paymentSent: boolean
  },
  
  // Auditoría
  approvedAt: Date | null,
  approvedBy: string | null,
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Comisión
```javascript
{
  commissionId: string,
  affiliateId: string,
  orderId: string,
  userId: string,                    // Cliente que realizó la compra
  
  // Detalles de la transacción
  subtotal: number,                  // Subtotal de la orden
  commissionRate: number,            // % de comisión aplicado
  commissionAmount: number,          // Monto de la comisión
  
  // Estado
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'refunded',
  
  // Seguimiento
  referralCode: string,              // Código usado
  referralSource: string,            // Origen del tráfico
  ipAddress: string,
  userAgent: string,
  
  // Pago
  paymentId: string | null,          // ID del pago cuando se procesa
  paidAt: Date | null,
  
  // Auditoría
  approvedAt: Date | null,
  approvedBy: string | null,
  notes: string,
  createdAt: Date
}
```

## Flujos de Trabajo

### 1. Registro de Afiliado
1. Usuario solicita unirse al programa
2. Completa formulario con información de pago
3. Aprobación del administrador
4. Recibe credenciales y enlaces de afiliado

### 2. Proceso de Referencia
1. Afiliado comparte enlace con código único
2. Cliente hace clic y se guarda cookie
3. Si el cliente realiza una compra, se registra la comisión
4. La comisión se marca como pendiente
5. Después del período de reembolso, se aprueba la comisión

## API Endpoints

### Gestión de Afiliados
- `POST /api/affiliates/register` - Solicitar registro
- `GET /api/affiliates/me` - Obtener perfil de afiliado
- `PUT /api/affiliates/me` - Actualizar perfil
- `GET /api/affiliates/stats` - Estadísticas de rendimiento

### Comisiones
- `GET /api/affiliates/commissions` - Historial de comisiones
- `GET /api/affiliates/commissions/:id` - Detalles de comisión
- `POST /api/affiliates/payout-request` - Solicitar pago

### Herramientas para Afiliados
- `GET /api/affiliates/links` - Generar enlaces de afiliación
- `GET /api/affiliates/creative-assets` - Obtener banners y materiales
- `GET /api/affiliates/referrals` - Lista de referidos

## Estructura de Comisiones

### Tipos de Comisión
1. **Porcentaje de la venta**
   - Ejemplo: 10% de cada venta
   
2. **Por nivel**
   - Nivel 1: 10% de ventas directas
   - Nivel 2: 5% de ventas de referidos
   
3. **Fijo por venta**
   - Ejemplo: $5 por cada venta

4. **Híbrido**
   - Combinación de porcentaje y fijo

## Panel de Control del Afiliado
- Resumen de ganancias
- Gráficos de rendimiento
- Herramientas de seguimiento
- Generador de enlaces
- Historial de pagos

## Consideraciones de Seguridad
- Prevención de fraude por clics
- Detección de auto-referencias
- Límites de comisiones
- Política de devoluciones y comisiones

## Próximos Pasos
1. Implementar registro y aprobación de afiliados
2. Crear sistema de seguimiento de referencias
3. Desarrollar panel de control del afiliado
4. Implementar sistema de pagos
5. Crear materiales de marketing para afiliados
