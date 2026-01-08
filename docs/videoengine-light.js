class VideoEngineLight {
  constructor(config) {
    this.config = config || {};
    this.container = null;
    this.videoElement = null;
  }

  initialize(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      throw new Error('Contenedor de video no encontrado');
    }
  }

  loadModule(moduleConfig) {
    if (!this.container) return;

    const {
      title,
      description,
      videoSrc,
      reflectionQuestions = [],
      onComplete
    } = moduleConfig;

    this.container.innerHTML = `
      <div class="video-module">
        <h2>${title}</h2>
        <p class="video-description">${description}</p>

        <video id="module2-video" controls style="max-width:100%; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <source src="${videoSrc}" type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>

        <div class="reflection-section">
          <h3>Reflexión guiada</h3>
          ${reflectionQuestions.map((q, index) => `
            <div class="reflection-question">
              <p><strong>${index + 1}.</strong> ${q}</p>
              <textarea rows="3" data-reflection-index="${index}" placeholder="Escribe tu respuesta aquí..."></textarea>
            </div>
          `).join('')}

          <button id="complete-module2-btn">
            ✨ Completar Módulo 2
          </button>
        </div>
      </div>
    `;

    this.videoElement = this.container.querySelector('#module2-video');

    const completeBtn = this.container.querySelector('#complete-module2-btn');
    completeBtn.addEventListener('click', () => {
      const answers = Array.from(
        this.container.querySelectorAll('textarea[data-reflection-index]')
      ).map((el) => el.value.trim());

      if (typeof onComplete === 'function') {
        onComplete({ answers });
      }

      this.container.innerHTML = `
        <div class="module-complete">
          <h2>🌟 Has completado el Módulo 2</h2>
          <p>Tu marca ya tiene alma, lenguaje y presencia en movimiento.</p>
        </div>
      `;
    });
  }
}

window.videoEngineLight = new VideoEngineLight({
  analytics: false // reservado para el futuro, si quieres
});
