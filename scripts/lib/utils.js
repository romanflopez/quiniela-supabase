// ═══════════════════════════════════════════════════════════════════
// UTILS - Funciones auxiliares reutilizables
// ═══════════════════════════════════════════════════════════════════

/**
 * Sleep/delay asíncrono
 * @param {number} ms - Milisegundos a esperar
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Obtener fecha de hoy en formato YYYY-MM-DD (zona horaria Argentina)
 */
export function getTodayDateArg() {
    const now = new Date();
    const argTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
    const yyyy = argTime.getFullYear();
    const mm = String(argTime.getMonth() + 1).padStart(2, '0');
    const dd = String(argTime.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Obtener fecha X días atrás
 * @param {number} days - Días hacia atrás
 */
export function getDateDaysAgo(days) {
    const now = new Date();
    const argTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
    argTime.setDate(argTime.getDate() - days);
    const yyyy = argTime.getFullYear();
    const mm = String(argTime.getMonth() + 1).padStart(2, '0');
    const dd = String(argTime.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convertir fecha DD/MM/YYYY a YYYY-MM-DD
 * @param {string} dateStr - Fecha en formato DD/MM/YYYY
 */
export function convertDateFormat(dateStr) {
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Determinar turno desde ID de sorteo
 * @param {string} sorteoId - ID del sorteo (ej: '51770')
 */
export function getTurnoFromId(sorteoId) {
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

/**
 * Logger con timestamp
 */
export function log(emoji, message) {
    const now = new Date().toISOString();
    console.log(`[${now}] ${emoji} ${message}`);
}


