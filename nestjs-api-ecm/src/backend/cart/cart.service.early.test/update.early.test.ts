/**
 * File: update.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức update của CartService
 * Module: Cart
 * Chức năng: Kiểm tra chức năng cập nhật thông tin sản phẩm trong giỏ hàng
 * Ngày tạo: 2023
 */

import { CartService } from '../cart.service';

/**
 * Mock DTO cho việc cập nhật sản phẩm trong giỏ hàng
 * Chứa các thông tin cần thiết để cập nhật sản phẩm trong giỏ hàng
 */
class MockUpdateCartDto {
  public id: string = 'mock-id';     // ID của sản phẩm trong giỏ hàng cần cập nhật
  public quantity: number = 1;       // Số lượng sản phẩm mới
  // Có thể thêm các thuộc tính khác nếu cần
}

/**
 * Mock Repository cho Cart_productEntity
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
class MockCartRepository {
  public update = jest.fn();    // Phương thức cập nhật sản phẩm trong giỏ hàng
  public findOneBy = jest.fn(); // Phương thức tìm kiếm sản phẩm trong giỏ hàng
}

/**
 * Test Suite: CartService.update() update method
 * Mô tả: Kiểm thử chức năng cập nhật thông tin sản phẩm trong giỏ hàng của CartService
 */
describe('CartService.update() update method', () => {
  // Khai báo các biến sử dụng trong test
  let cartService: CartService;               // Service cần test
  let mockCartRepository: MockCartRepository; // Mock repository
  let mockUpdateCartDto: MockUpdateCartDto;   // Mock DTO đầu vào

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    mockCartRepository = new MockCartRepository() as any;
    cartService = new CartService(mockCartRepository as any);
    mockUpdateCartDto = new MockUpdateCartDto() as any;
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-CART-UPDATE-SRV-001
     * Mục tiêu: Kiểm tra việc cập nhật sản phẩm trong giỏ hàng thành công
     * Input:
     *   - updateCartDto:
     *     + id: "mock-id" - ID của sản phẩm trong giỏ hàng
     *     + quantity: 1 - Số lượng sản phẩm mới
     *   - id: "mock-id" - ID của sản phẩm trong giỏ hàng cần cập nhật
     *   - Repository.update trả về: { id: "mock-id", quantity: 2 } (sản phẩm đã cập nhật)
     * Expected Output:
     *   - Object: { id: "mock-id", quantity: 2 } (sản phẩm đã cập nhật)
     *   - Repository.update được gọi với tham số đúng: mockUpdateCartDto, "mock-id"
     * Ghi chú: Service phải trả về đúng sản phẩm đã cập nhật
     */
    it('should update a cart product successfully', async () => {
      // Sắp xếp (Arrange)
      const updatedCartProduct = { id: 'mock-id', quantity: 2 } as any; // Sản phẩm đã cập nhật
      jest.mocked(mockCartRepository.update).mockResolvedValue(updatedCartProduct as any as never); // Giả lập cập nhật thành công

      // Thực thi (Act)
      const result = await cartService.update(mockUpdateCartDto as any, 'mock-id'); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(result).toEqual(updatedCartProduct); // Kiểm tra kết quả trả về đúng với sản phẩm đã cập nhật
      expect(mockCartRepository.update).toHaveBeenCalledWith(mockUpdateCartDto, 'mock-id'); // Kiểm tra repository được gọi với tham số đúng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-CART-UPDATE-SRV-002
     * Mục tiêu: Kiểm tra xử lý khi sản phẩm trong giỏ hàng không tồn tại
     * Input:
     *   - updateCartDto:
     *     + id: "mock-id" - ID của sản phẩm trong giỏ hàng
     *     + quantity: 1 - Số lượng sản phẩm mới
     *   - id: "non-existent-id" - ID không tồn tại
     *   - Repository.update trả về: null (không tìm thấy sản phẩm)
     * Expected Output:
     *   - null
     *   - Repository.update được gọi với tham số đúng: mockUpdateCartDto, "non-existent-id"
     * Ghi chú: Service phải xử lý được trường hợp không tìm thấy sản phẩm cần cập nhật
     */
    it('should handle update when cart product does not exist', async () => {
      // Sắp xếp (Arrange)
      jest.mocked(mockCartRepository.update).mockResolvedValue(null as any as never); // Giả lập không tìm thấy sản phẩm

      // Thực thi (Act)
      const result = await cartService.update(mockUpdateCartDto as any, 'non-existent-id'); // Gọi phương thức cần test với ID không tồn tại

      // Kiểm tra (Assert)
      expect(result).toBeNull(); // Kiểm tra kết quả trả về là null
      expect(mockCartRepository.update).toHaveBeenCalledWith(mockUpdateCartDto, 'non-existent-id'); // Kiểm tra repository được gọi với tham số đúng
    });

    /**
     * Test Case ID: TC-CART-UPDATE-SRV-003
     * Mục tiêu: Kiểm tra xử lý khi gặp lỗi trong quá trình cập nhật
     * Input:
     *   - updateCartDto:
     *     + id: "mock-id" - ID của sản phẩm trong giỏ hàng
     *     + quantity: 1 - Số lượng sản phẩm mới
     *   - id: "mock-id" - ID của sản phẩm trong giỏ hàng cần cập nhật
     *   - Repository.update ném lỗi: Error("Update failed")
     * Expected Output:
     *   - Exception với message: "Update failed"
     *   - Repository.update được gọi với tham số đúng: mockUpdateCartDto, "mock-id"
     * Ghi chú: Service phải ném lại lỗi khi gặp lỗi trong quá trình cập nhật
     */
    it('should handle errors during update', async () => {
      // Sắp xếp (Arrange)
      const error = new Error('Update failed'); // Đối tượng lỗi
      jest.mocked(mockCartRepository.update).mockRejectedValue(error as never); // Giả lập repository ném lỗi

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.update(mockUpdateCartDto as any, 'mock-id')).rejects.toThrow('Update failed'); // Kiểm tra lỗi được ném ra
      expect(mockCartRepository.update).toHaveBeenCalledWith(mockUpdateCartDto, 'mock-id'); // Kiểm tra repository được gọi với tham số đúng
    });
  });
});