// ═══════════════════════════════════════════════════════════════════
// TESTS - Funciones de Base de Datos (Críticas)
// ═══════════════════════════════════════════════════════════════════

import { initDB, closeDB, existeResultado, getCountResultados } from '../lib/database.js';

let testsPasados = 0;
let testsFallidos = 0;
const resultados = [];

function test(nombre, fn) {
    return fn()
        .then(resultado => {
            if (resultado === true || (resultado && resultado.passed)) {
                testsPasados++;
                resultados.push({ nombre, estado: '✅ PASS', detalles: resultado?.detalles || '' });
                console.log(`✅ ${nombre}`);
            } else {
                testsFallidos++;
                resultados.push({ nombre, estado: '❌ FAIL', detalles: resultado?.error || String(resultado) });
                console.log(`❌ ${nombre}: ${resultado?.error || resultado}`);
            }
        })
        .catch(error => {
            testsFallidos++;
            resultados.push({ nombre, estado: '❌ ERROR', detalles: error.message });
            console.log(`❌ ${nombre}: ${error.message}`);
        });
}

function assert(condicion, mensaje) {
    if (!condicion) {
        throw new Error(mensaje || 'Assertion failed');
    }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 TESTS - Funciones de Base de Datos');
console.log('═══════════════════════════════════════════════════════════════\n');

// Verificar que DATABASE_URL esté configurado
if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL no configurado. Algunos tests se saltarán.\n');
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

async function main() {
    await Promise.all([
        test('Inicializar conexión a DB', async () => {
            try {
                const sql = initDB();
                assert(sql !== null, 'Conexión debe inicializarse');
                return { passed: true, detalles: 'Conexión a DB inicializada correctamente' };
            } catch (error) {
                if (error.message.includes('DATABASE_URL')) {
                    return { passed: false, error: 'DATABASE_URL no configurado (test skip)' };
                }
                throw error;
            }
        }),
        test('Obtener count de resultados', async () => {
            try {
                const count = await getCountResultados();
                assert(typeof count === 'number', `Count debe ser número, es ${typeof count}`);
                assert(count >= 0, `Count debe ser >= 0, es ${count}`);
                return { passed: true, detalles: `Total de registros en DB: ${count}` };
            } catch (error) {
                if (error.message.includes('DATABASE_URL') || error.message.includes('Tenant')) {
                    return { passed: false, error: 'DB no disponible (test skip)' };
                }
                throw error;
            }
        }),
        test('Verificar existencia de resultado', async () => {
            try {
                const existe = await existeResultado('Ciudad', '51780', '2025-12-13');
                assert(typeof existe === 'boolean', `Resultado debe ser boolean, es ${typeof existe}`);
                return { 
                    passed: true, 
                    detalles: `Ciudad sorteo 51780 existe: ${existe ? 'Sí' : 'No'}` 
                };
            } catch (error) {
                if (error.message.includes('DATABASE_URL') || error.message.includes('Tenant')) {
                    return { passed: false, error: 'DB no disponible (test skip)' };
                }
                throw error;
            }
        }),
        test('Verificar estructura de tabla', async () => {
            try {
                const sql = initDB();
                const resultado = await sql`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'quiniela_resultados'
                    ORDER BY ordinal_position
                `;
                
                const columnas = resultado.map(r => r.column_name);
                const esperadas = ['id', 'jurisdiccion', 'sorteo_id', 'fecha', 'turno', 'numeros', 'letras', 'cabeza', 'created_at'];
                
                esperadas.forEach(col => {
                    assert(columnas.includes(col), `Columna '${col}' no encontrada`);
                });
                
                return { 
                    passed: true, 
                    detalles: `Tabla tiene ${columnas.length} columnas. Estructura correcta.` 
                };
            } catch (error) {
                if (error.message.includes('DATABASE_URL') || error.message.includes('Tenant')) {
                    return { passed: false, error: 'DB no disponible (test skip)' };
                }
                throw error;
            }
        })
    ]);

    await closeDB();

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
    } else {
        console.log('\n🎉 Todos los tests pasaron exitosamente!');
    }

    process.exit(testsFallidos > 0 ? 1 : 0);
}

main();
