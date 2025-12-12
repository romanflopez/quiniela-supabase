# 🎰 ANÁLISIS COMPLETO: Todos los Juegos de Lotería de la Ciudad

**Fecha:** 12 de Diciembre 2025  
**Objetivo:** Mapear TODOS los juegos, turnos, jurisdicciones y scrapers necesarios

---

## 📋 LISTA COMPLETA DE JUEGOS (12 TOTAL)

| # | Juego | URL Encontrada | Estado Investigación |
|---|-------|----------------|---------------------|
| 1 | **Quiniela de la Ciudad** | quiniela.loteriadelaciudad.gob.ar | ✅ Analizado |
| 2 | **Quiniela Poceada** | poceada.loteriadelaciudad.gob.ar | ✅ Analizado |
| 3 | **Tombolina** | tombolina.loteriadelaciudad.gob.ar | ✅ Analizado |
| 4 | **Otra Chance** | ? | 🔍 Por buscar |
| 5 | **Loto Plus** | loto.loteriadelaciudad.gob.ar | ✅ Analizado |
| 6 | **Loto 5 Plus** | loto5.loteriadelaciudad.gob.ar | ✅ Analizado |
| 7 | **La Grande** | ? | 🔍 Por buscar |
| 8 | **Quiniela Ya** | ? | 🔍 Por buscar |
| 9 | **Raspaya** | ? | 🔍 Por buscar |
| 10 | **Quini 6** | ? | 🔍 Por buscar |
| 11 | **Brinco** | ? | 🔍 Por buscar |
| 12 | **Telekino** | ? | 🔍 Por buscar |

---

## 🔍 ANÁLISIS DETALLADO POR JUEGO

### 1. QUINIELA DE LA CIUDAD (YA FUNCIONANDO 75%)

**URL:** https://quiniela.loteriadelaciudad.gob.ar/

**Endpoint API:**
```
POST https://quiniela.loteriadelaciudad.gob.ar/resultadosQuiniela/consultaResultados.php
Body: codigo=0080&juridiccion=[CODIGO]&sorteo=[ID]
```

**Turnos por día:** 5
- La Previa (10:15 AM)
- Primera (12:00 PM)
- Matutina (3:00 PM)
- Vespertina (6:00 PM)
- Nocturna (9:00 PM)

**Jurisdicciones con datos:**
| Jurisdicción | Código | ¿Funciona? | IDs Sorteo |
|--------------|--------|------------|------------|
| Ciudad | 51 | ❌ IDs diferentes | ? |
| BsAs (Nacional) | 53 | ✅ | 51770, 51769, 51768... |
| Santa Fe | 72 | ✅ | (mismos IDs que BsAs) |
| Córdoba | 55 | ✅ | (mismos IDs que BsAs) |
| Entre Ríos | 64 | ⚠️ Pocos datos | (mismos IDs que BsAs) |

**Formato de Resultados:**
- 20 números de 4 cifras
- Letras (solo Ciudad): 4 letras aleatorias

**DEPENDENCIAS:** NINGUNA (es independiente)

**Estado Actual:**
- ✅ Scraper funcionando para BsAs, Santa Fe, Córdoba
- ❌ Ciudad no funciona (usa IDs propios)
- ❌ Entre Ríos tiene pocos datos

**Scrapers Necesarios:**
1. ✅ **quiniela-nacional-scraper** (BsAs, Santa Fe, Córdoba) → YA EXISTE
2. 📝 **quiniela-ciudad-scraper** (solo Ciudad) → POR HACER

---

### 2. QUINIELA POCEADA

**URL:** https://poceada.loteriadelaciudad.gob.ar/

**Horario:** 1 sorteo diario a las 21:00 (9:00 PM)

**IDs de Sorteo:** Serie 9400+ (9491, 9490, 9489...)

**Formato:**
- 8 números elegidos del 00-99

**⚠️ DEPENDENCIA CRÍTICA:**
> "El sorteo se resuelve con las veinte posiciones que componen el extracto de la **última Quiniela de la Ciudad sorteada en el día**"

**Esto significa:**
- Poceada usa el extracto del sorteo **Nocturna (21:00)** de Quiniela Ciudad
- NO necesita scraping propio del resultado (ya lo tiene Quiniela)
- Solo necesita registrar qué sorteo de Quiniela Ciudad se usó

**Scraper Necesario:**
3. 📝 **poceada-scraper** → Registra ID de sorteo Poceada + referencia a Quiniela Ciudad Nocturna

---

### 3. TOMBOLINA

**URL:** https://tombolina.loteriadelaciudad.gob.ar/

**Horario:** 1 sorteo diario a las 15:00 (3:00 PM)

**IDs de Sorteo:** Serie 4500+ (4510, 4509, 4508...)

**Formato:**
- 3 a 7 números de 2 cifras (00-99)

