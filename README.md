# 🌸 Marca Personal Imparable — AMYOLINI Interactive Learning v2.0

Este proyecto nace del deseo de transformar el aprendizaje en una experiencia poética, estratégica y profundamente humana.  
Aquí encontrarás el motor interactivo que impulsa el curso **“Marca Personal Imparable”**, diseñado para guiar a cada persona a descubrir su esencia, construir su presencia digital y comunicar con autenticidad.

Desarrollado con ❤️ por Anyolini para la comunidad global de creadores que desean dejar huella.

---

## 📋 Resumen Ejecutivo

Esta es la versión modernizada del sistema interactivo de aprendizaje para el curso **Marca Personal Imparable**.  
Migrado completamente a **TypeScript**, con arquitectura escalable, testing automatizado y mejores prácticas de desarrollo moderno.

Un sistema creado para enseñar con claridad, belleza y precisión.

---

## 🎯 Características Principales

- **TypeScript 5.3** — Tipado estático completo  
- **Vite Build System** — HMR y optimización automática  
- **Testing Automatizado** — Vitest + 90% cobertura  
- **CI/CD Pipeline** — GitHub Actions integrado  
- **Arquitectura Modular** — Escalable y mantenible  
- **Performance Optimizado** — Bundle splitting y lazy loading  

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- Frontend: TypeScript 5.3 + Vite 5.0  
- Testing: Vitest + Testing Library  
- Linting: ESLint + Prettier  
- CI/CD: GitHub Actions  
- Package Manager: npm  

### Estructura del Proyecto

modern-amyolini/
├── src/
│   ├── core/                 # Motor base compartido
│   ├── flipcards/           # Sistema FlipCards
│   ├── videos/              # Sistema Videos (futuro)
│   ├── types/               # Definiciones TypeScript
│   └── utils/               # Utilidades compartidas
├── tests/                   # Suite de pruebas
├── docs/                    # Documentación
└── .github/workflows/       # CI/CD pipelines
---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+  
- npm 9+  

### Instalación

```bash
git clone https://github.com/amyolini/interactive-learning.git
cd modern-amyolini
npm install
npm run dev
npm test
npm run test:coverage
npm run build

📊 Sistemas Disponibles
1. FlipCard Engine
Sistema de tarjetas interactivas con dificultad adaptativa.

Características

Dificultad adaptativa basada en rendimiento

50+ escenarios profesionales predefinidos

Analytics avanzados

Sistema de logros y gamificación

Accesibilidad completa
API Básica
const engine = new FlipCardEngine(config);
await engine.initialize(container);
await engine.loadCards(cards);
await engine.startCard(cardId);
const result = await engine.answerCard(cardId, optionId);
2. Video System (Próximamente)
Sistema de videos interactivos con checkpoints programados.
Una expansión futura para enriquecer aún más la experiencia educativa.

🔒 Seguridad y Privacidad
Encriptación de datos locales

Validación estricta de entrada

Sanitización de contenido

GDPR compliance

Consentimiento de tracking

🤝 Contribución
Este proyecto está abierto a colaboración.
Si deseas expandirlo, adaptarlo o integrarlo en tu plataforma educativa, puedes seguir los estándares de desarrollo incluidos en este repositorio.

📚 Documentación
Documentación Técnica Completa

Guía de API

Guía de Testing

Guía de Deployment

🆘 Soporte
📧 tech@amyolini.com
💬 Discord: amyolini Community
🐛 GitHub Issues

📄 Licencia
MIT License — © 2026 AMYOLINI

🌟 Inspiración
Este sistema fue inspirado por metodologías de Design Thinking aplicadas a la educación, principios de gamificación, y la neurociencia del aprendizaje.
Cada línea de código honra el propósito de enseñar con belleza, claridad y profundidad.
