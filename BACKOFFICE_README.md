# 🎰 Backoffice - Panel de Administración de Scrapers

## 📋 Descripción

Panel de administración web para ejecutar manualmente los scrapers de la Quiniela sin necesidad de acceder a GitHub Actions o ejecutar scripts locales.

## 🚀 Características

### ✅ **Control Manual de Scrapers**
- 6 botones para ejecutar cada scraper individualmente:
  - 🔤 **Ciudad** (con letras)
  - 🌅 **La Previa**
  - 🌄 **Primera**
  - ☀️ **Matutina**
  - 🌆 **Vespertina**
  - 🌙 **Nocturna**

### ✅ **UI Moderna y Responsive**
- Diseño tipo admin panel con efectos visuales
- Cards animadas con estados (idle, running, success, error)
- Efectos de pulso cuando un scraper está corriendo
- Colores: negro, rojo, dorado, verde neón

### ✅ **Logs en Tiempo Real**
- Panel de logs actualizado en tiempo real
- Timestamp en cada log
- Colores por tipo: info, success, error, warning
- Botón para limpiar logs
- Auto-scroll a los logs más recientes

### ✅ **Estados Visuales**
- **Idle** (gris): Listo para ejecutar
- **Running** (dorado pulsante): Scraper en ejecución
- **Success** (verde): Scraping exitoso
- **Error** (rojo): Falló el scraping

## 🔧 Configuración

### Opción 1: Usar con Edge Function (Recomendado)

1. **Abrir `backoffice.html`** en cualquier navegador
2. Los scrapers llamarán a la Edge Function de Supabase
3. La Edge Function debe estar desplegada:
   ```bash
   supabase functions deploy quiniela-scraper
   ```
4. No requiere configuración adicional

### Opción 2: Modo Local (Alternativo)

Para usar scrapers locales en lugar de Edge Functions:

1. Crear un servidor simple en Node.js:

```javascript
// scripts/backoffice-server.js
import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/scrape', (req, res) => {
    const { turno } = req.body;
    
    const scraperMap = {
        'ciudad': 'scraper-ciudad.js',
        'laprevia': 'scraper-by-turno.js',
        'primera': 'scraper-by-turno.js',
        'matutina': 'scraper-by-turno.js',
        'vespertina': 'scraper-by-turno.js',
        'nocturna': 'scraper-by-turno.js'
    };
    
    const script = scraperMap[turno];
    const args = turno === 'ciudad' ? [] : [turno];
    
    const process = spawn('node', [script, ...args], {
        cwd: __dirname
    });
    
    let output = '';
    
    process.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    process.on('close', (code) => {
        if (code === 0) {
            res.json({
                status: 'ok',
                sorteos_guardados: 1,
                output: output
            });
        } else {
            res.status(500).json({
                status: 'error',
                details: 'Scraper falló',
                output: output
            });
        }
    });
});

app.listen(3000, () => {
    console.log('Backoffice server running on port 3000');
});
```

2. Instalar dependencias:
   ```bash
   cd scripts
   npm install express cors
   ```

3. Ejecutar el servidor:
   ```bash
   node backoffice-server.js
   ```

4. Modificar `backoffice.html` línea 350:
   ```javascript
   const SCRAPER_FUNCTION = 'http://localhost:3000/api/scrape';
   ```

## 📖 Uso

### Ejecutar un Scraper

1. Abrir `backoffice.html` en el navegador
2. Click en el botón "▶ Ejecutar Scraper" del turno deseado
3. El card mostrará estado "Running" con animación
4. Ver logs en tiempo real en el panel inferior
5. Resultado:
   - ✅ Verde = Exitoso
   - ❌ Rojo = Falló

### Leer los Logs

Los logs muestran:
- `[HH:MM:SS]` - Timestamp
- Mensaje de estado
- Color según tipo:
  - **Verde**: Éxito
  - **Rojo**: Error
  - **Amarillo**: Warning
  - **Blanco**: Info

### Limpiar Logs

Click en el botón "🗑️ Limpiar Logs" en el panel de logs.

## 🎯 Casos de Uso

### 1. **Sorteo Falló en GitHub Actions**
- Abrir backoffice
- Ejecutar el scraper específico manualmente
- Verificar el resultado

### 2. **Quiero Forzar un Scraping Ahora**
- No esperar al horario programado
- Ejecutar desde backoffice
- Datos disponibles de inmediato

### 3. **Probar si un Scraper Funciona**
- Ejecutar desde backoffice
- Ver logs detallados
- Debugging rápido

