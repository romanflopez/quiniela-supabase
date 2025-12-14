// @ts-nocheck
// supabase/functions/quiniela-api/index.ts
// Endpoint API para obtener los resultados de la Quiniela en formato JSON
// 
// ENDPOINTS DISPONIBLES:
// - GET /quiniela-api → Últimos 80 resultados
// - GET /quiniela-api?jurisdiccion=ciudad → Filtrar por jurisdicción (40 últimos)
// - GET /quiniela-api?sorteo_id=51774 → Ese sorteo de TODAS las jurisdicciones
// - GET /quiniela-api?fecha=2025-12-12 → Todos los sorteos de esa fecha
// - GET /quiniela-api?fecha=2025-12-12&turno=Nocturna → Sorteo específico de TODAS las jurisdicciones
// - GET /quiniela-api?fecha_desde=2025-12-10&fecha_hasta=2025-12-12 → Rango de fechas

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import sql from 'npm:postgres@3.4.4'; 

// Las jurisdicciones que estamos scrapeando actualmente
const JURISDICCIONES_VALIDAS: string[] = ['Ciudad', 'BsAs', 'SantaFe', 'Cordoba', 'EntreRios'];

// Turnos válidos (incluye Poceada)
const TURNOS_VALIDOS: string[] = ['La Previa', 'Primera', 'Matutina', 'Vespertina', 'Nocturna', 'Poceada'];

// Mapeo de nombres en minúsculas a nombres correctos en DB
const JURISDICCION_MAP: Record<string, string> = {
    'ciudad': 'Ciudad',
    'bsas': 'BsAs',
    'santafe': 'SantaFe',
    'cordoba': 'Cordoba',
    'entrerios': 'EntreRios'
};

// ----------------------------------------------------------------------
// TIPOS
// ----------------------------------------------------------------------

interface QuinielaData {
  id: number;
  jurisdiccion: string;
  sorteo_id: string;
  fecha: string;
  turno: string;
  numeros: string[];
  letras: string[] | null;
  cabeza: string | null;
  created_at: string;
}

// ----------------------------------------------------------------------
// HANDLER PRINCIPAL (El Endpoint GET)
// ----------------------------------------------------------------------

