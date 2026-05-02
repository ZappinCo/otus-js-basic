import eventBus from "../utils/eventBus";

export class StorageService {
    constructor() {
        this.prefix = 'weather_app';
        this.storageKey = `${this.prefix}_data`;
        this.data = this.#loadData();
        this.#bindEvents();
    }

    #bindEvents() {
        eventBus.on("StorageService::saveCity", (city) => {
            this.saveCity(city);
        });

        eventBus.on("StorageService::getCity", (data, callback) => {
            const city = this.getCity();
            if (callback && typeof callback === 'function') {
                callback(city);
            }
        });

        eventBus.on("StorageService::addToHistory", (city) => {
            this.addToHistory(city);
        });

        eventBus.on("StorageService::getHistory", (callback) => {
            const history = this.getHistory();
            if (callback && typeof callback === 'function') {
                callback(history);
            } else {
                eventBus.emit("StorageService::historyRetrieved", history);
            }
        });

        eventBus.on("StorageService::clearHistory", () => {
            this.clearHistory();
        });

        eventBus.on("StorageService::removeFromHistory", (city) => {
            this.removeFromHistory(city);
        });
    }

    #loadData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
        }
        
        return {
            city: null,
            searchHistory: []
        };
    }

    #saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Failed to save data to localStorage:', error);
        }
    }

    saveCity(city) {
        if (!city || city.trim() === '') {
            this.data.city = null;
        } else {
            this.data.city = city.trim();
        }
        this.#saveData();
    }

    getCity() {
        return this.data.city;
    }

    addToHistory(city) {
        if (!city || city.trim() === '') return;
        
        const normalizedCity = city.trim();
        
        if (!this.data.searchHistory) {
            this.data.searchHistory = [];
        }
        
        this.data.searchHistory = this.data.searchHistory.filter(
            item => item.city !== normalizedCity
        );
        
        this.data.searchHistory.unshift({
            city: normalizedCity,
        });
        
        if (this.data.searchHistory.length > 10) {
            this.data.searchHistory = this.data.searchHistory.slice(0, 10);
        }
        
        this.#saveData();
        
        eventBus.emit("StorageService::historyUpdated", this.data.searchHistory);
    }

    getHistory() {
        if (!this.data.searchHistory) {
            return [];
        }
        return [...this.data.searchHistory];
    }

    clearHistory() {
        this.data.searchHistory = [];
        this.#saveData();
        
        eventBus.emit("StorageService::historyCleared");
        eventBus.emit("StorageService::historyUpdated", []);
    }

    removeFromHistory(city) {
        if (!city || !this.data.searchHistory) return;
        
        const normalizedCity = city.trim();
        this.data.searchHistory = this.data.searchHistory.filter(
            item => item.city !== normalizedCity
        );
        
        this.#saveData();
        
        eventBus.emit("StorageService::historyUpdated", this.data.searchHistory);
    }

    getLastSearch() {
        if (!this.data.searchHistory || this.data.searchHistory.length === 0) {
            return null;
        }
        return this.data.searchHistory[0];
    }
}