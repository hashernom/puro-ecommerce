# Documentación de la API - PURO Premium Natural Shots

## Descripción General
API RESTful para la plataforma de e-commerce PURO Premium Natural Shots. Desarrollada con Node.js, Express, Sequelize (PostgreSQL) y EJS.

## Autenticación
La API utiliza sesiones basadas en cookies para autenticación. Algunos endpoints requieren autenticación.

### Headers comunes
- `Content-Type: application/json` para solicitudes con cuerpo
- `X-CSRF-Token: <token>` para protección CSRF en métodos POST/PUT/DELETE

## Endpoints

### Autenticación

#### POST /auth/login
Autentica un usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "first_name": "Nombre",
    "last_name": "Apellido",
    "role": "client"
  }
}
```

#### POST /auth/register
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "nuevo@example.com",
  "password": "contraseña",
  "first_name": "Nombre",
  "last_name": "Apellido"
}
```

#### POST /auth/forgot-password
Solicita recuperación de contraseña.

**Body:**
```json
{
  "email": "usuario@example.com"
}
```

#### POST /auth/reset-password/:token
Restablece contraseña con token.

**Body:**
```json
{
  "password": "nueva_contraseña",
  "confirmPassword": "nueva_contraseña"
}
```

### Productos

#### GET /products/api
Obtiene lista de productos con filtros.

**Parámetros de consulta:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Productos por página (default: 12)
- `search` (opcional): Texto para búsqueda
- `category` (opcional): Categoría del producto
- `minPrice` (opcional): Precio mínimo
- `maxPrice` (opcional): Precio máximo
- `inStock` (opcional): "true" para solo productos en stock
- `sort` (opcional): Campo para ordenar (name, price, created_at)
- `order` (opcional): Dirección (ASC, DESC)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Shot Energético",
        "description": "Energía instantánea natural",
        "price": "12.99",
        "stock": 50,
        "image_url": "/images/energetico.jpg",
        "category": "energetico",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 12
    },
    "categories": ["natural", "energetico", "detox"]
  }
}
```

#### GET /products/:id
Obtiene detalles de un producto específico.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Shot Energético",
    "description": "Energía instantánea natural",
    "price": "12.99",
    "stock": 50,
    "image_url": "/images/energetico.jpg",
    "category": "energetico",
    "is_active": true
  }
}
```

### Carrito

#### GET /orders/cart/api
Obtiene el carrito del usuario.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": 1,
        "name": "Shot Energético",
        "price": 12.99,
        "quantity": 2,
        "subtotal": 25.98,
        "image_url": "/images/energetico.jpg"
      }
    ],
    "total": 25.98,
    "totalItems": 2
  }
}
```

#### POST /orders/cart
Agrega producto al carrito.

**Body:**
```json
{
  "productId": 1,
  "quantity": 1
}
```

#### PUT /orders/cart/:productId
Actualiza cantidad de producto en carrito.

**Body:**
```json
{
  "quantity": 3
}
```

#### DELETE /orders/cart/:productId
Elimina producto del carrito.

#### DELETE /orders/cart
Vacía el carrito completo.

### Pedidos

#### POST /orders
Crea un nuevo pedido.

**Body:**
```json
{
  "shipping_address": "Calle Falsa 123, Ciudad",
  "notes": "Entregar después de las 5pm"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Pedido creado correctamente",
  "data": {
    "orderId": 123
  }
}
```

#### GET /orders/user/api
Obtiene pedidos del usuario.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "user_id": 1,
      "total_amount": "45.97",
      "status": "processing",
      "shipping_address": "Calle Falsa 123, Ciudad",
      "notes": "Entregar después de las 5pm",
      "created_at": "2024-01-01T00:00:00.000Z",
      "orderDetails": [
        {
          "product_id": 1,
          "quantity": 2,
          "unit_price": "12.99",
          "product": {
            "id": 1,
            "name": "Shot Energético",
            "image_url": "/images/energetico.jpg"
          }
        }
      ]
    }
  ]
}
```

#### PUT /orders/:id/cancel
Cancela un pedido.

### Pagos

#### POST /payment/create-checkout-session
Crea sesión de pago con Stripe.

**Body:**
```json
{
  "orderId": 123
}
```

**Respuesta:**
```json
{
  "success": true,
  "sessionId": "cs_test_..."
}
```

#### POST /payment/webhook
Webhook de Stripe para procesar pagos completados.

### Administración

#### GET /admin/dashboard
Dashboard con estadísticas (requiere rol admin).

#### GET /admin/products/api
Lista de productos para administración.

#### POST /admin/products
Crea nuevo producto.

**Body:**
```json
{
  "name": "Nuevo Producto",
  "description": "Descripción",
  "price": 19.99,
  "stock": 100,
  "category": "natural",
  "is_active": true
}
```

#### PUT /admin/products/:id
Actualiza producto.

#### DELETE /admin/products/:id
Elimina producto (soft delete).

#### PUT /admin/orders/:id/status
Actualiza estado de pedido.

**Body:**
```json
{
  "status": "shipped"
}
```

### Imágenes

#### POST /images/upload
Sube imagen de producto.

