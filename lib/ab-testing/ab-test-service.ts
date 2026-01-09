/**
 * A/B Testing Service
 * Manages test variants, assignments, and tracking for video placements
 */

export type ABTestVariant = 'control' | 'treatment' | 'treatment2';

export interface ABTestConfig {
  testId: string;
  name: string;
  description: string;
  variants: {
    [key in ABTestVariant]: {
      name: string;
      weight: number; // 0-100, total should be 100
      config: Record<string, any>;
    };
  };
  startDate?: Date;
  endDate?: Date;
  metrics: string[]; // e.g., ['impression', 'play', 'completion']
}

export interface ABTestAssignment {
  testId: string;
  userId?: string;
  sessionId: string;
  variant: ABTestVariant;
  assignedAt: Date;
  expiresAt: Date;
}

export interface ABTestEvent {
  testId: string;
  userId?: string;
  sessionId: string;
  variant: ABTestVariant;
  eventType: string;
  eventData?: Record<string, any>;
  timestamp: Date;
}

/**
 * A/B Testing Service
 */
export class ABTestService {
  private static readonly STORAGE_KEY_PREFIX = 'ab_test_';
  private static readonly SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly VARIANT_WEIGHTS: Record<ABTestVariant, number> = {
    control: 33,
    treatment: 33,
    treatment2: 34,
  };

  /**
   * Get or create session ID
   */
  static getSessionId(): string {
    if (typeof window === 'undefined') return 'server-' + Math.random();

    let sessionId = sessionStorage.getItem('ab_test_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('ab_test_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get or assign variant for a test
   */
  static getVariant(testId: string): ABTestVariant {
    const sessionId = this.getSessionId();
    const storageKey = this.STORAGE_KEY_PREFIX + testId;

    // Check if we already have an assignment
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        try {
          const assignment = JSON.parse(stored);
          if (new Date(assignment.expiresAt) > new Date()) {
            return assignment.variant;
          }
        } catch (e) {
          console.error('Error parsing AB test assignment:', e);
        }
      }
    }

    // Assign new variant
    const variant = this.assignVariant();
    const assignment: ABTestAssignment = {
      testId,
      sessionId,
      variant,
      assignedAt: new Date(),
      expiresAt: new Date(Date.now() + this.SESSION_DURATION_MS),
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, JSON.stringify(assignment));
    }

    return variant;
  }

  /**
   * Randomly assign variant based on weights
   */
  private static assignVariant(): ABTestVariant {
    const rand = Math.random() * 100;
    const variants: ABTestVariant[] = ['control', 'treatment', 'treatment2'];
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += this.VARIANT_WEIGHTS[variant];
      if (rand < cumulative) {
        return variant;
      }
    }

    return 'control';
  }

  /**
   * Track A/B test event (uses Mixpanel if available)
   */
  static trackEvent(testId: string, eventType: string, variant: ABTestVariant, eventData?: Record<string, any>) {
    const event: ABTestEvent = {
      testId,
      sessionId: this.getSessionId(),
      variant,
      eventType,
      eventData,
      timestamp: new Date(),
    };

    // Track with Mixpanel if available
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(`ab_test_${testId}_${eventType}`, {
        ...event,
        ...eventData,
      });
    }

    // Also send to server for logging
    if (typeof window !== 'undefined') {
      navigator.sendBeacon(
        '/api/ab-tests/track',
        JSON.stringify(event),
      );
    }

    return event;
  }

  /**
   * Get recommended variants based on test configs
   */
  static getRecommendedVariant(testId: string, conversionRate: Record<ABTestVariant, number>): ABTestVariant {
    // Simple implementation: return variant with highest conversion rate
    // In production, use statistical significance testing (e.g., Bayesian)
    let best: ABTestVariant = 'control';
    let bestRate = conversionRate['control'] || 0;

    for (const variant of ['treatment', 'treatment2'] as ABTestVariant[]) {
      if ((conversionRate[variant] || 0) > bestRate) {
        best = variant;
        bestRate = conversionRate[variant] || 0;
      }
    }

    return best;
  }
}

