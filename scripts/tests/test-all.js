// ═══════════════════════════════════════════════════════════════════
// TESTS - Ejecutar todos los tests con observabilidad
// ═══════════════════════════════════════════════════════════════════

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tests = [
    { nombre: 'Parsing HTML', archivo: 'test-parsing.js' },
    { nombre: 'Funciones Utilitarias', archivo: 'test-utils.js' },
    { nombre: 'Base de Datos', archivo: 'test-database.js' },
    { nombre: 'Sistema de Métricas', archivo: 'test-metrics.js' }
];

let totalPasados = 0;
let totalFallidos = 0;
const resultados = [];

function ejecutarTest(test) {
    return new Promise((resolve) => {
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`🧪 Ejecutando: ${test.nombre}`);
        console.log(`${'═'.repeat(60)}\n`);

        const proceso = spawn('node', [join(__dirname, test.archivo)], {
            cwd: join(__dirname, '..'),
            env: { ...process.env },
            stdio: 'inherit'
        });

        proceso.on('close', (code) => {
            if (code === 0) {
                totalPasados++;
                resultados.push({ test: test.nombre, estado: '✅ PASS' });
            } else {
                totalFallidos++;
                resultados.push({ test: test.nombre, estado: '❌ FAIL', codigo: code });
            }
            resolve();
        });
    });
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🧪 SUITE DE TESTS COMPLETA');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📋 Tests a ejecutar: ${tests.length}`);
    console.log(`⏰ Inicio: ${new Date().toISOString()}\n`);

    const inicio = Date.now();

    for (const test of tests) {
        await ejecutarTest(test);
    }

    const duracion = ((Date.now() - inicio) / 1000).toFixed(2);

    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESUMEN FINAL');
    console.log('═'.repeat(60));
    console.log(`✅ Tests pasados: ${totalPasados}/${tests.length}`);
    console.log(`❌ Tests fallidos: ${totalFallidos}/${tests.length}`);
    console.log(`📈 Tasa de éxito: ${((totalPasados / tests.length) * 100).toFixed(1)}%`);
    console.log(`⏱️  Duración total: ${duracion}s`);

    if (totalFallidos > 0) {
        console.log('\n❌ TESTS FALLIDOS:');
        resultados.filter(r => r.estado === '❌ FAIL').forEach(r => {
            console.log(`  ${r.estado} ${r.test}`);
        });
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`⏰ Fin: ${new Date().toISOString()}`);
    console.log('═'.repeat(60));

    process.exit(totalFallidos > 0 ? 1 : 0);
}

main();

