# 🔄 Guía de Migración - Agregar avg_time

## ⚠️ Situación

Ya tienes la tabla `users` creada pero te falta la columna `avg_time`.

## ✅ Solución Rápida

### Opción 1: Usar el script de migración (RECOMENDADO)

1. Ve a Supabase SQL Editor
2. Copia y pega el contenido de `supabase-migration.sql`
3. Click en "Run" o presiona `Ctrl + Enter`
4. ¡Listo! La columna se agregará sin perder datos

### Opción 2: Comando manual

Si prefieres hacerlo manualmente, ejecuta esto en SQL Editor:

```sql
-- Agregar columna avg_time
ALTER TABLE users ADD COLUMN IF NOT EXISTS avg_time INTEGER DEFAULT 0;

-- Actualizar usuarios existentes
UPDATE users SET avg_time = 0 WHERE avg_time IS NULL;

-- Crear índice para ranking
CREATE INDEX IF NOT EXISTS idx_users_ranking ON users(score DESC, avg_time ASC);

-- Verificar
SELECT * FROM users LIMIT 5;
```

### Opción 3: Empezar de cero (BORRA TODOS LOS DATOS)

⚠️ **ADVERTENCIA: Esto eliminará todos los usuarios y puntajes**

1. Ve a Supabase SQL Editor
2. Ejecuta:

```sql
DROP TABLE IF EXISTS users CASCADE;
```

3. Luego ejecuta todo el contenido de `supabase-setup.sql`

## 🔍 Verificar que funcionó

Ejecuta esto en SQL Editor:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

Deberías ver:

- ✅ id
- ✅ auth_id
- ✅ name
- ✅ email
- ✅ score
- ✅ **avg_time** ← Esta es la nueva
- ✅ created_at
- ✅ updated_at

## 🐛 Troubleshooting

### Error: "column avg_time does not exist"

- Ejecuta `supabase-migration.sql`
- O usa la Opción 2 (comando manual)

### Error: "relation users does not exist"

- La tabla no existe, usa `supabase-setup.sql` completo

### Error: "column avg_time already exists"

- ¡Perfecto! Ya está agregada, no necesitas hacer nada

## 📊 Estructura Final

```
users
├── id (UUID) - Primary Key
├── auth_id (UUID) - Foreign Key
├── name (TEXT)
├── email (TEXT) - UNIQUE
├── score (INTEGER) - Default 0
├── avg_time (INTEGER) - Default 0 ← NUEVO
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🎮 Después de la migración

1. Actualiza la API Key en `app.js` (línea 24)
2. Abre la app en el navegador
3. Crea una cuenta o inicia sesión
4. Juega una partida
5. Ve al ranking y verifica que aparece el tiempo ⏱️

¡Listo! Ahora el ranking ordenará por puntaje y tiempo promedio.
