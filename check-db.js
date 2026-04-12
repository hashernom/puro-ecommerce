const { Client } = require('pg');
const c = new Client({
    host: 'localhost', port: 5432,
    user: 'postgres', password: 'TeLzhH1713',
    database: 'puro_db'
});
c.connect()
    .then(() => c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
    .then(r => {
        if (r.rows.length === 0) {
            console.log('⚠️  La base de datos existe pero NO tiene tablas aún.');
        } else {
            console.log('✅ BASE DE DATOS OK - Tablas encontradas:');
            r.rows.forEach(row => console.log('   📋 ' + row.table_name));
        }
        return c.query('SELECT COUNT(*) FROM users');
    })
    .then(r => console.log('👤 Usuarios registrados: ' + r.rows[0].count))
    .then(() => c.query('SELECT COUNT(*) FROM products'))
    .then(r => console.log('📦 Productos en BD: ' + r.rows[0].count))
    .then(() => c.end())
    .catch(e => {
        console.error('❌ Error:', e.message);
        c.end();
    });
