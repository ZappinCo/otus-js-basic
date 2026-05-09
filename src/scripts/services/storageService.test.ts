
import { StorageService } from './storageService';
import eventBus from '../utils/eventBus';

jest.mock('../utils/eventBus');

describe('StorageService', () => {
    let storageService: StorageService;
    let mockStorage: Record<string, string>;
    let mockEmit: jest.Mock;

    const getHandler = (eventName: string) => {
        const call = (eventBus.on as jest.Mock).mock.calls.find(
            (call: any[]) => call[0] === eventName
        );
        if (!call) throw new Error(`Handler for ${eventName} not found`);
        return call[1];
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockEmit = eventBus.emit as jest.Mock;
        mockStorage = {};

        global.localStorage = {
            getItem: jest.fn((key: string) => mockStorage[key] || null),
            setItem: jest.fn((key: string, value: string) => { mockStorage[key] = value; }),
            removeItem: jest.fn((key: string) => { delete mockStorage[key]; }),
            clear: jest.fn(() => { mockStorage = {}; })
        } as any;

        storageService = new StorageService();
    });

    describe('saveCity and getCity', () => {
        test('should save and get city', () => {
            storageService.saveCity('Moscow');
            expect(storageService.getCity()).toBe('Moscow');
        });

        test('should save empty string for empty city', () => {
            storageService.saveCity('');
            expect(storageService.getCity()).toBe('');
        });

        test('should save empty string for whitespace city', () => {
            storageService.saveCity('   ');
            expect(storageService.getCity()).toBe('');
        });

        test('should trim city name', () => {
            storageService.saveCity('  London  ');
            expect(storageService.getCity()).toBe('London');
        });
    });

    describe('addToHistory', () => {
        test('should add city to history', () => {
            storageService.addToHistory('Moscow');
            const history = (storageService as any).data.searchHistory;
            expect(history).toHaveLength(1);
            expect(history[0]).toBe('Moscow');
        });

        test('should add city to beginning of history', () => {
            storageService.addToHistory('Moscow');
            storageService.addToHistory('London');
            const history = (storageService as any).data.searchHistory;
            expect(history[0]).toBe('London');
            expect(history[1]).toBe('Moscow');
        });

        test('should limit history to 10 items', () => {
            for (let i = 0; i < 15; i++) {
                storageService.addToHistory(`City${i}`);
            }
            const history = (storageService as any).data.searchHistory;
            expect(history).toHaveLength(10);
            expect(history[0]).toBe('City14');
        });

        test('should emit historyUpdated event', () => {
            storageService.addToHistory('Moscow');
            expect(mockEmit).toHaveBeenCalledWith('StorageService::historyUpdated', expect.any(Object));
        });
    });

    describe('removeFromHistory', () => {
        beforeEach(() => {
            storageService.clearHistory();
            storageService.addToHistory('Moscow');
            storageService.addToHistory('London');
            storageService.addToHistory('Paris');
        });

        test('should remove city from history', () => {
            storageService.removeFromHistory('London');
            const history = (storageService as any).data.searchHistory;
            expect(history).toHaveLength(2);
            expect(history.find((item: string) => item === 'London')).toBeUndefined();
        });

        test('should emit historyUpdated event', () => {
            storageService.removeFromHistory('London');
            expect(mockEmit).toHaveBeenCalledWith('StorageService::historyUpdated', expect.any(Object));
        });

        test('should do nothing for non-existent city', () => {
            storageService.removeFromHistory('Berlin');
            const history = (storageService as any).data.searchHistory;
            expect(history).toHaveLength(3);
        });
    });

    describe('clearHistory', () => {
        beforeEach(() => {
            storageService.clearHistory();
            storageService.addToHistory('Moscow');
            storageService.addToHistory('London');
        });

        test('should clear all history', () => {
            storageService.clearHistory();
            const history = (storageService as any).data.searchHistory;
            expect(history).toHaveLength(0);
        });

        test('should emit historyCleared and historyUpdated events', () => {
            storageService.clearHistory();
            expect(mockEmit).toHaveBeenCalledWith('StorageService::historyCleared');
            expect(mockEmit).toHaveBeenCalledWith('StorageService::historyUpdated', []);
        });
    });

    describe('getLastSearch', () => {
        test('should return last searched city', () => {
            storageService.clearHistory();
            storageService.addToHistory('Moscow');
            storageService.addToHistory('London');
            expect(storageService.getLastSearch()).toBe('London');
        });

        test('should return null if searchHistory is empty', () => {
            storageService.clearHistory();
            expect(storageService.getLastSearch()).toBeNull();
        });
    });

    describe('eventBus bindings', () => {
        test('should handle StorageService::saveCity event', () => {
            const handler = getHandler('StorageService::saveCity');
            handler('Moscow');
            expect(storageService.getCity()).toBe('Moscow');
        });

        test('should handle StorageService::getCity event', () => {
            storageService.saveCity('Moscow');
            const handler = getHandler('StorageService::getCity');
            handler();
            expect(mockEmit).toHaveBeenCalledWith('StorageService::setCity', 'Moscow');
        });

        test('should handle StorageService::addToHistory event', () => {
            storageService.clearHistory();
            const handler = getHandler('StorageService::addToHistory');
            handler('Moscow');
            const history = (storageService as any).data.searchHistory;
            expect(history).toHaveLength(1);
            expect(history[0]).toBe('Moscow');
        });

        test('should handle StorageService::getHistory event', () => {
            storageService.addToHistory('Moscow');
            const handler = getHandler('StorageService::getHistory');
            handler();
            expect(mockEmit).toHaveBeenCalledWith('StorageService::historyUpdated', expect.any(Object));
        });

        test('should handle StorageService::clearHistory event', () => {
            storageService.addToHistory('Moscow');
            const handler = getHandler('StorageService::clearHistory');
            handler();
            const history = (storageService as any).data.searchHistory;
            expect(history).toHaveLength(0);
        });

        test('should handle StorageService::removeFromHistory event', () => {
            storageService.clearHistory();
            storageService.addToHistory('Moscow');
            storageService.addToHistory('London');
            const handler = getHandler('StorageService::removeFromHistory');
            handler('Moscow');
            const history = (storageService as any).data.searchHistory;
            expect(history).toHaveLength(1);
            expect(history[0]).toBe('London');
        });
    });

    describe('additional branch coverage', () => {
        test('should handle addToHistory with whitespace only', () => {
            storageService.clearHistory();
            storageService.addToHistory('   ');
            const history = (storageService as any).data.searchHistory;
            expect(history).toHaveLength(0);
        });

        test('should handle removeFromHistory with non-existent history array', () => {
            (storageService as any).data.searchHistory = null;
            storageService.removeFromHistory('Moscow');
            expect((storageService as any).data.searchHistory).toBeNull();
        });

        test('should handle clearHistory with empty history', () => {
            storageService.clearHistory();
            storageService.clearHistory()
            const history = (storageService as any).data.searchHistory;
            expect(history).toHaveLength(0);
        });
    });
});