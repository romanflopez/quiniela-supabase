# 🎰 Quiniela Live

Sistema automatizado de scraping y visualización de resultados de la Quiniela Argentina (LOTBA).

## 🚀 Setup Rápido

### 1. Configurar DATABASE_URL en GitHub

1. Ve a: https://github.com/romanflopez/quiniela-supabase/settings/secrets/actions
2. Busca o crea el secret: `DATABASE_URL`
3. Pega este valor (está en `DATABASE_URL.txt`):

```
postgresql://postgres.pvbxvghzemtymbynkiqa:1w85GJkMCa36mYUZ@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

### 2. Crear Tabla en Supabase

1. Ve a: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa
2. SQL Editor → New query
3. Ejecuta el SQL de `scripts/sql/limpiar_db.sql` (solo la parte de CREATE TABLE)

### 3. Listo!

Los workflows de GitHub Actions se ejecutan automáticamente 5 veces al día.

## 📁 Estructura

```
├── index.html                    # Frontend web
├── scripts/                      # Scripts Node.js
│   ├── scraper-by-turno.js      # Scraper principal
│   ├── backfill-ultima-semana.js # Backfill histórico
│   ├── limpiar-db.js            # Limpiar DB
│   ├── lib/                      # Librerías core
│   └── tests/                    # Tests unitarios
│       ├── test-all.js          # Ejecutar todos los tests
│       ├── test-parsing.js      # Tests de parsing HTML
│       ├── test-utils.js        # Tests de funciones utilitarias
│       ├── test-database.js     # Tests de base de datos
│       └── test-metrics.js      # Tests de sistema de métricas
├── .github/workflows/            # GitHub Actions (5 workflows)
└── supabase/functions/           # Edge Functions
```

## 🔧 Comandos Útiles

```bash
# Backfill (traer últimos N días)
cd scripts
run-backfill.cmd 7

# Limpiar base de datos
run-limpiar-db.cmd

# Ejecutar tests
cd scripts
npm test                    # Todos los tests
npm run test:parsing        # Test de parsing HTML
npm run test:utils          # Test de funciones utilitarias
npm run test:database       # Test de base de datos
npm run test:metrics        # Test de sistema de métricas
```

## 📊 Workflows Automáticos

- **La Previa** → 11:00 AM
- **Primera** → 12:00 PM  
- **Matutina** → 3:00 PM
- **Vespertina** → 6:00 PM
- **Nocturna** → 9:00 PM

Cada uno scrapea: Ciudad, BsAs, SantaFe, Cordoba, EntreRios

## 🌐 API

```
https://pvbxvghzemtymbynkiqa.supabase.co/functions/v1/quiniela-api
```

Parámetros:
- `?jurisdiccion=Ciudad`
- `?turno=Nocturna`
- `?fecha=2024-12-13`

## 🧪 Tests

El proyecto incluye tests para funciones críticas con observabilidad:

- **Parsing HTML** (`test-parsing.js`): Valida extracción de números y letras del HTML
- **Funciones Utilitarias** (`test-utils.js`): Tests de conversión de fechas, turnos, etc.
- **Base de Datos** (`test-database.js`): Verifica conexión, estructura de tabla y queries
- **Sistema de Métricas** (`test-metrics.js`): Valida tracking de métricas y reportes

**Ejecutar tests:**
```bash
cd scripts
npm test                    # Suite completa (4 suites, 30 tests)
npm run test:parsing         # Solo parsing (6 tests)
npm run test:utils          # Solo utils (13 tests)
npm run test:database       # Solo DB (4 tests, requiere DATABASE_URL)
npm run test:metrics        # Solo métricas (7 tests)
```

**Observabilidad:**
- Los tests generan reportes detallados con tasa de éxito
- Tests de DB verifican estructura de tabla y datos reales
- Tests de métricas validan cálculos de performance

## 📊 Monitoreo

Ver `MONITOREO.md` para guía completa de monitoreo en:
- **Supabase Dashboard**: Logs, métricas, datos en tiempo real
- **GitHub Actions**: Estado de scrapers y logs completos
- **API Endpoint**: Verificar disponibilidad y datos

**Enlaces rápidos:**
- Dashboard: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa
- Logs Edge Functions: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/functions/quiniela-api/logs
- GitHub Actions: https://github.com/romanflopez/quiniela-supabase/actions
