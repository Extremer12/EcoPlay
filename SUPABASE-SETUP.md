# 🔧 Configuración de Supabase para EcoPlay

## 📋 Pasos para configurar la base de datos

### 1. Obtener tu API Key

Ya tienes estos datos:

- **Project URL**: `https://okciuqlwsbrdyshybbqb.supabase.co`
- **Anon Key**: (La que te proporcionaron)

### 2. Actualizar la API Key en el código

Abre el archivo `supabase-config.js` y reemplaza `SUPABASE_ANON_KEY` con tu key real:

```javascript
const SUPABASE_ANON_KEY = "TU_KEY_AQUI";
```

### 3. Crear la tabla en Supabase

**⚠️ IMPORTANTE:** ¿Ya tienes la tabla `users` creada?

- ✅ **SÍ** → Usa `supabase-migration.sql` (ver `MIGRATION-GUIDE.md`)
- ❌ **NO** → Sigue estos pasos:

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Click en "SQL Editor" en el menú lateral
3. Click en "New Query"
4. Copia y pega TODO el contenido del archivo `supabase-setup.sql`
5. Click en "Run" o presiona `Ctrl + Enter`

Esto creará:

- ✅ Tabla `users` con todos los campos necesarios
- ✅ Columna `avg_time` para tiempo promedio
- ✅ Índices para mejor performance
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de seguridad configuradas
- ✅ Triggers automáticos

### 4. Verificar la configuración

1. Ve a "Table Editor" en Supabase
2. Deberías ver la tabla `users` con estas columnas:
   - `id` (UUID, Primary Key)
   - `auth_id` (UUID, Foreign Key a auth.users)
   - `name` (TEXT)
   - `email` (TEXT, UNIQUE)
   - `score` (INTEGER, default 0)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### 5. Configurar Authentication

1. Ve a "Authentication" > "Providers" en Supabase
2. Asegúrate de que "Email" esté habilitado
3. En "Email Auth" > "Confirm email": Puedes deshabilitarlo para desarrollo (los usuarios no necesitarán confirmar email)

### 6. Probar la aplicación

1. Abre `index.html` en tu navegador
2. Crea una cuenta nueva (Sign Up)
3. Inicia sesión (Login)
4. Juega y verifica que el puntaje se guarde
5. Ve al Ranking y verifica que aparezcan los usuarios

## 🔒 Seguridad

Las políticas RLS están configuradas para:

- ✅ Todos pueden ver todos los perfiles (necesario para el ranking)
- ✅ Solo puedes crear tu propio perfil
- ✅ Solo puedes actualizar tu propio perfil
- ✅ No puedes eliminar perfiles (solo Supabase puede hacerlo si eliminas la cuenta)

## 🐛 Troubleshooting

### Error: "Supabase no está inicializado"

- Verifica que la API Key esté correctamente configurada en `supabase-config.js`
- Asegúrate de que el script de Supabase se cargue antes de `app.js`

### Error: "relation 'users' does not exist"

- Ejecuta el script SQL en Supabase SQL Editor
- Verifica que la tabla se haya creado correctamente

### Los usuarios no pueden registrarse

- Ve a Authentication > Settings en Supabase
- Verifica que "Enable email signups" esté habilitado

### El ranking no muestra usuarios

- Verifica que las políticas RLS estén configuradas correctamente
- Revisa la consola del navegador para ver errores

## 📊 Estructura de la Base de Datos

```
users
├── id (UUID) - ID único del usuario
├── auth_id (UUID) - ID de autenticación de Supabase
├── name (TEXT) - Nombre del usuario
├── email (TEXT) - Email del usuario
├── score (INTEGER) - Puntaje acumulado
├── created_at (TIMESTAMP) - Fecha de creación
└── updated_at (TIMESTAMP) - Última actualización
```

## 🚀 Funcionalidades

- ✅ Registro de usuarios con email y contraseña
- ✅ Login seguro con Supabase Auth
- ✅ Puntajes guardados en tiempo real
- ✅ Ranking global de todos los usuarios
- ✅ Sesión persistente (no necesitas volver a loguearte)
- ✅ Logout seguro

## 📝 Notas

- Los puntajes se guardan automáticamente cada vez que aciertas
- El ranking se actualiza en tiempo real desde la base de datos
- Tu usuario actual se destaca en el ranking con un borde verde
- Los datos persisten incluso si cierras el navegador
