/**
 * Video Engagement Tracking
 * Tracks user interactions with HeyGen videos and sends to Mixpanel
 */

interface VideoEvent {
  videoId: string;
  videoTitle: string;
  eventType: 'impression' | 'play' | 'pause' | 'resume' | 'seek' | 'completion' | 'error' | 'fullscreen';
  duration?: number;
  seekTime?: number;
  completionPercent?: number;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
  abTestVariant?: string;
  page?: string;
  deviceType?: string;
}

/**
 * Get device type
 */
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'server';

  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

/**
 * Get current page path
 */
export function getCurrentPage(): string {
  if (typeof window === 'undefined') return 'unknown';
  return window.location.pathname;
}

/**
 * Get or create session ID
 */
export function getVideoSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';

  let sessionId = sessionStorage.getItem('video_session_id');
  if (!sessionId) {
    sessionId = 'vs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('video_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Track video event with Mixpanel
 */
export function trackVideoEvent(event: VideoEvent) {
  if (typeof window === 'undefined') {
    console.log('[Video Track] (server-side):', event);
    return;
  }

  // Add computed fields
  const enrichedEvent = {
    ...event,
    sessionId: event.sessionId || getVideoSessionId(),
    timestamp: event.timestamp.toISOString(),
    page: event.page || getCurrentPage(),
    deviceType: event.deviceType || getDeviceType(),
  };

  // Track with Mixpanel
  if ((window as any).mixpanel) {
    (window as any).mixpanel.track(`video_${event.eventType}`, {
      video_id: event.videoId,
      video_title: event.videoTitle,
      ...enrichedEvent,
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Video Event]', enrichedEvent);
  }

  // Send to analytics API for backup storage
  if (process.env.NEXT_PUBLIC_ANALYTICS_API === 'true') {
    navigator.sendBeacon(
      '/api/analytics/video-events',
      JSON.stringify(enrichedEvent),
    );
  }
}

/**
 * Create video metrics tracker
 */
export class VideoMetricsTracker {
  private videoId: string;
  private videoTitle: string;
  private abTestVariant?: string;
  private startTime: number = 0;
  private totalPlayTime: number = 0;
  private lastResumeTime: number = 0;
  private totalDuration: number = 0;
  private hasTrackedCompletion: boolean = false;

  constructor(videoId: string, videoTitle: string, abTestVariant?: string) {
    this.videoId = videoId;
    this.videoTitle = videoTitle;
    this.abTestVariant = abTestVariant;
  }

  /**
   * Track video impression (page load)
   */
  trackImpression() {
    trackVideoEvent({
      videoId: this.videoId,
      videoTitle: this.videoTitle,
      eventType: 'impression',
      timestamp: new Date(),
      abTestVariant: this.abTestVariant,
    });
  }

  /**
   * Track video play
   */
  trackPlay() {
    this.startTime = Date.now();
    this.lastResumeTime = this.startTime;
    trackVideoEvent({
      videoId: this.videoId,
      videoTitle: this.videoTitle,
      eventType: 'play',
      timestamp: new Date(),
      abTestVariant: this.abTestVariant,
    });
  }

  /**
   * Track video pause
   */
  trackPause() {
    if (this.lastResumeTime > 0) {
      const pauseTime = (Date.now() - this.lastResumeTime) / 1000; // in seconds
      this.totalPlayTime += pauseTime;
    }
    trackVideoEvent({
      videoId: this.videoId,
      videoTitle: this.videoTitle,
      eventType: 'pause',
      duration: this.totalPlayTime,
      timestamp: new Date(),
      abTestVariant: this.abTestVariant,
    });
  }

  /**
   * Track video resume
   */
  trackResume() {
    this.lastResumeTime = Date.now();
    trackVideoEvent({
      videoId: this.videoId,
      videoTitle: this.videoTitle,
      eventType: 'resume',
      duration: this.totalPlayTime,
      timestamp: new Date(),
      abTestVariant: this.abTestVariant,
    });
  }

  /**
   * Track video seek
   */
  trackSeek(seekTimeSeconds: number) {
    if (this.lastResumeTime > 0) {
      const playedSinceLastResume = (Date.now() - this.lastResumeTime) / 1000;
      this.totalPlayTime += playedSinceLastResume;
    }
    this.lastResumeTime = Date.now();

    trackVideoEvent({
      videoId: this.videoId,
      videoTitle: this.videoTitle,
      eventType: 'seek',
      seekTime: seekTimeSeconds,
      duration: this.totalPlayTime,
      timestamp: new Date(),
      abTestVariant: this.abTestVariant,
    });
  }

  /**
   * Track video completion
   */
  trackCompletion(durationSeconds: number) {
    if (this.hasTrackedCompletion) return; // Only track once
    this.hasTrackedCompletion = true;
    this.totalDuration = durationSeconds;
    this.totalPlayTime = durationSeconds;

    trackVideoEvent({
      videoId: this.videoId,
      videoTitle: this.videoTitle,
      eventType: 'completion',
      duration: this.totalPlayTime,
      completionPercent: 100,
      timestamp: new Date(),
      abTestVariant: this.abTestVariant,
    });
  }

  /**
   * Track partial completion
   */
  trackPartialCompletion(durationSeconds: number, completionPercent: number) {
    if (completionPercent >= 100) {
      this.trackCompletion(durationSeconds);
      return;
    }

    trackVideoEvent({
      videoId: this.videoId,
      videoTitle: this.videoTitle,
      eventType: 'completion',
      duration: this.totalPlayTime,
      completionPercent,
      timestamp: new Date(),
      abTestVariant: this.abTestVariant,
    });
  }

  /**
   * Track fullscreen toggle
   */
  trackFullscreen() {
    trackVideoEvent({
      videoId: this.videoId,
      videoTitle: this.videoTitle,
      eventType: 'fullscreen',
      timestamp: new Date(),
      abTestVariant: this.abTestVariant,
    });
  }

  /**
   * Track video error
   */
  trackError(errorMessage?: string) {
    trackVideoEvent({
      videoId: this.videoId,
      videoTitle: this.videoTitle,
      eventType: 'error',
      timestamp: new Date(),
      abTestVariant: this.abTestVariant,
    });
  }
}

/**
 * Video engagement scoring
 * Calculates a score based on various engagement metrics
 */
export function calculateEngagementScore(
  completionPercent: number,
  totalPlayTime: number,
  videoDuration: number,
): number {
  if (videoDuration === 0) return 0;

  // Weight components
  const completionWeight = 0.5; // 50% weight
  const avgPlaySpeedWeight = 0.3; // 30% weight
  const engagementWeight = 0.2; // 20% weight

  const completionScore = (completionPercent / 100) * completionWeight;
  const avgPlaySpeed = videoDuration > 0 ? totalPlayTime / videoDuration : 0;
  const playSpeedScore = Math.min(avgPlaySpeed, 1) * avgPlaySpeedWeight;

  // Engagement: rewarding users who played more than once or had long sessions
  const engagementScore = Math.min(totalPlayTime / 60, 1) * engagementWeight; // Max 1 minute plays = full score

  const totalScore = (completionScore + playSpeedScore + engagementScore) * 100;
  return Math.round(totalScore);
}
