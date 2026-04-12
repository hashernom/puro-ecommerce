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

- **CSRF Protection**: Todos los endpoints POST/PUT/DELETE requieren token CSRF
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de origen cruzado
- **Rate Limiting**: Límite de solicitudes por IP
- **SQL Injection Prevention**: Sequelize con parámetros preparados
- **XSS Protection**: Sanitización de inputs

## Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/puro_db

# Servidor
PORT=3000
NODE_ENV=development
SESSION_SECRET=secret_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
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