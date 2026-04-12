# 📋 Manual de Administrador - PURO Premium Natural Shots

## 🚀 Acceso al Panel de Administración

1. **URL del panel**: `http://tudominio.com/admin`
2. **Credenciales iniciales**:
   - **Email**: `admin@puro.com`
   - **Contraseña**: `Admin123`
3. **Recomendación**: Cambiar la contraseña después del primer acceso

## 📊 Dashboard Principal

El dashboard muestra métricas en tiempo real:
- **Usuarios registrados**: Total de clientes
- **Productos activos**: Productos disponibles para venta
- **Órdenes totales**: Histórico de pedidos
- **Ingresos totales**: Suma de todas las órdenes completadas
- **Estadísticas por estado**: Órdenes pendientes, procesando, enviadas, entregadas
- **Órdenes recientes**: Últimos 10 pedidos con detalles
- **Productos con bajo stock**: Productos con menos de 5 unidades
- **Productos más vendidos**: Top 5 productos del último mes

## 🛍️ Gestión de Productos

### Añadir Nuevo Producto
1. Ir a **Productos** en el menú lateral
2. Click en **"Añadir Producto"** (botón verde)
3. Completar formulario:
   - **Nombre**: Nombre del producto (ej: "Shot de Jengibre")
   - **Descripción**: Descripción detallada
   - **Precio**: Precio en COP (ej: 15000)
   - **Stock**: Cantidad disponible
   - **Categoría**: Seleccionar entre: `natural`, `energizante`, `detox`, `saludable`, `especial`
   - **Imagen**: Subir imagen (formatos: JPG, PNG, máximo 5MB)
4. Click en **"Guardar Producto"**

### Editar Producto Existente
1. Ir a **Productos** en el menú lateral
2. Buscar producto en la tabla
3. Click en **ícono de edición (✏️)**
4. Modificar campos necesarios
5. Click en **"Actualizar Producto"**

### Eliminar/Desactivar Producto
1. Ir a **Productos** en el menú lateral
2. Buscar producto en la tabla
3. Click en **ícono de eliminar (🗑️)**
   - **Nota**: Los productos se marcan como inactivos (soft delete)
   - No se eliminan físicamente para mantener historial de órdenes

### Actualizar Stock
1. Ir a **Productos** en el menú lateral
2. Buscar producto en la tabla
3. Click en **ícono de edición (✏️)**
4. Modificar campo **"Stock"**
5. Click en **"Actualizar Producto"**

## 👥 Gestión de Usuarios

### Ver Todos los Usuarios
1. Ir a **Usuarios** en el menú lateral
2. Ver tabla con todos los usuarios registrados
3. Información mostrada: Email, Nombre, Rol, Fecha registro

### Cambiar Rol de Usuario
1. Ir a **Usuarios** en el menú lateral
2. Buscar usuario en la tabla
3. Click en **"Cambiar Rol"**
4. Seleccionar nuevo rol:
   - **client**: Usuario normal (comprador)
   - **admin**: Administrador del sistema
5. Click en **"Confirmar Cambio"**

### Buscar Usuarios
- Usar campo de búsqueda en la parte superior
- Busca por email, nombre o apellido

## 📦 Gestión de Pedidos (Órdenes)

### Ver Todos los Pedidos
1. Ir a **Pedidos** en el menú lateral
2. Ver tabla con todos los pedidos
3. Información mostrada: ID, Cliente, Total, Estado, Fecha

### Cambiar Estado de Pedido
1. Ir a **Pedidos** en el menú lateral
2. Buscar pedido en la tabla
3. Click en **"Cambiar Estado"**
4. Seleccionar nuevo estado:
   - **pending**: Pendiente de pago
   - **processing**: Procesando (pago confirmado)
   - **shipped**: Enviado
   - **delivered**: Entregado
   - **cancelled**: Cancelado
5. Click en **"Actualizar Estado"**

### Ver Detalle de Pedido
1. Ir a **Pedidos** en el menú lateral
2. Buscar pedido en la tabla
3. Click en **ID del pedido** (enlace)
4. Ver página con:
   - Información del cliente
   - Productos comprados (cantidad, precio unitario, subtotal)
   - Dirección de envío
   - Notas del pedido
   - Historial de estados

