# 🤔 ¿Qué script SQL debo usar?

## 📊 Situaciones y Soluciones

### 1️⃣ NO tengo ninguna tabla users

**Usa:** `supabase-fresh-install.sql`

✅ Crea todo desde cero
✅ Incluye la columna avg_time
✅ Configura todo automáticamente

---

### 2️⃣ Tengo la tabla users PERO me falta avg_time

**Usa:** `supabase-migration.sql`

✅ Solo agrega la columna avg_time
✅ No borra datos existentes
✅ Mantiene tus usuarios y puntajes

---

### 3️⃣ Tengo la tabla users y quiero empezar de cero

**Usa:** `supabase-fresh-install.sql`

⚠️ BORRA todos los datos
✅ Crea todo limpio y nuevo
✅ Incluye avg_time desde el inicio

---

## 🚀 Pasos para ejecutar

### Para cualquier script:

1. Ve a Supabase Dashboard
2. Click en "SQL Editor"
3. Click en "New Query"
4. Copia y pega el contenido del archivo
5. Click en "Run" (o Ctrl + Enter)
6. Espera el mensaje de éxito

---

## 🔍 ¿Cómo saber cuál es mi situación?

Ejecuta esto en SQL Editor:

```sql
-- Ver si existe la tabla
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'users'
);

-- Ver las columnas de la tabla (si existe)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Resultados:**

- Si dice `false` → Situación 1 (no tienes tabla)
- Si muestra columnas SIN `avg_time` → Situación 2 (falta columna)
- Si muestra columnas CON `avg_time` → ¡Ya está todo listo! 🎉

---

## ❌ Error: "column avg_time does not exist"

Este error significa que estás en la **Situación 2**.

**Solución:**

1. Usa `supabase-migration.sql` (NO uses supabase-setup.sql)
2. O usa `supabase-fresh-install.sql` si no te importa perder datos

---

## ✅ Verificar que funcionó

Después de ejecutar cualquier script, verifica:

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

Deberías ver estas columnas:

- ✅ id
- ✅ auth_id
- ✅ name
- ✅ email
- ✅ score
- ✅ **avg_time** ← Esta es la importante
- ✅ created_at
- ✅ updated_at

---

## 🆘 Ayuda Rápida

### "No sé qué hacer"

→ Usa `supabase-fresh-install.sql` (empezar de cero)

### "Tengo usuarios y no quiero perderlos"

→ Usa `supabase-migration.sql` (solo agrega avg_time)

### "Sigo teniendo errores"

→ Usa `supabase-fresh-install.sql` (limpia todo y empieza de nuevo)

---

## 📝 Resumen de Archivos

| Archivo                      | Cuándo usarlo                   | Borra datos |
| ---------------------------- | ------------------------------- | ----------- |
| `supabase-fresh-install.sql` | Primera vez o empezar de cero   | ✅ SÍ       |
| `supabase-migration.sql`     | Ya tienes tabla, falta avg_time | ❌ NO       |
| `supabase-setup.sql`         | ⚠️ NO USAR (obsoleto)           | -           |

---

## 🎯 Recomendación

Si tienes dudas, usa **`supabase-fresh-install.sql`**

Es la forma más segura de tener todo funcionando correctamente.
