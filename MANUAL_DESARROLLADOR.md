# 🛠️ Manual de Desarrollador - PURO Premium Natural Shots

## 📁 Estructura del Proyecto

```
puro/
├── config/                 # Configuraciones
│   ├── database.js        # Configuración PostgreSQL/Sequelize
│   ├── email.js           # Configuración Nodemailer
│   ├── stripe.js          # Configuración Stripe
│   └── upload.js          # Configuración Multer/Cloudinary
├── controllers/           # Controladores MVC
│   ├── adminController.js # Panel de administración
│   ├── authController.js  # Autenticación
│   ├── cartController.js  # Carrito de compras
│   ├── imageController.js # Carga de imágenes
│   ├── orderController.js # Gestión de pedidos
│   ├── passwordResetController.js # Recuperación contraseña
│   ├── paymentController.js # Pagos con Stripe
│   └── productController.js # Productos y catálogo
├── middleware/            # Middlewares
│   ├── auth.js           # Autenticación y autorización
│   ├── csrf.js           # Protección CSRF
│   └── validation.js     # Validación de datos
├── models/               # Modelos Sequelize
│   ├── Cart.js          # Carrito en sesión (legacy)
│   ├── CartItem.js      # Carrito persistente
│   ├── Order.js         # Pedidos
│   ├── OrderDetail.js   # Detalles de pedido
│   ├── PasswordResetToken.js # Tokens recuperación
│   ├── Product.js       # Productos
│   ├── User.js          # Usuarios
│   └── index.js         # Conexión y relaciones
├── routes/               # Rutas
│   ├── admin.js         # Rutas de administración
│   ├── auth.js          # Rutas de autenticación
│   ├── images.js        # Rutas de imágenes
│   ├── orders.js        # Rutas de pedidos
│   ├── payments.js      # Rutas de pagos
│   └── products.js      # Rutas de productos
├── views/               # Vistas EJS
│   ├── layouts/         # Layouts principales
│   ├── admin/           # Vistas de administración
│   ├── auth/            # Vistas de autenticación
│   ├── orders/          # Vistas de pedidos
│   ├── products/        # Vistas de productos
│   └── partials/        # Componentes reutilizables
├── public/              # Archivos estáticos
│   ├── css/            # Estilos CSS
│   ├── js/             # JavaScript del frontend
│   └── uploads/        # Imágenes subidas
├── tests/               # Pruebas
│   ├── controllers/     # Pruebas de controladores
│   └── models/          # Pruebas de modelos
└── scripts/             # Scripts utilitarios
    ├── seed-database.js # Población de datos inicial
    └── add-category-column.js # Migración de base de datos
```

## 🚀 Configuración del Entorno de Desarrollo

### Requisitos Previos
- **Node.js**: v16 o superior
- **PostgreSQL**: v12 o superior
- **npm**: v8 o superior

### Pasos de Instalación
```bash
# 1. Clonar repositorio
git clone <repo-url>
cd puro

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Crear base de datos
node create-db.js

# 5. Ejecutar migraciones (si las hay)
node add-category-column.js

# 6. Poblar datos iniciales
node seed-database.js

# 7. Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno (.env)
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=puro_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Sesiones
SESSION_SECRET=tu_secreto_sesion

# Stripe (pagos)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (recuperación contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña
EMAIL_FROM=noreply@puro.com

# Cloudinary (imágenes - opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
UPLOAD_PROVIDER=local  # o 'cloudinary'
```

## 🏗️ Arquitectura del Sistema

### Patrón MVC
- **Models**: Definición de datos y relaciones (Sequelize)
- **Views**: Plantillas EJS con Bootstrap 5
- **Controllers**: Lógica de negocio y respuesta HTTP

### Flujo de una Solicitud
```
Cliente → Middleware (auth, csrf, validation) → Router → Controller → Model → Database
       ← Response (View/JSON) ← Controller ←
```

### Base de Datos (PostgreSQL + Sequelize)
```javascript
// Ejemplo de modelo
const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    category: { type: DataTypes.STRING(100), defaultValue: 'natural' }
}, {
    hooks: {
        beforeUpdate: async (product) => {
            // Lógica antes de actualizar
        }
    }
});
```

## 🔧 Extensión del Sistema

### Añadir Nuevo Modelo
1. Crear archivo en `models/NuevoModelo.js`
2. Definir esquema con Sequelize
3. Agregar relaciones en `models/index.js`
4. Crear migración si es necesario

### Añadir Nuevo Controlador
1. Crear archivo en `controllers/nuevoController.js`
2. Implementar clase con métodos estáticos
3. Exportar clase
4. Crear rutas correspondientes

### Añadir Nueva Ruta
1. Crear archivo en `routes/nuevaRuta.js` o extender existente
2. Importar controladores
3. Definir rutas con validación y middlewares
4. Registrar en `server.js`

### Añadir Nueva Vista
1. Crear archivo en `views/nuevaVista.ejs`
2. Extender layout principal: `<%- include('layouts/main') %>`
3. Usar partials para componentes reutilizables
4. Agregar estilos en `public/css/style.css`

## 💾 Base de Datos y Migraciones

### Crear Nueva Migración
```javascript
// scripts/nueva-migracion.js
const { sequelize } = require('../models');

async function runMigration() {
    const queryInterface = sequelize.getQueryInterface();
    
    // Añadir columna
    await queryInterface.addColumn('products', 'nueva_columna', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
    });
    
    // Modificar datos existentes
    await sequelize.query(`
        UPDATE products 
        SET nueva_columna = 'valor_default' 
        WHERE nueva_columna IS NULL
    `);
    
    console.log('✅ Migración completada');
}

runMigration().catch(console.error);
```

