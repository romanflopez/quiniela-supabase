@echo off
REM ═══════════════════════════════════════════════════════════════════
REM BACKOFFICE SERVER - Servidor local para ejecutar scrapers
REM ═══════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════
echo 🎰 BACKOFFICE SERVER - Iniciando...
echo ═══════════════════════════════════════════════════════════════════
echo.

REM Verificar que node_modules exista
if not exist "node_modules" (
    echo ⚠️  Instalando dependencias...
    call npm install
    echo.
)

echo 🚀 Iniciando servidor en http://localhost:3000
echo.
echo 💡 Instrucciones:
echo    1. Deja esta ventana ABIERTA
echo    2. Abre backoffice.html en tu navegador
echo    3. Click en los botones para ejecutar scrapers
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

npm run backoffice

pause

