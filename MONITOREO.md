# 📊 Guía de Monitoreo - Quiniela Live

## 🎯 Dónde Monitorear

### 1. **Supabase Dashboard** (Principal)

#### 📍 **Logs de Edge Functions**
- URL: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/functions/quiniela-api/logs
- Qué ver: Errores de API, requests, tiempos de respuesta
- Frecuencia: Tiempo real

#### 📊 **Database Logs**
- URL: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/logs/explorer
- Qué ver: Queries lentas, errores de conexión, uso de recursos
- Frecuencia: Tiempo real

#### 📈 **Database Metrics**
- URL: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/database/overview
- Qué ver:
  - Tamaño de la base de datos
  - Cantidad de registros en `quiniela_resultados`
  - Conexiones activas
  - Uso de CPU/Memoria

#### 🔍 **Table Editor** (Ver datos)
- URL: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/editor
- Qué ver: Datos actuales en `quiniela_resultados`
- Útil para: Verificar que los scrapers están guardando datos

#### 📝 **SQL Editor** (Queries útiles)
- URL: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/sql/new

**Query para ver últimos resultados:**
```sql
SELECT 
    jurisdiccion,
    turno,
    fecha,
    sorteo_id,
    cabeza,
    created_at
FROM quiniela_resultados
ORDER BY created_at DESC
LIMIT 20;
```

**Query para ver estadísticas por jurisdicción:**
```sql
SELECT 
    jurisdiccion,
    COUNT(*) as total,
    MAX(created_at) as ultimo_resultado
FROM quiniela_resultados
GROUP BY jurisdiccion
ORDER BY total DESC;
```

**Query para ver resultados de hoy:**
```sql
SELECT 
    jurisdiccion,
    turno,
    COUNT(*) as sorteos_hoy
FROM quiniela_resultados
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY jurisdiccion, turno
ORDER BY turno, jurisdiccion;
```

### 2. **GitHub Actions** (Logs de Scrapers)

#### 📋 **Workflows**
- URL: https://github.com/romanflopez/quiniela-supabase/actions
- Qué ver:
  - Estado de cada scraper (✅ éxito / ❌ fallo)
  - Logs completos de cada ejecución
  - Tiempo de ejecución
  - Errores específicos

#### 🔍 **Ver logs de un workflow específico:**
1. Ve a: https://github.com/romanflopez/quiniela-supabase/actions
2. Click en el workflow que quieras ver (ej: "Scraper Quiniela - Nocturna")
3. Click en el run más reciente
4. Expande "Run Scraper - [Turno]" para ver logs completos

### 3. **API Endpoint** (Monitoreo de disponibilidad)

#### 🌐 **Health Check**
```bash
curl "https://pvbxvghzemtymbynkiqa.supabase.co/functions/v1/quiniela-api?jurisdiccion=Ciudad&turno=Nocturna&fecha=$(date +%Y-%m-%d)"
```

#### 📊 **Verificar datos disponibles:**
```bash
# Ver últimos resultados de Ciudad
curl "https://pvbxvghzemtymbynkiqa.supabase.co/functions/v1/quiniela-api?jurisdiccion=Ciudad"

# Ver resultados de hoy
curl "https://pvbxvghzemtymbynkiqa.supabase.co/functions/v1/quiniela-api?fecha=$(date +%Y-%m-%d)"
```

### 4. **Frontend Web** (Monitoreo visual)

- URL: https://romanflopez.github.io/quiniela-supabase/ (o donde esté deployado)
- Qué ver: Si los datos se están mostrando correctamente
- Útil para: Verificar que todo el flujo funciona end-to-end

## 🚨 Alertas y Problemas Comunes

### ❌ **Problema: "Tenant or user not found"**
- **Causa**: Proyecto de Supabase pausado o DATABASE_URL incorrecto
- **Solución**: 
  1. Verificar estado del proyecto en: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/settings/general
  2. Si está pausado, reactivarlo
  3. Verificar DATABASE_URL en GitHub Secrets

### ❌ **Problema: Scraper no guarda datos**
- **Verificar**:
  1. GitHub Actions: ¿Se ejecutó el workflow?
  2. Logs del workflow: ¿Hubo errores?
  3. Supabase DB: ¿Hay registros nuevos?
  4. DATABASE_URL: ¿Está configurado correctamente?

### ❌ **Problema: API retorna vacío**
- **Verificar**:
  1. ¿Hay datos en la DB? (SQL Editor)
  2. ¿Los parámetros son correctos? (jurisdiccion, turno, fecha)
  3. ¿La Edge Function tiene DATABASE_URL configurado?

## 📊 Métricas Clave a Monitorear

1. **Tasa de éxito de scrapers**: Debe ser > 80%
2. **Tiempo de respuesta de API**: Debe ser < 500ms
3. **Registros nuevos por día**: Debe ser ~25 (5 turnos × 5 jurisdicciones)
4. **Tamaño de DB**: Monitorear crecimiento
5. **Errores en logs**: Revisar diariamente

## 🔔 Configurar Alertas (Futuro)

Para alertas automáticas, podrías:
1. Usar Supabase webhooks
2. Configurar GitHub Actions notifications
3. Crear un dashboard con Supabase + algún servicio de monitoring

