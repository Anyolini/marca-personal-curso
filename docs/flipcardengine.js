/* ============================
   MARCA PERSONAL IMPARABLE
   Motor del curso ANYOLINI
============================ */

// Preguntas del módulo (10)
const questions = [
  {
    question: "Si no haces ningún cambio hoy, ¿cómo imaginas que será tu vida dentro de un año?",
    options: [
      "Muy parecida, porque no tomé acción",
      "Totalmente transformada sin esfuerzo",
      "Más confusa que ahora",
      "No lo sé, no depende de mí"
    ],
    correct: 0
  },
  {
    question: "¿Qué parte de tu vida te dolería ver igual dentro de 12 meses?",
    options: [
      "Mi falta de claridad",
      "Mi crecimiento profesional",
      "Mi disciplina",
      "Mi creatividad"
    ],
    correct: 0
  },
  {
    question: "¿Qué versión de ti misma te está esperando en el futuro… y qué necesita que hagas hoy?",
    options: [
      "Que tome decisiones alineadas",
      "Que espere a sentirme lista",
      "Que copie lo que hacen otros",
      "Que ignore mis intuiciones"
    ],
    correct: 0
  },
  {
    question: "¿Cómo te sentirías si dentro de un año sigues con las mismas dudas y miedos?",
    options: [
      "Frustrada por no avanzar",
      "Perfectamente bien",
      "Aliviada",
      "Motivada"
    ],
    correct: 0
  },
  {
    question: "¿Qué oportunidades crees que perderías si no construyes tu marca personal ahora?",
    options: [
      "Visibilidad, claridad y oportunidades",
      "Nada, todo llega solo",
      "Más seguidores",
      "Un logo más bonito"
    ],
    correct: 0
  },
  {
    question: "¿Qué te gustaría poder agradecerle a tu yo del futuro por haber empezado hoy?",
    options: [
      "Haber tomado acción",
      "Haber esperado el momento perfecto",
      "Haber seguido tendencias",
      "Haber evitado riesgos"
    ],
    correct: 0
  },
  {
    question: "Si tu vida fuera una historia, ¿qué capítulo te gustaría estar escribiendo dentro de 5 años?",
    options: [
      "El capítulo donde me elijo a mí misma",
      "El capítulo donde sigo igual",
      "El capítulo donde me escondo",
      "El capítulo donde improviso sin rumbo"
    ],
    correct: 0
  },
  {
    question: "¿Qué impacto tendría en tu bienestar, ingresos y libertad si tu marca personal estuviera viva?",
    options: [
      "Un impacto positivo y expansivo",
      "Ningún impacto",
      "Más estrés",
      "Más confusión"
    ],
    correct: 0
  },
  {
    question: "¿Qué versión de ti misma te daría orgullo mirar dentro de 5 años?",
    options: [
      "La que tomó acción hoy",
      "La que esperó a sentirse lista",
      "La que no se arriesgó",
      "La que siguió a otros"
    ],
    correct: 0
  },
  {
    question: "¿Qué te está costando más: tomar acción… o seguir igual?",
    options: [
      "Seguir igual",
      "Tomar acción",
      "No lo sé",
      "Nada, todo está perfecto"
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
   Barra de progreso
============================ */
function updateProgress() {
  const progress = (currentQuestion / questions.length) * 100;
  document.getElementById("progress-bar").style.width = progress + "%";
}

/* ============================
   Selección de respuesta
============================ */
function selectOption(index) {
  const q = questions[currentQuestion];
  const container = document.getElementById("flipcard-container");

  // Evaluar respuesta
  if (index === q.correct) {
    score++;
    container.innerHTML += `<div class="feedback">¡Correcto! 🌟</div>`;
  } else {
    container.innerHTML += `<div class="feedback">Gracias por tu honestidad. Esta respuesta también te muestra algo importante.</div>`;
  }

  // Esperar un momento para que lea el feedback
  setTimeout(() => {
    currentQuestion++;

    // Actualizar barra de progreso después de avanzar
    updateProgress();

    if (currentQuestion < questions.length) {
      renderCard();
    } else {
      finishModule();
    }
  }, 1200);
}

/* ============================
   Finalizar módulo (lógica del 80%)
============================ */
function finishModule() {
  const percentage = (score / questions.length) * 100;

  if (percentage >= 80) {
    showCelebrationScreen(percentage);
  } else {
    showTryAgainScreen(percentage);
  }
}

/* ============================
   Pantalla de felicitación (80% o más)
============================ */
function showCelebrationScreen(percentage) {
  const screen = document.getElementById("celebrationScreen");
  const text = document.getElementById("celebrationPercentageText");

  text.textContent = `Has alcanzado aproximadamente un ${Math.round(
    percentage
  )}% de claridad en este módulo. Honra este avance.`;

  screen.classList.remove("hidden");
  setTimeout(() => screen.classList.add("visible"), 50);

  document.getElementById("continueButton").onclick = () => {
    alert("Aquí conectaremos el Módulo 2 ✨");
  };
}

/* ============================
   Pantalla amorosa si no llega al 80%
============================ */
function showTryAgainScreen(percentage) {
  const screen = document.getElementById("tryAgainScreen");
  const text = document.getElementById("tryAgainPercentageText");

  text.textContent = `Has alcanzado aproximadamente un ${Math.round(
    percentage
  )}%. No es un fracaso, es un punto de partida aún más honesto.`;

  screen.classList.remove("hidden");
  setTimeout(() => screen.classList.add("visible"), 50);

  document.getElementById("retryButton").onclick = () => {
    // Reiniciar estado
    currentQuestion = 0;
    score = 0;
    updateProgress();

    // Ocultar pantalla y volver a mostrar tarjetas
    screen.classList.remove("visible");
    setTimeout(() => {
      screen.classList.add("hidden");
      renderCard();
    }, 300);
  };
}

/* ============================
   Iniciar curso
============================ */
document.addEventListener("DOMContentLoaded", () => {
  currentQuestion = 0;
  score = 0;
  updateProgress();
  renderCard();
});
