// ═══════════════════════════════════════════════════════════════════
// BACKOFFICE SERVER - API local para ejecutar scrapers manualmente
// ═══════════════════════════════════════════════════════════════════

import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Habilitar CORS para todas las origins
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde el directorio raíz del proyecto
app.use(express.static(path.join(__dirname, '..')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Mapeo de scrapers
const SCRAPERS = {
    'ciudad': {
        script: 'scraper-ciudad.js',
        args: [],
        name: 'Ciudad'
    },
    'laprevia': {
        script: 'scraper-by-turno.js',
        args: ['laprevia'],
        name: 'La Previa'
    },
    'primera': {
        script: 'scraper-by-turno.js',
        args: ['primera'],
        name: 'Primera'
    },
    'matutina': {
        script: 'scraper-by-turno.js',
        args: ['matutina'],
        name: 'Matutina'
    },
    'vespertina': {
        script: 'scraper-by-turno.js',
        args: ['vespertina'],
        name: 'Vespertina'
    },
    'nocturna': {
        script: 'scraper-by-turno.js',
        args: ['nocturna'],
        name: 'Nocturna'
    }
};

// ═══════════════════════════════════════════════════════════════════
// ENDPOINT: POST /api/scrape
// ═══════════════════════════════════════════════════════════════════

app.post('/api/scrape', (req, res) => {
    const { turno } = req.body;
    
    if (!turno || !SCRAPERS[turno]) {
        return res.status(400).json({
            status: 'error',
            details: 'Turno inválido. Usar: ciudad, laprevia, primera, matutina, vespertina, nocturna'
        });
    }
    
    const scraper = SCRAPERS[turno];
    const { script, args, name } = scraper;
    
    console.log(`\n🚀 Ejecutando scraper: ${name}`);
    console.log(`   Script: ${script}`);
    console.log(`   Args: ${args.join(', ') || 'ninguno'}`);
    
    // Ejecutar el scraper como proceso hijo
    const childProcess = spawn('node', [script, ...args], {
        cwd: __dirname,
        env: { ...process.env }
    });
    
    let stdout = '';
    let stderr = '';
    let sorteosGuardados = 0;
    
    // Capturar salida estándar
    childProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(output);
        
        // Detectar sorteos guardados
        if (output.includes('sorteo guardado') || output.includes('guardado exitosamente')) {
            sorteosGuardados++;
        }
    });
    
    // Capturar errores
    childProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.error(output);
    });
    
    // Cuando el proceso termina
    childProcess.on('close', (code) => {
        console.log(`\n✅ Scraper ${name} terminó con código: ${code}`);
        
        if (code === 0) {
            // Éxito
            res.json({
                status: 'ok',
                turno: name,
                sorteos_guardados: sorteosGuardados > 0 ? sorteosGuardados : 1,
                details: 'Scraping exitoso',
                output: stdout,
                timestamp: new Date().toISOString()
            });
        } else {
            // Error
            res.status(500).json({
                status: 'error',
                turno: name,
                sorteos_guardados: 0,
                details: stderr || 'Error al ejecutar scraper',
                output: stdout,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    // Error al iniciar proceso
    childProcess.on('error', (error) => {
        console.error(`❌ Error al ejecutar ${name}:`, error);
        res.status(500).json({
            status: 'error',
            turno: name,
            details: error.message,
            timestamp: new Date().toISOString()
        });
    });
});

// ═══════════════════════════════════════════════════════════════════
// ENDPOINT: GET /api/status
// ═══════════════════════════════════════════════════════════════════

app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Backoffice server running',
        scrapers: Object.keys(SCRAPERS),
        timestamp: new Date().toISOString()
    });
});

// ═══════════════════════════════════════════════════════════════════
// ENDPOINT: GET /health
// ═══════════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// ═══════════════════════════════════════════════════════════════════
// INICIAR SERVIDOR
// ═══════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎰 BACKOFFICE SERVER - Quiniela Scrapers');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`🌐 Backoffice UI: http://localhost:${PORT}/backoffice.html`);
    console.log(`📡 Endpoint scraping: POST http://localhost:${PORT}/api/scrape`);
    console.log(`📊 Endpoint status: GET http://localhost:${PORT}/api/status`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n💡 Scrapers disponibles:');
    Object.entries(SCRAPERS).forEach(([key, scraper]) => {
        console.log(`   • ${scraper.name.padEnd(15)} → ${key}`);
    });
    console.log('\n🚀 Listo para recibir requests del backoffice!');
    console.log('👉 Abre http://localhost:3000/backoffice.html en tu navegador\n');
});

// Manejo de errores global
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rechazada:', reason);
});

