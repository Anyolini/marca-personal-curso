class FlipCardEngine {
  constructor(config) {
    this.config = config;
    this.cards = [];
    this.container = null;
    this.currentIndex = 0;
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
        <button onclick="window.flipcardengine.answerCard('${card.id}', '${opt.id}')">
          ${opt.text}
        </button>
      `).join('')}
      <div id="feedback" style="margin-top:1rem;"></div>
    `;
  }

  async answerCard(cardId, optionId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;

    const correct = card.correctOptionId === optionId;
    const feedback = document.getElementById('feedback');

    feedback.innerHTML = correct
      ? `<p class="feedback">✅ ¡Correcto! Tu marca comienza con autenticidad.</p>`
      : `<p class="feedback" style="color:#c62828;">❌ Intenta de nuevo</p>`;

    if (correct) {
      this.currentIndex++;
      if (this.currentIndex < this.cards.length) {
  setTimeout(() => {
    this.startCard(this.cards[this.currentIndex].id);
  }, 1500);
} else {
  setTimeout(() => {
    this.container.innerHTML = `<h2>🌟 ¡Has completado el Módulo 1!</h2>`;

    // Avisar al resto de la página que el módulo terminó
    if (window.onModule1Completed) {
      window.onModule1Completed();
    }
  }, 1500);
}
      
window.flipcardengine = new FlipCardEngine({
  difficulty: 'adaptive',
  analytics: true,
  autoSave: true
});
