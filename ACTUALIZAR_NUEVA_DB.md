# 🔧 Actualizar a Nueva Base de Datos

## 📋 Información del Nuevo Proyecto

- **Project Reference:** `pvbxvghzemtymbynkiqa`
- **Database Password:** `1w85GJkMCa36mYUZ`
- **Region:** `us-east-1`

---

## 🔑 PASO 1: Obtener Connection String Correcto

1. **Ve a tu proyecto:** https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa

2. **Ve a:** Settings → Database

3. **Buscá la sección:** "Connection string"

4. **Seleccioná:** "URI" (no "JDBC" ni "Golang")

5. **Seleccioná:** "Transaction" mode (puerto 6543) o "Session" mode

6. **Copiá el connection string completo**, debería verse así:

```
postgresql://postgres.pvbxvghzemtymbynkiqa:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

7. **Reemplazá** `[YOUR-PASSWORD]` con tu password: `1w85GJkMCa36mYUZ`

**Resultado final debería ser:**
```
postgresql://postgres.pvbxvghzemtymbynkiqa:1w85GJkMCa36mYUZ@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 📊 PASO 2: Crear la Tabla

1. **Ve a:** SQL Editor (en el menú izquierdo)

2. **Hacé clic en:** "New query"

3. **Copiá y pegá este SQL:**

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

-- Habilitar Row Level Security
ALTER TABLE quiniela_resultados ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos
CREATE POLICY "Allow public read access" ON quiniela_resultados
    FOR SELECT USING (true);
```

4. **Hacé clic en:** "Run" o presioná `Ctrl+Enter`

5. **Deberías ver:** "Success. No rows returned"

---

## 🔐 PASO 3: Actualizar GitHub Secret

1. **Ve a:** https://github.com/romanflopez/quiniela-supabase/settings/secrets/actions

2. **Buscá el secret:** `DATABASE_URL`

3. **Hacé clic en:** "Update" (el ícono del lápiz)

4. **Pegá el connection string completo** que copiaste en el PASO 1

5. **Hacé clic en:** "Update secret"

---

## ✅ PASO 4: Probar Localmente

```bash
cd C:\Users\rowoc\OneDrive\Documentos\apps\quiniela-supabase-final\scripts

# Setear el DATABASE_URL
$env:DATABASE_URL="postgresql://postgres.pvbxvghzemtymbynkiqa:1w85GJkMCa36mYUZ@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Probar conexión
node test-supabase-status.js
```

**Deberías ver:**
```
✅ CONEXIÓN EXITOSA
✅ Tabla quiniela_resultados existe
Registros actuales: 0
```

---

## 📦 PASO 5: Correr Backfill

Una vez que la conexión funcione:

```bash
cd scripts

# Traer últimos 7 días
run-backfill.cmd 7
```

Esto va a:
- Scrapear todos los sorteos de los últimos 7 días
- Guardar Ciudad, BsAs, SantaFe, Cordoba
- Llenar la base de datos

---

## 🎉 PASO 6: Verificar en la Web

```bash
# Abrir servidor local
python -m http.server 8080
```

Luego abrí: http://localhost:8080

**Deberías ver:**
- ✅ "Ciudad de Buenos Aires" en el selector
- ✅ Varios sorteos con datos
- ✅ 20 números + 4 letras por sorteo

---

## ⚠️ Si algo falla:

### Error: "Tenant or user not found"
- El proyecto puede estar todavía inicializándose
- Esperá 5 minutos y probá de nuevo
- Verificá que el password sea correcto

### Error: "Table does not exist"
- Verificá que ejecutaste el SQL del PASO 2
- Verificá que estás en el proyecto correcto

### Error: "Connection timeout"
- Verificá que usaste el **pooler** (puerto 6543)
- Verificá que la región sea `us-east-1`

---

## 📝 Checklist Final

- [ ] Connection string copiado desde Supabase Dashboard
- [ ] Tabla creada con el SQL
- [ ] GitHub Secret actualizado
- [ ] Test de conexión local exitoso
- [ ] Backfill ejecutado
- [ ] Web muestra datos de Ciudad

---

**Una vez que completes estos pasos, todo debería funcionar!** 🚀

