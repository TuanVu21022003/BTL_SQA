/**
 * @file Cart.test.jsx
 * @description File kiểm thử đơn vị cho component Cart
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Cart from "./Cart";
import { CartProvider } from "../../Context/CartContext";
import * as cartService from "../../services/cart-service";

// Mock các module và service cần thiết
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

jest.mock("../../services/cart-service", () => ({
  getCarts: jest.fn(),
  updateCart: jest.fn(),
  deleteCartItems: jest.fn(),
}));

jest.mock("../../util/auth-local", () => ({
  getUserId: jest.fn().mockReturnValue("user123"),
}));

// Mock component con
jest.mock("../Header/header.jsx", () => () => <div data-testid="header-mock" />);
jest.mock("../Footer/footer.jsx", () => () => <div data-testid="footer-mock" />);
jest.mock("../HomePages/LatestProducts.jsx", () => () => <div data-testid="latest-products-mock" />);

// Dữ liệu mẫu cho test
const mockCarts = [
  {
    id: 1,
    quantity: 2,
    product: {
      id: 101,
      name: "Gạo Jasmine",
      weight: 5,
      priceout: 150000,
      url_images: '{"url_images1": "images/products/rice1.jpg", "url_images2": "images/products/rice1-2.jpg"}',
      url_image1: "images/products/rice1.jpg",
      url_image2: "images/products/rice1-2.jpg",
    },
  },
  {
    id: 2,
    quantity: 1,
    product: {
      id: 102,
      name: "Gạo ST25",
      weight: 10,
      priceout: 300000,
      url_images: '{"url_images1": "images/products/rice2.jpg", "url_images2": "images/products/rice2-2.jpg"}',
      url_image1: "images/products/rice2.jpg",
      url_image2: "images/products/rice2-2.jpg",
    },
  },
];

// Hàm helper để render component với các provider cần thiết
const renderCartWithProviders = (initialCarts = mockCarts) => {
  const mockCartContext = {
    carts: initialCarts,
    setCarts: jest.fn(),
    setTotalQuantity: jest.fn(),
    updateSelectedCartItems: jest.fn(),
    isLoading: false,
  };

  return render(
    <BrowserRouter>
      <CartProvider value={mockCartContext}>
        <Cart />
      </CartProvider>
    </BrowserRouter>
  );
};

/**
 * Test suite cho component Cart
 * - Kiểm tra hiển thị và chức năng của giỏ hàng
 */
