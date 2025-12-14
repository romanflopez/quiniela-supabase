// Verificar estructura de la tabla
import pg from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.pvbxvghzemtymbynkiqa:1w85GJkMCa36mYUZ@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function verificarTabla() {
    const sql = pg(DATABASE_URL, { max: 1 });
    
    try {
        console.log('Verificando estructura de la tabla...\n');
        
        // Ver columnas
        const columnas = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = 'quiniela_resultados'
            ORDER BY ordinal_position;
        `;
        
        console.log('📊 COLUMNAS DE LA TABLA:');
        columnas.forEach(col => {
            console.log(`   ${col.column_name} (${col.data_type}) - nullable: ${col.is_nullable}`);
        });
        
        // Ver constraints/índices únicos
        const constraints = await sql`
            SELECT 
                tc.constraint_name, 
                tc.constraint_type,
                string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
            AND tc.table_name = 'quiniela_resultados'
            GROUP BY tc.constraint_name, tc.constraint_type;
        `;
        
        console.log('\n🔒 CONSTRAINTS/ÍNDICES:');
        constraints.forEach(cons => {
            console.log(`   ${cons.constraint_type}: ${cons.constraint_name} (${cons.columns})`);
        });
        
        // Ver algunos datos de ejemplo
        const ejemplo = await sql`
            SELECT * FROM quiniela_resultados LIMIT 1;
        `;
        
        if (ejemplo.length > 0) {
            console.log('\n📋 EJEMPLO DE DATO:');
            console.log(JSON.stringify(ejemplo[0], null, 2));
        } else {
            console.log('\n⚠️  La tabla está vacía');
        }
        
        await sql.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sql.end();
        process.exit(1);
    }
}

verificarTabla();

