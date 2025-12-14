# 🎯 ¿Cómo Funciona Ciudad de Buenos Aires?

## ✅ Ciudad YA Funciona Automáticamente

**Ciudad de Buenos Aires NO necesita un scraper especial.** Se scrapea automáticamente junto con las otras jurisdicciones (Buenos Aires, Santa Fe, Córdoba) en cada turno.

### 📊 Jurisdicciones Configuradas

En `scripts/config.js`:

```javascript
export const JURISDICCIONES = {
    'Ciudad': '51',      // Ciudad de Buenos Aires
    'BsAs': '53',        // Buenos Aires (Provincia)
    'SantaFe': '72',     // Santa Fe
    'Cordoba': '55',     // Córdoba
};
```

## 🔄 Cómo Funciona el Scraping

### 1. Los Workflows Se Ejecutan por Turno

Cada workflow (Matutina, Vespertina, Nocturna, etc.) ejecuta:

```bash
node scraper-by-turno.js nocturna
```

### 2. El Scraper Obtiene el Sorteo del Día

```javascript
// Desde loteriadelaciudad.gob.ar obtiene el ID de sorteo de hoy
const sorteoId = await obtenerSorteoIdDeHoy('nocturna');
// Ejemplo: sorteoId = "51775"
```

### 3. Scrapea TODAS las Jurisdicciones

```javascript
// Scrapea: Ciudad, BsAs, SantaFe, Cordoba
await scrapearTodasJurisdicciones(sorteoId, fecha);
```

### 4. Guarda Todo en Supabase

```javascript
await guardarResultados(resultados);
// Guarda los 4 resultados (1 por jurisdicción)
```

## 🌐 Endpoint Único para Todas las Jurisdicciones

Todas las jurisdicciones (incluyendo Ciudad) usan el **mismo endpoint**:

```
URL: https://quiniela.loteriadelaciudad.gob.ar/resultadosQuiniela/consultaResultados.php
Method: POST
Params:
  - codigo: "0080"
  - juridiccion: "51"  ← Código de Ciudad
  - sorteo: "51775"     ← ID del sorteo
```

Solo cambia el parámetro `juridiccion`:
- `51` = Ciudad de Buenos Aires
- `53` = Buenos Aires (Provincia)
- `72` = Santa Fe
- `55` = Córdoba

## 📅 Ejemplo de Ejecución

### Workflow Nocturna (9:00 PM)

1. **Se ejecuta a las 23:59 UTC** (8:59 PM ARG)
2. **Espera 55 segundos** (para empezar 5s antes del sorteo)
3. **Obtiene sorteo ID**: `51775`
4. **Scrapea 4 jurisdicciones**:
   - ✅ Ciudad → 51775 → 20 números + 4 letras
   - ✅ BsAs → 51775 → 20 números + 4 letras
   - ✅ SantaFe → 51775 → 20 números + 4 letras
   - ✅ Cordoba → 51775 → 20 números + 4 letras
5. **Guarda en DB**: 4 registros

## ❓ ¿Por Qué No Veo Ciudad en la Web?

### Causa: Supabase Pausado

Si no ves datos de Ciudad en la web es porque **Supabase está pausado**:

```
❌ Error: Tenant or user not found
```

### Solución:

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto: `vvtujkedjalepkhbycpv`
3. Si dice **"PAUSED"**, haz clic en **"Resume"**
4. Espera 1-2 minutos

### Después de Reactivar:

Los workflows que ya se ejecutaron automáticamente empezarán a guardar datos:

```
La Previa    → 11:00 AM → Scrapea: Ciudad, BsAs, SantaFe, Cordoba
Primera      → 12:00 PM → Scrapea: Ciudad, BsAs, SantaFe, Cordoba  
Matutina     →  3:00 PM → Scrapea: Ciudad, BsAs, SantaFe, Cordoba
Vespertina   →  6:00 PM → Scrapea: Ciudad, BsAs, SantaFe, Cordoba
Nocturna     →  9:00 PM → Scrapea: Ciudad, BsAs, SantaFe, Cordoba
```

## 🎉 Ventajas de Este Sistema

1. **Un solo scraper para todo** - No código duplicado
2. **Sincronización perfecta** - Todas las jurisdicciones del mismo sorteo
3. **Menos requests** - El mismo sorteo ID sirve para todas
4. **Fácil de mantener** - Agregar jurisdicción = 1 línea en config.js

## 📝 ¿Cómo Agregar Otra Jurisdicción?

Si quieres agregar Entre Ríos o Uruguay:

1. Edita `scripts/config.js`:

```javascript
export const JURISDICCIONES = {
    'Ciudad': '51',
    'BsAs': '53',
    'SantaFe': '72',
    'Cordoba': '55',
    'EntreRios': '52',  // ← Agregar aquí
};
```

2. Commit y push
3. Los workflows automáticamente la incluirán

## 🔍 Verificar Datos de Ciudad

```bash
# Ver datos de Ciudad
curl "https://vvtujkedjalepkhbycpv.supabase.co/functions/v1/quiniela-api?jurisdiccion=Ciudad"

# Ver todos los datos
curl "https://vvtujkedjalepkhbycpv.supabase.co/functions/v1/quiniela-api"
```

## 🚀 Resumen

- ✅ Ciudad **ya funciona automáticamente**
- ✅ Se scrapea con **cada turno** (5 veces al día)
- ✅ Usa el **mismo endpoint** que las demás
- ⚠️ Solo necesitas **reactivar Supabase**
- ⚠️ **No hay scrapers dedicados** ni workflows especiales para Ciudad

