import { WeatherModel } from './weatherModel.js';
import EventBus from '../utils/eventBus.js';

jest.mock('../utils/eventBus.js');

describe('WeatherModel', () => {
    let weatherModel;

    beforeEach(() => {
        jest.clearAllMocks();
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
            expect(EventBus.emit).toHaveBeenCalledTimes(0);
        });

        test('should emit modelChanged on loading change', () => {
            weatherModel.setLoading(true);
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherModel::modelChanged', expect.any(Object));
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
        const validData = {
            list: [
                { dt_txt: '2024-01-01 12:00:00', main: { temp: 20 } }
            ],
            city: { name: 'Moscow' }
        };

        test('should set weather data for valid data', () => {
            weatherModel.setWeatherData(validData);
            expect(weatherModel.hasData()).toBe(true);
            expect(weatherModel.getCurrentWeather()).toEqual(validData.list[0]);
            expect(weatherModel.getForecastList()).toEqual(validData.list);
            expect(weatherModel.getCity()).toBe('Moscow');
        });

        test('should set error for invalid data', () => {
            weatherModel.setWeatherData(null);
            expect(weatherModel.hasError()).toBe(true);
            expect(weatherModel.getError()).toBe('Нет данных о погоде');
        });

        test('should set error for empty list', () => {
            weatherModel.setWeatherData({ list: [] });
            expect(weatherModel.hasError()).toBe(true);
        });

        test('should set error for missing list', () => {
            weatherModel.setWeatherData({});
            expect(weatherModel.hasError()).toBe(true);
        });

        test('should set loading to false after data set', () => {
            weatherModel.setLoading(true);
            weatherModel.setWeatherData(validData);
            expect(weatherModel.isLoading()).toBe(false);
        });
    });

    describe('clearData', () => {
        beforeEach(() => {
            weatherModel.setWeatherData({
                list: [{ dt_txt: '2024-01-01 12:00:00' }],
                city: { name: 'Moscow' }
            });
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
        
        test('should return today forecast', () => {
            const data = {
                list: [
                    { dt_txt: `${today} 12:00:00`, main: { temp: 20 } },
                    { dt_txt: `${today} 15:00:00`, main: { temp: 22 } },
                    { dt_txt: '2024-01-02 12:00:00', main: { temp: 18 } }
                ]
            };
            weatherModel.setWeatherData(data);
            
            const todayForecast = weatherModel.getTodayForecast();
            expect(todayForecast).toHaveLength(2);
        });

        test('should return empty array if no data', () => {
            expect(weatherModel.getTodayForecast()).toEqual([]);
        });
    });

    describe('getNextDaysForecast', () => {
        test('should return next days forecast at 15:00', () => {
            const data = {
                list: [
                    { dt_txt: '2024-01-01 15:00:00', main: { temp: 20 } },
                    { dt_txt: '2024-01-02 15:00:00', main: { temp: 22 } },
                    { dt_txt: '2024-01-02 18:00:00', main: { temp: 21 } },
                    { dt_txt: '2024-01-03 15:00:00', main: { temp: 19 } }
                ]
            };
            weatherModel.setWeatherData(data);
            
            const nextDays = weatherModel.getNextDaysForecast();
            expect(nextDays).toHaveLength(2);
            expect(nextDays[0].dt_txt).toBe('2024-01-02 15:00:00');
            expect(nextDays[1].dt_txt).toBe('2024-01-03 15:00:00');
        });

        test('should return empty array if no data', () => {
            expect(weatherModel.getNextDaysForecast()).toEqual([]);
        });
    });

    describe('getSnapshot', () => {
        test('should return complete snapshot', () => {
            const data = {
                list: [{ dt_txt: '2024-01-01 12:00:00', main: { temp: 20 } }],
                city: { name: 'Moscow' }
            };
            weatherModel.setWeatherData(data);
            
            const snapshot = weatherModel.getSnapshot();
            expect(snapshot).toHaveProperty('currentWeather');
            expect(snapshot).toHaveProperty('forecastList');
            expect(snapshot).toHaveProperty('loading');
            expect(snapshot).toHaveProperty('error');
            expect(snapshot).toHaveProperty('city', 'Moscow');
            expect(snapshot).toHaveProperty('hasData', true);
            expect(snapshot).toHaveProperty('hasError', false);
            expect(snapshot).toHaveProperty('todayForecast');
            expect(snapshot).toHaveProperty('nextDaysForecast');
        });
    });

    describe('EventBus bindings', () => {
        test('should handle WeatherModel::setLoading event', () => {
            const handler = EventBus.on.mock.calls.find(c => c[0] === 'WeatherModel::setLoading')[1];
            handler(true);
            expect(weatherModel.isLoading()).toBe(true);
        });

        test('should handle WeatherModel::setError event', () => {
            const handler = EventBus.on.mock.calls.find(c => c[0] === 'WeatherModel::setError')[1];
            handler('Error');
            expect(weatherModel.getError()).toBe('Error');
        });

        test('should handle WeatherModel::getSnapshot event with callback', () => {
            const handler = EventBus.on.mock.calls.find(c => c[0] === 'WeatherModel::getSnapshot')[1];
            const callback = jest.fn();
            handler(callback);
            expect(callback).toHaveBeenCalledWith(expect.any(Object));
        });
    });
});