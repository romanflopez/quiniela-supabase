-- ═══════════════════════════════════════════════════════════════════
-- LIMPIAR BASE DE DATOS - Elimina todos los resultados
-- ═══════════════════════════════════════════════════════════════════
-- IMPORTANTE: Solo usar para testing. En producción el trigger limpia automáticamente.

-- Ver cantidad de registros antes de limpiar
SELECT COUNT(*) as "Registros actuales" FROM quiniela_resultados;

-- Eliminar todos los registros
DELETE FROM quiniela_resultados;

-- Verificar que está vacía
SELECT COUNT(*) as "Registros después de limpiar" FROM quiniela_resultados;

-- Opcional: Resetear el autoincrement del ID
-- ALTER SEQUENCE quiniela_resultados_id_seq RESTART WITH 1;


