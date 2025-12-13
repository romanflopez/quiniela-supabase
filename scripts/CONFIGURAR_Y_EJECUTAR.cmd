@echo off
echo ╔═══════════════════════════════════════════════════════╗
echo ║        TEST DB COMPLETO - CONFIGURACION              ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

REM Configurar DATABASE_URL con password URL-encoded
REM Password original: td!ezX!#W5gpn6/
REM Password encoded: td%%21ezX%%21%%23W5gpn6%%2F

echo Configurando DATABASE_URL...
set DATABASE_URL=postgresql://postgres:td%%21ezX%%21%%23W5gpn6%%2F@db.vvtujkedjalepkhbycpv.supabase.co:5432/postgres

echo ✅ DATABASE_URL configurado
echo.
echo ════════════════════════════════════════════════════════
echo   Ejecutando test en 3 segundos...
echo ════════════════════════════════════════════════════════
echo.
timeout /t 3 /nobreak >nul

call node test-db-completo.js

echo.
echo ════════════════════════════════════════════════════════
pause

