// ═══════════════════════════════════════════════════════════════════
// SCRAPER POCEADA - Scraper para Poceada de la Ciudad
// Poceada usa los números de la última Quiniela de la Ciudad del día
// ═══════════════════════════════════════════════════════════════════

import { obtenerSorteoIdHoy, obtenerSorteosDisponibles, fetchResultadoPoceadaHTML, extraerResultadosPoceada } from './lib/poceada-api.js';
import { guardarResultadoPoceada } from './lib/poceada-db.js';
import { closeDB } from './lib/database.js';
import { sleep, getTodayDateArg, log } from './lib/utils.js';
import { crearMetrics } from './lib/metrics.js';
import { FEATURES, VALIDACIONES } from './config.js';

async function main() {
    log('🎰', '══════════════════════════════════════════════════════');
    log('🎰', 'SCRAPER POCEADA DE LA CIUDAD');
    log('🎰', '══════════════════════════════════════════════════════');
    
    const metrics = crearMetrics();
    const fecha = getTodayDateArg();
    
    log('📅', `Fecha: ${fecha}`);
    
    try {
        // 1. Obtener ID de sorteo de Poceada (para saber qué sorteo de Poceada es)
        log('📋', 'Obteniendo ID de sorteo de Poceada...');
        const poceadaSorteoId = await obtenerSorteoIdHoy();
        
        if (!poceadaSorteoId) {
            log('❌', 'No se encontró sorteo de Poceada disponible');
            process.exit(1);
        }
        
        // Obtener la fecha del sorteo de Poceada
        const sorteosPoceada = await obtenerSorteosDisponibles();
        const sorteoPoceada = sorteosPoceada.find(s => s.id === poceadaSorteoId);
        const fechaPoceada = sorteoPoceada ? sorteoPoceada.fecha : fecha;
        
        log('✅', `Poceada Sorteo ID: ${poceadaSorteoId} - Fecha: ${fechaPoceada}`);
        
        // 2. Scrapear resultado de Poceada directamente desde su página
        let resultadoPoceada = null;
        const maxIntentos = 20;
        
        for (let intento = 1; intento <= maxIntentos; intento++) {
            log('🔄', `Intento ${intento}/${maxIntentos} - Scrapeando Poceada...`);
            
            metrics.registrarIntento();
            const inicio = Date.now();
            
            // Obtener HTML de Poceada (intenta desde la página principal con el sorteo seleccionado)
            const html = await fetchResultadoPoceadaHTML(poceadaSorteoId);
            
            if (!html) {
                metrics.registrarFallo('Poceada');
                log('⚠️', `Intento ${intento} falló, reintentando...`);
                
                if (intento < maxIntentos) {
                    await sleep(10000);
                }
                continue;
            }
            
            // Extraer números y letras
            const { numeros, letras } = extraerResultadosPoceada(html);
            
            // Validar que tengamos los números esperados (Poceada tiene 20 números de 2 dígitos)
            if (numeros.length !== VALIDACIONES.NUMEROS_ESPERADOS) {
                metrics.registrarFallo('Poceada');
                log('⚠️', `Solo ${numeros.length} números (esperados ${VALIDACIONES.NUMEROS_ESPERADOS}), reintentando...`);
                
                if (intento < maxIntentos) {
                    await sleep(10000);
                }
                continue;
            }
            
            // Construir resultado
            resultadoPoceada = {
                sorteo_id: String(poceadaSorteoId),
                fecha: fechaPoceada,
                turno: 'Poceada',
                numeros,
                letras,
                cabeza: numeros[0] || null
            };
            
            const tiempo = Date.now() - inicio;
            metrics.registrarExito('Poceada', tiempo);
            log('✅', `Poceada - Sorteo ${poceadaSorteoId} - Cabeza: ${resultadoPoceada.cabeza} - Números: ${numeros.length}`);
            break;
        }
        
        if (!resultadoPoceada) {
            log('❌', `No se pudo obtener resultado de Poceada después de ${maxIntentos} intentos`);
            metrics.imprimirReporte();
            process.exit(1);
        }
        
        // 3. Guardar en DB
        if (FEATURES.SAVE_TO_DB) {
            log('💾', 'Guardando resultado en DB...');
            const guardado = await guardarResultadoPoceada(resultadoPoceada);
            
            if (guardado) {
                log('✅', `Resultado guardado: Poceada (${fechaPoceada})`);
            } else {
                log('❌', 'Error al guardar resultado');
                process.exit(1);
            }
        } else {
            log('⚠️', 'SAVE_TO_DB deshabilitado (dry run)');
            log('📊', `Resultado: ${JSON.stringify(resultadoPoceada, null, 2)}`);
        }
        
        metrics.imprimirReporte();
        log('✅', 'Scraper Poceada completado exitosamente');
        
    } catch (error) {
        log('❌', `Error fatal: ${error.message}`);
        console.error(error);
        process.exit(1);
    } finally {
        await closeDB();
    }
}

main();

