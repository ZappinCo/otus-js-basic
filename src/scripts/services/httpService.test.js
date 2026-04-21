import { HttpService } from './httpService.js';

describe('HttpService', () => {
    let httpService;

    beforeEach(() => {
        httpService = new HttpService();
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should make successful GET request', async () => {
        const mockData = { id: 1 };
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => mockData
        });

        const result = await httpService.get('/data');

        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith('/data', { method: 'GET' });
    });

    test('should use baseUrl', async () => {
        const service = new HttpService('https://api.example.com');
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({})
        });

        await service.get('/data');

        expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', { method: 'GET' });
    });

    test('should handle HTTP error', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 404
        });

        await expect(httpService.get('/data')).rejects.toThrow('HTTP error! status: 404');
    });

    test('should handle network error', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));

        await expect(httpService.get('/data')).rejects.toThrow('Network error');
    });
});