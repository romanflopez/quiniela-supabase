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
        // Primero verificar si ya existe
        const existe = await existeResultado(resultado.jurisdiccion, resultado.sorteo_id);
        
        if (existe) {
            // Actualizar si existe
            await sql`
                UPDATE quiniela_resultados 
                SET 
                    fecha = ${resultado.fecha},
                    turno = ${resultado.turno},
                    numeros = ${resultado.numeros},
                    letras = ${resultado.letras},
                    cabeza = ${resultado.cabeza}
                WHERE jurisdiccion = ${resultado.jurisdiccion}
                AND sorteo_id = ${resultado.sorteo_id}
            `;
            log('🔄', `Actualizado: ${resultado.jurisdiccion} - ${resultado.sorteo_id}`);
        } else {
            // Insertar si no existe
            await sql`
                INSERT INTO quiniela_resultados 
                    (jurisdiccion, sorteo_id, fecha, turno, numeros, letras, cabeza)
                VALUES 
                    (${resultado.jurisdiccion}, ${resultado.sorteo_id}, ${resultado.fecha}, ${resultado.turno}, 
                     ${resultado.numeros}, ${resultado.letras}, ${resultado.cabeza})
            `;
            log('💾', `Guardado: ${resultado.jurisdiccion} - ${resultado.turno} (${resultado.fecha})`);
        }
        
        return true;
        
    } catch (error) {
        log('❌', `Error guardando ${resultado.jurisdiccion}: ${error.message}`);
        console.error('Detalles del error:', error);
        return false;
    }
}

/**
 * Guardar múltiples resultados (batch optimizado)
 * @param {Array} resultados - Array de objetos resultado
 */
export async function guardarResultados(resultados) {
    if (resultados.length === 0) {
        return { guardados: 0, errores: 0 };
    }
    
    log('💾', `Guardando ${resultados.length} resultados en DB (batch optimizado)...`);
    
    const sql = initDB();
    let guardados = 0;
    let errores = 0;
    
    try {
        // Usar transacción para mejor performance y atomicidad
        await sql.begin(async sql => {
            for (const resultado of resultados) {
                try {
                    // Verificar si existe
                    const existe = await sql`
                        SELECT id 
                        FROM quiniela_resultados 
                        WHERE jurisdiccion = ${resultado.jurisdiccion} 
                        AND sorteo_id = ${resultado.sorteo_id}
                        LIMIT 1
                    `;
                    
                    if (existe.length > 0) {
                        // Actualizar
                        await sql`
                            UPDATE quiniela_resultados 
                            SET 
                                fecha = ${resultado.fecha},
                                turno = ${resultado.turno},
                                numeros = ${resultado.numeros},
                                letras = ${resultado.letras},
                                cabeza = ${resultado.cabeza}
                            WHERE jurisdiccion = ${resultado.jurisdiccion}
                            AND sorteo_id = ${resultado.sorteo_id}
                        `;
                    } else {
                        // Insertar
                        await sql`
                            INSERT INTO quiniela_resultados 
                                (jurisdiccion, sorteo_id, fecha, turno, numeros, letras, cabeza)
                            VALUES 
                                (${resultado.jurisdiccion}, ${resultado.sorteo_id}, ${resultado.fecha}, ${resultado.turno}, 
                                 ${resultado.numeros}, ${resultado.letras}, ${resultado.cabeza})
                        `;
                    }
                    guardados++;
                } catch (error) {
                    errores++;
                    log('❌', `Error guardando ${resultado.jurisdiccion}: ${error.message}`);
                }
            }
        });
        
        log('✅', `Guardados: ${guardados} | Errores: ${errores}`);
        return { guardados, errores };
        
    } catch (error) {
        log('❌', `Error en batch guardado: ${error.message}`);
        // Fallback a método secuencial si falla la transacción
        return await guardarResultadosSecuencial(resultados);
    }
}

/**
 * Guardar múltiples resultados secuencialmente (fallback)
 * @param {Array} resultados - Array de objetos resultado
 */
async function guardarResultadosSecuencial(resultados) {
    log('⚠️', 'Usando método secuencial (fallback)...');
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
            AND sorteo_id = ${sorteoId}
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


