# 🚀 Crear Nuevo Proyecto de Supabase (10 minutos)

## ¿Por qué crear uno nuevo?

El proyecto actual (`vvtujkedjalepkhbycpv`) tiene la DB pausada y no hay forma fácil de reactivarla desde la UI o CLI.

**Crear uno nuevo es MÁS RÁPIDO** que intentar arreglar el viejo.

---

## 📋 Paso 1: Crear el Proyecto (3 min)

1. **Ve a:** https://supabase.com/dashboard

2. **Haz clic en:** "New project"

3. **Llená los datos:**
   - **Name:** `Quiniela` (o el nombre que quieras)
   - **Database Password:** Generá uno fuerte o usá: `QuinielaApp2024!Secure`
   - **Region:** `US East (North Virginia)` - us-east-1
   - **Pricing Plan:** `Free` (suficiente para empezar)

4. **Haz clic en:** "Create new project"

5. **Esperá 2 minutos** mientras Supabase crea el proyecto

---

## 📊 Paso 2: Crear la Tabla (2 min)

Una vez que el proyecto esté listo:

1. **Ve a:** Table Editor (en el menú izquierdo)

2. **Haz clic en:** "New table"

O mejor aún, usá el **SQL Editor**:

1. **Ve a:** SQL Editor
2. **Pegá este SQL:**

```sql
-- Crear tabla de resultados
CREATE TABLE IF NOT EXISTS quiniela_resultados (
    id BIGSERIAL PRIMARY KEY,
    jurisdiccion VARCHAR(50) NOT NULL,
    sorteo_id VARCHAR(20) NOT NULL,
    fecha DATE NOT NULL,
    turno VARCHAR(20) NOT NULL,
    numeros TEXT[] NOT NULL,
    letras TEXT[],
    cabeza VARCHAR(4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(jurisdiccion, sorteo_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_jurisdiccion ON quiniela_resultados(jurisdiccion);
CREATE INDEX IF NOT EXISTS idx_fecha ON quiniela_resultados(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_turno ON quiniela_resultados(turno);
CREATE INDEX IF NOT EXISTS idx_sorteo ON quiniela_resultados(sorteo_id);

-- Habilitar Row Level Security (opcional)
ALTER TABLE quiniela_resultados ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos
CREATE POLICY "Allow public read access" ON quiniela_resultados
    FOR SELECT USING (true);
```

3. **Haz clic en:** "Run" o `Ctrl+Enter`

---

## 🔑 Paso 3: Obtener las Credenciales (2 min)

1. **Ve a:** Settings → Database

2. **Copia estos datos:**

### Connection String (Pooler - Transaction mode)
```
Host: aws-0-us-east-1.pooler.supabase.com
Database name: postgres
Port: 6543
User: postgres.[PROJECT-REF]
Password: [TU-PASSWORD]
```

### Connection String Completa:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD-URL-ENCODED]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**IMPORTANTE:** Si tu password tiene caracteres especiales (`!@#$%`), necesitás URL-encodearlos:
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- etc.

---

## 🔧 Paso 4: Actualizar tu Proyecto Local (3 min)

### 4.1 Actualizar DATABASE_URL local:

Editá o creá: `scripts/.env` (si no existe)

```bash
DATABASE_URL=postgresql://postgres.NEW_PROJECT_REF:YOUR_PASSWORD_ENCODED@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 4.2 Actualizar GitHub Secret:

1. **Ve a:** https://github.com/romanflopez/quiniela-supabase/settings/secrets/actions

2. **Edita el secret:** `DATABASE_URL`

3. **Pegá el nuevo connection string**

4. **Guarda**

---

## ✅ Paso 5: Probar que Funciona (1 min)

```bash
# Test de conexión
cd scripts
node test-supabase-status.js

# Deberías ver:
# ✅ CONEXIÓN EXITOSA
# ✅ Tabla quiniela_resultados existe
# Registros actuales: 0
```

---

## 📦 Paso 6: Backfill de Datos (5 min)

```bash
cd scripts
run-backfill.cmd 7

# O si querés menos días:
run-backfill.cmd 3
```

Esto va a:
- Traer los últimos 7 días de sorteos
- Scrapear Ciudad, BsAs, SantaFe, Cordoba
- Guardar todo en la nueva base de datos

---

## 🎉 LISTO!

Después del backfill, tu web debería mostrar:

```
Filtrar Sorteo:
├─ Buenos Aires
├─ Ciudad de Buenos Aires    ← ✅ CON DATOS
├─ Santa Fe
└─ Córdoba
```

---

## 📝 Ventajas del Proyecto Nuevo:

1. ✅ **Base de datos fresca** sin problemas
2. ✅ **Control total** sobre configuración
3. ✅ **Sin pausas misteriosas**
4. ✅ **Más rápido** que arreglar el viejo

---

## 🆘 Si algo falla:

1. Verificá el DATABASE_URL (password URL-encoded)
2. Verificá que el proyecto esté en región `us-east-1`
3. Verificá que usaste **Transaction mode** (puerto 6543)
4. Avisame y te ayudo!

---

## 🎯 Tiempo Total:

- Crear proyecto: 3 min
- Crear tabla: 2 min
- Obtener credenciales: 2 min
- Actualizar local: 3 min
- Backfill: 5 min
- **TOTAL: ~15 minutos**

**Mucho más rápido que intentar arreglar el proyecto pausado!** 🚀