describe("Cart Component", () => {
  beforeEach(() => {
    // Reset mocks trước mỗi test case
    jest.clearAllMocks();
    
    // Mock response cho getCarts
    cartService.getCarts.mockResolvedValue({
      data: {
        data: {
          cart: mockCarts,
          total: mockCarts.length,
        },
      },
    });
  });

  /**
   * Test case: TC-01 - Kiểm tra hiển thị giỏ hàng khi có sản phẩm
   * Mục tiêu: Xác nhận component hiển thị đúng thông tin giỏ hàng khi có sản phẩm
   * Input: Danh sách sản phẩm trong giỏ hàng
   * Expected output: Hiển thị đúng thông tin sản phẩm, số lượng và giá tiền
   */
  it("should render cart items correctly when cart has products", async () => {
    // Chuẩn bị dữ liệu
    renderCartWithProviders();

    // Kiểm tra
    expect(screen.getByText("Giỏ hàng của bạn")).toBeInTheDocument();
    expect(screen.getByText("Gạo Jasmine")).toBeInTheDocument();
    expect(screen.getByText("Gạo ST25")).toBeInTheDocument();
    
    // Kiểm tra hiển thị số lượng
    const quantityInputs = screen.getAllByRole("textbox");
    expect(quantityInputs[0].value).toBe("2");
    expect(quantityInputs[1].value).toBe("1");
    
    // Kiểm tra hiển thị giá tiền
    expect(screen.getByText("300.000")).toBeInTheDocument(); // 300.000 cho Gạo ST25
    expect(screen.getByText("600.000")).toBeInTheDocument(); // Tổng thanh toán khi chọn tất cả
  });

  /**
   * Test case: TC-02 - Kiểm tra hiển thị khi giỏ hàng trống
   * Mục tiêu: Xác nhận component hiển thị thông báo phù hợp khi giỏ hàng trống
   * Input: Giỏ hàng rỗng
   * Expected output: Hiển thị thông báo giỏ hàng trống và nút "Mua ngay"
   */
  it("should display empty cart message when cart is empty", () => {
    // Chuẩn bị dữ liệu
    renderCartWithProviders([]);

    // Kiểm tra
    expect(screen.getByText("Giỏ hàng của bạn đang trống")).toBeInTheDocument();
    expect(screen.getByText("Mua ngay")).toBeInTheDocument();
  });

  /**
   * Test case: TC-03 - Kiểm tra chức năng tăng số lượng sản phẩm
   * Mục tiêu: Xác nhận số lượng sản phẩm được tăng và cập nhật đúng
   * Input: Click vào nút tăng số lượng
   * Expected output: Gọi API updateCart với số lượng tăng lên 1
   */
  it("should increase product quantity when plus button is clicked", async () => {
    // Chuẩn bị dữ liệu
    renderCartWithProviders();
    
    // Thực thi
    const plusButtons = screen.getAllByRole("button").filter(button => 
      button.textContent.includes("+") || button.querySelector("svg")
    );
    fireEvent.click(plusButtons[1]); // Click nút tăng của sản phẩm đầu tiên
    
    // Kiểm tra
    await waitFor(() => {
      expect(cartService.updateCart).toHaveBeenCalledWith({
        ...mockCarts[0],
        quantity: mockCarts[0].quantity + 1,
      });
    });
    expect(cartService.getCarts).toHaveBeenCalled();
  });

  /**
   * Test case: TC-04 - Kiểm tra chức năng giảm số lượng sản phẩm
   * Mục tiêu: Xác nhận số lượng sản phẩm được giảm và cập nhật đúng
   * Input: Click vào nút giảm số lượng
   * Expected output: Gọi API updateCart với số lượng giảm đi 1
   */
  it("should decrease product quantity when minus button is clicked", async () => {
    // Chuẩn bị dữ liệu
    renderCartWithProviders();
    
    // Thực thi
    const minusButtons = screen.getAllByRole("button").filter(button => 
      button.textContent.includes("-") || button.querySelector("svg")
    );
    fireEvent.click(minusButtons[0]); // Click nút giảm của sản phẩm đầu tiên
    
    // Kiểm tra
    await waitFor(() => {
      expect(cartService.updateCart).toHaveBeenCalledWith({
        ...mockCarts[0],
        quantity: mockCarts[0].quantity - 1,
      });
    });
    expect(cartService.getCarts).toHaveBeenCalled();
  });

  /**
   * Test case: TC-05 - Kiểm tra chức năng xóa sản phẩm khỏi giỏ hàng
   * Mục tiêu: Xác nhận sản phẩm được xóa khỏi giỏ hàng
   * Input: Click vào nút "Xóa"
   * Expected output: Gọi API deleteCartItems với ID sản phẩm cần xóa
   */
  it("should remove product from cart when delete button is clicked", async () => {
    // Chuẩn bị dữ liệu
    renderCartWithProviders();
    
    // Thực thi
    const deleteButtons = screen.getAllByText("Xóa");
    fireEvent.click(deleteButtons[0]); // Click nút xóa của sản phẩm đầu tiên
    
    // Kiểm tra
    await waitFor(() => {
      expect(cartService.deleteCartItems).toHaveBeenCalledWith([mockCarts[0].id]);
    });
    expect(cartService.getCarts).toHaveBeenCalled();
  });

  /**
   * Test case: TC-06 - Kiểm tra chức năng chọn/bỏ chọn sản phẩm
   * Mục tiêu: Xác nhận trạng thái chọn sản phẩm được cập nhật đúng
   * Input: Click vào checkbox của sản phẩm
   * Expected output: Sản phẩm được chọn/bỏ chọn và tổng tiền được cập nhật
   */
  it("should select/deselect product when checkbox is clicked", () => {
    // Chuẩn bị dữ liệu
    renderCartWithProviders();
    
    // Thực thi - chọn sản phẩm đầu tiên
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // Click checkbox của sản phẩm đầu tiên
    
    // Kiểm tra tổng tiền được cập nhật
    expect(screen.getByText("300.000")).toBeInTheDocument(); // Giá của sản phẩm đầu tiên
  });

  /**
   * Test case: TC-07 - Kiểm tra chức năng chọn tất cả sản phẩm
   * Mục tiêu: Xác nhận tất cả sản phẩm được chọn khi click vào "Chọn tất cả"
   * Input: Click vào checkbox "Chọn tất cả"
   * Expected output: Tất cả sản phẩm được chọn và tổng tiền được cập nhật
   */
  it("should select all products when 'Select All' checkbox is clicked", () => {
    // Chuẩn bị dữ liệu
    renderCartWithProviders();
    
    // Thực thi
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0]; // Checkbox "Chọn tất cả"
    fireEvent.click(selectAllCheckbox);
    
    // Kiểm tra tất cả checkbox được chọn
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
    
    // Kiểm tra tổng tiền được cập nhật
    expect(screen.getByText("600.000")).toBeInTheDocument(); // Tổng tiền của tất cả sản phẩm
  });

  /**
   * Test case: TC-08 - Kiểm tra chức năng thanh toán khi không có sản phẩm nào được chọn
   * Mục tiêu: Xác nhận hiển thị thông báo khi không có sản phẩm nào được chọn để thanh toán
   * Input: Click vào nút "Mua hàng" khi không có sản phẩm nào được chọn
   * Expected output: Hiển thị thông báo yêu cầu chọn ít nhất một sản phẩm
   */
  it("should show notification when trying to checkout without selecting any product", () => {
    // Chuẩn bị dữ liệu
    renderCartWithProviders();
    
    // Thực thi - không chọn sản phẩm nào và click nút "Mua hàng"
    const checkoutButton = screen.getByText("Mua hàng");
    fireEvent.click(checkoutButton);
    
    // Kiểm tra thông báo
    expect(screen.getByText("Vui lòng chọn ít nhất một sản phẩm để thanh toán!")).toBeInTheDocument();
  });
});
