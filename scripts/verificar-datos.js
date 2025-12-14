// ═══════════════════════════════════════════════════════════════════
// VERIFICAR DATOS - Verificar datos en la base de datos
// ═══════════════════════════════════════════════════════════════════

import { initDB, closeDB } from './lib/database.js';
import { log } from './lib/utils.js';

async function main() {
    const sql = initDB();
    
    try {
        console.log('\n📊 VERIFICANDO DATOS EN BASE DE DATOS\n');
        
        // Count de resultados
        const countQuiniela = await sql`SELECT COUNT(*) as total FROM quiniela_resultados`;
        const countPoceada = await sql`SELECT COUNT(*) as total FROM poceada_resultados`;
        
        console.log(`✅ Quiniela resultados: ${countQuiniela[0].total}`);
        console.log(`✅ Poceada resultados: ${countPoceada[0].total}`);
        
        // Últimos resultados de Quiniela
        const ultimosQuiniela = await sql`
            SELECT jurisdiccion, turno, fecha, cabeza, sorteo_id 
            FROM quiniela_resultados 
            ORDER BY created_at DESC 
            LIMIT 10
        `;
        
        console.log('\n📋 Últimos 10 resultados de Quiniela:');
        ultimosQuiniela.forEach((r, i) => {
            const fechaStr = r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : r.fecha;
            console.log(`  ${i + 1}. ${r.jurisdiccion} - ${r.turno} - ${fechaStr} - Sorteo: ${r.sorteo_id} - Cabeza: ${r.cabeza}`);
        });
        
        // Últimos resultados de Poceada
        const ultimosPoceada = await sql`
            SELECT turno, fecha, cabeza, sorteo_id 
            FROM poceada_resultados 
            ORDER BY created_at DESC 
            LIMIT 5
        `;
        
        if (ultimosPoceada.length > 0) {
            console.log('\n📋 Últimos 5 resultados de Poceada:');
            ultimosPoceada.forEach((r, i) => {
                const fechaStr = r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : r.fecha;
                console.log(`  ${i + 1}. ${r.turno} - ${fechaStr} - Sorteo: ${r.sorteo_id} - Cabeza: ${r.cabeza}`);
            });
        }
        
        // Verificar integridad de datos
        console.log('\n🔍 VERIFICANDO INTEGRIDAD DE DATOS:\n');
        
        // Verificar que todos tienen 20 números (usar array_length para text[])
        const sinNumeros = await sql`
            SELECT COUNT(*) as total 
            FROM quiniela_resultados 
            WHERE array_length(numeros, 1) != 20
        `;
        console.log(`  Números incorrectos (deben ser 20): ${sinNumeros[0].total}`);
        
        // Verificar fechas válidas
        const fechasInvalidas = await sql`
            SELECT COUNT(*) as total 
            FROM quiniela_resultados 
            WHERE fecha IS NULL OR fecha < '2020-01-01'
        `;
        console.log(`  Fechas inválidas: ${fechasInvalidas[0].total}`);
        
        // Verificar que no hay duplicados
        const duplicados = await sql`
            SELECT jurisdiccion, sorteo_id, COUNT(*) as count
            FROM quiniela_resultados
            GROUP BY jurisdiccion, sorteo_id
            HAVING COUNT(*) > 1
            LIMIT 5
        `;
        console.log(`  Duplicados encontrados: ${duplicados.length}`);
        if (duplicados.length > 0) {
            duplicados.forEach(d => {
                console.log(`    ⚠️ ${d.jurisdiccion} - Sorteo ${d.sorteo_id}: ${d.count} registros`);
            });
        }
        
        // Estadísticas por jurisdicción
        console.log('\n📈 ESTADÍSTICAS POR JURISDICCIÓN:\n');
        const stats = await sql`
            SELECT 
                jurisdiccion,
                COUNT(*) as total,
                COUNT(DISTINCT turno) as turnos,
                MIN(fecha) as primera_fecha,
                MAX(fecha) as ultima_fecha
            FROM quiniela_resultados
            GROUP BY jurisdiccion
            ORDER BY total DESC
        `;
        stats.forEach(s => {
            const primera = s.primera_fecha instanceof Date ? s.primera_fecha.toISOString().split('T')[0] : s.primera_fecha;
            const ultima = s.ultima_fecha instanceof Date ? s.ultima_fecha.toISOString().split('T')[0] : s.ultima_fecha;
            console.log(`  ${s.jurisdiccion}: ${s.total} resultados, ${s.turnos} turnos, desde ${primera} hasta ${ultima}`);
        });
        
        console.log('\n✅ Verificación completada\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await closeDB();
    }
}

main();

