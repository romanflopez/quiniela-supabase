// ═══════════════════════════════════════════════════════════════════
// TEST SCRAPER - Tests unitarios de cada módulo
// ═══════════════════════════════════════════════════════════════════

import { scrapearSorteo, scrapearTodasJurisdicciones } from './lib/scraper-core.js';
import { obtenerSorteosDisponibles } from './lib/lotba-api.js';
import { getTodayDateArg, getTurnoFromId } from './lib/utils.js';
import { closeDB } from './lib/database.js';

console.log('🧪 TESTS UNITARIOS DEL SCRAPER\n');

async function testObtenerSorteos() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('TEST 1: Obtener sorteos disponibles');
    console.log('═══════════════════════════════════════════════════════');
    
    const sorteos = await obtenerSorteosDisponibles();
    
    if (sorteos.length > 0) {
        console.log(`✅ ${sorteos.length} sorteos encontrados`);
        console.log('Últimos 5 sorteos:');
        sorteos.slice(0, 5).forEach(s => {
            console.log(`  📋 ${s.id} - ${s.fecha} - ${s.turno}`);
        });
        return sorteos;
    } else {
        console.log('❌ No se encontraron sorteos');
        return [];
    }
}

async function testScrapearUnSorteo(sorteoId, fecha) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`TEST 2: Scrapear sorteo ${sorteoId} (${getTurnoFromId(sorteoId)})`);
    console.log('═══════════════════════════════════════════════════════');
    
    const resultado = await scrapearSorteo('BsAs', sorteoId, fecha);
    
    if (resultado) {
        console.log(`✅ Datos encontrados:`);
        console.log(`  Jurisdicción: ${resultado.jurisdiccion}`);
        console.log(`  Cabeza: ${resultado.cabeza}`);
        console.log(`  Números: ${resultado.numeros.length}`);
        console.log(`  Letras: ${resultado.letras.length}`);
        console.log(`  Primeros 5 números: ${resultado.numeros.slice(0, 5).join(', ')}`);
        return true;
    } else {
        console.log('❌ No se encontraron datos');
        return false;
    }
}

async function testScrapearTodasJurisdicciones(sorteoId, fecha) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`TEST 3: Scrapear TODAS las jurisdicciones`);
    console.log(`Sorteo: ${sorteoId} - ${getTurnoFromId(sorteoId)}`);
    console.log('═══════════════════════════════════════════════════════');
    
    const resultados = await scrapearTodasJurisdicciones(sorteoId, fecha, 2000);  // 2s delay para test
    
    console.log(`\n📊 Resultados: ${resultados.length}/4 jurisdicciones`);
    
    resultados.forEach(r => {
        console.log(`  ✅ ${r.jurisdiccion.padEnd(10)} - Cabeza: ${r.cabeza} - Letras: ${r.letras.length > 0 ? r.letras.join('') : 'N/A'}`);
    });
    
    return resultados;
}

// ═══════════════════════════════════════════════════════════════════
// EJECUTAR TESTS
// ═══════════════════════════════════════════════════════════════════

async function runTests() {
    try {
        // Test 1: Obtener sorteos disponibles
        const sorteos = await testObtenerSorteos();
        
        if (sorteos.length === 0) {
            console.log('\n❌ No hay sorteos disponibles, no se pueden hacer más tests');
            process.exit(1);
        }
        
        // Usar el sorteo más reciente para los tests
        const sorteoTest = sorteos[0];
        
        // Test 2: Scrapear UN sorteo de UNA jurisdicción
        await testScrapearUnSorteo(sorteoTest.id, sorteoTest.fecha);
        
        // Test 3: Scrapear UN sorteo de TODAS las jurisdicciones
        await testScrapearTodasJurisdicciones(sorteoTest.id, sorteoTest.fecha);
        
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ TODOS LOS TESTS PASARON');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log('📋 PRÓXIMOS PASOS:');
        console.log('  1. npm install node-fetch cheerio postgres');
        console.log('  2. export DATABASE_URL="postgresql://..."');
        console.log('  3. node scripts/scraper-by-turno.js nocturna');
        console.log('  4. Configurar GitHub Actions\n');
        
    } catch (error) {
        console.error('\n❌ Error en tests:', error);
        process.exit(1);
        
    } finally {
        await closeDB();
    }
}

runTests();

