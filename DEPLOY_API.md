# 🚀 Desplegar y Configurar la API de Supabase

## Problema Actual
La API no está devolviendo resultados porque falta configurar `DATABASE_URL` como secret en Supabase.

## Solución: Configurar DATABASE_URL

### Paso 1: Obtener DATABASE_URL
El valor está en `DATABASE_URL.txt`:
```
postgresql://postgres.pvbxvghzemtymbynkiqa:1w85GJkMCa36mYUZ@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

### Paso 2: Configurar Secret en Supabase Dashboard

1. Ve a: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/settings/functions
2. Busca la sección **"Edge Functions Secrets"** o **"Secrets"**
3. Haz clic en **"Add new secret"**
4. Nombre: `DATABASE_URL`
5. Valor: Pega el contenido de `DATABASE_URL.txt`
6. Guarda

### Paso 3: Desplegar la Función (si no está desplegada)

```bash
# Desde la raíz del proyecto
supabase functions deploy quiniela-api
```

O desde Supabase Dashboard:
1. Ve a: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/functions
2. Si no existe `quiniela-api`, haz clic en **"Deploy new function"**
3. Selecciona la carpeta: `supabase/functions/quiniela-api`
4. Despliega

### Paso 4: Verificar

Ejecuta el script de prueba:
```bash
cd scripts
node test-api.js
```

Deberías ver resultados de Poceada.

## Verificar Logs

Si sigue sin funcionar, revisa los logs:
1. Ve a: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/functions/quiniela-api/logs
2. Busca errores relacionados con `DATABASE_URL` o conexión a la base de datos

## Nota Importante

- Los secrets de Edge Functions son diferentes a los secrets de GitHub Actions
- Cada función necesita tener sus secrets configurados individualmente
- Los cambios en secrets requieren redeploy de la función
