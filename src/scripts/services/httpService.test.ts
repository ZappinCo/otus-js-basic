import { HttpService } from './httpService';

describe('HttpService', () => {
    let httpService: HttpService;
    let mockFetch: jest.Mock;

    beforeEach(() => {
        httpService = new HttpService();
        mockFetch = jest.fn();
        global.fetch = mockFetch;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    describe('GET requests', () => {
        test('should make successful GET request', async () => {
            const mockData = { id: 1, name: 'Test' };
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockData
            } as Response);

            const result = await httpService.get('/data');

            expect(result).toEqual(mockData);
            expect(mockFetch).toHaveBeenCalledWith('/data', { method: 'GET' });
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        test('should use baseUrl when provided', async () => {
            const service = new HttpService('https://api.example.com');
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({})
            } as Response);

            await service.get('/data');

            expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', { method: 'GET' });
        });

        test('should handle empty baseUrl', async () => {
            const service = new HttpService();
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({})
            } as Response);

            await service.get('/data');

            expect(mockFetch).toHaveBeenCalledWith('/data', { method: 'GET' });
        });

        test('should pass additional options to fetch', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({})
            } as Response);

            const options = { headers: { 'Authorization': 'Bearer token' } };
            await httpService.get('/data', options);

            expect(mockFetch).toHaveBeenCalledWith('/data', {
                method: 'GET',
                ...options
            });
        });
    });

    describe('HTTP error handling', () => {
        test('should handle 404 HTTP error', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            } as Response);

            await expect(httpService.get('/data')).rejects.toThrow('HTTP error! status: 404');
        });

        test('should handle 500 HTTP error', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            } as Response);

            await expect(httpService.get('/data')).rejects.toThrow('HTTP error! status: 500');
        });

        test('should handle 403 HTTP error', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden'
            } as Response);

            await expect(httpService.get('/data')).rejects.toThrow('HTTP error! status: 403');
        });
    });

    describe('Network error handling', () => {
        test('should handle network error', async () => {
            const networkError = new Error('Network error');
            mockFetch.mockRejectedValue(networkError);

            await expect(httpService.get('/data')).rejects.toThrow('Network error');
        });

        test('should handle fetch rejection with string', async () => {
            mockFetch.mockRejectedValue('Connection failed');

            await expect(httpService.get('/data')).rejects.toBe('Connection failed');
        });
    });

    describe('Response data handling', () => {
        test('should handle empty JSON response', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({})
            } as Response);

            const result = await httpService.get('/data');
            expect(result).toEqual({});
        });

        test('should handle array response', async () => {
            const mockArray = [{ id: 1 }, { id: 2 }];
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockArray
            } as Response);

            const result = await httpService.get('/data');
            expect(result).toEqual(mockArray);
            expect(Array.isArray(result)).toBe(true);
        });

        test('should handle string response', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => 'string response'
            } as Response);

            const result = await httpService.get('/data');
            expect(result).toBe('string response');
        });
    });

    describe('URL construction', () => {
        test('should handle URL with query parameters', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({})
            } as Response);

            await httpService.get('/data?param=value&page=1');

            expect(mockFetch).toHaveBeenCalledWith('/data?param=value&page=1', { method: 'GET' });
        });

        test('should handle baseUrl with trailing slash', async () => {
            const service = new HttpService('https://api.example.com/');
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({})
            } as Response);

            await service.get('/data');

            expect(mockFetch).toHaveBeenCalledWith('https://api.example.com//data', { method: 'GET' });
        });

        test('should handle baseUrl without trailing slash and url with leading slash', async () => {
            const service = new HttpService('https://api.example.com');
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({})
            } as Response);

            await service.get('/data');

            expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', { method: 'GET' });
        });
    });
});