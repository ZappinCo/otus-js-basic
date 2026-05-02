import { WeatherService } from './weatherService';
import eventBus from '../utils/eventBus';
import { HttpService } from './httpService';

jest.mock('./httpService', () => ({
    HttpService: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        baseUrl: null
    }))
}));

jest.mock('../utils/eventBus');

describe('WeatherService', () => {
    let mockHttpService: jest.Mocked<HttpService>;
    let mockEmit: jest.Mock;

    const getHandler = (eventName: string) => {
        const call = (eventBus.on as jest.Mock).mock.calls.find(
            (call: any[]) => call[0] === eventName
        );
        if (!call) throw new Error(`Handler for ${eventName} not found`);
        return call[1];
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockEmit = eventBus.emit as jest.Mock;

        mockHttpService = {
            get: jest.fn(),
            baseUrl: null
        } as jest.Mocked<HttpService>;

        new WeatherService(mockHttpService);
    });

    describe('fetchByCity', () => {
        test('should emit dataReceived on success', async () => {
            const mockData = {
                list: [{
                    dt_txt: '2024-01-01 12:00:00',
                    main: { temp: 20, temp_min: 15 },
                    weather: [{ description: 'clear', icon: '01d' }],
                    wind: { speed: 5 }
                }],
                city: { name: 'Moscow' }
            };
            mockHttpService.get.mockResolvedValue(mockData);

            const handler = getHandler('WeatherService::fetchByCity');
            await handler('Moscow');

            expect(mockEmit).toHaveBeenCalledWith('WeatherService::dataReceived', expect.any(Array));
        });

        test('should emit error on API failure', async () => {
            mockHttpService.get.mockResolvedValue(null);

            const handler = getHandler('WeatherService::fetchByCity');
            await handler('Moscow');

            expect(mockEmit).toHaveBeenCalledWith('WeatherService::error', expect.any(Error));
        });

        test('should emit error on network error', async () => {
            mockHttpService.get.mockRejectedValue(new Error('Network error'));

            const handler = getHandler('WeatherService::fetchByCity');
            await handler('Moscow');

            expect(mockEmit).toHaveBeenCalledWith('WeatherService::error', expect.any(Error));
        });

        test('should not call fetch if city is not a string', async () => {
            const handler = getHandler('WeatherService::fetchByCity');
            await handler(123 as any);

            expect(mockHttpService.get).not.toHaveBeenCalled();
        });
    });

    describe('fetchByLocation', () => {
        test('should emit dataReceived on success', async () => {
            const mockData = {
                list: [{
                    dt_txt: '2024-01-01 12:00:00',
                    main: { temp: 20, temp_min: 15 },
                    weather: [{ description: 'clear', icon: '01d' }],
                    wind: { speed: 5 }
                }],
                city: { name: 'Moscow' }
            };
            mockHttpService.get.mockResolvedValue(mockData);

            const handler = getHandler('WeatherService::fetchByLocation');
            await handler({ lat: 55.75, lon: 37.62 });

            expect(mockEmit).toHaveBeenCalledWith('WeatherService::dataReceived', expect.any(Array));
        });

        test('should emit error on API failure', async () => {
            mockHttpService.get.mockResolvedValue(null);

            const handler = getHandler('WeatherService::fetchByLocation');
            await handler({ lat: 55.75, lon: 37.62 });

            expect(mockEmit).toHaveBeenCalledWith('WeatherService::error', expect.any(Error));
        });

        test('should emit error on network error', async () => {
            mockHttpService.get.mockRejectedValue(new Error('Network error'));

            const handler = getHandler('WeatherService::fetchByLocation');
            await handler({ lat: 55.75, lon: 37.62 });

            expect(mockEmit).toHaveBeenCalledWith('WeatherService::error', expect.any(Error));
        });

        test('should not call fetch if coords are invalid', async () => {
            const handler = getHandler('WeatherService::fetchByLocation');
            await handler(null);

            expect(mockHttpService.get).not.toHaveBeenCalled();
        });
    });

    describe('fetchHistoryWeather', () => {
        test('should emit historyDataReceived on success', async () => {
            const mockData = {
                list: [{
                    dt_txt: '2024-01-01 12:00:00',
                    main: { temp: 20, temp_min: 15 },
                    weather: [{ description: 'clear', icon: '01d' }],
                    wind: { speed: 5 }
                }],
                city: { name: 'Moscow' }
            };
            mockHttpService.get.mockResolvedValue(mockData);

            const handler = getHandler('WeatherService::fetchHistoryWeather');
            await handler('Moscow');

            expect(mockEmit).toHaveBeenCalledWith('WeatherService::historyDataReceived', expect.any(Array));
        });

        test('should emit historyError on API failure', async () => {
            mockHttpService.get.mockResolvedValue(null);

            const handler = getHandler('WeatherService::fetchHistoryWeather');
            await handler('Moscow');

            expect(mockEmit).toHaveBeenCalledWith('WeatherService::historyError', expect.any(Error));
        });

        test('should emit historyError on network error', async () => {
            mockHttpService.get.mockRejectedValue(new Error('Network error'));

            const handler = getHandler('WeatherService::fetchHistoryWeather');
            await handler('Moscow');

            expect(mockEmit).toHaveBeenCalledWith('WeatherService::historyError', expect.any(Error));
        });

        test('should not call fetch if city is not a string', async () => {
            const handler = getHandler('WeatherService::fetchHistoryWeather');
            await handler(123 as any);

            expect(mockHttpService.get).not.toHaveBeenCalled();
        });
    });
});