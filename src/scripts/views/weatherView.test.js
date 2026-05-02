import { WeatherView } from './weatherView.js';
import EventBus from '../utils/eventBus.js';
import { TodayCards } from './components/todayCards.js';
import { ForecastList } from './components/forecastList.js';
import { DetailInfo } from './components/detailInfo.js';
import { HistoryWeather } from './components/historyWeather.js';

jest.mock('../utils/eventBus.js');
jest.mock('./components/todayCards.js');
jest.mock('./components/forecastList.js');
jest.mock('./components/detailInfo.js');
jest.mock('./components/historyWeather.js');

describe('WeatherView', () => {
    let weatherView;
    let mockParentElement;

    beforeEach(() => {
        jest.clearAllMocks();
        mockParentElement = document.createElement('div');
        weatherView = new WeatherView();
        
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('render', () => {
        test('should create DOM elements', () => {
            weatherView.render(mockParentElement);
            
            expect(mockParentElement.querySelector('.weather-card')).not.toBeNull();
            expect(mockParentElement.querySelector('.city-header')).not.toBeNull();
            expect(mockParentElement.querySelector('.city-input')).not.toBeNull();
            expect(mockParentElement.querySelector('.find-me-button')).not.toBeNull();
            expect(mockParentElement.querySelector('.error-message')).not.toBeNull();
            expect(mockParentElement.querySelector('.content-wrapper')).not.toBeNull();
            expect(mockParentElement.querySelector('.weather-main')).not.toBeNull();
            expect(mockParentElement.querySelector('.weather-sidebar')).not.toBeNull();
            expect(mockParentElement.querySelector('.main-content')).not.toBeNull();
        });

        test('should render history weather', () => {
            weatherView.render(mockParentElement);
            expect(HistoryWeather.prototype.render).toHaveBeenCalled();
        });

        test('should request history on render', () => {
            weatherView.render(mockParentElement);
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::getHistory', expect.any(Function));
        });

        test('should handle history callback with data', () => {
            const mockHistory = [{ city: 'Moscow' }, { city: 'London' }];
            weatherView.render(mockParentElement);
            
            const callback = EventBus.emit.mock.calls.find(
                call => call[0] === 'StorageService::getHistory'
            )[1];
            callback(mockHistory);
            
            expect(HistoryWeather.prototype.updateHistory).toHaveBeenCalledWith(mockHistory);
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'Moscow');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'London');
        });
    });

    describe('setCity', () => {
        test('should set city input value', () => {
            weatherView.render(mockParentElement);
            weatherView.setCity('Moscow');
            
            const cityInput = mockParentElement.querySelector('.city-input');
            expect(cityInput.value).toBe('Moscow');
        });

        test('should handle empty city', () => {
            weatherView.render(mockParentElement);
            weatherView.setCity('');
            
            const cityInput = mockParentElement.querySelector('.city-input');
            expect(cityInput.value).toBe('');
        });
    });

    describe('setLoading', () => {
        test('should add loading class to button when loading', () => {
            weatherView.render(mockParentElement);
            const button = mockParentElement.querySelector('.find-me-button');
            
            weatherView.setLoading(true);
            expect(button.classList.contains('loading')).toBe(true);
            expect(button.disabled).toBe(true);
            expect(button.textContent).toBe('⏳');
        });

        test('should remove loading class when not loading', () => {
            weatherView.render(mockParentElement);
            const button = mockParentElement.querySelector('.find-me-button');
            
            weatherView.setLoading(true);
            weatherView.setLoading(false);
            expect(button.classList.contains('loading')).toBe(false);
            expect(button.disabled).toBe(false);
            expect(button.textContent).toBe('📍');
        });

        test('should handle button not exists', () => {
            weatherView.setLoading(true);
            expect(() => weatherView.setLoading(true)).not.toThrow();
        });
    });

    describe('showError', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            weatherView.render(mockParentElement);
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should show error message', () => {
            const errorDiv = mockParentElement.querySelector('.error-message');
            weatherView.showError('Test error');
            
            expect(errorDiv.textContent).toBe('Test error');
            expect(errorDiv.style.display).toBe('block');
        });

        test('should handle error message with null', () => {
            const errorDiv = mockParentElement.querySelector('.error-message');
            weatherView.showError(null);
            expect(errorDiv.textContent).toBe('');
        });
    });

    describe('updateWeatherFromSnapshot', () => {
        beforeEach(() => {
            weatherView.render(mockParentElement);
        });

        test('should show loading indicator when loading', () => {
            const snapshot = { loading: true, hasError: false };
            weatherView.updateWeatherFromSnapshot(snapshot);
            
            const mainContent = mockParentElement.querySelector('.main-content');
            expect(mainContent.querySelector('.loading-indicator')).not.toBeNull();
        });

        test('should show error when hasError', () => {
            const snapshot = { loading: false, hasError: true, error: 'API Error' };
            weatherView.updateWeatherFromSnapshot(snapshot);
            
            const errorDiv = mockParentElement.querySelector('.error-message');
            expect(errorDiv.textContent).toBe('API Error');
            expect(errorDiv.style.display).toBe('block');
        });

        test('should do nothing if weatherContainer not exists', () => {
            weatherView._weatherContainer = null;
            const snapshot = { loading: false, hasError: false };
            expect(() => weatherView.updateWeatherFromSnapshot(snapshot)).not.toThrow();
        });

        test('should render weather components', () => {
            const snapshot = {
                loading: false,
                hasError: false,
                todayForecast: [{ dt_txt: '2024-01-01 12:00:00' }],
                currentWeather: { main: { temp: 20 } },
                nextDaysForecast: [{ dt_txt: '2024-01-02 15:00:00' }]
            };
            
            weatherView.updateWeatherFromSnapshot(snapshot);
            
            expect(TodayCards.prototype.render).toHaveBeenCalled();
            expect(DetailInfo.prototype.render).toHaveBeenCalled();
            expect(ForecastList.prototype.render).toHaveBeenCalled();
        });

        test('should not render components when data missing', () => {
            const snapshot = {
                loading: false,
                hasError: false,
                todayForecast: [],
                currentWeather: null,
                nextDaysForecast: []
            };
            
            weatherView.updateWeatherFromSnapshot(snapshot);
            
            expect(TodayCards.prototype.render).not.toHaveBeenCalled();
            expect(DetailInfo.prototype.render).not.toHaveBeenCalled();
            expect(ForecastList.prototype.render).not.toHaveBeenCalled();
        });
    });

    describe('bindCityInput', () => {
        test('should bind input event to handler', () => {
            weatherView.render(mockParentElement);
            const handler = jest.fn();
            const cityInput = mockParentElement.querySelector('.city-input');
            
            weatherView.bindCityInput(handler);
            cityInput.dispatchEvent(new Event('input'));
            
            expect(handler).toHaveBeenCalled();
        });

        test('should not throw if cityInput not exists', () => {
            weatherView._cityInput = null;
            const handler = jest.fn();
            expect(() => weatherView.bindCityInput(handler)).not.toThrow();
        });
    });

    describe('bindFindMeButton', () => {
        test('should bind click event to handler', () => {
            weatherView.render(mockParentElement);
            const handler = jest.fn();
            const button = mockParentElement.querySelector('.find-me-button');
            
            weatherView.bindFindMeButton(handler);
            button.dispatchEvent(new Event('click'));
            
            expect(handler).toHaveBeenCalled();
        });

        test('should not throw if button not exists', () => {
            weatherView._findMeButton = null;
            const handler = jest.fn();
            expect(() => weatherView.bindFindMeButton(handler)).not.toThrow();
        });
    });

    describe('EventBus subscriptions', () => {
        beforeEach(() => {
            weatherView.render(mockParentElement);
        });

        test('should subscribe to WeatherView::setCity event', () => {
            const handler = EventBus.on.mock.calls.find(c => c[0] === 'WeatherView::setCity')[1];
            handler('Moscow');
            
            const cityInput = mockParentElement.querySelector('.city-input');
            expect(cityInput.value).toBe('Moscow');
        });

        test('should subscribe to WeatherView::setLoading event', () => {
            const handler = EventBus.on.mock.calls.find(c => c[0] === 'WeatherView::setLoading')[1];
            handler(true);
            
            const button = mockParentElement.querySelector('.find-me-button');
            expect(button.classList.contains('loading')).toBe(true);
        });

        test('should subscribe to WeatherView::showError event', () => {
            const handler = EventBus.on.mock.calls.find(c => c[0] === 'WeatherView::showError')[1];
            handler('Error');
            
            const errorDiv = mockParentElement.querySelector('.error-message');
            expect(errorDiv.textContent).toBe('Error');
        });

        test('should subscribe to StorageService::historyUpdated event', () => {
            const handler = EventBus.on.mock.calls.find(c => c[0] === 'StorageService::historyUpdated')[1];
            handler([{ city: 'Moscow' }]);
            
            expect(HistoryWeather.prototype.updateHistory).toHaveBeenCalled();
        });

        test('should subscribe to WeatherView::historyWeatherReceived event', () => {
            const handler = EventBus.on.mock.calls.find(c => c[0] === 'WeatherView::historyWeatherReceived')[1];
            handler('Moscow', { list: [{}] });
            
            expect(HistoryWeather.prototype.updateCityWeather).toHaveBeenCalledWith('Moscow', { list: [{}] });
        });
    });
});