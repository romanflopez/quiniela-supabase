// ═══════════════════════════════════════════════════════════════════
// TEST SORTEO REAL - Scrapea un sorteo sin guardar en DB
// ═══════════════════════════════════════════════════════════════════

import { scrapearTodasJurisdicciones } from './lib/scraper-core.js';
import { getTurnoFromId, log } from './lib/utils.js';

const SORTEO_ID = process.argv[2] || '51774';
const FECHA = process.argv[3] || '2025-12-12';

async function main() {
    const startTime = Date.now();
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🎯 TEST SORTEO REAL - Sorteo: ${SORTEO_ID}`);
    console.log(`   Fecha: ${FECHA} | Turno: ${getTurnoFromId(SORTEO_ID)}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    try {
        // Scrapear todas las jurisdicciones para este sorteo
        const resultados = await scrapearTodasJurisdicciones(SORTEO_ID, FECHA, 3000);
        
        const totalTime = Math.round((Date.now() - startTime) / 1000);
        
        if (resultados.length === 0) {
            log('⚠️', 'No se encontraron datos para este sorteo');
            process.exit(1);
        }
        
        console.log('\n═══════════════════════════════════════════════════════');
        console.log(`✅ RESULTADOS: ${resultados.length}/4 jurisdicciones en ${totalTime}s`);
        console.log('═══════════════════════════════════════════════════════\n');
        
        // Mostrar cada resultado
        resultados.forEach((r, i) => {
            console.log(`${i + 1}. ${r.jurisdiccion.toUpperCase()} (${r.turno})`);
            console.log(`   Cabeza: ${r.cabeza}`);
            console.log(`   Números: ${r.numeros.slice(0, 5).join(', ')}... (${r.numeros.length} total)`);
            if (r.letras.length > 0) {
                console.log(`   Letras: ${r.letras.join('')}`);
            }
            console.log('');
        });
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ SCRAPING EXITOSO - Arquitectura modular funcionando');
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('  1. Configurar DATABASE_URL');
        console.log('  2. Ejecutar con guardado: node scraper-by-sorteo-id.js 51774');
        console.log('  3. Configurar GitHub Actions\n');
        
        process.exit(0);
        
    } catch (error) {
        log('❌', `Error fatal: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

main();


