// ═══════════════════════════════════════════════════════════════════
// TEST DE CONEXIÓN A BASE DE DATOS
// ═══════════════════════════════════════════════════════════════════

import postgres from 'postgres';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔌 TEST DE CONEXIÓN A SUPABASE PostgreSQL');
console.log('═══════════════════════════════════════════════════════════════\n');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurado');
    console.log('\n📝 Para configurarlo:');
    console.log('   PowerShell: $env:DATABASE_URL="tu_connection_string"');
    console.log('   Bash: export DATABASE_URL="tu_connection_string"');
    process.exit(1);
}

console.log('✅ DATABASE_URL encontrado');
console.log('📍 Connection string:', DATABASE_URL.substring(0, 30) + '...\n');

// Parsear la URL para mostrar detalles
try {
    const url = new URL(DATABASE_URL);
    console.log('📊 Detalles de conexión:');
    console.log('   Host:', url.hostname);
    console.log('   Puerto:', url.port || '5432');
    console.log('   Usuario:', url.username);
    console.log('   Password:', url.password ? '***' + url.password.slice(-4) : 'No especificado');
    console.log('   Database:', url.pathname.replace('/', ''));
    console.log('');
} catch (err) {
    console.error('⚠️  No se pudo parsear la URL:', err.message);
}

console.log('🔄 Intentando conectar...\n');

const sql = postgres(DATABASE_URL, {
    max: 1,
    connect_timeout: 10,
    idle_timeout: 20,
    onnotice: () => {} // Silenciar notices
});

try {
    // Test 1: Conexión básica
    console.log('🧪 Test 1: Verificar conexión...');
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('   ✅ Conexión exitosa!');
    console.log('   🕐 Hora del servidor:', result[0].current_time);
    console.log('   📦 PostgreSQL:', result[0].pg_version.split(' ')[1]);
    console.log('');

    // Test 2: Verificar tabla
    console.log('🧪 Test 2: Verificar tabla quiniela_resultados...');
    const tables = await sql`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'quiniela_resultados'
        ) as table_exists
    `;
    
    if (tables[0].table_exists) {
        console.log('   ✅ Tabla quiniela_resultados existe');
        
        // Test 3: Contar registros
        console.log('');
        console.log('🧪 Test 3: Contar registros en la tabla...');
        const count = await sql`SELECT COUNT(*) as total FROM quiniela_resultados`;
        console.log('   ✅ Total de registros:', count[0].total);
        
        // Test 4: Obtener último registro
        if (parseInt(count[0].total) > 0) {
            console.log('');
            console.log('🧪 Test 4: Obtener último registro...');
            const last = await sql`
                SELECT jurisdiccion, turno, fecha, cabeza, created_at
                FROM quiniela_resultados
                ORDER BY created_at DESC
                LIMIT 1
            `;
            console.log('   ✅ Último registro:');
            console.log('      Jurisdicción:', last[0].jurisdiccion);
            console.log('      Turno:', last[0].turno);
            console.log('      Fecha:', last[0].fecha.toISOString().split('T')[0]);
            console.log('      Cabeza:', last[0].cabeza);
            console.log('      Creado:', last[0].created_at.toISOString());
        }
    } else {
        console.log('   ❌ Tabla quiniela_resultados NO existe');
        console.log('   💡 Necesitas crear la tabla primero');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ TODOS LOS TESTS PASARON - CONEXIÓN FUNCIONANDO');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    await sql.end();
    process.exit(0);
    
} catch (error) {
    console.error('\n❌ ERROR EN LA CONEXIÓN:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code || 'N/A');
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('💡 SOLUCIONES POSIBLES:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.log('❌ No se puede resolver el hostname');
        console.log('   → Verifica que el host sea correcto');
        console.log('   → Prueba con el Connection Pooler en lugar del Direct Connection');
    } else if (error.message.includes('password') || error.message.includes('authentication')) {
        console.log('❌ Error de autenticación');
        console.log('   → Verifica que el usuario y password sean correctos');
        console.log('   → Asegúrate de URL-encodear caracteres especiales');
    } else if (error.message.includes('Tenant or user not found')) {
        console.log('❌ Proyecto o usuario no encontrado');
        console.log('   → Verifica que el hostname del proyecto sea correcto');
        console.log('   → Verifica que el proyecto de Supabase esté activo');
        console.log('   → Intenta regenerar la password en Supabase Dashboard');
    } else if (error.message.includes('timeout')) {
        console.log('❌ Timeout de conexión');
        console.log('   → Verifica tu conexión a internet');
        console.log('   → Verifica que el firewall no esté bloqueando');
    } else {
        console.log('❌ Error desconocido');
        console.log('   → Contacta al soporte de Supabase si persiste');
    }
    
    console.log('\n📖 CÓMO OBTENER LAS CREDENCIALES CORRECTAS:');
    console.log('   1. Ve a https://supabase.com/dashboard');
    console.log('   2. Selecciona tu proyecto');
    console.log('   3. Ve a Settings → Database');
    console.log('   4. En "Connection string" selecciona "URI"');
    console.log('   5. Cambia el modo a "Session" o "Transaction"');
    console.log('   6. Copia la connection string completa');
    console.log('   7. Reemplaza [YOUR-PASSWORD] con tu password real');
    console.log('');
    
    await sql.end();
    process.exit(1);
}

