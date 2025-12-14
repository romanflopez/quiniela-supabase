@echo off
REM ═══════════════════════════════════════════════════════════════
REM BACKFILL - Traer datos de la última semana
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🔄 BACKFILL - Traer datos de la última semana
echo ═══════════════════════════════════════════════════════════════
echo.

REM Verificar que exista DATABASE_URL
if "%DATABASE_URL%"=="" (
    echo ❌ ERROR: DATABASE_URL no configurado
    echo.
    echo Ejecuta primero: set-database-url.cmd
    echo.
    pause
    exit /b 1
)

REM Ir al directorio scripts
cd /d "%~dp0"

REM Ejecutar backfill (7 días por defecto)
set DIAS=%1
if "%DIAS%"=="" set DIAS=7

echo 🚀 Trayendo datos de los últimos %DIAS% días...
echo.

node backfill-ultima-semana.js %DIAS%

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ Backfill completado
echo ═══════════════════════════════════════════════════════════════
echo.
pause