**FormData:**
- `image`: Archivo de imagen
- `productId` (opcional): ID del producto

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/product-123.jpg",
    "filename": "product-123.jpg"
  }
}
```

## Códigos de Estado HTTP

- `200`: OK - Solicitud exitosa
- `201`: Created - Recurso creado
- `400`: Bad Request - Datos inválidos
- `401`: Unauthorized - No autenticado
- `403`: Forbidden - No autorizado
- `404`: Not Found - Recurso no encontrado
- `422`: Unprocessable Entity - Validación fallida
- `500`: Internal Server Error - Error del servidor

## Validaciones

La API utiliza express-validator para validaciones. Los errores de validación retornan:

```json
{
  "success": false,
  "errors": [
    {
      "msg": "El email es requerido",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## Seguridad

La aplicación implementa múltiples capas de seguridad para proteger contra vulnerabilidades comunes:

### Medidas Implementadas

1. **Protección CSRF (Cross-Site Request Forgery)**
   - Implementación real con `csrf-csrf` (double submit cookie pattern)
   - Tokens generados automáticamente para todas las vistas
   - Validación en todas las rutas POST/PUT/DELETE
   - Excepciones configuradas para APIs públicas y webhooks

2. **Headers de Seguridad HTTP**
   - Helmet.js con configuración CSP personalizada
   - Headers adicionales: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy para restringir características del navegador

3. **CORS Seguro**
   - Configuración restringida por origen (`ALLOWED_ORIGINS`)
   - Métodos HTTP permitidos configurados (`ALLOWED_METHODS`)
   - Headers personalizados permitidos (`ALLOWED_HEADERS`)
   - Credenciales controladas por entorno

4. **Rate Limiting**
   - Límite general: 100 solicitudes por IP cada 15 minutos
   - Límite estricto para autenticación: 10 intentos cada 15 minutos
   - Headers estándar para información de límites
   - Mensajes de error personalizados

5. **Prevención de SQL Injection**
   - Sequelize ORM con parámetros preparados
   - Validación estricta de parámetros de ruta (`middleware/paramValidation.js`)
   - Type checking para todos los IDs numéricos
   - Middleware global de sanitización

6. **Protección XSS (Cross-Site Scripting)**
   - Sanitización automática de inputs en body y query params
   - Escape de caracteres HTML en strings
   - Validación de tipos de datos con express-validator
   - Middleware de validación global (`middleware/globalValidation.js`)

7. **Gestión Segura de Secrets**
   - Validación de variables de entorno críticas en producción
   - Generación automática de secrets aleatorios en desarrollo
   - Fallback controlado con advertencias explícitas
   - Error fatal si faltan secrets en producción

8. **Validación de Inputs**
   - Middleware de validación global para tipos de datos comunes
   - Sanitización básica contra XSS
   - Validación de emails, números, strings y precios
   - Manejador de errores de validación unificado

9. **Seguridad de Sesiones**
   - Cookies HTTP-only y Secure (en producción)
   - SameSite strict para cookies CSRF
   - Tiempo de expiración configurable
   - Store en base de datos con Sequelize

### Configuración de Variables de Entorno

Las siguientes variables son críticas para seguridad:

```env
# ── Servidor ──────────────────────────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ── Base de datos ────────────────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=puro_db
DB_USER=postgres
DB_PASSWORD=tu_password

# ── Sesiones y Autenticación ─────────────────────────────────────────────
SESSION_SECRET=tu_super_secret_key_aleatoria
CSRF_SECRET=opcional_secret_para_csrf  # Si no se define, se genera automáticamente

# ── CORS (Seguridad de Orígenes Cruzados) ────────────────────────────────
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
ALLOWED_HEADERS=Content-Type,Authorization,X-CSRF-Token
CORS_CREDENTIALS=true

# ── Stripe (Pagos) ──────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# ── Email ────────────────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password_email
EMAIL_FROM=noreply@puro.com

# ── Cloudinary (Opcional - Imágenes) ────────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Notas importantes:**
1. `SESSION_SECRET` debe ser una cadena larga y aleatoria (mínimo 32 caracteres)
2. En producción, `NODE_ENV` debe ser `production` para habilitar cookies secure
3. `ALLOWED_ORIGINS` debe listar solo los dominios permitidos en producción
4. Las variables marcadas como opcionales tienen valores por defecto seguros para desarrollo
EMAIL_PASSWORD=tu_contraseña

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Ejemplos de Uso

### JavaScript (Frontend)
```javascript
// Agregar al carrito
async function addToCart(productId, quantity) {
    const response = await fetch('/orders/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': window.csrfToken
        },
        body: JSON.stringify({ productId, quantity })
    });
    return await response.json();
}

// Obtener productos con filtros
async function getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/products/api?${params}`);
    return await response.json();
}
```

### cURL
```bash
# Obtener productos
curl -X GET "http://localhost:3000/products/api?category=natural&minPrice=10"

# Crear pedido (con sesión activa)
curl -X POST "http://localhost:3000/orders" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -d '{"shipping_address": "Calle 123"}'
```

## Errores Comunes

1. **CSRF Token Missing**: Asegurar que el header `X-CSRF-Token` esté presente
2. **Session Expired**: La sesión ha expirado, requerir nuevo login
3. **Validation Errors**: Revisar formato de datos enviados
4. **Stock Insufficient**: Producto sin stock suficiente
5. **Permission Denied**: Usuario sin permisos para la acción

## Soporte

Para reportar problemas o solicitar características, crear un issue en el repositorio del proyecto.