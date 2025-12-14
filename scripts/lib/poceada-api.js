// ═══════════════════════════════════════════════════════════════════
// POCEADA API - Obtener ID de sorteo de Poceada desde su página
// ═══════════════════════════════════════════════════════════════════

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { convertDateFormat, log, getTodayDateArg } from './utils.js';

const POCEADA_PAGE_URL = 'https://poceada.loteriadelaciudad.gob.ar/';

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
