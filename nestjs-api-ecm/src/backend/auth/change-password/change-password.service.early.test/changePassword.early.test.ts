import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ChangePasswordService } from '../change-password.service';

// Mock module bcrypt để giả lập các hàm compare và hash
jest.mock('bcrypt', () => ({
  compare: jest.fn(), // Giả lập hàm compare
  hash: jest.fn(),    // Giả lập hàm hash
}));

// Các lớp mock
class MockchangePassDTO {
  public password: string = 'oldPassword'; // Mật khẩu cũ
  public newPassword: string = 'newPassword'; // Mật khẩu mới
}

class MockUser {
  public id: string = 'user-id'; // ID người dùng
  public password: string = 'hashedOldPassword'; // Mật khẩu đã mã hóa
}

class MockRepository {
  public findOneBy = jest.fn(); // Giả lập hàm tìm kiếm người dùng
  public save = jest.fn(); // Giả lập hàm lưu người dùng
}

describe('ChangePasswordService.changePassword() changePassword method', () => {
  let service: ChangePasswordService;
  let mockUserRepo: MockRepository;
  let mockUser: MockUser;
  let mockChangePassDTO: MockchangePassDTO;

  // Thiết lập trước mỗi kiểm thử
  beforeEach(() => {
    mockUserRepo = new MockRepository() as any;
    service = new ChangePasswordService(mockUserRepo as any);
    mockUser = new MockUser() as any;
    mockChangePassDTO = new MockchangePassDTO() as any;

    // Xóa các giá trị mock trước đó để đảm bảo mỗi kiểm thử độc lập
    jest.clearAllMocks();
  });

  // Kiểm thử trường hợp thành công
  it('should change the password successfully', async () => {
    // Sắp xếp (Arrange)
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser); // Tìm thấy người dùng
    jest.mocked(bcrypt.compare).mockResolvedValue(true); // Mật khẩu cũ khớp
    jest.mocked(bcrypt.hash).mockResolvedValue('hashedNewPassword'); // Mã hóa mật khẩu mới
    jest.mocked(mockUserRepo.save).mockResolvedValue(mockUser); // Lưu thành công

    // Thực thi (Act)
    const result = await service.changePassword('user-id', mockChangePassDTO as any);

    // Kiểm tra (Assert)
    expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: 'user-id' }); // Đã gọi tìm kiếm người dùng
    expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', 'hashedOldPassword'); // Đã so sánh mật khẩu
    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10); // Đã mã hóa mật khẩu mới
    expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser); // Đã lưu người dùng
    expect(result).toEqual(mockUser); // Kết quả trả về đúng
  });

  // Kiểm thử trường hợp không tìm thấy người dùng
  it('should throw NotFoundException if user is not found', async () => {
    // Sắp xếp (Arrange)
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(null); // Không tìm thấy người dùng

    // Thực thi & Kiểm tra (Act & Assert)
    await expect(service.changePassword('invalid-user-id', mockChangePassDTO as any))
      .rejects
      .toThrow(NotFoundException); // Phải ném lỗi NotFoundException
  });

  // Kiểm thử trường hợp mật khẩu hiện tại không đúng
  it('should throw an error if the current password is incorrect', async () => {
    // Sắp xếp (Arrange)
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser); // Tìm thấy người dùng
    jest.mocked(bcrypt.compare).mockResolvedValue(false); // Mật khẩu cũ không khớp

    // Thực thi & Kiểm tra (Act & Assert)
    await expect(service.changePassword('user-id', mockChangePassDTO as any))
      .rejects
      .toThrow('CHANGE-PASS.USER NOT EXIST!'); // Phải ném lỗi
  });

  // Kiểm thử trường hợp lưu mật khẩu mới thất bại
  it('should throw an error if saving the new password fails', async () => {
    // Sắp xếp (Arrange)
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser); // Tìm thấy người dùng
    jest.mocked(bcrypt.compare).mockResolvedValue(true); // Mật khẩu cũ khớp
    jest.mocked(bcrypt.hash).mockResolvedValue('hashedNewPassword'); // Mã hóa mật khẩu mới
    jest.mocked(mockUserRepo.save).mockResolvedValue(null); // Lưu thất bại

    // Thực thi & Kiểm tra (Act & Assert)
    await expect(service.changePassword('user-id', mockChangePassDTO as any))
      .rejects
      .toThrow('CHANGE-PASS.CHANGE-PASS ERROR!'); // Phải ném lỗi
  });
});