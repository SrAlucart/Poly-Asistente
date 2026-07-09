from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse # <- Nueva herramienta de velocidad
from ai_core import pensar_respuesta_stream

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Pregunta(BaseModel):
    texto: str

@app.post("/preguntar")
async def preguntar_polybot(pregunta: Pregunta):
    print(f"Usuario pregunta: {pregunta.texto}")
    # Retornamos un flujo de datos continuo en tiempo real
    return StreamingResponse(pensar_respuesta_stream(pregunta.texto), media_type="text/event-stream")

app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")