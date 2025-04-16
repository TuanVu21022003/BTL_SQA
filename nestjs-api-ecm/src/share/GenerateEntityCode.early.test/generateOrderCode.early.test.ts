
import { GenerateEntityCode } from '../GenerateEntityCode';


describe('GenerateEntityCode.generateOrderCode() generateOrderCode method', () => {
    // Happy Path Tests
    describe('Happy Path', () => {
        it('should generate a valid order code with a given entity code', () => {
            // Test to ensure the method generates a valid order code
            const entityCode = 'ORD';
            const orderCode = GenerateEntityCode.generateOrderCode(entityCode);

            // Check if the order code starts with the entity code
            expect(orderCode.startsWith(`${entityCode}-`)).toBe(true);

            // Check if the order code has three parts separated by dashes
            const parts = orderCode.split('-');
            expect(parts.length).toBe(3);

            // Check if the second part is a valid base36 timestamp
            expect(parseInt(parts[1], 36)).not.toBeNaN();

            // Check if the third part is a valid random string of length 10
            expect(parts[2].length).toBe(10);
        });

        it('should generate different order codes for consecutive calls', () => {
            // Test to ensure that consecutive calls generate different order codes
            const entityCode = 'ORD';
            const orderCode1 = GenerateEntityCode.generateOrderCode(entityCode);
            const orderCode2 = GenerateEntityCode.generateOrderCode(entityCode);

            // Check if the two generated order codes are different
            expect(orderCode1).not.toBe(orderCode2);
        });
    });

    // Edge Case Tests
    describe('Edge Cases', () => {
        it('should handle an empty entity code gracefully', () => {
            // Test to ensure the method handles an empty entity code
            const entityCode = '';
            const orderCode = GenerateEntityCode.generateOrderCode(entityCode);

            // Check if the order code starts with a dash
            expect(orderCode.startsWith('-')).toBe(true);

            // Check if the order code has three parts separated by dashes
            const parts = orderCode.split('-');
            expect(parts.length).toBe(3);

            // Check if the second part is a valid base36 timestamp
            expect(parseInt(parts[1], 36)).not.toBeNaN();

            // Check if the third part is a valid random string of length 10
            expect(parts[2].length).toBe(10);
        });

        it('should handle a very long entity code', () => {
            // Test to ensure the method handles a very long entity code
            const entityCode = 'A'.repeat(100);
            const orderCode = GenerateEntityCode.generateOrderCode(entityCode);

            // Check if the order code starts with the long entity code
            expect(orderCode.startsWith(`${entityCode}-`)).toBe(true);

            // Check if the order code has three parts separated by dashes
            const parts = orderCode.split('-');
            expect(parts.length).toBe(3);

            // Check if the second part is a valid base36 timestamp
            expect(parseInt(parts[1], 36)).not.toBeNaN();

            // Check if the third part is a valid random string of length 10
            expect(parts[2].length).toBe(10);
        });
    });
});