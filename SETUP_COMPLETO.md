# 🚀 Setup Completo - Paso a Paso

Esta guía te lleva desde cero hasta tener todo funcionando con datos.

## ✅ Paso 1: Verificar Supabase Activo

### ¿Por qué?
Si Supabase está pausado, **NADA funcionará** (ni backfill, ni workflows, nada).

### Cómo verificar:

1. **Ve al dashboard de Supabase:**
   👉 https://supabase.com/dashboard

2. **Busca tu proyecto:** `vvtujkedjalepkhbycpv`

3. **Verifica el estado:**
   - ✅ Si dice **"ACTIVE"** → Pasa al Paso 2
   - ⚠️ Si dice **"PAUSED"** → Haz clic en **"Resume"**, espera 2 minutos, luego pasa al Paso 2

### Test de conexión:

```bash
# En la carpeta scripts/
cd scripts
run-test-db-connection.cmd
```

**Resultado esperado:**
```
✅ Conexión exitosa a la base de datos!
```

---

## 🗑️ Paso 2: Limpiar Base de Datos (Opcional pero Recomendado)

### ¿Por qué?
Puede haber datos viejos o corruptos de pruebas anteriores.

### Cómo limpiar:

```bash
cd scripts
run-limpiar-db.cmd
```

**El script:**
1. Te muestra cuántos registros hay
2. Te muestra los últimos 5 registros
3. Te pide confirmación (debes escribir "SI")
4. Elimina todo
5. Verifica que quedó vacía

---

## 📦 Paso 3: Backfill - Traer Datos de la Última Semana

### ¿Por qué?
Para tener datos INMEDIATAMENTE sin esperar a los workflows del día.

### Cómo hacer backfill:

```bash
cd scripts
run-backfill.cmd
```

O si quieres más/menos días:

```bash
cd scripts
run-backfill.cmd 3    # Últimos 3 días
run-backfill.cmd 14   # Últimas 2 semanas
```

**El script:**
1. Obtiene todos los sorteos disponibles
2. Filtra los de la última semana
3. Scrapea las 4 jurisdicciones de cada sorteo
4. Guarda todo en Supabase
5. Te muestra un resumen

**Tiempo estimado:** 2-5 minutos (depende de cuántos días)

**Resultado esperado:**
```
═══════════════════════════════════════════════════════════════
📊 RESUMEN FINAL
═══════════════════════════════════════════════════════════════
🎯 Sorteos procesados: 35
✅ Total guardados: 140
❌ Total errores: 0
📅 Rango de fechas: 2025-12-06 a hoy
═══════════════════════════════════════════════════════════════
```

---

## 🌐 Paso 4: Verificar en la Web

### Abrir la web:

```bash
python -m http.server 8080
```

Luego abre: http://localhost:8080

### Verificar datos:

1. **Selector de jurisdicción** debe mostrar:
   - Todas las Jurisdicciones
   - Buenos Aires
   - **Ciudad de Buenos Aires** ← ✅ DEBE APARECER
   - Santa Fe
   - Córdoba

2. **Selecciona "Ciudad de Buenos Aires"**
   - Deberías ver **varios sorteos** (La Previa, Primera, Matutina, Vespertina, Nocturna)
   - Cada sorteo muestra **20 números + 4 letras**

3. **Selecciona "Todas las Jurisdicciones"**
   - Deberías ver sorteos de **todas las provincias**

### Verificar API directamente:

```bash
# Ver todos los datos
curl "https://vvtujkedjalepkhbycpv.supabase.co/functions/v1/quiniela-api"

# Ver solo Ciudad
curl "https://vvtujkedjalepkhbycpv.supabase.co/functions/v1/quiniela-api?jurisdiccion=Ciudad"
```

---

## 🔄 Paso 5: Workflows Automáticos

### ¿Qué pasa ahora?

Los workflows de GitHub Actions se ejecutan **automáticamente** 5 veces al día:

```
11:00 AM → La Previa    → Scrapea: Ciudad, BsAs, SantaFe, Cordoba
12:00 PM → Primera      → Scrapea: Ciudad, BsAs, SantaFe, Cordoba
03:00 PM → Matutina     → Scrapea: Ciudad, BsAs, SantaFe, Cordoba
06:00 PM → Vespertina   → Scrapea: Ciudad, BsAs, SantaFe, Cordoba
09:00 PM → Nocturna     → Scrapea: Ciudad, BsAs, SantaFe, Cordoba
```

### Verificar que funcionan:

1. Ve a: https://github.com/romanflopez/quiniela-supabase/actions

2. Espera al próximo turno (máximo 3 horas)

3. Verifica que el workflow se ejecute correctamente

4. Refresca tu web para ver los nuevos datos

---

## 📊 Resumen de Scripts Disponibles

### Setup Inicial:
- `run-test-db-connection.cmd` - Probar conexión a Supabase
- `run-limpiar-db.cmd` - Limpiar base de datos
- `run-backfill.cmd [DIAS]` - Traer datos históricos

### Testing:
- `run-test-simple.cmd` - Test básico de scraping
- `run-test-real.cmd` - Test de sorteo real del día

### Manuales (si falla un workflow):
- `scraper-by-turno.js [turno]` - Scrapear un turno específico
- `scraper-by-sorteo-id-v2.js [id] [fecha]` - Scrapear un sorteo específico

---

## ❓ Troubleshooting

### Problema: "Tenant or user not found"
**Solución:** Supabase está pausado → Ve al dashboard y haz clic en "Resume"

### Problema: "No se encontraron sorteos"
**Solución:** Es muy temprano en el día, los sorteos aparecen después de las 11 AM

### Problema: "Sin datos para Ciudad"
**Solución:** Espera a que el próximo workflow se ejecute (máximo 3 horas)

### Problema: Backfill tarda mucho
**Solución:** Normal, puede tardar 2-5 minutos. Ten paciencia.

### Problema: La web no muestra datos
**Soluciones:**
1. Verifica que Supabase esté activo
2. Verifica que el backfill haya terminado exitosamente
3. Refresca la página (F5)
4. Abre la consola del navegador (F12) y busca errores

---

## 🎯 Checklist Final

Marca cada ítem cuando lo completes:

- [ ] ✅ Supabase está ACTIVO (no pausado)
- [ ] ✅ Test de conexión exitoso
- [ ] ✅ Base de datos limpiada
- [ ] ✅ Backfill ejecutado (mínimo 3 días)
- [ ] ✅ Web muestra datos de Ciudad
- [ ] ✅ Web muestra datos de otras jurisdicciones
- [ ] ✅ Workflows automáticos configurados

---

## 🎉 ¡Listo!

Si completaste todos los pasos:

- ✅ Tienes datos de la última semana
- ✅ Ciudad de Buenos Aires funciona
- ✅ Los workflows actualizarán automáticamente 5 veces al día
- ✅ La web muestra todo correctamente

**No necesitas hacer nada más.** El sistema se mantendrá actualizado solo.

---

## 📞 Soporte

Si algo no funciona después de seguir esta guía:

1. Lee la documentación: `COMO_FUNCIONA_CIUDAD.md`
2. Verifica Supabase: `VERIFICAR_SUPABASE.md`
3. Revisa los logs de GitHub Actions
4. Verifica que el `DATABASE_URL` en GitHub Secrets esté correcto

