import { WeatherView } from './weatherView';
import eventBus from '../utils/eventBus';
import { TodayCards } from './components/todayCards';
import { ForecastList } from './components/forecastList';
import { DetailInfo } from './components/detailInfo';
import { HistoryWeather } from './components/historyWeather';
import { WeatherModelSnapshot } from '../../types/weathermodelsnapshot';
import { ForecastData } from '../../types/forecast';

jest.mock('../utils/eventBus');
jest.mock('./components/todayCards');
jest.mock('./components/forecastList');
jest.mock('./components/detailInfo');
jest.mock('./components/historyWeather');

describe('WeatherView', () => {
    let weatherView: WeatherView;
    let mockParentElement: HTMLElement;
    let mockTodayCards: { render: jest.Mock };
    let mockForecastList: { render: jest.Mock };
    let mockDetailInfo: { render: jest.Mock };
    let mockHistoryWeather: { render: jest.Mock; updateHistory: jest.Mock; updateCityWeather: jest.Mock };

    beforeEach(() => {
        jest.clearAllMocks();

        mockParentElement = document.createElement('div');

        mockTodayCards = { render: jest.fn() };
        mockForecastList = { render: jest.fn() };
        mockDetailInfo = { render: jest.fn() };
        mockHistoryWeather = {
            render: jest.fn(),
            updateHistory: jest.fn(),
            updateCityWeather: jest.fn()
        };

        (TodayCards as jest.Mock).mockImplementation(() => mockTodayCards);
        (ForecastList as jest.Mock).mockImplementation(() => mockForecastList);
        (DetailInfo as jest.Mock).mockImplementation(() => mockDetailInfo);
        (HistoryWeather as jest.Mock).mockImplementation(() => mockHistoryWeather);

        weatherView = new WeatherView();

        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        (console.error as jest.Mock).mockRestore();
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
            expect(mockHistoryWeather.render).toHaveBeenCalled();
        });
    });

    describe('setCity', () => {
        test('should set city input value', () => {
            weatherView.render(mockParentElement);
            weatherView.setCity('Moscow');

            const cityInput = mockParentElement.querySelector('.city-input') as HTMLInputElement;
            expect(cityInput.value).toBe('Moscow');
        });

        test('should handle empty city', () => {
            weatherView.render(mockParentElement);
            weatherView.setCity('');

            const cityInput = mockParentElement.querySelector('.city-input') as HTMLInputElement;
            expect(cityInput.value).toBe('');
        });
    });

    describe('setLoading', () => {
        test('should add loading class to button when loading', () => {
            weatherView.render(mockParentElement);
            const button = mockParentElement.querySelector('.find-me-button') as HTMLButtonElement;

            weatherView.setLoading(true);
            expect(button.classList.contains('loading')).toBe(true);
            expect(button.disabled).toBe(true);
            expect(button.textContent).toBe('⏳');
        });

        test('should remove loading class when not loading', () => {
            weatherView.render(mockParentElement);
            const button = mockParentElement.querySelector('.find-me-button') as HTMLButtonElement;

            weatherView.setLoading(true);
            weatherView.setLoading(false);
            expect(button.classList.contains('loading')).toBe(false);
            expect(button.disabled).toBe(false);
            expect(button.textContent).toBe('📍');
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
            const errorDiv = mockParentElement.querySelector('.error-message') as HTMLDivElement;
            weatherView.showError('Test error');

            expect(errorDiv.textContent).toBe('Test error');
            expect(errorDiv.style.display).toBe('block');
        });

        test('should handle error message with null', () => {
            const errorDiv = mockParentElement.querySelector('.error-message') as HTMLDivElement;
            weatherView.showError(null);
            expect(errorDiv.textContent).toBe('');
        });
    });

    describe('updateWeatherFromSnapshot', () => {
        beforeEach(() => {
            weatherView.render(mockParentElement);
        });

        test('should show loading indicator when loading', () => {
            const snapshot: WeatherModelSnapshot = {
                currentWeather: null,
                forecastList: [],
                loading: true,
                error: null,
                city: null,
                hasData: false,
                hasError: false,
                todayForecast: [],
                nextDaysForecast: []
            };
            weatherView.updateWeatherFromSnapshot(snapshot);

            const mainContent = mockParentElement.querySelector('.main-content');
            expect(mainContent?.querySelector('.loading-indicator')).not.toBeNull();
        });

        test('should show error when hasError', () => {
            const snapshot: WeatherModelSnapshot = {
                currentWeather: null,
                forecastList: [],
                loading: false,
                error: 'API Error',
                city: null,
                hasData: false,
                hasError: true,
                todayForecast: [],
                nextDaysForecast: []
            };
            weatherView.updateWeatherFromSnapshot(snapshot);

            const errorDiv = mockParentElement.querySelector('.error-message') as HTMLDivElement;
            expect(errorDiv.textContent).toBe('API Error');
            expect(errorDiv.style.display).toBe('block');
        });

        test('should render weather components', () => {
            const mockForecast: ForecastData = {
                city: 'Moscow',
                dt: '2024-01-01 12:00:00',
                description: 'clear',
                icon: '01d',
                temp: 20,
                temp_min: 15,
                speed: 5,
                pressure: 1013,
                humidity: 65
            };

            const snapshot: WeatherModelSnapshot = {
                currentWeather: mockForecast,
                forecastList: [mockForecast],
                loading: false,
                error: null,
                city: 'Moscow',
                hasData: true,
                hasError: false,
                todayForecast: [mockForecast],
                nextDaysForecast: [mockForecast]
            };

            weatherView.updateWeatherFromSnapshot(snapshot);

            expect(mockTodayCards.render).toHaveBeenCalled();
            expect(mockDetailInfo.render).toHaveBeenCalled();
            expect(mockForecastList.render).toHaveBeenCalled();
        });
    });

    describe('bindCityInput', () => {
        test('should bind input event to handler', () => {
            weatherView.render(mockParentElement);
            const handler = jest.fn();
            const cityInput = mockParentElement.querySelector('.city-input') as HTMLInputElement;

            weatherView.bindCityInput(handler);
            cityInput.dispatchEvent(new Event('input'));

            expect(handler).toHaveBeenCalled();
        });
    });

    describe('bindFindMeButton', () => {
        test('should bind click event to handler', () => {
            weatherView.render(mockParentElement);
            const handler = jest.fn();
            const button = mockParentElement.querySelector('.find-me-button') as HTMLButtonElement;

            weatherView.bindFindMeButton(handler);
            button.dispatchEvent(new Event('click'));

            expect(handler).toHaveBeenCalled();
        });
    });

    describe('bindAboutButton', () => {
        test('should bind click event to handler', () => {
            weatherView.render(mockParentElement);
            const handler = jest.fn();
            const button = mockParentElement.querySelectorAll('.find-me-button')[1] as HTMLButtonElement;

            weatherView.bindAboutButton(handler);
            button.dispatchEvent(new Event('click'));

            expect(handler).toHaveBeenCalled();
        });
    });

    describe('eventBus subscriptions', () => {
        beforeEach(() => {
            weatherView.render(mockParentElement);
        });

        const getHandler = (eventName: string) => {
            const call = (eventBus.on as jest.Mock).mock.calls.find(
                (call: any[]) => call[0] === eventName
            );
            if (!call) throw new Error(`Handler for ${eventName} not found`);
            return call[1];
        };

        test('should subscribe to WeatherView::setCity event', () => {
            const handler = getHandler('WeatherView::setCity');
            handler('Moscow');

            const cityInput = mockParentElement.querySelector('.city-input') as HTMLInputElement;
            expect(cityInput.value).toBe('Moscow');
        });

        test('should subscribe to WeatherView::setLoading event', () => {
            const handler = getHandler('WeatherView::setLoading');
            handler(true);

            const button = mockParentElement.querySelector('.find-me-button') as HTMLButtonElement;
            expect(button.classList.contains('loading')).toBe(true);
        });

        test('should subscribe to WeatherView::showError event', () => {
            const handler = getHandler('WeatherView::showError');
            handler('Error');

            const errorDiv = mockParentElement.querySelector('.error-message') as HTMLDivElement;
            expect(errorDiv.textContent).toBe('Error');
        });

        test('should subscribe to StorageService::historyUpdated event', () => {
            const handler = getHandler('StorageService::historyUpdated');
            handler({ city: 'Moscow', searchHistory: ['Moscow'] });

            expect(mockHistoryWeather.updateHistory).toHaveBeenCalled();
        });

        test('should subscribe to WeatherView::historyWeatherReceived event', () => {
            const handler = getHandler('WeatherView::historyWeatherReceived');
            const mockData: ForecastData[] = [{
                city: 'Moscow',
                dt: '2024-01-01 12:00:00',
                description: 'clear',
                icon: '01d',
                temp: 20,
                temp_min: 15,
                speed: 5,
                pressure: 1013,
                humidity: 65
            }];
            handler(mockData);

            expect(mockHistoryWeather.updateCityWeather).toHaveBeenCalledWith(mockData);
        });
    });
});