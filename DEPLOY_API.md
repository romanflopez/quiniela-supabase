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

### Paso 3: Desplegar/Redeployar la Función

**IMPORTANTE:** Después de agregar o actualizar un secret, **DEBES redeployar la función** para que tome efecto.

#### Opción A: Desde Supabase CLI
```bash
# Desde la raíz del proyecto
supabase functions deploy quiniela-api
```

#### Opción B: Desde Supabase Dashboard
1. Ve a: https://supabase.com/dashboard/project/pvbxvghzemtymbynkiqa/functions
2. Busca la función `quiniela-api`
3. Haz clic en **"Redeploy"** o **"Deploy"**
4. Si no existe, haz clic en **"Deploy new function"**
5. Selecciona la carpeta: `supabase/functions/quiniela-api`
6. Despliega

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
3. Los logs ahora incluyen más información de debug

## Nota Importante

- ⚠️ **Los secrets de Edge Functions requieren redeploy después de agregarlos/actualizarlos**
- Los secrets de Edge Functions son diferentes a los secrets de GitHub Actions
- Cada función necesita tener sus secrets configurados individualmente
- Si actualizaste el secret, **asegúrate de redeployar la función**

## Troubleshooting

### La API devuelve 0 resultados pero hay datos en la DB
1. Verifica que el secret `DATABASE_URL` esté configurado correctamente
2. **Redeploya la función** después de configurar el secret
3. Revisa los logs de la función para ver errores
4. Verifica que la conexión a la DB funcione: `cd scripts && node test-query-direct.js`
