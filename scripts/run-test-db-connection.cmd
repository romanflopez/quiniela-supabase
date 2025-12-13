@echo off
REM ═══════════════════════════════════════════════════════════════════
REM TEST DE CONEXIÓN A BASE DE DATOS
REM ═══════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════
echo 🔌 TEST DE CONEXIÓN A SUPABASE PostgreSQL
echo ═══════════════════════════════════════════════════════════════════
echo.

REM ¡¡¡ EDITA ESTA LÍNEA CON TU CONNECTION STRING !!!
REM Reemplaza "TU_CONNECTION_STRING_AQUI" con la connection string real
REM Ejemplo: postgresql://postgres.abc123:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

set DATABASE_URL=TU_CONNECTION_STRING_AQUI

if "%DATABASE_URL%"=="TU_CONNECTION_STRING_AQUI" (
    echo ❌ ERROR: Debes editar este archivo y configurar tu DATABASE_URL
    echo.
    echo 📝 Pasos:
    echo    1. Abre este archivo en un editor de texto
    echo    2. Busca la línea: set DATABASE_URL=TU_CONNECTION_STRING_AQUI
    echo    3. Reemplaza TU_CONNECTION_STRING_AQUI con tu connection string de Supabase
    echo    4. Guarda el archivo
    echo    5. Vuelve a ejecutar este script
    echo.
    echo 💡 Sigue las instrucciones en: OBTENER_CREDENCIALES_DB.md
    echo.
    pause
    exit /b 1
)

echo ✅ DATABASE_URL configurado
echo.
echo 🔄 Ejecutando test de conexión...
echo.

call node test-db-connection.js

echo.
echo ═══════════════════════════════════════════════════════════════════
pause

