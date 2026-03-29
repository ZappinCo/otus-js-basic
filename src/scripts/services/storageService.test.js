import { StorageService } from './storageService.js';

describe('StorageService', () => {
    let storageService;
    let mockLocalStorage;

    beforeEach(() => {
        mockLocalStorage = {
            store: {},
            getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
            setItem: jest.fn((key, value) => {
                mockLocalStorage.store[key] = value;
            })
        };

        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });

        storageService = new StorageService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize with default values', () => {
        expect(storageService.getCity()).toBeNull();
        expect(storageService.prefix).toBe('weather_app');
        expect(storageService.storageKey).toBe('weather_app_data');
    });

    test('should save and get city', () => {
        storageService.saveCity('Moscow');
        expect(storageService.getCity()).toBe('Moscow');
    });

    test('should trim city name', () => {
        storageService.saveCity('  Moscow  ');
        expect(storageService.getCity()).toBe('Moscow');
    });

    test('should save null for empty city', () => {
        storageService.saveCity('');
        expect(storageService.getCity()).toBeNull();
    });

    test('should save null for whitespace only', () => {
        storageService.saveCity('   ');
        expect(storageService.getCity()).toBeNull();
    });

    test('should save null for null', () => {
        storageService.saveCity(null);
        expect(storageService.getCity()).toBeNull();
    });

    test('should load existing data from localStorage', () => {
        mockLocalStorage.store['weather_app_data'] = JSON.stringify({ city: 'Paris' });
        
        const newService = new StorageService();
        expect(newService.getCity()).toBe('Paris');
    });

    test('should handle corrupted localStorage data', () => {
        mockLocalStorage.store['weather_app_data'] = 'invalid json';
        
        const newService = new StorageService();
        expect(newService.getCity()).toBeNull();
    });
});