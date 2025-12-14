# 🚀 Desplegar Edge Function en Nuevo Proyecto

## ¿Por qué?

El frontend (`index.html`) necesita la Edge Function `quiniela-api` para leer datos.

## 📋 Pasos (5 minutos)

### 1. Instalar Supabase CLI (si no lo tenés)

```bash
npm install -g supabase
```

### 2. Login en Supabase

```bash
supabase login
```

### 3. Linkear al proyecto nuevo

```bash
cd C:\Users\rowoc\OneDrive\Documentos\apps\quiniela-supabase-final
supabase link --project-ref pvbxvghzemtymbynkiqa
```

### 4. Desplegar la función

```bash
supabase functions deploy quiniela-api
```

### 5. Verificar

Abrí: https://pvbxvghzemtymbynkiqa.supabase.co/functions/v1/quiniela-api

Deberías ver JSON con los datos.

---

## ✅ Listo!

El frontend ya está actualizado para usar el nuevo proyecto.

