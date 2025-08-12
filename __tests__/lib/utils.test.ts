import { cn, formatDuration, isValidEmail, isValidPassword } from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should combine class names correctly', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class active-class');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'valid-class');
      expect(result).toBe('base-class valid-class');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(65)).toBe('01:05');
      expect(formatDuration(125)).toBe('02:05');
      expect(formatDuration(0)).toBe('00:00');
    });

    it('should handle large durations', () => {
      expect(formatDuration(3661)).toBe('61:01');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test123@test.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate correct passwords', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('Pass123')).toBe(true);
      expect(isValidPassword('123Password')).toBe(true);
    });

    it('should reject invalid passwords', () => {
      expect(isValidPassword('short')).toBe(false);
      expect(isValidPassword('onlyletters')).toBe(false);
      expect(isValidPassword('12345678')).toBe(false);
      expect(isValidPassword('')).toBe(false);
    });
  });
});
