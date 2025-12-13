# 🎰 Quiniela Live - Sistema Completo de Scraping Automático

## 🎯 Descripción del Proyecto

Sistema automatizado para scraping, almacenamiento y visualización de resultados de la Quiniela Argentina (LOTBA). Incluye scraping automático cada 2 horas, API Edge Function, limpieza automática de datos antiguos, y un frontend moderno estilo casino/gambling.

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS                            │
│   5 Workflows diarios (cada 2h) → Scraping Automático      │
│   schedule: "0 0,2,4,6,8 * * *"                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION                          │
│          quiniela-scraper (TypeScript/Deno)                 │
│   • Consume API LOTBA oficial                               │
│   • Scraping inteligente por sorteo_id                      │
│   • Manejo de errores robusto                               │
│   • Métricas y logging                                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE POSTGRESQL                             │
│   Tabla: quiniela_resultados                                │
│   • Limpieza automática (mantiene últimos 40)               │
│   • Trigger after INSERT para cleanup                        │
│   • Índices optimizados                                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION API                      │
│          quiniela-api (TypeScript/Deno)                     │
│   • 6 tipos de consultas diferentes                         │
│   • Filtros: jurisdiccion, turno, sorteo_id, fecha         │
│   • CORS habilitado                                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND WEB (index.html)                       │
│   • UI moderna estilo gambling/casino                       │
│   • Filtros múltiples en tiempo real                        │
│   • Auto-refresh cada 60 segundos                           │
│   • Estadísticas en vivo                                    │
│   • Responsive design                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
quiniela-supabase-final/
│
├── 📄 index.html                      # Frontend con UI gambling
│
├── 🔧 scripts/                        # Scripts Node.js para testing
│   ├── config.js                      # Configuración centralizada
│   ├── lib/
│   │   ├── database.js               # Cliente Supabase
│   │   ├── lotba-api.js              # Consumo API LOTBA
│   │   ├── metrics.js                # Sistema de métricas
│   │   ├── scraper-core.js           # Motor de scraping
│   │   └── utils.js                  # Utilidades
│   ├── scraper-by-sorteo-id-v2.js    # Scraper principal V2
│   ├── test-simple.js                # Test sin DB (mock)
│   ├── test-db-completo.js           # Test completo con DB
│   ├── install.cmd                   # Instalar dependencias
│   └── *.cmd                         # Scripts de ejecución
│
├── 🚀 .github/workflows/              # GitHub Actions
│   ├── quiniela-previa.yml           # 00:00 UTC - La Previa
│   ├── quiniela-primera.yml          # 02:00 UTC - Primera
│   ├── quiniela-matutina.yml         # 04:00 UTC - Matutina
│   ├── quiniela-vespertina.yml       # 06:00 UTC - Vespertina
│   └── quiniela-nocturna.yml         # 08:00 UTC - Nocturna
│
└── 💾 supabase/
    ├── config.toml                    # Configuración Supabase
    ├── functions/
    │   ├── quiniela-scraper/          # Edge Function Scraper
    │   │   ├── index.ts
    │   │   └── deno.json
    │   └── quiniela-api/              # Edge Function API
    │       └── index.ts
    └── migrations/
        └── 20241212000003_auto_cleanup_trigger.sql
```

---

## 🚀 Características Principales

### ✅ Sistema de Scraping Automático

- **5 workflows diarios** ejecutándose cada 2 horas
- **Scraping inteligente** por `sorteo_id` con auto-incremento
- **Manejo robusto de errores** y reintentos
- **Métricas detalladas** de cada ejecución
- **Soporte para todas las jurisdicciones**: Ciudad, BsAs, Santa Fe, Córdoba

### ✅ API Avanzada

**6 Tipos de Consultas:**

1. **Básica**: Todos los resultados
2. **Por Jurisdicción**: `?jurisdiccion=Ciudad`
3. **Por Turno**: `?turno=Primera`
4. **Por Jurisdicción + Turno**: `?jurisdiccion=BsAs&turno=Matutina`
5. **Por Sorteo ID**: `?sorteo_id=3150`
6. **Por Fecha**: `?fecha=2024-12-13`

**Endpoint:**
```
https://vvtujkedjalepkhbycpv.supabase.co/functions/v1/quiniela-api
```

### ✅ Frontend Moderno

- **Diseño tipo casino** con efectos neon y gradientes
- **Filtros en tiempo real**: jurisdicción, turno, sorteo_id, fecha
- **Estadísticas en vivo**: total sorteos, jurisdicciones, última actualización
- **Cards animadas** con hover effects
- **Destacado especial** para la cabeza (número principal)
- **Soporte para letras** en Ciudad
- **Auto-refresh** cada 60 segundos
- **100% Responsive**

### ✅ Limpieza Automática de Datos

- **Trigger automático** en PostgreSQL
- **Mantiene los últimos 40 sorteos** (8 días × 5 sorteos/día)
- **Se ejecuta después de cada INSERT**
- **No requiere cron jobs** adicionales

---

## 🛠️ Setup e Instalación

### 1. Configurar DATABASE_URL en GitHub

```bash
# En GitHub → Settings → Secrets and variables → Actions
# Agregar secret: DATABASE_URL

