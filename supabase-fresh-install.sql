-- ============================================
-- ECOPLAY - INSTALACIÓN LIMPIA
-- ============================================
-- ⚠️ ADVERTENCIA: Este script ELIMINA la tabla users y todos sus datos
-- Solo usa esto si quieres empezar completamente de cero

-- 1. Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- 2. Eliminar trigger y función
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. Eliminar tabla
DROP TABLE IF EXISTS users CASCADE;

-- 4. Crear tabla desde cero
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  score INTEGER DEFAULT 0,
  avg_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear índices
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_score ON users(score DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_ranking ON users(score DESC, avg_time ASC);

-- 6. Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas de seguridad
CREATE POLICY "Users can view all profiles"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- 8. Crear función para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Verificar
SELECT 
  '✅ Instalación completada!' as status,
  'Tabla users creada con éxito' as message;

-- 11. Mostrar estructura
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
