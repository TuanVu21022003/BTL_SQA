
import { LogoutService } from '../logout.service';




// Mock classes
class MockUser {
  public id: string = '123';
  public token: string | null = 'valid-token';
}

class MocklogoutDTO {
  public token: string = 'valid-token';
}

class MockRepository {
  public findOneBy = jest.fn();
  public save = jest.fn();
}

describe('LogoutService.logout() logout method', () => {
  let logoutService: LogoutService;
  let mockUserRepo: MockRepository;
  let mockUser: MockUser;
  let mockLogoutDTO: MocklogoutDTO;

  beforeEach(() => {
    mockUserRepo = new MockRepository() as any;
    logoutService = new LogoutService(mockUserRepo as any);
    mockUser = new MockUser() as any;
    mockLogoutDTO = new MocklogoutDTO() as any;
  });

  describe('Happy paths', () => {
    it('should successfully logout a user with valid credentials', async () => {
      // Arrange
      jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser as any as never);
      jest.mocked(mockUserRepo.save).mockResolvedValue(mockUser as any as never);

      // Act
      const result = await logoutService.logout(mockUser.id, mockLogoutDTO);

      // Assert
      expect(result).toBe(true);
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
        token: mockLogoutDTO.token,
      });
//      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ token: null }));
    });
  });

  describe('Edge cases', () => {
    it('should throw an error if the user is not found', async () => {
      // Arrange
      jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(null as any as never);

      // Act & Assert
      await expect(logoutService.logout(mockUser.id, mockLogoutDTO)).rejects.toThrow('LOGOUT.USER NOT LOGIN!');
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
        token: mockLogoutDTO.token,
      });
    });

    it('should throw an error if saving the user fails', async () => {
      // Arrange
      jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser as any as never);
      jest.mocked(mockUserRepo.save).mockResolvedValue(null as any as never);

      // Act & Assert
      await expect(logoutService.logout(mockUser.id, mockLogoutDTO)).rejects.toThrow('LOGOUT.OCCUR ERROR WHEN LOGOUT!');
//      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ token: null }));
    });
  });
});