### Ejecutar Migración
```bash
node scripts/nueva-migracion.js
```

### Revertir Migración
```javascript
// Incluir en el mismo script
async function rollbackMigration() {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.removeColumn('products', 'nueva_columna');
    console.log('✅ Rollback completado');
}
```

## 🔌 Integración con APIs Externas

### Stripe (Pagos)
```javascript
// Configuración en config/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Crear sesión de checkout
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: products.map(p => ({
        price_data: {
            currency: 'cop',
            product_data: { name: p.name },
            unit_amount: Math.round(p.price * 100)
        },
        quantity: p.quantity
    })),
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/orders/payment-success`,
    cancel_url: `${process.env.BASE_URL}/orders/payment-cancel`
});
```

### Cloudinary (Imágenes)
```javascript
// Configuración en config/upload.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Subir imagen
const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'puro/products',
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
});
```

### Nodemailer (Email)
```javascript
// Configuración en config/email.js
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Enviar email
await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Recuperación de contraseña',
    html: `<p>Haz click <a href="${resetUrl}">aquí</a> para restablecer tu contraseña</p>`
});
```

## 🧪 Testing

### Ejecutar Pruebas
```bash
# Todas las pruebas
npm test

# Pruebas específicas
npm test -- tests/models/Product.test.js

# Con cobertura
npm run test:coverage
```

### Estructura de Pruebas
```javascript
// tests/models/Product.test.js
describe('Product Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });
    
    test('debería crear un producto', async () => {
        const product = await Product.create({
            name: 'Test Product',
            price: 10000,
            stock: 10
        });
        
        expect(product.id).toBeDefined();
        expect(product.name).toBe('Test Product');
    });
    
    test('debería validar precio positivo', async () => {
        await expect(Product.create({
            name: 'Invalid Product',
            price: -100,
            stock: 10
        })).rejects.toThrow();
    });
});
```

### Añadir Nuevas Pruebas
1. Crear archivo en `tests/` con sufijo `.test.js`
2. Usar Jest para assertions
3. Mockear dependencias externas cuando sea necesario
4. Limpiar base de datos entre pruebas

## 🔒 Seguridad

### Autenticación y Autorización
- **bcrypt**: Hash de contraseñas
- **express-session**: Sesiones almacenadas en DB
- **Middleware `requireAuth`**: Rutas protegidas
- **Middleware `requireAdmin`**: Solo administradores

### CSRF Protection
- **Middleware `csrf.js`**: Tokens en formularios
- **Validación automática**: En solicitudes POST/PUT/DELETE
- **Compatibilidad con AJAX**: Tokens en headers

### Validación de Entrada
```javascript
// middleware/validation.js
const validateProduct = [
    body('name').trim().notEmpty().withMessage('Nombre requerido'),
    body('price').isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('stock').isInt({ min: 0 }).withMessage('Stock inválido'),
    handleValidationErrors
];
```

### Headers de Seguridad
```javascript
// server.js
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "js.stripe.com"]
        }
    }
}));
```

## 🚀 Despliegue

### Preparación para Producción
1. Cambiar `NODE_ENV=production` en `.env`
2. Configurar dominio real en `BASE_URL`
3. Usar claves reales de Stripe, Cloudinary, etc.
4. Configurar SSL/HTTPS
5. Configurar reverse proxy (Nginx/Apache)

### Scripts de Despliegue
```bash
# Build (si aplica)
npm run build

# Iniciar en producción
npm start

# Con PM2 (recomendado)
pm2 start server.js --name "puro-ecommerce"
pm2 save
pm2 startup
```

### Monitoreo
- **Logs**: `pm2 logs puro-ecommerce`
- **Métricas**: `pm2 monit`
- **Health checks**: Endpoint `/health`

## 🐛 Depuración y Troubleshooting

### Logs del Servidor
```javascript
// Habilitar logging detallado
const morgan = require('morgan');
app.use(morgan('dev'));  // Desarrollo
app.use(morgan('combined'));  // Producción
```

### Debug de Sequelize
```javascript
// En .env
DEBUG=sequelize:*

// O en database.js
const sequelize = new Sequelize(..., {
    logging: console.log  // Ver todas las queries
});
```

### Errores Comunes y Soluciones

#### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### Error: "Database connection failed"
- Verificar credenciales en `.env`
- Verificar que PostgreSQL esté corriendo
- Verificar permisos de usuario

#### Error: "CSRF token invalid"
- Verificar que el token se esté enviando en formularios
- Verificar configuración de cookies/sesiones
- En desarrollo: Usar middleware simplificado

#### Error: "Stripe webhook verification failed"
- Verificar `STRIPE_WEBHOOK_SECRET` en `.env`
- Verificar que webhook endpoint sea accesible públicamente
- Usar Stripe CLI para testing local

## 📚 Recursos y Referencias

### Documentación Oficial
- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [Stripe API](https://stripe.com/docs/api)
- [EJS](https://ejs.co/)
- [Bootstrap 5](https://getbootstrap.com/)

### Herramientas Recomendadas
- **Postman**: Testing de APIs
- **pgAdmin**: Administración PostgreSQL
- **VS Code Extensions**: EJS, ESLint, Prettier
- **Stripe CLI**: Testing webhooks local

### Estándares de Código
- **ESLint**: Configuración en `.eslintrc`
- **Prettier**: Formato automático
- **Conventional Commits**: Mensajes de commit
- **JSDoc**: Documentación de funciones

---

**Nota**: Mantener este manual actualizado con cada cambio arquitectónico significativo. Para preguntas específicas, consultar la documentación oficial de cada tecnología.