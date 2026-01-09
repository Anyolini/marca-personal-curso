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
function updateProgress() {
  const progress = ((currentQuestion) / questions.length) * 100;
  document.getElementById("progress-bar").style.width = progress + "%";
}


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
updateProgress();

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
   Pantalla de felicitación
============================ */
function showCelebrationScreen() {
  const screen = document.getElementById("celebrationScreen");

  // Mostrar pantalla
  screen.classList.remove("hidden");
  setTimeout(() => screen.classList.add("visible"), 50);

  // Botón continuar
  document.getElementById("continueButton").onclick = () => {
    alert("Aquí conectaremos el Módulo 2 ✨");
  };
}

/* ============================
   Iniciar curso
============================ */
document.addEventListener("DOMContentLoaded", renderCard);
