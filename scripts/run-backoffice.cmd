@echo off
REM ═══════════════════════════════════════════════════════════════════
REM BACKOFFICE SERVER - Servidor local para ejecutar scrapers
REM ═══════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════
echo 🎰 BACKOFFICE SERVER - Iniciando...
echo ═══════════════════════════════════════════════════════════════════
echo.

REM Configurar DATABASE_URL con password URL-encoded
REM Password original: td!ezX!#W5gpn6/
REM Password encoded: td%%21ezX%%21%%23W5gpn6%%2F
set DATABASE_URL=postgresql://postgres:td%%21ezX%%21%%23W5gpn6%%2F@db.vvtujkedjalepkhbycpv.supabase.co:5432/postgres
echo ✅ DATABASE_URL configurado
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

