// Tarjetas del Módulo 1
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

let currentCardIndex = 0;

// Renderizar tarjeta
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

// Verificar respuesta
function checkAnswer(selectedId) {
  const card = cards[currentCardIndex];
  const container = document.getElementById('flipcard-container');

  const isCorrect = selectedId === card.correctOptionId;

  container.innerHTML += `
    <div class="feedback">
      ${isCorrect ? '¡Correcto! 🌟' : 'Respuesta incorrecta. Inténtalo de nuevo.'}
    </div>
  `;

  if (isCorrect) {
    setTimeout(() => {
      currentCardIndex++;
      if (currentCardIndex < cards.length) {
        renderCard();
      } else {
        showEndMessage();
      }
    }, 1200);
  }
}

// Mensaje final
function showEndMessage() {
  const container = document.getElementById('flipcard-container');
  container.innerHTML = `
    <h2>Has completado el Módulo 1 🌸</h2>
    <p>Ahora estás lista para avanzar al Módulo 2.</p>
  `;
}

// Iniciar
renderCard();
