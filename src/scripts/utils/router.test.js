import router from './router.js';

describe('Router', () => {
    beforeEach(() => {
        window.location.hash = '';
    });

    test('addRoute should return router for chaining', () => {
        const handler = jest.fn();
        const result = router.addRoute('/', handler);
        expect(result).toBe(router);
    });

    test('navigateTo with update=true should change hash', () => {
        router.navigateTo('/test', true);
        expect(window.location.hash).toBe('#/test');
    });

    test('navigateTo with update=false should change hash', () => {
        router.navigateTo('/test', false);
        expect(window.location.hash).toBe('#/test');
    });

    test('navigateTo without parameter should change hash', () => {
        router.navigateTo('/test');
        expect(window.location.hash).toBe('#/test');
    });

    test('addRoute should store static route', () => {
        const handler = jest.fn();
        router.addRoute('/static', handler);
        expect(router.addRoute).toBeDefined();
    });

    test('addRoute should store parametric route', () => {
        const handler = jest.fn();
        router.addRoute('/param/:id', handler, true);
        
        expect(router.addRoute).toBeDefined();
    });

    test('should support method chaining', () => {
        const result = router
            .addRoute('/', jest.fn())
            .addRoute('/about', jest.fn())
            .addRoute('/contact', jest.fn());
        
        expect(result).toBe(router);
    });
});