import { WeatherController } from './weatherController.js';
import EventBus from '../utils/eventBus.js';

jest.mock('../utils/eventBus.js');

describe('WeatherController', () => {
    let weatherController;
    let mockWeatherView;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockWeatherView = {
            bindCityInput: jest.fn(),
            bindFindMeButton: jest.fn(),
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
        });

        test('should subscribe to EventBus events', () => {
            expect(EventBus.on).toHaveBeenCalledWith('WeatherController::cityChanged', expect.any(Function));
            expect(EventBus.on).toHaveBeenCalledWith('WeatherModel::modelChanged', expect.any(Function));
            expect(EventBus.on).toHaveBeenCalledWith('WeatherService::dataReceived', expect.any(Function));
            expect(EventBus.on).toHaveBeenCalledWith('WeatherService::error', expect.any(Function));
            expect(EventBus.on).toHaveBeenCalledWith('LocationService::cityDetected', expect.any(Function));
            expect(EventBus.on).toHaveBeenCalledWith('LocationService::error', expect.any(Function));
            expect(EventBus.on).toHaveBeenCalledWith('LocationService::userLocationReceived', expect.any(Function));
        });
    });

    describe('initialize', () => {
        test('should load saved city if exists', async () => {
            let getCityCallback;
            EventBus.emit.mockImplementation((event, data, callback) => {
                if (event === 'StorageService::getCity') {
                    getCityCallback = callback;
                }
            });
            
            await weatherController.initialize();
            getCityCallback('Moscow');
            
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'Moscow');
        });

        test('should load weather by IP if no saved city', async () => {
            let getCityCallback;
            EventBus.emit.mockImplementation((event, data, callback) => {
                if (event === 'StorageService::getCity') {
                    getCityCallback = callback;
                }
            });
            
            await weatherController.initialize();
            getCityCallback(null);
            
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherModel::setLoading', true);
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', true);
            expect(EventBus.emit).toHaveBeenCalledWith('LocationService::getCityByIp');
        });
    });

    describe('cityChanged event handler', () => {
        test('should update city when event received', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'WeatherController::cityChanged'
            )[1];
            
            handler('London');
            
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'London');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'London');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'London');
        });

        test('should not update for empty city', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'WeatherController::cityChanged'
            )[1];
            
            handler('');
            
            expect(EventBus.emit).not.toHaveBeenCalledWith('StorageService::saveCity', expect.any(String));
        });
    });

    describe('modelChanged event handler', () => {
        test('should update view when model changes', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'WeatherModel::modelChanged'
            )[1];
            
            const snapshot = { loading: false, hasError: false, city: 'Moscow' };
            handler(snapshot);
            
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherView::updateWeather', snapshot);
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
        });

        test('should not set city if loading or error', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'WeatherModel::modelChanged'
            )[1];
            
            const snapshot = { loading: true, hasError: false, city: 'Moscow' };
            handler(snapshot);
            
            expect(EventBus.emit).not.toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
        });
    });

    describe('weatherService dataReceived handler', () => {
        test('should handle weather data with city', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::dataReceived'
            )[1];
            
            const weatherData = {
                list: [{ dt_txt: '2024-01-01' }],
                city: { name: 'Moscow' }
            };
            handler(weatherData);
            
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::addToHistory', 'Moscow');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherModel::setWeatherData', weatherData);
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', false);
        });

        test('should handle weather data without city', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::dataReceived'
            )[1];
            
            const weatherData = { list: [{ dt_txt: '2024-01-01' }] };
            handler(weatherData);
            
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherModel::setWeatherData', weatherData);
        });

        test('should set error for invalid data', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::dataReceived'
            )[1];
            
            handler(null);
            
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'Не удалось получить данные о погоде');
        });
    });

    describe('weatherService error handler', () => {
        test('should set model error', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::error'
            )[1];
            
            handler(new Error('API Error'));
            
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'API Error');
        });
    });

    describe('locationService cityDetected handler', () => {
        test('should update city when city detected', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'LocationService::cityDetected'
            )[1];
            
            handler('Paris');
            
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Paris');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Paris');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'Paris');
        });
    });

    describe('locationService error handler', () => {
        test('should set model error', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'LocationService::error'
            )[1];
            
            handler(new Error('Location error'));
            
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'Не удалось определить местоположение');
        });
    });

    describe('locationService userLocationReceived handler', () => {
        test('should fetch weather by location', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'LocationService::userLocationReceived'
            )[1];
            
            const position = { coords: { latitude: 55.75, longitude: 37.62 } };
            handler(position);
            
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByLocation', 55.75, 37.62);
        });
    });

    describe('view callbacks', () => {
        test('should handle city input with debounce', () => {
            jest.useFakeTimers();
            
            const inputHandler = mockWeatherView.bindCityInput.mock.calls[0][0];
            const event = { target: { value: 'Moscow' } };
            inputHandler(event);
            
            jest.advanceTimersByTime(500);
            
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'Moscow');
            
            jest.useRealTimers();
        });

        test('should debounce multiple inputs', () => {
            jest.useFakeTimers();
            
            const inputHandler = mockWeatherView.bindCityInput.mock.calls[0][0];
            inputHandler({ target: { value: 'Moscow' } });
            inputHandler({ target: { value: 'London' } });
            inputHandler({ target: { value: 'Paris' } });
            
            jest.advanceTimersByTime(500);
            
            expect(EventBus.emit).toHaveBeenCalledTimes(3);
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Paris');
            
            jest.useRealTimers();
        });
    });
});