export class FlipCardEngine {
  constructor(config) {
    this.config = config;
    this.cards = [];
    this.container = null;
  }

  async initialize(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) throw new Error("Contenedor no encontrado");
  }

  async loadCards(cards) {
    this.cards = cards;
  }

  async startCard(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card || !this.container) return;

    this.container.innerHTML = `
      <h2>${card.question}</h2>
      ${card.options.map(opt => `
        <button onclick="window.flipCardEngine.answerCard('${card.id}', '${opt.id}')">
          ${opt.text}
        </button>
      `).join('')}
    `;
  }

  async answerCard(cardId, optionId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;

    const correct = card.correctOptionId === optionId;
    alert(correct ? "✅ ¡Correcto!" : "❌ Intenta de nuevo");
  }
}

window.flipCardEngine = new FlipCardEngine({
  difficulty: 'adaptive',
  analytics: true,
  autoSave: true
});
