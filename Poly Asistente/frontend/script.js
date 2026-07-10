const btnVoz = document.getElementById('btn-hablar');
const contenedorBot = document.getElementById('polybot-contenedor');
const estadoText = document.getElementById('estado');
const transcripcionText = document.getElementById('transcripcion');
const ojosBot = document.getElementById('ojos');
const bocaBot = document.getElementById('boca');

const synth = window.speechSynthesis;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconocimiento = null;
let vozSeleccionada = null;
let frasesEnCola = 0;
let estaHablando = false;

// 1. EFECTOS DE SONIDO (SFX TIPO JARVIS)
function reproducirBeep(frecuencia, tipo, duracion) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscilador = audioCtx.createOscillator();
    const ganancia = audioCtx.createGain();
    
    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(frecuencia, audioCtx.currentTime);
    
    ganancia.gain.setValueAtTime(0.05, audioCtx.currentTime); // Volumen bajito
    ganancia.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duracion);
    
    oscilador.connect(ganancia);
    ganancia.connect(audioCtx.destination);
    oscilador.start();
    oscilador.stop(audioCtx.currentTime + duracion);
}

// 2. SEGUIMIENTO VISUAL (LOS OJOS SIGUEN TU RATÓN)
document.addEventListener('mousemove', (e) => {
    if (!ojosBot) return;
    // Calculamos la posición del ratón respecto al centro de la pantalla
    const x = (e.clientX / window.innerWidth - 0.5) * 15; // Límite de movimiento horizontal
    const y = (e.clientY / window.innerHeight - 0.5) * 15; // Límite de movimiento vertical
    
    // Movemos los ojos dinámicamente
    ojosBot.style.transform = `translate(${x}px, ${y}px)`;
});

// 3. ANIMACIÓN DE BOCA DINÁMICA (LIP-SYNC FALSO)
function animarBocaDinamica() {
    if (!bocaBot) return;
    
    if (estaHablando) {
        // Genera un tamaño aleatorio imitando sílabas
        const escalaY = 0.3 + Math.random() * 1.5;
        const escalaX = 0.9 + Math.random() * 0.3;
        bocaBot.style.transform = `scale(${escalaX}, ${escalaY})`;
        bocaBot.style.transformOrigin = "200px 165px";
        
        // Cambia la forma cada 70 milisegundos
        setTimeout(() => requestAnimationFrame(animarBocaDinamica), 70);
    } else {
        // Vuelve a la sonrisa normal
        bocaBot.style.transform = `scale(1, 1)`;
    }
}

// CARGA DE VOCES
function cargarMejorVoz() {
    const voces = synth.getVoices();
    vozSeleccionada = voces.find(v => v.lang.includes('es') && v.name.includes('Natural')) ||
                      voces.find(v => v.lang.includes('es') && v.name.includes('Online')) ||
                      voces.find(v => v.lang.includes('es') && v.name.includes('Google')) ||
                      voces.find(v => v.lang.includes('es'));
}

if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = cargarMejorVoz;
}

// CONFIGURACIÓN DEL MICRÓFONO
if (SpeechRecognition) {
    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-CO';
    reconocimiento.interimResults = false;

    reconocimiento.onstart = () => {
        reproducirBeep(800, 'sine', 0.2); // Beep de encendido
        contenedorBot.className = "bot-container escuchando";
        estadoText.innerText = "Poly Bot te escucha...";
        btnVoz.classList.add('activo');
        btnVoz.innerText = "⏹️";
    };

    reconocimiento.onerror = () => detenerEscucha();
    reconocimiento.onend = () => detenerEscucha();

    reconocimiento.onresult = async (event) => {
        reproducirBeep(400, 'sine', 0.3); // Beep de procesamiento
        const textoCapturado = event.results[0][0].transcript;
        transcripcionText.innerText = `Dijiste: "${textoCapturado}"`;
        await procesarConCerebroStreaming(textoCapturado);
    };
}

btnVoz.addEventListener('click', () => {
    if (btnVoz.classList.contains('activo')) {
        reconocimiento.stop();
    } else {
        synth.cancel();
        frasesEnCola = 0;
        estaHablando = false;
        if(reconocimiento) reconocimiento.start();
    }
});

