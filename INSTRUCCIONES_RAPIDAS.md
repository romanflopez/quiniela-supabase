# ⚡ INSTRUCCIONES RÁPIDAS - Setup en 5 Minutos

## 🎯 Lo que necesitas hacer AHORA:

### Opción A: Setup Automático (Recomendado) ✨

```bash
cd scripts
SETUP-AUTOMATICO.cmd
```

**Esto hará TODO automáticamente:**
1. ✅ Verifica conexión a Supabase
2. 🗑️ Limpia la base de datos (te pregunta)
3. 📦 Trae datos de la última semana (tú eliges cuántos días)
4. 🌐 Abre la web automáticamente

**Tiempo:** 5 minutos

---

### Opción B: Paso a Paso Manual

#### 1. Verificar Supabase (2 min)

```bash
# Ve a: https://supabase.com/dashboard
# Busca: vvtujkedjalepkhbycpv
# Si dice "PAUSED" → Haz clic en "Resume"
```

#### 2. Limpiar DB (1 min - opcional)

```bash
cd scripts
run-limpiar-db.cmd
# Escribe "SI" para confirmar
```

#### 3. Backfill (2 min)

```bash
cd scripts
run-backfill.cmd
# O especifica días: run-backfill.cmd 3
```

#### 4. Ver la web (30 seg)

```bash
python -m http.server 8080
# Abre: http://localhost:8080
```

---

## ✅ Checklist Rápido

- [ ] Supabase está ACTIVO (no pausado)
- [ ] Ejecutaste backfill (mínimo 3 días)
- [ ] La web muestra "Ciudad de Buenos Aires" en el selector
- [ ] Ves varios sorteos al seleccionar Ciudad

---

## 🎉 ¿Qué esperar después?

### En la Web verás:

```
Filtrar Sorteo:
├─ Todas las Jurisdicciones
├─ Buenos Aires
├─ Ciudad de Buenos Aires    ← ✅ DEBE APARECER
├─ Santa Fe
└─ Córdoba
```

Al seleccionar **Ciudad de Buenos Aires**:
- ✅ 5 sorteos por día (La Previa, Primera, Matutina, Vespertina, Nocturna)
- ✅ 20 números por sorteo
- ✅ 4 letras por sorteo
- ✅ Datos de los últimos días (según tu backfill)

### Workflows Automáticos:

A partir de ahora, **NO NECESITAS HACER NADA MÁS**.

Los workflows de GitHub Actions se ejecutarán automáticamente 5 veces al día:

```
11:00 AM → La Previa
12:00 PM → Primera
03:00 PM → Matutina
06:00 PM → Vespertina
09:00 PM → Nocturna
```

Cada uno scrapea: **Ciudad, BsAs, SantaFe, Cordoba**

---

## ⚠️ Si algo falla:

### Error: "Tenant or user not found"
👉 **Solución:** Supabase está pausado
- Ve a: https://supabase.com/dashboard
- Haz clic en "Resume"
- Espera 2 minutos
- Vuelve a ejecutar el backfill

### Error: "No se encontraron sorteos"
👉 **Solución:** Es muy temprano en el día
- Los sorteos aparecen después de las 11 AM
- Espera al próximo turno

### La web no muestra datos
👉 **Soluciones:**
1. Refresca la página (F5)
2. Verifica que el backfill terminó exitosamente
3. Abre la consola del navegador (F12) para ver errores
4. Verifica que Supabase esté activo

---

## 📚 Más información:

- **Setup detallado:** `SETUP_COMPLETO.md`
- **Cómo funciona Ciudad:** `COMO_FUNCIONA_CIUDAD.md`
- **Verificar Supabase:** `VERIFICAR_SUPABASE.md`
- **Solución final:** `SOLUCION_FINAL_CIUDAD.md`

---

## 🚀 TL;DR (Too Long; Didn't Read)

```bash
# 1. Verificar Supabase activo (dashboard)
# 2. Ejecutar setup automático
cd scripts
SETUP-AUTOMATICO.cmd

# 3. Listo! 🎉
```

**Tiempo total: 5 minutos**

