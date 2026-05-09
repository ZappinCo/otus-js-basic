import { WeatherController } from './weatherController';
import eventBus from '../utils/eventBus';
import router from '../utils/router';
import { ForecastData } from '../../types/forecast';
import { WeatherModelSnapshot } from '../../types/weathermodelsnapshot';
import { StorageData } from '../../types/storagedata';

jest.mock('../utils/eventBus');
jest.mock('../utils/router');

describe('WeatherController', () => {
    let weatherController: WeatherController;
    let mockWeatherView: any;
    let mockEventBus: jest.Mocked<typeof eventBus>;
    let mockRouter: jest.Mocked<typeof router>;

    const getHandler = (eventName: string) => {
        const call = (mockEventBus.on as jest.Mock).mock.calls.find(
            (call: any[]) => call[0] === eventName
        );
        if (!call) throw new Error(`Handler for ${eventName} not found`);
        return call[1];
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockEventBus = eventBus as jest.Mocked<typeof eventBus>;
        mockRouter = router as jest.Mocked<typeof router>;
        
        mockWeatherView = {
            bindCityInput: jest.fn(),
            bindFindMeButton: jest.fn(),
            bindAboutButton: jest.fn(),
            setCity: jest.fn(),
            setLoading: jest.fn(),
            showError: jest.fn()
        };
        
        mockEventBus.on.mockImplementation(() => jest.fn());
        
        weatherController = new WeatherController(mockWeatherView);
        weatherController.initialize();
    });

    describe('constructor', () => {
        test('should bind view events', () => {
            expect(mockWeatherView.bindCityInput).toHaveBeenCalled();
            expect(mockWeatherView.bindFindMeButton).toHaveBeenCalled();
            expect(mockWeatherView.bindAboutButton).toHaveBeenCalled();
        });
    });

    describe('city update', () => {
        test('should update city when event received', () => {
            const handler = getHandler('WeatherController::cityChanged');
            handler('London');
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'London');
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'London');
            expect(mockRouter.navigateTo).toHaveBeenCalledWith('/city/London', false);
        });

        test('should not update for empty city', () => {
            const handler = getHandler('WeatherController::cityChanged');
            handler('');
            
            expect(mockEventBus.emit).not.toHaveBeenCalledWith('StorageService::saveCity', expect.any(String));
        });

        test('should not update for whitespace only', () => {
            const handler = getHandler('WeatherController::cityChanged');
            handler('   ');
            
            expect(mockEventBus.emit).not.toHaveBeenCalledWith('StorageService::saveCity', expect.any(String));
        });
    });

    describe('model changed', () => {
        test('should update view when model changes without loading/error', () => {
            const handler = getHandler('WeatherModel::modelChanged');
            
            const snapshot: WeatherModelSnapshot = {
                currentWeather: null,
                forecastList: [],
                loading: false,
                error: null,
                city: 'Moscow',
                hasData: true,
                hasError: false,
                todayForecast: [],
                nextDaysForecast: []
            };
            handler(snapshot);
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherView::updateWeather', snapshot);
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
        });

        test('should not set city when loading', () => {
            const handler = getHandler('WeatherModel::modelChanged');
            
            const snapshot: WeatherModelSnapshot = {
                currentWeather: null,
                forecastList: [],
                loading: true,
                error: null,
                city: 'Moscow',
                hasData: false,
                hasError: false,
                todayForecast: [],
                nextDaysForecast: []
            };
            handler(snapshot);
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherView::updateWeather', snapshot);
            expect(mockEventBus.emit).not.toHaveBeenCalledWith('WeatherView::setCity', 'Moscow');
        });

        test('should not set city when has error', () => {
            const handler = getHandler('WeatherModel::modelChanged');
            
            const snapshot: WeatherModelSnapshot = {
                currentWeather: null,
                forecastList: [],
                loading: false,
                error: 'Network error',
                city: null,
                hasData: false,
                hasError: true,
                todayForecast: [],
                nextDaysForecast: []
            };
            handler(snapshot);
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherView::updateWeather', snapshot);
            expect(mockEventBus.emit).not.toHaveBeenCalledWith('WeatherView::setCity', expect.any(String));
        });
    });

    describe('weather data handling', () => {
        test('should handle weather data with city', () => {
            const handler = getHandler('WeatherService::dataReceived');
            
            const weatherData: ForecastData[] = [
                {
                    city: 'Moscow',
                    dt: '2024-01-01 12:00:00',
                    description: 'clear sky',
                    icon: '01d',
                    temp: 20,
                    temp_min: 15,
                    speed: 5,
                    pressure: 1013,
                    humidity: 65
                }
            ];
            handler(weatherData);
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(mockEventBus.emit).toHaveBeenCalledWith('StorageService::addToHistory', 'Moscow');
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherModel::setWeatherData', weatherData);
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', false);
        });

        test('should handle empty weather data', () => {
            const handler = getHandler('WeatherService::dataReceived');
            handler([]);
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'Не удалось получить данные о погоде');
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', false);
        });

        test('should handle error', () => {
            const handler = getHandler('WeatherService::error');
            handler(new Error('API Error'));
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'API Error');
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', false);
        });
    });

    describe('history data', () => {
        test('should handle history data received', () => {
            const handler = getHandler('WeatherService::historyDataReceived');
            
            const weatherData: ForecastData[] = [
                {
                    city: 'Moscow',
                    dt: '2024-01-01 12:00:00',
                    description: 'clear sky',
                    icon: '01d',
                    temp: 20,
                    temp_min: 15,
                    speed: 5,
                    pressure: 1013,
                    humidity: 65
                }
            ];
            handler(weatherData);
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherView::historyWeatherReceived', weatherData);
        });

        test('should load history weather on update', () => {
            const handler = getHandler('StorageService::historyUpdated');
            
            const history: StorageData = {
                city: 'Moscow',
                searchHistory: ['Moscow', 'London']
            };
            handler(history);
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'Moscow');
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'London');
        });

        test('should not load history when empty', () => {
            const handler = getHandler('StorageService::historyUpdated');
            
            const history: StorageData = {
                city: '',
                searchHistory: []
            };
            handler(history);
            
            expect(mockEventBus.emit).not.toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', expect.any(String));
        });
    });

    describe('location service', () => {
        test('should update city when detected', () => {
            const handler = getHandler('LocationService::cityDetected');
            handler('Paris');
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Paris');
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'Paris');
        });

        test('should handle location error', () => {
            const handler = getHandler('LocationService::error');
            handler(new Error('Location error'));
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherModel::setError', 'Не удалось определить местоположение');
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', false);
        });

        test('should handle user location received', () => {
            const handler = getHandler('LocationService::userLocationReceived');
            const position = { lat: 55.75, lon: 37.62 };
            handler(position);
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByLocation', position);
        });
    });

    describe('storage service', () => {
        test('should set city from storage', () => {
            const handler = getHandler('StorageService::setCity');
            handler('Moscow');
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('StorageService::saveCity', 'Moscow');
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherService::fetchByCity', 'Moscow');
        });

        test('should load weather by IP when no saved city', () => {
            const handler = getHandler('StorageService::setCity');
            handler(null);
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('LocationService::getCityByIp');
        });
    });

    describe('view callbacks', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            mockEventBus.emit.mockClear();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should not update for empty input', () => {
            const inputHandler = mockWeatherView.bindCityInput.mock.calls[0][0];
            inputHandler({ target: { value: '' } } as unknown as Event);
            
            jest.advanceTimersByTime(500);
            
            expect(mockEventBus.emit).not.toHaveBeenCalledWith('StorageService::saveCity', expect.any(String));
        });

        test('should handle find me button click', () => {
            const findMeHandler = mockWeatherView.bindFindMeButton.mock.calls[0][0];
            findMeHandler();
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherModel::getSnapshot');
        });

        test('should handle about button click', () => {
            const aboutHandler = mockWeatherView.bindAboutButton.mock.calls[0][0];
            aboutHandler();
            
            expect(mockRouter.navigateTo).toHaveBeenCalledWith('/about');
        });
    });

    describe('set snapshot', () => {
        test('should set loading when snapshot is not loading', () => {
            const handler = getHandler('WeatherModel::setSnapshot');
            
            const snapshot: WeatherModelSnapshot = {
                currentWeather: null,
                forecastList: [],
                loading: false,
                error: null,
                city: null,
                hasData: false,
                hasError: false,
                todayForecast: [],
                nextDaysForecast: []
            };
            handler(snapshot);
            
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherModel::setLoading', true);
            expect(mockEventBus.emit).toHaveBeenCalledWith('WeatherView::setLoading', true);
            expect(mockEventBus.emit).toHaveBeenCalledWith('LocationService::getUserLocation');
        });

        test('should not set loading when snapshot is already loading', () => {
            const handler = getHandler('WeatherModel::setSnapshot');
            
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
            handler(snapshot);
            
            expect(mockEventBus.emit).not.toHaveBeenCalledWith('WeatherModel::setLoading', true);
            expect(mockEventBus.emit).not.toHaveBeenCalledWith('WeatherView::setLoading', true);
            expect(mockEventBus.emit).not.toHaveBeenCalledWith('LocationService::getUserLocation');
        });
    });
});