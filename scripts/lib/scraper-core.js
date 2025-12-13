// ═══════════════════════════════════════════════════════════════════
// SCRAPER CORE - Funciones principales de scraping
// ═══════════════════════════════════════════════════════════════════

import { fetchResultadoHTML, extraerResultados } from './lotba-api.js';
import { sleep, getTurnoFromId, log } from './utils.js';
import { JURISDICCIONES, VALIDACIONES, FEATURES } from '../config.js';

// Usar configuración central
export { JURISDICCIONES };

/**
 * Scrapear 1 sorteo de 1 jurisdicción (función atómica)
 * @param {string} jurisdiccion - 'Ciudad', 'BsAs', etc
 * @param {string} sorteoId - ID del sorteo
 * @param {string} fecha - Fecha YYYY-MM-DD (opcional, se calcula si no se pasa)
 * @returns {Object|null} Resultado o null si no hay datos
 */
export async function scrapearSorteo(jurisdiccion, sorteoId, fecha = null) {
    const codigoJur = JURISDICCIONES[jurisdiccion];
    
    if (!codigoJur) {
        log('❌', `Jurisdicción desconocida: ${jurisdiccion}`);
        return null;
    }
    
    const html = await fetchResultadoHTML(jurisdiccion, codigoJur, sorteoId);
    
    if (!html) {
        return null;
    }
    
    const { numeros, letras } = extraerResultados(html);
    
    // Validar que tengamos los números esperados (usar config)
    if (numeros.length !== VALIDACIONES.NUMEROS_ESPERADOS) {
        if (FEATURES.VERBOSE_LOGS) {
            log('⚠️', `${jurisdiccion} - Solo ${numeros.length} números (esperados ${VALIDACIONES.NUMEROS_ESPERADOS})`);
        }
        return null;
    }
    
    // Construir objeto resultado
    return {
        jurisdiccion,
        sorteo_id: sorteoId,
        fecha: fecha || new Date().toISOString().split('T')[0],
        turno: getTurnoFromId(sorteoId),
        numeros,
        letras,
        cabeza: numeros[0]
    };
}

/**
 * Scrapear TODAS las jurisdicciones para 1 sorteo
 * @param {string} sorteoId - ID del sorteo
 * @param {string} fecha - Fecha YYYY-MM-DD
 * @param {number} delayMs - Delay entre jurisdicciones (default 3000ms)
 * @returns {Array} Array de resultados
 */
export async function scrapearTodasJurisdicciones(sorteoId, fecha, delayMs = 3000) {
    log('🔍', `Scrapeando sorteo ${sorteoId} (${fecha}) de todas las jurisdicciones...`);
    
    const resultados = [];
    
    for (const [nombre, codigo] of Object.entries(JURISDICCIONES)) {
        const resultado = await scrapearSorteo(nombre, sorteoId, fecha);
        
        if (resultado) {
            resultados.push(resultado);
            log('✅', `${nombre} - Sorteo ${sorteoId} - Cabeza: ${resultado.cabeza}`);
        } else {
            log('⚠️', `${nombre} - Sin datos para sorteo ${sorteoId}`);
        }
        
        // Delay entre jurisdicciones para no ser baneados
        if (delayMs > 0) {
            await sleep(delayMs);
        }
    }
    
    log('📊', `Resultados obtenidos: ${resultados.length}/${Object.keys(JURISDICCIONES).length}`);
    return resultados;
}

/**
 * Scrapear con retry hasta encontrar datos
 * @param {string} sorteoId
 * @param {string} fecha
 * @param {Object} options - {maxIntentos, delayEntreIntentos, delayEntreJur}
 * @returns {Array} Array de resultados
 */
export async function scrapearConRetry(sorteoId, fecha, options = {}) {
    const {
        maxIntentos = 20,
        delayEntreIntentos = 10000,  // 10s
        delayEntreJur = 3000          // 3s
    } = options;
    
    log('🎰', `Retry Strategy: ${maxIntentos} intentos, ${delayEntreIntentos/1000}s entre intentos`);
    
    for (let intento = 1; intento <= maxIntentos; intento++) {
        log('🔄', `Intento ${intento}/${maxIntentos}`);
        
        const resultados = await scrapearTodasJurisdicciones(sorteoId, fecha, delayEntreJur);
        
        // Si encontramos todas las jurisdicciones, SUCCESS
        if (resultados.length === Object.keys(JURISDICCIONES).length) {
            log('🎉', `¡TODOS ENCONTRADOS en intento ${intento}!`);
            return resultados;
        }
        
        // Si no es el último intento, esperar
        if (intento < maxIntentos) {
            log('⏳', `${resultados.length}/${Object.keys(JURISDICCIONES).length} - Esperando ${delayEntreIntentos/1000}s...`);
            await sleep(delayEntreIntentos);
        }
    }
    
    log('⚠️', `No se completaron todas las jurisdicciones después de ${maxIntentos} intentos`);
    return [];
}

