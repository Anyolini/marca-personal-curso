/* ============================
   MARCA PERSONAL IMPARABLE
   Motor del curso AMYOLINI
============================ */

// Preguntas del módulo
const questions = [
  {
    question: "¿Qué es marca personal?",
    options: [
      "Tu esencia, tu historia y tu impacto",
      "Un logo bonito",
      "Publicar todos los días",
      "Hablar de ti sin parar"
    ],
    correct: 0
  },
  {
    question: "¿Qué hace única tu marca?",
    options: [
      "Tu autenticidad y tu visión",
      "Imitar a otros",
      "Seguir tendencias sin propósito",
      "Cambiar cada semana"
    ],
    correct: 0
  }
];

// Estado del curso
let currentQuestion = 0;
let score = 0;

/* ============================
   Renderizar tarjeta
============================ */
function renderCard() {
  const container = document.getElementById("flipcard-container");
  const q = questions[currentQuestion];

  container.innerHTML = `
    <h2>${q.question}</h2>
    ${q.options
      .map(
        (opt, i) =>
          `<button onclick="selectOption(${i})">${opt}</button>`
      )
      .join("")}
  `;
}

/* ============================
   Selección de respuesta
============================ */
function selectOption(index) {
  const q = questions[currentQuestion];
  const container = document.getElementById("flipcard-container");

  if (index === q.correct) {
    score++;
    container.innerHTML += `<div class="feedback">¡Correcto! 🌟</div>`;
  } else {
    container.innerHTML += `<div class="feedback">Respuesta incorrecta</div>`;
  }

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      renderCard();
    } else {
      showCelebrationScreen();
    }
  }, 1200);
}

/* ============================
   Pantalla de celebración
============================ */
function showCelebrationScreen() {
  const screen = document.getElementById("celebrationScreen");

  // Mostrar pantalla
  screen.classList.remove("hidden");
  setTimeout(() => screen.classList.add("visible"), 50);

  // Mensaje poético
  document.getElementById("celebrationTitle").textContent =
    "Has conquistado este módulo";
  document.getElementById("celebrationText").textContent =
    "Tu visión se eleva, tu voz se afina, y tu marca comienza a respirar con fuerza propia.";

  // Iluminar secciones de la montaña
  document.querySelector(".mountain-base").classList.add("visible");
  setTimeout(() => document.querySelector(".mountain-mid").classList.add("visible"), 400);
  setTimeout(() => document.querySelector(".mountain-top").classList.add("visible"), 800);

  // Activar puntos dorados
  document.querySelector(".dot-1").classList.add("active");
  setTimeout(() => document.querySelector(".dot-2").classList.add("active"), 400);
  setTimeout(() => document.querySelector(".dot-3").classList.add("active"), 800);
  setTimeout(() => document.querySelector(".dot-4").classList.add("active"), 1200);

  // Reproducir sonido
  const wind = document.getElementById("windSound");
  wind.volume = 0.4;
  wind.play();

  // Botón continuar
  document.getElementById("continueButton").onclick = () => {
    alert("Aquí conectaremos el Módulo 2 ✨");
  };
}

/* ============================
   Iniciar curso
============================ */
document.addEventListener("DOMContentLoaded", renderCard);
