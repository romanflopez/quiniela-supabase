// ═══════════════════════════════════════════════════════════════════
// BACKFILL - Traer datos de los últimos 7 días
// ═══════════════════════════════════════════════════════════════════
// Uso: node scripts/backfill-ultima-semana.js [DIAS]
// Ejemplo: node scripts/backfill-ultima-semana.js 7
// ═══════════════════════════════════════════════════════════════════

import { obtenerSorteosDisponibles } from './lib/lotba-api.js';
import { scrapearSorteo, JURISDICCIONES } from './lib/scraper-core.js';
import { guardarResultados, closeDB } from './lib/database.js';
import { sleep, log } from './lib/utils.js';

const DIAS_ATRAS = parseInt(process.argv[2]) || 7;

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`🔄 BACKFILL - Últimos ${DIAS_ATRAS} días`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    try {
        // 1. Obtener todos los sorteos disponibles
        log('📋', 'Obteniendo sorteos disponibles...');
        const sorteos = await obtenerSorteosDisponibles();
        
        if (sorteos.length === 0) {
            log('❌', 'No se encontraron sorteos disponibles');
            process.exit(1);
        }
        
        // 2. Filtrar sorteos de los últimos N días
        const hoy = new Date();
        const fechaLimite = new Date();
        fechaLimite.setDate(hoy.getDate() - DIAS_ATRAS);
        const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];
        
        const sorteosRecientes = sorteos.filter(s => s.fecha >= fechaLimiteStr);
        
        log('✅', `${sorteosRecientes.length} sorteos encontrados desde ${fechaLimiteStr}`);
        
        if (sorteosRecientes.length === 0) {
            log('⚠️', 'No hay sorteos en el rango de fechas');
            process.exit(0);
        }
        
        // 3. Agrupar sorteos por fecha para mostrar progreso
        const sorteosPorFecha = {};
        sorteosRecientes.forEach(s => {
            if (!sorteosPorFecha[s.fecha]) {
                sorteosPorFecha[s.fecha] = [];
            }
            sorteosPorFecha[s.fecha].push(s);
        });
        
        log('📊', 'Sorteos por fecha:');
        Object.entries(sorteosPorFecha).forEach(([fecha, sorteos]) => {
            log('  ', `${fecha}: ${sorteos.length} sorteos (${sorteos.map(s => s.turno).join(', ')})`);
        });
        
        console.log('');
        log('🚀', 'Iniciando scraping...\n');
        
        // 4. Scrapear cada sorteo
        let totalGuardados = 0;
        let totalErrores = 0;
        let sorteosProcesados = 0;
        
        for (const sorteo of sorteosRecientes) {
            sorteosProcesados++;
            const progreso = `[${sorteosProcesados}/${sorteosRecientes.length}]`;
            
            log('🔍', `${progreso} Sorteo ${sorteo.id} - ${sorteo.fecha} - ${sorteo.turno}`);
            
            const resultados = [];
            
            // Scrapear cada jurisdicción para este sorteo
            for (const [nombre, codigo] of Object.entries(JURISDICCIONES)) {
                const resultado = await scrapearSorteo(nombre, sorteo.id, sorteo.fecha);
                
                if (resultado) {
                    resultados.push(resultado);
                    log('  ✅', `${nombre}: ${resultado.cabeza}`);
                } else {
                    log('  ⚠️', `${nombre}: Sin datos`);
                }
                
                // Pequeño delay entre jurisdicciones
                await sleep(1000);
            }
            
            // Guardar resultados de este sorteo
            if (resultados.length > 0) {
                const stats = await guardarResultados(resultados);
                totalGuardados += stats.guardados;
                totalErrores += stats.errores;
                log('💾', `Guardados: ${stats.guardados}/${resultados.length} | Errores: ${stats.errores}`);
            } else {
                log('⚠️', 'Sin resultados para este sorteo');
            }
            
            // Delay entre sorteos para no saturar el servidor
            if (sorteosProcesados < sorteosRecientes.length) {
                await sleep(2000);
            }
            
            console.log('');
        }
        
        // 5. Resumen final
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📊 RESUMEN FINAL');
        console.log('═══════════════════════════════════════════════════════════════');
        log('🎯', `Sorteos procesados: ${sorteosProcesados}`);
        log('✅', `Total guardados: ${totalGuardados}`);
        log('❌', `Total errores: ${totalErrores}`);
        log('📅', `Rango de fechas: ${fechaLimiteStr} a hoy`);
        console.log('═══════════════════════════════════════════════════════════════\n');
        
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

