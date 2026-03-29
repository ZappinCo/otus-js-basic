import { WeatherController } from './weatherController.js';

describe('WeatherController', () => {
    let controller;
    let mockModel;
    let mockView;
    let mockWeatherService;
    let mockLocationService;
    let mockStorageService;

    beforeEach(() => {
        jest.useFakeTimers();
        
        mockModel = {
            addObserver: jest.fn(),
            setLoading: jest.fn(),
            setError: jest.fn(),
            setWeatherData: jest.fn(),
            isLoading: jest.fn(() => false),
            hasError: jest.fn(() => false),
            getError: jest.fn(),
            clearWeatherData: jest.fn()
        };

        mockView = {
            bindCityInput: jest.fn(),
            bindFindMeButton: jest.fn(),
            setCity: jest.fn(),
            setLoading: jest.fn(),
            showError: jest.fn(),
            updateWeather: jest.fn(),
            getCity: jest.fn()
        };

        mockWeatherService = {
            getWeatherByCity: jest.fn(),
            getWeatherByLocation: jest.fn()
        };

        mockLocationService = {
            getUserLocation: jest.fn(),
            getCityByIp: jest.fn()
        };

        mockStorageService = {
            getCity: jest.fn(),
            saveCity: jest.fn()
        };

        controller = new WeatherController(
            mockModel,
            mockView,
            mockWeatherService,
            mockLocationService,
            mockStorageService
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('initialize', () => {
        test('should load saved city', async () => {
            mockStorageService.getCity.mockReturnValue('Moscow');
            mockWeatherService.getWeatherByCity.mockResolvedValue({ 
                list: [{}], 
                city: { name: 'Moscow' } 
            });

            await controller.initialize();

            expect(mockView.setCity).toHaveBeenCalledWith('Moscow');
            expect(mockWeatherService.getWeatherByCity).toHaveBeenCalledWith('Moscow');
        });

        test('should load by IP when no saved city', async () => {
            mockStorageService.getCity.mockReturnValue(null);
            mockLocationService.getCityByIp.mockResolvedValue('Berlin');
            mockWeatherService.getWeatherByCity.mockResolvedValue({ 
                list: [{}], 
                city: { name: 'Berlin' } 
            });

            await controller.initialize();

            expect(mockLocationService.getCityByIp).toHaveBeenCalled();
            expect(mockView.setCity).toHaveBeenCalledWith('Berlin');
        });

        test('should handle errors', async () => {
            mockStorageService.getCity.mockReturnValue(null);
            mockLocationService.getCityByIp.mockRejectedValue(new Error('Network error'));

            await controller.initialize();

            expect(mockModel.setError).toHaveBeenCalled();
        });
    });

    describe('city input', () => {
        test('should handle valid city input', async () => {
            const cityInputHandler = mockView.bindCityInput.mock.calls[0][0];
            
            mockWeatherService.getWeatherByCity.mockResolvedValue({ 
                list: [{}], 
                city: { name: 'Paris' } 
            });
            const event = { target: { value: 'Paris' } };
            await cityInputHandler(event);
            jest.advanceTimersByTime(500);

            expect(mockStorageService.saveCity).toHaveBeenCalledWith('Paris');
            expect(mockWeatherService.getWeatherByCity).toHaveBeenCalledWith('Paris');
        });

        test('should ignore empty input', async () => {
            const cityInputHandler = mockView.bindCityInput.mock.calls[0][0];

            await cityInputHandler({ target: { value: '' } });
            await cityInputHandler({ target: { value: '   ' } });
            await cityInputHandler({ target: { value: null } });

            jest.advanceTimersByTime(500);

            expect(mockStorageService.saveCity).not.toHaveBeenCalled();
        });

        test('should debounce input', async () => {
            const cityInputHandler = mockView.bindCityInput.mock.calls[0][0];
            const event = { target: { value: 'London' } };

            cityInputHandler(event);
            cityInputHandler(event);
            cityInputHandler(event);

            expect(mockWeatherService.getWeatherByCity).not.toHaveBeenCalled();

            jest.advanceTimersByTime(500);

            expect(mockWeatherService.getWeatherByCity).toHaveBeenCalledTimes(1);
        });
    });

    describe('find me button', () => {
        test('should get location and load weather', async () => {
            const findMeHandler = mockView.bindFindMeButton.mock.calls[0][0];
            const mockPosition = { coords: { latitude: 55.75, longitude: 37.62 } };
            const mockWeatherData = { list: [{}], city: { name: 'Moscow' } };

            mockLocationService.getUserLocation.mockResolvedValue(mockPosition);
            mockWeatherService.getWeatherByLocation.mockResolvedValue(mockWeatherData);

            await findMeHandler();

            expect(mockLocationService.getUserLocation).toHaveBeenCalled();
            expect(mockWeatherService.getWeatherByLocation).toHaveBeenCalledWith(55.75, 37.62);
            expect(mockStorageService.saveCity).toHaveBeenCalledWith('Moscow');
        });

        test('should not load if already loading', async () => {
            mockModel.isLoading.mockReturnValue(true);
            const findMeHandler = mockView.bindFindMeButton.mock.calls[0][0];

            await findMeHandler();

            expect(mockLocationService.getUserLocation).not.toHaveBeenCalled();
        });

        test('should fallback to IP on geolocation error', async () => {
            const findMeHandler = mockView.bindFindMeButton.mock.calls[0][0];
            
            mockLocationService.getUserLocation.mockRejectedValue(new Error('Denied'));
            mockLocationService.getCityByIp.mockResolvedValue('Paris');
            mockWeatherService.getWeatherByCity.mockResolvedValue({ 
                list: [{}], 
                city: { name: 'Paris' } 
            });

            await findMeHandler();

            expect(mockLocationService.getCityByIp).toHaveBeenCalled();
            expect(mockWeatherService.getWeatherByCity).toHaveBeenCalledWith('Paris');
        });

        test('should handle empty city from fallback IP', async () => {
            const findMeHandler = mockView.bindFindMeButton.mock.calls[0][0];
            
            mockLocationService.getUserLocation.mockRejectedValue(new Error('Denied'));
            mockLocationService.getCityByIp.mockResolvedValue('');

            await findMeHandler();

            expect(mockModel.setError).toHaveBeenCalledWith('Не удалось определить ваше местоположение');
        });
    });

    describe('observer', () => {
        test('should update view on model change', () => {
            const observer = mockModel.addObserver.mock.calls[0][0];
            observer();
            expect(mockView.updateWeather).toHaveBeenCalledWith(mockModel);
        });

        test('should show error when model has error', () => {
            const observer = mockModel.addObserver.mock.calls[0][0];
            mockModel.hasError.mockReturnValue(true);
            mockModel.getError.mockReturnValue('Test error');
            
            observer();
            
            expect(mockView.showError).toHaveBeenCalledWith('Test error');
        });
    });

    describe('edge cases through initialize', () => {
        test('should handle empty weather data from API', async () => {
            mockStorageService.getCity.mockReturnValue('Moscow');
            mockWeatherService.getWeatherByCity.mockResolvedValue(null);

            await controller.initialize();

            expect(mockModel.setError).toHaveBeenCalledWith('Нет данных о погоде для города Moscow');
        });

        test('should handle API error when loading weather', async () => {
            mockStorageService.getCity.mockReturnValue('Moscow');
            mockWeatherService.getWeatherByCity.mockRejectedValue(new Error('API Error'));

            await controller.initialize();

            expect(mockModel.setError).toHaveBeenCalledWith('Ошибка загрузки данных о погоде');
        });

        test('should handle empty city from IP', async () => {
            mockStorageService.getCity.mockReturnValue(null);
            mockLocationService.getCityByIp.mockResolvedValue('');

            await controller.initialize();

            expect(mockModel.setError).toHaveBeenCalledWith('Не удалось определить ваше местоположение');
        });
    });
});