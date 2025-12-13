@echo off
REM Password: w2uCMg2VbAScCKZS
REM Formato pooler: postgres.[project-ref]:[password]@aws...
set DATABASE_URL=postgresql://postgres.vvtujkedjalepkhbycpv:w2uCMg2VbAScCKZS@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
node test-db-completo.js
pause

