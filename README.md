# ♻️ EcoPlay - Juego de Reciclaje Bilingüe

Una aplicación web educativa bilingüe (Español/Inglés) diseñada para enseñar a niños sobre reciclaje a través de un juego interactivo de arrastrar y soltar.

## 🎮 Características

- **Sistema de Login**: Autenticación segura con Supabase
- **Juego Drag & Drop**: Arrastra diferentes tipos de basura a los contenedores correctos
- **Bilingüe**: Interfaz en español con subtítulos en inglés
- **5 Categorías de Reciclaje**: Plástico, Papel, Vidrio, Metal y Orgánico
- **Sistema de Puntos**: Gana 10 puntos por cada respuesta correcta
- **Ranking Global**: Tabla de clasificación en tiempo real con todos los jugadores
- **Diseño Moderno**: Estilo neobrutalist con efectos 3D y animaciones
- **Responsive**: Optimizado para dispositivos móviles y tablets
- **Persistencia Real**: Los puntajes se guardan en Supabase

## 🚀 Tecnologías

- HTML5
- CSS3 (con efectos glassmorphism y neobrutalist)
- JavaScript Vanilla
- Supabase (Backend as a Service)
  - Authentication
  - PostgreSQL Database
  - Row Level Security (RLS)
- Google Fonts (Poppins)

## 📱 Cómo Usar

### Configuración Inicial (Solo una vez)

1. Sigue las instrucciones en `SUPABASE-SETUP.md` para configurar la base de datos
2. Actualiza tu API Key en `supabase-config.js`

### Uso de la Aplicación

1. Abre `index.html` en tu navegador
2. Crea una cuenta con email y contraseña
3. Inicia sesión
4. Arrastra los items a los contenedores correctos
5. Acumula puntos y compite en el ranking global

## 🎨 Diseño

- Colores eco-friendly (verdes y tonos naturales)
- Animaciones suaves y atractivas
- Interfaz intuitiva para niños
- Efectos 3D en el registro
- Feedback visual inmediato

## 📦 Estructura del Proyecto

```
EcoPlay/
├── index.html      # Estructura principal
├── styles.css      # Estilos y animaciones
├── app.js          # Lógica del juego
└── README.md       # Documentación
```

## 🌍 Objetivo Educativo

EcoPlay busca enseñar a los niños la importancia del reciclaje de manera divertida e interactiva, mientras aprenden vocabulario en inglés relacionado con el medio ambiente.

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

---

Hecho con 💚 para un planeta más limpio
