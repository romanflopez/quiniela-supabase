// ═══════════════════════════════════════════════════════════════════
// POCEADA API - Obtener ID de sorteo de Poceada desde su página
// ═══════════════════════════════════════════════════════════════════

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { convertDateFormat, log, getTodayDateArg } from './utils.js';

const POCEADA_PAGE_URL = 'https://poceada.loteriadelaciudad.gob.ar/';
const POCEADA_API_URL = 'https://poceada.loteriadelaciudad.gob.ar/resultadosPoceada/consultaResultados.php';
const CODIGO_FIJO = '0082'; // Poceada usa código 0082 (no 0080 como Quiniela)
const JURISDICCION_POCEADA = '51'; // Ciudad

/**
 * Obtener lista de sorteos disponibles desde la página principal
 * @returns {Array} Array de {id, fecha}
 */
export async function obtenerSorteosDisponibles() {
    try {
        log('🌐', `Obteniendo sorteos desde ${POCEADA_PAGE_URL}`);
        
        const response = await fetch(POCEADA_PAGE_URL);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const sorteos = [];
        
        // Buscar sorteos en el select #valor3
        $('#valor3 option').each((_, el) => {
            const value = $(el).attr('value');
            const text = $(el).text();
            
            // Formato: "Fecha: 13/12/2025 - Sorteo: 9493"
            const fechaMatch = text.match(/Fecha:\s*(\d{2}\/\d{2}\/\d{4})/);
            const sorteoMatch = text.match(/Sorteo:\s*(\d+)/);
            
            if (fechaMatch && sorteoMatch && value) {
                const fecha = convertDateFormat(fechaMatch[1]);
                const id = sorteoMatch[1];
                
                // Evitar duplicados
                if (!sorteos.find(s => s.id === id)) {
                    sorteos.push({ id, fecha });
                }
            }
        });
        
        log('✅', `${sorteos.length} sorteos disponibles encontrados`);
        return sorteos;
        
    } catch (error) {
        log('❌', `Error obteniendo sorteos: ${error.message}`);
        return [];
    }
}

/**
 * Obtener ID de sorteo de Poceada de hoy (o el más reciente disponible)
 * @returns {string|null} ID del sorteo o null
 */
export async function obtenerSorteoIdHoy() {
    try {
        const sorteos = await obtenerSorteosDisponibles();
        
        if (sorteos.length === 0) {
            log('⚠️', 'No se encontraron sorteos de Poceada disponibles');
            return null;
        }
        
        const hoy = getTodayDateArg();
        
        // Buscar sorteo de hoy
        let sorteoHoy = sorteos.find(s => s.fecha === hoy);
        
        // Si no hay de hoy, usar el más reciente
        if (!sorteoHoy) {
            sorteoHoy = sorteos[0]; // El primero es el más reciente
            log('⚠️', `No hay sorteo de Poceada de hoy (${hoy}), usando el más reciente: ${sorteoHoy.fecha}`);
        } else {
            log('✅', `Sorteo de Poceada de hoy encontrado: ${sorteoHoy.id}`);
        }
        
        return sorteoHoy.id;
        
    } catch (error) {
        log('❌', `Error obteniendo sorteo de Poceada: ${error.message}`);
        return null;
    }
}

/**
 * Scrapear resultado de Poceada desde su API
 * Poceada usa código 0082 y jurisdicción 51 (Ciudad)
 * @param {string} sorteoId - ID del sorteo de Poceada
 * @returns {Object|null} HTML response o null si falla
 */
export async function fetchResultadoPoceadaHTML(sorteoId) {
    try {
        // Poceada requiere: codigo=0082, juridiccion=51, sorteo=ID
        const params = new URLSearchParams({
            codigo: CODIGO_FIJO,        // 0082 para Poceada
            juridiccion: JURISDICCION_POCEADA,  // 51 = Ciudad
            sorteo: sorteoId
        });
        
        const response = await fetch(POCEADA_API_URL, {
            method: 'POST',
            body: params,
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': POCEADA_PAGE_URL
            }
        });
        
        if (!response.ok) {
            log('⚠️', `Poceada - HTTP ${response.status}`);
            return null;
        }
        
        const html = await response.text();
        
        // Verificar que el HTML tenga los datos
        if (!html || html.includes('No existe Sorteo') || (!html.includes('content-juego') && !html.includes('infoJuego'))) {
            log('⚠️', `Poceada - HTML sin datos válidos`);
            return null;
        }
        
        return html;
        
    } catch (error) {
        log('❌', `Poceada - Error: ${error.message}`);
        return null;
    }
}

/**
 * Extraer números y letras del HTML de Poceada
 * Poceada tiene estructura diferente: tabla con números de 2 dígitos (00-99)
 * @param {string} html - HTML response de Poceada
 * @returns {Object} {numeros: string[], letras: string[]}
 */
export function extraerResultadosPoceada(html) {
    const $ = cheerio.load(html);
    const numeros = [];
    const letras = [];
    
    // Poceada tiene estructura: <div class="content-juego"><div class="infoJuego"><table>...
    // Los números están en celdas <td> con valores de 2 dígitos (00-99)
    // Formato: <tr><td>00</td><td>19</td><td>40</td>...</tr>
    
    // Poceada tiene estructura: <div class="content-juego"><div class="infoJuego"><table><tbody><tr><td>00</td>...
    // Los números están directamente en las celdas <td> como texto de 2 dígitos (00-99)
    // Formato: <tr><td>00</td><td>19</td><td>40</td><td>54</td><td>77</td></tr>
    
    // Buscar en .content-juego .infoJuego table td (sin divs intermedios)
    $('.content-juego .infoJuego table td, .infoJuego table td').each((_, el) => {
        const text = $(el).text().trim();
        const classes = $(el).attr('class') || '';
        
        // Procesar letras primero (celdas con clase 'letras' o que contengan "LETRAS:")
        if (classes.includes('letras') || text.includes('LETRAS:')) {
            // Extraer letras del texto (ej: "LETRAS: NWXZ" -> ["N", "W", "X", "Z"])
            const letrasMatch = text.match(/LETRAS:\s*([A-Z]+)/i) || text.match(/([A-Z]{2,})/);
            if (letrasMatch && letras.length === 0) {
                const letrasStr = letrasMatch[1] || letrasMatch[0];
                for (const letra of letrasStr) {
                    if (letra !== ' ' && letra !== ':' && /^[A-Z]$/.test(letra)) {
                        letras.push(letra);
                    }
                }
            }
            return; // No procesar números en esta celda
        }
        
        // Es un número de 2 dígitos (00-99) - Poceada usa números de 2 dígitos
        if (/^\d{2}$/.test(text)) {
            // Convertir a formato de 4 dígitos agregando ceros al inicio (00 -> 0000, 19 -> 0019)
            const numero4Digitos = text.padStart(4, '0');
            if (numeros.length < 20) {
                numeros.push(numero4Digitos);
            }
            return;
        }
        
        // También puede venir como número de 4 dígitos directamente
        if (/^\d{4}$/.test(text)) {
            if (numeros.length < 20) {
                numeros.push(text);
            }
            return;
        }
    });
    
    // Si no encontramos números en la estructura nueva, intentar la estructura antigua
    if (numeros.length === 0) {
        $('.infoJuego td div').each((_, el) => {
            const text = $(el).text().trim();
            const classes = $(el).attr('class') || '';
            
            if (classes.includes('pos')) return;
            
            if (/^\d{4}$/.test(text) && numeros.length < 20) {
                numeros.push(text);
            }
        });
    }
    
    return { numeros, letras };
}
