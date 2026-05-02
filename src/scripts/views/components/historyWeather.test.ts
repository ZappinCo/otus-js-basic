import { HistoryWeather } from './historyWeather';
import { HistoryWeatherItem } from './historyWeatherItem';
import eventBus from '../../utils/eventBus';
import { StorageData } from '../../../types/storagedata';
import { ForecastData } from '../../../types/forecast';

jest.mock('../../utils/eventBus');
jest.mock('./historyWeatherItem');

describe('HistoryWeather', () => {
    let historyWeather: HistoryWeather;
    let mockParentElement: HTMLElement;

    const mockHistoryData: StorageData = {
        city: 'Moscow',
        searchHistory: ['Moscow', 'London', 'Paris']
    };

    const mockForecastData: ForecastData[] = [{
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

    beforeEach(() => {
        jest.clearAllMocks();
        mockParentElement = document.createElement('div');
        historyWeather = new HistoryWeather();

        (HistoryWeatherItem as jest.Mock).mockImplementation((city: string) => ({
            render: jest.fn().mockReturnValue(document.createElement('div')),
            getCity: jest.fn().mockReturnValue(city),
            updateWeather: jest.fn(),
            hide: jest.fn(),
            getContainer: jest.fn().mockReturnValue(document.createElement('div'))
        }));
    });

    describe('render', () => {
        test('should create container with title', () => {
            historyWeather.render(mockParentElement);

            const container = mockParentElement.querySelector('.history-weather');
            expect(container).not.toBeNull();
            expect(container?.querySelector('.history-title')).not.toBeNull();
            expect((container?.querySelector('.history-title') as HTMLElement).textContent).toBe('История поиска');
            expect(container?.querySelector('.history-cities-list')).not.toBeNull();
        });
    });

    describe('updateHistory', () => {
        test('should show empty message when no history', () => {
            const emptyHistory: StorageData = { city: '', searchHistory: [] };
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(emptyHistory);

            const emptyMessage = mockParentElement.querySelector('.empty-history-message');
            expect(emptyMessage).not.toBeNull();
            expect((emptyMessage as HTMLElement).textContent).toBe('История поиска пуста');
        });

        test('should create history items for each city', () => {
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(mockHistoryData);

            expect(HistoryWeatherItem).toHaveBeenCalledTimes(3);
            expect(HistoryWeatherItem).toHaveBeenCalledWith('Moscow');
            expect(HistoryWeatherItem).toHaveBeenCalledWith('London');
            expect(HistoryWeatherItem).toHaveBeenCalledWith('Paris');
        });

        test('should clear previous history before adding new', () => {
            const newHistory: StorageData = { city: 'London', searchHistory: ['London'] };

            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(mockHistoryData);
            historyWeather.updateHistory(newHistory);

            const historyList = mockParentElement.querySelector('.history-cities-list');
            expect(historyList?.children).toHaveLength(1);
        });
    });

    describe('eventBus subscription', () => {
        test('should subscribe to HistoryWeather::citySelected event', () => {
            expect(eventBus.on).toHaveBeenCalledWith('HistoryWeather::citySelected', expect.any(Function));
        });

        test('should emit cityChanged when city selected', () => {
            const handler = (eventBus.on as jest.Mock).mock.calls.find(
                (call: any[]) => call[0] === 'HistoryWeather::citySelected'
            )?.[1];

            handler('Moscow');

            expect(eventBus.emit).toHaveBeenCalledWith('WeatherController::cityChanged', 'Moscow');
        });
    });

    describe('updateCityWeather', () => {
        test('should update weather for existing city', () => {
            let updateWeatherMock = jest.fn();
            (HistoryWeatherItem as jest.Mock).mockImplementation(() => ({
                render: jest.fn().mockReturnValue(document.createElement('div')),
                getCity: jest.fn().mockReturnValue('Moscow'),
                updateWeather: updateWeatherMock,
                hide: jest.fn(),
                getContainer: jest.fn().mockReturnValue(document.createElement('div'))
            }));

            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(mockHistoryData);
            historyWeather.updateCityWeather(mockForecastData);

            expect(updateWeatherMock).toHaveBeenCalledWith(mockForecastData);
        });

        test('should not update for non-existent city', () => {
            const updateWeatherMock = jest.fn();

            (HistoryWeatherItem as jest.Mock).mockImplementation(() => ({
                render: jest.fn().mockReturnValue(document.createElement('div')),
                getCity: jest.fn().mockReturnValue('Moscow'),
                updateWeather: updateWeatherMock,
                hide: jest.fn(),
                getContainer: jest.fn().mockReturnValue(document.createElement('div'))
            }));

            const otherForecast: ForecastData[] = [{
                ...mockForecastData[0],
                city: 'Berlin'
            }];

            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(mockHistoryData);
            historyWeather.updateCityWeather(otherForecast);

            expect(updateWeatherMock).not.toHaveBeenCalled();
        });

        test('should not update when weatherData is empty', () => {
            const updateWeatherMock = jest.fn();

            (HistoryWeatherItem as jest.Mock).mockImplementation(() => ({
                render: jest.fn().mockReturnValue(document.createElement('div')),
                getCity: jest.fn().mockReturnValue('Moscow'),
                updateWeather: updateWeatherMock,
                hide: jest.fn(),
                getContainer: jest.fn().mockReturnValue(document.createElement('div'))
            }));

            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(mockHistoryData);
            historyWeather.updateCityWeather([]);

            expect(updateWeatherMock).not.toHaveBeenCalled();
        });
    });

    describe('fetch weather for city', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should fetch weather for city on history update', () => {
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(mockHistoryData);

            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'Moscow');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'London');
            expect(eventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'Paris');
        });
    });

    describe('highlight selected city', () => {
        test('should highlight selected city', () => {
            const mockContainer = document.createElement('div');
            mockContainer.classList.add = jest.fn();
            mockContainer.classList.remove = jest.fn();

            (HistoryWeatherItem as jest.Mock).mockImplementation((city: string) => ({
                render: jest.fn().mockReturnValue(document.createElement('div')),
                getCity: jest.fn().mockReturnValue(city),
                updateWeather: jest.fn(),
                hide: jest.fn(),
                getContainer: jest.fn().mockReturnValue(mockContainer)
            }));

            const handler = (eventBus.on as jest.Mock).mock.calls.find(
                (call: any[]) => call[0] === 'HistoryWeather::citySelected'
            )?.[1];

            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(mockHistoryData);

            handler('Moscow');

            expect(mockContainer.classList.add).toHaveBeenCalledWith('selected');
        });
    });

    
});