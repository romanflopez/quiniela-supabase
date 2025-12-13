@echo off
echo ==========================================
echo   CONFIGURAR DATABASE_URL
echo ==========================================
echo.
echo Tu DATABASE_URL actual desde Supabase Dashboard:
echo postgresql://postgres.[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
echo.
echo IMPORTANTE: Reemplaza [PASSWORD] con tu password URL-encoded
echo.
echo Para ejecutar el test con DB:
echo   set DATABASE_URL=postgresql://postgres:[PASSWORD]@db.vvtujkedjalepkhbycpv.supabase.co:5432/postgres
echo   node test-scraper.js
echo.
pause

