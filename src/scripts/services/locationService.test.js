import { LocationService } from './locationService.js';

jest.mock('./httpService.js');

describe('LocationService', () => {
    let locationService;
    let mockHttpService;

    beforeEach(() => {
        mockHttpService = { get: jest.fn() };
        locationService = new LocationService(mockHttpService);
    });

    describe('getCityByIp', () => {
        test('should return city on success', async () => {
            mockHttpService.get.mockResolvedValue({ status: 'success', city: 'Moscow' });
            const result = await locationService.getCityByIp();
            expect(result).toBe('Moscow');
        });

        test('should return null on fail', async () => {
            mockHttpService.get.mockResolvedValue({ status: 'fail' });
            const result = await locationService.getCityByIp();
            expect(result).toBeNull();
        });

        test('should return null on error', async () => {
            mockHttpService.get.mockRejectedValue(new Error('Network error'));
            const result = await locationService.getCityByIp();
            expect(result).toBeNull();
        });
    });

    describe('getUserLocation', () => {
        test('should return position on success', async () => {
            const mockPosition = { coords: { latitude: 55.75, longitude: 37.62 } };
            global.navigator.geolocation = {
                getCurrentPosition: jest.fn((success) => success(mockPosition))
            };

            const result = await locationService.getUserLocation();
            expect(result).toEqual(mockPosition);
        });

        test('should reject on error', async () => {
            global.navigator.geolocation = {
                getCurrentPosition: jest.fn((_, error) => error(new Error('Denied')))
            };

            await expect(locationService.getUserLocation()).rejects.toThrow('Denied');
        });

        test('should reject when not supported', async () => {
            global.navigator.geolocation = undefined;
            await expect(locationService.getUserLocation()).rejects.toThrow('Геолокация не поддерживается');
        });
    });
});