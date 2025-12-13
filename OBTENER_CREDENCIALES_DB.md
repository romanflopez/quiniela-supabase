# 🔑 Cómo Obtener las Credenciales Correctas de Supabase

## ❌ Error Actual
```
Tenant or user not found
```

Este error significa que las credenciales que tenemos están incorrectas o el proyecto de Supabase cambió.

---

## 📋 Pasos para Obtener las Credenciales Correctas

### 1. 🌐 Abre tu Dashboard de Supabase
Ve a: **https://supabase.com/dashboard**

### 2. 📂 Selecciona tu Proyecto
- Busca el proyecto **"quiniela-supabase-final"** o similar
- Haz clic para entrar

### 3. ⚙️ Ve a Settings → Database
- En el menú lateral izquierdo, haz clic en **Settings** (⚙️)
- Luego haz clic en **Database**

### 4. 📝 Encuentra la Connection String
Busca la sección que dice **"Connection string"** o **"Connection pooling"**

### 5. 🔄 Selecciona el Modo Correcto
Hay 2 opciones principales:

#### **Opción A: Connection Pooling (RECOMENDADO para scrapers)**
- Selecciona: **"URI"**
- Modo: **"Transaction"** o **"Session"**
- Deberías ver algo como:
```
postgresql://postgres.PROJECT_REF:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

#### **Opción B: Direct Connection** 
- Menos recomendado, pero también funciona
- Deberías ver algo como:
```
postgresql://postgres:[YOUR-PASSWORD]@db.PROJECT_REF.supabase.co:5432/postgres
```

### 6. 📋 Copia la Connection String
- Haz clic en el botón **"Copy"** o selecciona y copia manualmente
- La connection string tiene este formato:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### 7. 🔐 Reemplaza la Password
La connection string copiada tiene `[YOUR-PASSWORD]` como placeholder.

**Necesitas:**
1. Ir a **Settings → Database**
2. Buscar la sección **"Database password"**
3. Si no recuerdas la password, haz clic en **"Reset database password"**
4. Copia la nueva password
5. Reemplaza `[YOUR-PASSWORD]` en la connection string con tu password real

⚠️ **IMPORTANTE:** Si tu password tiene caracteres especiales, necesitas URL-encodearlos:
- `!` → `%21`
- `#` → `%23`
- `/` → `%2F`
- `@` → `%40`
- `:` → `%3A`

O usa una herramienta online: https://www.urlencoder.org/

---

## 🧪 Probar la Connection String

Una vez que tengas tu connection string correcta, prúebala:

```powershell
# En PowerShell
cd scripts
$env:DATABASE_URL="postgresql://tu_connection_string_aqui"
node test-db-connection.js
```

Deberías ver:
```
✅ TODOS LOS TESTS PASARON - CONEXIÓN FUNCIONANDO
```

---

## 📊 Ejemplo de Connection String Correcta

### Connection Pooling (recomendado):
```
postgresql://postgres.vvtujkedjalepkhbycpv:MiPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Direct Connection:
```
postgresql://postgres:MiPassword123@db.vvtujkedjalepkhbycpv.supabase.co:5432/postgres
```

---

## 🔧 Configurar en GitHub Actions

Una vez que tengas la connection string funcionando localmente:

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **"New repository secret"**
4. Nombre: `DATABASE_URL`
5. Value: Tu connection string completa
6. Haz clic en **"Add secret"**

---

## ❓ Troubleshooting

### Error: "password authentication failed"
→ La password está incorrecta. Resetea la password en Supabase Dashboard.

### Error: "getaddrinfo ENOTFOUND"
→ El hostname está incorrecto. Verifica que copiaste la connection string completa.

### Error: "Tenant or user not found"
→ El proyecto no existe o cambió. Verifica que estás en el proyecto correcto.

### Error: "timeout"
→ Problema de red o firewall. Intenta con Connection Pooling en lugar de Direct Connection.

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas, comparte:
1. El mensaje de error completo (sin mostrar la password)
2. Los primeros 30 caracteres de tu connection string
3. El nombre de tu proyecto en Supabase

---

**Una vez que tengas la connection string correcta, pásamela y la configuraremos en el proyecto.** 🚀

