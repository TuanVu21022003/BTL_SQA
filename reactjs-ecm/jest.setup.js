// Import các lifecycle hooks của Jest nếu cần thiết
import '@testing-library/jest-dom/extend-expect';  // Thêm các matcher tùy chỉnh từ testing-library

beforeAll(() => {
  global.localStorage = {
    getItem: jest.fn().mockReturnValue('mocked-user-id'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
});

afterAll(() => {
  global.localStorage = undefined;
});
