import { ParseBooleanPipe } from './ParseBooleanPipe'; // Điều chỉnh đường dẫn nếu cần
import { BadRequestException } from '@nestjs/common';

describe('ParseBooleanPipe', () => {
  let parseBooleanPipe: ParseBooleanPipe;

  beforeEach(() => {
    parseBooleanPipe = new ParseBooleanPipe();
  });

  describe('transform', () => {
    it('nên trả về true khi giá trị là "true"', () => {
      const result = parseBooleanPipe.transform('true');
      expect(result).toBe(true);
    });

    it('nên trả về false khi giá trị là "false"', () => {
      const result = parseBooleanPipe.transform('false');
      expect(result).toBe(false);
    });

    it('nên trả về undefined khi giá trị là undefined', () => {
      const result = parseBooleanPipe.transform(undefined as any); // Ép kiểu để test undefined
      expect(result).toBeUndefined();
    });

    it('nên throw BadRequestException khi giá trị không phải "true" hoặc "false"', () => {
      const invalidValue = 'yes';
      expect(() => parseBooleanPipe.transform(invalidValue)).toThrow(BadRequestException);
      expect(() => parseBooleanPipe.transform(invalidValue)).toThrow(
        `Validation failed: ${invalidValue} is not a boolean`,
      );
    });

    it('nên throw BadRequestException khi giá trị là chuỗi rỗng', () => {
      const invalidValue = '';
      expect(() => parseBooleanPipe.transform(invalidValue)).toThrow(BadRequestException);
      expect(() => parseBooleanPipe.transform(invalidValue)).toThrow(
        `Validation failed: ${invalidValue} is not a boolean`,
      );
    });

    it('nên throw BadRequestException khi giá trị là số', () => {
      const invalidValue = '1';
      expect(() => parseBooleanPipe.transform(invalidValue)).toThrow(BadRequestException);
      expect(() => parseBooleanPipe.transform(invalidValue)).toThrow(
        `Validation failed: ${invalidValue} is not a boolean`,
      );
    });

    it('nên throw BadRequestException khi giá trị là "TRUE" (khác case)', () => {
      const invalidValue = 'TRUE';
      expect(() => parseBooleanPipe.transform(invalidValue)).toThrow(BadRequestException);
      expect(() => parseBooleanPipe.transform(invalidValue)).toThrow(
        `Validation failed: ${invalidValue} is not a boolean`,
      );
    });
  });
});