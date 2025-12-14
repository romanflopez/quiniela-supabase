// ═══════════════════════════════════════════════════════════════════
// LIMPIAR BASE DE DATOS - Elimina todos los resultados
// ═══════════════════════════════════════════════════════════════════
// ADVERTENCIA: Esto eliminará TODOS los datos de la tabla quiniela_resultados
// ═══════════════════════════════════════════════════════════════════

import { initDB, closeDB } from './lib/database.js';
import { log } from './lib/utils.js';

// Modo producción: sin confirmación
const MODO_PRODUCCION = process.argv.includes('--force') || process.env.NODE_ENV === 'production';

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🗑️  LIMPIAR BASE DE DATOS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    try {
        const sql = initDB();
        
        // 1. Ver cantidad actual de registros
        log('📊', 'Consultando base de datos...');
        const countAntes = await sql`SELECT COUNT(*) as count FROM quiniela_resultados`;
        const totalAntes = parseInt(countAntes[0].count) || 0;
        
        if (totalAntes === 0) {
            log('ℹ️', 'La base de datos ya está vacía.');
            await closeDB();
            process.exit(0);
        }
        
        log('⚠️', `Se encontraron ${totalAntes} registros en la base de datos`);
        
        // 2. Ver algunos ejemplos de datos
        const ejemplos = await sql`
            SELECT jurisdiccion, fecha, turno, cabeza 
            FROM quiniela_resultados 
            ORDER BY fecha DESC 
            LIMIT 5
        `;
        
        console.log('\n📋 Últimos 5 registros:');
        ejemplos.forEach(row => {
            console.log(`   ${row.fecha} | ${row.turno} | ${row.jurisdiccion} | Cabeza: ${row.cabeza}`);
        });
        
        // 3. Confirmar eliminación (solo si no es producción)
        if (!MODO_PRODUCCION) {
            console.log('\n⚠️  ADVERTENCIA: Esta acción NO se puede deshacer!');
            console.log('   Para ejecutar sin confirmación, usa: node limpiar-db.js --force');
            console.log('   O establece: NODE_ENV=production');
            process.exit(1);
        }
        
        // 4. Eliminar todos los registros
        log('🗑️', 'Eliminando registros...');
        await sql`DELETE FROM quiniela_resultados`;
        
        // También limpiar poceada_resultados
        await sql`DELETE FROM poceada_resultados`;
        
        // 5. Verificar que esté vacía
        const countDespues = await sql`SELECT COUNT(*) as count FROM quiniela_resultados`;
        const totalDespues = parseInt(countDespues[0].count) || 0;
        
        console.log('\n═══════════════════════════════════════════════════════════════');
        log('✅', `Base de datos limpiada exitosamente`);
        log('📊', `Registros antes: ${totalAntes}`);
        log('📊', `Registros después: ${totalDespues}`);
        console.log('═══════════════════════════════════════════════════════════════\n');
        
        await closeDB();
        process.exit(0);
        
    } catch (error) {
        log('❌', `Error: ${error.message}`);
        console.error(error);
        await closeDB();
        process.exit(1);
    }
}

main();