**⚠️ DEPENDENCIA CRÍTICA:**
> "Los números ganadores estarán determinados por el sorteo de la **Quiniela de la Ciudad de la jugada matutina**"

**Esto significa:**
- Tombolina usa el extracto del sorteo **Matutina (15:00)** de Quiniela Ciudad
- NO necesita scraping propio del resultado
- Solo registra qué sorteo de Quiniela Ciudad Matutina se usó

**Scraper Necesario:**
4. 📝 **tombolina-scraper** → Registra ID de sorteo Tombolina + referencia a Quiniela Ciudad Matutina

---

### 4. LOTO PLUS

**URL:** https://loto.loteriadelaciudad.gob.ar/

**Horario:** 2 sorteos semanales
- Miércoles 22:00 (10:00 PM)
- Sábado 22:00 (10:00 PM)

**IDs de Sorteo:** Serie 3800+ (3838, 3837...)

**Formato:**
- 6 números del 1 al 42
- Sorteo adicional
- Pozo acumulado

**DEPENDENCIAS:** NINGUNA (es independiente)

**Scraper Necesario:**
5. 📝 **loto-plus-scraper** → Scrapea resultados 2x por semana

---

### 5. LOTO 5 PLUS

**URL:** https://loto5.loteriadelaciudad.gob.ar/

**Horario:** 1 sorteo semanal
- Viernes 22:30 (10:30 PM)

**IDs de Sorteo:** Serie 1400+ (1422, 1421...)

**Formato:**
- 5 números del 1 al 36
- Pozo acumulado

**DEPENDENCIAS:** NINGUNA (es independiente)

**Scraper Necesario:**
6. 📝 **loto5-plus-scraper** → Scrapea resultados 1x por semana

---

### 6-12. OTROS JUEGOS (POR INVESTIGAR)

Los siguientes juegos existen pero necesitan más investigación:

| Juego | Prioridad | Razón |
|-------|-----------|-------|
| **Otra Chance** | 🟡 Media | Popular pero URL desconocida |
| **La Grande** | 🟢 Baja | Sorteos especiales (Navidad, etc) |
| **Quiniela Ya** | 🟢 Baja | URL desconocida |
| **Raspaya** | 🟢 Baja | Juego de cartones (no sorteo en vivo) |
| **Quini 6** | 🟡 Media | Nacional, puede estar en otro sitio |
| **Brinco** | 🟢 Baja | URL desconocida |
| **Telekino** | 🟢 Baja | URL desconocida |

---

## 📊 RESUMEN: CUÁNTOS SCRAPERS NECESITAMOS

### FASE 1: QUINIELA (PRIORIDAD MÁXIMA 🔴)
1. ✅ **quiniela-nacional-scraper** (BsAs, Santa Fe, Córdoba) → YA EXISTE
2. 📝 **quiniela-ciudad-scraper** (solo Ciudad con IDs propios)

**Total sorteos:** 5 turnos × 4 jurisdicciones = 20 sorteos diarios

---

### FASE 2: JUEGOS QUE DEPENDEN DE QUINIELA (PRIORIDAD ALTA 🟡)
3. 📝 **poceada-scraper** (usa Quiniela Nocturna)
4. 📝 **tombolina-scraper** (usa Quiniela Matutina)

**Total sorteos:** 2 sorteos diarios (pero resultados de Quiniela)

---

### FASE 3: LOTOS SEMANALES (PRIORIDAD MEDIA 🟢)
5. 📝 **loto-plus-scraper** (2× semana)
6. 📝 **loto5-plus-scraper** (1× semana)

**Total sorteos:** 3 sorteos semanales

---

### FASE 4: OTROS JUEGOS (PRIORIDAD BAJA ⚪)
7-12. **otros-scrapers** (por investigar URLs primero)

---

## 🎯 PLAN DE ACCIÓN CLARO

### PASO 1: Perfeccionar Quiniela Nacional (1-2 días)
```bash
# YA TENEMOS 75 resultados funcionando
# Solo mejorar:
- Migrar a DB con IDs únicos correctos
- Mejorar API con filtros
- Mejorar UI
```

### PASO 2: Agregar Ciudad a Quiniela (2-3 días)
```bash
# Investigar:
- ¿Qué IDs usa Ciudad?
- ¿Tiene endpoint diferente?
- Crear scraper específico para Ciudad
```

### PASO 3: Poceada (1 día)
```bash
# Simple: Solo registrar ID de sorteo
# Resultado = usar Quiniela Ciudad Nocturna
```

### PASO 4: Tombolina (1 día)
```bash
# Simple: Solo registrar ID de sorteo
# Resultado = usar Quiniela Ciudad Matutina
```

### PASO 5: Loto Plus (1-2 días)
```bash
# Scraper independiente
# 2 veces por semana
```

### PASO 6: Loto 5 Plus (1 día)
```bash
# Scraper independiente
# 1 vez por semana
```

### PASO 7: Cron Jobs (1 día)
```bash
# Configurar GitHub Actions para todos
# Horarios específicos por juego
```

