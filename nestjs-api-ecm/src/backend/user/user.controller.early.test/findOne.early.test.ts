// Import các module cần thiết
import { responseHandler } from 'src/Until/responseUtil';
import { UserController } from '../user.controller';

/**
 * Mock Classes
 * Mục đích: Tạo các lớp giả lập để phục vụ việc test
 */

/**
 * MockUserService
 * Mục đích: Giả lập UserService với phương thức findOne
 * Phương thức:
 * - findOne: phương thức jest.fn() để giả lập việc tìm kiếm user theo ID
 */
class MockUserService {
  public findOne = jest.fn();
}

/**
 * Test Suite: UserController.findOne()
 * Mục đích: Kiểm thử phương thức findOne của UserController
 */
describe('UserController.findOne() findOne method', () => {
  // Khai báo biến để sử dụng trong các test case
  let userController: UserController;
  let mockUserService: MockUserService;

  /**
   * Hook beforeEach
   * Mục đích: Khởi tạo các đối tượng cần thiết trước mỗi test case
   * Output: Instance mới của UserController và MockUserService
   */
  beforeEach(() => {
    mockUserService = new MockUserService() as any;
    userController = new UserController(mockUserService as any);
  });

  /**
   * Test Suite Con: Happy Paths
   * Mục đích: Kiểm thử các trường hợp thành công
   */
  describe('Happy Paths', () => {
    /**
     * Test Case TC001: Tìm kiếm user với ID hợp lệ
     * Mục tiêu: Kiểm tra việc tìm kiếm user thành công với ID tồn tại
     * Input: 
     * - mockUserId: '123'
     * Expected Output: 
     * - responseHandler.ok với dữ liệu user { id: '123', name: 'John Doe' }
     * Ghi chú: Kiểm tra cả việc gọi service và kết quả trả về
     */
    it('should return user data when user is found', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUserId = '123';
      const mockUserData = { id: mockUserId, name: 'John Doe' };
      jest.mocked(mockUserService.findOne).mockResolvedValue(mockUserData as any as never);

      // Act: Thực hiện hành động test
      const result = await userController.findOne(mockUserId);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.findOne).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(responseHandler.ok(mockUserData));
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge Cases', () => {
    /**
     * Test Case TC002: Tìm kiếm user không tồn tại
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy user
     * Input:
     * - mockUserId: '999' (ID không tồn tại)
     * Expected Output:
     * - responseHandler.error với message 'User not found'
     * Ghi chú: Kiểm tra khả năng xử lý lỗi khi user không tồn tại
     */
    it('should handle error when user is not found', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUserId = '999';
      const mockError = new Error('User not found');
      jest.mocked(mockUserService.findOne).mockRejectedValue(mockError as never);

      // Act: Thực hiện hành động test
      const result = await userController.findOne(mockUserId);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.findOne).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });

    /**
     * Test Case TC003: Xử lý ngoại lệ không phải Error
     * Mục tiêu: Kiểm tra xử lý khi service trả về exception không phải Error
     * Input:
     * - mockUserId: '999'
     * - mockException: object { message: 'Unexpected error' }
     * Expected Output:
     * - responseHandler.error với message là chuỗi JSON của exception
     * Ghi chú: Kiểm tra khả năng xử lý các loại exception khác nhau
     */
    it('should handle non-error exceptions gracefully', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUserId = '999';
      const mockException = { message: 'Unexpected error' };
      jest.mocked(mockUserService.findOne).mockRejectedValue(mockException as never);

      // Act: Thực hiện hành động test
      const result = await userController.findOne(mockUserId);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.findOne).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(responseHandler.error(JSON.stringify(mockException)));
    });
  });
});