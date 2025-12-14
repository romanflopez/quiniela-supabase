@echo off
REM ═══════════════════════════════════════════════════════════════
REM SETUP AUTOMÁTICO - Hace todo el proceso en secuencia
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🚀 SETUP AUTOMÁTICO - Configuración completa
echo ═══════════════════════════════════════════════════════════════
echo.
echo Este script hará:
echo   1. ✅ Verificar conexión a Supabase
echo   2. 🗑️  Limpiar base de datos (opcional)
echo   3. 📦 Traer datos de la última semana
echo   4. 🌐 Abrir la web
echo.
pause

REM ═══════════════════════════════════════════════════════════════
REM PASO 1: Verificar DATABASE_URL
REM ═══════════════════════════════════════════════════════════════

if "%DATABASE_URL%"=="" (
    echo.
    echo ❌ ERROR: DATABASE_URL no configurado
    echo.
    echo Por favor ejecuta primero: set-database-url.cmd
    echo.
    pause
    exit /b 1
)

REM Ir al directorio scripts
cd /d "%~dp0"

REM ═══════════════════════════════════════════════════════════════
REM PASO 2: Test de conexión
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo PASO 1/4: Verificando conexión a Supabase...
echo ═══════════════════════════════════════════════════════════════
echo.

node test-db-connection.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: No se pudo conectar a Supabase
    echo.
    echo Posibles causas:
    echo   - Supabase está PAUSADO ^(ve al dashboard y haz clic en "Resume"^)
    echo   - DATABASE_URL incorrecto
    echo   - Sin conexión a internet
    echo.
    pause
    exit /b 1
)

REM ═══════════════════════════════════════════════════════════════
REM PASO 3: Limpiar DB (opcional)
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo PASO 2/4: Limpiar base de datos
echo ═══════════════════════════════════════════════════════════════
echo.

set /p LIMPIAR="¿Quieres limpiar la base de datos? (S/N): "

if /i "%LIMPIAR%"=="S" (
    echo.
    echo 🗑️  Limpiando base de datos...
    echo.
    node limpiar-db.js
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ ERROR al limpiar la base de datos
        pause
        exit /b 1
    )
) else (
    echo.
    echo ⏭️  Saltando limpieza de base de datos
)

REM ═══════════════════════════════════════════════════════════════
REM PASO 4: Backfill
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo PASO 3/4: Trayendo datos de la última semana
echo ═══════════════════════════════════════════════════════════════
echo.

set /p DIAS="¿Cuántos días quieres traer? (3-14, default=7): "
if "%DIAS%"=="" set DIAS=7

echo.
echo 📦 Trayendo datos de los últimos %DIAS% días...
echo ⏱️  Esto puede tardar 2-5 minutos, ten paciencia...
echo.

node backfill-ultima-semana.js %DIAS%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR durante el backfill
    pause
    exit /b 1
)

REM ═══════════════════════════════════════════════════════════════
REM PASO 5: Abrir la web
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo PASO 4/4: Abriendo la web
echo ═══════════════════════════════════════════════════════════════
echo.

set /p ABRIR_WEB="¿Quieres abrir la web ahora? (S/N): "

if /i "%ABRIR_WEB%"=="S" (
    echo.
    echo 🌐 Abriendo servidor web en http://localhost:8080
    echo.
    echo Presiona Ctrl+C para detener el servidor cuando termines
    echo.
    
    REM Abrir navegador
    start http://localhost:8080
    
    REM Ir al directorio raíz del proyecto
    cd ..
    
    REM Iniciar servidor
    python -m http.server 8080
) else (
    echo.
    echo ⏭️  Para abrir la web más tarde, ejecuta:
    echo    python -m http.server 8080
    echo.
)

REM ═══════════════════════════════════════════════════════════════
REM FIN
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ SETUP COMPLETADO
echo ═══════════════════════════════════════════════════════════════
echo.
echo Todo está listo! La web debería mostrar:
echo   - Ciudad de Buenos Aires en el selector
echo   - Varios sorteos de la última semana
echo   - Datos de todas las jurisdicciones
echo.
echo Los workflows de GitHub Actions actualizarán automáticamente
echo 5 veces al día (La Previa, Primera, Matutina, Vespertina, Nocturna)
echo.
pause