/**
 * Video-specific A/B test configurations
 */
export const videoABTests: Record<string, ABTestConfig> = {
  homepage_hero_video: {
    testId: 'homepage_hero_video',
    name: 'Homepage Hero Video Presence',
    description: 'Test presence of hero video testimonial on homepage',
    variants: {
      control: {
        name: 'No Video (Text Only)',
        weight: 50,
        config: { showVideo: false },
      },
      treatment: {
        name: 'With Hero Video',
        weight: 50,
        config: { showVideo: true, autoplay: true, muted: true },
      },
      treatment2: {
        name: 'With Hero Video (Manual Play)',
        weight: 0,
        config: { showVideo: true, autoplay: false },
      },
    },
    metrics: ['impression', 'play', 'completion', 'cta_click', 'signup'],
  },

  homepage_explainer_video: {
    testId: 'homepage_explainer_video',
    name: 'Homepage Explainer Video',
    description: 'Test explainer video effectiveness in "Como Funciona" section',
    variants: {
      control: {
        name: 'No Video (Steps Only)',
        weight: 50,
        config: { showVideo: false },
      },
      treatment: {
        name: 'With Explainer Video',
        weight: 50,
        config: { showVideo: true, autoplay: false },
      },
      treatment2: {
        name: 'No Config',
        weight: 0,
        config: {},
      },
    },
    metrics: ['impression', 'play', 'completion', 'cta_click'],
  },

  cliente_testimonial_video: {
    testId: 'cliente_testimonial_video',
    name: 'Cliente Testimonial Videos',
    description: 'Test video testimonials vs text testimonials',
    variants: {
      control: {
        name: 'Text Testimonials',
        weight: 40,
        config: { format: 'text' },
      },
      treatment: {
        name: 'Video Testimonials',
        weight: 60,
        config: { format: 'video' },
      },
      treatment2: {
        name: 'Mixed Format',
        weight: 0,
        config: { format: 'mixed' },
      },
    },
    metrics: ['impression', 'play', 'rotation', 'cta_click', 'lawyer_view'],
  },

  advogado_testimonial_video: {
    testId: 'advogado_testimonial_video',
    name: 'Advogado Testimonial Videos',
    description: 'Test video testimonials effectiveness for lawyers',
    variants: {
      control: {
        name: 'Text Testimonials',
        weight: 40,
        config: { format: 'text' },
      },
      treatment: {
        name: 'Video Testimonials',
        weight: 60,
        config: { format: 'video' },
      },
      treatment2: {
        name: 'No Config',
        weight: 0,
        config: {},
      },
    },
    metrics: ['impression', 'play', 'completion', 'signup', 'plan_upgrade'],
  },

  advogado_day_in_life_video: {
    testId: 'advogado_day_in_life_video',
    name: 'Advogado Day in Life Video',
    description: 'Test impact of day-in-life documentary video',
    variants: {
      control: {
        name: 'No Video',
        weight: 50,
        config: { showVideo: false },
      },
      treatment: {
        name: 'With Day in Life Video',
        weight: 50,
        config: { showVideo: true, autoplay: true, muted: true },
      },
      treatment2: {
        name: 'No Config',
        weight: 0,
        config: {},
      },
    },
    metrics: ['impression', 'play', 'completion', 'scroll_depth', 'signup'],
  },

  advogado_roi_explainer_video: {
    testId: 'advogado_roi_explainer_video',
    name: 'Advogado ROI Explainer Video',
    description: 'Test ROI explainer video effectiveness',
    variants: {
      control: {
        name: 'Static Calculator',
        weight: 40,
        config: { showVideo: false },
      },
      treatment: {
        name: 'With ROI Video + Calculator',
        weight: 60,
        config: { showVideo: true, videoFirst: true },
      },
      treatment2: {
        name: 'No Config',
        weight: 0,
        config: {},
      },
    },
    metrics: ['impression', 'play', 'calculator_interaction', 'conversion'],
  },
};
