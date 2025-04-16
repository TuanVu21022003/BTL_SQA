
import { responseHandler } from '../responseUtil';


describe('responseHandler() responseHandler method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should return a successful response with data for ok()', () => {
      // Test the ok() method with valid data
      const data = { id: 1, name: 'Test' };
      const result = responseHandler.ok(data);
      expect(result).toEqual({
        success: true,
        data,
        status: 200,
        message: 'SUCCESS!',
      });
    });

    it('should return a not found response for notFound()', () => {
      // Test the notFound() method
      const result = responseHandler.notFound();
      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'CANNOT FIND RESOURCES!',
      });
    });

    it('should return an error response with default message for error()', () => {
      // Test the error() method without a custom message
      const result = responseHandler.error();
      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
      });
    });

    it('should return an unauthorized response with default message for unauthorized()', () => {
      // Test the unauthorized() method without a custom message
      const result = responseHandler.unauthorized();
      expect(result).toEqual({
        success: false,
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should return an invalidated response with errors for invalidated()', () => {
      // Test the invalidated() method with error data
      const errors = { field: 'name', error: 'Required' };
      const result = responseHandler.invalidated(errors);
      expect(result).toEqual({
        success: false,
        status: 422,
        data: errors,
      });
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should return an error response with a custom message for error()', () => {
      // Test the error() method with a custom message
      const customMessage = 'Custom error message';
      const result = responseHandler.error(customMessage);
      expect(result).toEqual({
        success: false,
        status: 500,
        message: customMessage,
      });
    });

    it('should return an unauthorized response with a custom message for unauthorized()', () => {
      // Test the unauthorized() method with a custom message
      const customMessage = 'Custom unauthorized message';
      const result = responseHandler.unauthorized(customMessage);
      expect(result).toEqual({
        success: false,
        status: 401,
        message: customMessage,
      });
    });

    it('should handle invalidated() with empty errors object', () => {
      // Test the invalidated() method with an empty errors object
      const errors = {};
      const result = responseHandler.invalidated(errors);
      expect(result).toEqual({
        success: false,
        status: 422,
        data: errors,
      });
    });

    it('should handle ok() with null data', () => {
      // Test the ok() method with null data
      const result = responseHandler.ok(null);
      expect(result).toEqual({
        success: true,
        data: null,
        status: 200,
        message: 'SUCCESS!',
      });
    });

    it('should handle ok() with undefined data', () => {
      // Test the ok() method with undefined data
      const result = responseHandler.ok(undefined);
      expect(result).toEqual({
        success: true,
        data: undefined,
        status: 200,
        message: 'SUCCESS!',
      });
    });
  });
});