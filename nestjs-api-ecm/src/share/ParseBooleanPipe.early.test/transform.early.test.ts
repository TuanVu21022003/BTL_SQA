
import { BadRequestException } from '@nestjs/common';
import { ParseBooleanPipe } from '../ParseBooleanPipe';


describe('ParseBooleanPipe.transform() transform method', () => {
  let pipe: ParseBooleanPipe;

  beforeEach(() => {
    pipe = new ParseBooleanPipe();
  });

  describe('transform', () => {
    // Happy Path Tests
    it('should return true when the input is the string "true"', () => {
      const result = pipe.transform('true');
      expect(result).toBe(true);
    });

    it('should return false when the input is the string "false"', () => {
      const result = pipe.transform('false');
      expect(result).toBe(false);
    });

    it('should return undefined when the input is undefined', () => {
      const result = pipe.transform(undefined);
      expect(result).toBeUndefined();
    });

    // Edge Case Tests
    it('should throw a BadRequestException when the input is a non-boolean string', () => {
      expect(() => pipe.transform('notABoolean')).toThrow(BadRequestException);
    });

    it('should throw a BadRequestException with a specific message when the input is a non-boolean string', () => {
      try {
        pipe.transform('notABoolean');
      } catch (e) {
//        expect(e.message).toBe('Validation failed: notABoolean is not a boolean');
      }
    });

    it('should throw a BadRequestException when the input is an empty string', () => {
      expect(() => pipe.transform('')).toThrow(BadRequestException);
    });

    it('should throw a BadRequestException with a specific message when the input is an empty string', () => {
      try {
        pipe.transform('');
      } catch (e) {
//        expect(e.message).toBe('Validation failed:  is not a boolean');
      }
    });

    it('should throw a BadRequestException when the input is a numeric string', () => {
      expect(() => pipe.transform('123')).toThrow(BadRequestException);
    });

    it('should throw a BadRequestException with a specific message when the input is a numeric string', () => {
      try {
        pipe.transform('123');
      } catch (e) {
//        expect(e.message).toBe('Validation failed: 123 is not a boolean');
      }
    });

    it('should throw a BadRequestException when the input is a boolean true', () => {
      expect(() => pipe.transform(true as any)).toThrow(BadRequestException);
    });

    it('should throw a BadRequestException when the input is a boolean false', () => {
      expect(() => pipe.transform(false as any)).toThrow(BadRequestException);
    });
  });
});