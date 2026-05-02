import { WeatherController } from './weatherController.js';
import eventBus from '../utils/eventBus.js';
import router from '../utils/router.js';

jest.mock('../utils/eventBus.js');
jest.mock('../utils/router.js');

describe('WeatherController', () => {
    let weatherController;
    let mockWeatherView;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockWeatherView = {
            bindCityInput: jest.fn(),
            bindFindMeButton: jest.fn(),
            bindAboutButton: jest.fn(),
            setCity: jest.fn(),
            setLoading: jest.fn(),
            showError: jest.fn()
        };
        
        weatherController = new WeatherController(mockWeatherView);
    });

    describe('constructor', () => {
        test('should bind view events', () => {
            expect(mockWeatherView.bindCityInput).toHaveBeenCalled();
            expect(mockWeatherView.bindFindMeButton).toHaveBeenCalled();
            expect(mockWeatherView.bindAboutButton).toHaveBeenCalled();
        });

        test('should subscribe to eventBus events', () => {
            expect(eventBus.on).toHaveBeenCalledTimes(9);
        });
    });

    describe('initialize', () => {
        test('should load saved city if exists', async () => {
            eventBus.emit.mockImplementation((event, ...args) => {
                if (event === 'StorageService::getCity') {
                    args[1]('Moscow');
                }
            });
            
            await weatherController.initialize();
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'Moscow');
            expect(router.navigateTo).toHaveBeenCalledWith('/city/Moscow', false);
        });

        test('should load weather by IP if no saved city', async () => {
            eventBus.emit.mockImplementation((event, ...args) => {
                if (event === 'StorageService::getCity') {
                    args[1](null);
                }
            });
            
            await weatherController.initialize();
            
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::getCityByIp');
        });

        test('should load history', async () => {
            eventBus.emit.mockImplementation((event, ...args) => {
                if (event === 'StorageService::getCity') {
                    args[1](null);
                }
                if (event === 'StorageService::getHistory') {
                    args[0]([{ city: 'Moscow' }]);
                }
            });
            
            await weatherController.initialize();
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'Moscow');
        });
    });

    describe('city update', () => {
        test('should update city when event received', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherController::cityChanged'
            )[1];
            
            handler('London');
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'London');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'London');
            expect(router.navigateTo).toHaveBeenCalledWith('/city/London', false);
        });

        test('should not update for empty city', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherController::cityChanged'
            )[1];
            
            handler('');
            
            expect(eventBus.emit).not.toHaveBeenCalledWith('StorageService::saveCity', expect.any(String));
        });

        test('should not update for whitespace only', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherController::cityChanged'
            )[1];
            
            handler('   ');
            
            expect(eventBus.emit).not.toHaveBeenCalledWith('StorageService::saveCity', expect.any(String));
        });
    });

    describe('model changed', () => {
        test('should update view when model changes without loading/error', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherModel::modelChanged'
            )[1];
            
            const snapshot = { loading: false, hasError: false, city: 'Moscow' };
            handler(snapshot);
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::updateWeather', snapshot);
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
        });

        test('should not set city when loading', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherModel::modelChanged'
            )[1];
            
            const snapshot = { loading: true, hasError: false, city: 'Moscow' };
            handler(snapshot);
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::updateWeather', snapshot);
            expect(eventBus.emit).not.toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
        });
    });

    describe('weather data handling', () => {
        test('should handle weather data with city', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::dataReceived'
            )[1];
            
            const weatherData = {
                list: [{}],
                city: { name: 'Moscow' }
            };
            handler(weatherData);
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::addToHistory', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setWeatherData', weatherData);
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', false);
        });

        test('should handle weather data without city', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::dataReceived'
            )[1];
            
            const weatherData = { list: [{}] };
            handler(weatherData);
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setWeatherData', weatherData);
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', false);
        });

        test('should handle error', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::error'
            )[1];
            
            handler(new Error('API Error'));
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'API Error');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', false);
        });

        test('should handle error without message', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::error'
            )[1];
            
            handler({});
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'Ошибка загрузки погоды');
        });

        test('should handle invalid weather data', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::dataReceived'
            )[1];
            
            handler(null);
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'Не удалось получить данные о погоде');
        });
    });

    describe('history data', () => {
        test('should handle history data received', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::historyDataReceived'
            )[1];
            
            handler('Moscow', { temp: 20 });
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::historyWeatherReceived', 'Moscow', { temp: 20 });
        });

        test('should load history weather on update', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'StorageService::historyUpdated'
            )[1];
            
            handler([{ city: 'Moscow' }, { city: 'London' }]);
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'London');
        });
    });

    describe('location service', () => {
        test('should update city when detected', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'LocationService::cityDetected'
            )[1];
            
            handler('Paris');
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Paris');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'Paris');
        });

        test('should handle location error', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'LocationService::error'
            )[1];
            
            handler(new Error('Location error'));
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'Не удалось определить местоположение');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', false);
        });

        test('should handle user location received', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'LocationService::userLocationReceived'
            )[1];
            
            const position = { coords: { latitude: 55.75, longitude: 37.62 } };
            handler(position);
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByLocation', 55.75, 37.62);
        });
    });

    describe('view callbacks', () => {
        test('should handle city input with debounce', () => {
            jest.useFakeTimers();
            
            const inputHandler = mockWeatherView.bindCityInput.mock.calls[0][0];
            inputHandler({ target: { value: 'Moscow' } });
            
            jest.advanceTimersByTime(500);
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'Moscow');
            
            jest.useRealTimers();
        });

        test('should debounce multiple inputs', () => {
            jest.useFakeTimers();
            
            const inputHandler = mockWeatherView.bindCityInput.mock.calls[0][0];
            inputHandler({ target: { value: 'Moscow' } });
            inputHandler({ target: { value: 'London' } });
            inputHandler({ target: { value: 'Paris' } });
            
            jest.advanceTimersByTime(500);
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Paris');
            
            jest.useRealTimers();
        });

        test('should not update for empty input', () => {
            jest.useFakeTimers();
            
            const inputHandler = mockWeatherView.bindCityInput.mock.calls[0][0];
            inputHandler({ target: { value: '' } });
            
            jest.advanceTimersByTime(500);
            
            expect(eventBus.emit).not.toHaveBeenCalledWith('StorageService::saveCity', expect.any(String));
            
            jest.useRealTimers();
        });

        test('should handle find me button click when not loading', () => {
            eventBus.emit.mockImplementation((event, ...args) => {
                if (event === 'WeatherModel::getSnapshot') {
                    args[0]({ loading: false });
                }
            });
            
            const findMeHandler = mockWeatherView.bindFindMeButton.mock.calls[0][0];
            findMeHandler();
            
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::getUserLocation');
        });

        test('should not find me if already loading', () => {
            eventBus.emit.mockImplementation((event, ...args) => {
                if (event === 'WeatherModel::getSnapshot') {
                    args[0]({ loading: true });
                }
            });
            
            const findMeHandler = mockWeatherView.bindFindMeButton.mock.calls[0][0];
            findMeHandler();
            
            expect(eventBus.emit).not.toHaveBeenCalledWith('LocationService::getUserLocation');
        });

        test('should handle about button click', () => {
            const aboutHandler = mockWeatherView.bindAboutButton.mock.calls[0][0];
            aboutHandler();
            
            expect(router.navigateTo).toHaveBeenCalledWith('/about');
        });
    });
});