// Script para probar diferentes parámetros del endpoint de Poceada
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const POCEADA_API = 'https://poceada.loteriadelaciudad.gob.ar/resultadosPoceada/consultaResultados.php';
const sorteoId = '9493';

const pruebas = [
    { codigo: '0080', sorteo: sorteoId },
    { codigo: '0082', sorteo: sorteoId },
    { codigo: '0080', juridiccion: '51', sorteo: sorteoId },
    { codigo: '0082', juridiccion: '51', sorteo: sorteoId },
    { codigo: '0080', juridiccion: '51', sorteo: sorteoId, valor3: sorteoId },
];

async function probar(params, nombre) {
    console.log(`\n🔍 Probando: ${nombre}`);
    console.log('   Parámetros:', params);
    
    const formParams = new URLSearchParams(params);
    const response = await fetch(POCEADA_API, {
        method: 'POST',
        body: formParams,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const html = await response.text();
    console.log('   Status:', response.status);
    console.log('   HTML length:', html.length);
    
    if (html.includes('No existe Sorteo')) {
        console.log('   ❌ No existe sorteo');
        return null;
    }
    
    const $ = cheerio.load(html);
    
    // Buscar números en diferentes estructuras
    const numeros = [];
    const letras = [];
    
    // Estructura 1: .content-juego .infoJuego table td
    $('.content-juego .infoJuego table td, .infoJuego table td').each((_, el) => {
        const text = $(el).text().trim();
        const classes = $(el).attr('class') || '';
        
        if (classes.includes('letras') || text.includes('LETRAS:')) {
            const match = text.match(/LETRAS:\s*([A-Z]+)/i);
            if (match && letras.length === 0) {
                letras.push(...match[1].split(''));
            }
            return;
        }
        
        if (/^\d{2}$/.test(text)) {
            numeros.push(text.padStart(4, '0'));
        } else if (/^\d{4}$/.test(text)) {
            numeros.push(text);
        }
    });
    
    console.log('   ✅ Números encontrados:', numeros.length, '- Primeros 5:', numeros.slice(0, 5));
    console.log('   ✅ Letras encontradas:', letras.length > 0 ? letras.join('') : 'ninguna');
    
    if (numeros.length === 20) {
        console.log('   🎉 ¡ÉXITO! Encontrados 20 números');
        return { params, numeros, letras };
    }
    
    return null;
}

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 PROBANDO PARÁMETROS DE POCEADA');
    console.log('═══════════════════════════════════════════════════════');
    
    for (let i = 0; i < pruebas.length; i++) {
        const resultado = await probar(pruebas[i], `Prueba ${i + 1}`);
        if (resultado) {
            console.log('\n✅ PARÁMETROS CORRECTOS ENCONTRADOS:');
            console.log(JSON.stringify(resultado.params, null, 2));
            console.log('\nNúmeros:', resultado.numeros);
            console.log('Letras:', resultado.letras);
            break;
        }
        await new Promise(r => setTimeout(r, 1000));
    }
}

main().catch(console.error);
