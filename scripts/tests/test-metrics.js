// ═══════════════════════════════════════════════════════════════════
// TESTS - Sistema de Métricas y Observabilidad
// ═══════════════════════════════════════════════════════════════════

import { crearMetrics } from '../lib/metrics.js';

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
console.log('🧪 TESTS - Sistema de Métricas');
console.log('═══════════════════════════════════════════════════════════════\n');

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

test('Crear instancia de métricas', () => {
    const metrics = crearMetrics();
    assert(metrics !== null, 'Métricas deben inicializarse');
    assert(typeof metrics.registrarIntento === 'function', 'Debe tener método registrarIntento');
    assert(typeof metrics.registrarExito === 'function', 'Debe tener método registrarExito');
    assert(typeof metrics.registrarFallo === 'function', 'Debe tener método registrarFallo');
    assert(typeof metrics.getReporte === 'function', 'Debe tener método getReporte');
    return { passed: true, detalles: 'Instancia de métricas creada correctamente' };
});

test('Registrar intentos', () => {
    const metrics = crearMetrics();
    metrics.registrarIntento();
    metrics.registrarIntento();
    const reporte = metrics.getReporte();
    assert(reporte.intentos_totales === 2, `Esperado 2 intentos, obtenidos ${reporte.intentos_totales}`);
    return { passed: true, detalles: `2 intentos registrados correctamente` };
});

test('Registrar éxitos', () => {
    const metrics = crearMetrics();
    metrics.registrarIntento();
    metrics.registrarIntento();
    metrics.registrarExito('Ciudad', 100);
    metrics.registrarExito('BsAs', 150);
    const reporte = metrics.getReporte();
    assert(reporte.exitosos === 2, `Esperado 2 éxitos, obtenidos ${reporte.exitosos}`);
    assert(reporte.tasa_exito_pct === 100, `Esperado 100% tasa de éxito, obtenido ${reporte.tasa_exito_pct}%`);
    return { passed: true, detalles: `2 éxitos registrados. Tasa: ${reporte.tasa_exito_pct}%` };
});

test('Registrar fallos', () => {
    const metrics = crearMetrics();
    metrics.registrarIntento();
    metrics.registrarIntento();
    metrics.registrarFallo('SantaFe');
    metrics.registrarFallo('Cordoba');
    const reporte = metrics.getReporte();
    assert(reporte.fallidos === 2, `Esperado 2 fallos, obtenidos ${reporte.fallidos}`);
    return { passed: true, detalles: `2 fallos registrados correctamente` };
});

test('Calcular tasa de éxito', () => {
    const metrics = crearMetrics();
    metrics.registrarIntento();
    metrics.registrarExito('Ciudad', 100);
    metrics.registrarIntento();
    metrics.registrarFallo('BsAs');
    const reporte = metrics.getReporte();
    assert(reporte.tasa_exito_pct === 50, `Esperado 50% tasa de éxito, obtenido ${reporte.tasa_exito_pct}%`);
    return { passed: true, detalles: `Tasa de éxito calculada: ${reporte.tasa_exito_pct}%` };
});

test('Calcular tiempo promedio', () => {
    const metrics = crearMetrics();
    metrics.registrarExito('Ciudad', 100);
    metrics.registrarExito('BsAs', 200);
    metrics.registrarExito('SantaFe', 300);
    const reporte = metrics.getReporte();
    assert(reporte.tiempo_promedio_ms === 200, `Esperado 200ms promedio, obtenido ${reporte.tiempo_promedio_ms}ms`);
    return { passed: true, detalles: `Tiempo promedio: ${reporte.tiempo_promedio_ms}ms` };
});

test('Generar reporte completo', () => {
    const metrics = crearMetrics();
    metrics.registrarIntento();
    metrics.registrarExito('Ciudad', 100);
    metrics.registrarIntento();
    metrics.registrarFallo('BsAs');
    const reporte = metrics.getReporte();
    
    assert(reporte.intentos_totales === 2, 'Reporte debe tener intentos_totales');
    assert(reporte.exitosos === 1, 'Reporte debe tener exitosos');
    assert(reporte.fallidos === 1, 'Reporte debe tener fallidos');
    assert(typeof reporte.tasa_exito_pct === 'number', 'Reporte debe tener tasa_exito_pct');
    assert(typeof reporte.tiempo_promedio_ms === 'number', 'Reporte debe tener tiempo_promedio_ms');
    assert(typeof reporte.por_jurisdiccion === 'object', 'Reporte debe tener por_jurisdiccion');
    
    return { 
        passed: true, 
        detalles: `Reporte completo. Intentos: ${reporte.intentos_totales}, Éxitos: ${reporte.exitosos}, Fallos: ${reporte.fallidos}` 
    };
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

