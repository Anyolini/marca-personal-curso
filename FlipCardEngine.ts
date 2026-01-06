/**
 * Modern FlipCard Engine - TypeScript Implementation
 * Advanced interactive learning system with adaptive difficulty
 * @author amyolini
 */

import { BaseEngine } from '@core/BaseEngine';
import { nanoid } from 'nanoid';
import type {
  FlipCardConfig,
  FlipCard,
  FlipCardProgress,
  FlipCardAttempt,
  FlipCardEvents,
  FlipCardStats,
  FlipCardAnalytics,
  FlipCardFilters,
  IFlipCardEngine,
  AdaptiveDifficultyEngine,
  Achievement,
  CreateFlipCardInput
} from '@types/flipcard.types';
import type {
  ItemId,
  LearningCategory,
  DifficultyLevel,
  UserId,
  SessionId
} from '@types/common.types';

// Default configuration
const DEFAULT_CONFIG: FlipCardConfig = {
  autoSave: true,
  analytics: true,
  debug: false,
  difficulty: 'adaptive',
  categories: ['fundamentos', 'estrategia', 'contenido', 'networking', 'herramientas'],
  maxAttempts: 3,
  timeLimit: 300, // 5 minutes
  showHints: true,
  enableBookmarks: true,
  shuffleCards: true,
  adaptiveDifficulty: {
    enabled: true,
    accuracyThreshold: 0.75,
    speedThreshold: 120000, // 2 minutes
    adjustmentFactor: 0.1
  }
};

// Adaptive Difficulty Engine Implementation
class DefaultAdaptiveDifficultyEngine implements AdaptiveDifficultyEngine {
  calculateUserLevel(progress: FlipCardProgress): DifficultyLevel {
    const { categoryProgress } = progress;
    
    let totalAccuracy = 0;
    let totalTime = 0;
    let categoryCount = 0;

    categoryProgress.forEach(category => {
      if (category.completed > 0) {
        totalAccuracy += category.accuracy;
        totalTime += category.averageTime;
        categoryCount++;
      }
    });

    if (categoryCount === 0) return 'beginner';

    const avgAccuracy = totalAccuracy / categoryCount;
    const avgTime = totalTime / categoryCount;

    // Determine level based on accuracy and speed
    if (avgAccuracy >= 0.85 && avgTime <= 60000) return 'expert';
    if (avgAccuracy >= 0.75 && avgTime <= 90000) return 'advanced';
    if (avgAccuracy >= 0.60 && avgTime <= 120000) return 'intermediate';
    return 'beginner';
  }

  adaptCards(cards: FlipCard[], progress: FlipCardProgress): FlipCard[] {
    const userLevel = this.calculateUserLevel(progress);
    const { categoryProgress } = progress;

    // Filter cards based on user level and weak areas
    const weakCategories = Array.from(categoryProgress.entries())
      .filter(([_, stats]) => stats.accuracy < 0.7)
      .map(([category]) => category);

    return cards.filter(card => {
      // Include cards at user level or slightly above
      const levelMatch = this.isLevelAppropriate(card.difficulty, userLevel);
      
      // Prioritize weak categories
      const categoryMatch = weakCategories.length === 0 || 
        weakCategories.includes(card.category);

      return levelMatch && categoryMatch;
    });
  }

  shouldIncreasedifficulty(progress: FlipCardProgress): boolean {
    const userLevel = this.calculateUserLevel(progress);
    const recentAccuracy = this.getRecentAccuracy(progress, 10);
    
    return userLevel !== 'expert' && 
           recentAccuracy >= 0.85 && 
           progress.currentStreak >= 5;
  }

  shouldDecreaseeDifficulty(progress: FlipCardProgress): boolean {
    const recentAccuracy = this.getRecentAccuracy(progress, 10);
    
    return recentAccuracy < 0.5 && progress.currentStreak === 0;
  }

  getRecommendedCards(
    cards: FlipCard[], 
    progress: FlipCardProgress, 
    count: number
  ): FlipCard[] {
    const adaptedCards = this.adaptCards(cards, progress);
    const shuffled = this.shuffleArray([...adaptedCards]);
    return shuffled.slice(0, count);
  }

  private isLevelAppropriate(cardLevel: DifficultyLevel, userLevel: DifficultyLevel): boolean {
    const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const cardIndex = levels.indexOf(cardLevel);
    const userIndex = levels.indexOf(userLevel);
    
    // Allow cards at user level or one level above
    return cardIndex >= userIndex && cardIndex <= userIndex + 1;
  }

