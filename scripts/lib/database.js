// ═══════════════════════════════════════════════════════════════════
// DATABASE - Funciones para guardar en Supabase PostgreSQL
// ═══════════════════════════════════════════════════════════════════

import postgres from 'postgres';
import { log } from './utils.js';

let db = null;

/**
 * Inicializar conexión a la base de datos
 */
export function initDB() {
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
        throw new Error('❌ DATABASE_URL no configurado en variables de entorno');
    }
    
    if (!db) {
        db = postgres(DATABASE_URL, { 
            max: 1,
            connect_timeout: 10,
            idle_timeout: 20
        });
        log('🔌', 'Conexión a DB inicializada');
    }
    
    return db;
}

/**
 * Cerrar conexión a la base de datos
 */
export async function closeDB() {
    if (db) {
        await db.end();
        db = null;
        log('🔌', 'Conexión a DB cerrada');
    }
}

/**
 * Guardar 1 resultado en la base de datos
 * @param {Object} resultado - {jurisdiccion, sorteo_id, fecha, turno, numeros, letras, cabeza}
 */
export async function guardarResultado(resultado) {
    const sql = initDB();
    
    try {
        await sql`
            INSERT INTO quiniela_resultados 
                (jurisdiccion, sorteo_id, fecha, turno, numeros, letras, cabeza)
            VALUES 
                (${resultado.jurisdiccion}, ${resultado.sorteo_id}, ${resultado.fecha}, ${resultado.turno}, 
                 ${resultado.numeros}, ${resultado.letras}, ${resultado.cabeza})
            ON CONFLICT (jurisdiccion, sorteo_id) 
            DO UPDATE SET
                fecha = EXCLUDED.fecha,
                turno = EXCLUDED.turno,
                numeros = EXCLUDED.numeros,
                letras = EXCLUDED.letras,
                cabeza = EXCLUDED.cabeza
        `;
        
        log('💾', `Guardado: ${resultado.jurisdiccion} - ${resultado.turno} (${resultado.fecha})`);
        return true;
        
    } catch (error) {
        log('❌', `Error guardando ${resultado.jurisdiccion}: ${error.message}`);
        return false;
    }
}

/**
 * Guardar múltiples resultados (batch)
 * @param {Array} resultados - Array de objetos resultado
 */
export async function guardarResultados(resultados) {
    log('💾', `Guardando ${resultados.length} resultados en DB...`);
    
    let guardados = 0;
    let errores = 0;
    
    for (const resultado of resultados) {
        const success = await guardarResultado(resultado);
        if (success) {
            guardados++;
        } else {
            errores++;
        }
    }
    
    log('✅', `Guardados: ${guardados} | Errores: ${errores}`);
    return { guardados, errores };
}

/**
 * Verificar si existe un resultado en la DB
 * @param {string} jurisdiccion
 * @param {string} sorteoId
 * @param {string} fecha
 */
export async function existeResultado(jurisdiccion, sorteoId, fecha) {
    const sql = initDB();
    
    try {
        const resultado = await sql`
            SELECT id 
            FROM quiniela_resultados 
            WHERE jurisdiccion = ${jurisdiccion} 
            AND id_sorteo = ${sorteoId}
            AND fecha = ${fecha}
            LIMIT 1
        `;
        
        return resultado.length > 0;
        
    } catch (error) {
        log('❌', `Error verificando existencia: ${error.message}`);
        return false;
    }
}

/**
 * Obtener count de resultados en la DB
 */
export async function getCountResultados() {
    const sql = initDB();
    
    try {
        const result = await sql`
            SELECT COUNT(*) as total
            FROM quiniela_resultados
        `;
        
        return parseInt(result[0].total);
        
    } catch (error) {
        log('❌', `Error obteniendo count: ${error.message}`);
        return 0;
    }
}


