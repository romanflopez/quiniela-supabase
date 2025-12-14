// Test completo de estado de Supabase
import pg from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.log('❌ DATABASE_URL no configurado');
    process.exit(1);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 TEST DE ESTADO DE SUPABASE');
console.log('═══════════════════════════════════════════════════════════════\n');

async function testConnection() {
    try {
        // Conectar con timeout corto
        const sql = pg(DATABASE_URL, {
            max: 1,
            idle_timeout: 5,
            connect_timeout: 10
        });
        
        console.log('⏳ Intentando conectar...');
        
        // Test 1: Conectividad básica
        const result = await sql`SELECT NOW() as now, version() as version`;
        console.log('✅ CONEXIÓN EXITOSA');
        console.log(`   Hora del servidor: ${result[0].now}`);
        console.log(`   PostgreSQL: ${result[0].version.split(' ')[1]}`);
        
        // Test 2: Verificar tabla
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'quiniela_resultados'
        `;
        
        if (tables.length > 0) {
            console.log('✅ Tabla quiniela_resultados existe');
            
            // Test 3: Contar registros
            const count = await sql`SELECT COUNT(*) as count FROM quiniela_resultados`;
            console.log(`   Registros actuales: ${count[0].count}`);
            
            // Test 4: Último registro
            const last = await sql`
                SELECT jurisdiccion, fecha, turno, cabeza 
                FROM quiniela_resultados 
                ORDER BY fecha DESC, sorteo_id DESC 
                LIMIT 1
            `;
            
            if (last.length > 0) {
                console.log(`   Último registro: ${last[0].fecha} | ${last[0].turno} | ${last[0].jurisdiccion} | Cabeza: ${last[0].cabeza}`);
            } else {
                console.log('   ⚠️  No hay registros en la tabla');
            }
        } else {
            console.log('⚠️  Tabla quiniela_resultados NO existe');
        }
        
        await sql.end();
        
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('🎉 SUPABASE ESTÁ ACTIVO Y FUNCIONAL');
        console.log('═══════════════════════════════════════════════════════════════');
        
        return true;
        
    } catch (error) {
        console.log('\n❌ ERROR DE CONEXIÓN:');
        console.log(`   Mensaje: ${error.message}`);
        console.log(`   Código: ${error.code || 'N/A'}`);
        
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('⚠️  DIAGNÓSTICO:');
        console.log('═══════════════════════════════════════════════════════════════');
        
        if (error.message.includes('Tenant or user not found')) {
            console.log('📌 PROYECTO PAUSADO');
            console.log('   → Ve a: https://supabase.com/dashboard');
            console.log('   → Busca tu proyecto: vvtujkedjalepkhbycpv');
            console.log('   → Haz clic en "Resume" si está pausado');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('📌 NO SE PUEDE RESOLVER EL HOST');
            console.log('   → Verifica tu conexión a internet');
            console.log('   → Verifica el hostname en DATABASE_URL');
        } else if (error.message.includes('password')) {
            console.log('📌 ERROR DE AUTENTICACIÓN');
            console.log('   → Verifica el password en DATABASE_URL');
            console.log('   → Regenera el password en Supabase Dashboard');
        } else {
            console.log('📌 ERROR DESCONOCIDO');
            console.log('   → Revisa DATABASE_URL completo');
            console.log('   → Contacta soporte de Supabase');
        }
        
        return false;
    }
}

testConnection()
    .then(success => process.exit(success ? 0 : 1))
    .catch(err => {
        console.error('Error fatal:', err);
        process.exit(1);
    });

