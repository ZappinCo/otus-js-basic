import { HistoryWeatherItem } from './historyWeatherItem.js';
import EventBus from '../../utils/eventBus.js';
import { translateWeatherDesc } from '../../utils/translateWeatherDesc.js';

jest.mock('../../utils/eventBus.js');
jest.mock('../../utils/translateWeatherDesc.js');

describe('HistoryWeatherItem', () => {
    let historyItem;
    let mockHistoryData;

    beforeEach(() => {
        jest.clearAllMocks();
        mockHistoryData = {
            city: 'Moscow',
            timestamp: 1234567890
        };
        historyItem = new HistoryWeatherItem(mockHistoryData);
    });

    describe('render', () => {
        test('should create container with city name', () => {
            const element = historyItem.render();
            
            expect(element.className).toBe('history-city-card');
            expect(element.querySelector('.history-city-name')).not.toBeNull();
            expect(element.querySelector('.history-city-name').textContent).toBe('Moscow');
            expect(element.querySelector('.history-weather-container')).not.toBeNull();
            expect(element.querySelector('.history-weather-loading')).not.toBeNull();
        });

        test('should add click event listener', () => {
            const element = historyItem.render();
            const emitSpy = jest.spyOn(EventBus, 'emit');
            
            element.click();
            
            expect(emitSpy).toHaveBeenCalledWith('HistoryWeather::citySelected', 'Moscow');
        });
    });

    describe('updateWeather', () => {
        let element;

        beforeEach(() => {
            element = historyItem.render();
        });

        test('should hide if weatherData is null', () => {
            const hideSpy = jest.spyOn(historyItem, 'hide');
            historyItem.updateWeather(null);
            
            expect(hideSpy).toHaveBeenCalled();
        });

        test('should hide if weatherData has no list', () => {
            const hideSpy = jest.spyOn(historyItem, 'hide');
            historyItem.updateWeather({});
            
            expect(hideSpy).toHaveBeenCalled();
        });

        test('should hide if list is empty', () => {
            const hideSpy = jest.spyOn(historyItem, 'hide');
            historyItem.updateWeather({ list: [] });
            
            expect(hideSpy).toHaveBeenCalled();
        });

        test('should render weather data for today', () => {
            const today = new Date().toISOString().split('T')[0];
            const mockWeatherData = {
                list: [
                    { dt_txt: `${today} 12:00:00`, main: { temp: 20 }, weather: [{ icon: '01d', description: 'clear sky' }] },
                    { dt_txt: `${today} 15:00:00`, main: { temp: 22 }, weather: [{ icon: '01d', description: 'clear sky' }] }
                ]
            };
            
            translateWeatherDesc.mockReturnValue('Ясно');
            
            historyItem.updateWeather(mockWeatherData);
            
            const weatherContainer = element.querySelector('.history-weather-container');
            expect(weatherContainer.querySelector('.history-today-weather')).not.toBeNull();
            expect(weatherContainer.querySelector('.history-temp')).not.toBeNull();
            expect(weatherContainer.querySelector('.history-icon')).not.toBeNull();
            expect(weatherContainer.querySelector('.history-desc')).not.toBeNull();
        });

        test('should use middle forecast when multiple available', () => {
            const today = new Date().toISOString().split('T')[0];
            const mockWeatherData = {
                list: [
                    { dt_txt: `${today} 09:00:00`, main: { temp: 18 }, weather: [{ icon: '01d', description: 'clear' }] },
                    { dt_txt: `${today} 12:00:00`, main: { temp: 20 }, weather: [{ icon: '01d', description: 'clear' }] },
                    { dt_txt: `${today} 15:00:00`, main: { temp: 22 }, weather: [{ icon: '01d', description: 'clear' }] },
                    { dt_txt: `${today} 18:00:00`, main: { temp: 19 }, weather: [{ icon: '01d', description: 'clear' }] }
                ]
            };
            
            historyItem.updateWeather(mockWeatherData);
            
            const tempElement = element.querySelector('.history-temp');
            expect(tempElement.textContent).toBe('+22°');
        });

        test('should use first forecast when only one available', () => {
            const today = new Date().toISOString().split('T')[0];
            const mockWeatherData = {
                list: [
                    { dt_txt: `${today} 12:00:00`, main: { temp: 20 }, weather: [{ icon: '01d', description: 'clear sky' }] }
                ]
            };
            
            translateWeatherDesc.mockReturnValue('Ясно');
            historyItem.updateWeather(mockWeatherData);
            
            const tempElement = element.querySelector('.history-temp');
            expect(tempElement.textContent).toBe('+20°');
        });

        test('should show negative temperature correctly', () => {
            const today = new Date().toISOString().split('T')[0];
            const mockWeatherData = {
                list: [
                    { dt_txt: `${today} 12:00:00`, main: { temp: -10 }, weather: [{ icon: '01d', description: 'clear sky' }] }
                ]
            };
            
            historyItem.updateWeather(mockWeatherData);
            
            const tempElement = element.querySelector('.history-temp');
            expect(tempElement.textContent).toBe('-10°');
        });
    });

    describe('hide', () => {
        test('should remove element from DOM', () => {
            const element = historyItem.render();
            const parent = document.createElement('div');
            parent.appendChild(element);
            
            expect(parent.children.length).toBe(1);
            
            historyItem.hide();
            
            expect(parent.children.length).toBe(0);
        });

        test('should not throw if element not in DOM', () => {
            expect(() => historyItem.hide()).not.toThrow();
        });
    });

    describe('getCity', () => {
        test('should return city name', () => {
            expect(historyItem.getCity()).toBe('Moscow');
        });
    });

    describe('getContainer', () => {
        test('should return container element after render', () => {
            const element = historyItem.render();
            expect(historyItem.getContainer()).toBe(element);
        });

        test('should return undefined before render', () => {
            expect(historyItem.getContainer()).toBeUndefined();
        });
    });
});