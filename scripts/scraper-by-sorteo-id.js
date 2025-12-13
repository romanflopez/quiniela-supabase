// ═══════════════════════════════════════════════════════════════════
// SCRAPER BY SORTEO ID - Scrapea un sorteo específico (todas jurisdicciones)
// ═══════════════════════════════════════════════════════════════════
// Uso: node scripts/scraper-by-sorteo-id.js [SORTEO_ID] [FECHA]
// Ejemplo: node scripts/scraper-by-sorteo-id.js 51774 2025-12-12
// ═══════════════════════════════════════════════════════════════════

import { scrapearTodasJurisdicciones } from './lib/scraper-core.js';
import { guardarResultados, closeDB } from './lib/database.js';
import { getTodayDateArg, getTurnoFromId, log } from './lib/utils.js';

const SORTEO_ID = process.argv[2];
const FECHA = process.argv[3] || getTodayDateArg();

if (!SORTEO_ID) {
    console.error('❌ Uso: node scripts/scraper-by-sorteo-id.js [SORTEO_ID] [FECHA_OPCIONAL]');
    console.error('Ejemplo: node scripts/scraper-by-sorteo-id.js 51774 2025-12-12');
    process.exit(1);
}

async function main() {
    const startTime = Date.now();
    
    log('🎯', `═══════════════════════════════════════════════════════`);
    log('🎯', `SCRAPER BY ID - Sorteo: ${SORTEO_ID}`);
    log('🎯', `Fecha: ${FECHA} | Turno: ${getTurnoFromId(SORTEO_ID)}`);
    log('🎯', `═══════════════════════════════════════════════════════`);
    
    try {
        // Scrapear todas las jurisdicciones para este sorteo
        const resultados = await scrapearTodasJurisdicciones(SORTEO_ID, FECHA, 3000);
        
        const totalTime = Math.round((Date.now() - startTime) / 1000);
        
        if (resultados.length === 0) {
            log('⚠️', 'No se encontraron datos para este sorteo');
            process.exit(1);
        }
        
        // Guardar en DB
        const stats = await guardarResultados(resultados);
        
        log('🎉', `═══════════════════════════════════════════════════════`);
        log('🎉', `COMPLETADO en ${totalTime}s`);
        log('🎉', `Resultados: ${resultados.length}/4 jurisdicciones`);
        log('🎉', `Guardados: ${stats.guardados} | Errores: ${stats.errores}`);
        log('🎉', `═══════════════════════════════════════════════════════`);
        
        // Retornar JSON para consumo de la app
        console.log('\n📄 JSON OUTPUT:');
        console.log(JSON.stringify({
            success: true,
            sorteo_id: SORTEO_ID,
            fecha: FECHA,
            turno: getTurnoFromId(SORTEO_ID),
            resultados: resultados.map(r => ({
                jurisdiccion: r.jurisdiccion,
                cabeza: r.cabeza,
                numeros: r.numeros,
                letras: r.letras
            })),
            total: resultados.length,
            tiempo_segundos: totalTime
        }, null, 2));
        
        process.exit(0);
        
    } catch (error) {
        log('❌', `Error fatal: ${error.message}`);
        console.error(error);
        process.exit(1);
        
    } finally {
        await closeDB();
    }
}

main();


