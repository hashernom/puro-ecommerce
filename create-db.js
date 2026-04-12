const { Client } = require('pg');

async function createDB() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'TeLzhH1713',
        database: 'postgres'
    });

    try {
        await client.connect();
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname='puro_db'");
        if (res.rowCount === 0) {
            await client.query('CREATE DATABASE puro_db');
            console.log('✅ Base de datos puro_db creada exitosamente.');
        } else {
            console.log('✅ La base de datos puro_db ya existe.');
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

createDB();
