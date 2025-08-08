// Ultron — client-side web assistant (no fake scan)
// Uses Web Speech API & Speech Synthesis

const logEl = document.getElementById('log');
const micBtn = document.getElementById('micBtn');
const stopBtn = document.getElementById('stopBtn');

function log(text, who='system'){
  const div = document.createElement('div');
  div.className = `entry ${who}`;
  div.textContent = `${who === 'user' ? '🎤 You: ' : who === 'ultron' ? '🧠 Ultron: ' : 'ℹ️ '}${text}`;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function speak(text){
  log(text, 'ultron');
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  const voices = speechSynthesis.getVoices();
  if (voices.length) {
    utterance.voice = voices.find(v => /en-US|Google US|Microsoft/gi.test(v.name)) || voices[0];
  }
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

let listening = false;

async function handleCommand(text){
  text = text.toLowerCase().trim();
  if (!text) { speak("I didn't catch that, Captain."); return; }
  log(text, 'user');

  if (/^(exit|shutdown|stop|sleep|bye)\b/.test(text)){
    speak("Shutting down. Until next time, Captain.");
    stopListening();
  } else if (/\b(hello|hi|hey)\b/.test(text)){
    speak("Hello, Captain. At your service. Ask me something — for example: 'time', 'date', 'tell a joke', or 'open github'.");
  } else if (/\btime\b/.test(text)){
    const t = new Date();
    speak(`Local time is ${t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);
  } else if (/\bdate\b/.test(text)){
    const d = new Date();
    speak(`Today is ${d.toLocaleDateString()}.`);
  } else if (/\b(status|how are you|state)\b/.test(text)){
    speak("Systems nominal. Listening for your commands.");
  } else if (/\bjoke\b/.test(text)){
    const jokes = [
      "Why did the programmer quit his job? Because he didn't get arrays.",
      "I told my Wi-Fi it was insecure. It just laughed and gave me a weak password.",
      "Why do Java developers wear glasses? Because they can't C#."
    ];
    speak(jokes[Math.floor(Math.random()*jokes.length)]);
  } else if (/\bopen github\b/.test(text)){
    speak("Opening GitHub.");
    window.open('https://github.com', '_blank');
  } else if (/\bhelp\b/.test(text)){
    speak("Try commands like: 'time', 'date', 'tell a joke', 'open GitHub', or 'shutdown'.");
  } else {
    speak("Command not recognized. Say 'help' for examples.");
  }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer;

if (SpeechRecognition) {
  recognizer = new SpeechRecognition();
  recognizer.lang = 'en-US';
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;
  recognizer.continuous = false;

  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleCommand(transcript);
  };

  recognizer.onend = () => {
    if (listening) {
      setTimeout(() => recognizer.start(), 300);
    }
  };

  recognizer.onerror = (event) => {
    console.error('Speech recognition error', event);
    speak("Speech recognition error occurred.");
  };
} else {
  speak("Speech recognition not supported in this browser. Use Chrome or Edge.");
  log("SpeechRecognition API not found.", 'system');
}

function startListening(){
  if (!SpeechRecognition) return;
  listening = true;
  micBtn.textContent = "🎙️ Listening...";
  micBtn.disabled = true;
  stopBtn.disabled = false;
  speak("Awaiting your command, Captain...");
  try {
    recognizer.start();
  } catch(e){
    console.warn("recognizer start error:", e);
  }
}

function stopListening(){
  listening = false;
  micBtn.textContent = "🎙️ Start Listening";
  micBtn.disabled = false;
  stopBtn.disabled = true;
  if (recognizer) {
    try { recognizer.stop(); } catch(e) {}
  }
  speak("Stopped listening.");
}

micBtn.addEventListener('click', startListening);
stopBtn.addEventListener('click', stopListening);

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'v') {
    if (listening) stopListening(); else startListening();
  }
});

log("Ultron initialized. Press the mic button or press 'v' to toggle listening.", 'system');
