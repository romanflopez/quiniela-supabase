// ═══════════════════════════════════════════════════════════════════
// BACKFILL POCEADA - Traer datos de los últimos 7 días
// ═══════════════════════════════════════════════════════════════════
// Uso: node scripts/backfill-poceada.js [DIAS]
// Ejemplo: node scripts/backfill-poceada.js 7
// ═══════════════════════════════════════════════════════════════════

import { obtenerSorteosDisponibles as obtenerSorteosPoceada } from './lib/poceada-api.js';
import { obtenerSorteosDisponibles as obtenerSorteosQuiniela } from './lib/lotba-api.js';
import { scrapearSorteo } from './lib/scraper-core.js';
import { mapearQuinielaAPoceada } from './lib/data-mapper.js';
import { guardarResultadoPoceada, closeDB } from './lib/poceada-db.js';
import { sleep, getTodayDateArg, getDateDaysAgo, log } from './lib/utils.js';

const DIAS_ATRAS = parseInt(process.argv[2]) || 7;

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`🔄 BACKFILL POCEADA - Últimos ${DIAS_ATRAS} días`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    try {
        // 1. Obtener sorteos de Poceada disponibles
        log('📋', 'Obteniendo sorteos de Poceada disponibles...');
        const sorteosPoceada = await obtenerSorteosPoceada();
        
        if (sorteosPoceada.length === 0) {
            log('❌', 'No se encontraron sorteos de Poceada disponibles');
            process.exit(1);
        }
        
        // 2. Filtrar sorteos de los últimos N días
        const hoy = new Date();
        const fechaLimite = new Date();
        fechaLimite.setDate(hoy.getDate() - DIAS_ATRAS);
        const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];
        
        const sorteosRecientes = sorteosPoceada.filter(s => s.fecha >= fechaLimiteStr);
        
        log('✅', `${sorteosRecientes.length} sorteos de Poceada encontrados desde ${fechaLimiteStr}`);
        
        if (sorteosRecientes.length === 0) {
            log('⚠️', 'No hay sorteos de Poceada en el rango de fechas');
            process.exit(0);
        }
        
        // 3. Obtener sorteos de Quiniela para mapear
        log('📋', 'Obteniendo sorteos de Quiniela Ciudad...');
        const sorteosQuiniela = await obtenerSorteosQuiniela();
        
        if (sorteosQuiniela.length === 0) {
            log('❌', 'No se encontraron sorteos de Quiniela disponibles');
            process.exit(1);
        }
        
        console.log('');
        log('🚀', 'Iniciando backfill de Poceada...\n');
        
        // 4. Procesar cada sorteo de Poceada
        let totalGuardados = 0;
        let totalErrores = 0;
        let sorteosProcesados = 0;
        
        for (const sorteoPoceada of sorteosRecientes) {
            sorteosProcesados++;
            const progreso = `[${sorteosProcesados}/${sorteosRecientes.length}]`;
            
            log('🔍', `${progreso} Poceada Sorteo ${sorteoPoceada.id} - ${sorteoPoceada.fecha}`);
            
            // Buscar sorteo de Quiniela Ciudad Nocturna del mismo día
            const sorteoQuiniela = sorteosQuiniela.find(s => 
                s.fecha === sorteoPoceada.fecha && 
                (s.id.endsWith('5') || s.id.endsWith('0'))
            );
            
            if (!sorteoQuiniela) {
                log('  ⚠️', `No se encontró sorteo de Quiniela Ciudad Nocturna para fecha ${sorteoPoceada.fecha}`);
                totalErrores++;
                continue;
            }
            
            log('  📋', `Quiniela Ciudad Sorteo ID: ${sorteoQuiniela.id}`);
            
            // Scrapear Quiniela Ciudad
            const resultadoQuiniela = await scrapearSorteo('Ciudad', sorteoQuiniela.id, sorteoPoceada.fecha);
            
            if (!resultadoQuiniela) {
                log('  ⚠️', `No se pudo obtener resultado de Quiniela Ciudad`);
                totalErrores++;
                continue;
            }
            
            log('  ✅', `Quiniela Ciudad - Cabeza: ${resultadoQuiniela.cabeza}`);
            
            // Mapear a Poceada
            const resultadoPoceada = mapearQuinielaAPoceada(resultadoQuiniela, sorteoPoceada.id);
            
            if (!resultadoPoceada) {
                log('  ⚠️', `Error al mapear resultado`);
                totalErrores++;
                continue;
            }
            
            // Guardar en DB
            const guardado = await guardarResultadoPoceada(resultadoPoceada);
            
            if (guardado) {
                totalGuardados++;
                log('  💾', `Guardado: Poceada Sorteo ${sorteoPoceada.id} - Cabeza: ${resultadoPoceada.cabeza}`);
            } else {
                totalErrores++;
                log('  ❌', `Error al guardar`);
            }
            
            // Delay entre sorteos
            if (sorteosProcesados < sorteosRecientes.length) {
                await sleep(2000);
            }
            
            console.log('');
        }
        
        // 5. Resumen final
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📊 RESUMEN FINAL - BACKFILL POCEADA');
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
