import { WeatherModel } from './weatherModel';
import eventBus from '../utils/eventBus';
import { ForecastData } from '../../types/forecast';
import { WeatherModelSnapshot } from '../../types/weathermodelsnapshot';

jest.mock('../utils/eventBus');

describe('WeatherModel', () => {
    let weatherModel: WeatherModel;
    let mockEventBus: jest.Mocked<typeof eventBus>;

    const createTestForecast = (city: string, dt: string, temp: number): ForecastData => ({
        city,
        dt,
        description: 'clear sky',
        icon: '01d',
        temp,
        temp_min: temp - 5,
        speed: 5,
        pressure: 1013,
        humidity: 65
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockEventBus = eventBus as jest.Mocked<typeof eventBus>;
        weatherModel = new WeatherModel();
    });

    describe('setLoading and isLoading', () => {
        test('should set loading to true', () => {
            weatherModel.setLoading(true);
            expect(weatherModel.isLoading()).toBe(true);
        });

        test('should set loading to false', () => {
            weatherModel.setLoading(true);
            weatherModel.setLoading(false);
            expect(weatherModel.isLoading()).toBe(false);
        });

        test('should not emit change if loading same value', () => {
            weatherModel.setLoading(false);
            expect(mockEventBus.emit).toHaveBeenCalledTimes(0);
        });

        test('should emit modelChanged on loading change', () => {
            weatherModel.setLoading(true);
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherModel::modelChanged', expect.any(Object));
        });
    });

    describe('setError and getError', () => {
        test('should set error message', () => {
            weatherModel.setError('Network error');
            expect(weatherModel.getError()).toBe('Network error');
            expect(weatherModel.hasError()).toBe(true);
        });

        test('should set loading to false when error set', () => {
            weatherModel.setLoading(true);
            weatherModel.setError('Error');
            expect(weatherModel.isLoading()).toBe(false);
        });
    });

    describe('setWeatherData', () => {
        const testForecasts: ForecastData[] = [
            createTestForecast('Moscow', '2024-01-01 12:00:00', 20),
            createTestForecast('Moscow', '2024-01-02 12:00:00', 18)
        ];

        test('should set weather data for valid data', () => {
            weatherModel.setWeatherData(testForecasts);
            expect(weatherModel.hasData()).toBe(true);
            expect(weatherModel.getCurrentWeather()).toEqual(testForecasts[0]);
            expect(weatherModel.getForecastList()).toEqual(testForecasts);
            expect(weatherModel.getCity()).toBe('Moscow');
        });

        test('should set error for empty data', () => {
            weatherModel.setWeatherData([]);
            expect(weatherModel.hasError()).toBe(true);
            expect(weatherModel.getError()).toBe('Нет данных о погоде');
        });

        test('should set loading to false after data set', () => {
            weatherModel.setLoading(true);
            weatherModel.setWeatherData(testForecasts);
            expect(weatherModel.isLoading()).toBe(false);
        });
    });

    describe('clearData', () => {
        beforeEach(() => {
            const testForecasts: ForecastData[] = [
                createTestForecast('Moscow', '2024-01-01 12:00:00', 20)
            ];
            weatherModel.setWeatherData(testForecasts);
        });

        test('should clear all data', () => {
            weatherModel.clearData();
            expect(weatherModel.hasData()).toBe(false);
            expect(weatherModel.getCurrentWeather()).toBeNull();
            expect(weatherModel.getForecastList()).toEqual([]);
            expect(weatherModel.getCity()).toBeNull();
            expect(weatherModel.hasError()).toBe(false);
        });
    });

    describe('getTodayForecast', () => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        test('should return today forecast', () => {
            const testForecasts: ForecastData[] = [
                createTestForecast('Moscow', `${today} 12:00:00`, 20),
                createTestForecast('Moscow', `${today} 15:00:00`, 22),
                createTestForecast('Moscow', `${tomorrow} 12:00:00`, 18)
            ];
            weatherModel.setWeatherData(testForecasts);

            const todayForecast = weatherModel.getTodayForecast();
            expect(todayForecast).toHaveLength(2);
        });

        test('should return empty array if no data', () => {
            expect(weatherModel.getTodayForecast()).toEqual([]);
        });
    });

    describe('getNextDaysForecast', () => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

        test('should return next days forecast at 15:00', () => {
            const testForecasts: ForecastData[] = [
                createTestForecast('Moscow', `${today} 15:00:00`, 20),
                createTestForecast('Moscow', `${tomorrow} 15:00:00`, 22),
                createTestForecast('Moscow', `${tomorrow} 18:00:00`, 21),
                createTestForecast('Moscow', `${dayAfter} 15:00:00`, 19)
            ];
            weatherModel.setWeatherData(testForecasts);

            const nextDays = weatherModel.getNextDaysForecast();
            expect(nextDays).toHaveLength(2);
            expect(nextDays[0].dt).toBe(`${tomorrow} 15:00:00`);
            expect(nextDays[1].dt).toBe(`${dayAfter} 15:00:00`);
        });

        test('should return empty array if no data', () => {
            expect(weatherModel.getNextDaysForecast()).toEqual([]);
        });
    });

    describe('getSnapshot', () => {
        test('should return complete snapshot', () => {
            const testForecasts: ForecastData[] = [
                createTestForecast('Moscow', '2024-01-01 12:00:00', 20)
            ];
            weatherModel.setWeatherData(testForecasts);

            const snapshot: WeatherModelSnapshot = weatherModel.getSnapshot();
            expect(snapshot).toHaveProperty('currentWeather');
            expect(snapshot).toHaveProperty('forecastList');
            expect(snapshot).toHaveProperty('loading');
            expect(snapshot).toHaveProperty('error');
            expect(snapshot.city).toBe('Moscow');
            expect(snapshot.hasData).toBe(true);
            expect(snapshot.hasError).toBe(false);
            expect(snapshot).toHaveProperty('todayForecast');
            expect(snapshot).toHaveProperty('nextDaysForecast');
        });

        test('should return snapshot with null values when no data', () => {
            const snapshot = weatherModel.getSnapshot();
            expect(snapshot.currentWeather).toBeNull();
            expect(snapshot.forecastList).toEqual([]);
            expect(snapshot.city).toBeNull();
            expect(snapshot.hasData).toBe(false);
        });
    });

    describe('eventBus bindings', () => {
        const getHandler = (eventName: string) => {
            const call = mockEventBus.on.mock.calls.find(c => c[0] === eventName);
            if (!call) {
                throw new Error(`Handler for ${eventName} not found`);
            }
            return call[1];
        };

        test('should handle WeatherModel::setLoading event', () => {
            const handler = getHandler('WeatherModel::setLoading');
            handler(true);
            expect(weatherModel.isLoading()).toBe(true);
        });

        test('should handle WeatherModel::setError event', () => {
            const handler = getHandler('WeatherModel::setError');
            handler('Test Error');
            expect(weatherModel.getError()).toBe('Test Error');
        });

        test('should handle WeatherModel::setWeatherData event', () => {
            const handler = getHandler('WeatherModel::setWeatherData');
            const testForecasts: ForecastData[] = [
                createTestForecast('Moscow', '2024-01-01 12:00:00', 20)
            ];
            handler(testForecasts);
            expect(weatherModel.hasData()).toBe(true);
            expect(weatherModel.getCity()).toBe('Moscow');
        });

        test('should handle WeatherModel::clearData event', () => {
            const handler = getHandler('WeatherModel::clearData');
            const testForecasts: ForecastData[] = [
                createTestForecast('Moscow', '2024-01-01 12:00:00', 20)
            ];
            weatherModel.setWeatherData(testForecasts);
            handler();
            expect(weatherModel.hasData()).toBe(false);
        });

        test('should handle WeatherModel::getSnapshot event', () => {
            const handler = getHandler('WeatherModel::getSnapshot');
            handler();
            expect(mockEventBus.emit).toHaveBeenCalledWith(
                'WeatherModel::setSnapshot',
                expect.any(Object)
            );
        });
    });

    describe('edge cases', () => {

        test('should handle empty forecast list', () => {
            weatherModel.setWeatherData([]);
            expect(weatherModel.hasData()).toBe(false);
            expect(weatherModel.getTodayForecast()).toEqual([]);
            expect(weatherModel.getNextDaysForecast()).toEqual([]);
        });

        test('should handle forecast list with single item', () => {
            const testForecasts: ForecastData[] = [
                createTestForecast('Moscow', '2024-01-01 12:00:00', 20)
            ];
            weatherModel.setWeatherData(testForecasts);
            expect(weatherModel.getTodayForecast()).toHaveLength(1);
            expect(weatherModel.getNextDaysForecast()).toHaveLength(0);
        });
    });
});