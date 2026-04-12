const { sequelize } = require('./models');

async function checkColumns() {
    try {
        const [results] = await sequelize.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position"
        );
        
        console.log('Columnas de la tabla products:');
        results.forEach(col => {
            console.log(`  ${col.column_name} (${col.data_type})`);
        });
        
        // Verificar si existe la columna category
        const hasCategory = results.some(col => col.column_name === 'category');
        console.log(`\n¿Tiene columna 'category'? ${hasCategory ? 'Sí' : 'No'}`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkColumns();