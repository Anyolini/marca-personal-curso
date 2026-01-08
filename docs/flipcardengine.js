// ===============================
// TARJETAS DEL MÓDULO 1
// ===============================
const cards = [
  {
    id: 'card1',
    question: '¿Cuál es el primer paso para crear una marca personal auténtica?',
    options: [
      { id: 'a', text: 'Elegir colores y tipografía' },
      { id: 'b', text: 'Definir tu esencia y visión' },
      { id: 'c', text: 'Abrir una cuenta en redes sociales' }
    ],
    correctOptionId: 'b'
  },
  {
    id: 'card2',
    question: '¿Qué elemento es esencial para tu propuesta de valor?',
    options: [
      { id: 'a', text: 'Tu historia personal' },
      { id: 'b', text: 'Tu número de seguidores' },
      { id: 'c', text: 'Tu color favorito' }
    ],
    correctOptionId: 'a'
  },
  {
    id: 'card3',
    question: '¿Qué arquetipo representa una marca que guía con sabiduría?',
    options: [
      { id: 'a', text: 'La Heroína' },
      { id: 'b', text: 'La Sabia' },
      { id: 'c', text: 'La Creadora' }
    ],
    correctOptionId: 'b'
  }
];

// ===============================
// VARIABLES DE CONTROL
// ===============================
let currentCardIndex = 0;
let correctAnswers = 0;
let incorrectCards = [];


// ===============================
// RENDERIZAR TARJETA
// ===============================
function renderCard() {
  const container = document.getElementById('flipcard-container');
  const card = cards[currentCardIndex];

  container.innerHTML = `
    <h2>${card.question}</h2>
    ${card.options
      .map(
        (opt) =>
          `<button onclick="checkAnswer('${opt.id}')">${opt.text}</button>`
      )
      .join('')}
  `;
}


// ===============================
// VERIFICAR RESPUESTA
// ===============================
function checkAnswer(selectedId) {
  const card = cards[currentCardIndex];
  const container = document.getElementById('flipcard-container');

  const isCorrect = selectedId === card.correctOptionId;

  container.innerHTML += `
    <div class="feedback">
      ${isCorrect ? '¡Correcto! 🌟' : 'Respuesta incorrecta. Inténtalo de nuevo.'}
    </div>
  `;

  if (!isCorrect) {
    incorrectCards.push(card);
  } else {
    correctAnswers++;
  }

  setTimeout(() => {
    currentCardIndex++;

    if (currentCardIndex < cards.length) {
      renderCard();
    } else {
      evaluateProgress();
    }
  }, 1200);
}


// ===============================
// EVALUAR PROGRESO (80%)
// ===============================
function evaluateProgress() {
  const score = (correctAnswers / cards.length) * 100;

  if (score >= 80) {
    showCelebrationScreen();
  } else {
    repeatIncorrectCards();
  }
}


// ===============================
// REPETIR SOLO LAS INCORRECTAS
// ===============================
function repeatIncorrectCards() {
  if (incorrectCards.length === 0) {
    showCelebrationScreen();
    return;
  }

  cards.length = 0;
  incorrectCards.forEach(c => cards.push(c));

  incorrectCards = [];
  currentCardIndex = 0;
  correctAnswers = 0;

  renderCard();
}


// ===============================
// PANTALLA DE CELEBRACIÓN
// ===============================
function showCelebrationScreen() {
  const screen = document.getElementById('celebrationScreen');
  const title = document.getElementById('celebrationTitle');
  const text = document.getElementById('celebrationText');
  const wind = document.getElementById('windSound');

  // Mensaje poético
  title.textContent = "Has conquistado este módulo";
  text.textContent =
    "Tu visión se eleva, tu voz se afina, y tu marca comienza a respirar con fuerza propia.";

  // Mostrar pantalla
  screen.classList.remove('hidden');
  screen.classList.add('visible');

  // Reproducir sonido
  wind.play();

  // Iluminar montaña
  document.querySelector('.mountain-base').classList.add('visible');
  document.querySelector('.mountain-mid').classList.add('visible');
  document.querySelector('.mountain-top').classList.add('visible');

  // Botón continuar
  document.getElementById('continueButton').onclick = () => {
    alert("Aquí iría el enlace al siguiente módulo.");
  };
}


// ===============================
// INICIAR CURSO
// ===============================
renderCard();
