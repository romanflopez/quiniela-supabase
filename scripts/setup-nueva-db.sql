-- ═══════════════════════════════════════════════════════════════════
-- SETUP BASE DE DATOS - Nueva Instancia de Supabase
-- ═══════════════════════════════════════════════════════════════════

-- Crear tabla de resultados
CREATE TABLE IF NOT EXISTS quiniela_resultados (
    id BIGSERIAL PRIMARY KEY,
    jurisdiccion VARCHAR(50) NOT NULL,
    sorteo_id VARCHAR(20) NOT NULL,
    fecha DATE NOT NULL,
    turno VARCHAR(20) NOT NULL,
    numeros TEXT[] NOT NULL,
    letras TEXT[],
    cabeza VARCHAR(4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(jurisdiccion, sorteo_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_jurisdiccion ON quiniela_resultados(jurisdiccion);
CREATE INDEX IF NOT EXISTS idx_fecha ON quiniela_resultados(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_turno ON quiniela_resultados(turno);
CREATE INDEX IF NOT EXISTS idx_sorteo ON quiniela_resultados(sorteo_id);

-- Habilitar Row Level Security (opcional, pero recomendado)
ALTER TABLE quiniela_resultados ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos (para la API pública)
CREATE POLICY "Allow public read access" ON quiniela_resultados
    FOR SELECT USING (true);

-- Verificar que se creó correctamente
SELECT 
    'Tabla creada exitosamente' as status,
    COUNT(*) as total_registros
FROM quiniela_resultados;