### Buscar Pedidos
- Usar campo de búsqueda en la parte superior
- Busca por ID de pedido, email del cliente o nombre

## 🖼️ Gestión de Imágenes

### Subir Imágenes
1. **Para productos**: Al crear/editar producto
2. **Configuración**:
   - Formatos aceptados: JPG, JPEG, PNG, GIF
   - Tamaño máximo: 5MB
   - Se almacenan en: `public/uploads/`
   - En producción: Configurar Cloudinary en `.env`

### Configurar Cloudinary (Opcional)
1. Crear cuenta en [Cloudinary](https://cloudinary.com)
2. Obtener: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. Agregar al archivo `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   UPLOAD_PROVIDER=cloudinary
   ```
4. Reiniciar servidor

## 💳 Configuración de Pagos (Stripe)

### Configurar Stripe para Producción
1. Crear cuenta en [Stripe](https://stripe.com)
2. Obtener claves de API:
   - **Clave pública (publishable key)**
   - **Clave secreta (secret key)**
3. Agregar al archivo `.env`:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Configurar webhook en dashboard de Stripe:
   - **URL**: `https://tudominio.com/payments/webhook`
   - **Eventos**: `checkout.session.completed`, `payment_intent.succeeded`

### Probar Pagos en Desarrollo
- Usar claves de prueba (test keys)
- Tarjetas de prueba:
  - **Visa**: `4242 4242 4242 4242`
  - **CVC**: Cualquier 3 dígitos
  - **Fecha**: Cualquier fecha futura

## 📧 Configuración de Email

### Configurar Gmail para Recuperación de Contraseña
1. Habilitar "Acceso de aplicaciones menos seguras" en cuenta de Gmail
2. O usar "Contraseñas de aplicación" (recomendado)
3. Agregar al archivo `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASSWORD=tu_contraseña_o_app_password
   EMAIL_FROM=noreply@puro.com
   ```

### Probar Funcionalidad de Email
1. Ir a `http://tudominio.com/auth/forgot-password`
2. Ingresar email registrado
3. Revisar bandeja de entrada (y spam)
4. Click en enlace de recuperación
5. Establecer nueva contraseña

## 🔒 Seguridad y Mantenimiento

### Cambiar Contraseña de Admin
1. Ir a **Perfil** (menú superior derecho)
2. Click en **"Editar Perfil"**
3. Ingresar nueva contraseña
4. Confirmar nueva contraseña
5. Click en **"Actualizar Perfil"**

### Respaldar Base de Datos
```bash
# Exportar datos
pg_dump -U postgres puro_db > backup_$(date +%Y%m%d).sql

# Importar datos
psql -U postgres puro_db < backup.sql
```

### Monitorear Errores
1. Revisar logs del servidor:
   ```bash
   # Ver logs en tiempo real
   tail -f logs/error.log
   ```
2. Configurar monitoreo externo (opcional)

## 🚨 Solución de Problemas Comunes

### Problema: "No puedo acceder al panel admin"
- **Solución**: Verificar que estás usando credenciales correctas
- **Solución**: Verificar que el usuario tenga rol `admin`

### Problema: "No se muestran imágenes de productos"
- **Solución**: Verificar que la carpeta `public/uploads/` tenga permisos de escritura
- **Solución**: Verificar que las rutas en `.env` sean correctas

### Problema: "Los pagos no funcionan"
- **Solución**: Verificar claves de Stripe en `.env`
- **Solución**: Verificar que webhooks estén configurados

### Problema: "Los emails no llegan"
- **Solución**: Verificar credenciales de Gmail en `.env`
- **Solución**: Revisar carpeta de spam
- **Solución**: Probar con otro proveedor de email

## 📞 Soporte Técnico

### Contacto para Soporte
- **Desarrollador**: [contacto@desarrollador.com]
- **Documentación**: Ver `MANUAL_DESARROLLADOR.md`
- **Issues**: Reportar en repositorio GitHub

### Información del Sistema
- **Versión**: 1.0.0
- **Última actualización**: Abril 2026
- **Tecnologías**: Node.js, Express, PostgreSQL, EJS, Bootstrap 5

---

**Nota**: Este manual debe mantenerse actualizado con cada nueva versión del sistema. Para modificaciones técnicas, consultar `MANUAL_DESARROLLADOR.md`.