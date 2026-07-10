const btnVoz = document.getElementById('btn-hablar');
const contenedorBot = document.getElementById('polybot-contenedor');
const estadoText = document.getElementById('estado');
const ojosBot = document.getElementById('ojos');
const bocaBot = document.getElementById('boca');
const subtituloText = document.getElementById('texto-subtitulo');

const synth = window.speechSynthesis;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconocimiento = null;
let vozSeleccionada = null;
let frasesEnCola = 0;
let estaHablando = false;

// =========================================
// GESTIÓN DEL POP-UP PARA ESCANEAR QR
// =========================================
function abrirModalQR(titulo, rutaImagen) {
    document.getElementById('modal-titulo').innerText = titulo;
    document.getElementById('modal-img').src = rutaImagen;
    document.getElementById('qr-modal').classList.add('activo');
}

function cerrarModalQR() {
    document.getElementById('qr-modal').classList.remove('activo');
}

// =========================================
// 1. EFECTOS DE SONIDO (SFX TIPO JARVIS)
// =========================================
function reproducirBeep(frecuencia, tipo, duracion) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscilador = audioCtx.createOscillator();
    const ganancia = audioCtx.createGain();
    
    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(frecuencia, audioCtx.currentTime);
    
    ganancia.gain.setValueAtTime(0.05, audioCtx.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duracion);
    
    oscilador.connect(ganancia);
    ganancia.connect(audioCtx.destination);
    oscilador.start();
    oscilador.stop(audioCtx.currentTime + duracion);
}

// =========================================
// 2. ANIMACIÓN DE BOCA DINÁMICA (LIP-SYNC)
// =========================================
function animarBocaDinamica() {
    if (!bocaBot) return;
    
    if (estaHablando) {
        const escalaY = 0.8 + Math.random() * 0.4; // Max 1.2
        const escalaX = 0.95 + Math.random() * 0.1; // Max 1.05
        bocaBot.style.transform = `scale(${escalaX}, ${escalaY})`;
        bocaBot.style.transformOrigin = "200px 150px"; 
        
        setTimeout(() => requestAnimationFrame(animarBocaDinamica), 80);
    } else {
        bocaBot.style.transform = `scale(1, 1)`;
    }
}

// =========================================
// 3. CARGA DE VOCES
// =========================================
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

// =========================================
// 4. CONFIGURACIÓN DEL MICRÓFONO
// =========================================
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
        if(subtituloText) subtituloText.innerText = "Escuchando...";
    };

    reconocimiento.onerror = () => detenerEscucha();
    reconocimiento.onend = () => detenerEscucha();

    reconocimiento.onresult = async (event) => {
        reproducirBeep(400, 'sine', 0.3); // Beep de procesamiento
        const textoCapturado = event.results[0][0].transcript;
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
        estadoText.innerText = "Sistema en espera...";
    }
}

// =========================================
// 5. CONEXIÓN CON EL BACKEND (STREAMING)
// =========================================
async function procesarConCerebroStreaming(texto) {
    contenedorBot.className = "bot-container";
    estadoText.innerText = "Procesando...";
    if(subtituloText) subtituloText.innerText = "Procesando respuesta...";
    
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
        if(subtituloText) subtituloText.innerText = "Error al conectar con el servidor.";
    }
}

// =========================================
// 6. GESTOR DE VOZ Y SUBTÍTULOS
// =========================================
function inyectarVozEnCola(textoFrase) {
    if (!vozSeleccionada) cargarMejorVoz();

    const textoLimpio = textoFrase.replace(/[*#_`~]/g, '').trim();
    if (textoLimpio.length < 2) return; 

    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.voice = vozSeleccionada;
    utterance.pitch = 1.15;
    utterance.rate = 1.05;

    // FUSIÓN CORREGIDA: Iniciamos boca, estado y subtítulos al mismo tiempo
    utterance.onstart = () => {
        frasesEnCola++;
        if (!estaHablando) {
            estaHablando = true;
            animarBocaDinamica(); 
        }
        contenedorBot.className = "bot-container hablando";
        estadoText.innerText = "Poly Bot hablando...";
        
        if(subtituloText) {
            subtituloText.innerText = textoLimpio;
        }
    };

    utterance.onend = () => {
        frasesEnCola--;
        if (frasesEnCola <= 0) {
            estaHablando = false; 
            contenedorBot.className = "bot-container";
            estadoText.innerText = "Sistema en espera...";
            if(subtituloText) subtituloText.innerText = "Los subtítulos de Poly Bot aparecerán aquí.";
        }
    };

    synth.speak(utterance);
}

// =========================================
// 7. MOTOR FÍSICO 2.5D (PARALLAX REACTIVO)
// =========================================
const cabeza = document.getElementById('articulacion-cabeza');
const brazoIzq = document.getElementById('brazo-izq');
const brazoDer = document.getElementById('brazo-der');
const torso = document.getElementById('torso');

document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;

    if(cabeza) cabeza.style.transform = `translate(${x * 10}px, ${y * 8}px) rotate(${x * 3}deg)`;
    if(ojosBot) ojosBot.style.transform = `translate(${x * 18}px, ${y * 10}px)`; 
    if(torso) torso.style.transform = `translate(${x * 5}px, ${y * 3}px)`;
    if(brazoIzq) brazoIzq.style.transform = `translate(${x * 12}px, ${y * 8}px) rotate(${-8 + (x * -5)}deg)`;
    if(brazoDer) brazoDer.style.transform = `translate(${x * -8}px, ${y * 8}px) rotate(${8 + (x * 5)}deg)`;
});

document.addEventListener('mouseleave', () => {
    const elementos = [cabeza, ojosBot, torso, brazoIzq, brazoDer];
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