---

## 📐 ESQUEMA DE BASE DE DATOS SIMPLIFICADO

```sql
CREATE TABLE quiniela_resultados (
    id BIGSERIAL PRIMARY KEY,
    jurisdiccion TEXT NOT NULL,        -- 'BsAs', 'Ciudad', 'SantaFe', 'Cordoba'
    id_sorteo TEXT NOT NULL,
    fecha DATE NOT NULL,
    turno TEXT NOT NULL,               -- 'La Previa', 'Primera', 'Matutina', 'Vespertina', 'Nocturna'
    numeros INTEGER[],                 -- [8233, 3977, 9193, ...]
    letras TEXT[],                     -- ['E', 'K', 'R', 'X'] (solo Ciudad)
    cabeza TEXT,
    UNIQUE(jurisdiccion, id_sorteo, fecha)
);

CREATE TABLE poceada_resultados (
    id BIGSERIAL PRIMARY KEY,
    id_sorteo TEXT NOT NULL UNIQUE,    -- '9491'
    fecha DATE NOT NULL,
    -- NO guardamos números porque son los de Quiniela Ciudad Nocturna
    quiniela_referencia_id BIGINT REFERENCES quiniela_resultados(id)
);

CREATE TABLE tombolina_resultados (
    id BIGSERIAL PRIMARY KEY,
    id_sorteo TEXT NOT NULL UNIQUE,    -- '4510'
    fecha DATE NOT NULL,
    -- NO guardamos números porque son los de Quiniela Ciudad Matutina
    quiniela_referencia_id BIGINT REFERENCES quiniela_resultados(id)
);

CREATE TABLE loto_plus_resultados (
    id BIGSERIAL PRIMARY KEY,
    id_sorteo TEXT NOT NULL UNIQUE,
    fecha DATE NOT NULL,
    numeros INTEGER[],                 -- [12, 25, 33, 38, 41, 42]
    pozo NUMERIC
);

CREATE TABLE loto5_plus_resultados (
    id BIGSERIAL PRIMARY KEY,
    id_sorteo TEXT NOT NULL UNIQUE,
    fecha DATE NOT NULL,
    numeros INTEGER[],                 -- [5, 12, 18, 23, 31]
    pozo NUMERIC
);
```

---

## ⏰ TIEMPO ESTIMADO TOTAL

| Fase | Scrapers | Días | Acumulado |
|------|----------|------|-----------|
| Fase 1 | Quiniela Nacional (mejorar) | 1-2 | 2 días |
| Fase 1b | Quiniela Ciudad | 2-3 | 5 días |
| Fase 2 | Poceada + Tombolina | 2 | 7 días |
| Fase 3 | Loto Plus + Loto 5 | 2-3 | 10 días |
| Fase 4 | Cron Jobs | 1 | 11 días |

**Total: ~2 semanas para tener los 6 juegos principales**

---

## 🚀 ORDEN DE EJECUCIÓN (TU PEDIDO)

1. ✅ **Quiniela Nacional** → Perfeccionar (ya funciona 75%)
2. 📝 **Quiniela Ciudad** → Nuevo scraper
3. 📝 **Poceada** → Ejecutar, testear, funciona
4. 📝 **Tombolina** → Ejecutar, testear, funciona
5. 📝 **Loto Plus** → Ejecutar, testear, funciona
6. 📝 **Loto 5 Plus** → Ejecutar, testear, funciona
7. 📝 **Cron Jobs** → AL FINAL, configurar todos juntos

---

## ✅ CONCLUSIÓN

**Total de Scrapers Necesarios: 6**
1. Quiniela Nacional (BsAs, Santa Fe, Córdoba) - ✅ YA EXISTE
2. Quiniela Ciudad (Ciudad con IDs propios) - 📝 POR HACER
3. Poceada (referencia a Quiniela) - 📝 POR HACER
4. Tombolina (referencia a Quiniela) - 📝 POR HACER
5. Loto Plus (independiente) - 📝 POR HACER
6. Loto 5 Plus (independiente) - 📝 POR HACER

**Sorteos por Día:**
- Quiniela: 20 (5 turnos × 4 jurisdicciones)
- Poceada: 1
- Tombolina: 1
- **Total diario: 22 sorteos**

**Sorteos por Semana:**
- Loto Plus: 2
- Loto 5 Plus: 1
- **Total semanal: 3 sorteos**

**Cron Jobs Necesarios:**
- Quiniela: 5 cron jobs diarios (antes de cada turno)
- Poceada: 1 cron job diario (20:55)
- Tombolina: 1 cron job diario (14:55)
- Loto Plus: 2 cron jobs semanales (Mié/Sáb 21:55)
- Loto 5 Plus: 1 cron job semanal (Vie 22:25)
- **Total: 10 cron jobs**

---

*Análisis completo - Listo para implementar uno por uno* ✅

