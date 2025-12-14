@echo off
REM ═══════════════════════════════════════════════════════════════
REM LIMPIAR BASE DE DATOS
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🗑️  LIMPIAR BASE DE DATOS
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

REM Ejecutar script de limpieza
node limpiar-db.js

pause

