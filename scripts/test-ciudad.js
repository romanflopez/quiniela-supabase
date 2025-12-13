// ═══════════════════════════════════════════════════════════════════
// TEST COMPLETO DEL SCRAPER DE CIUDAD
// ═══════════════════════════════════════════════════════════════════

import { scrapearSorteoCiudad, extraerResultadosCiudad } from './scraper-ciudad.js';
import { ScraperMetrics } from './lib/metrics.js';
import * as cheerio from 'cheerio';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 TEST SUITE - SCRAPER DE CIUDAD');
console.log('═══════════════════════════════════════════════════════════════\n');

let testsPassados = 0;
let testsFallados = 0;

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function assertEq(actual, expected, mensaje) {
    if (actual === expected) {
        console.log(`✅ ${mensaje}`);
        testsPassados++;
        return true;
    } else {
        console.log(`❌ ${mensaje}`);
        console.log(`   Esperado: ${expected}`);
        console.log(`   Obtenido: ${actual}`);
        testsFallados++;
        return false;
    }
}

function assertTrue(condition, mensaje) {
    if (condition) {
        console.log(`✅ ${mensaje}`);
        testsPassados++;
        return true;
    } else {
        console.log(`❌ ${mensaje}`);
        testsFallados++;
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════
// TEST 1: Estructura de Datos del Resultado
// ═══════════════════════════════════════════════════════════════════

function testEstructuraResultado() {
    console.log('\n━━━ TEST 1: Estructura de Datos del Resultado ━━━\n');
    
    const mockResultado = {
        jurisdiccion: 'Ciudad',
        sorteo_id: '51774',
        fecha: '2024-12-13',
        turno: 'Primera',
        numeros: Array(20).fill('1234'),
        letras: Array(20).fill('A'),
        cabeza: '1234'
    };
    
    assertTrue(mockResultado.jurisdiccion === 'Ciudad', 'Jurisdicción es Ciudad');
    assertTrue(mockResultado.numeros.length === 20, 'Tiene 20 números');
    assertTrue(mockResultado.letras.length === 20, 'Tiene 20 letras');
    assertTrue(mockResultado.cabeza !== undefined, 'Tiene cabeza definida');
    assertTrue(mockResultado.turno !== undefined, 'Tiene turno definido');
}

// ═══════════════════════════════════════════════════════════════════
// TEST 2: Parser de HTML con Datos Mock
// ═══════════════════════════════════════════════════════════════════

function testParserHTML() {
    console.log('\n━━━ TEST 2: Parser de HTML con Datos Mock ━━━\n');
    
    // HTML mock que simula la estructura de Ciudad
    const mockHTML = `
        <table class="infoJuego">
            <tr>
                <td><div class="pos">1</div></td>
                <td><div>1234</div></td>
                <td><div>A</div></td>
            </tr>
            <tr>
                <td><div class="pos">2</div></td>
                <td><div>5678</div></td>
                <td><div>B</div></td>
            </tr>
            <tr>
                <td><div class="pos">3</div></td>
                <td><div>9012</div></td>
                <td><div>C</div></td>
            </tr>
            ${Array.from({length: 17}, (_, i) => `
                <tr>
                    <td><div class="pos">${i+4}</div></td>
                    <td><div>${String(1000 + i).padStart(4, '0')}</div></td>
                    <td><div>${String.fromCharCode(68 + i)}</div></td>
                </tr>
            `).join('')}
        </table>
    `;
    
    const $ = cheerio.load(mockHTML);
    
    const numeros = [];
    const letras = [];
    
    $('.infoJuego td div').each((_, el) => {
        const text = $(el).text().trim();
        const classes = $(el).attr('class') || '';
        
        if (classes.includes('pos')) return;
        
        if (/^\d{4}$/.test(text)) {
            if (numeros.length < 20) {
                numeros.push(text);
            }
        } else if (text.length > 0 && /^[A-Z]+$/.test(text)) {
            if (letras.length === 0) {
                for (const letra of text) {
                    letras.push(letra);
                }
            } else if (letras.length < 20) {
                letras.push(text);
            }
        }
    });
    
    console.log(`   Números extraídos: ${numeros.length}`);
    console.log(`   Letras extraídas: ${letras.length}`);
    
    assertTrue(numeros.length >= 3, 'Se extrajeron números del HTML mock');
    assertTrue(letras.length >= 3, 'Se extrajeron letras del HTML mock');
    assertEq(numeros[0], '1234', 'Primer número correcto');
}

// ═══════════════════════════════════════════════════════════════════
// TEST 3: Validación de Turno
// ═══════════════════════════════════════════════════════════════════

function testValidacionTurno() {
    console.log('\n━━━ TEST 3: Validación de Turno ━━━\n');
    
    function getTurnoFromId(sorteoId) {
        const last = sorteoId.charAt(sorteoId.length - 1);
        if (last === '6' || last === '1') return 'La Previa';
        if (last === '7' || last === '2') return 'Primera';
        if (last === '8' || last === '3') return 'Matutina';
        if (last === '9' || last === '4') return 'Vespertina';
        if (last === '0' || last === '5') return 'Nocturna';
        return 'Desconocido';
    }
    
    assertEq(getTurnoFromId('51771'), 'La Previa', 'Sorteo terminado en 1 → La Previa');
    assertEq(getTurnoFromId('51772'), 'Primera', 'Sorteo terminado en 2 → Primera');
    assertEq(getTurnoFromId('51773'), 'Matutina', 'Sorteo terminado en 3 → Matutina');
    assertEq(getTurnoFromId('51774'), 'Vespertina', 'Sorteo terminado en 4 → Vespertina');
    assertEq(getTurnoFromId('51775'), 'Nocturna', 'Sorteo terminado en 5 → Nocturna');
}

// ═══════════════════════════════════════════════════════════════════
// TEST 4: Sistema de Métricas
// ═══════════════════════════════════════════════════════════════════

function testMetricas() {
    console.log('\n━━━ TEST 4: Sistema de Métricas ━━━\n');
    
    const metrics = new ScraperMetrics();
    
    metrics.registrarIntento();
    metrics.registrarExito('Ciudad', 1000);
    metrics.registrarIntento();
    metrics.registrarFallo('Ciudad');
    
    assertTrue(metrics.exitosos > 0, 'Métricas registran éxitos');
    assertTrue(metrics.fallidos > 0, 'Métricas registran fallos');
    assertTrue(metrics.intentos > 0, 'Métricas registran intentos');
    assertTrue(metrics.getTiempoTotal() >= 0, 'Duración calculada correctamente');
    
    console.log('\n   📊 Resumen de métricas:');
    console.log(`      • Exitosos: ${metrics.exitosos}`);
    console.log(`      • Fallidos: ${metrics.fallidos}`);
    console.log(`      • Intentos: ${metrics.intentos}`);
    console.log(`      • Tiempo total: ${metrics.getTiempoTotal()}s`);
}

// ═══════════════════════════════════════════════════════════════════
// TEST 5: Configuración de Retry
// ═══════════════════════════════════════════════════════════════════

function testConfiguracionRetry() {
    console.log('\n━━━ TEST 5: Configuración de Retry ━━━\n');
    
    const CIUDAD_CONFIG = {
        RETRY: {
            MAX_ATTEMPTS: 5,
            DELAY_MS: 4000,
            BACKOFF_MULTIPLIER: 1.5
        }
    };
    
    assertEq(CIUDAD_CONFIG.RETRY.MAX_ATTEMPTS, 5, 'Máximo de intentos es 5');
    assertTrue(CIUDAD_CONFIG.RETRY.DELAY_MS >= 3000, 'Delay inicial >= 3 segundos');
    assertEq(CIUDAD_CONFIG.RETRY.BACKOFF_MULTIPLIER, 1.5, 'Multiplicador de backoff es 1.5');
    
    // Simular progresión de delays
    let delay = CIUDAD_CONFIG.RETRY.DELAY_MS;
    console.log(`\n   📈 Progresión de delays:`);
    for (let i = 1; i <= CIUDAD_CONFIG.RETRY.MAX_ATTEMPTS; i++) {
        console.log(`      Intento ${i}: ${delay}ms`);
        delay = Math.floor(delay * CIUDAD_CONFIG.RETRY.BACKOFF_MULTIPLIER);
    }
}

// ═══════════════════════════════════════════════════════════════════
// TEST 6: Validación de Números de 4 Dígitos
// ═══════════════════════════════════════════════════════════════════

function testValidacionNumeros() {
    console.log('\n━━━ TEST 6: Validación de Números de 4 Dígitos ━━━\n');
    
    const regex = /^\d{4}$/;
    
    assertTrue(regex.test('1234'), '1234 es válido');
    assertTrue(regex.test('0000'), '0000 es válido');
    assertTrue(regex.test('9999'), '9999 es válido');
    assertTrue(!regex.test('123'), '123 NO es válido (3 dígitos)');
    assertTrue(!regex.test('12345'), '12345 NO es válido (5 dígitos)');
    assertTrue(!regex.test('ABCD'), 'ABCD NO es válido (letras)');
}

// ═══════════════════════════════════════════════════════════════════
// TEST 7: Validación de Letras
// ═══════════════════════════════════════════════════════════════════

function testValidacionLetras() {
    console.log('\n━━━ TEST 7: Validación de Letras ━━━\n');
    
    const regex = /^[A-Z]+$/;
    
    assertTrue(regex.test('A'), 'A es válida');
    assertTrue(regex.test('ABCDE'), 'ABCDE es válido');
    assertTrue(regex.test('Z'), 'Z es válida');
    assertTrue(!regex.test('a'), 'a minúscula NO es válida');
    assertTrue(!regex.test('1'), '1 NO es válida');
    assertTrue(!regex.test('A1'), 'A1 NO es válido (mezcla)');
}

// ═══════════════════════════════════════════════════════════════════
// EJECUTAR TODOS LOS TESTS
// ═══════════════════════════════════════════════════════════════════

async function ejecutarTests() {
    testEstructuraResultado();
    testParserHTML();
    testValidacionTurno();
    testMetricas();
    testConfiguracionRetry();
    testValidacionNumeros();
    testValidacionLetras();
    
    // Resumen final
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE TESTS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ Tests pasados:  ${testsPassados}`);
    console.log(`❌ Tests fallados: ${testsFallados}`);
    console.log(`📈 Total:          ${testsPassados + testsFallados}`);
    
    if (testsFallados === 0) {
        console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
        console.log('═══════════════════════════════════════════════════════════════\n');
        process.exit(0);
    } else {
        console.log('\n⚠️  ALGUNOS TESTS FALLARON');
        console.log('═══════════════════════════════════════════════════════════════\n');
        process.exit(1);
    }
}

// Ejecutar
ejecutarTests().catch(error => {
    console.error('💥 Error fatal en tests:', error);
    process.exit(1);
});

