// @ts-nocheck
// supabase/functions/quiniela-api/index.ts
// Endpoint API para obtener los resultados de la Quiniela en formato JSON

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import sql from 'npm:postgres@3.4.4'; 

// Las jurisdicciones aceptadas para filtro
const JURISDICCIONES_VALIDAS: string[] = ['Ciudad', 'BsAs'];

// ----------------------------------------------------------------------
// TIPOS
// ----------------------------------------------------------------------

interface QuinielaData {
  id: number;
  jurisdiccion: string;
  id_sorteo: number;
  fecha: string;
  turno: string;
  numeros_oficiales: string[];
  letras_oficiales: string[] | null;
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
    
    // ✅ CORRECCIÓN CLAVE: Convertir el filtro a minúsculas inmediatamente
    const jurisdiccionFilter = url.searchParams.get('jurisdiccion')?.toLowerCase(); 
    
    let dbQuery;
    const validasLower = JURISDICCIONES_VALIDAS.map(j => j.toLowerCase());

    // 3. Construir la consulta SQL
    try {
        // Comparamos el filtro convertido a minúsculas con la lista de válidas (también en minúsculas)
        if (jurisdiccionFilter && validasLower.includes(jurisdiccionFilter)) {
            // 🛑 SOLUCIÓN: Mapeamos el filtro en minúsculas al nombre correcto con mayúsculas
            // que está guardado en la base de datos (evitamos problemas con LOWER() en SQL)
            const jurisdiccionMap: Record<string, string> = {
                'ciudad': 'Ciudad',
                'bsas': 'BsAs'
            };
            const jurisdiccionValue = jurisdiccionMap[jurisdiccionFilter];
            
            dbQuery = db`
                select 
                    id, jurisdiccion, id_sorteo, fecha, turno, numeros_oficiales, letras_oficiales, cabeza, created_at
                from 
                    quiniela_resultados
                where
                    jurisdiccion = ${jurisdiccionValue}
                order by 
                    fecha desc, turno desc, created_at desc
                limit 40;
            `;
        } else {
            // Consulta completa (sin filtrar, solo por seguridad)
            dbQuery = db`
                select 
                    id, jurisdiccion, id_sorteo, fecha, turno, numeros_oficiales, letras_oficiales, cabeza, created_at
                from 
                    quiniela_resultados
                order by 
                    fecha desc, turno desc, created_at desc
                limit 80; -- Más grande para incluir Ciudad y BsAs
            `;
        }
        
        const data: QuinielaData[] = await dbQuery;

        // 4. Devolver la respuesta como JSON
        return new Response(JSON.stringify({
            status: 'ok',
            total_results: data.length,
            jurisdiccion_requested: jurisdiccionFilter || 'all',
            results: data
        }), {
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                // Habilitar CORS para que tu app React Native pueda acceder
                "Access-Control-Allow-Origin": "*",
            },
        });

    } catch (error) {
        console.error("Error al consultar la DB:", error);
        return new Response(JSON.stringify({ error: "Fallo en la consulta a la base de datos.", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    } finally {
        await db.end();
    }
});