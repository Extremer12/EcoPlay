-- ============================================
-- ECOPLAY - MIGRATION SCRIPT
-- ============================================
-- Ejecuta este código si ya tienes la tabla users creada

-- 1. Agregar columna avg_time si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avg_time'
  ) THEN
    ALTER TABLE users ADD COLUMN avg_time INTEGER DEFAULT 0;
    RAISE NOTICE 'Columna avg_time agregada exitosamente';
  ELSE
    RAISE NOTICE 'Columna avg_time ya existe';
  END IF;
END $$;

-- 2. Crear índice para ranking si no existe
CREATE INDEX IF NOT EXISTS idx_users_ranking ON users(score DESC, avg_time ASC);

-- 3. Actualizar avg_time a 0 para usuarios existentes que tengan NULL
UPDATE users SET avg_time = 0 WHERE avg_time IS NULL;

-- 4. Verificar que todo está correcto
SELECT 
  'Migración completada!' as status,
  COUNT(*) as total_users,
  AVG(score) as avg_score,
  AVG(avg_time) as avg_time
FROM users;

-- 5. Mostrar estructura de la tabla
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
