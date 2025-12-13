// ═══════════════════════════════════════════════════════════════════
// TEST DB COMPLETO - Limpia, scrapea y verifica datos en DB
// ═══════════════════════════════════════════════════════════════════

import { scrapearTodasJurisdicciones } from './lib/scraper-core.js';
import { guardarResultados, initDB, closeDB, getCountResultados } from './lib/database.js';
import { log } from './lib/utils.js';
import { crearMetrics } from './lib/metrics.js';

// Sorteo a testear (debe existir en LOTBA)
const SORTEO_TEST = '51774';
const FECHA_TEST = '2025-12-12';

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║         🧪 TEST DB COMPLETO - 3 PASOS              ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

async function paso1_LimpiarDB() {
    log('🧹', 'PASO 1/3: Limpiando base de datos...');
    
    const db = initDB();
    
    try {
        // Contar registros antes
        const countAntes = await getCountResultados();
        log('📊', `Registros antes: ${countAntes}`);
        
        // Limpiar
        await db`DELETE FROM quiniela_resultados`;
        
        // Verificar
        const countDespues = await getCountResultados();
        log('✅', `Registros después: ${countDespues}`);
        
        if (countDespues === 0) {
            log('✅', 'Base de datos limpia\n');
            return true;
        } else {
            log('❌', 'Error: La DB no se limpió correctamente\n');
            return false;
        }
    } catch (error) {
        log('❌', `Error limpiando DB: ${error.message}\n`);
        return false;
    }
}

async function paso2_ScrapearYGuardar() {
    log('🔍', 'PASO 2/3: Scrapeando datos...');
    
    const metrics = crearMetrics();
    
    try {
        // Scrapear
        log('📥', `Scrapeando sorteo ${SORTEO_TEST} (${FECHA_TEST})...`);
        const resultados = await scrapearTodasJurisdicciones(SORTEO_TEST, FECHA_TEST, 3000);
        
        if (resultados.length === 0) {
            log('❌', 'No se pudieron scrapear datos\n');
            return false;
        }
        
        log('✅', `Scraped: ${resultados.length} jurisdicciones`);
        
        // Guardar en DB
        log('💾', 'Guardando en base de datos...');
        const stats = await guardarResultados(resultados);
        
        log('✅', `Guardados: ${stats.guardados} | Errores: ${stats.errores}`);
        
        // Mostrar resumen
        resultados.forEach((r, i) => {
            console.log(`   ${i + 1}. ${r.jurisdiccion} - Cabeza: ${r.cabeza} (${r.numeros.length} números)`);
        });
        
        console.log('');
        return resultados.length > 0 && stats.guardados > 0;
        
    } catch (error) {
        log('❌', `Error scrapeando: ${error.message}\n`);
        return false;
    }
}

async function paso3_VerificarDB() {
    log('🔎', 'PASO 3/3: Verificando datos en DB...');
    
    const db = initDB();
    
    try {
        // Contar total
        const total = await getCountResultados();
        log('📊', `Total de registros: ${total}`);
        
        // Obtener registros del sorteo test
        const registros = await db`
            SELECT jurisdiccion, id_sorteo, turno, cabeza, 
                   array_length(numeros_oficiales, 1) as num_count,
                   array_length(letras_oficiales, 1) as letra_count
            FROM quiniela_resultados
            WHERE id_sorteo = ${SORTEO_TEST}
            ORDER BY jurisdiccion
        `;
        
        if (registros.length === 0) {
            log('❌', 'No se encontraron registros en DB\n');
            return false;
        }
        
        log('✅', `Encontrados: ${registros.length} registros\n`);
        
        // Mostrar detalles
        console.log('📋 Datos guardados:');
        console.log('─────────────────────────────────────────────────────');
        
        let allValid = true;
        
        registros.forEach((r, i) => {
            const valid = r.num_count === 20;
            const icon = valid ? '✅' : '⚠️';
            
            console.log(`${icon} ${r.jurisdiccion.padEnd(10)} | Cabeza: ${r.cabeza} | Números: ${r.num_count} | Letras: ${r.letra_count || 0}`);
            
            if (!valid) allValid = false;
        });
        
        console.log('─────────────────────────────────────────────────────\n');
        
        if (allValid) {
            log('✅', 'Todos los registros son válidos (20 números)');
        } else {
            log('⚠️', 'Algunos registros tienen datos incompletos');
        }
        
        return allValid && registros.length > 0;
        
    } catch (error) {
        log('❌', `Error verificando DB: ${error.message}\n`);
        return false;
    }
}

async function main() {
    const startTime = Date.now();
    
    try {
        // Verificar DATABASE_URL
        if (!process.env.DATABASE_URL) {
            console.error('❌ ERROR: DATABASE_URL no configurado');
            console.error('');
            console.error('Configúralo así:');
            console.error('  PowerShell: $env:DATABASE_URL="postgresql://..."');
            console.error('  Bash: export DATABASE_URL="postgresql://..."');
            console.error('');
            process.exit(1);
        }
        
        log('🔌', `DATABASE_URL configurado ✅\n`);
        
        // Ejecutar pasos
        const paso1 = await paso1_LimpiarDB();
        if (!paso1) {
            log('❌', 'Falló paso 1');
            process.exit(1);
        }
        
        const paso2 = await paso2_ScrapearYGuardar();
        if (!paso2) {
            log('❌', 'Falló paso 2');
            process.exit(1);
        }
        
        const paso3 = await paso3_VerificarDB();
        if (!paso3) {
            log('❌', 'Falló paso 3');
            process.exit(1);
        }
        
        // Resumen final
        const totalTime = Math.round((Date.now() - startTime) / 1000);
        
        console.log('╔═══════════════════════════════════════════════════════╗');
        console.log('║            ✅ TEST COMPLETADO EXITOSAMENTE           ║');
        console.log('╚═══════════════════════════════════════════════════════╝');
        console.log(`⏱️  Tiempo total: ${totalTime}s`);
        console.log('✅ Base de datos limpia');
        console.log('✅ Datos scrapeados correctamente');
        console.log('✅ Datos guardados en DB');
        console.log('✅ Datos verificados (20 números por jurisdicción)');
        console.log('');
        console.log('🎉 La arquitectura está funcionando perfectamente!');
        console.log('');
        console.log('📋 PRÓXIMOS PASOS:');
        console.log('  1. Verificar en Supabase Dashboard');
        console.log('  2. Test de la API: curl "https://vvtujkedjalepkhbycpv.supabase.co/functions/v1/quiniela-api?sorteo_id=51774"');
        console.log('  3. Configurar GitHub Actions');
        console.log('');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ERROR FATAL:', error.message);
        console.error(error);
        process.exit(1);
        
    } finally {
        await closeDB();
    }
}

main();


