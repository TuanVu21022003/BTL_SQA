// Giả lập localStorage trong Jest
beforeAll(() => {
    global.localStorage = {
      getItem: jest.fn().mockReturnValue('mocked-user-id'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
  });
  