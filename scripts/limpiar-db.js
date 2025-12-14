// ═══════════════════════════════════════════════════════════════════
// LIMPIAR BASE DE DATOS - Elimina todos los resultados
// ═══════════════════════════════════════════════════════════════════
// ADVERTENCIA: Esto eliminará TODOS los datos de la tabla quiniela_resultados
// ═══════════════════════════════════════════════════════════════════

import { conectarDB, closeDB } from './lib/database.js';
import { log } from './lib/utils.js';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function pregunta(texto) {
    return new Promise(resolve => rl.question(texto, resolve));
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🗑️  LIMPIAR BASE DE DATOS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    try {
        // Conectar a la base de datos
        const client = await conectarDB();
        
        // 1. Ver cantidad actual de registros
        log('📊', 'Consultando base de datos...');
        const countAntes = await client.query('SELECT COUNT(*) as count FROM quiniela_resultados');
        const totalAntes = parseInt(countAntes.rows[0].count);
        
        if (totalAntes === 0) {
            log('ℹ️', 'La base de datos ya está vacía.');
            rl.close();
            await closeDB();
            process.exit(0);
        }
        
        log('⚠️', `Se encontraron ${totalAntes} registros en la base de datos`);
        
        // 2. Ver algunos ejemplos de datos
        const ejemplos = await client.query(`
            SELECT jurisdiccion, fecha, turno, cabeza 
            FROM quiniela_resultados 
            ORDER BY fecha DESC 
            LIMIT 5
        `);
        
        console.log('\n📋 Últimos 5 registros:');
        ejemplos.rows.forEach(row => {
            console.log(`   ${row.fecha} | ${row.turno} | ${row.jurisdiccion} | Cabeza: ${row.cabeza}`);
        });
        
        // 3. Confirmar eliminación
        console.log('\n⚠️  ADVERTENCIA: Esta acción NO se puede deshacer!');
        const respuesta = await pregunta('\n¿Estás seguro de eliminar TODOS los registros? (escribe "SI" para confirmar): ');
        
        if (respuesta.trim().toUpperCase() !== 'SI') {
            log('ℹ️', 'Operación cancelada por el usuario');
            rl.close();
            await closeDB();
            process.exit(0);
        }
        
        // 4. Eliminar todos los registros
        log('🗑️', 'Eliminando registros...');
        await client.query('DELETE FROM quiniela_resultados');
        
        // 5. Verificar que esté vacía
        const countDespues = await client.query('SELECT COUNT(*) as count FROM quiniela_resultados');
        const totalDespues = parseInt(countDespues.rows[0].count);
        
        console.log('\n═══════════════════════════════════════════════════════════════');
        log('✅', `Base de datos limpiada exitosamente`);
        log('📊', `Registros antes: ${totalAntes}`);
        log('📊', `Registros después: ${totalDespues}`);
        console.log('═══════════════════════════════════════════════════════════════\n');
        
        rl.close();
        await closeDB();
        process.exit(0);
        
    } catch (error) {
        log('❌', `Error: ${error.message}`);
        console.error(error);
        rl.close();
        await closeDB();
        process.exit(1);
    }
}

main();

