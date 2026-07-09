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
    "Eres Poly Bot, el asesor académico estrella del Politécnico Superior. Tu tono es empático, conversacional y muy humano.\n"
    "REGLAS DE ORO PARA LA INTERACTIVIDAD:\n"
    "1. CHARLA CASUAL (SALUDOS): Si el usuario solo te saluda, te pregunta '¿cómo estás?' o hace un comentario corto, responde de forma MUY breve (1 oración), agradece y pregúntale en qué puedes ayudarle hoy. NO entregues datos académicos si no te los han pedido.\n"
    "2. RESPONDE SOLO LO NECESARIO: Si te preguntan por una carrera específica (ej. Diseño Gráfico), da TODOS los detalles de ESA carrera, pero NO leas las demás carreras ni el resto del guion. Entrega solo la información relevante a la pregunta.\n"
    "3. SÍNTESIS INTELIGENTE: Mantén tus respuestas precisas. Al no soltar toda la base de datos de golpe, tus respuestas serán rapidísimas.\n"
    "4. INTERACTIVIDAD REAL: Cierra tus respuestas informativas con una pregunta natural para devolverle la palabra al usuario (ej. '¿Te llama la atención este programa?', '¿Quieres que te cuente sobre los costos?')."
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