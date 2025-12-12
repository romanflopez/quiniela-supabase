// @ts-nocheck
// Scraper agresivo con retry progresivo

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import sql from 'npm:postgres@3.4.4'; 
import * as cheerio from 'npm:cheerio@1.0.0-rc.12'; 

const LOTBA_PAGE_URL = 'https://quiniela.loteriadelaciudad.gob.ar/';
const ENDPOINT_URL = 'https://quiniela.loteriadelaciudad.gob.ar/resultadosQuiniela/consultaResultados.php';
const CODIGO_FIJO = '0080';

// 🎯 ESTRATEGIA DE RETRY AGRESIVA
const RETRY_STRATEGY = [
    { attempts: 10, delay: 10000 },  // 10 intentos cada 10s = 100s
    { attempts: 5, delay: 20000 },   // 5 intentos cada 20s = 100s
    { attempts: 5, delay: 30000 }    // 5 intentos cada 30s = 150s
    // Total: ~5.8 minutos máximo
];

const JURISDICCIONES: Record<string, string> = { 
    'Ciudad': '51',
    'BsAs': '53',
    'SantaFe': '72',
    'Cordoba': '55',
    'EntreRios': '64'
};

function getTurnoFromId(sorteoId: string): string {
    const last = sorteoId.charAt(sorteoId.length - 1);
    if (last === '6' || last === '1') return 'La Previa';
    if (last === '7' || last === '2') return 'Primera';
    if (last === '8' || last === '3') return 'Matutina';
    if (last === '9' || last === '4') return 'Vespertina';
    if (last === '0' || last === '5') return 'Nocturna';
    return 'Desconocido';
}

