import router from './router';

describe('Router', () => {
    beforeEach(() => {
        window.location.hash = '';
    });

    test('addRoute returns router instance', () => {
        const result = router.addRoute('/', jest.fn());
        expect(result).toBe(router);
    });

    test('navigateTo changes hash', () => {
        router.navigateTo('/test');
        expect(window.location.hash).toBe('#/test');
    });

    test('calls handler on navigation', (done) => {
        const handler = jest.fn();
        router.addRoute('/test', handler);

        router.navigateTo('/test');

        window.addEventListener('hashchange', () => {
            expect(handler).toHaveBeenCalled();
            done();
        }, { once: true });
    });

    test('calls handler with params on parametric route', (done) => {
        const handler = jest.fn();
        router.addRoute('/user/:id', handler, true);

        window.addEventListener('hashchange', () => {
            expect(handler).toHaveBeenCalledWith({ id: '123' });
            done();
        }, { once: true });

        router.navigateTo('/user/123');
    });
});