import eventBus from "../utils/eventBus";
import { StorageData } from "../../types/storagedata";

export class StorageService {
    data: StorageData;
    prefix: string;
    storageKey: string;

    constructor() {
        this.prefix = 'weather_app_ts';
        this.storageKey = `${this.prefix}_data`;
        this.data = this.#loadData();
        this.#bindEvents();
    }

    #bindEvents() {
        eventBus.on("StorageService::saveCity", (city) => {
            if (typeof (city) != "string")
                return;
            this.saveCity(city);
        });

        eventBus.on("StorageService::getCity", () => {
            eventBus.emit("StorageService::setCity", this.getCity());
        });

        eventBus.on("StorageService::addToHistory", (city) => {
            if (typeof (city) != "string")
                return;
            this.addToHistory(city);
        });

        eventBus.on("StorageService::getHistory", () => {
            eventBus.emit("StorageService::historyUpdated", this.data);
        });

        eventBus.on("StorageService::clearHistory", () => {
            this.clearHistory();
        });

        eventBus.on("StorageService::removeFromHistory", (city) => {
            if (typeof (city) != "string")
                return;
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

    saveCity(city: string) {
        if (!city || city.trim() === '') {
            this.data.city = '';
        } else {
            this.data.city = city.trim();
        }
        this.#saveData();
    }

    getCity() {
        return this.data.city;
    }

    addToHistory(city: string) {
        if (!city || city.trim() === '') return;

        const normalizedCity = city.trim();

        if (!this.data.searchHistory) {
            this.data.searchHistory = [];
        }

        this.data.searchHistory = this.data.searchHistory.filter(
            item => item !== normalizedCity
        );

        this.data.searchHistory.unshift(normalizedCity);

        if (this.data.searchHistory.length > 10) {
            this.data.searchHistory = this.data.searchHistory.slice(0, 10);
        }

        this.#saveData();

        eventBus.emit("StorageService::historyUpdated", this.data);
    }

    clearHistory() {
        this.data.searchHistory = [];
        this.#saveData();

        eventBus.emit("StorageService::historyCleared");
        eventBus.emit("StorageService::historyUpdated", []);
    }

    removeFromHistory(city: string) {
        if (!city || !this.data.searchHistory) return;

        const normalizedCity = city.trim();
        this.data.searchHistory = this.data.searchHistory.filter(
            item => item !== normalizedCity
        );

        this.#saveData();

        eventBus.emit("StorageService::historyUpdated", this.data);
    }

    getLastSearch() {
        if (!this.data.searchHistory || this.data.searchHistory.length === 0) {
            return null;
        }
        return this.data.searchHistory[0];
    }
}