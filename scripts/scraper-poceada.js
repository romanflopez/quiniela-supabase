// ═══════════════════════════════════════════════════════════════════
// SCRAPER POCEADA - Scraper para Poceada de la Ciudad
// Poceada usa los números de la última Quiniela de la Ciudad del día
// ═══════════════════════════════════════════════════════════════════

import { obtenerSorteoIdHoy, obtenerSorteosDisponibles } from './lib/poceada-api.js';
import { obtenerSorteosDisponibles as obtenerSorteosQuiniela } from './lib/lotba-api.js';
import { scrapearSorteo } from './lib/scraper-core.js';
import { mapearQuinielaAPoceada } from './lib/data-mapper.js';
import { guardarResultadoPoceada } from './lib/poceada-db.js';
import { closeDB } from './lib/database.js';
import { sleep, getTodayDateArg, log } from './lib/utils.js';
import { crearMetrics } from './lib/metrics.js';
import { FEATURES } from './config.js';

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
        
        // 2. Obtener sorteo de Quiniela Ciudad del mismo día (último turno = Nocturna)
        log('📋', `Obteniendo sorteo de Quiniela Ciudad (Nocturna) para fecha ${fechaPoceada}...`);
        
        // Usar función ya importada al inicio del archivo
        const sorteosQuiniela = await obtenerSorteosQuiniela();
        const sorteoQuiniela = sorteosQuiniela.find(s => s.fecha === fechaPoceada && (s.id.endsWith('5') || s.id.endsWith('0')));
        
        if (!sorteoQuiniela) {
            log('❌', `No se encontró sorteo de Quiniela Ciudad Nocturna para fecha ${fechaPoceada}`);
            process.exit(1);
        }
        
        const quinielaSorteoId = sorteoQuiniela.id;
        log('✅', `Quiniela Ciudad Sorteo ID: ${quinielaSorteoId}`);
        
        // 3. Scrapear Quiniela Ciudad con retry
        let resultadoQuiniela = null;
        const maxIntentos = 20;
        
        for (let intento = 1; intento <= maxIntentos; intento++) {
            log('🔄', `Intento ${intento}/${maxIntentos} - Scrapeando Quiniela Ciudad...`);
            
            metrics.registrarIntento();
            const inicio = Date.now();
            
            resultadoQuiniela = await scrapearSorteo('Ciudad', quinielaSorteoId, fechaPoceada);
            
            const tiempo = Date.now() - inicio;
            
            if (resultadoQuiniela) {
                metrics.registrarExito('Quiniela Ciudad', tiempo);
                log('✅', `Quiniela Ciudad - Sorteo ${quinielaSorteoId} - Cabeza: ${resultadoQuiniela.cabeza}`);
                break;
            } else {
                metrics.registrarFallo('Quiniela Ciudad');
                log('⚠️', `Intento ${intento} falló, reintentando...`);
                
                if (intento < maxIntentos) {
                    await sleep(10000);
                }
            }
        }
        
        if (!resultadoQuiniela) {
            log('❌', `No se pudo obtener resultado de Quiniela Ciudad después de ${maxIntentos} intentos`);
            metrics.imprimirReporte();
            process.exit(1);
        }
        
        // 4. Mapear resultado de Quiniela a Poceada
        log('🔄', 'Mapeando resultado de Quiniela a Poceada...');
        const resultadoPoceada = mapearQuinielaAPoceada(resultadoQuiniela, poceadaSorteoId);
        
        if (!resultadoPoceada) {
            log('❌', 'Error al mapear resultado de Quiniela a Poceada');
            process.exit(1);
        }
        
        log('✅', `Poceada - Sorteo ${poceadaSorteoId} - Cabeza: ${resultadoPoceada.cabeza}`);
        
        // 5. Guardar en DB
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

