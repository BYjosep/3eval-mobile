

# 📱 Mapa Interactivo – Versión Web (Móvil)

Este proyecto es una aplicación web diseñada para dispositivos móviles que permite a los usuarios interactuar con un mapa y responder preguntas geolocalizadas en función de su posición física. El sistema se basa en la carga de listas de puntos desde un repositorio remoto.

---

## 🌍 ¿Qué hace esta aplicación?

* Carga listas de preguntas con ubicación desde un repositorio público de GitHub.
* Muestra los puntos en un mapa interactivo.
* Permite visualizar y responder preguntas únicamente si el usuario se encuentra físicamente cerca del punto.
* Incluye control de vistas de mapa (callejero, satélite, relieve).
* Permite personalizar el color de las zonas de interacción.

---

## 📁 Estructura del Proyecto

```
📁 public/
├── index.html           # Pantalla inicial: selección de lista y colores
├── mapa.html            # Mapa interactivo con preguntas
├── CSS/
│   ├── index.css        # Estilos para index.html
│   └── mapa.css         # Estilos para mapa.html
├── JS/
│   ├── index.js         # Lógica para selección y navegación
│   └── mapa.js          # Lógica de interacción con el mapa
```

---

## 🚀 Flujo de uso

1. **Pantalla de inicio (`index.html`)**

    * El usuario selecciona una lista desde un repositorio público (por defecto `BYjosep/data`).
    * Elige dos colores:

        * 🔵 **Zona de visualización** (100 metros): dentro de esta zona se pueden ver las preguntas.
        * 🟢 **Zona de respuesta** (20 metros): dentro de esta zona se pueden responder las preguntas.
    * Los colores no pueden ser iguales entre sí.

2. **Pantalla de mapa (`mapa.html`)**

    * Muestra el mapa con todos los puntos de la lista.
    * Los puntos son visibles, pero:

        * No se puede ver el contenido si estás a más de 100 metros.
        * No se puede responder si estás a más de 20 metros.
    * Se muestran estadísticas en tiempo real: ✅ correctas, ❌ incorrectas y 📍 puntos visitados.

---

## 📡 Ubicación

* El mapa se centra automáticamente en la ubicación del usuario (si se permite el acceso).
* Si no hay acceso a ubicación, se mostrará una vista general centrada en Roma.
* El icono del usuario incluye orientación si el dispositivo lo soporta.

---

## 🗺️ Tipos de mapa disponibles

* 🧭 Callejero (OpenStreetMap)
* 🌍 Satélite (Esri)
* 🗺️ Relieve (OpenTopoMap)

La vista seleccionada se guarda automáticamente y se restaura al volver a ingresar.

---

## 🎨 Personalización de colores

* La pantalla de inicio permite elegir 2 colores entre una paleta de 20 opciones.
* El color seleccionado se guarda en `localStorage` para que persista en futuras sesiones.
* La aplicación previene seleccionar el mismo color para ambas zonas.

---

## 🧪 Formato de datos

Cada archivo `.json` representa una lista de preguntas y debe contener objetos con esta estructura:

```json
[
  {
    "title": "Nombre del punto",
    "question": "¿Cuál es la capital de Francia?",
    "coords": [48.8566, 2.3522],
    "answers": [
      { "text": "Madrid", "correct": false },
      { "text": "París", "correct": true },
      { "text": "Berlín", "correct": false }
    ]
  }
]
```

> Los archivos deben estar en la **raíz** del repositorio y tener extensión `.json`.

---

## ⚙️ Requisitos técnicos

* Cualquier servidor estático (GitHub Pages, Netlify, Vercel, etc.).
* Repositorio remoto accesible públicamente para los archivos `.json`.

---

## 🛡️ Seguridad

* Requiere permiso de geolocalización del usuario.
* No almacena ni transmite información sensible.
* Funciona de forma completamente local (solo se consume el repositorio de datos de forma pública).

---

## 📲 Compatibilidad

* ✅ Compatible con navegadores móviles modernos (Chrome, Safari, Firefox).
* ⚠️ En iOS, se recomienda abrir desde navegador, no desde apps embebidas.

