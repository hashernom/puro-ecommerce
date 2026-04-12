# 📤 Instrucciones para Subir a GitHub

El código del e-commerce PURO Premium Natural Shots está listo para ser subido a GitHub. Sigue estos pasos:

## Paso 1: Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Click en **"New repository"** (botón verde)
3. Configurar repositorio:
   - **Repository name**: `puro-ecommerce` (o el nombre que prefieras)
   - **Description**: `E-commerce completo para PURO Premium Natural Shots - Node.js/Express/PostgreSQL`
   - **Visibility**: Public (o Private según prefieras)
   - **NO marcar**: "Initialize with README" (ya tenemos README)
   - **NO marcar**: "Add .gitignore" (ya tenemos .gitignore)
4. Click en **"Create repository"**

## Paso 2: Configurar Remote y Subir Código

Ejecuta los siguientes comandos en la terminal (en la carpeta `d:/puro`):

```bash
# 1. Agregar remote (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/puro-ecommerce.git

# 2. Renombrar branch principal a 'main' (si no está ya)
git branch -M main

# 3. Subir código a GitHub
git push -u origin main
```

## Paso 3: Verificar en GitHub

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/puro-ecommerce`
2. Verifica que todos los archivos estén presentes
3. Revisa el README.md que se mostrará automáticamente

## Estructura del Repositorio Subido

```
📁 puro-ecommerce/
├── 📁 config/          # Configuraciones (database, email, stripe, upload)
├── 📁 controllers/     # Controladores MVC
├── 📁 middleware/      # Middlewares (auth, csrf, validation)
├── 📁 models/         # Modelos Sequelize
├── 📁 public/         # Archivos estáticos (CSS, JS, imágenes)
├── 📁 routes/         # Rutas de la aplicación
├── 📁 tests/          # Pruebas unitarias
├── 📁 views/          # Vistas EJS
├── 📄 .env.example    # Variables de entorno de ejemplo
├── 📄 .gitignore      # Archivos ignorados por git
├── 📄 API_DOCUMENTATION.md # Documentación completa de API
├── 📄 MANUAL_ADMIN.md # Manual para administradores
├── 📄 MANUAL_CLIENTE.md # Manual para clientes
├── 📄 MANUAL_DESARROLLADOR.md # Manual para desarrolladores
├── 📄 README.md       # Documentación principal del proyecto
├── 📄 package.json    # Dependencias y scripts
├── 📄 server.js       # Punto de entrada de la aplicación
└── 📄 ...             # Otros archivos y scripts
```

## Características Destacadas del Proyecto

✅ **E-commerce completo y funcional**  
✅ **Panel de administración avanzado**  
✅ **Sistema de pagos con Stripe**  
✅ **Carrito persistente en base de datos**  
✅ **Recuperación de contraseña por email**  
✅ **Carga de imágenes (local/Cloudinary)**  
✅ **Filtros avanzados en catálogo**  
✅ **Protección CSRF**  
✅ **Pruebas unitarias con Jest**  
✅ **Documentación completa**  
✅ **Diseño responsive con Bootstrap 5**  
✅ **Arquitectura MVC bien estructurada**

## URLs Importantes (Desarrollo Local)

- **Aplicación**: http://localhost:3000
- **Panel Admin**: http://localhost:3000/admin
- **API Docs**: http://localhost:3000/api-docs (si se implementa)

## Credenciales de Prueba

**Administrador:**
- Email: `admin@puro.com`
- Contraseña: `Admin123`

**Usuario Demo:**
- Email: `demo@puro.com`
- Contraseña: `Demo123`

## Pasos Adicionales (Opcionales)

### 1. Configurar GitHub Actions para CI/CD
Crea un archivo `.github/workflows/node.js.yml` para:
- Ejecutar pruebas automáticamente
- Verificar calidad de código
- Desplegar automáticamente

### 2. Configurar GitHub Pages para Documentación
Puedes publicar la documentación en GitHub Pages:
1. Ve a Settings → Pages
2. Selecciona branch `main` y carpeta `/docs` (o root)
3. La documentación estará disponible en: `https://TU_USUARIO.github.io/puro-ecommerce`

### 3. Agregar Badges al README
Agrega badges para:
- Estado de build
- Cobertura de tests
- Versión de Node.js
- Licencia

### 4. Configurar Issues y Projects
- Usa Issues para seguimiento de bugs y features
- Configura Projects para gestión de tareas
- Establece templates para Issues y Pull Requests

## Soporte y Mantenimiento

Para cualquier problema con la subida a GitHub o configuración:

1. **Verificar credenciales de Git**:
   ```bash
   git config --global user.name
   git config --global user.email
   ```

2. **Si hay error de autenticación**:
   - Usa SSH en lugar de HTTPS
   - O genera un Personal Access Token en GitHub

3. **Si el push falla por tamaño**:
   - Verifica que no haya archivos grandes en el historial
   - Usa `git lfs` si hay imágenes grandes

## ¡Listo! 🎉

Tu e-commerce PURO Premium Natural Shots está ahora en GitHub y listo para:
- Compartir con el equipo
- Implementar CI/CD
- Desplegar a producción
- Continuar desarrollo colaborativo

**Nota**: Recuerda nunca subir el archivo `.env` con credenciales reales. El archivo `.env.example` contiene las variables sin valores sensibles.