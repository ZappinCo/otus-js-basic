import { WeatherService } from './weatherService.js';
import EventBus from '../utils/eventBus.js';

jest.mock('./httpService.js');
jest.mock('../utils/eventBus.js');

describe('WeatherService', () => {
    let mockHttpService;
    let getHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        mockHttpService = { get: jest.fn() };
        new WeatherService(mockHttpService);
        
        getHandler = (event) => EventBus.on.mock.calls.find(call => call[0] === event)[1];
    });

    test('fetchByCity: success', async () => {
        const mockData = { list: [{}] };
        mockHttpService.get.mockResolvedValue(mockData);
        
        await getHandler('WeatherService::fetchByCity')('Moscow');
        
        expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::dataReceived', mockData);
    });

    test('fetchByCity: error', async () => {
        mockHttpService.get.mockRejectedValue(new Error('Fail'));
        
        await getHandler('WeatherService::fetchByCity')('Moscow');
        
        expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::error', expect.any(Error));
    });

    test('fetchByLocation: success', async () => {
        const mockData = { list: [{}] };
        mockHttpService.get.mockResolvedValue(mockData);
        
        await getHandler('WeatherService::fetchByLocation')(55.75, 37.62);
        
        expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::dataReceived', mockData);
    });

    test('fetchByLocation: error', async () => {
        mockHttpService.get.mockRejectedValue(new Error('Fail'));
        
        await getHandler('WeatherService::fetchByLocation')(55.75, 37.62);
        
        expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::error', expect.any(Error));
    });

    test('fetchHistoryWeather: success', async () => {
        const mockData = { list: [{}] };
        mockHttpService.get.mockResolvedValue(mockData);
        
        await getHandler('WeatherService::fetchHistoryWeather')('Moscow');
        
        expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::historyDataReceived', 'Moscow', mockData);
    });

    test('fetchHistoryWeather: error', async () => {
        mockHttpService.get.mockRejectedValue(new Error('Fail'));
        
        await getHandler('WeatherService::fetchHistoryWeather')('Moscow');
        
        expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::historyError', 'Moscow', expect.any(Error));
    });
});