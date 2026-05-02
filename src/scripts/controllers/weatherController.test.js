import { WeatherController } from './weatherController.js';
import eventBus from '../utils/eventBus.js';

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

        test('should subscribe to eventBus events', () => {
            expect(eventBus.on).toHaveBeenCalledWith('WeatherController::cityChanged', expect.any(Function));
            expect(eventBus.on).toHaveBeenCalledWith('WeatherModel::modelChanged', expect.any(Function));
            expect(eventBus.on).toHaveBeenCalledWith('WeatherService::dataReceived', expect.any(Function));
            expect(eventBus.on).toHaveBeenCalledWith('WeatherService::error', expect.any(Function));
            expect(eventBus.on).toHaveBeenCalledWith('LocationService::cityDetected', expect.any(Function));
            expect(eventBus.on).toHaveBeenCalledWith('LocationService::error', expect.any(Function));
            expect(eventBus.on).toHaveBeenCalledWith('LocationService::userLocationReceived', expect.any(Function));
        });
    });

    describe('initialize', () => {
        test('should load saved city if exists', async () => {
            let getCityCallback;
            eventBus.emit.mockImplementation((event, data, callback) => {
                if (event === 'StorageService::getCity') {
                    getCityCallback = callback;
                }
            });
            
            await weatherController.initialize();
            getCityCallback('Moscow');
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'Moscow');
        });

        test('should load weather by IP if no saved city', async () => {
            let getCityCallback;
            eventBus.emit.mockImplementation((event, data, callback) => {
                if (event === 'StorageService::getCity') {
                    getCityCallback = callback;
                }
            });
            
            await weatherController.initialize();
            getCityCallback(null);
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setLoading', true);
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', true);
            expect(eventBus.emit).toHaveBeenCalledWith('LocationService::getCityByIp');
        });
    });

    describe('cityChanged event handler', () => {
        test('should update city when event received', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherController::cityChanged'
            )[1];
            
            handler('London');
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'London');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'London');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'London');
        });

        test('should not update for empty city', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherController::cityChanged'
            )[1];
            
            handler('');
            
            expect(eventBus.emit).not.toHaveBeenCalledWith('StorageService::saveCity', expect.any(String));
        });
    });

    describe('modelChanged event handler', () => {
        test('should update view when model changes', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherModel::modelChanged'
            )[1];
            
            const snapshot = { loading: false, hasError: false, city: 'Moscow' };
            handler(snapshot);
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::updateWeather', snapshot);
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
        });

        test('should not set city if loading or error', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherModel::modelChanged'
            )[1];
            
            const snapshot = { loading: true, hasError: false, city: 'Moscow' };
            handler(snapshot);
            
            expect(eventBus.emit).not.toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
        });
    });

    describe('weatherService dataReceived handler', () => {
        test('should handle weather data with city', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::dataReceived'
            )[1];
            
            const weatherData = {
                list: [{ dt_txt: '2024-01-01' }],
                city: { name: 'Moscow' }
            };
            handler(weatherData);
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::addToHistory', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setWeatherData', weatherData);
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', false);
        });

        test('should handle weather data without city', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::dataReceived'
            )[1];
            
            const weatherData = { list: [{ dt_txt: '2024-01-01' }] };
            handler(weatherData);
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setWeatherData', weatherData);
        });

        test('should set error for invalid data', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::dataReceived'
            )[1];
            
            handler(null);
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'Не удалось получить данные о погоде');
        });
    });

    describe('weatherService error handler', () => {
        test('should set model error', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'WeatherService::error'
            )[1];
            
            handler(new Error('API Error'));
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'API Error');
        });
    });

    describe('locationService cityDetected handler', () => {
        test('should update city when city detected', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'LocationService::cityDetected'
            )[1];
            
            handler('Paris');
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Paris');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Paris');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'Paris');
        });
    });

    describe('locationService error handler', () => {
        test('should set model error', () => {
            const handler = eventBus.on.mock.calls.find(
                call => call[0] === 'LocationService::error'
            )[1];
            
            handler(new Error('Location error'));
            
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'Не удалось определить местоположение');
        });
    });

    describe('locationService userLocationReceived handler', () => {
        test('should fetch weather by location', () => {
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
            const event = { target: { value: 'Moscow' } };
            inputHandler(event);
            
            jest.advanceTimersByTime(500);
            
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
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
            
            expect(eventBus.emit).toHaveBeenCalledTimes(3);
            expect(eventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Paris');
            
            jest.useRealTimers();
        });
    });
});