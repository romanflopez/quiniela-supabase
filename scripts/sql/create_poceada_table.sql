-- ═══════════════════════════════════════════════════════════════════
-- TABLA: poceada_resultados
-- Almacena resultados de Poceada de la Ciudad
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS poceada_resultados (
    id SERIAL PRIMARY KEY,
    sorteo_id VARCHAR(20) NOT NULL,
    fecha DATE NOT NULL,
    turno VARCHAR(50) NOT NULL DEFAULT 'Poceada',
    numeros JSONB NOT NULL,
    letras JSONB,
    cabeza VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint único: un sorteo por fecha
    UNIQUE(sorteo_id, fecha)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_poceada_fecha ON poceada_resultados(fecha);
CREATE INDEX IF NOT EXISTS idx_poceada_sorteo_id ON poceada_resultados(sorteo_id);
CREATE INDEX IF NOT EXISTS idx_poceada_created_at ON poceada_resultados(created_at DESC);

-- Comentarios
COMMENT ON TABLE poceada_resultados IS 'Resultados de Poceada de la Ciudad';
COMMENT ON COLUMN poceada_resultados.sorteo_id IS 'ID del sorteo (ej: 9493)';
COMMENT ON COLUMN poceada_resultados.fecha IS 'Fecha del sorteo (YYYY-MM-DD)';
COMMENT ON COLUMN poceada_resultados.turno IS 'Turno (siempre "Poceada")';
COMMENT ON COLUMN poceada_resultados.numeros IS 'Array JSON con los 20 números';
COMMENT ON COLUMN poceada_resultados.letras IS 'Array JSON con las letras (opcional)';
COMMENT ON COLUMN poceada_resultados.cabeza IS 'Primer número (a la cabeza)';

