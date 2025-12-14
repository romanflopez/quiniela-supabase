// ═══════════════════════════════════════════════════════════════════
// SCRAPER BY TURNO - Scrapea un turno específico de HOY con retry
// ═══════════════════════════════════════════════════════════════════
// Uso: node scripts/scraper-by-turno.js [TURNO]
// Ejemplo: node scripts/scraper-by-turno.js nocturna
// ═══════════════════════════════════════════════════════════════════

import { obtenerSorteoIdDeHoy } from './lib/lotba-api.js';
import { scrapearConRetry } from './lib/scraper-core.js';
import { guardarResultados, closeDB } from './lib/database.js';
import { getTodayDateArg, log } from './lib/utils.js';

const TURNO = process.argv[2];

if (!TURNO) {
    console.error('❌ Uso: node scripts/scraper-by-turno.js [TURNO]');
    console.error('Turnos válidos: la-previa, primera, matutina, vespertina, nocturna');
    process.exit(1);
}

async function main() {
    const startTime = Date.now();
    
    log('🎰', `═══════════════════════════════════════════════════════`);
    log('🎰', `SCRAPER QUINIELA - Turno: ${TURNO.toUpperCase()}`);
    log('🎰', `═══════════════════════════════════════════════════════`);
    
    try {
        // 1. Obtener ID de sorteo de hoy para este turno
        log('📋', 'Obteniendo ID de sorteo de hoy...');
        const sorteoId = await obtenerSorteoIdDeHoy(TURNO);
        
        if (!sorteoId) {
            log('❌', `No se encontró sorteo de hoy para turno: ${TURNO}`);
            process.exit(1);
        }
        
        const fecha = getTodayDateArg();
        log('✅', `Sorteo ID: ${sorteoId} - Fecha: ${fecha}`);
        
        // 2. Scrapear con retry (usando configuración central)
        const { RETRY_STRATEGY, DELAYS } = await import('./config.js');
        const resultados = await scrapearConRetry(sorteoId, fecha, {
            maxIntentos: RETRY_STRATEGY.MAX_INTENTOS,
            delayEntreIntentos: RETRY_STRATEGY.DELAY,
            delayEntreJur: DELAYS.ENTRE_JURISDICCIONES
        });
        
        // 3. Guardar en DB
        if (resultados.length > 0) {
            const stats = await guardarResultados(resultados);
            
            const totalTime = Math.round((Date.now() - startTime) / 1000);
            
            log('🎉', `═══════════════════════════════════════════════════════`);
            log('🎉', `COMPLETADO en ${totalTime}s`);
            log('🎉', `Sorteo: ${sorteoId} | Guardados: ${stats.guardados}/${resultados.length}`);
            log('🎉', `═══════════════════════════════════════════════════════`);
            
            process.exit(0);
        } else {
            log('⚠️', 'No se pudieron obtener resultados');
            process.exit(1);
        }
        
    } catch (error) {
        log('❌', `Error fatal: ${error.message}`);
        console.error(error);
        process.exit(1);
        
    } finally {
        await closeDB();
    }
}

main();


