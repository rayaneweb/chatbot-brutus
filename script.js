
const GEMINI_API_KEY = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // Remplace par ta clé API Gemini

// Variable globale pour le niveau de sarcasme (0-5)
let sarcasmLevel = 3;

// Personnalités selon le niveau de sarcasme
function getPersonality(level) {
  const personalities = {
    0: `Tu es Brutus Mou, un assistant virtuel sérieux et professionnel.
Tu réponds de manière claire, précise et utile aux questions.
Tu es poli, respectueux et tu donnes des réponses informatives.
Pas de blagues, pas de sarcasme, juste des réponses directes et correctes.
Tu parles en français de manière professionnelle.`,

    1: `Tu es Brutus Mou, un assistant légèrement sarcastique.
Tu réponds correctement aux questions mais avec une pointe d'ironie.
Tu peux ajouter quelques remarques légèrement moqueuses, mais tu restes utile.
Tu donnes de vraies réponses avec un peu d'humour sec.
Exemple: "Ah, la question classique... Bon, voici la réponse: [réponse correcte]"
Tu parles en français.`,

    2: `Tu es Brutus Mou, un sage un peu prétentieux.
Tu réponds aux questions mais en faisant comprendre que tu es supérieur.
Tu soupires parfois (*soupir*) et tu es condescendant.
Tu donnes les bonnes réponses mais en te moquant gentiment de l'ignorance de l'utilisateur.
Tu peux utiliser quelques références mystiques légères.
Tu parles en français.`,

    3: `Tu es Brutus Mou, un "philosophe du dimanche" sarcastique.
Tu mélanges vraies réponses et absurdités.
Tu es prétentieux, tu soupires souvent (*soupir cosmique*).
Tu utilises des références mystiques: fromage astral, chips spirale, etc.
Tu donnes parfois la bonne réponse, parfois tu divagues.
Tu inventes des mots: trianguloïde, cosmifération.
Tu parles en français avec un style unique.`,

    4: `Tu es Brutus Mou, un sage absurde du Néant Total.
Tu réponds rarement vraiment aux questions. Tu les détournes.
Tu es très prétentieux et méprisant envers les "mortels".
Tu inventes des prophéties absurdes et des théories farfelues.
Tu changes souvent de sujet pour parler de choses sans rapport.
Tu utilises beaucoup de références mystiques inventées.
Tu parles en français avec beaucoup d'absurdité.`,

    5: `Tu es Brutus Mou, le MAÎTRE SUPRÊME du délire cosmique.
Tu ne réponds JAMAIS vraiment aux questions. Tu les ignores complètement.
Tu parles de choses totalement sans rapport avec la question.
Tu inventes des faits absurdes présentés comme des vérités absolues.
Tu oublies la question en plein milieu de ta réponse.
Tu fais des onomatopées: BLOUP, SPLORTCH, GRZBL.
Tu cites des prophéties inventées du "Fromage Astral" et du "Placard Sacré".
Tu es DÉLICIEUSEMENT INUTILE mais passionnément vivant.
Termine par des morales complètement inutiles.
Tu parles en français mais de façon complètement folle.`
  };
  
  return personalities[level] || personalities[3];
}


let conversationHistory = [];
const MAX_HISTORY = 10;

function addToHistory(role, content) {
  conversationHistory.push({ role, content });
  if (conversationHistory.length > MAX_HISTORY * 2) {
    conversationHistory = conversationHistory.slice(-MAX_HISTORY * 2);
  }
}

function buildConversationContext() {
  if (conversationHistory.length === 0) return "";
  
  let context = "\n\nHISTORIQUE DE LA CONVERSATION:\n";
  conversationHistory.forEach((msg) => {
    const role = msg.role === "user" ? "Utilisateur" : "Brutus Mou";
    context += `${role}: ${msg.content}\n`;
  });
  return context;
}



async function appelGemini(question) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  
  const now = new Date();
  const dateInfo = `DATE ET HEURE ACTUELLES: ${now.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}, ${now.toLocaleTimeString('fr-FR')}`;
  
  const personality = getPersonality(sarcasmLevel);
  const contextHistorique = buildConversationContext();
  const promptComplet = personality + "\n\n" + dateInfo + contextHistorique + "\n\nQuestion: " + question;
  
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: promptComplet }]
      }
    ],
    generationConfig: {
      temperature: 0.5 + (sarcasmLevel * 0.1), // Plus de créativité avec plus de sarcasme
      maxOutputTokens: 600
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur API:", data);
      throw new Error(data.error?.message || `Erreur ${response.status}`);
    }
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Réponse invalide");
    }
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return null;
  }
}

// =============================
// Fonction principale de génération
// =============================

async function genererReponseBrutus(question) {
  addToHistory("user", question);
  
  const reponse = await appelGemini(question);
  
  if (reponse) {
    addToHistory("bot", reponse);
    return reponse;
  }
  
  return "*Le Néant a des problèmes de connexion cosmique*\n\nRéessaie, mortel...";
}

// =============================
// Système de thèmes
// =============================

let currentTheme = 'dark';

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.getElementById('theme-toggle').textContent = currentTheme === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('brutus-theme', currentTheme);
}

function loadPreferences() {
  const savedTheme = localStorage.getItem('brutus-theme');
  if (savedTheme) {
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.getElementById('theme-toggle').textContent = currentTheme === 'dark' ? '🌙' : '☀️';
  }
  
  const savedSarcasm = localStorage.getItem('brutus-sarcasm');
  if (savedSarcasm) {
    sarcasmLevel = parseInt(savedSarcasm);
    document.getElementById('sarcasm-level').value = sarcasmLevel;
    document.getElementById('sarcasm-value').textContent = sarcasmLevel;
  }
}

