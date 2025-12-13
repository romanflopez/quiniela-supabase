@echo off
REM ═══════════════════════════════════════════════════════════════════
REM EJECUTAR SCRAPER DE CIUDAD (con auto-incremento)
REM ═══════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════
echo 🔤 SCRAPER DE CIUDAD - Ejecutando...
echo ═══════════════════════════════════════════════════════════════════
echo.

REM Verificar que exista el archivo .env
if not exist ".env" (
    echo ❌ ERROR: No se encontro el archivo .env
    echo    Crea el archivo .env con tu DATABASE_URL
    echo    Ejemplo: DATABASE_URL=postgresql://...
    pause
    exit /b 1
)

REM Ejecutar el scraper
node scraper-ciudad.js

echo.
echo ═══════════════════════════════════════════════════════════════════
echo ✅ Scraper de Ciudad finalizado
echo ═══════════════════════════════════════════════════════════════════
echo.

pause

