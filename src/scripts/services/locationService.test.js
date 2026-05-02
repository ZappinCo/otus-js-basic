import { LocationService } from './locationService.js';
import eventBus from '../utils/eventBus.js';

jest.mock('../utils/eventBus.js');

describe('LocationService', () => {
    let mockHttpService;
    let handler;

    beforeEach(() => {
        jest.clearAllMocks();
        mockHttpService = { get: jest.fn() };
        
        eventBus.on.mockImplementation((event, fn) => {
            if (event === 'LocationService::getCityByIp') handler = fn;
        });
    });

    describe('getCityByIp', () => {
        test('should emit cityDetected on success', async () => {
            mockHttpService.get.mockResolvedValue({ status: 'success', city: 'Moscow' });
            new LocationService(mockHttpService);
            
            await handler();
            
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::cityDetected', 'Moscow');
        });

        test('should emit error when status is not success', async () => {
            mockHttpService.get.mockResolvedValue({ status: 'fail' });
            new LocationService(mockHttpService);
            
            await handler();
            
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
            expect(eventBus.emit.mock.calls[0][1].message).toBe('Не удалось определить город по IP');
        });

        test('should emit error on network error', async () => {
            const networkError = new Error('Network error');
            mockHttpService.get.mockRejectedValue(networkError);
            new LocationService(mockHttpService);
            
            await handler();
            
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::error', networkError);
        });
    });

    describe('getUserLocation', () => {
        let userLocationHandler;

        beforeEach(() => {
            eventBus.on.mockImplementation((event, fn) => {
                if (event === 'LocationService::getUserLocation') userLocationHandler = fn;
            });
            new LocationService(mockHttpService);
        });

        test('should emit userLocationReceived on success', async () => {
            const mockPosition = { coords: { latitude: 55.75, longitude: 37.62 } };
            global.navigator.geolocation = {
                getCurrentPosition: jest.fn((success) => success(mockPosition))
            };

            await userLocationHandler();
            
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::userLocationReceived', mockPosition);
        });

        test('should emit error on geolocation error with code 1', async () => {
            const error = { code: 1, message: 'User denied' };
            global.navigator.geolocation = {
                getCurrentPosition: jest.fn((_, errorFn) => errorFn(error))
            };

            await userLocationHandler();
            
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
            expect(eventBus.emit.mock.calls[0][1].message).toBe('Пользователь запретил доступ к геолокации');
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::getCityByIp');
        });

        test('should emit error on geolocation error with code 2', async () => {
            const error = { code: 2, message: 'Position unavailable' };
            global.navigator.geolocation = {
                getCurrentPosition: jest.fn((_, errorFn) => errorFn(error))
            };

            await userLocationHandler();
            
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
            expect(eventBus.emit.mock.calls[0][1].message).toBe('Информация о местоположении недоступна');
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::getCityByIp');
        });

        test('should emit error on geolocation error with code 3', async () => {
            const error = { code: 3, message: 'Timeout' };
            global.navigator.geolocation = {
                getCurrentPosition: jest.fn((_, errorFn) => errorFn(error))
            };

            await userLocationHandler();
            
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
            expect(eventBus.emit.mock.calls[0][1].message).toBe('Время получения геолокации истекло');
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::getCityByIp');
        });

        test('should emit error when geolocation not supported', async () => {
            global.navigator.geolocation = undefined;

            await userLocationHandler();
            
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
            expect(eventBus.emit.mock.calls[0][1].message).toBe('Геолокация не поддерживается вашим браузером');
        });
    });
});