function detenerEscucha() {
    btnVoz.classList.remove('activo');
    btnVoz.innerText = "🎙️";
    if (contenedorBot.classList.contains('escuchando')) {
        contenedorBot.className = "bot-container";
        estadoText.innerText = "Poly Bot está esperando...";
    }
}

// CONEXIÓN CON EL BACKEND (STREAMING MÁS RÁPIDO)
async function procesarConCerebroStreaming(texto) {
    contenedorBot.className = "bot-container";
    estadoText.innerText = "Analizando...";
    
    try {
        const response = await fetch('http://127.0.0.1:8000/preguntar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: texto })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let bufferTexto = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            bufferTexto += chunk;

            // Cortamos en pausas naturales para hablar de inmediato
            if (/[.,;:!?\n]/.test(chunk)) {
                const partes = bufferTexto.split(/([,.:!?\n])/);
                for(let i = 0; i < partes.length - 1; i += 2) {
                    const fraseCompleta = (partes[i] + (partes[i+1] || "")).trim();
                    if (fraseCompleta.length > 2) {
                        inyectarVozEnCola(fraseCompleta);
                    }
                }
                bufferTexto = partes[partes.length - 1];
            }
        }

        if (bufferTexto.trim().length > 0) {
            inyectarVozEnCola(bufferTexto.trim());
        }
        
    } catch (error) {
        console.error(error);
        estadoText.innerText = "Error en circuitos de memoria.";
    }
}

// GESTOR DE VOZ Y DINAMISMO FACIAL
function inyectarVozEnCola(textoFrase) {
    if (!vozSeleccionada) cargarMejorVoz();

    const textoLimpio = textoFrase.replace(/[*#_`~]/g, '').trim();
    if (textoLimpio.length < 2) return; 

    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.voice = vozSeleccionada;
    utterance.pitch = 1.15;
    utterance.rate = 1.05;

    utterance.onstart = () => {
        frasesEnCola++;
        if (!estaHablando) {
            estaHablando = true;
            animarBocaDinamica(); // Activa el dinamismo labial
        }
        contenedorBot.className = "bot-container hablando";
        estadoText.innerText = "Poly Bot hablando...";
    };

    utterance.onend = () => {
        frasesEnCola--;
        if (frasesEnCola <= 0) {
            estaHablando = false; // Detiene el dinamismo labial
            contenedorBot.className = "bot-container";
            estadoText.innerText = "Poly Bot te escucha...";
        }
    };

    synth.speak(utterance);
}

// =========================================
// MOTOR FÍSICO 2.5D (PARALLAX REACTIVO)
// =========================================
const cabeza = document.getElementById('articulacion-cabeza');
const brazoIzq = document.getElementById('brazo-izq');
const brazoDer = document.getElementById('brazo-der');
const torso = document.getElementById('torso');
const ojos = document.getElementById('ojos');

document.addEventListener('mousemove', (e) => {
    // Calculamos la posición del ratón normalizada de -1 a 1
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;

    // Aplicamos movimiento a diferentes velocidades para crear ilusión de profundidad (3D)
    if(cabeza) cabeza.style.transform = `translate(${x * 15}px, ${y * 10}px) rotate(${x * 5}deg)`;
    if(ojos) ojos.style.transform = `translate(${x * 25}px, ${y * 15}px)`; // Los ojos se mueven más rápido
    if(torso) torso.style.transform = `translate(${x * 5}px, ${y * 5}px)`;
    if(brazoIzq) brazoIzq.style.transform = `translate(${x * 20}px, ${y * 15}px) rotate(${-25 + (x * -10)}deg)`;
    if(brazoDer) brazoDer.style.transform = `translate(${x * -10}px, ${y * 15}px) rotate(${25 + (x * 10)}deg)`;
});

// Suavizado de movimiento al salir de la pantalla
document.addEventListener('mouseleave', () => {
    const elementos = [cabeza, ojos, torso, brazoIzq, brazoDer];
    elementos.forEach(el => {
        if(el) {
            el.style.transition = 'transform 0.5s ease-out';
            el.style.transform = 'translate(0px, 0px) rotate(0deg)';
        }
    });
    setTimeout(() => {
        elementos.forEach(el => { if(el) el.style.transition = 'none'; });
    }, 500);
});