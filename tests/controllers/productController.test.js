const request = require('supertest');
const { sequelize } = require('../../models');
const app = require('../../server');

describe('Controlador de Productos', () => {
    beforeAll(async () => {
        // Sincronizar base de datos de prueba
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        // Cerrar conexión
        await sequelize.close();
    });

    describe('GET /products/api', () => {
        beforeEach(async () => {
            // Crear productos de prueba
            const { Product } = require('../../models');
            await Product.bulkCreate([
                {
                    name: 'Shot Energético',
                    description: 'Energía instantánea',
                    price: 12.99,
                    stock: 50,
                    category: 'energetico',
                    is_active: true
                },
                {
                    name: 'Shot Detox',
                    description: 'Desintoxicante natural',
                    price: 14.99,
                    stock: 30,
                    category: 'detox',
                    is_active: true
                },
                {
                    name: 'Shot Inactivo',
                    description: 'Producto inactivo',
                    price: 9.99,
                    stock: 10,
                    category: 'natural',
                    is_active: false
                }
            ]);
        });

        it('debe retornar lista de productos activos', async () => {
            const response = await request(app)
                .get('/products/api')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.products).toBeDefined();
            expect(Array.isArray(response.body.data.products)).toBe(true);
            
            // Solo productos activos
            const activeProducts = response.body.data.products.filter(p => p.is_active);
            expect(activeProducts.length).toBe(2);
        });

        it('debe soportar paginación', async () => {
            const response = await request(app)
                .get('/products/api?page=1&limit=1')
                .expect(200);

            expect(response.body.data.products.length).toBe(1);
            expect(response.body.data.pagination).toBeDefined();
            expect(response.body.data.pagination.currentPage).toBe(1);
        });

        it('debe filtrar por búsqueda', async () => {
            const response = await request(app)
                .get('/products/api?search=energético')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.products.length).toBe(1);
            expect(response.body.data.products[0].name).toContain('Energético');
        });

        it('debe filtrar por categoría', async () => {
            const response = await request(app)
                .get('/products/api?category=detox')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.products.length).toBe(1);
            expect(response.body.data.products[0].category).toBe('detox');
        });

        it('debe filtrar por rango de precio', async () => {
            const response = await request(app)
                .get('/products/api?minPrice=10&maxPrice=15')
                .expect(200);

            expect(response.body.success).toBe(true);
            response.body.data.products.forEach(product => {
                expect(parseFloat(product.price)).toBeGreaterThanOrEqual(10);
                expect(parseFloat(product.price)).toBeLessThanOrEqual(15);
            });
        });

        it('debe ordenar por precio ascendente', async () => {
            const response = await request(app)
                .get('/products/api?sort=price&order=ASC')
                .expect(200);

            expect(response.body.success).toBe(true);
            const prices = response.body.data.products.map(p => parseFloat(p.price));
            const sortedPrices = [...prices].sort((a, b) => a - b);
            expect(prices).toEqual(sortedPrices);
        });
    });

    describe('GET /products/:id', () => {
        let productId;

        beforeEach(async () => {
            const { Product } = require('../../models');
            const product = await Product.create({
                name: 'Shot de Prueba',
                description: 'Descripción de prueba',
                price: 19.99,
                stock: 25,
                category: 'test',
                is_active: true
            });
            productId = product.id;
        });

        it('debe retornar detalles del producto', async () => {
            const response = await request(app)
                .get(`/products/${productId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(productId);
            expect(response.body.data.name).toBe('Shot de Prueba');
            expect(response.body.data.price).toBe('19.99');
        });

        it('debe retornar 404 para producto no encontrado', async () => {
            const response = await request(app)
                .get('/products/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('no encontrado');
        });

        it('debe retornar 404 para producto inactivo', async () => {
            const { Product } = require('../../models');
            const inactiveProduct = await Product.create({
                name: 'Producto Inactivo',
                description: 'Inactivo',
                price: 9.99,
                stock: 5,
                category: 'test',
                is_active: false
            });

            const response = await request(app)
                .get(`/products/${inactiveProduct.id}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });
});