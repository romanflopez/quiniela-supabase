// ═══════════════════════════════════════════════════════════════════
// DATA MAPPER - Normaliza datos de diferentes juegos antes de guardar
// ═══════════════════════════════════════════════════════════════════

/**
 * Mapear resultado de Quiniela Ciudad a formato Poceada
 * Poceada usa los mismos números de la última Quiniela de la Ciudad sorteada del día
 * @param {Object} resultadoQuiniela - Resultado de Quiniela Ciudad {sorteo_id, fecha, turno, numeros, letras, cabeza}
 * @param {string} poceadaSorteoId - ID del sorteo de Poceada (obtenido de la página de Poceada)
 * @returns {Object} Resultado en formato Poceada
 */
export function mapearQuinielaAPoceada(resultadoQuiniela, poceadaSorteoId) {
    if (!resultadoQuiniela || !Array.isArray(resultadoQuiniela.numeros) || resultadoQuiniela.numeros.length === 0) {
        return null;
    }

    return {
        sorteo_id: String(poceadaSorteoId),
        fecha: resultadoQuiniela.fecha,
        turno: 'Poceada',
        numeros: [...resultadoQuiniela.numeros], // Copia de los números
        letras: Array.isArray(resultadoQuiniela.letras) ? [...resultadoQuiniela.letras] : [],
        cabeza: resultadoQuiniela.cabeza || resultadoQuiniela.numeros[0] || null
    };
}

/**
 * Normalizar resultado de Quiniela para guardar en DB
 * @param {Object} resultado - Resultado crudo del scraper
 * @param {string} juego - 'quiniela' o 'poceada'
 * @returns {Object} Resultado normalizado
 */
export function normalizarResultado(resultado, juego = 'quiniela') {
    return {
        juego: juego,
        jurisdiccion: resultado.jurisdiccion || 'Ciudad',
        sorteo_id: String(resultado.sorteo_id),
        fecha: resultado.fecha,
        turno: resultado.turno,
        numeros: Array.isArray(resultado.numeros) ? resultado.numeros : [],
        letras: Array.isArray(resultado.letras) ? resultado.letras : [],
        cabeza: resultado.cabeza || (resultado.numeros && resultado.numeros[0]) || null
    };
}

/**
 * Validar resultado antes de guardar
 * @param {Object} resultado - Resultado normalizado
 * @returns {boolean} true si es válido
 */
export function validarResultado(resultado) {
    if (!resultado.sorteo_id) return false;
    if (!resultado.fecha) return false;
    if (!resultado.turno) return false;
    if (!Array.isArray(resultado.numeros) || resultado.numeros.length === 0) return false;
    
    return true;
}