# Formato:
postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

### 2. Instalar Dependencias Locales (para testing)

```bash
cd scripts
install.cmd
# o manualmente:
# npm install @supabase/supabase-js axios dotenv
```

### 3. Configurar Variables de Entorno Local

Crear `scripts/.env`:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

### 4. Ejecutar Tests

```bash
# Test sin base de datos (mock)
cd scripts
run-test-simple.cmd

# Test completo con base de datos
run-test-db.cmd
```

---

## 🧪 Testing

### Test Simple (Sin DB)

```bash
cd scripts
node test-simple.js
```

**Output esperado:**
```
✅ Test 1: API debe responder con status 200
✅ Test 2: Respuesta debe incluir números y letras
✅ Test 3: Debe manejar ciudad y sorteo_id específicos
✅ Todos los tests pasaron! 3/3
```

### Test Completo (Con DB)

```bash
cd scripts
node test-db-completo.js
```

**Output esperado:**
```
✅ Conectado a la base de datos
✅ Test scraping completo ejecutado
✅ Sorteos guardados: 1-5
✅ Verificación de datos OK
```

---

## 📊 Monitoreo

### Ver Logs de GitHub Actions

1. Ir a tu repositorio en GitHub
2. Click en la pestaña **"Actions"**
3. Seleccionar un workflow (ej: "Quiniela Primera")
4. Ver logs detallados de cada ejecución

### Ver Logs de Edge Functions

```bash
supabase functions logs quiniela-scraper --tail
supabase functions logs quiniela-api --tail
```

### Consultar Base de Datos

```sql
-- Ver últimos 10 sorteos
SELECT * FROM quiniela_resultados
ORDER BY fecha DESC, id_sorteo DESC
LIMIT 10;

-- Contar sorteos por jurisdicción
SELECT jurisdiccion, COUNT(*) as total
FROM quiniela_resultados
GROUP BY jurisdiccion;

-- Ver sorteos de hoy
SELECT * FROM quiniela_resultados
WHERE fecha = CURRENT_DATE
ORDER BY id_sorteo DESC;
```

---

## 🎨 Uso del Frontend

### Abrir el Viewer

1. Abrir `index.html` en un navegador
2. O hacer deploy en:
   - GitHub Pages
   - Netlify
   - Vercel
   - Cualquier hosting estático

### Filtros Disponibles

- **🌍 Jurisdicción**: Todas, Ciudad, BsAs, Santa Fe, Córdoba
- **🕐 Turno**: Todos, La Previa, Primera, Matutina, Vespertina, Nocturna
- **🎯 ID de Sorteo**: Buscar por sorteo_id específico
- **📅 Fecha**: Filtrar por fecha exacta

### Botones

- **🔄 Actualizar Ahora**: Forzar recarga de datos
- **🗑️ Limpiar Filtros**: Reset todos los filtros

---

## 🔧 Troubleshooting

### Problema: GitHub Actions falla

**Solución:**
1. Verificar que `DATABASE_URL` esté configurado en GitHub Secrets
2. Verificar que la Edge Function `quiniela-scraper` esté desplegada
3. Ver logs en Actions para más detalles

### Problema: Frontend no muestra datos

**Solución:**
1. Abrir consola del navegador (F12)
2. Verificar que la URL de la API sea correcta
3. Verificar que haya datos en la base de datos
4. Verificar que la Edge Function `quiniela-api` esté desplegada

### Problema: Scraper no guarda datos

**Solución:**
1. Verificar conexión a base de datos
2. Verificar que la tabla `quiniela_resultados` exista
3. Ver logs de la Edge Function
4. Ejecutar test local: `node test-db-completo.js`

---

## 📈 Próximas Mejoras

- [ ] Agregar más jurisdicciones (Mendoza, Entre Ríos, etc.)
- [ ] Implementar caché con Redis
- [ ] Agregar gráficos de estadísticas
- [ ] Notificaciones push cuando salen nuevos sorteos
- [ ] API para consultar números más salidos
- [ ] Sistema de predicciones con ML

---

## 📄 Licencia

MIT License - Libre uso para proyectos personales y comerciales

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

## 📞 Contacto

Para preguntas o sugerencias, abrir un Issue en GitHub.

---

**¡Buena suerte en tus apuestas! 🍀🎰**

