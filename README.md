# 🎰 Quiniela Live

Sistema automatizado de scraping y visualización de resultados de la Quiniela Argentina (LOTBA).

## 🚀 Setup Rápido

### 1. Configurar DATABASE_URL en GitHub

1. Ve a: https://github.com/romanflopez/quiniela-supabase/settings/secrets/actions
2. Busca o crea el secret: `DATABASE_URL`
3. Pega este valor (está en `DATABASE_URL.txt`):

```
postgresql://postgres.pvbxvghzemtymbynkiqa:1w85GJkMCa36mYUZ@aws-0-us-east-1.pooler.supabase.com:6543/postgres
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
│   └── lib/                      # Librerías core
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
```

## 📊 Workflows Automáticos

- **La Previa** → 11:00 AM
- **Primera** → 12:00 PM  
- **Matutina** → 3:00 PM
- **Vespertina** → 6:00 PM
- **Nocturna** → 9:00 PM

Cada uno scrapea: Ciudad, BsAs, SantaFe, Cordoba

## 🌐 API

```
https://pvbxvghzemtymbynkiqa.supabase.co/functions/v1/quiniela-api
```

Parámetros:
- `?jurisdiccion=Ciudad`
- `?turno=Nocturna`
- `?fecha=2024-12-13`