### 4. **Ciudad Está Dando Problemas**
- Ejecutar scraper de Ciudad
- Ver intentos y errores en tiempo real
- Ajustar sorteo_id si es necesario

## 🔍 Troubleshooting

### El botón no hace nada

**Problema**: CORS bloqueado

**Solución**:
1. Verificar que la Edge Function tenga CORS habilitado
2. O usar modo local con servidor Node.js

### Error: "Failed to fetch"

**Problema**: Edge Function no desplegada o URL incorrecta

**Solución**:
1. Verificar URL en línea 350 de `backoffice.html`
2. Desplegar Edge Function:
   ```bash
   supabase functions deploy quiniela-scraper
   ```

### Ciudad Siempre Falla

**Problema**: Ciudad es históricamente problemático

**Solución**:
- Normal, API de LOTBA de Ciudad es inestable
- Intentar varias veces
- Verificar logs para ver detalles
- Probar con sorteo_id diferente

### Scraper se queda en "Running" forever

**Problema**: Edge Function timeout o error

**Solución**:
1. Refrescar la página
2. Ver logs de la Edge Function:
   ```bash
   supabase functions logs quiniela-scraper --tail
   ```
3. Verificar DATABASE_URL

## 🎨 Personalización

### Cambiar URL de la API

Editar línea 350 en `backoffice.html`:

```javascript
const SCRAPER_FUNCTION = 'TU_URL_AQUI';
```

### Agregar Nuevos Scrapers

1. Agregar card en el HTML:
```html
<div class="scraper-card" id="card-nuevoscraper">
    <div class="scraper-header">
        <div class="scraper-title">🆕 Nuevo Scraper</div>
        <div class="scraper-icon">⭐</div>
    </div>
    <!-- resto del card -->
</div>
```

2. Agregar en el objeto `scraperNames` del JavaScript

3. Actualizar Edge Function para manejar el nuevo scraper

### Modificar Estilos

Todas las variables de color están en el `<style>`:
- Background: `#0a0a0a` a `#1a1a2e`
- Primario: `#ffd700` (dorado)
- Success: `#00ff88` (verde neón)
- Error: `#ff6b6b` (rojo)
- Running: `#ffd700` (amarillo)

## 📊 Ventajas vs GitHub Actions

| Característica | Backoffice | GitHub Actions |
|----------------|------------|----------------|
| **Ejecución Manual** | ✅ Inmediata | ⏳ Requiere login |
| **Logs en Tiempo Real** | ✅ Si | ❌ No |
| **UI Visual** | ✅ Moderna | ⚠️ Básica |
| **Debugging** | ✅ Fácil | ⚠️ Complicado |
| **Móvil** | ✅ Responsive | ⚠️ Desktop only |
| **Programado** | ❌ No | ✅ Cron |

## 🚀 Deploy del Backoffice

### Opción 1: GitHub Pages

1. Crear carpeta `docs/` en el repo
2. Copiar `backoffice.html` a `docs/index.html`
3. GitHub Settings → Pages → Source: `docs/`
4. URL: `https://tu-usuario.github.io/tu-repo/`

### Opción 2: Netlify

1. Drag & drop `backoffice.html` en Netlify
2. URL automática generada

### Opción 3: Vercel

```bash
vercel --prod
```

### Opción 4: Hosting Local

Simplemente abrir `backoffice.html` en el navegador.

## 🔐 Seguridad

⚠️ **IMPORTANTE**: El backoffice llama a funciones públicas de Supabase.

Para mayor seguridad:

1. **Agregar autenticación** con Supabase Auth
2. **Usar API Keys** secretas
3. **Rate limiting** en Edge Functions
4. **IP whitelist** si es posible

Ejemplo con API Key:

```javascript
const response = await fetch(SCRAPER_FUNCTION, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer TU_API_KEY_SECRETA'
    },
    body: JSON.stringify({ turno: scraper })
});
```

## 📝 Notas

- El backoffice NO reemplaza GitHub Actions
- GitHub Actions sigue funcionando automáticamente
- El backoffice es ADICIONAL para control manual
- Ideal para debugging y scrapers fallidos

## 🎉 Conclusión

El backoffice te da **control total** sobre los scrapers sin necesidad de:
- Abrir terminal
- Ejecutar comandos
- Ir a GitHub Actions
- Iniciar sesión en GitHub

**Todo desde un navegador con interfaz visual moderna.** 🚀

