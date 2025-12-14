// ═══════════════════════════════════════════════════════════════════
// TESTS - Parsing de HTML (Función Crítica)
// ═══════════════════════════════════════════════════════════════════

import { extraerResultados } from '../lib/lotba-api.js';

// HTML de ejemplo real (basado en el que proporcionaste)
const HTML_EJEMPLO = `
<div class="content-loto">
    <div class="infoJuego">
        <table style="width:100%;">
            <tbody>
                <tr>
                    <td><div class="pos">01</div><div>4702</div></td>
                    <td><div class="pos">06</div><div>1020</div></td>
                    <td><div class="pos">11</div><div>5520</div></td>
                    <td><div class="pos">16</div><div>3118</div></td>
                </tr>
                <tr>
                    <td><div class="pos">02</div><div>9763</div></td>
                    <td><div class="pos">07</div><div>9211</div></td>
                    <td><div class="pos">12</div><div>1862</div></td>
                    <td><div class="pos">17</div><div>4269</div></td>
                </tr>
                <tr>
                    <td><div class="pos">03</div><div>1100</div></td>
                    <td><div class="pos">08</div><div>8106</div></td>
                    <td><div class="pos">13</div><div>6297</div></td>
                    <td><div class="pos">18</div><div>8281</div></td>
                </tr>
                <tr>
                    <td><div class="pos">04</div><div>3901</div></td>
                    <td><div class="pos">09</div><div>3753</div></td>
                    <td><div class="pos">14</div><div>9393</div></td>
                    <td><div class="pos">19</div><div>2534</div></td>
                </tr>
                <tr>
                    <td><div class="pos">05</div><div>1467</div></td>
                    <td><div class="pos">10</div><div>1185</div></td>
                    <td><div class="pos">15</div><div>6569</div></td>
                    <td><div class="pos">20</div><div>3245</div></td>
                </tr>
                <tr>
                    <td></td>
                    <td colspan="3">
                        <div class="pos">LETRAS:</div>
                        <div style="text-align:right;width: 28vw;padding-right: 6vw;">UCGP</div>
                    </td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
`;

let testsPasados = 0;
let testsFallidos = 0;
const resultados = [];

function test(nombre, fn) {
    try {
        const resultado = fn();
        if (resultado === true || (resultado && resultado.passed)) {
            testsPasados++;
            resultados.push({ nombre, estado: '✅ PASS', detalles: resultado?.detalles || '' });
            console.log(`✅ ${nombre}`);
        } else {
            testsFallidos++;
            resultados.push({ nombre, estado: '❌ FAIL', detalles: resultado?.error || String(resultado) });
            console.log(`❌ ${nombre}: ${resultado?.error || resultado}`);
        }
    } catch (error) {
        testsFallidos++;
        resultados.push({ nombre, estado: '❌ ERROR', detalles: error.message });
        console.log(`❌ ${nombre}: ${error.message}`);
    }
}

function assert(condicion, mensaje) {
    if (!condicion) {
        throw new Error(mensaje || 'Assertion failed');
    }
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 TESTS - Parsing de HTML');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test 1: Extraer números correctamente
test('Extraer 20 números del HTML', () => {
    const { numeros } = extraerResultados(HTML_EJEMPLO);
    assert(numeros.length === 20, `Esperado 20 números, obtenidos ${numeros.length}`);
    assert(numeros[0] === '4702', `Primer número debe ser 4702, es ${numeros[0]}`);
    assert(numeros[19] === '3245', `Último número debe ser 3245, es ${numeros[19]}`);
    return { passed: true, detalles: `20 números extraídos correctamente. Cabeza: ${numeros[0]}` };
});

// Test 2: Extraer letras correctamente
test('Extraer letras del HTML', () => {
    const { letras } = extraerResultados(HTML_EJEMPLO);
    assert(letras.length > 0, `Debe haber letras, obtenidas ${letras.length}`);
    assert(letras.includes('U'), 'Debe contener la letra U');
    assert(letras.includes('C'), 'Debe contener la letra C');
    assert(letras.includes('G'), 'Debe contener la letra G');
    assert(letras.includes('P'), 'Debe contener la letra P');
    return { passed: true, detalles: `${letras.length} letras extraídas: ${letras.join('')}` };
});

// Test 3: Validar formato de números
test('Números deben tener 4 dígitos', () => {
    const { numeros } = extraerResultados(HTML_EJEMPLO);
    const todosValidos = numeros.every(n => /^\d{4}$/.test(n));
    assert(todosValidos, 'Todos los números deben tener 4 dígitos');
    return { passed: true, detalles: 'Todos los números tienen formato válido (4 dígitos)' };
});

// Test 4: HTML vacío
test('Manejar HTML vacío', () => {
    const { numeros, letras } = extraerResultados('');
    assert(numeros.length === 0, 'HTML vacío debe retornar array vacío de números');
    assert(letras.length === 0, 'HTML vacío debe retornar array vacío de letras');
    return { passed: true, detalles: 'HTML vacío manejado correctamente' };
});

// Test 5: HTML sin estructura esperada
test('Manejar HTML sin estructura esperada', () => {
    const { numeros, letras } = extraerResultados('<div>Sin estructura</div>');
    assert(Array.isArray(numeros), 'Debe retornar array de números');
    assert(Array.isArray(letras), 'Debe retornar array de letras');
    return { passed: true, detalles: 'HTML sin estructura manejado correctamente' };
});

// Test 6: Verificar que no se dupliquen números
test('No debe haber números duplicados', () => {
    const { numeros } = extraerResultados(HTML_EJEMPLO);
    const unicos = new Set(numeros);
    assert(unicos.size === numeros.length, `Hay ${numeros.length - unicos.size} números duplicados`);
    return { passed: true, detalles: 'No hay números duplicados' };
});

// ═══════════════════════════════════════════════════════════════════
// RESUMEN
// ═══════════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📊 RESUMEN DE TESTS');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`✅ Tests pasados: ${testsPasados}`);
console.log(`❌ Tests fallidos: ${testsFallidos}`);
console.log(`📈 Tasa de éxito: ${((testsPasados / (testsPasados + testsFallidos)) * 100).toFixed(1)}%`);

if (testsFallidos > 0) {
    console.log('\n❌ DETALLES DE FALLOS:');
    resultados.filter(r => r.estado !== '✅ PASS').forEach(r => {
        console.log(`  ${r.estado} ${r.nombre}: ${r.detalles}`);
    });
    process.exit(1);
} else {
    console.log('\n🎉 Todos los tests pasaron exitosamente!');
    process.exit(0);
}

