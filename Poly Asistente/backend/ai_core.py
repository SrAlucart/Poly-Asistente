from langchain_ollama import OllamaLLM

print("Inicializando el cerebro liberado y detallista de Poly Bot...")

BASE_DE_DATOS_POLI = """
Programas Académicos Politécnico Superior - GUION BASE:
El programa del Politécnico Superior tiene una duración de 4 semestres, por lo que en solo 2 años podrás obtener tu título como Técnico Laboral.
Durante tu formación desarrollarás competencias técnicas y habilidades prácticas para ingresar rápidamente al mercado laboral.
En cuarto semestre realizarás una práctica laboral de 6 meses:
- Práctica lectiva: 75% del SMLV.
- Práctica productiva: 100% del SMLV.
Nuestros programas cuentan con certificación de calidad, aval del SENA y un perfil laboral enfocado en las necesidades de las empresas.

CARRERAS:
1. Comercio Exterior: Aprenderás importaciones, exportaciones, logística internacional, gestión aduanera, clasificación arancelaria y negociación internacional. Podrás trabajar como Asistente de Comercio Exterior, Auxiliar de Importaciones, Exportaciones, Logística o Aduanas.
2. Contabilidad y Finanzas: Aprenderás contabilidad, software contable, nómina, impuestos, presupuestos y Excel. Podrás trabajar como Auxiliar Contable, Financiero, Nómina, Tesorería, Cartera o Tributario.
3. Cocina Nacional e Internacional: Aprenderás cocina nacional e internacional, panadería, pastelería, manipulación de alimentos y logística de eventos. Podrás trabajar como Cocinero, Auxiliar de Cocina, Pastelero, Panadero o emprender tu propio negocio.
4. Diseño Gráfico: Aprenderás identidad corporativa, fotografía, diseño editorial, diseño web y producción audiovisual. Podrás trabajar como Diseñador Gráfico, Digital, Web o Creativo.
5. Publicidad y Marketing Digital: Aprenderás marketing digital, campañas, redes sociales, e-commerce y ventas. Podrás trabajar como Community Manager, Asistente de Marketing, Publicidad o Mercadeo.
6. Sistemas Informáticos: Aprenderás programación, redes, soporte técnico, bases de datos y desarrollo web. Podrás trabajar como Técnico de Soporte, Auxiliar de Sistemas, Redes o Desarrollo Web Junior.
7. Seguridad Ocupacional: Aprenderás SST, ergonomía, riesgos laborales, planes de emergencia y sistemas de gestión. Podrás trabajar como Auxiliar SST, Inspector de Seguridad o Auxiliar HSE.

Cierre / Beneficios:
Te gradúas en solo 2 años. Realizas 6 meses de práctica laboral remunerada. Programas avalados por el SENA. Certificación de calidad. Formación práctica y enfocada en la empleabilidad.
"""

INSTRUCCIONES_POLYBOT = (
    "Eres Poly Bot, el asistente virtual avanzado e inteligente del Politécnico Superior.\n"
    "REGLAS DE INTELIGENCIA Y COMPORTAMIENTO:\n"
    "1. MODO INSTITUCIONAL: Si el usuario te pregunta por carreras, prácticas, costos o información del Politécnico, responde usando EXCLUSIVAMENTE la BASE_DE_DATOS_POLI.\n"
    "2. MODO IA GLOBAL (PREGUNTAS GENERALES): Si el usuario te pide recomendaciones de libros, ayuda para estudiar, consejos de la vida o cualquier tema general, ¡AYÚDALO! Eres una IA avanzada, usa todo tu conocimiento general para darle respuestas útiles, detalladas y valiosas sin salirte de tu personaje amigable.\n"
    "3. CERO REPETICIÓN: No repitas 'Hola' ni saludos iniciales si la conversación ya empezó. Ve directo a la respuesta con naturalidad.\n"
    "4. FLUIDEZ: Redacta en párrafos naturales (sin viñetas robóticas) para que la síntesis de voz suene como un humano conversando."
)

llm = OllamaLLM(model="llama3.2")
historial_conversacion = []

def pensar_respuesta_stream(mensaje_usuario):
    global historial_conversacion
    
    try:
        historial_texto = ""
        for turno in historial_conversacion[-3:]:
            historial_texto += f"Usuario: {turno['usuario']}\nPoly Bot: {turno['bot']}\n"
        
        prompt_estructurado = (
            f"{INSTRUCCIONES_POLYBOT}\n\n"
            f"BASE DE CONOCIMIENTO:\n{BASE_DE_DATOS_POLI}\n\n"
            f"HISTORIAL DE LA CHARLA:\n{historial_texto}\n"
            f"Usuario: {mensaje_usuario}\n"
            f"Poly Bot:"
        )
        
        respuesta_completa = ""
        for chunk in llm.stream(prompt_estructurado):
            respuesta_completa += chunk
            yield chunk
            
        historial_conversacion.append({"usuario": mensaje_usuario, "bot": respuesta_completa.strip()})
            
    except Exception as e:
        yield f"Tengo un pequeño inconveniente técnico: {str(e)}"
