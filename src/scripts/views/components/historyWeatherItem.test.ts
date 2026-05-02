import { HistoryWeatherItem } from './historyWeatherItem';
import { translateWeatherDesc } from '../../utils/translateWeatherDesc';
import router from '../../utils/router';
import { ForecastData } from '../../../types/forecast';

jest.mock('../../utils/translateWeatherDesc');
jest.mock('../../utils/router', () => ({
    navigateTo: jest.fn()
}));

describe('HistoryWeatherItem', () => {
    let historyItem: HistoryWeatherItem;
    let element: HTMLElement;

    const mockCity = 'Moscow';

    beforeEach(() => {
        jest.clearAllMocks();
        historyItem = new HistoryWeatherItem(mockCity);
        element = historyItem.render();
    });

    describe('render', () => {
        test('should create container with city name', () => {
            expect(element.className).toBe('history-city-card');
            expect(element.querySelector('.history-city-name')).not.toBeNull();
            expect((element.querySelector('.history-city-name') as HTMLElement).textContent).toBe('Moscow');
            expect(element.querySelector('.history-weather-container')).not.toBeNull();
            expect(element.querySelector('.history-weather-loading')).not.toBeNull();
        });

        test('should add click event listener', () => {
            const navigateSpy = jest.spyOn(router, 'navigateTo');
            element.click();
            expect(navigateSpy).toHaveBeenCalledWith('/city/Moscow');
        });
    });

    describe('updateWeather', () => {
        const createWeatherData = (temp: number, date: string, icon: string = '01d', description: string = 'clear sky'): ForecastData[] => {
            return [{
                city: mockCity,
                dt: `${date} 12:00:00`,
                description: description,
                icon: icon,
                temp: temp,
                temp_min: temp - 5,
                speed: 5,
                pressure: 1013,
                humidity: 65
            }];
        };

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        test('should hide if weatherData is empty', () => {
            const hideSpy = jest.spyOn(historyItem, 'hide');
            historyItem.updateWeather([]);
            expect(hideSpy).toHaveBeenCalled();
        });

        test('should hide if no forecast for today', () => {
            const hideSpy = jest.spyOn(historyItem, 'hide');
            const mockData = createWeatherData(20, yesterday);
            historyItem.updateWeather(mockData);
            expect(hideSpy).toHaveBeenCalled();
        });

        test('should render weather data for today', () => {
            (translateWeatherDesc as jest.Mock).mockReturnValue('Ясно');
            const mockData = createWeatherData(20, today);

            historyItem.updateWeather(mockData);

            const weatherContainer = element.querySelector('.history-weather-container');
            expect(weatherContainer?.querySelector('.history-today-weather')).not.toBeNull();
            expect(weatherContainer?.querySelector('.history-temp')).not.toBeNull();
            expect(weatherContainer?.querySelector('.history-icon')).not.toBeNull();
            expect(weatherContainer?.querySelector('.history-desc')).not.toBeNull();
        });

        test('should select middle forecast when multiple available', () => {
            const mockData: ForecastData[] = [
                createWeatherData(18, today, '01d', 'clear')[0],
                createWeatherData(20, today, '01d', 'clear')[0],
                createWeatherData(22, today, '01d', 'clear')[0],
                createWeatherData(19, today, '01d', 'clear')[0]
            ];

            historyItem.updateWeather(mockData);

            const tempElement = element.querySelector('.history-temp') as HTMLElement;
            expect(tempElement.textContent).toBe('+22°');
        });

        test('should use first forecast when only one available', () => {
            (translateWeatherDesc as jest.Mock).mockReturnValue('Ясно');
            const mockData = createWeatherData(20, today);

            historyItem.updateWeather(mockData);

            const tempElement = element.querySelector('.history-temp') as HTMLElement;
            expect(tempElement.textContent).toBe('+20°');
        });

        test('should show negative temperature correctly', () => {
            const mockData = createWeatherData(-10, today);

            historyItem.updateWeather(mockData);

            const tempElement = element.querySelector('.history-temp') as HTMLElement;
            expect(tempElement.textContent).toBe('-10°');
        });

        test('should show zero temperature correctly', () => {
            const mockData = createWeatherData(0, today);

            historyItem.updateWeather(mockData);

            const tempElement = element.querySelector('.history-temp') as HTMLElement;
            expect(tempElement.textContent).toBe('0°');
        });

        test('should display icon with correct URL', () => {
            const mockData = createWeatherData(20, today, '10d', 'rain');

            historyItem.updateWeather(mockData);

            const iconImg = element.querySelector('.history-icon') as HTMLImageElement;
            expect(iconImg.src).toBe('https://openweathermap.org/img/wn/10d.png');
        });

        test('should call translateWeatherDesc with description', () => {
            (translateWeatherDesc as jest.Mock).mockReturnValue('Дождь');
            const mockData = createWeatherData(20, today, '10d', 'light rain');

            historyItem.updateWeather(mockData);

            expect(translateWeatherDesc).toHaveBeenCalledWith('light rain');
            const descElement = element.querySelector('.history-desc') as HTMLElement;
            expect(descElement.textContent).toBe('Дождь');
        });
    });

    describe('hide', () => {
        test('should remove element from DOM', () => {
            const parent = document.createElement('div');
            parent.appendChild(element);

            expect(parent.children).toHaveLength(1);

            historyItem.hide();

            expect(parent.children).toHaveLength(0);
        });

        test('should not throw if element not in DOM', () => {
            const newItem = new HistoryWeatherItem('London');
            expect(() => newItem.hide()).not.toThrow();
        });
    });

    describe('getCity', () => {
        test('should return city name', () => {
            expect(historyItem.getCity()).toBe('Moscow');
        });
    });

    describe('getContainer', () => {
        test('should return container element after render', () => {
            expect(historyItem.getContainer()).toBe(element);
        });

        test('should return container element before render', () => {
            const newItem = new HistoryWeatherItem('London');
            expect(newItem.getContainer()).toBeDefined();
        });
    });
});