// Test de conexión a la nueva base de datos
import pg from 'postgres';

const PASSWORD = '1w85GJkMCa36mYUZ';
const PROJECT_REF = 'pvbxvghzemtymbynkiqa';

const connectionStrings = [
    // Pooler - Transaction mode (recomendado)
    `postgresql://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    
    // Pooler - Session mode
    `postgresql://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    
    // Direct connection
    `postgresql://postgres:${PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
    
    // Sin el prefijo postgres.
    `postgresql://${PROJECT_REF}:${PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
];

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 PROBANDO CONEXIONES A NUEVA BASE DE DATOS');
console.log('═══════════════════════════════════════════════════════════════\n');

async function testConnection(url, name) {
    try {
        console.log(`⏳ Probando: ${name}`);
        console.log(`   URL: ${url.replace(PASSWORD, '***')}`);
        
        const sql = pg(url, {
            max: 1,
            idle_timeout: 5,
            connect_timeout: 10
        });
        
        const result = await sql`SELECT NOW() as now, version() as version`;
        
        console.log(`   ✅ CONEXIÓN EXITOSA!`);
        console.log(`   Hora del servidor: ${result[0].now}`);
        
        // Verificar tabla
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'quiniela_resultados'
        `;
        
        if (tables.length > 0) {
            console.log(`   ✅ Tabla quiniela_resultados existe`);
            
            const count = await sql`SELECT COUNT(*) as count FROM quiniela_resultados`;
            console.log(`   Registros: ${count[0].count}`);
        } else {
            console.log(`   ⚠️  Tabla quiniela_resultados NO existe (necesitás crearla)`);
        }
        
        await sql.end();
        
        console.log(`\n🎉 CONNECTION STRING CORRECTO:`);
        console.log(`   ${url}\n`);
        
        return url;
        
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        return null;
    }
}

(async () => {
    for (let i = 0; i < connectionStrings.length; i++) {
        const url = await testConnection(connectionStrings[i], `Opción ${i + 1}`);
        if (url) {
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('✅ USÁ ESTE CONNECTION STRING:');
            console.log('═══════════════════════════════════════════════════════════════');
            console.log(url);
            console.log('═══════════════════════════════════════════════════════════════\n');
            process.exit(0);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('❌ NINGUNA CONEXIÓN FUNCIONÓ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n💡 Posibles causas:');
    console.log('   1. El proyecto todavía está inicializándose (esperá 5 min)');
    console.log('   2. El password es incorrecto');
    console.log('   3. El proyecto está en otra región');
    console.log('\n📖 Obtén el connection string correcto desde:');
    console.log('   https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/settings/database\n');
    
    process.exit(1);
})();

