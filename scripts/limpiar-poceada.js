// ═══════════════════════════════════════════════════════════════════
// LIMPIAR POCEADA - Elimina todos los resultados de Poceada
// ═══════════════════════════════════════════════════════════════════

import { initDB, closeDB } from './lib/database.js';
import { log } from './lib/utils.js';

const MODO_PRODUCCION = process.argv.includes('--force') || process.env.NODE_ENV === 'production';

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🗑️  LIMPIAR POCEADA');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    try {
        const sql = initDB();
        
        log('📊', 'Consultando base de datos...');
        const countAntes = await sql`SELECT COUNT(*) as count FROM poceada_resultados`;
        const totalAntes = parseInt(countAntes[0].count) || 0;
        
        if (totalAntes === 0) {
            log('ℹ️', 'La tabla de Poceada ya está vacía.');
            await closeDB();
            process.exit(0);
        }
        
        log('⚠️', `Se encontraron ${totalAntes} registros en poceada_resultados`);
        
        if (!MODO_PRODUCCION) {
            console.log('\n⚠️  ADVERTENCIA: Esta acción NO se puede deshacer!');
            console.log('   Para ejecutar sin confirmación, usa: node limpiar-poceada.js --force');
            process.exit(1);
        }
        
        log('🗑️', 'Eliminando registros...');
        await sql`DELETE FROM poceada_resultados`;
        
        const countDespues = await sql`SELECT COUNT(*) as count FROM poceada_resultados`;
        const totalDespues = parseInt(countDespues[0].count) || 0;
        
        console.log('\n═══════════════════════════════════════════════════════════════');
        log('✅', `Poceada limpiada exitosamente`);
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