  private getRecentAccuracy(progress: FlipCardProgress, count: number): number {
    const recentAttempts: FlipCardAttempt[] = [];
    
    progress.attempts.forEach(attempts => {
      recentAttempts.push(...attempts);
    });

    recentAttempts.sort((a, b) => b.timestamp - a.timestamp);
    const recent = recentAttempts.slice(0, count);
    
    if (recent.length === 0) return 0;
    
    const correct = recent.filter(attempt => attempt.isCorrect).length;
    return correct / recent.length;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Main FlipCard Engine
export class FlipCardEngine extends BaseEngine<FlipCardConfig, FlipCardEvents> 
  implements IFlipCardEngine {
  
  private _cards = new Map<ItemId, FlipCard>();
  private _progress: FlipCardProgress;
  private _currentCard: FlipCard | null = null;
  private _difficultyEngine: AdaptiveDifficultyEngine;
  private _achievements: Achievement[] = [];

  constructor(config: Partial<FlipCardConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
    
    this._progress = this.createInitialProgress();
    this._difficultyEngine = new DefaultAdaptiveDifficultyEngine();
    
    this.log('FlipCard Engine created with config:', this._config);
  }

  protected get engineType(): string {
    return 'flipcard';
  }

  // Getters
  get cards(): Map<ItemId, FlipCard> {
    return new Map(this._cards);
  }

  get progress(): FlipCardProgress {
    return { ...this._progress };
  }

  get currentCard(): FlipCard | null {
    return this._currentCard ? { ...this._currentCard } : null;
  }

  // Initialization
  protected async initializeEngine(): Promise<void> {
    this.validateContainer();
    
    // Load saved progress
    const savedProgress = await this.loadFromStorage<FlipCardProgress>('progress');
    if (savedProgress) {
      this._progress = this.migrateProgress(savedProgress);
      this.log('Progress loaded from storage');
    }

    // Load saved cards
    const savedCards = await this.loadFromStorage<FlipCard[]>('cards');
    if (savedCards) {
      await this.loadCards(savedCards);
      this.log('Cards loaded from storage');
    }

    // Setup UI
    this.setupUI();
    
    // Load default cards if none exist
    if (this._cards.size === 0) {
      await this.loadDefaultCards();
    }

    this.emit('session:started', {
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  // Card Management
  async loadCards(cards: FlipCard[]): Promise<void> {
    this.log('Loading cards:', cards.length);
    
    for (const card of cards) {
      this.validateCard(card);
      this._cards.set(card.id, card);
      
      this.emit('card:loaded', { card });
    }

    // Save to storage
    await this.saveToStorage('cards', Array.from(this._cards.values()));
    
    this.trackEvent('cards_loaded', {
      count: cards.length,
      categories: [...new Set(cards.map(c => c.category))]
    });
  }

  async startCard(cardId: ItemId): Promise<void> {
    const card = this._cards.get(cardId);
    if (!card) {
      throw new Error(`Card not found: ${cardId}`);
    }

    this._currentCard = card;
    this.updateActivity();
    
    // Track card start
    this.trackEvent('card_started', {
      cardId,
      category: card.category,
      difficulty: card.difficulty
    });

    this.emit('card:started', {
      cardId,
      timestamp: Date.now()
    });

    // Render card
    this.renderCard(card);
  }

  async answerCard(cardId: ItemId, optionId: string): Promise<boolean> {
    const card = this._cards.get(cardId);
    if (!card) {
      throw new Error(`Card not found: ${cardId}`);
    }

    const option = card.options.find(opt => opt.id === optionId);
    if (!option) {
      throw new Error(`Option not found: ${optionId}`);
    }

    // Create attempt record
    const attempt: FlipCardAttempt = {
      cardId,
      attemptNumber: this.getAttemptNumber(cardId),
      selectedOption: optionId,
      isCorrect: option.isCorrect,
      timeSpent: this.calculateTimeSpent(cardId),
      timestamp: Date.now(),
      hintsUsed: this.getHintsUsed(cardId)
    };

    // Update progress
    this.updateProgress(attempt);
    
    // Check for achievements
    this.checkAchievements();
    
    // Emit events
    this.emit('card:answered', {
      cardId,
      attempt,
      isCorrect: option.isCorrect
    });

    // Show feedback
    this.showFeedback(card, option);
    
    // Save progress
    await this.saveProgress();

    return option.isCorrect;
  }

  flipCard(cardId: ItemId): void {
    const card = this._cards.get(cardId);
    if (!card) return;

    this.trackEvent('card_flipped', { cardId });
    
    this.emit('card:flipped', {
      cardId,
      direction: 'back' // Assuming flip to back/solution
    });

    this.renderSolution(card);
  }

  requestHint(cardId: ItemId): string | null {
    const card = this._cards.get(cardId);
    if (!card || !this._config.showHints) return null;

    // Track hint usage
    this.trackEvent('hint_requested', { cardId });
    
    this.emit('hint:requested', {
      cardId,
      hintNumber: this.getHintsUsed(cardId) + 1
    });

    // Return a generic hint for now
    return "Consider the context and best practices for this scenario.";
  }

  bookmarkCard(cardId: ItemId, bookmarked: boolean): void {
    if (bookmarked) {
      this._progress.bookmarkedCards.add(cardId);
    } else {
      this._progress.bookmarkedCards.delete(cardId);
    }

    this.emit('card:bookmarked', { cardId, bookmarked });
    this.saveProgress();
  }

  // Progress Management
  getProgress(): FlipCardProgress {
    return { ...this._progress };
  }

  resetProgress(): void {
    this._progress = this.createInitialProgress();
    this.saveProgress();
    
    this.trackEvent('progress_reset', {
      timestamp: Date.now()
    });
  }

  async exportProgress(): Promise<string> {
    const exportData = {
      progress: this._progress,
      exportedAt: Date.now(),
      version: '2.0.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  async importProgress(data: string): Promise<void> {
    try {
      const importData = JSON.parse(data);
      
      if (importData.progress) {
        this._progress = this.migrateProgress(importData.progress);
        await this.saveProgress();
        
        this.trackEvent('progress_imported', {
          version: importData.version,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      throw new Error('Invalid progress data format');
    }
  }

  // Analytics and Stats
  getStats(): FlipCardStats {
    const totalCards = this._cards.size;
    const completedCards = this._progress.completedItems.size;
    const accuracy = this._progress.totalAttempts > 0 ? 
      this._progress.correctAnswers / this._progress.totalAttempts : 0;

    return {
      totalCards,
      completedCards,
      accuracy,
      averageTimePerCard: this.calculateAverageTimePerCard(),
      totalTimeSpent: this._progress.totalTimeSpent,
      currentStreak: this._progress.currentStreak,
      bestStreak: this._progress.bestStreak,
      categoryBreakdown: this.getCategoryBreakdown(),
      difficultyBreakdown: this.getDifficultyBreakdown(),
      recentActivity: this.getRecentActivity()
    };
  }

  getAnalytics(): FlipCardAnalytics {
    return {
      sessionSummary: this.getSessionSummary(),
      learningPatterns: this.getLearningPatterns(),
      engagement: this.getEngagementMetrics()
    };
  }

  // Utility Methods
  getRecommendedCards(count = 5): FlipCard[] {
    return this._difficultyEngine.getRecommendedCards(
      Array.from(this._cards.values()),
      this._progress,
      count
    );
  }

  searchCards(query: string): FlipCard[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this._cards.values()).filter(card =>
      card.scenario.title.toLowerCase().includes(searchTerm) ||
      card.scenario.description.toLowerCase().includes(searchTerm) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  filterCards(filters: FlipCardFilters): FlipCard[] {
    return Array.from(this._cards.values()).filter(card => {
      if (filters.categories && !filters.categories.includes(card.category)) {
        return false;
      }
      
      if (filters.difficulties && !filters.difficulties.includes(card.difficulty)) {
        return false;
      }
      
      if (filters.tags && !filters.tags.some(tag => card.tags.includes(tag))) {
        return false;
      }
      
      if (filters.completed !== undefined) {
        const isCompleted = this._progress.completedItems.has(card.id);
        if (filters.completed !== isCompleted) return false;
      }
      
      if (filters.bookmarked !== undefined) {
        const isBookmarked = this._progress.bookmarkedCards.has(card.id);
        if (filters.bookmarked !== isBookmarked) return false;
      }
      
      return true;
    });
  }

  // Private Methods
  private createInitialProgress(): FlipCardProgress {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      totalTimeSpent: 0,
      completedItems: new Set(),
      correctAnswers: 0,
      totalAttempts: 0,
      currentStreak: 0,
      bestStreak: 0,
      attempts: new Map(),
      bookmarkedCards: new Set(),
      masteredCards: new Set(),
      currentDifficulty: 'beginner',
      categoryProgress: new Map(),
      streaks: {
        current: 0,
        best: 0,
        byCategory: new Map()
      },
      achievements: []
    };
  }

  private validateCard(card: FlipCard): void {
    if (!card.id || !card.scenario || !card.options || card.options.length === 0) {
      throw new Error('Invalid card format');
    }
    
    const hasCorrectAnswer = card.options.some(option => option.isCorrect);
    if (!hasCorrectAnswer) {
      throw new Error('Card must have at least one correct answer');
    }
  }

  private updateProgress(attempt: FlipCardAttempt): void {
    // Add attempt
    if (!this._progress.attempts.has(attempt.cardId)) {
      this._progress.attempts.set(attempt.cardId, []);
    }
    this._progress.attempts.get(attempt.cardId)!.push(attempt);

    // Update counters
    this._progress.totalAttempts++;
    if (attempt.isCorrect) {
      this._progress.correctAnswers++;
      this._progress.currentStreak++;
      this._progress.bestStreak = Math.max(this._progress.bestStreak, this._progress.currentStreak);
      this._progress.completedItems.add(attempt.cardId);
    } else {
      this._progress.currentStreak = 0;
    }

    // Update category progress
    const card = this._cards.get(attempt.cardId);
    if (card) {
      this.updateCategoryProgress(card.category, attempt);
    }

    // Update activity
    this._progress.lastActivity = Date.now();
    this._progress.totalTimeSpent += attempt.timeSpent;
  }

  private updateCategoryProgress(category: LearningCategory, attempt: FlipCardAttempt): void {
    if (!this._progress.categoryProgress.has(category)) {
      this._progress.categoryProgress.set(category, {
        completed: 0,
        total: 0,
        accuracy: 0,
        averageTime: 0
      });
    }

    const categoryStats = this._progress.categoryProgress.get(category)!;
    
    if (attempt.isCorrect) {
      categoryStats.completed++;
    }
    
    categoryStats.total++;
    categoryStats.accuracy = categoryStats.completed / categoryStats.total;
    
    // Update average time (simple moving average)
    categoryStats.averageTime = (categoryStats.averageTime * (categoryStats.total - 1) + attempt.timeSpent) / categoryStats.total;
  }

  private async saveProgress(): Promise<void> {
    await this.saveToStorage('progress', this._progress);
  }

  private migrateProgress(progress: any): FlipCardProgress {
    // Handle migration from older versions
    return {
      ...this.createInitialProgress(),
      ...progress,
      // Ensure Sets and Maps are properly restored
      completedItems: new Set(progress.completedItems || []),
      bookmarkedCards: new Set(progress.bookmarkedCards || []),
      masteredCards: new Set(progress.masteredCards || []),
      attempts: new Map(progress.attempts || []),
      categoryProgress: new Map(progress.categoryProgress || [])
    };
  }

  // UI Methods (simplified for now)
  private setupUI(): void {
    if (!this._container) return;
    
    this._container.innerHTML = `
      <div class="flipcard-engine">
        <div class="flipcard-header">
          <h2>FlipCard Learning System</h2>
          <div class="flipcard-stats"></div>
        </div>
        <div class="flipcard-content">
          <div class="flipcard-placeholder">
            Click "Start Learning" to begin
          </div>
        </div>
        <div class="flipcard-controls">
          <button class="btn-start">Start Learning</button>
        </div>
      </div>
    `;

    // Add event listeners
    const startBtn = this._container.querySelector('.btn-start') as HTMLButtonElement;
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const recommendedCards = this.getRecommendedCards(1);
        if (recommendedCards.length > 0) {
          this.startCard(recommendedCards[0].id);
        }
      });
    }
  }

  private renderCard(card: FlipCard): void {
    if (!this._container) return;
    
    const content = this._container.querySelector('.flipcard-content');
    if (!content) return;

    content.innerHTML = `
      <div class="flipcard" data-card-id="${card.id}">
        <div class="flipcard-front">
          <h3>${card.scenario.title}</h3>
          <p>${card.scenario.description}</p>
          <div class="flipcard-options">
            ${card.options.map(option => `
              <button class="flipcard-option" data-option-id="${option.id}">
                ${option.text}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Add option click handlers
    const options = content.querySelectorAll('.flipcard-option');
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        const optionId = (e.target as HTMLElement).dataset.optionId!;
        this.answerCard(card.id, optionId);
      });
    });
  }

  private renderSolution(card: FlipCard): void {
    // Implementation for showing solution
    this.log('Showing solution for card:', card.id);
  }

  private showFeedback(card: FlipCard, option: any): void {
    // Implementation for showing feedback
    this.log('Showing feedback:', option.feedback);
  }

  // Helper methods
  private getAttemptNumber(cardId: ItemId): number {
    const attempts = this._progress.attempts.get(cardId) || [];
    return attempts.length + 1;
  }

  private calculateTimeSpent(cardId: ItemId): number {
    // Simple implementation - in real app, track start time
    return Math.floor(Math.random() * 120000) + 30000; // 30s - 2.5min
  }

  private getHintsUsed(cardId: ItemId): number {
    // Track hints used per card
    return 0; // Simplified for now
  }

  private calculateAverageTimePerCard(): number {
    const attempts = Array.from(this._progress.attempts.values()).flat();
    if (attempts.length === 0) return 0;
    
    const totalTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
    return totalTime / attempts.length;
  }

  private getCategoryBreakdown(): Map<LearningCategory, any> {
    return this._progress.categoryProgress;
  }

  private getDifficultyBreakdown(): Map<DifficultyLevel, any> {
    // Implementation for difficulty breakdown
    return new Map();
  }

  private getRecentActivity(): FlipCardAttempt[] {
    const allAttempts = Array.from(this._progress.attempts.values()).flat();
    return allAttempts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }

  private getSessionSummary(): any {
    return {
      duration: this.getSessionDuration(),
      cardsAttempted: this._progress.attempts.size,
      correctAnswers: this._progress.correctAnswers,
      averageTimePerCard: this.calculateAverageTimePerCard(),
      totalFlips: 0, // Track separately
      hintsUsed: 0 // Track separately
    };
  }

  private getLearningPatterns(): any {
    return {
      peakPerformanceTime: '14:00', // Analyze from data
      preferredDifficulty: this._progress.currentDifficulty,
      strongCategories: [],
      improvementAreas: []
    };
  }

  private getEngagementMetrics(): any {
    return {
      sessionFrequency: 1, // Calculate from historical data
      averageSessionLength: this.getSessionDuration(),
      retentionRate: 0.8,
      dropOffPoints: []
    };
  }

  private checkAchievements(): void {
    // Implementation for achievement checking
    // This would check various conditions and unlock achievements
  }

  private async loadDefaultCards(): Promise<void> {
    // Load some default cards for demo
    const defaultCards: CreateFlipCardInput[] = [
      {
        category: 'fundamentos',
        difficulty: 'beginner',
        scenario: {
          title: 'Optimización de Perfil LinkedIn',
          description: 'Un reclutador te contacta pero tu perfil de LinkedIn no está optimizado. ¿Cuál es tu primera acción?',
          context: {
            industry: 'Tecnología',
            role: 'Desarrollador',
            urgency: 'high'
          }
        },
        options: [
          {
            id: 'a',
            text: 'Actualizar inmediatamente la foto de perfil',
            feedback: 'La foto es importante, pero no es lo más crítico.',
            isCorrect: false
          },
          {
            id: 'b',
            text: 'Revisar y optimizar el headline y resumen',
            feedback: '¡Correcto! El headline y resumen son lo primero que ven.',
            isCorrect: true
          },
          {
            id: 'c',
            text: 'Agregar más conexiones rápidamente',
            feedback: 'Las conexiones son importantes, pero la calidad del perfil es prioritaria.',
            isCorrect: false
          }
        ],
        solution: {
          explanation: 'El headline y resumen son los elementos más visibles y críticos de tu perfil.',
          bestPractices: [
            'Usa palabras clave relevantes',
            'Sé específico sobre tu valor',
            'Incluye logros cuantificables'
          ],
          relatedConcepts: ['Personal Branding', 'LinkedIn Optimization', 'Professional Networking']
        },
        tags: ['linkedin', 'perfil', 'optimización'],
        estimatedTime: 3,
        points: 10
      }
    ];

    const cards: FlipCard[] = defaultCards.map(cardInput => ({
      ...cardInput,
      id: nanoid() as ItemId,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '2.0.0',
        author: 'amyolini'
      }
    }));

    await this.loadCards(cards);
  }

  protected destroyEngine(): void {
    this._cards.clear();
    this._currentCard = null;
    
    if (this._container) {
      this._container.innerHTML = '';
    }
  }
}