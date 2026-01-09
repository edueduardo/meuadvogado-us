/**
 * HeyGen Service
 * Handles API interactions with HeyGen for video generation and management
 * Documentation: https://docs.heygen.com/
 */

export interface VideoGenerationRequest {
  script: string;
  avatar?: string; // Default: 'Wayne_20220816'
  voiceId?: string;
  language?: string; // 'pt-BR' for Portuguese
  title: string;
  resolution?: '512x512' | '1024x768' | '1280x720' | '1920x1080';
}

export interface VideoMetadata {
  videoId: string;
  title: string;
  script: string;
  duration: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  embedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class HeyGenService {
  private apiKey: string;
  private apiBaseUrl = 'https://api.heygen.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HEYGEN_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  HeyGen API key not configured. Video generation will not work.');
    }
  }

  /**
   * Generate a video from a script
   */
  async generateVideo(request: VideoGenerationRequest): Promise<{ videoId: string; status: string }> {
    if (!this.apiKey) {
      throw new Error('HeyGen API key not configured');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/video_requests`, {
        method: 'POST',
        headers: {
          'X-HAPI-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: false,
          caption: true,
          title: request.title,
          script: [
            {
              type: 'talk',
              avatar_id: request.avatar || 'Wayne_20220816',
              voice: {
                voice_id: request.voiceId || 'pt-BR-Neural2-C', // Google Cloud voice
              },
              script: request.script,
            },
          ],
          dimension: {
            width: 1280,
            height: 720,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`HeyGen API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        videoId: data.data.video_id,
        status: data.data.status,
      };
    } catch (error) {
      console.error('Error generating HeyGen video:', error);
      throw error;
    }
  }

  /**
   * Get video status and details
   */
  async getVideoStatus(videoId: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('HeyGen API key not configured');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/video_requests/${videoId}`, {
        method: 'GET',
        headers: {
          'X-HAPI-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching video status:', error);
      throw error;
    }
  }

  /**
   * Get video download URL (once completed)
   */
  async getVideoUrl(videoId: string): Promise<string> {
    const status = await this.getVideoStatus(videoId);

    if (status.data.status !== 'completed') {
      throw new Error(`Video is not ready yet. Status: ${status.data.status}`);
    }

    return status.data.video_url;
  }

  /**
   * List all generated videos
   */
  async listVideos(limit = 20, offset = 0): Promise<any> {
    if (!this.apiKey) {
      throw new Error('HeyGen API key not configured');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/video_requests?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'X-HAPI-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list videos: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing videos:', error);
      throw error;
    }
  }

  /**
   * Get available avatars
   */
  async getAvailableAvatars(): Promise<any> {
    if (!this.apiKey) {
      throw new Error('HeyGen API key not configured');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/avatars`, {
        method: 'GET',
        headers: {
          'X-HAPI-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch avatars: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching avatars:', error);
      throw error;
    }
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<any> {
    if (!this.apiKey) {
      throw new Error('HeyGen API key not configured');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/voices`, {
        method: 'GET',
        headers: {
          'X-HAPI-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }
}

// Singleton instance
let heygenServiceInstance: HeyGenService | null = null;

export function getHeyGenService(): HeyGenService {
  if (!heygenServiceInstance) {
    heygenServiceInstance = new HeyGenService();
  }
  return heygenServiceInstance;
}
