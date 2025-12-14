@echo off
echo ═══════════════════════════════════════════════════════════════
echo 🧪 EJECUTANDO TESTS
echo ═══════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

if not defined DATABASE_URL (
    echo ⚠️  DATABASE_URL no configurado.
    echo    Configurando desde DATABASE_URL.txt...
    for /f "delims=" %%i in (..\DATABASE_URL.txt) do set DATABASE_URL=%%i
)

echo 🔍 DATABASE_URL configurado: %DATABASE_URL:~0,50%...
echo.

call npm test

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Todos los tests pasaron!
) else (
    echo.
    echo ❌ Algunos tests fallaron.
)

pause

