import { WeatherView } from './weatherView.js';
import { MainWindow } from './components/mainWindow.js';
import { TodayCards } from './components/todayCards.js';
import { ForecastList } from './components/forecastList.js';
import { DetailInfo } from './components/detailInfo.js';

jest.mock('./components/mainWindow.js');
jest.mock('./components/todayCards.js');
jest.mock('./components/forecastList.js');
jest.mock('./components/detailInfo.js');

describe('WeatherView', () => {
    let weatherView;
    let parentElement;
    let mockModel;

    beforeEach(() => {
        weatherView = new WeatherView();
        parentElement = document.createElement('div');
        
        mockModel = {
            isLoading: jest.fn(),
            hasError: jest.fn(),
            getError: jest.fn(),
            getTodayForecast: jest.fn(),
            getCurrentWeather: jest.fn(),
            getNextDaysForecast: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.title = '';
    });

    describe('render', () => {
        test('should render main window and store container', () => {
            const mockContainer = document.createElement('div');
            MainWindow.prototype.render.mockReturnValue(mockContainer);

            weatherView.render(parentElement);

            expect(MainWindow.prototype.render).toHaveBeenCalledWith(parentElement);
        });
    });

    describe('updateWeather', () => {
        beforeEach(() => {
            const mockContainer = document.createElement('div');
            MainWindow.prototype.render.mockReturnValue(mockContainer);
            weatherView.render(parentElement);
        });


        test('should show error when model has error', () => {
            mockModel.isLoading.mockReturnValue(false);
            mockModel.hasError.mockReturnValue(true);
            mockModel.getError.mockReturnValue('Test error');
            
            weatherView.updateWeather(mockModel);
            
            expect(MainWindow.prototype.showError).toHaveBeenCalledWith('Test error');
        });

        test('should render today forecast, current weather and next days', () => {
            mockModel.isLoading.mockReturnValue(false);
            mockModel.hasError.mockReturnValue(false);
            mockModel.getTodayForecast.mockReturnValue([{ id: 1 }]);
            mockModel.getCurrentWeather.mockReturnValue({ temp: 20 });
            mockModel.getNextDaysForecast.mockReturnValue([{ id: 2 }]);

            weatherView.updateWeather(mockModel);

            expect(TodayCards.prototype.render).toHaveBeenCalled();
            expect(DetailInfo.prototype.render).toHaveBeenCalled();
            expect(ForecastList.prototype.render).toHaveBeenCalled();
        });

        test('should not render today forecast when no data', () => {
            mockModel.isLoading.mockReturnValue(false);
            mockModel.hasError.mockReturnValue(false);
            mockModel.getTodayForecast.mockReturnValue([]);
            mockModel.getCurrentWeather.mockReturnValue({ temp: 20 });
            mockModel.getNextDaysForecast.mockReturnValue([{ id: 2 }]);

            weatherView.updateWeather(mockModel);

            expect(TodayCards.prototype.render).not.toHaveBeenCalled();
            expect(DetailInfo.prototype.render).toHaveBeenCalled();
            expect(ForecastList.prototype.render).toHaveBeenCalled();
        });

        test('should not render current weather when no data', () => {
            mockModel.isLoading.mockReturnValue(false);
            mockModel.hasError.mockReturnValue(false);
            mockModel.getTodayForecast.mockReturnValue([{ id: 1 }]);
            mockModel.getCurrentWeather.mockReturnValue(null);
            mockModel.getNextDaysForecast.mockReturnValue([{ id: 2 }]);

            weatherView.updateWeather(mockModel);

            expect(TodayCards.prototype.render).toHaveBeenCalled();
            expect(DetailInfo.prototype.render).not.toHaveBeenCalled();
            expect(ForecastList.prototype.render).toHaveBeenCalled();
        });

        test('should not render next days forecast when no data', () => {
            mockModel.isLoading.mockReturnValue(false);
            mockModel.hasError.mockReturnValue(false);
            mockModel.getTodayForecast.mockReturnValue([{ id: 1 }]);
            mockModel.getCurrentWeather.mockReturnValue({ temp: 20 });
            mockModel.getNextDaysForecast.mockReturnValue([]);

            weatherView.updateWeather(mockModel);

            expect(TodayCards.prototype.render).toHaveBeenCalled();
            expect(DetailInfo.prototype.render).toHaveBeenCalled();
            expect(ForecastList.prototype.render).not.toHaveBeenCalled();
        });

        test('should do nothing when container is null', () => {
            const newView = new WeatherView();
            newView.updateWeather(mockModel);
            
            expect(TodayCards.prototype.render).not.toHaveBeenCalled();
        });
    });

    describe('setPageTitle', () => {
        test('should set title with city name', () => {
            weatherView.setPageTitle('Moscow');
            expect(document.title).toBe('Погода в Moscow');
        });

        test('should set default title when city is empty', () => {
            weatherView.setPageTitle('');
            expect(document.title).toBe('Прогноз погоды');
        });

        test('should set default title when city is null', () => {
            weatherView.setPageTitle(null);
            expect(document.title).toBe('Прогноз погоды');
        });
    });

    describe('setCity', () => {
        test('should set page title and city value', () => {
            weatherView.setCity('London');
            
            expect(document.title).toBe('Погода в London');
            expect(MainWindow.prototype.setCityValue).toHaveBeenCalledWith('London');
        });
    });

    describe('getCity', () => {
        test('should return city from main window', () => {
            MainWindow.prototype.getCityValue.mockReturnValue('Paris');
            
            const result = weatherView.getCity();
            
            expect(result).toBe('Paris');
            expect(MainWindow.prototype.getCityValue).toHaveBeenCalled();
        });
    });

    describe('showError', () => {
        test('should call mainWindow showError', () => {
            weatherView.showError('Error message');
            
            expect(MainWindow.prototype.showError).toHaveBeenCalledWith('Error message');
        });
    });

    describe('setLoading', () => {
        test('should call mainWindow setLoading', () => {
            weatherView.setLoading(true);
            expect(MainWindow.prototype.setLoading).toHaveBeenCalledWith(true);
            
            weatherView.setLoading(false);
            expect(MainWindow.prototype.setLoading).toHaveBeenCalledWith(false);
        });
    });

    describe('bindCityInput', () => {
        test('should call mainWindow bindCityInput', () => {
            const handler = jest.fn();
            weatherView.bindCityInput(handler);
            
            expect(MainWindow.prototype.bindCityInput).toHaveBeenCalledWith(handler);
        });
    });

    describe('bindFindMeButton', () => {
        test('should call mainWindow bindFindMeButton', () => {
            const handler = jest.fn();
            weatherView.bindFindMeButton(handler);
            
            expect(MainWindow.prototype.bindFindMeButton).toHaveBeenCalledWith(handler);
        });
    });
});