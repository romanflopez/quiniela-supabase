// ═══════════════════════════════════════════════════════════════════
// SCRAPER DEDICADO PARA CIUDAD (con Letras)
// ═══════════════════════════════════════════════════════════════════
// Ciudad usa un endpoint y estrategia diferente que las otras jurisdicciones
// Históricamente ha tenido problemas, por eso tiene su propio scraper

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { guardarResultado } from './lib/database.js';
import { ScraperMetrics } from './lib/metrics.js';
import { log } from './lib/utils.js';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN ESPECÍFICA DE CIUDAD
// ═══════════════════════════════════════════════════════════════════

const CIUDAD_CONFIG = {
    // Endpoint específico de Ciudad (diferente al de otras jurisdicciones)
    URL: 'https://quiniela.loteriadelaciudad.gob.ar/resultadosQuiniela/consultaResultados.php',
    
    // Código de jurisdicción de Ciudad
    CODIGO_JURISDICCION: '51',
    
    // Código fijo para todas las requests
    CODIGO_FIJO: '0080',
    
    // Configuración de reintentos (más agresivo que otras jurisdicciones)
    RETRY: {
        MAX_ATTEMPTS: 5,      // Más intentos porque Ciudad falla más
        DELAY_MS: 4000,       // 4 segundos entre intentos
        BACKOFF_MULTIPLIER: 1.5  // Incremento exponencial del delay
    },
    
    // Validaciones específicas de Ciudad
    VALIDACION: {
        NUMEROS_ESPERADOS: 20,
        LETRAS_ESPERADAS: 20
    }
};

// ═══════════════════════════════════════════════════════════════════
// FUNCIONES DE SCRAPING ESPECÍFICAS PARA CIUDAD
// ═══════════════════════════════════════════════════════════════════

/**
 * Scrapear un sorteo de Ciudad con manejo robusto de errores
 * @param {string} sorteoId - ID del sorteo (ej: '51774')
 * @param {string} fecha - Fecha YYYY-MM-DD
 * @param {Object} metrics - Objeto de métricas
 * @returns {Object|null} Resultado o null si falla
 */
async function scrapearSorteoCiudad(sorteoId, fecha, metrics) {
    log('🔍', `Scrapeando Ciudad sorteo ${sorteoId}...`);
    
    let lastError = null;
    let currentDelay = CIUDAD_CONFIG.RETRY.DELAY_MS;
    
    // Intentar con retry progresivo
    for (let attempt = 1; attempt <= CIUDAD_CONFIG.RETRY.MAX_ATTEMPTS; attempt++) {
        try {
            log('⏳', `Ciudad - Intento ${attempt}/${CIUDAD_CONFIG.RETRY.MAX_ATTEMPTS}`);
            
            const html = await fetchCiudadHTML(sorteoId);
            
            if (!html) {
                throw new Error('No se obtuvo HTML');
            }
            
            const resultado = extraerResultadosCiudad(html, sorteoId, fecha);
            
            if (resultado) {
                log('✅', `Ciudad - Sorteo ${sorteoId} OK (${resultado.numeros.length} números, ${resultado.letras.length} letras)`);
                metrics.registrarExito('Ciudad', currentDelay);
                return resultado;
            } else {
                throw new Error('No se pudieron extraer datos válidos del HTML');
            }
            
        } catch (error) {
            lastError = error;
            log('⚠️', `Ciudad - Intento ${attempt} falló: ${error.message}`);
            
            // Si no es el último intento, esperar antes del siguiente
            if (attempt < CIUDAD_CONFIG.RETRY.MAX_ATTEMPTS) {
                log('💤', `Esperando ${currentDelay}ms antes del próximo intento...`);
                await sleep(currentDelay);
                
                // Incrementar delay exponencialmente
                currentDelay = Math.floor(currentDelay * CIUDAD_CONFIG.RETRY.BACKOFF_MULTIPLIER);
            }
        }
    }
    
    // Si llegamos aquí, fallaron todos los intentos
    log('❌', `Ciudad - Falló después de ${CIUDAD_CONFIG.RETRY.MAX_ATTEMPTS} intentos`);
    metrics.registrarFallo('Ciudad');
    return null;
}

/**
 * Fetch HTML de un sorteo de Ciudad
 * @param {string} sorteoId - ID del sorteo
 * @returns {string|null} HTML o null si falla
 */