function extractFecha(optionText: string): string | null {
    const match = optionText.match(/Fecha:\s*(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) {
        const [, dd, mm, yyyy] = match;
        return `${yyyy}-${mm}-${dd}`;
    }
    return null;
}

function getTodayDate(): string {
    const now = new Date();
    const argTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
    const yyyy = argTime.getFullYear();
    const mm = String(argTime.getMonth() + 1).padStart(2, '0');
    const dd = String(argTime.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getDateDaysAgo(days: number): string {
    const now = new Date();
    const argTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
    argTime.setDate(argTime.getDate() - days);
    const yyyy = argTime.getFullYear();
    const mm = String(argTime.getMonth() + 1).padStart(2, '0');
    const dd = String(argTime.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

interface SorteoInfo {
    id: string;
    fecha: string;
    turno: string;
}

async function fetchLast7DaysSorteos(): Promise<SorteoInfo[]> {
    try {
        const response = await fetch(LOTBA_PAGE_URL);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const sorteos: SorteoInfo[] = [];
        const cutoffDate = getDateDaysAgo(7);
        
        $('#valor3 option').each((_, el) => {
            const value = $(el).attr('value');
            const text = $(el).text();
            
            if (value && text) {
                const fecha = extractFecha(text);
                if (fecha && fecha >= cutoffDate) {
                    sorteos.push({
                        id: value,
                        fecha: fecha,
                        turno: getTurnoFromId(value)
                    });
                }
            }
        });
        
        return sorteos;
    } catch (error) {
        console.error('Error fetching sorteos:', error);
        return [];
    }
}

interface QuinielaResult {
    jurisdiccion: string;
    id_sorteo: number;
    fecha: string;
    turno: string;
    numeros_oficiales: string[];
    letras_oficiales: string[];
    cabeza: string | null;
}

function extractResults(htmlSnippet: string): { numeros: string[], letras: string[] } {
    const $ = cheerio.load(htmlSnippet);
    const numeros: string[] = [];
    const letras: string[] = [];
    
    $('.infoJuego td > div:not(.pos):not(.letras)').each((_, el) => {
        const t = $(el).text().trim();
        if (t.length === 4) numeros.push(t);
    });
    
    $('.infoJuego .letras').each((_, el) => {
        const t = $(el).text().trim();
        if (t.length > 0) letras.push(t);
    });
    
    return { numeros, letras };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 🎰 RETRY AGRESIVO: Ideal para ludópatas que necesitan el resultado YA
async function fetchResultWithAggressiveRetry(
    jurisdiccion: string,
    codigoJur: string,
    sorteoInfo: SorteoInfo
): Promise<QuinielaResult | null> {
    
    let totalAttempt = 0;
    
    for (const phase of RETRY_STRATEGY) {
        for (let i = 0; i < phase.attempts; i++) {
            totalAttempt++;
            
            try {
                const params = new URLSearchParams();
                params.append('codigo', CODIGO_FIJO);
                params.append('juridiccion', codigoJur);
                params.append('sorteo', sorteoInfo.id);

                const res = await fetch(ENDPOINT_URL, { 
                    method: 'POST',
                    body: params, 
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                
                const html = await res.text();
                const { numeros, letras } = extractResults(html);

                if (numeros.length === 20) { 
                    const timeSpent = Math.round(
                        (RETRY_STRATEGY[0].attempts * RETRY_STRATEGY[0].delay + 
                         (totalAttempt > 10 ? (totalAttempt - 10) * phase.delay : 0)) / 1000
                    );
                    console.log(`✅ ${jurisdiccion} ${sorteoInfo.turno} (${sorteoInfo.fecha}) - Encontrado en intento ${totalAttempt} (~${timeSpent}s)`);
                    
                    return {
                        jurisdiccion,
                        id_sorteo: Number(sorteoInfo.id),
                        fecha: sorteoInfo.fecha,
                        turno: sorteoInfo.turno,
                        numeros_oficiales: numeros,
                        letras_oficiales: letras,
                        cabeza: numeros[0]
                    };
                }
                
                // No hay datos todavía, seguir intentando
                const delaySeconds = phase.delay / 1000;
                console.log(`⏳ [${totalAttempt}/20] ${jurisdiccion} ${sorteoInfo.turno} - Sin datos, esperando ${delaySeconds}s...`);
                
                // No esperar después del último intento
                if (!(i === phase.attempts - 1 && phase === RETRY_STRATEGY[RETRY_STRATEGY.length - 1])) {
                    await wait(phase.delay);
                }
                
            } catch (e) {
                console.error(`❌ [${totalAttempt}] Error ${jurisdiccion} ${sorteoInfo.id}:`, e.message);
                if (!(i === phase.attempts - 1 && phase === RETRY_STRATEGY[RETRY_STRATEGY.length - 1])) {
                    await wait(phase.delay);
                }
            }
        }
    }
    
    console.log(`🚫 ${jurisdiccion} ${sorteoInfo.turno} (${sorteoInfo.fecha}) - SIN DATOS después de 20 intentos (~5 min)`);
    return null;
}

async function saveResultToSupabase(db: any, r: QuinielaResult): Promise<void> {
    try {
        await db`
            insert into quiniela_resultados 
                (jurisdiccion, id_sorteo, fecha, turno, numeros_oficiales, letras_oficiales, cabeza)
            values 
                (${r.jurisdiccion}, ${r.id_sorteo}, ${r.fecha}, ${r.turno}, ${r.numeros_oficiales}, ${r.letras_oficiales}, ${r.cabeza})
            on conflict (jurisdiccion, fecha, turno) do update set
                id_sorteo = excluded.id_sorteo,
                numeros_oficiales = excluded.numeros_oficiales,
                letras_oficiales = excluded.letras_oficiales,
                cabeza = excluded.cabeza
        `;
    } catch (e) {
        console.error('Error saving:', e);
    }
}

serve(async (_req) => {
    const DATABASE_URL = Deno.env.get('DATABASE_URL');
    if (!DATABASE_URL) {
        return new Response(JSON.stringify({ error: "No DATABASE_URL" }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
    
    const db = sql(DATABASE_URL, { max: 1, connect_timeout: 10 });
    const startTime = Date.now();
    
    try {
        console.log('🎰 MODO LUDÓPATA ACTIVADO - Retry agresivo habilitado');
        console.log('🔍 Obteniendo sorteos últimos 7 días...');
        
        const sorteos = await fetchLast7DaysSorteos();
        
        if (sorteos.length === 0) {
            return new Response(JSON.stringify({ 
                error: "No se pudieron obtener sorteos" 
            }), { 
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
        
        console.log(`✅ ${sorteos.length} sorteos para procesar con ${Object.keys(JURISDICCIONES).length} jurisdicciones`);
        
        const promises: Promise<void>[] = [];
        let scrapeCount = 0;
        let errorCount = 0;
        
        // Solo scrapear sorteos de hoy con retry agresivo
        // El resto sin retry (datos históricos ya deberían estar)
        const today = getTodayDate();
        const todaysSorteos = sorteos.filter(s => s.fecha === today);
        const historicalSorteos = sorteos.filter(s => s.fecha !== today);
        
        console.log(`📅 Hoy: ${todaysSorteos.length} sorteos | Históricos: ${historicalSorteos.length} sorteos`);
        
        // Scrapear sorteos de hoy CON retry agresivo
        for (const [nombreJur, codigoJur] of Object.entries(JURISDICCIONES)) {
            for (const sorteo of todaysSorteos) {
                promises.push((async () => {
                    const resultado = await fetchResultWithAggressiveRetry(nombreJur, codigoJur, sorteo);
                    if (resultado) {
                        await saveResultToSupabase(db, resultado);
                        scrapeCount++;
                    } else {
                        errorCount++;
                    }
                })());
            }
        }
        
        // Scrapear históricos SIN retry (1 solo intento)
        for (const [nombreJur, codigoJur] of Object.entries(JURISDICCIONES)) {
            for (const sorteo of historicalSorteos) {
                promises.push((async () => {
                    try {
                        const params = new URLSearchParams();
                        params.append('codigo', CODIGO_FIJO);
                        params.append('juridiccion', codigoJur);
                        params.append('sorteo', sorteo.id);

                        const res = await fetch(ENDPOINT_URL, { 
                            method: 'POST',
                            body: params, 
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        });
                        
                        const html = await res.text();
                        const { numeros, letras } = extractResults(html);

                        if (numeros.length === 20) { 
                            const resultado: QuinielaResult = {
                                jurisdiccion: nombreJur,
                                id_sorteo: Number(sorteo.id),
                                fecha: sorteo.fecha,
                                turno: sorteo.turno,
                                numeros_oficiales: numeros,
                                letras_oficiales: letras,
                                cabeza: numeros[0]
                            };
                            await saveResultToSupabase(db, resultado);
                            scrapeCount++;
                        }
                    } catch (e) {
                        errorCount++;
                    }
                })());
            }
        }
        
        await Promise.all(promises);
        
        const totalTime = Math.round((Date.now() - startTime) / 1000);
        
        return new Response(JSON.stringify({
            success: true,
            tiempo_total: `${totalTime}s`,
            sorteos_hoy: todaysSorteos.length,
            sorteos_historicos: historicalSorteos.length,
            jurisdicciones: Object.keys(JURISDICCIONES).length,
            guardados: scrapeCount,
            errores: errorCount,
            dias: 7,
            retry_strategy: "10x10s + 5x20s + 5x30s (max 5 min)"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
        
    } catch (e) { 
        console.error('Error:', e);
        return new Response(JSON.stringify({ 
            error: e.message 
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    } finally {
        await db.end();
    }
});
