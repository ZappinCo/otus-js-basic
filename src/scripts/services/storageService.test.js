import { StorageService } from './storageService.js';
import EventBus from '../utils/eventBus.js';

jest.mock('../utils/eventBus.js');

describe('StorageService', () => {
    let storageService;
    let mockStorage = {};

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockStorage = {};
        global.localStorage = {
            getItem: jest.fn((key) => mockStorage[key] || null),
            setItem: jest.fn((key, value) => { mockStorage[key] = value; }),
            removeItem: jest.fn((key) => { delete mockStorage[key]; }),
            clear: jest.fn(() => { mockStorage = {}; })
        };
        
        storageService = new StorageService();
    });

    describe('saveCity and getCity', () => {
        test('should save and get city', () => {
            storageService.saveCity('Moscow');
            expect(storageService.getCity()).toBe('Moscow');
        });

        test('should save null for empty city', () => {
            storageService.saveCity('');
            expect(storageService.getCity()).toBeNull();
        });

        test('should save null for whitespace city', () => {
            storageService.saveCity('   ');
            expect(storageService.getCity()).toBeNull();
        });

        test('should trim city name', () => {
            storageService.saveCity('  London  ');
            expect(storageService.getCity()).toBe('London');
        });
    });

    describe('addToHistory', () => {
        test('should add city to history', () => {
            storageService.addToHistory('Moscow');
            const history = storageService.getHistory();
            expect(history).toHaveLength(1);
            expect(history[0].city).toBe('Moscow');
        });

        test('should add city to beginning of history', () => {
            storageService.addToHistory('Moscow');
            storageService.addToHistory('London');
            const history = storageService.getHistory();
            expect(history[0].city).toBe('London');
            expect(history[1].city).toBe('Moscow');
        });

        test('should limit history to 10 items', () => {
            for (let i = 0; i < 15; i++) {
                storageService.addToHistory(`City${i}`);
            }
            const history = storageService.getHistory();
            expect(history).toHaveLength(10);
            expect(history[0].city).toBe('City14');
        });

        test('should emit historyUpdated event', () => {
            storageService.addToHistory('Moscow');
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::historyUpdated', expect.any(Array));
        });

        test('should initialize searchHistory array if not exists', () => {
            storageService.data.searchHistory = null;
            storageService.addToHistory('Moscow');
            expect(storageService.data.searchHistory).toBeDefined();
            expect(storageService.getHistory()).toHaveLength(1);
        });
    });

    describe('getHistory', () => {

        test('should return copy of history', () => {
            storageService.addToHistory('Moscow');
            const history1 = storageService.getHistory();
            const history2 = storageService.getHistory();
            expect(history1).toEqual(history2);
            expect(history1).not.toBe(history2);
        });

        test('should return empty array if searchHistory is null', () => {
            storageService.data.searchHistory = null;
            expect(storageService.getHistory()).toEqual([]);
        });
    });

    describe('removeFromHistory', () => {
        beforeEach(() => {
            storageService.addToHistory('Moscow');
            storageService.addToHistory('London');
            storageService.addToHistory('Paris');
        });

        test('should remove city from history', () => {
            storageService.removeFromHistory('London');
            const history = storageService.getHistory();
            expect(history).toHaveLength(2);
            expect(history.find(item => item.city === 'London')).toBeUndefined();
        });

        test('should emit historyUpdated event', () => {
            storageService.removeFromHistory('London');
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::historyUpdated', expect.any(Array));
        });

        test('should do nothing for non-existent city', () => {
            storageService.removeFromHistory('Berlin');
            expect(storageService.getHistory()).toHaveLength(3);
        });

        test('should do nothing if city is empty', () => {
            storageService.removeFromHistory('');
            expect(storageService.getHistory()).toHaveLength(3);
        });

        test('should do nothing if searchHistory is null', () => {
            storageService.data.searchHistory = null;
            storageService.removeFromHistory('Moscow');
            expect(storageService.data.searchHistory).toBeNull();
        });
    });

    describe('clearHistory', () => {
        beforeEach(() => {
            storageService.addToHistory('Moscow');
            storageService.addToHistory('London');
        });

        test('should clear all history', () => {
            storageService.clearHistory();
            expect(storageService.getHistory()).toHaveLength(0);
        });

        test('should emit historyCleared and historyUpdated events', () => {
            storageService.clearHistory();
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::historyCleared');
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::historyUpdated', []);
        });
    });

    describe('getLastSearch', () => {
        test('should return last searched city', () => {
            storageService.addToHistory('Moscow');
            storageService.addToHistory('London');
            expect(storageService.getLastSearch().city).toBe('London');
        });

        test('should return null if searchHistory is empty', () => {
            storageService.data.searchHistory = [];
            expect(storageService.getLastSearch()).toBeNull();
        });
    });

    describe('EventBus bindings', () => {
        test('should handle StorageService::saveCity event', () => {
            const handler = EventBus.on.mock.calls.find(call => call[0] === 'StorageService::saveCity')[1];
            handler('Moscow');
            expect(storageService.getCity()).toBe('Moscow');
        });

        test('should handle StorageService::getCity event with callback', () => {
            storageService.saveCity('Moscow');
            const handler = EventBus.on.mock.calls.find(call => call[0] === 'StorageService::getCity')[1];
            const callback = jest.fn();
            handler(null, callback);
            expect(callback).toHaveBeenCalledWith('Moscow');
        });

        test('should handle StorageService::getHistory event with callback', () => {
            storageService.addToHistory('Moscow');
            const handler = EventBus.on.mock.calls.find(call => call[0] === 'StorageService::getHistory')[1];
            const callback = jest.fn();
            handler(callback);
            expect(callback).toHaveBeenCalledWith(expect.any(Array));
        });

        test('should handle StorageService::getHistory event without callback', () => {
            storageService.addToHistory('Moscow');
            const handler = EventBus.on.mock.calls.find(call => call[0] === 'StorageService::getHistory')[1];
            handler(null);
            expect(EventBus.emit).toHaveBeenCalledWith('StorageService::historyRetrieved', expect.any(Array));
        });

        test('should handle StorageService::clearHistory event', () => {
            storageService.addToHistory('Moscow');
            const handler = EventBus.on.mock.calls.find(call => call[0] === 'StorageService::clearHistory')[1];
            handler();
            expect(storageService.getHistory()).toHaveLength(0);
        });

        test('should handle StorageService::removeFromHistory event', () => {
            storageService.addToHistory('Moscow');
            storageService.addToHistory('London');
            const handler = EventBus.on.mock.calls.find(call => call[0] === 'StorageService::removeFromHistory')[1];
            handler('Moscow');
            expect(storageService.getHistory()).toHaveLength(1);
            expect(storageService.getHistory()[0].city).toBe('London');
        });
    });

    describe('localStorage persistence', () => {
        test('should load data from localStorage on init', () => {
            const savedData = JSON.stringify({ city: 'Moscow', searchHistory: [{ city: 'Moscow', timestamp: 123 }] });
            mockStorage['weather_app_data'] = savedData;
            
            const newService = new StorageService();
            expect(newService.getCity()).toBe('Moscow');
            expect(newService.getHistory()).toHaveLength(1);
        });
    });
});