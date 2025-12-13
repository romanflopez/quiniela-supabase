@echo off
echo ==========================================
echo   TEST REAL - Scrapear sorteo 51774
echo   (Sin guardar en DB, solo mostrar datos)
echo ==========================================
echo.
call node scraper-by-sorteo-id.js 51774 2025-12-12
echo.
echo ==========================================
pause

