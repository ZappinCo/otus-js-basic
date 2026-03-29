import { WeatherService } from './weatherService.js';
import { HttpService } from './httpService.js';

jest.mock('./httpService.js');

describe('WeatherService', () => {
    let weatherService;
    let mockHttpService;

    beforeEach(() => {
        mockHttpService = { get: jest.fn() };
        weatherService = new WeatherService(mockHttpService);
    });

    describe('constructor', () => {
        test('should use provided httpService', () => {
            expect(weatherService.httpService).toBe(mockHttpService);
        });

        test('should create new HttpService if not provided', () => {
            const service = new WeatherService();
            expect(service.httpService).toBeInstanceOf(HttpService);
        });
    });

    describe('getWeatherByCity', () => {
        test('should return weather data for valid city', async () => {
            const mockData = { list: [], city: { name: 'Moscow' } };
            mockHttpService.get.mockResolvedValue(mockData);

            const result = await weatherService.getWeatherByCity('Moscow');

            expect(result).toEqual(mockData);
            expect(mockHttpService.get).toHaveBeenCalledWith(
                expect.stringContaining('q=Moscow')
            );
        });

        test('should return null on API error', async () => {
            mockHttpService.get.mockRejectedValue(new Error('API Error'));

            const result = await weatherService.getWeatherByCity('Moscow');

            expect(result).toBeNull();
        });
    });

    describe('getWeatherByLocation', () => {
        test('should return weather data for valid coordinates', async () => {
            const mockData = { list: [], city: { name: 'Moscow' } };
            mockHttpService.get.mockResolvedValue(mockData);

            const result = await weatherService.getWeatherByLocation(55.75, 37.62);

            expect(result).toEqual(mockData);
            expect(mockHttpService.get).toHaveBeenCalledWith(
                expect.stringContaining('lat=55.75&lon=37.62')
            );
        });

        test('should return null on API error', async () => {
            mockHttpService.get.mockRejectedValue(new Error('API Error'));

            const result = await weatherService.getWeatherByLocation(55.75, 37.62);

            expect(result).toBeNull();
        });
    });
});