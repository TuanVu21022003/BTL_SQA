import { GenerateEntityCode } from 'src/share/GenerateEntityCode'; // Điều chỉnh đường dẫn nếu cần

describe('GenerateEntityCode', () => {
  describe('generateOrderCode', () => {
    it('nên tạo mã với định dạng đúng: entityCode-timestamp-randomPart', () => {
      const entityCode = 'ORDER';
      const code = GenerateEntityCode.generateOrderCode(entityCode);

      // Kiểm tra định dạng: entityCode-timestamp-randomPart
      const parts = code.split('-');
      expect(parts.length).toBe(3); // Phải có 3 phần
      expect(parts[0]).toBe('ORDER'); // Phần đầu là entityCode
      expect(parts[1]).toMatch(/^[0-9a-z]+$/); // Timestamp ở base36
      expect(parts[2]).toMatch(/^[0-9a-z]+$/); // Random ở base36
    });

    it('nên tạo mã có độ dài hợp lý', () => {
      const entityCode = 'ORDER';
      const code = GenerateEntityCode.generateOrderCode(entityCode);

      // Kiểm tra độ dài tổng thể
      expect(code.length).toBeGreaterThanOrEqual('ORDER-'.length + 10); // Tối thiểu: entityCode + dấu gạch + timestamp ngắn + random ngắn
      expect(code.length).toBeLessThanOrEqual('ORDER-'.length + 30); // Tối đa ước lượng: entityCode + timestamp dài + random 10 ký tự
    });

    it('nên tạo mã khác nhau khi gọi liên tục', () => {
      const entityCode = 'PRODUCT';
      const code1 = GenerateEntityCode.generateOrderCode(entityCode);
      const code2 = GenerateEntityCode.generateOrderCode(entityCode);

      // Kiểm tra tính duy nhất
      expect(code1).not.toBe(code2);
    });

    it('nên hoạt động với entityCode rỗng', () => {
      const entityCode = '';
      const code = GenerateEntityCode.generateOrderCode(entityCode);

      // Kiểm tra định dạng khi entityCode rỗng
      const parts = code.split('-');
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe(''); // Phần đầu là rỗng
      expect(parts[1]).toMatch(/^[0-9a-z]+$/); // Timestamp
      expect(parts[2]).toMatch(/^[0-9a-z]+$/); // Random
    });

    it('nên tạo mã với entityCode chứa ký tự đặc biệt', () => {
      const entityCode = 'ORDER#123';
      const code = GenerateEntityCode.generateOrderCode(entityCode);

      // Kiểm tra định dạng
      const parts = code.split('-');
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe('ORDER#123'); // Giữ nguyên entityCode
      expect(parts[1]).toMatch(/^[0-9a-z]+$/);
      expect(parts[2]).toMatch(/^[0-9a-z]+$/);
    });
  });
});