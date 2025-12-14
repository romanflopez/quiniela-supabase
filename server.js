// ═══════════════════════════════════════════════════════════════════
// SERVIDOR WEB SIMPLE - Sirve index.html para producción
// ═══════════════════════════════════════════════════════════════════

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer((req, res) => {
    // Solo servir index.html en la raíz
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(__dirname, 'index.html');
        
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error al leer el archivo');
                return;
            }
            
            res.writeHead(200, { 
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache'
            });
            res.end(data);
        });
    } else {
        // 404 para otras rutas
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Not Found');
    }
});

server.listen(PORT, HOST, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🌐 SERVIDOR WEB INICIADO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📍 URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(`📍 URL Externa: http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ Servidor listo para producción');
    console.log('   Presiona Ctrl+C para detener\n');
});

// Manejo de errores
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
        console.error(`   Intenta con otro puerto: PORT=3001 node server.js`);
    } else {
        console.error('❌ Error del servidor:', err);
    }
    process.exit(1);
});
