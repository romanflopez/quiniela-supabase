// ═══════════════════════════════════════════════════════════════════
// TEST SIMPLE - Sin dependencias de DB, solo fetch y parse
// ═══════════════════════════════════════════════════════════════════

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

console.log('🧪 TEST SIMPLE - Verificando scraping básico\n');

// Test 1: Obtener sorteos disponibles
async function testObtenerSorteos() {
    console.log('TEST 1: Obtener sorteos de LOTBA');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
        const response = await fetch('https://quiniela.loteriadelaciudad.gob.ar/');
        const html = await response.text();
        const $ = cheerio.load(html);
        
        let count = 0;
        $('select#valor3 option, option').each((_, el) => {
            const text = $(el).text();
            if (text.includes('Sorteo')) {
                if (count < 5) {
                    console.log(`  📋 ${text.trim()}`);
                }
                count++;
            }
        });
        
        console.log(`✅ ${count} sorteos encontrados\n`);
        return count > 0;
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}\n`);
        return false;
    }
}

// Test 2: Scrapear BsAs sorteo específico
async function testScrapearBsAs() {
    console.log('TEST 2: Scrapear BsAs (sorteo 51774)');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
        const params = new URLSearchParams({
            codigo: '0080',
            juridiccion: '53',  // BsAs
            sorteo: '51774'
        });
        
        const response = await fetch('https://quiniela.loteriadelaciudad.gob.ar/resultadosQuiniela/consultaResultados.php', {
            method: 'POST',
            body: params
        });
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const numeros = [];
        $('.infoJuego td div').each((_, el) => {
            const text = $(el).text().trim();
            const classes = $(el).attr('class') || '';
            
            if (!classes.includes('pos') && /^\d{4}$/.test(text)) {
                numeros.push(text);
            }
        });
        
        console.log(`  Números encontrados: ${numeros.length}`);
        console.log(`  Primeros 5: ${numeros.slice(0, 5).join(', ')}`);
        console.log(`  Cabeza: ${numeros[0]}`);
        
        if (numeros.length === 20) {
            console.log(`✅ Scraping exitoso\n`);
            return true;
        } else {
            console.log(`⚠️ Solo ${numeros.length}/20 números\n`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}\n`);
        return false;
    }
}

// Test 3: Scrapear Ciudad (con letras)
async function testScrapearCiudad() {
    console.log('TEST 3: Scrapear Ciudad (sorteo 51774)');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
        const params = new URLSearchParams({
            codigo: '0080',
            juridiccion: '51',  // Ciudad
            sorteo: '51774'
        });
        
        const response = await fetch('https://quiniela.loteriadelaciudad.gob.ar/resultadosQuiniela/consultaResultados.php', {
            method: 'POST',
            body: params
        });
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const numeros = [];
        const letras = [];
        
        $('.infoJuego td div').each((_, el) => {
            const text = $(el).text().trim();
            const classes = $(el).attr('class') || '';
            
            if (classes.includes('pos')) return;
            
            // Solo tomar los primeros 20 números (evita duplicados de columnas)
            if (/^\d{4}$/.test(text)) {
                if (numeros.length < 20) {
                    numeros.push(text);
                }
            } else if (text.length > 0 && /^[A-Z]+$/.test(text)) {
                // Solo tomar el primer grupo de letras
                if (letras.length === 0) {
                    for (const letra of text) {
                        letras.push(letra);
                    }
                }
            }
        });
        
        console.log(`  Números: ${numeros.length}`);
        console.log(`  Letras: ${letras.length} (${letras.join('')})`);
        console.log(`  Cabeza: ${numeros[0]}`);
        
        if (numeros.length === 20) {
            console.log(`✅ Scraping exitoso\n`);
            return true;
        } else {
            console.log(`⚠️ Solo ${numeros.length}/20 números\n`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}\n`);
        return false;
    }
}

// Ejecutar tests
async function runTests() {
    const results = [];
    
    results.push(await testObtenerSorteos());
    results.push(await testScrapearBsAs());
    results.push(await testScrapearCiudad());
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('═══════════════════════════════════════════════════════');
    if (passed === total) {
        console.log(`✅ TODOS LOS TESTS PASARON (${passed}/${total})`);
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n✅ La arquitectura modular está lista');
        console.log('✅ El scraping funciona correctamente');
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('  1. Usar Git Bash: cd scripts && npm install');
        console.log('  2. Configurar DATABASE_URL');
        console.log('  3. npm test (test completo con DB)');
        console.log('  4. npm run scrape:nocturna (test real)');
    } else {
        console.log(`⚠️ ${passed}/${total} tests pasaron`);
    }
    console.log('═══════════════════════════════════════════════════════');
}

runTests();

