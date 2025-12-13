@echo off
echo ==========================================
echo   CONFIGURAR DATABASE_URL
echo ==========================================
echo.
echo IMPORTANTE: Necesitas tu password de Supabase
echo.
echo 1. Ve a Supabase Dashboard
echo 2. Settings -^> Database -^> Connection String
echo 3. Copia el password (o usa el que ya tienes)
echo.
echo Tu password actual es: &{^(^<i1rKM;;0{^&WG
echo.
echo ==========================================
echo.

REM OPCIÓN 1: Con el password URL-encoded
REM Reemplaza [PASSWORD_ENCODED] con tu password URL-encoded
set DATABASE_URL=postgresql://postgres.vvtujkedjalepkhbycpv:[PASSWORD_ENCODED]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

REM OPCIÓN 2: Sin pooler (más confiable)
REM set DATABASE_URL=postgresql://postgres:[PASSWORD]@db.vvtujkedjalepkhbycpv.supabase.co:5432/postgres

echo DATABASE_URL configurado para esta sesion
echo.
echo Para hacer permanente, agrega a "Variables de entorno del sistema"
echo.
echo ==========================================
pause

