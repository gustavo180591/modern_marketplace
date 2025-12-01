# Soporte Multi-idioma

## Visión General
Sistema integral de internacionalización (i18n) y localización (l10n) que permite al marketplace atender a una audiencia global con soporte para múltiples idiomas, monedas y formatos regionales.

## Características Principales

### 1. Gestión de Idiomas
- Interfaz traducible a múltiples idiomas
- Selección de idioma preferido
- Traducción de contenido generado por el usuario

### 2. Conversión de Moneda
- Precios mostrados en moneda local
- Tasas de cambio en tiempo real
- Redondeo automático según estándares regionales

### 3. Localización
- Formatos de fecha y hora
- Unidades de medida
- Dirección postal y formatos de teléfono
- Impuestos según ubicación

## Estructura de Datos

### Configuración de Idioma
```javascript
{
  languageId: string,           // ej: 'es', 'en', 'pt-BR'
  name: string,                // nombre del idioma
  nativeName: string,          // nombre en el idioma nativo
  isDefault: boolean,          // idioma predeterminado
  isActive: boolean,           // si está habilitado
  rtl: boolean,               // derecha a izquierda
  flag: string,               // código de bandera
  dateFormat: string,         // ej: 'DD/MM/YYYY'
  timeFormat: string,         // ej: 'HH:mm'
  decimalSeparator: string,   // ',' o '.'
  thousandSeparator: string,  // '.' o ','
  currency: {
    code: string,            // ej: 'USD', 'EUR'
    symbol: string,          // ej: '$', '€'
    position: 'before' | 'after',
    decimals: number
  },
  translations: {
    [key: string]: string    // pares clave-traducción
  }
}
```

### Configuración Regional
```javascript
{
  regionId: string,           // ej: 'es-ES', 'en-US'
  language: string,          // idioma principal
  country: string,           // código de país
  currency: string,          // moneda predeterminada
  taxSettings: {
    defaultRate: number,     // tasa de impuesto predeterminada
    isTaxIncluded: boolean,  // si el IVA está incluido en los precios
    taxDisplay: 'inclusive' | 'exclusive'
  },
  shipping: {
    availableCarriers: string[],
    defaultCarrier: string
  },
  paymentMethods: string[],  // métodos de pago disponibles
  units: {
    weight: 'kg' | 'lb',
    dimensions: 'cm' | 'in',
    volume: 'l' | 'gal'
  },
  addressFormat: {
    format: string,         // plantilla de formato
    requiredFields: string[] // campos obligatorios
  }
}
```

## Flujo de Trabajo de Traducción

1. **Extracción**
   - Identificar cadenas traducibles en el código
   - Extraer a archivos de recursos (.json, .po)
   
2. **Traducción**
   - Interfaz para traductores
   - Integración con servicios de traducción
   - Sistema de sugerencias de la comunidad
   
3. **Validación**
   - Revisión de traducciones
   - Pruebas de UI para diferentes idiomas
   - Aprobación de cambios

## API Endpoints

### Gestión de Idiomas
- `GET /api/i18n/languages` - Listar idiomas disponibles
- `POST /api/i18n/languages` - Añadir nuevo idioma
- `PUT /api/i18n/languages/:code` - Actualizar configuración de idioma

### Traducciones
- `GET /api/i18n/translations` - Obtener traducciones
- `POST /api/i18n/translations` - Crear/actualizar traducción
- `GET /api/i18n/export` - Exportar traducciones
- `POST /api/i18n/import` - Importar traducciones

### Configuración Regional
- `GET /api/regions` - Listar configuraciones regionales
- `GET /api/regions/:id` - Obtener configuración regional
- `PUT /api/regions/:id` - Actualizar configuración regional

## Implementación Técnica

### Frontend
- Biblioteca de internacionalización (i18next)
- Detección automática de idioma del navegador
- Cambio de idioma sin recargar la página
- Carga dinámica de traducciones

### Backend
- Almacenamiento de traducciones en base de datos
- Caché de traducciones para rendimiento
- API para gestión de contenido multilingüe

### Base de Datos
- Estructura para contenido traducible
- Índices para búsquedas multilingües
- Soporte para collation específico de idioma

## Consideraciones de Rendimiento
- Carga perezosa de traducciones
- Caché de traducciones en el cliente
- Minificación de archivos de idioma
- Pre-renderizado de páginas estáticas por idioma

## Próximos Pasos
1. Implementar sistema básico de i18n
2. Añadir soporte para 2-3 idiomas principales
3. Implementar selector de idioma en la interfaz
4. Configurar formatos regionales
5. Añadir soporte RTL (derecha a izquierda)