serve(async (req) => {
    // 1. Obtener la conexión a la DB
    const DATABASE_URL = Deno.env.get('DATABASE_URL');
    if (!DATABASE_URL) {
        return new Response(JSON.stringify({ error: "Falta DATABASE_URL." }), { status: 500 });
    }
    const db = sql(DATABASE_URL, { max: 1, connect_timeout: 10 });
    
    // 2. Obtener parámetros de la URL
    const url = new URL(req.url);
    const sorteoId = url.searchParams.get('sorteo_id');
    const fecha = url.searchParams.get('fecha');
    const turno = url.searchParams.get('turno');
    const fechaDesde = url.searchParams.get('fecha_desde');
    const fechaHasta = url.searchParams.get('fecha_hasta');
    const jurisdiccionFilter = url.searchParams.get('jurisdiccion')?.toLowerCase();
    
    let dbQuery;
    let queryDescription = 'all';

    // 3. Construir la consulta SQL según los parámetros
    try {
        // CASO 1: Consulta por sorteo_id (todas las jurisdicciones)
        if (sorteoId) {
            dbQuery = db`
                select 
                    id, jurisdiccion, sorteo_id, fecha, turno, numeros, letras, cabeza, created_at
                from 
                    quiniela_resultados
                where
                    sorteo_id = ${sorteoId}
                order by 
                    jurisdiccion asc;
            `;
            queryDescription = `sorteo_id=${sorteoId}`;
        }
        
        // CASO 2: Consulta por fecha + turno (todas las jurisdicciones o Poceada)
        else if (fecha && turno) {
            // Capitalizar turno
            const turnoCapitalized = turno.charAt(0).toUpperCase() + turno.slice(1).toLowerCase();
            
            // Si es Poceada, buscar en tabla poceada
            if (turnoCapitalized === 'Poceada') {
                dbQuery = db`
                    select 
                        id, 
                        'Ciudad' as jurisdiccion, 
                        sorteo_id, 
                        fecha, 
                        turno, 
                        numeros, 
                        letras, 
                        cabeza, 
                        created_at
                    from 
                        poceada_resultados
                    where
                        fecha = ${fecha}
                        AND turno = ${turnoCapitalized}
                    order by 
                        created_at desc;
                `;
            } else {
                dbQuery = db`
                    select 
                        id, jurisdiccion, sorteo_id, fecha, turno, numeros, letras, cabeza, created_at
                    from 
                        quiniela_resultados
                    where
                        fecha = ${fecha}
                        AND turno = ${turnoCapitalized}
                    order by 
                        jurisdiccion asc;
                `;
            }
            queryDescription = `fecha=${fecha}&turno=${turnoCapitalized}`;
        }
        
        // CASO 3: Consulta por fecha (todos los sorteos del día)
        else if (fecha) {
            dbQuery = db`
                select 
                    id, jurisdiccion, sorteo_id, fecha, turno, numeros, letras, cabeza, created_at
                from 
                    quiniela_resultados
                where
                    fecha = ${fecha}
                order by 
                    turno desc, jurisdiccion asc;
            `;
            queryDescription = `fecha=${fecha}`;
        }
        
        // CASO 4: Consulta por rango de fechas
        else if (fechaDesde && fechaHasta) {
            dbQuery = db`
                select 
                    id, jurisdiccion, sorteo_id, fecha, turno, numeros, letras, cabeza, created_at
                from 
                    quiniela_resultados
                where
                    fecha >= ${fechaDesde}
                    AND fecha <= ${fechaHasta}
                order by 
                    fecha desc, turno desc, jurisdiccion asc
                limit 200;
            `;
            queryDescription = `fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
        }
        
        // CASO 5: Consulta por jurisdicción específica
        else if (jurisdiccionFilter) {
            const validasLower = JURISDICCIONES_VALIDAS.map(j => j.toLowerCase());
            
            if (validasLower.includes(jurisdiccionFilter)) {
                const jurisdiccionValue = JURISDICCION_MAP[jurisdiccionFilter];
                
                dbQuery = db`
                    select 
                        id, jurisdiccion, sorteo_id, fecha, turno, numeros, letras, cabeza, created_at
                    from 
                        quiniela_resultados
                    where
                        jurisdiccion = ${jurisdiccionValue}
                    order by 
                        fecha desc, turno desc, created_at desc
                    limit 40;
                `;
                queryDescription = `jurisdiccion=${jurisdiccionValue}`;
            } else {
                return new Response(JSON.stringify({ 
                    error: "Jurisdicción inválida",
                    validas: JURISDICCIONES_VALIDAS.map(j => j.toLowerCase())
                }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }
        
        // CASO 6: Sin filtros - últimos 80 resultados (Quiniela + Poceada)
        else {
            // Unir resultados de quiniela y poceada
            dbQuery = db`
                (
                    select 
                        id, 
                        COALESCE(jurisdiccion, 'Ciudad') as jurisdiccion, 
                        sorteo_id, 
                        fecha, 
                        turno, 
                        numeros, 
                        letras, 
                        cabeza, 
                        created_at
                    from 
                        quiniela_resultados
                    order by 
                        fecha desc, turno desc, created_at desc
                    limit 70
                )
                UNION ALL
                (
                    select 
                        id, 
                        'Ciudad' as jurisdiccion, 
                        sorteo_id, 
                        fecha, 
                        turno, 
                        numeros, 
                        letras, 
                        cabeza, 
                        created_at
                    from 
                        poceada_resultados
                    order by 
                        fecha desc, created_at desc
                    limit 10
                )
                order by 
                    fecha desc, turno desc, created_at desc
                limit 80;
            `;
        }
        
        const data: QuinielaData[] = await dbQuery;

        // 4. Devolver la respuesta como JSON
        return new Response(JSON.stringify({
            status: 'ok',
            query: queryDescription,
            total_results: data.length,
            results: data
        }), {
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });

    } catch (error) {
        console.error("Error al consultar la DB:", error);
        return new Response(JSON.stringify({ 
            error: "Fallo en la consulta a la base de datos.", 
            details: error instanceof Error ? error.message : String(error)
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    } finally {
        await db.end();
    }
});