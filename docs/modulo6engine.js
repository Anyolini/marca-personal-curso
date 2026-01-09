// Preguntas del módulo 6 (puedes cambiarlas luego)
const questions = [
  {
    question: "¿Qué acción concreta tomarás en las próximas 24 horas para tu marca?",
    options: ["Publicar algo", "Crear contenido", "Investigar", "Nada"],
    correct: 0
  },
  {
    question: "¿Qué emoción quieres transmitir con tu lanzamiento?",
    options: ["Confianza", "Alegría", "Poder", "Todas"],
    correct: 3
  }
];

// Estado
let currentQuestion = 0;
let score = 0;

function renderCard() {
  const container = document.getElementById("flipcard-container");
  const q = questions[currentQuestion];

  container.innerHTML = `
    <h2>${q.question}</h2>
    ${q.options.map((opt, i) => `<button onclick="selectOption(${i})">${opt}</button>`).join("")}
  `;
}

function updateProgress() {
  const progress = (currentQuestion / questions.length) * 100;
  document.getElementById("progress-bar").style.width = progress + "%";
}

function selectOption(index) {
  const q = questions[currentQuestion];
  if (index === q.correct) score++;

  currentQuestion++;
  updateProgress();

  if (currentQuestion < questions.length) {
    renderCard();
  } else {
    finishModule();
  }
}

function finishModule() {
  const percentage = (score / questions.length) * 100;

  const screen = document.getElementById("celebrationScreen");
  screen.classList.remove("hidden");
  setTimeout(() => screen.classList.add("visible"), 50);

  document.getElementById("certificateButton").onclick = () => {
    window.location.href = "certificado.html";
  };
}

document.addEventListener("DOMContentLoaded", () => {
  renderCard();
  updateProgress();
});
