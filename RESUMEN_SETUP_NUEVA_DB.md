# ✅ RESUMEN - Setup Nueva Base de Datos

## 📋 Lo que ya tenés:

- ✅ **Proyecto creado:** `pvbxvghzemtymbynkiqa`
- ✅ **Password de DB:** `1w85GJkMCa36mYUZ`
- ✅ **Region:** `us-east-1`

---

## 🔧 Lo que falta hacer:

### 1. **Obtener Connection String Correcto** (2 min)

El proyecto puede estar todavía inicializándose. Cuando esté listo:

1. **Ve a:** https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/settings/database

2. **Buscá:** "Connection string" → "URI"

3. **Seleccioná:** "Transaction" mode (puerto 6543)

4. **Copiá el string completo** y reemplazá `[YOUR-PASSWORD]` con: `1w85GJkMCa36mYUZ`

**Debería verse así:**
```
postgresql://postgres.pvbxvghzemtymbynkiqa:1w85GJkMCa36mYUZ@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

### 2. **Crear la Tabla** (1 min)

1. **Ve a:** SQL Editor
2. **Pegá este SQL:**

```sql
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

CREATE INDEX IF NOT EXISTS idx_jurisdiccion ON quiniela_resultados(jurisdiccion);
CREATE INDEX IF NOT EXISTS idx_fecha ON quiniela_resultados(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_turno ON quiniela_resultados(turno);
CREATE INDEX IF NOT EXISTS idx_sorteo ON quiniela_resultados(sorteo_id);

ALTER TABLE quiniela_resultados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON quiniela_resultados
    FOR SELECT USING (true);
```

3. **Run** (`Ctrl+Enter`)

---

### 3. **Actualizar GitHub Secret** (1 min)

1. **Ve a:** https://github.com/romanflopez/quiniela-supabase/settings/secrets/actions

2. **Buscá:** `DATABASE_URL`

3. **Update** → Pegá el connection string del paso 1

4. **Save**

---

### 4. **Probar Localmente** (1 min)

```bash
cd C:\Users\rowoc\OneDrive\Documentos\apps\quiniela-supabase-final\scripts

# Reemplazá CONNECTION_STRING con el que copiaste
$env:DATABASE_URL="CONNECTION_STRING"

# Probar
node test-supabase-status.js
```

**Deberías ver:**
```
✅ CONEXIÓN EXITOSA
✅ Tabla quiniela_resultados existe
```

---

### 5. **Correr Backfill** (5 min)

```bash
cd scripts
run-backfill.cmd 7
```

---

## ⏰ Tiempo Total: ~10 minutos

---

## 🆘 Si el proyecto todavía no está listo:

**Esperá 5-10 minutos** y probá de nuevo. Los proyectos nuevos de Supabase tardan un poco en inicializarse completamente.

**Para verificar que está listo:**
- Ve al dashboard del proyecto
- Si ves "Project ready" o el dashboard completo, está listo
- Si todavía dice "Setting up project", esperá un poco más

---

## 📝 Checklist:

- [ ] Connection string copiado desde Dashboard
- [ ] Tabla creada con SQL
- [ ] GitHub Secret actualizado
- [ ] Test local exitoso
- [ ] Backfill ejecutado
- [ ] Web muestra datos

---

**Una vez que el proyecto esté listo, seguí estos pasos y todo funcionará!** 🚀

