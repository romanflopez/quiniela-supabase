-- TRIGGER: Limpieza automática para mantener solo 7 días de resultados
-- 7 días x 5 sorteos/día x 5 jurisdicciones = 175 resultados máximo

CREATE OR REPLACE FUNCTION trigger_cleanup_old_results()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Eliminar resultados de más de 7 días
    DELETE FROM public.quiniela_resultados
    WHERE fecha < CURRENT_DATE - INTERVAL '7 days';
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_cleanup_trigger ON public.quiniela_resultados;

CREATE TRIGGER auto_cleanup_trigger
    AFTER INSERT ON public.quiniela_resultados
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_cleanup_old_results();

