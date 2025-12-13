// ═══════════════════════════════════════════════════════════════════
// LOTBA API - Comunicación con el sitio de Lotería de la Ciudad
// ═══════════════════════════════════════════════════════════════════

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { convertDateFormat, log } from './utils.js';

const LOTBA_PAGE_URL = 'https://quiniela.loteriadelaciudad.gob.ar/';
const LOTBA_API_URL = 'https://quiniela.loteriadelaciudad.gob.ar/resultadosQuiniela/consultaResultados.php';
const CODIGO_FIJO = '0080';

/**
 * Obtener lista de sorteos disponibles desde la página principal
 * @returns {Array} Array de {id, fecha, turno}
 */
export async function obtenerSorteosDisponibles() {
    try {
        log('🌐', `Obteniendo sorteos desde ${LOTBA_PAGE_URL}`);
        
        const response = await fetch(LOTBA_PAGE_URL);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const sorteos = [];
        
        $('select#valor3 option, select[name="valor3"] option, option').each((_, el) => {
            const value = $(el).attr('value');
            const text = $(el).text();
            
            if (value && text && text.includes('Sorteo')) {
                // Extraer fecha del texto: "Fecha: 11/12/2025 - Sorteo: 51770"
                const fechaMatch = text.match(/Fecha:\s*(\d{2}\/\d{2}\/\d{4})/);
                const sorteoMatch = text.match(/Sorteo:\s*(\d+)/);
                
                if (fechaMatch && sorteoMatch) {
                    const fecha = convertDateFormat(fechaMatch[1]);
                    const id = sorteoMatch[1];
                    
                    sorteos.push({
                        id,
                        fecha,
                        turno: getTurnoFromId(id)
                    });
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
 * Obtener ID de sorteo de hoy para un turno específico
 * @param {string} turno - 'la-previa', 'primera', 'matutina', 'vespertina', 'nocturna'
 * @returns {string|null} ID del sorteo
 */
export async function obtenerSorteoIdDeHoy(turno) {
    const sorteos = await obtenerSorteosDisponibles();
    const hoy = new Date().toISOString().split('T')[0];
    
    // Mapear turno a último dígito esperado
    const turnoMap = {
        'la-previa': ['1', '6'],
        'primera': ['2', '7'],
        'matutina': ['3', '8'],
        'vespertina': ['4', '9'],
        'nocturna': ['5', '0']
    };
    
    const ultimosDigitos = turnoMap[turno.toLowerCase()];
    if (!ultimosDigitos) return null;
    
    const sorteoDeHoy = sorteos.find(s => {
        const lastDigit = s.id.charAt(s.id.length - 1);
        return s.fecha === hoy && ultimosDigitos.includes(lastDigit);
    });
    
    return sorteoDeHoy ? sorteoDeHoy.id : null;
}

/**
 * Scrapear resultado de 1 sorteo de 1 jurisdicción
 * @param {string} jurisdiccion - 'Ciudad', 'BsAs', etc
 * @param {string} codigoJur - '51', '53', etc
 * @param {string} sorteoId - ID del sorteo
 * @returns {Object|null} HTML response o null si falla
 */
export async function fetchResultadoHTML(jurisdiccion, codigoJur, sorteoId) {
    try {
        const params = new URLSearchParams({
            codigo: CODIGO_FIJO,
            juridiccion: codigoJur,
            sorteo: sorteoId
        });
        
        const response = await fetch(LOTBA_API_URL, {
            method: 'POST',
            body: params,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        if (!response.ok) {
            log('⚠️', `${jurisdiccion} - HTTP ${response.status}`);
            return null;
        }
        
        const html = await response.text();
        return html;
        
    } catch (error) {
        log('❌', `${jurisdiccion} - Error: ${error.message}`);
        return null;
    }
}

/**
 * Extraer números y letras del HTML
 * @param {string} html - HTML response de LOTBA
 * @returns {Object} {numeros: string[], letras: string[]}
 */
export function extraerResultados(html) {
    const $ = cheerio.load(html);
    const numeros = [];
    const letras = [];
    
    // Buscar todos los divs dentro de .infoJuego
    $('.infoJuego td div').each((_, el) => {
        const text = $(el).text().trim();
        const classes = $(el).attr('class') || '';
        
        // Ignorar divs con clase 'pos' (posiciones 01, 02, etc)
        if (classes.includes('pos')) return;
        
        // Es un número de 4 dígitos
        if (/^\d{4}$/.test(text)) {
            // Solo tomar los primeros 20 números (evita duplicados de columnas)
            if (numeros.length < 20) {
                numeros.push(text);
            }
            return;
        }
        
        // Es una letra o grupo de letras (ej: "EKRX")
        if (text.length > 0 && /^[A-Z]+$/.test(text)) {
            // Para letras, solo tomar el primer grupo encontrado
            if (letras.length === 0) {
                for (const letra of text) {
                    if (letra !== ' ' && letra !== '-') {
                        letras.push(letra);
                    }
                }
            }
        }
    });
    
    return { numeros, letras };
}

function getTurnoFromId(sorteoId) {
    const last = sorteoId.charAt(sorteoId.length - 1);
    const map = {
        '1': 'La Previa', '6': 'La Previa',
        '2': 'Primera', '7': 'Primera',
        '3': 'Matutina', '8': 'Matutina',
        '4': 'Vespertina', '9': 'Vespertina',
        '5': 'Nocturna', '0': 'Nocturna'
    };
    return map[last] || 'Desconocido';
}

