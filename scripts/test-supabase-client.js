// Test con Supabase Client (más confiable que postgres directo)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://vvtujkedjalepkhbycpv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'TU_ANON_KEY_AQUI';

console.log('🧪 Testing Supabase Client...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test 1: Ver cuántos registros hay
const { data, error, count } = await supabase
    .from('quiniela_resultados')
    .select('*', { count: 'exact', head: true });

if (error) {
    console.log('❌ Error:', error.message);
} else {
    console.log('✅ Conectado!');
    console.log(`📊 Registros en DB: ${count}`);
}

// Test 2: Obtener algunos registros
const { data: resultados, error: error2 } = await supabase
    .from('quiniela_resultados')
    .select('*')
    .limit(5);

if (error2) {
    console.log('❌ Error obteniendo datos:', error2.message);
} else {
    console.log(`\n✅ Primeros ${resultados.length} registros:`);
    resultados.forEach(r => {
        console.log(`  - ${r.jurisdiccion} | ${r.turno} | Cabeza: ${r.cabeza}`);
    });
}


