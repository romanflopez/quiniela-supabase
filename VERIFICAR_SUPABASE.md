# 🔧 Verificar y Reactivar Supabase

## 🚨 Problema Actual

El scraper de Ciudad funciona perfectamente (encuentra y extrae los datos), pero **NO puede guardarlos** en la base de datos con este error:

```
❌ Error guardando Ciudad: Tenant or user not found
```

## 🎯 Causa Probable

Tu proyecto de Supabase está **PAUSADO** por inactividad. Supabase pausa automáticamente los proyectos del plan gratuito que no han tenido actividad en 7 días.

## ✅ Solución: Reactivar el Proyecto

### Paso 1: Ir al Dashboard
1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard
3. Inicia sesión con tu cuenta

### Paso 2: Encontrar tu Proyecto
1. Busca tu proyecto: **vvtujkedjalepkhbycpv**
2. Verifica el estado del proyecto:
   - ⚠️ Si dice "PAUSED", "INACTIVE" o tiene un ícono de pausa
   - ✅ Si dice "ACTIVE" o tiene un punto verde, ya está activo

### Paso 3: Reactivar (si está pausado)
1. Haz clic en el proyecto pausado
2. Busca el botón **"Resume"**, **"Restore"** o **"Unpause"**
3. Haz clic en él
4. Espera 1-2 minutos mientras se reactiva

### Paso 4: Verificar Conexión
Corre este comando para verificar que la conexión funciona:

```bash
node scripts/test-db-connection.js
```

**Resultado esperado:**
```
✅ Conexión exitosa a la base de datos!
```

## 📊 Después de Reactivar

Una vez que Supabase esté activo:

1. **Los scrapers funcionarán automáticamente**
   - GitHub Actions guardará los datos
   - Los workflows programados funcionarán
   
2. **La web mostrará los resultados**
   - Ciudad de Buenos Aires aparecerá en el selector
   - Los sorteos se mostrarán correctamente

## 🔄 Re-ejecutar el Workflow de Ciudad

Después de reactivar Supabase:

1. Ve a: https://github.com/romanflopez/quiniela-supabase/actions/workflows/quiniela-ciudad.yml
2. Haz clic en "Run workflow"
3. Selecciona la branch "main"
4. Haz clic en "Run workflow" nuevamente
5. Espera 1-2 minutos

El workflow ahora:
- ✅ Buscará desde sorteo 51770 (código actualizado)
- ✅ Encontrará 10 sorteos válidos
- ✅ Los guardará en Supabase (si está activo)

## 📝 Notas

- **Plan Gratuito**: Los proyectos se pausan después de 7 días de inactividad
- **Solución Permanente**: Ejecutar scrapers regularmente (ya configurado con GitHub Actions)
- **Frecuencia**: Los workflows están programados para ejecutarse cada 30 minutos

## ❓ Si Sigue sin Funcionar

Si después de reactivar Supabase el error persiste:

1. Verifica que el password es correcto: `w2uCMg2VbAScCKZS`
2. Verifica que usas el **Connection Pooler** (puerto 6543)
3. Revisa el SECRET `DATABASE_URL` en GitHub Actions

