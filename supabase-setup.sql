-- ============================================
-- ECOPLAY - SUPABASE DATABASE SETUP
-- ============================================
-- IMPORTANTE: Si ya tienes la tabla users creada, usa supabase-migration.sql
-- Este script es para crear la tabla desde cero

-- 1. Eliminar tabla existente (CUIDADO: Esto borra todos los datos)
-- Descomenta la siguiente línea solo si quieres empezar de cero
-- DROP TABLE IF EXISTS users CASCADE;

-- 2. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  score INTEGER DEFAULT 0,
  avg_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_ranking ON users(score DESC, avg_time ASC);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de seguridad

-- Permitir que los usuarios lean todos los perfiles (para el ranking)
CREATE POLICY "Users can view all profiles"
  ON users
  FOR SELECT
  USING (true);

-- Permitir que los usuarios inserten su propio perfil
CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- Permitir que los usuarios actualicen solo su propio perfil
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- 6. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para actualizar updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Verificar que todo está correcto
SELECT 
  'Setup completado correctamente!' as status,
  COUNT(*) as total_users
FROM users;
