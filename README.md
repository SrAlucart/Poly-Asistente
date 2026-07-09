# 🤖 Poly Bot - Asistente Virtual Inteligente 

Poly Bot es un asistente virtual de voz interactivo y en tiempo real, diseñado para el Politécnico Superior. Cuenta con una interfaz web dinámica (Glassmorphism), reconocimiento y síntesis de voz nativa, y un cerebro impulsado por IA generativa ejecutándose de forma local.

---

## 🚀 Características Principales

* **🎙️ Voz Bidireccional:** Escucha al usuario mediante `SpeechRecognition` y responde usando síntesis neuronal.
* **⚡ Streaming de Texto:** Respuestas ultra rápidas gracias a la transmisión en tiempo real de tokens desde el backend.
* **🎨 Interfaz Dinámica (Glassmorphism):** Diseño inmersivo en modo oscuro con seguimiento visual, animaciones orgánicas y lip-sync dinámico.
* **🔒 Privacidad Local:** El cerebro (LLM) funciona de manera 100% local, sin enviar datos a la nube.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3 (Animaciones Bezier), JavaScript Vanilla (Web Speech API)
* **Backend:** Python, FastAPI, Uvicorn (Streaming Async)
* **Inteligencia Artificial:** Ollama (Llama 3.2), LangChain

---

## ⚙️ Requisitos Previos

1. Python 3.8+ instalado en el sistema
   👉 https://www.python.org/downloads/

2. Ollama instalado y ejecutándose
   👉 https://ollama.com/

3. Modelo `llama3.2` descargado en Ollama:

   ```bash
   ollama run llama3.2
   ```

4. Navegador moderno basado en Chromium (Chrome, Edge)

---

## 📦 Instalación y Despliegue

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/poly-bot.git
cd poly-bot
```

### 2. Crear y activar entorno virtual (Recomendado)

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

**Linux / Mac:**

```bash
python3 -m venv venv
source venv/bin/activate
```

---

### 3. Instalar dependencias del Backend

```bash
cd backend
pip install -r requirements.txt
```

---

### 4. Encender el servidor

Asegúrate de que Ollama esté abierto y ejecutándose, luego:

```bash
python -m uvicorn main:app --reload
```

---

### 5. Ejecutar Poly Bot

Abre tu navegador en:

👉 http://127.0.0.1:8000

---

## 🧠 Personalización

Para modificar el comportamiento del asistente:

* Edita: `backend/ai_core.py`
* Variables clave:

  * `BASE_DE_DATOS_POLI` → Información institucional
  * `INSTRUCCIONES_POLYBOT` → Personalidad y reglas del asistente

---

## 📁 Archivo requirements.txt (Recomendado)

Para asegurar compatibilidad en cualquier entorno, crea un archivo `requirements.txt` en la carpeta `/backend` con:

```txt
fastapi
uvicorn
langchain
ollama
pydantic
```

*(Puedes ajustarlo según tus dependencias reales)*

---

## ⚡ Notas Finales

* Poly Bot está diseñado para funcionar **offline con IA local**.
* Compatible con arquitecturas modernas tipo asistente Jarvis.
* Ideal para proyectos institucionales, demos avanzadas o portafolio profesional.

---

🔥 *Desarrollado para llevar asistentes virtuales al siguiente nivel.*
