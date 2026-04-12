const { sequelize } = require('./models');

async function addCategoryColumn() {
    try {
        console.log('Agregando columna category a tabla products...');
        
        // Verificar si la columna ya existe
        const [checkResults] = await sequelize.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category'"
        );
        
        if (checkResults.length > 0) {
            console.log('✅ La columna category ya existe');
            return;
        }
        
        // Agregar columna category
        await sequelize.query(
            "ALTER TABLE products ADD COLUMN category VARCHAR(100) DEFAULT 'natural'"
        );
        
        console.log('✅ Columna category agregada exitosamente');
        
        // Actualizar algunos productos con categorías
        await sequelize.query(`
            UPDATE products SET category = 
            CASE 
                WHEN name LIKE '%Energético%' THEN 'energetico'
                WHEN name LIKE '%Inmunológico%' THEN 'inmunologico'
                WHEN name LIKE '%Digestivo%' THEN 'digestivo'
                WHEN name LIKE '%Estrés%' THEN 'relajante'
                WHEN name LIKE '%Detox%' THEN 'detox'
                WHEN name LIKE '%Nocturna%' THEN 'sueño'
                WHEN name LIKE '%Deportivo%' THEN 'deportivo'
                WHEN name LIKE '%Belleza%' THEN 'belleza'
                ELSE 'natural'
            END
        `);
        
        console.log('✅ Categorías asignadas a productos existentes');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

addCategoryColumn();