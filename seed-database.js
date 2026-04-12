#!/usr/bin/env node
/**
 * Script de seeding para PURO E-commerce
 * Crea datos iniciales: usuario admin, productos demo, categorías.
 */

const { sequelize } = require('./config/database');
const { User, Product, Order, OrderDetail } = require('./models');

async function seed() {
    console.log('🌱 Iniciando seeding de base de datos...');

    try {
        // Sincronizar modelos (crear tablas si no existen)
        await sequelize.sync({ force: false });
        console.log('✅ Tablas sincronizadas.');

        // Verificar si ya existen datos
        const userCount = await User.count();
        const productCount = await Product.count();

        if (userCount > 0 || productCount > 0) {
            console.log('⚠️  Ya existen datos en la base de datos.');
            const confirm = process.argv.includes('--force');
            if (!confirm) {
                console.log('   Usa --force para sobrescribir datos existentes.');
                process.exit(0);
            }
            console.log('   Forzando recreación de datos...');
            await sequelize.sync({ force: true });
        }

        // ── Crear usuarios ──────────────────────────────────────────────────
        console.log('👤 Creando usuarios...');
        const adminUser = await User.create({
            email: 'admin@puro.com',
            password: 'Admin123', // Se hashea automáticamente por hook
            first_name: 'Admin',
            last_name: 'PURO',
            role: 'admin'
        });

        const demoUser = await User.create({
            email: 'cliente@ejemplo.com',
            password: 'Cliente123',
            first_name: 'Juan',
            last_name: 'Pérez',
            role: 'client'
        });

        console.log(`✅ Usuarios creados: ${adminUser.email}, ${demoUser.email}`);

        // ── Crear productos ─────────────────────────────────────────────────
        console.log('📦 Creando productos...');
        const products = [
            {
                name: 'Shot Energético Verde',
                description: 'Mezcla de espirulina, chlorella y jengibre para energía natural y desintoxicación.',
                price: 12.99,
                stock: 50,
                image_url: '/images/products/green-shot.jpg',
                is_active: true
            },
            {
                name: 'Shot Inmunológico',
                description: 'Combinación de equinácea, propóleo y vitamina C para fortalecer el sistema inmune.',
                price: 14.50,
                stock: 35,
                image_url: '/images/products/immunity-shot.jpg',
                is_active: true
            },
            {
                name: 'Shot Digestivo',
                description: 'Enzimas digestivas, jengibre y menta para aliviar malestar estomacal y mejorar digestión.',
                price: 10.99,
                stock: 40,
                image_url: '/images/products/digestive-shot.jpg',
                is_active: true
            },
            {
                name: 'Shot Anti‑Estrés',
                description: 'Ashwagandha, rhodiola y L‑teanina para reducir el estrés y mejorar el enfoque mental.',
                price: 16.75,
                stock: 25,
                image_url: '/images/products/anti-stress-shot.jpg',
                is_active: true
            },
            {
                name: 'Shot Detox',
                description: 'Diente de león, cardo mariano y cúrcuma para limpieza hepática y detoxificación.',
                price: 13.25,
                stock: 30,
                image_url: '/images/products/detox-shot.jpg',
                is_active: true
            },
            {
                name: 'Shot Energía Nocturna',
                description: 'Melatonina, magnesio y pasiflora para mejorar la calidad del sueño y descanso profundo.',
                price: 15.99,
                stock: 20,
                image_url: '/images/products/sleep-shot.jpg',
                is_active: true
            },
            {
                name: 'Shot Deportivo',
                description: 'BCAAs, electrolitos y betabel para recuperación muscular y rendimiento atlético.',
                price: 18.50,
                stock: 15,
                image_url: '/images/products/sports-shot.jpg',
                is_active: true
            },
            {
                name: 'Shot Belleza',
                description: 'Colágeno, ácido hialurónico y vitamina E para piel, cabello y uñas saludables.',
                price: 19.99,
                stock: 18,
                image_url: '/images/products/beauty-shot.jpg',
                is_active: true
            }
        ];

        const createdProducts = await Product.bulkCreate(products);
        console.log(`✅ ${createdProducts.length} productos creados.`);

        // ── Crear pedidos de ejemplo ────────────────────────────────────────
        console.log('📝 Creando pedidos de ejemplo...');
        const order1 = await Order.create({
            user_id: demoUser.id,
            total_amount: 38.48,
            status: 'delivered',
            shipping_address: 'Calle Falsa 123, Bogotá, Colombia',
            notes: 'Entregar en recepción'
        });

        await OrderDetail.bulkCreate([
            { order_id: order1.id, product_id: createdProducts[0].id, quantity: 2, unit_price: 12.99 },
            { order_id: order1.id, product_id: createdProducts[2].id, quantity: 1, unit_price: 10.99 }
        ]);

        const order2 = await Order.create({
            user_id: demoUser.id,
            total_amount: 33.25,
            status: 'processing',
            shipping_address: 'Avenida Siempre Viva 456, Medellín',
            notes: 'Sin gluten'
        });

        await OrderDetail.bulkCreate([
            { order_id: order2.id, product_id: createdProducts[1].id, quantity: 1, unit_price: 14.50 },
            { order_id: order2.id, product_id: createdProducts[3].id, quantity: 1, unit_price: 16.75 }
        ]);

        console.log(`✅ 2 pedidos de ejemplo creados.`);

        // ── Resumen ─────────────────────────────────────────────────────────
        console.log('\n🎉 Seeding completado exitosamente!');
        console.log('========================================');
        console.log(`👥 Usuarios: ${await User.count()}`);
        console.log(`📦 Productos: ${await Product.count()}`);
        console.log(`📝 Pedidos: ${await Order.count()}`);
        console.log(`📋 Detalles de pedidos: ${await OrderDetail.count()}`);
        console.log('\n🔑 Credenciales de acceso:');
        console.log('   Admin:    email=admin@puro.com, password=Admin123');
        console.log('   Cliente:  email=cliente@ejemplo.com, password=Cliente123');
        console.log('\n🚀 Ejecuta `npm run dev` para iniciar el servidor.');

    } catch (error) {
        console.error('❌ Error durante el seeding:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    seed();
}

module.exports = seed;