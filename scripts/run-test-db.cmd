@echo off
echo ==========================================
echo   TEST DB COMPLETO
echo   1. Limpiar DB
echo   2. Scrapear datos
echo   3. Verificar guardado
echo ==========================================
echo.

REM Verificar si DATABASE_URL está configurado
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL no esta configurado
    echo.
    echo Configuralo asi:
    echo   set DATABASE_URL=postgresql://postgres:[PASSWORD]@db.vvtujkedjalepkhbycpv.supabase.co:5432/postgres
    echo.
    echo O ejecuta este archivo con tu password:
    echo   set-database-url.cmd
    echo.
    pause
    exit /b 1
)

echo DATABASE_URL configurado OK
echo.
call node test-db-completo.js
echo.
echo ==========================================
pause


