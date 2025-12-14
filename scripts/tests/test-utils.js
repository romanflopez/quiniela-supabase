// ═══════════════════════════════════════════════════════════════════
// TESTS - Funciones Utilitarias (Críticas)
// ═══════════════════════════════════════════════════════════════════

import { getTurnoFromId, convertDateFormat, getTodayDateArg } from '../lib/utils.js';

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

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 TESTS - Funciones Utilitarias');
console.log('═══════════════════════════════════════════════════════════════\n');

// ═══════════════════════════════════════════════════════════════════
// TESTS: getTurnoFromId
// ═══════════════════════════════════════════════════════════════════

test('getTurnoFromId - La Previa (último dígito 1)', () => {
    const turno = getTurnoFromId('51771');
    assert(turno === 'La Previa', `Esperado 'La Previa', obtenido '${turno}'`);
    return { passed: true, detalles: `ID 51771 → ${turno}` };
});

test('getTurnoFromId - La Previa (último dígito 6)', () => {
    const turno = getTurnoFromId('51776');
    assert(turno === 'La Previa', `Esperado 'La Previa', obtenido '${turno}'`);
    return { passed: true, detalles: `ID 51776 → ${turno}` };
});

test('getTurnoFromId - Primera (último dígito 2)', () => {
    const turno = getTurnoFromId('51772');
    assert(turno === 'Primera', `Esperado 'Primera', obtenido '${turno}'`);
    return { passed: true, detalles: `ID 51772 → ${turno}` };
});

test('getTurnoFromId - Matutina (último dígito 3)', () => {
    const turno = getTurnoFromId('51773');
    assert(turno === 'Matutina', `Esperado 'Matutina', obtenido '${turno}'`);
    return { passed: true, detalles: `ID 51773 → ${turno}` };
});

test('getTurnoFromId - Vespertina (último dígito 4)', () => {
    const turno = getTurnoFromId('51774');
    assert(turno === 'Vespertina', `Esperado 'Vespertina', obtenido '${turno}'`);
    return { passed: true, detalles: `ID 51774 → ${turno}` };
});

test('getTurnoFromId - Nocturna (último dígito 5)', () => {
    const turno = getTurnoFromId('51775');
    assert(turno === 'Nocturna', `Esperado 'Nocturna', obtenido '${turno}'`);
    return { passed: true, detalles: `ID 51775 → ${turno}` };
});

test('getTurnoFromId - Nocturna (último dígito 0)', () => {
    const turno = getTurnoFromId('51770');
    assert(turno === 'Nocturna', `Esperado 'Nocturna', obtenido '${turno}'`);
    return { passed: true, detalles: `ID 51770 → ${turno}` };
});

test('getTurnoFromId - ID inválido (string vacío)', () => {
    const turno = getTurnoFromId('');
    assert(turno === 'Desconocido', `Esperado 'Desconocido', obtenido '${turno}'`);
    return { passed: true, detalles: 'ID inválido (vacío) manejado correctamente' };
});

// ═══════════════════════════════════════════════════════════════════
// TESTS: convertDateFormat
// ═══════════════════════════════════════════════════════════════════

test('convertDateFormat - Formato DD/MM/YYYY', () => {
    const fecha = convertDateFormat('13/12/2025');
    assert(fecha === '2025-12-13', `Esperado '2025-12-13', obtenido '${fecha}'`);
    return { passed: true, detalles: `13/12/2025 → ${fecha}` };
});

test('convertDateFormat - Formato con ceros', () => {
    const fecha = convertDateFormat('01/01/2025');
    assert(fecha === '2025-01-01', `Esperado '2025-01-01', obtenido '${fecha}'`);
    return { passed: true, detalles: `01/01/2025 → ${fecha}` };
});

test('convertDateFormat - Formato inválido', () => {
    const fecha = convertDateFormat('invalid');
    assert(fecha === null, `Esperado null, obtenido '${fecha}'`);
    return { passed: true, detalles: 'Formato inválido manejado correctamente' };
});

// ═══════════════════════════════════════════════════════════════════
// TESTS: getTodayDateArg
// ═══════════════════════════════════════════════════════════════════

test('getTodayDateArg - Formato YYYY-MM-DD', () => {
    const fecha = getTodayDateArg();
    assert(/^\d{4}-\d{2}-\d{2}$/.test(fecha), `Formato inválido: ${fecha}`);
    return { passed: true, detalles: `Fecha actual: ${fecha}` };
});

test('getTodayDateArg - Es fecha válida', () => {
    const fecha = getTodayDateArg();
    const [year, month, day] = fecha.split('-').map(Number);
    assert(year >= 2024 && year <= 2030, `Año inválido: ${year}`);
    assert(month >= 1 && month <= 12, `Mes inválido: ${month}`);
    assert(day >= 1 && day <= 31, `Día inválido: ${day}`);
    return { passed: true, detalles: 'Fecha válida generada' };
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