async function fetchCiudadHTML(sorteoId) {
    try {
        const params = new URLSearchParams({
            codigo: CIUDAD_CONFIG.CODIGO_FIJO,
            juridiccion: CIUDAD_CONFIG.CODIGO_JURISDICCION,
            sorteo: sorteoId
        });
        
        const response = await fetch(CIUDAD_CONFIG.URL, {
            method: 'POST',
            body: params,
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000  // 15 segundos timeout
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        
        // Validar que el HTML tenga contenido útil
        if (html.length < 100) {
            throw new Error('HTML demasiado corto, posible error');
        }
        
        return html;
        
    } catch (error) {
        log('⚠️', `Error al hacer fetch: ${error.message}`);
        return null;
    }
}

/**
 * Extraer números y letras del HTML de Ciudad
 * @param {string} html - HTML response
 * @param {string} sorteoId - ID del sorteo
 * @param {string} fecha - Fecha YYYY-MM-DD
 * @returns {Object|null} Resultado o null si no hay datos válidos
 */
function extraerResultadosCiudad(html, sorteoId, fecha) {
    try {
        const $ = cheerio.load(html);
        
        const numeros = [];
        const letras = [];
        
        // Extraer números y letras de la tabla
        $('.infoJuego td div').each((_, el) => {
            const text = $(el).text().trim();
            const classes = $(el).attr('class') || '';
            
            // Ignorar elementos de posición
            if (classes.includes('pos')) return;
            
            // Extraer números (formato 4 dígitos)
            if (/^\d{4}$/.test(text)) {
                if (numeros.length < 20) {
                    numeros.push(text);
                }
            } 
            // Extraer letras (solo mayúsculas)
            else if (text.length > 0 && /^[A-Z]+$/.test(text)) {
                // Solo tomar el primer grupo de letras
                if (letras.length === 0) {
                    for (const letra of text) {
                        letras.push(letra);
                    }
                }
            }
        });
        
        // Validar que tengamos los datos completos
        if (numeros.length !== CIUDAD_CONFIG.VALIDACION.NUMEROS_ESPERADOS) {
            log('⚠️', `Ciudad - Números inválidos: ${numeros.length}/${CIUDAD_CONFIG.VALIDACION.NUMEROS_ESPERADOS}`);
            return null;
        }
        
        if (letras.length !== CIUDAD_CONFIG.VALIDACION.LETRAS_ESPERADAS) {
            log('⚠️', `Ciudad - Letras inválidas: ${letras.length}/${CIUDAD_CONFIG.VALIDACION.LETRAS_ESPERADAS}`);
            return null;
        }
        
        // Construir resultado
        return {
            jurisdiccion: 'Ciudad',
            sorteo_id: sorteoId,
            fecha: fecha,
            turno: getTurnoFromId(sorteoId),
            numeros: numeros,
            letras: letras,
            cabeza: numeros[0]
        };
        
    } catch (error) {
        log('❌', `Error al parsear HTML: ${error.message}`);
        return null;
    }
}

/**
 * Determinar turno basado en sorteo_id
 * @param {string} sorteoId - ID del sorteo
 * @returns {string} Nombre del turno
 */
function getTurnoFromId(sorteoId) {
    const last = sorteoId.charAt(sorteoId.length - 1);
    if (last === '6' || last === '1') return 'La Previa';
    if (last === '7' || last === '2') return 'Primera';
    if (last === '8' || last === '3') return 'Matutina';
    if (last === '9' || last === '4') return 'Vespertina';
    if (last === '0' || last === '5') return 'Nocturna';
    return 'Desconocido';
}

/**
 * Sleep utility
 * @param {number} ms - Milisegundos
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

/**
 * Ejecutar scraping de Ciudad con auto-incremento de sorteo_id
 * @param {number} sorteoInicial - ID de sorteo inicial (opcional)
 * @param {number} maxIntentos - Máximo de sorteos a intentar (default: 10)
 */
async function main(sorteoInicial = null, maxIntentos = 10) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔤 SCRAPER DEDICADO PARA CIUDAD (con Letras)');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const metrics = new ScraperMetrics();
    
    // Fecha de hoy
    const fecha = new Date().toISOString().split('T')[0];
    log('📅', `Fecha: ${fecha}`);
    
    // Sorteo inicial (si no se especifica, usar un ID reciente)
    let sorteoId = sorteoInicial || 51800;  // ID aproximado actual de Ciudad
    log('🎯', `Sorteo inicial: ${sorteoId}`);
    log('🔄', `Máximo de intentos: ${maxIntentos}\n`);
    
    let sorteoGuardado = false;
    let intentos = 0;
    
    // Buscar sorteos válidos con auto-incremento
    while (!sorteoGuardado && intentos < maxIntentos) {
        intentos++;
        
        log('━━━', `Intento ${intentos}/${maxIntentos} - Sorteo ${sorteoId}`);
        
        const resultado = await scrapearSorteoCiudad(sorteoId.toString(), fecha, metrics);
        
        if (resultado) {
            // Intentar guardar en la base de datos
            log('💾', 'Guardando en base de datos...');
            
            const guardado = await guardarResultado(resultado);
            
            if (guardado) {
                log('✅', '¡Sorteo guardado exitosamente en la BD!');
                sorteoGuardado = true;
            } else {
                log('⚠️', 'No se pudo guardar (posiblemente duplicado)');
            }
        } else {
            log('❌', `Sorteo ${sorteoId} no disponible o inválido`);
        }
        
        // Incrementar sorteo_id para el próximo intento
        sorteoId++;
        
        // Esperar un poco entre intentos para no saturar el servidor
        if (!sorteoGuardado && intentos < maxIntentos) {
            await sleep(2000);
        }
        
        console.log('');
    }
    
    // Resumen final
    console.log('═══════════════════════════════════════════════════════════════');
    if (sorteoGuardado) {
        console.log('✅ ÉXITO - Scraping de Ciudad completado');
    } else {
        console.log('⚠️ NO SE ENCONTRARON SORTEOS VÁLIDOS');
    }
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    metrics.imprimirReporte();
    
    process.exit(sorteoGuardado ? 0 : 1);
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    // Leer argumentos
    const sorteoInicial = process.argv[2] ? parseInt(process.argv[2]) : null;
    const maxIntentos = process.argv[3] ? parseInt(process.argv[3]) : 10;
    
    main(sorteoInicial, maxIntentos).catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}

export { scrapearSorteoCiudad, extraerResultadosCiudad };

