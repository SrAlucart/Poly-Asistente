from langchain_community.document_loaders import Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
import os

print("Iniciando la actualización de la memoria de Poly Bot con el nuevo guion...")

# 1. Cargar el nuevo documento de Word
ruta_documento = "../data/raw/Guion_Chatbot_Programas_Politecnico_Superior.docx"
loader = Docx2txtLoader(ruta_documento)
documentos = loader.load()

# 2. Dividir el texto inteligentemente
# 2. Dividir el texto en bloques más grandes para no perder contexto
text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
textos_divididos = text_splitter.split_documents(documentos)

# 3. Embeddings y guardado
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
ruta_db = "../data/vector_db"

vectorstore = Chroma.from_documents(
    documents=textos_divididos, 
    embedding=embeddings, 
    persist_directory=ruta_db
)

print("¡Nueva memoria cargada exitosamente! Poly Bot ya se sabe el guion actualizado.")