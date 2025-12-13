@echo off
REM ═══════════════════════════════════════════════════════════════════
REM EJECUTAR TESTS DEL SCRAPER DE CIUDAD (sin base de datos)
REM ═══════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════
echo 🧪 TESTS SCRAPER DE CIUDAD - Ejecutando...
echo ═══════════════════════════════════════════════════════════════════
echo.

node test-ciudad.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════════
    echo ✅ Todos los tests de Ciudad pasaron!
    echo ═══════════════════════════════════════════════════════════════════
    echo.
) else (
    echo.
    echo ═══════════════════════════════════════════════════════════════════
    echo ❌ Algunos tests de Ciudad fallaron
    echo ═══════════════════════════════════════════════════════════════════
    echo.
)

pause

