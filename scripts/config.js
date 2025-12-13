// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN CENTRAL - Todas las constantes en un solo lugar
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// JURISDICCIONES
// ═══════════════════════════════════════════════════════════════════

export const JURISDICCIONES = {
    'Ciudad': '51',
    'BsAs': '53',
    'SantaFe': '72',
    'Cordoba': '55',
    // 'EntreRios': '52',   // ⚠️ Deshabilitado: pocos datos
    // 'Uruguay': '54',     // ⚠️ Deshabilitado: pocos datos
};

// ═══════════════════════════════════════════════════════════════════
// DELAYS Y TIMEOUTS
// ═══════════════════════════════════════════════════════════════════

export const DELAYS = {
    // Delay entre jurisdicciones (para no ser baneados)
    ENTRE_JURISDICCIONES: 3000,      // 3 segundos
    
    // Delay entre intentos de retry
    ENTRE_INTENTOS: 10000,            // 10 segundos
    
    // Timeout para requests HTTP
    REQUEST_TIMEOUT: 15000,           // 15 segundos
};

// ═══════════════════════════════════════════════════════════════════
// ESTRATEGIA DE RETRY
// ═══════════════════════════════════════════════════════════════════

export const RETRY_STRATEGY = {
    // Número de intentos antes de rendirse
    MAX_INTENTOS: 20,
    
    // Delay entre intentos (en milisegundos)
    DELAY: 10000,  // 10s
    
    // Tiempo total máximo: 20 intentos × 10s = ~3.3 minutos
    // Esto está debajo del timeout de GitHub Actions (6 horas)
};

// Estrategia agresiva para scraper incremental (sorteo actual)
export const RETRY_AGGRESSIVE = {
    MAX_INTENTOS: 30,
    DELAY: 5000,  // 5s = 2.5 minutos total
};

// Estrategia conservadora para scraper histórico (bulk)
export const RETRY_CONSERVATIVE = {
    MAX_INTENTOS: 5,
    DELAY: 2000,  // 2s = 10s total
};

// ═══════════════════════════════════════════════════════════════════
// ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

export const LOTBA = {
    // Página principal con dropdown de sorteos
    PAGE_URL: 'https://quiniela.loteriadelaciudad.gob.ar/',
    
    // Endpoint para scrapear resultados
    API_URL: 'https://quiniela.loteriadelaciudad.gob.ar/resultadosQuiniela/consultaResultados.php',
    
    // Código fijo para todas las requests
    CODIGO_FIJO: '0080',
};

// ═══════════════════════════════════════════════════════════════════
// TURNOS
// ═══════════════════════════════════════════════════════════════════

export const TURNOS = {
    'La Previa': { hora: '10:15', ultimosDigitos: ['1', '6'] },
    'Primera':   { hora: '12:00', ultimosDigitos: ['2', '7'] },
    'Matutina':  { hora: '15:00', ultimosDigitos: ['3', '8'] },
    'Vespertina':{ hora: '18:00', ultimosDigitos: ['4', '9'] },
    'Nocturna':  { hora: '21:00', ultimosDigitos: ['5', '0'] },
};

// ═══════════════════════════════════════════════════════════════════
// VALIDACIONES
// ═══════════════════════════════════════════════════════════════════

export const VALIDACIONES = {
    // Número esperado de números por sorteo
    NUMEROS_ESPERADOS: 20,
    
    // Regex para validar un número de 4 dígitos
    REGEX_NUMERO: /^\d{4}$/,
    
    // Regex para validar letras (solo mayúsculas)
    REGEX_LETRA: /^[A-Z]+$/,
};

// ═══════════════════════════════════════════════════════════════════
// LIMPIEZA AUTOMÁTICA
// ═══════════════════════════════════════════════════════════════════

export const LIMPIEZA = {
    // Días de retención de datos
    DIAS_RETENCION: 7,
    
    // La limpieza se ejecuta automáticamente via trigger en DB
    // Ver: supabase/migrations/20241212000003_auto_cleanup_trigger.sql
};

// ═══════════════════════════════════════════════════════════════════
// GITHUB ACTIONS
// ═══════════════════════════════════════════════════════════════════

export const GITHUB_ACTIONS = {
    // Ejecutar X segundos antes del sorteo oficial
    SEGUNDOS_ANTES_SORTEO: 5,
    
    // Cron expressions (UTC)
    CRONS: {
        'La Previa':  '14 13 * * *',  // 10:15 AM ARG (13:15 UTC) - 1min antes
        'Primera':    '59 14 * * *',  // 12:00 PM ARG (15:00 UTC) - 1min antes
        'Matutina':   '59 17 * * *',  // 3:00 PM ARG (18:00 UTC) - 1min antes
        'Vespertina': '59 20 * * *',  // 6:00 PM ARG (21:00 UTC) - 1min antes
        'Nocturna':   '59 23 * * *',  // 9:00 PM ARG (00:00 UTC) - 1min antes
    }
};

// ═══════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════

export const FEATURES = {
    // Habilitar logs verbosos
    VERBOSE_LOGS: true,
    
    // Habilitar métricas/estadísticas
    ENABLE_METRICS: true,
    
    // Habilitar retry agresivo
    AGGRESSIVE_RETRY: true,
    
    // Guardar en DB (false = dry run para testing)
    SAVE_TO_DB: true,
};

// ═══════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════

export default {
    JURISDICCIONES,
    DELAYS,
    RETRY_STRATEGY,
    RETRY_AGGRESSIVE,
    RETRY_CONSERVATIVE,
    LOTBA,
    TURNOS,
    VALIDACIONES,
    LIMPIEZA,
    GITHUB_ACTIONS,
    FEATURES,
};


