// ═══════════════════════════════════════════════════════════════════
// POCEADA DB - Funciones específicas para guardar resultados de Poceada
// ═══════════════════════════════════════════════════════════════════

import { initDB, closeDB as closeDBBase } from './database.js';
import { log } from './utils.js';
import { validarResultado } from './data-mapper.js';

/**
 * Verificar si existe un resultado de Poceada
 * @param {string} sorteo_id - ID del sorteo
 * @param {string} fecha - Fecha YYYY-MM-DD
 */
export async function existeResultadoPoceada(sorteo_id, fecha) {
    const sql = initDB();
    try {
        const resultado = await sql`
            SELECT id
            FROM poceada_resultados
            WHERE sorteo_id = ${sorteo_id}
            AND fecha = ${fecha}
            LIMIT 1
        `;
        return resultado.length > 0;
    } catch (error) {
        log('❌', `Error verificando existencia Poceada: ${error.message}`);
        return false;
    }
}

/**
 * Guardar resultado de Poceada en la base de datos
 * @param {Object} resultado - {sorteo_id, fecha, turno, numeros, letras, cabeza} (ya mapeado)
 */
export async function guardarResultadoPoceada(resultado) {
    const sql = initDB();
    
    try {
        // Validar
        if (!validarResultado(resultado)) {
            log('❌', 'Resultado de Poceada inválido');
            return false;
        }
        
        // Verificar si ya existe
        const existe = await existeResultadoPoceada(resultado.sorteo_id, resultado.fecha);
        
        if (existe) {
            // Actualizar si existe
            await sql`
                UPDATE poceada_resultados 
                SET 
                    turno = ${resultado.turno},
                    numeros = ${resultado.numeros},
                    letras = ${resultado.letras},
                    cabeza = ${resultado.cabeza}
                WHERE sorteo_id = ${resultado.sorteo_id}
                AND fecha = ${resultado.fecha}
            `;
            log('🔄', `Actualizado Poceada: ${resultado.sorteo_id} (${resultado.fecha})`);
        } else {
            // Insertar si no existe
            await sql`
                INSERT INTO poceada_resultados 
                    (sorteo_id, fecha, turno, numeros, letras, cabeza)
                VALUES 
                    (${resultado.sorteo_id}, ${resultado.fecha}, ${resultado.turno}, 
                     ${resultado.numeros}, ${resultado.letras}, ${resultado.cabeza})
            `;
            log('💾', `Guardado Poceada: ${resultado.turno} (${resultado.fecha})`);
        }
        
        return true;
        
    } catch (error) {
        log('❌', `Error guardando Poceada: ${error.message}`);
        console.error('Detalles del error:', error);
        return false;
    }
}

/**
 * Obtener count de resultados de Poceada
 */
export async function getCountResultadosPoceada() {
    const sql = initDB();
    try {
        const resultado = await sql`SELECT COUNT(*) as count FROM poceada_resultados`;
        return parseInt(resultado[0].count) || 0;
    } catch (error) {
        log('❌', `Error obteniendo count: ${error.message}`);
        return 0;
    }
}

export { closeDBBase as closeDB };

