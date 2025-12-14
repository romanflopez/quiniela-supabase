# 🎯 Arquitectura Poceada

## 📊 Estructura de Datos

### Opción 1: Tabla Separada (Recomendada) ✅
- **Tabla**: `poceada_resultados`
- **Ventajas**: 
  - Datos separados por juego
  - Fácil de escalar a más juegos
  - Queries más simples
- **Desventajas**: 
  - Múltiples tablas

### Opción 2: Tabla Unificada
- **Tabla**: `resultados_juegos` (con columna `juego`)
- **Ventajas**: 
  - Una sola tabla
  - Queries unificadas
- **Desventajas**: 
  - Más complejo
  - Difícil de escalar

## 🗂️ Decisión: Tabla Separada

**Razón**: Poceada tiene estructura diferente (solo Ciudad, sin jurisdicciones múltiples)

## 📁 Archivos Creados

1. **`scripts/lib/poceada-api.js`** - API específica de Poceada
2. **`scripts/lib/poceada-db.js`** - Funciones DB para Poceada
3. **`scripts/lib/data-mapper.js`** - Mapper unificado para normalizar datos
4. **`scripts/scraper-poceada.js`** - Scraper principal
5. **`scripts/sql/create_poceada_table.sql`** - SQL para crear tabla
6. **`.github/workflows/poceada.yml`** - Workflow GitHub Actions

## 🔄 Flujo de Datos

```
Scraper Poceada
    ↓
poceada-api.js (obtiene HTML)
    ↓
extraerResultados() (parsea HTML)
    ↓
data-mapper.js (normaliza datos)
    ↓
poceada-db.js (guarda en DB)
    ↓
poceada_resultados (tabla)
```

## 🎯 Próximos Pasos

1. ✅ Crear tabla `poceada_resultados`
2. ✅ Ajustar scraper según estructura real de Poceada
3. ⏳ Probar scraper con datos reales
4. ⏳ Integrar con API frontend