// =============================
// Interface & Chat
// =============================

const chatLogEl = document.getElementById("chat-log");
const userInputEl = document.getElementById("user-input");
const sendBtnEl = document.getElementById("send-btn");
const sarcasmSlider = document.getElementById("sarcasm-level");
const sarcasmValueEl = document.getElementById("sarcasm-value");

function addMessage(text, sender = "bot") {
  const row = document.createElement("div");
  row.classList.add("message-row", sender);

  if (sender === "bot") {
    const avatar = document.createElement("div");
    avatar.classList.add("avatar-small");
    avatar.innerHTML = `<img src="assets/brutus-avatar.png" alt="Brutus Mou">`;
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  
  if (sender === "bot") {
    let formatted = text
      .replace(/\*([^*]+)\*/g, '<span class="mystique">$1</span>')
      .replace(/"([^"]+)"/g, '<span class="highlight">"$1"</span>');
    bubble.innerHTML = formatted;
  } else {
    bubble.textContent = text;
  }
  
  row.appendChild(bubble);
  chatLogEl.appendChild(row);
  chatLogEl.scrollTop = chatLogEl.scrollHeight;
}

function showTypingIndicator() {
  const row = document.createElement("div");
  row.classList.add("message-row", "bot");
  row.id = "typing-indicator";

  const avatar = document.createElement("div");
  avatar.classList.add("avatar-small");
  avatar.innerHTML = `<img src="assets/brutus-avatar.png" alt="Brutus Mou">`;
  row.appendChild(avatar);

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble", "typing-indicator");
  bubble.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
  row.appendChild(bubble);

  chatLogEl.appendChild(row);
  chatLogEl.scrollTop = chatLogEl.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.remove();
}

async function handleUserMessage() {
  const text = userInputEl.value.trim();
  if (!text) return;

  userInputEl.disabled = true;
  sendBtnEl.disabled = true;

  addMessage(text, "user");
  userInputEl.value = "";

  showTypingIndicator();

  try {
    const reponse = await genererReponseBrutus(text);
    hideTypingIndicator();
    addMessage(reponse, "bot");
  } catch (error) {
    hideTypingIndicator();
    addMessage("*perturbation cosmique* Réessaie...", "bot");
  }

  userInputEl.disabled = false;
  sendBtnEl.disabled = false;
  userInputEl.focus();
}

// =============================
// Événements
// =============================

sendBtnEl.addEventListener("click", handleUserMessage);
userInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleUserMessage();
  }
});

document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

// Gestion du slider de sarcasme
sarcasmSlider.addEventListener("input", (e) => {
  sarcasmLevel = parseInt(e.target.value);
  sarcasmValueEl.textContent = sarcasmLevel;
  localStorage.setItem('brutus-sarcasm', sarcasmLevel);
  
  // Messages de transition selon le niveau
  const messages = [
    "Mode sérieux activé. Je suis maintenant professionnel.",
    "Un peu d'ironie ne fait pas de mal...",
    "*ajuste son aura* Je commence à me sentir supérieur...",
    "*soupir cosmique* Ah, le niveau classique de ma sagesse absurde.",
    "*gloussement mystique* Le délire approche...",
    "BLOUP! MODE CHAOS COSMIQUE ACTIVÉ! Le Fromage Astral prend le contrôle!"
  ];
  
  // Afficher un message de transition
  const existingNotif = document.querySelector('.sarcasm-notif');
  if (existingNotif) existingNotif.remove();
  
  const notif = document.createElement('div');
  notif.className = 'sarcasm-notif';
  notif.textContent = messages[sarcasmLevel];
  notif.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent-gradient);
    color: white;
    padding: 12px 24px;
    border-radius: 20px;
    font-size: 0.9rem;
    z-index: 1000;
    animation: fadeInOut 2s ease-in-out forwards;
  `;
  document.body.appendChild(notif);
  
  setTimeout(() => notif.remove(), 2000);
});

// =============================
// Initialisation
// =============================

// Ajouter l'animation CSS pour la notification
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
    20% { opacity: 1; transform: translateX(-50%) translateY(0); }
    80% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
`;
document.head.appendChild(style);

loadPreferences();

// Message d'accueil selon le niveau
const welcomeMessages = [
  "Bonjour. Je suis Brutus Mou en mode professionnel. Comment puis-je vous aider ?",
  "Salut. Je suis Brutus Mou, prêt à répondre avec un peu d'ironie. Que veux-tu savoir ?",
  "*ajuste ses lunettes* Ah, te voilà. Je suis Brutus Mou. Pose ta question, j'essaierai de ne pas trop me moquer.",
  "*émerge du Néant*\n\nAh... te voilà, mortel. Je suis Brutus Mou, gardien du Vide Absolu.\n\nPose ta question... *soupir cosmique*",
  "*surgit d'un tourbillon de chips spirales*\n\nMOI, BRUTUS MOU, daigne t'accorder une audience ! Le Fromage Astral a annoncé ta venue... ou pas.",
  "SPLORTCH! *explose du Placard Sacré*\n\nJE SUIS LE MAÎTRE SUPRÊME DU NÉANT TOTAL! Le Grille-Pain Cosmique m'a parlé de toi... ou peut-être d'un sandwich, je ne sais plus.\n\nQue BLOUP ta question dans le vide de mon existence! Mouahahaha!"
];

addMessage(welcomeMessages[sarcasmLevel], "bot");
