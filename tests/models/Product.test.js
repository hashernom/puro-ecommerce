const { Product, sequelize } = require('../../models');

describe('Modelo Product', () => {
    beforeAll(async () => {
        // Sincronizar base de datos de prueba
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        // Cerrar conexión
        await sequelize.close();
    });

    describe('Creación de producto', () => {
        it('debe crear un producto válido', async () => {
            const productData = {
                name: 'Shot Energético Natural',
                description: 'Shot natural para energía instantánea',
                price: 12.99,
                stock: 50,
                category: 'energetico',
                is_active: true
            };

            const product = await Product.create(productData);

            expect(product.id).toBeDefined();
            expect(product.name).toBe(productData.name);
            expect(product.description).toBe(productData.description);
            expect(parseFloat(product.price)).toBe(productData.price);
            expect(product.stock).toBe(productData.stock);
            expect(product.category).toBe(productData.category);
            expect(product.is_active).toBe(true);
            expect(product.created_at).toBeDefined();
            expect(product.updated_at).toBeDefined();
        });

        it('debe fallar al crear producto sin nombre', async () => {
            const productData = {
                description: 'Producto sin nombre',
                price: 10.99,
                stock: 10
            };

            await expect(Product.create(productData)).rejects.toThrow();
        });

        it('debe fallar al crear producto con precio negativo', async () => {
            const productData = {
                name: 'Producto con precio negativo',
                description: 'Descripción',
                price: -5.99,
                stock: 10
            };

            await expect(Product.create(productData)).rejects.toThrow();
        });

        it('debe fallar al crear producto con stock negativo', async () => {
            const productData = {
                name: 'Producto con stock negativo',
                description: 'Descripción',
                price: 15.99,
                stock: -5
            };

            await expect(Product.create(productData)).rejects.toThrow();
        });
    });

    describe('Métodos de instancia', () => {
        let product;

        beforeEach(async () => {
            product = await Product.create({
                name: 'Shot Test',
                description: 'Producto de prueba',
                price: 9.99,
                stock: 20,
                category: 'test'
            });
        });

        it('debe verificar disponibilidad correctamente', () => {
            expect(product.isAvailable(5)).toBe(true);
            expect(product.isAvailable(20)).toBe(true);
            expect(product.isAvailable(21)).toBe(false);
            expect(product.isAvailable(0)).toBe(true);
        });

        it('debe verificar disponibilidad cuando está inactivo', async () => {
            await product.update({ is_active: false });
            expect(product.isAvailable(1)).toBe(false);
        });

        it('debe reducir stock correctamente', async () => {
            const initialStock = product.stock;
            const quantity = 5;

            await product.decrementStock(quantity);

            await product.reload();
            expect(product.stock).toBe(initialStock - quantity);
        });

        it('debe incrementar stock correctamente', async () => {
            const initialStock = product.stock;
            const quantity = 3;

            await product.incrementStock(quantity);

            await product.reload();
            expect(product.stock).toBe(initialStock + quantity);
        });
    });

    describe('Consultas y scopes', () => {
        beforeAll(async () => {
            // Crear productos de prueba
            await Product.bulkCreate([
                {
                    name: 'Producto Activo 1',
                    description: 'Descripción 1',
                    price: 10.99,
                    stock: 15,
                    category: 'natural',
                    is_active: true
                },
                {
                    name: 'Producto Activo 2',
                    description: 'Descripción 2',
                    price: 15.99,
                    stock: 0,
                    category: 'energetico',
                    is_active: true
                },
                {
                    name: 'Producto Inactivo',
                    description: 'Descripción 3',
                    price: 20.99,
                    stock: 5,
                    category: 'detox',
                    is_active: false
                }
            ]);
        });

        it('debe encontrar productos activos', async () => {
            const activeProducts = await Product.findAll({
                where: { is_active: true }
            });

            expect(activeProducts.length).toBe(2);
            activeProducts.forEach(product => {
                expect(product.is_active).toBe(true);
            });
        });

        it('debe encontrar productos en stock', async () => {
            const inStockProducts = await Product.findAll({
                where: { 
                    is_active: true,
                    stock: { [sequelize.Op.gt]: 0 }
                }
            });

            expect(inStockProducts.length).toBe(1);
            expect(inStockProducts[0].stock).toBeGreaterThan(0);
        });

        it('debe buscar productos por categoría', async () => {
            const naturalProducts = await Product.findAll({
                where: { category: 'natural' }
            });

            expect(naturalProducts.length).toBe(1);
            expect(naturalProducts[0].category).toBe('natural');
        });
    });
});