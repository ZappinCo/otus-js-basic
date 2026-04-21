import { WeatherModel } from './weatherModel.js';

describe('WeatherModel', () => {
    let model;

    beforeEach(() => {
        model = new WeatherModel();
    });

    describe('initial state', () => {
        test('should initialize with default values', () => {
            expect(model.getCurrentWeather()).toBeNull();
            expect(model.getForecastList()).toEqual([]);
            expect(model.isLoading()).toBe(false);
            expect(model.getError()).toBeNull();
            expect(model.hasError()).toBe(false);
            expect(model.hasData()).toBe(false);
        });
    });

    describe('addObserver', () => {
        test('should add observer', () => {
            const observer = jest.fn();
            model.addObserver(observer);
            
            model.setLoading(true);
            
            expect(observer).toHaveBeenCalled();
        });

        test('should throw error if observer is not a function', () => {
            expect(() => model.addObserver(null)).toThrow('Observer must be a function');
            expect(() => model.addObserver('not function')).toThrow('Observer must be a function');
        });
    });

    describe('setLoading and isLoading', () => {
        test('should set loading state', () => {
            expect(model.isLoading()).toBe(false);
            
            model.setLoading(true);
            expect(model.isLoading()).toBe(true);
            
            model.setLoading(false);
            expect(model.isLoading()).toBe(false);
        });

        test('should not notify observers if loading state unchanged', () => {
            const observer = jest.fn();
            model.addObserver(observer);
            
            model.setLoading(false);
            expect(observer).not.toHaveBeenCalled();
        });
    });

    describe('setError and getError', () => {
        test('should set error and clear loading', () => {
            model.setLoading(true);
            model.setError('Test error');
            
            expect(model.getError()).toBe('Test error');
            expect(model.hasError()).toBe(true);
            expect(model.isLoading()).toBe(false);
        });
    });

    describe('setWeatherData', () => {
        const mockData = {
            list: [
                { dt_txt: "2026-03-15 09:00:00", main: { temp: 10 } },
                { dt_txt: "2026-03-15 15:00:00", main: { temp: 15 } },
                { dt_txt: "2026-03-16 15:00:00", main: { temp: 12 } }
            ]
        };

        test('should set valid weather data', () => {
            model.setWeatherData(mockData);
            
            expect(model.getCurrentWeather()).toEqual(mockData.list[0]);
            expect(model.getForecastList()).toEqual(mockData.list);
            expect(model.hasData()).toBe(true);
            expect(model.isLoading()).toBe(false);
            expect(model.hasError()).toBe(false);
        });

        test('should set error for null data', () => {
            model.setWeatherData(null);
            
            expect(model.getError()).toBe('Нет данных о погоде');
            expect(model.hasData()).toBe(false);
        });

        test('should set error for empty list', () => {
            model.setWeatherData({ list: [] });
            
            expect(model.getError()).toBe('Нет данных о погоде');
            expect(model.hasData()).toBe(false);
        });

        test('should set error for invalid data structure', () => {
            model.setWeatherData({});
            
            expect(model.getError()).toBe('Нет данных о погоде');
        });
    });

    describe('getTodayForecast', () => {
        const mockData = {
            list: [
                { dt_txt: "2026-03-15 09:00:00", main: { temp: 10 } },
                { dt_txt: "2026-03-15 15:00:00", main: { temp: 15 } },
                { dt_txt: "2026-03-16 09:00:00", main: { temp: 12 } },
                { dt_txt: "2026-03-16 15:00:00", main: { temp: 14 } }
            ]
        };

        beforeEach(() => {
            model.setWeatherData(mockData);
        });

        test('should return only today\'s forecast', () => {
            const todayForecast = model.getTodayForecast();
            
            expect(todayForecast).toHaveLength(2);
            expect(todayForecast[0].dt_txt).toContain('2026-03-15');
            expect(todayForecast[1].dt_txt).toContain('2026-03-15');
        });

        test('should return empty array when no data', () => {
            const emptyModel = new WeatherModel();
            expect(emptyModel.getTodayForecast()).toEqual([]);
        });
    });

    describe('getNextDaysForecast', () => {
        const mockData = {
            list: [
                { dt_txt: "2026-03-15 09:00:00", main: { temp: 10 } },
                { dt_txt: "2026-03-15 15:00:00", main: { temp: 15 } },
                { dt_txt: "2026-03-16 09:00:00", main: { temp: 12 } },
                { dt_txt: "2026-03-16 15:00:00", main: { temp: 14 } },
                { dt_txt: "2026-03-17 15:00:00", main: { temp: 13 } },
                { dt_txt: "2026-03-17 21:00:00", main: { temp: 11 } }
            ]
        };

        beforeEach(() => {
            model.setWeatherData(mockData);
        });

        test('should return only 15:00 forecasts for next days', () => {
            const nextDays = model.getNextDaysForecast();
            
            expect(nextDays).toHaveLength(2);
            expect(nextDays[0].dt_txt).toBe('2026-03-16 15:00:00');
            expect(nextDays[1].dt_txt).toBe('2026-03-17 15:00:00');
        });

        test('should return empty array when no data', () => {
            const emptyModel = new WeatherModel();
            expect(emptyModel.getNextDaysForecast()).toEqual([]);
        });
    });

    describe('observer notifications', () => {
        test('should notify observers on setLoading', () => {
            const observer = jest.fn();
            model.addObserver(observer);
            
            model.setLoading(true);
            
            expect(observer).toHaveBeenCalledTimes(1);
            expect(observer).toHaveBeenCalledWith(model);
        });

        test('should notify observers on setError', () => {
            const observer = jest.fn();
            model.addObserver(observer);
            
            model.setError('Error');
            
            expect(observer).toHaveBeenCalledTimes(1);
        });

        test('should notify observers on setWeatherData', () => {
            const observer = jest.fn();
            model.addObserver(observer);
            
            model.setWeatherData({ list: [{}] });
            
            expect(observer).toHaveBeenCalledTimes(1);
        });
    });
});