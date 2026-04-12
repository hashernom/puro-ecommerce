# PURO - Premium Natural Shots 🍃

Plataforma de e-commerce especializada en shots naturales premium. Desarrollada con Node.js, Express, PostgreSQL y EJS.

## 🚀 Características Principales

### 🛒 Funcionalidades de E-commerce
- **Catálogo de productos** con filtros avanzados (categoría, precio, disponibilidad)
- **Carrito de compras persistente** (sincronizado entre sesión y base de datos)
- **Sistema de pedidos** completo con seguimiento de estado
- **Checkout con Stripe** integrado
- **Gestión de inventario** con alertas de bajo stock

### 👤 Gestión de Usuarios
- Registro y autenticación segura con bcrypt
- Recuperación de contraseña vía email
- Perfiles de usuario personalizables
- Sistema de roles (cliente/admin)

### 🛡️ Seguridad
- Protección CSRF en todos los formularios
- Headers de seguridad con Helmet
- Validación de inputs con express-validator
- Sanitización contra XSS e inyección SQL
- Sesiones almacenadas en base de datos

### 📊 Panel de Administración
- Dashboard con métricas en tiempo real
- Gestión completa de productos
- Administración de pedidos y usuarios
- Reportes de ventas y productos más vendidos

## 🏗️ Arquitectura

```
puro/
├── config/           # Configuraciones (DB, email, stripe, upload)
├── controllers/      # Lógica de negocio
├── models/          # Modelos de Sequelize
├── middleware/      # Middlewares personalizados
├── routes/          # Definición de rutas
├── views/           # Plantillas EJS
├── public/          # Archivos estáticos
├── tests/           # Pruebas automatizadas
└── server.js        # Punto de entrada
```

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js
- **Base de datos**: PostgreSQL, Sequelize ORM
- **Frontend**: EJS, Bootstrap 5, JavaScript vanilla
- **Autenticación**: express-session, bcrypt
- **Pagos**: Stripe API
- **Email**: Nodemailer
- **Archivos**: Multer, Cloudinary (opcional)
- **Testing**: Jest, Supertest
- **Seguridad**: Helmet, csrf-csrf, express-validator

## 📦 Instalación

### 1. Requisitos Previos
- Node.js 16+
- PostgreSQL 12+
- npm o yarn

### 2. Configuración
```bash
# Clonar repositorio
git clone <repo-url>
cd puro

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Configurar Base de Datos
```bash
# Crear base de datos
npm run db:create

# Ejecutar migraciones
npm run db:migrate

# Poblar con datos de prueba
npm run db:seed
```

### 4. Iniciar Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔧 Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
# Servidor
PORT=3000
NODE_ENV=development
SESSION_SECRET=tu_secreto_seguro

# Base de datos
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/puro_db

# Stripe (opcional para desarrollo)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (para recuperación de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app

# Cloudinary (opcional para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## 📖 Uso

### Usuario Regular
1. **Registrarse** en `/auth/register`
2. **Explorar productos** en `/products`
3. **Agregar al carrito** productos deseados
4. **Completar pedido** desde el carrito
5. **Pagar** con Stripe Checkout
6. **Seguir pedidos** en `/orders/user`

### Administrador
1. **Acceder** a `/admin` con credenciales de admin
2. **Gestionar productos** desde el dashboard
3. **Ver estadísticas** de ventas y usuarios
4. **Actualizar estados** de pedidos
5. **Administrar usuarios** y roles

## 🧪 Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas específicas
npm test -- tests/models/Product.test.js
```

## 📚 Documentación de API

Ver [API_DOCUMENTATION.md](API_DOCUMENTATION.md) para documentación completa de endpoints.

## 🔄 Scripts Disponibles

```bash
npm run dev          # Desarrollo con nodemon
npm start           # Producción
npm test           # Ejecutar pruebas
npm run db:create  # Crear base de datos
npm run db:seed    # Poblar con datos de prueba
npm run db:reset   # Reiniciar base de datos
```

## 🚢 Despliegue

### Opción 1: Railway / Render
1. Conectar repositorio Git
2. Configurar variables de entorno
3. Desplegar automáticamente

### Opción 2: VPS tradicional
```bash
# Instalar Node.js y PostgreSQL
sudo apt update
sudo apt install nodejs postgresql

# Clonar y configurar
git clone <repo-url>
cd puro
npm install --production

# Configurar PM2 para producción
npm install -g pm2
pm2 start server.js --name puro
pm2 save
pm2 startup
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

- **Issues**: Reportar bugs o solicitar features en GitHub Issues
- **Email**: Contactar al administrador del proyecto
- **Documentación**: Consultar [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🙏 Agradecimientos

- [Express.js](https://expressjs.com/) - Framework web minimalista
- [Sequelize](https://sequelize.org/) - ORM para Node.js
- [Bootstrap](https://getbootstrap.com/) - Framework CSS
- [Stripe](https://stripe.com/) - Plataforma de pagos
- [Jest](https://jestjs.io/) - Framework de testing

---

**PURO Premium Natural Shots** - Energía natural en cada shot 💚