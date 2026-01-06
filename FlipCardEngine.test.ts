/**
 * FlipCard Engine Tests
 * @author amyolini
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlipCardEngine } from '@/flipcards/FlipCardEngine';
import { createFlipCard } from '@/flipcards/utils';
import type { FlipCardConfig, CreateFlipCardInput } from '@types/flipcard.types';
import type { ItemId } from '@types/common.types';

describe('FlipCardEngine', () => {
  let engine: FlipCardEngine;
  let mockContainer: HTMLElement;
  let mockConfig: Partial<FlipCardConfig>;

  beforeEach(() => {
    // Create mock container
    mockContainer = document.createElement('div');
    mockContainer.id = 'test-container';
    
    // Mock config
    mockConfig = {
      autoSave: false, // Disable for testing
      analytics: false, // Disable for testing
      debug: true
    };

    engine = new FlipCardEngine(mockConfig);
  });

  describe('Initialization', () => {
    it('should create engine with default config', () => {
      const defaultEngine = new FlipCardEngine();
      expect(defaultEngine.config.autoSave).toBe(true);
      expect(defaultEngine.config.analytics).toBe(true);
      expect(defaultEngine.config.difficulty).toBe('adaptive');
    });

    it('should merge custom config with defaults', () => {
      expect(engine.config.autoSave).toBe(false);
      expect(engine.config.analytics).toBe(false);
      expect(engine.config.debug).toBe(true);
      expect(engine.config.difficulty).toBe('adaptive'); // Should keep default
    });

    it('should initialize with container element', async () => {
      await engine.initialize(mockContainer);
      expect(engine.isInitialized).toBe(true);
      expect(engine.container).toBe(mockContainer);
    });

    it('should initialize with container selector', async () => {
      // Mock querySelector to return our container
      vi.spyOn(document, 'querySelector').mockReturnValue(mockContainer);
      
      await engine.initialize('#test-container');
      expect(engine.isInitialized).toBe(true);
    });

    it('should throw error for invalid container selector', async () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);
      
      await expect(engine.initialize('#invalid-container'))
        .rejects.toThrow('Container element not found');
    });

    it('should throw error if already initialized', async () => {
      await engine.initialize(mockContainer);
      
      await expect(engine.initialize(mockContainer))
        .rejects.toThrow('flipcard engine is already initialized');
    });
  });

  describe('Card Management', () => {
    beforeEach(async () => {
      await engine.initialize(mockContainer);
    });

    it('should load cards successfully', async () => {
      const testCards = createTestCards(3);
      
      await engine.loadCards(testCards);
      
      expect(engine.cards.size).toBe(3);
      testCards.forEach(card => {
        expect(engine.cards.has(card.id)).toBe(true);
      });
    });

    it('should validate cards before loading', async () => {
      const invalidCard = {
        id: 'invalid' as ItemId,
        // Missing required fields
      } as any;

      await expect(engine.loadCards([invalidCard]))
        .rejects.toThrow('Invalid card format');
    });

    it('should emit card:loaded events', async () => {
      const testCards = createTestCards(1);
      const loadedSpy = vi.fn();
      
      engine.on('card:loaded', loadedSpy);
      await engine.loadCards(testCards);
      
      expect(loadedSpy).toHaveBeenCalledWith({
        card: testCards[0]
      });
    });

    it('should start a card successfully', async () => {
      const testCards = createTestCards(1);
      await engine.loadCards(testCards);
      
      const startedSpy = vi.fn();
      engine.on('card:started', startedSpy);
      
      await engine.startCard(testCards[0].id);
      
      expect(engine.currentCard?.id).toBe(testCards[0].id);
      expect(startedSpy).toHaveBeenCalled();
    });

    it('should throw error when starting non-existent card', async () => {
      await expect(engine.startCard('non-existent' as ItemId))
        .rejects.toThrow('Card not found');
    });
  });

  describe('Answer Processing', () => {
    let testCard: any;

    beforeEach(async () => {
      await engine.initialize(mockContainer);
      const testCards = createTestCards(1);
      testCard = testCards[0];
      await engine.loadCards(testCards);
      await engine.startCard(testCard.id);
    });

    it('should process correct answer', async () => {
      const correctOption = testCard.options.find((opt: any) => opt.isCorrect);
      const answeredSpy = vi.fn();
      
      engine.on('card:answered', answeredSpy);
      
      const result = await engine.answerCard(testCard.id, correctOption.id);
      
      expect(result).toBe(true);
      expect(answeredSpy).toHaveBeenCalledWith({
        cardId: testCard.id,
        attempt: expect.objectContaining({
          isCorrect: true,
          selectedOption: correctOption.id
        }),
        isCorrect: true
      });
    });

    it('should process incorrect answer', async () => {
      const incorrectOption = testCard.options.find((opt: any) => !opt.isCorrect);
      
      const result = await engine.answerCard(testCard.id, incorrectOption.id);
      
      expect(result).toBe(false);
    });

    it('should update progress after answer', async () => {
      const correctOption = testCard.options.find((opt: any) => opt.isCorrect);
      const initialAttempts = engine.progress.totalAttempts;
      
      await engine.answerCard(testCard.id, correctOption.id);
      
      const updatedProgress = engine.progress;
      expect(updatedProgress.totalAttempts).toBe(initialAttempts + 1);
      expect(updatedProgress.correctAnswers).toBe(1);
      expect(updatedProgress.currentStreak).toBe(1);
    });

    it('should throw error for invalid option', async () => {
      await expect(engine.answerCard(testCard.id, 'invalid-option'))
        .rejects.toThrow('Option not found');
    });
  });

  describe('Progress Management', () => {
    beforeEach(async () => {
      await engine.initialize(mockContainer);
    });

    it('should return current progress', () => {
      const progress = engine.getProgress();
      
      expect(progress).toHaveProperty('sessionId');
      expect(progress).toHaveProperty('totalAttempts');
      expect(progress).toHaveProperty('correctAnswers');
      expect(progress).toHaveProperty('currentStreak');
    });

    it('should reset progress', () => {
      // Simulate some progress
      const progress = engine.progress;
      (progress as any).totalAttempts = 5;
      (progress as any).correctAnswers = 3;
      
      engine.resetProgress();
      
      const resetProgress = engine.progress;
      expect(resetProgress.totalAttempts).toBe(0);
      expect(resetProgress.correctAnswers).toBe(0);
      expect(resetProgress.currentStreak).toBe(0);
    });

    it('should export progress as JSON', async () => {
      const exported = await engine.exportProgress();
      const parsed = JSON.parse(exported);
      
      expect(parsed).toHaveProperty('progress');
      expect(parsed).toHaveProperty('exportedAt');
      expect(parsed).toHaveProperty('version');
    });

    it('should import progress from JSON', async () => {
      const mockProgress = {
        progress: {
          totalAttempts: 10,
          correctAnswers: 8,
          currentStreak: 3
        },
        version: '2.0.0'
      };
      
      await engine.importProgress(JSON.stringify(mockProgress));
      
      const imported = engine.progress;
      expect(imported.totalAttempts).toBe(10);
      expect(imported.correctAnswers).toBe(8);
      expect(imported.currentStreak).toBe(3);
    });
  });

  describe('Analytics and Stats', () => {
    beforeEach(async () => {
      await engine.initialize(mockContainer);
    });

    it('should calculate stats correctly', () => {
      const stats = engine.getStats();
      
      expect(stats).toHaveProperty('totalCards');
      expect(stats).toHaveProperty('completedCards');
      expect(stats).toHaveProperty('accuracy');
      expect(stats).toHaveProperty('averageTimePerCard');
      expect(stats).toHaveProperty('currentStreak');
    });

    it('should provide analytics data', () => {
      const analytics = engine.getAnalytics();
      
      expect(analytics).toHaveProperty('sessionSummary');
      expect(analytics).toHaveProperty('learningPatterns');
      expect(analytics).toHaveProperty('engagement');
    });
  });

  describe('Card Filtering and Search', () => {
    beforeEach(async () => {
      await engine.initialize(mockContainer);
      const testCards = createTestCards(5);
      await engine.loadCards(testCards);
    });

    it('should search cards by title', () => {
      const results = engine.searchCards('LinkedIn');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter cards by category', () => {
      const results = engine.filterCards({
        categories: ['fundamentos']
      });
      
      results.forEach(card => {
        expect(card.category).toBe('fundamentos');
      });
    });

    it('should filter cards by difficulty', () => {
      const results = engine.filterCards({
        difficulties: ['beginner']
      });
      
      results.forEach(card => {
        expect(card.difficulty).toBe('beginner');
      });
    });

    it('should get recommended cards', () => {
      const recommended = engine.getRecommendedCards(3);
      expect(recommended.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Bookmarking', () => {
    let testCard: any;

    beforeEach(async () => {
      await engine.initialize(mockContainer);
      const testCards = createTestCards(1);
      testCard = testCards[0];
      await engine.loadCards(testCards);
    });

    it('should bookmark a card', () => {
      const bookmarkedSpy = vi.fn();
      engine.on('card:bookmarked', bookmarkedSpy);
      
      engine.bookmarkCard(testCard.id, true);
      
      expect(engine.progress.bookmarkedCards.has(testCard.id)).toBe(true);
      expect(bookmarkedSpy).toHaveBeenCalledWith({
        cardId: testCard.id,
        bookmarked: true
      });
    });

    it('should remove bookmark', () => {
      engine.bookmarkCard(testCard.id, true);
      engine.bookmarkCard(testCard.id, false);
      
      expect(engine.progress.bookmarkedCards.has(testCard.id)).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should destroy engine properly', async () => {
      await engine.initialize(mockContainer);
      
      engine.destroy();
      
      expect(engine.isInitialized).toBe(false);
      expect(engine.container).toBe(null);
    });
  });
});

// Helper function to create test cards
function createTestCards(count: number) {
  const cards = [];
  
  for (let i = 0; i < count; i++) {
    const cardInput: CreateFlipCardInput = {
      category: 'fundamentos',
      difficulty: 'beginner',
      scenario: {
        title: `Test Card ${i + 1} - LinkedIn Optimization`,
        description: `Test scenario description ${i + 1}`,
        context: {
          industry: 'Technology',
          role: 'Developer',
          urgency: 'medium'
        }
      },
      options: [
        {
          id: 'a',
          text: 'Option A',
          feedback: 'Feedback A',
          isCorrect: false
        },
        {
          id: 'b',
          text: 'Option B',
          feedback: 'Feedback B',
          isCorrect: true
        },
        {
          id: 'c',
          text: 'Option C',
          feedback: 'Feedback C',
          isCorrect: false
        }
      ],
      solution: {
        explanation: 'Test explanation',
        bestPractices: ['Practice 1', 'Practice 2'],
        relatedConcepts: ['Concept 1', 'Concept 2']
      },
      tags: ['test', 'linkedin'],
      estimatedTime: 3,
      points: 10
    };
    
    cards.push(createFlipCard(cardInput));
  }
  
  return cards;
}