import { HistoryWeather } from './historyWeather.js';
import { HistoryWeatherItem } from './historyWeatherItem.js';
import EventBus from '../../utils/eventBus.js';

jest.mock('../../utils/eventBus.js');
jest.mock('./historyWeatherItem.js');

describe('HistoryWeather', () => {
    let historyWeather;
    let mockParentElement;

    beforeEach(() => {
        jest.clearAllMocks();
        mockParentElement = document.createElement('div');
        historyWeather = new HistoryWeather();
    });

    describe('render', () => {
        test('should create container with title', () => {
            historyWeather.render(mockParentElement);
            
            const container = mockParentElement.querySelector('.history-weather');
            expect(container).not.toBeNull();
            expect(container.querySelector('.history-title')).not.toBeNull();
            expect(container.querySelector('.history-title').textContent).toBe('История поиска');
            expect(container.querySelector('.history-cities-list')).not.toBeNull();
        });
    });

    describe('updateHistory', () => {
        test('should show empty message when no history', () => {
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory([]);
            
            const emptyMessage = mockParentElement.querySelector('.empty-history-message');
            expect(emptyMessage).not.toBeNull();
            expect(emptyMessage.textContent).toBe('История поиска пуста');
        });

        test('should show empty message when history is null', () => {
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(null);
            
            const emptyMessage = mockParentElement.querySelector('.empty-history-message');
            expect(emptyMessage).not.toBeNull();
        });

        test('should create history items for each city', () => {
            const mockHistory = [
                { city: 'Moscow', timestamp: 123456789 },
                { city: 'London', timestamp: 123456790 },
                { city: 'Paris', timestamp: 123456791 }
            ];
            
            HistoryWeatherItem.mockImplementation(() => ({
                render: jest.fn().mockReturnValue(document.createElement('div')),
                getCity: jest.fn(),
                updateWeather: jest.fn(),
                hide: jest.fn()
            }));
            
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(mockHistory);
            
            expect(HistoryWeatherItem).toHaveBeenCalledTimes(3);
            expect(HistoryWeatherItem).toHaveBeenCalledWith(mockHistory[0]);
            expect(HistoryWeatherItem).toHaveBeenCalledWith(mockHistory[1]);
            expect(HistoryWeatherItem).toHaveBeenCalledWith(mockHistory[2]);
        });

        test('should clear previous history before adding new', () => {
            const mockHistory1 = [{ city: 'Moscow', timestamp: 123 }];
            const mockHistory2 = [{ city: 'London', timestamp: 456 }];
            
            HistoryWeatherItem.mockImplementation(() => ({
                render: jest.fn().mockReturnValue(document.createElement('div')),
                getCity: jest.fn(),
                updateWeather: jest.fn(),
                hide: jest.fn()
            }));
            
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(mockHistory1);
            historyWeather.updateHistory(mockHistory2);
            
            const historyList = mockParentElement.querySelector('.history-cities-list');
            expect(historyList.children.length).toBe(1);
        });
    });

    describe('EventBus subscription', () => {
        test('should subscribe to HistoryWeather::citySelected event', () => {
            expect(EventBus.on).toHaveBeenCalledWith('HistoryWeather::citySelected', expect.any(Function));
        });

        test('should emit cityChanged when city selected', () => {
            const handler = EventBus.on.mock.calls.find(
                call => call[0] === 'HistoryWeather::citySelected'
            )[1];
            
            handler('Moscow');
            
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherController::cityChanged', 'Moscow');
        });
    });

    describe('updateCityWeather', () => {
        test('should update weather for existing city', () => {
            const mockHistory = [{ city: 'Moscow', timestamp: 123 }];
            const mockUpdateWeather = jest.fn();
            
            HistoryWeatherItem.mockImplementation(() => ({
                render: jest.fn().mockReturnValue(document.createElement('div')),
                getCity: jest.fn().mockReturnValue('Moscow'),
                updateWeather: mockUpdateWeather,
                hide: jest.fn()
            }));
            
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory(mockHistory);
            historyWeather.updateCityWeather('Moscow', { list: [{}] });
            
            expect(mockUpdateWeather).toHaveBeenCalledWith({ list: [{}] });
        });

        test('should not update for non-existent city', () => {
            const mockUpdateWeather = jest.fn();
            
            HistoryWeatherItem.mockImplementation(() => ({
                render: jest.fn().mockReturnValue(document.createElement('div')),
                getCity: jest.fn().mockReturnValue('Moscow'),
                updateWeather: mockUpdateWeather,
                hide: jest.fn()
            }));
            
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory([{ city: 'Moscow', timestamp: 123 }]);
            historyWeather.updateCityWeather('London', { list: [{}] });
            
            expect(mockUpdateWeather).not.toHaveBeenCalled();
        });
    });

    describe('fetchWeatherForCity', () => {
        beforeEach(() => {
            HistoryWeatherItem.mockImplementation(() => ({
                render: jest.fn().mockReturnValue(document.createElement('div')),
                getCity: jest.fn().mockReturnValue('Moscow'),
                updateWeather: jest.fn(),
                hide: jest.fn()
            }));
            
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should fetch weather for city on history update', () => {
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory([{ city: 'Moscow', timestamp: 123 }]);
            
            expect(EventBus.emit).toHaveBeenCalledWith('WeatherService::fetchHistoryWeather', 'Moscow');
        });

        test('should cleanup event listeners after timeout', () => {
            const offSpy = jest.spyOn(EventBus, 'off');
            
            historyWeather.render(mockParentElement);
            historyWeather.updateHistory([{ city: 'Moscow', timestamp: 123 }]);
            
            jest.advanceTimersByTime(10000);
            
            expect(offSpy).toHaveBeenCalled();
        });
    });
});