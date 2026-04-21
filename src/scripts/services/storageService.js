export class StorageService {
    constructor() {
        this.prefix = 'weather_app';
        this.storageKey = `${this.prefix}_data`;
        this.data = this.#loadData();
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
            city: null
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
}