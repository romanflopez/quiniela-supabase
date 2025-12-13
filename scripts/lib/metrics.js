// ═══════════════════════════════════════════════════════════════════
// METRICS - Estadísticas y métricas del scraper
// ═══════════════════════════════════════════════════════════════════

import { FEATURES } from '../config.js';

/**
 * Clase para trackear métricas de scraping
 */
export class ScraperMetrics {
    constructor() {
        this.startTime = Date.now();
        this.intentos = 0;
        this.exitosos = 0;
        this.fallidos = 0;
        this.porJurisdiccion = {};
        this.tiemposRespuesta = [];
    }

    /**
     * Registrar un intento de scraping
     */
    registrarIntento() {
        this.intentos++;
    }

    /**
     * Registrar un scraping exitoso
     * @param {string} jurisdiccion
     * @param {number} tiempoMs
     */
    registrarExito(jurisdiccion, tiempoMs) {
        this.exitosos++;
        this.tiemposRespuesta.push(tiempoMs);
        
        if (!this.porJurisdiccion[jurisdiccion]) {
            this.porJurisdiccion[jurisdiccion] = { exitosos: 0, fallidos: 0 };
        }
        this.porJurisdiccion[jurisdiccion].exitosos++;
    }

    /**
     * Registrar un scraping fallido
     * @param {string} jurisdiccion
     */
    registrarFallo(jurisdiccion) {
        this.fallidos++;
        
        if (!this.porJurisdiccion[jurisdiccion]) {
            this.porJurisdiccion[jurisdiccion] = { exitosos: 0, fallidos: 0 };
        }
        this.porJurisdiccion[jurisdiccion].fallidos++;
    }

    /**
     * Obtener tiempo total transcurrido en segundos
     */
    getTiempoTotal() {
        return Math.round((Date.now() - this.startTime) / 1000);
    }

    /**
     * Obtener tiempo promedio de respuesta
     */
    getTiempoPromedio() {
        if (this.tiemposRespuesta.length === 0) return 0;
        const suma = this.tiemposRespuesta.reduce((a, b) => a + b, 0);
        return Math.round(suma / this.tiemposRespuesta.length);
    }

    /**
     * Obtener tasa de éxito (%)
     */
    getTasaExito() {
        if (this.intentos === 0) return 0;
        return Math.round((this.exitosos / this.intentos) * 100);
    }

    /**
     * Generar reporte de métricas
     */
    getReporte() {
        return {
            tiempo_total_segundos: this.getTiempoTotal(),
            intentos_totales: this.intentos,
            exitosos: this.exitosos,
            fallidos: this.fallidos,
            tasa_exito_pct: this.getTasaExito(),
            tiempo_promedio_ms: this.getTiempoPromedio(),
            por_jurisdiccion: this.porJurisdiccion
        };
    }

    /**
     * Imprimir reporte en consola
     */
    imprimirReporte() {
        if (!FEATURES.ENABLE_METRICS) return;

        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║              📊 MÉTRICAS DE SCRAPING                 ║');
        console.log('╚═══════════════════════════════════════════════════════╝');
        console.log(`⏱️  Tiempo total: ${this.getTiempoTotal()}s`);
        console.log(`🔄 Intentos: ${this.intentos}`);
        console.log(`✅ Exitosos: ${this.exitosos}`);
        console.log(`❌ Fallidos: ${this.fallidos}`);
        console.log(`📈 Tasa de éxito: ${this.getTasaExito()}%`);
        console.log(`⚡ Tiempo promedio: ${this.getTiempoPromedio()}ms`);
        console.log('\n📍 Por Jurisdicción:');
        Object.entries(this.porJurisdiccion).forEach(([jur, stats]) => {
            const total = stats.exitosos + stats.fallidos;
            const tasa = Math.round((stats.exitosos / total) * 100);
            console.log(`   ${jur.padEnd(10)} → ${stats.exitosos}/${total} (${tasa}%)`);
        });
        console.log('═══════════════════════════════════════════════════════\n');
    }
}

/**
 * Crear nueva instancia de métricas
 */
export function crearMetrics() {
    return new ScraperMetrics();
}

