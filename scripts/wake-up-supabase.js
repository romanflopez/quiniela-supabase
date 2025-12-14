// Intentar "despertar" el proyecto de Supabase haciendo requests
import fetch from 'node-fetch';

const PROJECT_URL = 'https://vvtujkedjalepkhbycpv.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHVqa2VkamFsZXBraGJ5Y3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMzQ0NzAsImV4cCI6MjA0OTYxMDQ3MH0.qJiNV8mQs7C1aGOlP5H89UG6geSJBm-KqAm7gJ2S3aU';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔄 INTENTANDO DESPERTAR PROYECTO DE SUPABASE');
console.log('═══════════════════════════════════════════════════════════════\n');

async function wakeUp() {
    const endpoints = [
        '/rest/v1/',
        '/auth/v1/health',
        '/storage/v1/bucket'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`⏳ Probando: ${PROJECT_URL}${endpoint}`);
            
            const response = await fetch(`${PROJECT_URL}${endpoint}`, {
                headers: {
                    'apikey': ANON_KEY,
                    'Authorization': `Bearer ${ANON_KEY}`
                },
                timeout: 10000
            });
            
            console.log(`   Status: ${response.status}`);
            
            if (response.status === 200) {
                console.log('   ✅ Proyecto respondió!');
                return true;
            } else if (response.status === 401 || response.status === 403) {
                console.log('   ✅ Proyecto está activo (error de auth es normal)');
                return true;
            } else if (response.status === 521) {
                console.log('   ❌ Error 521: Servidor down');
            } else if (response.status >= 500) {
                console.log('   ⚠️  Error del servidor');
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return false;
}

wakeUp()
    .then(active => {
        console.log('\n═══════════════════════════════════════════════════════════════');
        if (active) {
            console.log('🎉 PROYECTO ACTIVO');
            console.log('═══════════════════════════════════════════════════════════════');
            process.exit(0);
        } else {
            console.log('❌ PROYECTO SIGUE INACTIVO');
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('\n💡 OPCIONES:');
            console.log('   1. Crear un nuevo proyecto de Supabase (10 min)');
            console.log('   2. Contactar soporte de Supabase');
            console.log('   3. Esperar 24-48 horas (a veces se reactiva solo)');
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Error fatal:', err);
        process.exit(1);
    });

