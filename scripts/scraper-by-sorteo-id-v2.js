// ═══════════════════════════════════════════════════════════════════
// SCRAPER BY SORTEO ID V2 - Con métricas y configuración central
// ═══════════════════════════════════════════════════════════════════
// Uso: node scripts/scraper-by-sorteo-id-v2.js [SORTEO_ID] [FECHA]
// Ejemplo: node scripts/scraper-by-sorteo-id-v2.js 51774 2025-12-12
// ═══════════════════════════════════════════════════════════════════

import { scrapearSorteo, JURISDICCIONES } from './lib/scraper-core.js';
import { guardarResultados, closeDB } from './lib/database.js';
import { sleep, getTurnoFromId, log } from './lib/utils.js';
import { crearMetrics } from './lib/metrics.js';
import { DELAYS, FEATURES } from './config.js';

const SORTEO_ID = process.argv[2];
const FECHA = process.argv[3] || new Date().toISOString().split('T')[0];

if (!SORTEO_ID) {
    console.error('❌ Uso: node scripts/scraper-by-sorteo-id-v2.js [SORTEO_ID] [FECHA_OPCIONAL]');
    console.error('Ejemplo: node scripts/scraper-by-sorteo-id-v2.js 51774 2025-12-12');
    process.exit(1);
}

async function main() {
    const metrics = crearMetrics();
    
    log('🎯', `═══════════════════════════════════════════════════════`);
    log('🎯', `SCRAPER BY ID V2 - Sorteo: ${SORTEO_ID}`);
    log('🎯', `Fecha: ${FECHA} | Turno: ${getTurnoFromId(SORTEO_ID)}`);
    log('🎯', `═══════════════════════════════════════════════════════`);
    
    try {
        const resultados = [];
        
        // Scrapear cada jurisdicción
        for (const [nombre, codigo] of Object.entries(JURISDICCIONES)) {
            metrics.registrarIntento();
            const start = Date.now();
            
            const resultado = await scrapearSorteo(nombre, SORTEO_ID, FECHA);
            const tiempo = Date.now() - start;
            
            if (resultado) {
                resultados.push(resultado);
                metrics.registrarExito(nombre, tiempo);
                log('✅', `${nombre} - Cabeza: ${resultado.cabeza} (${tiempo}ms)`);
            } else {
                metrics.registrarFallo(nombre);
                log('⚠️', `${nombre} - Sin datos`);
            }
            
            // Delay entre jurisdicciones (configurable)
            if (DELAYS.ENTRE_JURISDICCIONES > 0) {
                await sleep(DELAYS.ENTRE_JURISDICCIONES);
            }
        }
        
        // Imprimir métricas
        metrics.imprimirReporte();
        
        if (resultados.length === 0) {
            log('⚠️', 'No se encontraron datos para este sorteo');
            process.exit(1);
        }
        
        // Guardar en DB si está habilitado
        if (FEATURES.SAVE_TO_DB) {
            const stats = await guardarResultados(resultados);
            log('💾', `Guardados: ${stats.guardados} | Errores: ${stats.errores}`);
        } else {
            log('⚠️', 'Guardado en DB deshabilitado (dry run)');
        }
        
        // Retornar JSON para consumo de la app
        if (FEATURES.VERBOSE_LOGS) {
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
                metrics: metrics.getReporte()
            }, null, 2));
        }
        
        log('🎉', '═══════════════════════════════════════════════════════');
        log('🎉', `COMPLETADO en ${metrics.getTiempoTotal()}s - ${resultados.length}/${Object.keys(JURISDICCIONES).length} jurisdicciones`);
        log('🎉', '═══════════════════════════════════════════════════════');
        
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

