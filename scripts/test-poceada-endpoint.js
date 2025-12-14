// Script temporal para investigar el endpoint de Poceada
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const POCEADA_PAGE = 'https://poceada.loteriadelaciudad.gob.ar/';
const POCEADA_API = 'https://poceada.loteriadelaciudad.gob.ar/resultadosPoceada/consultaResultados.php';
const QUINIELA_API = 'https://quiniela.loteriadelaciudad.gob.ar/resultadosQuiniela/consultaResultados.php';

async function test() {
    console.log('1. Obteniendo página de Poceada...');
    const pageHtml = await fetch(POCEADA_PAGE).then(r => r.text());
    const $ = cheerio.load(pageHtml);
    
    // Buscar select #valor3
    const select = $('#valor3');
    console.log('Select #valor3 encontrado:', select.length > 0);
    
    if (select.length > 0) {
        const firstOption = select.find('option').first();
        const sorteoId = firstOption.attr('value');
        const text = firstOption.text();
        console.log('Primer sorteo:', sorteoId, '-', text);
        
        // Probar endpoint de Poceada
        console.log('\n2. Probando endpoint de Poceada...');
        const params1 = new URLSearchParams({ codigo: '0080', sorteo: sorteoId });
        const result1 = await fetch(POCEADA_API, {
            method: 'POST',
            body: params1,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(r => r.text());
        console.log('Resultado (primeros 500 chars):', result1.substring(0, 500));
        
        // Probar con jurisdicción
        console.log('\n3. Probando endpoint de Poceada con jurisdicción...');
        const params2 = new URLSearchParams({ codigo: '0080', juridiccion: '51', sorteo: sorteoId });
        const result2 = await fetch(POCEADA_API, {
            method: 'POST',
            body: params2,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(r => r.text());
        console.log('Resultado (primeros 500 chars):', result2.substring(0, 500));
        
        // Probar endpoint de Quiniela con Ciudad (51) y sorteo Nocturna
        console.log('\n4. Probando endpoint de Quiniela (Ciudad Nocturna)...');
        // Buscar sorteo Nocturna (termina en 5 o 0)
        const match = text.match(/Sorteo:\s*(\d+)/);
        if (match) {
            const sorteoNum = match[1];
            // Si el sorteo de Poceada es 9493, buscar Quiniela Nocturna del mismo día
            // Los sorteos de Quiniela Nocturna terminan en 5 o 0
            const params3 = new URLSearchParams({ codigo: '0080', juridiccion: '51', sorteo: '51780' }); // Sorteo Nocturna ejemplo
            const result3 = await fetch(QUINIELA_API, {
                method: 'POST',
                body: params3,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(r => r.text());
            
            const $3 = cheerio.load(result3);
            const numeros = [];
            $3('.infoJuego td div').each((_, el) => {
                const text = $3(el).text().trim();
                const classes = $3(el).attr('class') || '';
                if (!classes.includes('pos') && /^\d{4}$/.test(text) && numeros.length < 20) {
                    numeros.push(text);
                }
            });
            console.log('Números encontrados:', numeros.length, '- Primeros 5:', numeros.slice(0, 5));
        }
    }
}

test().catch(console.error);
