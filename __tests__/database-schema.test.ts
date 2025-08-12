import { Database } from '../types/database'

// Test des types TypeScript pour les nouvelles propriétés
describe('Database Schema - New Properties', () => {
  describe('Episodes Table', () => {
    it('should have timestamps property as optional text', () => {
      const episode: Database['public']['Tables']['episodes']['Insert'] = {
        user_id: 'test-user-id',
        title: 'Test Episode',
        audio_file_url: 'https://example.com/audio.mp3',
        timestamps: '00:00 - Introduction, 05:30 - Main Topic',
        video_url: 'https://youtube.com/watch?v=test123'
      }

      expect(episode.timestamps).toBeDefined()
      expect(episode.video_url).toBeDefined()
      expect(typeof episode.timestamps).toBe('string')
      expect(typeof episode.video_url).toBe('string')
    })

    it('should allow null values for optional properties', () => {
      const episode: Database['public']['Tables']['episodes']['Insert'] = {
        user_id: 'test-user-id',
        title: 'Test Episode',
        audio_file_url: 'https://example.com/audio.mp3',
        timestamps: null,
        video_url: null
      }

      expect(episode.timestamps).toBeNull()
      expect(episode.video_url).toBeNull()
    })
  })

  describe('Transcriptions Table', () => {
    it('should have type property with correct values', () => {
      const transcription: Database['public']['Tables']['transcriptions']['Insert'] = {
        episode_id: 'test-episode-id',
        raw_text: 'Test transcription text',
        type: 'raw'
      }

      expect(transcription.type).toBe('raw')
    })

    it('should allow enhanced type', () => {
      const transcription: Database['public']['Tables']['transcriptions']['Insert'] = {
        episode_id: 'test-episode-id',
        raw_text: 'Test transcription text',
        type: 'enhanced'
      }

      expect(transcription.type).toBe('enhanced')
    })

    it('should have type as optional with default', () => {
      const transcription: Database['public']['Tables']['transcriptions']['Insert'] = {
        episode_id: 'test-episode-id',
        raw_text: 'Test transcription text'
        // type is optional and should default to 'raw'
      }

      expect(transcription.type).toBeUndefined()
    })
  })

  describe('Type Compatibility', () => {
    it('should allow updating episodes with new properties', () => {
      const update: Database['public']['Tables']['episodes']['Update'] = {
        timestamps: '00:00 - New Introduction, 10:00 - New Topic',
        video_url: 'https://vimeo.com/test456'
      }

      expect(update.timestamps).toBeDefined()
      expect(update.video_url).toBeDefined()
    })

    it('should allow updating transcriptions with type', () => {
      const update: Database['public']['Tables']['transcriptions']['Update'] = {
        type: 'enhanced'
      }

      expect(update.type).toBe('enhanced')
    })
  })
})
