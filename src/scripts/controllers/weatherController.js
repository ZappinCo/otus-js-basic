import EventBus from "../utils/eventBus";

export class WeatherController {
    #weatherView;
    #debounceTimer = null;

    constructor(weatherView) {
        this.#weatherView = weatherView;
        this.#bindEvents();
    }

    async initialize() {
        EventBus.emit("StorageService::getCity", null, (savedCity) => {
            if (savedCity) {
                this.#updateCity(savedCity);
            } else {
                this.#loadWeatherByIp();
            }
        });
        
        EventBus.emit("StorageService::getHistory", (history) => {
            if (history && history.length > 0) {
                this.#loadHistoryWeather(history);
            }
        });
    }

    #bindEvents() {
        this.#weatherView.bindCityInput((event) => this.#onCityInputWithDebounce(event));
        this.#weatherView.bindFindMeButton(() => this.#onFindMeClick());
        
        EventBus.on("WeatherController::cityChanged", (city) => {
            this.#updateCity(city);
        });
        
        EventBus.on("WeatherModel::modelChanged", (snapshot) => {
            EventBus.emit("WeatherView::updateWeather", snapshot);
            
            if (!snapshot.loading && !snapshot.hasError && snapshot.city) {
                EventBus.emit("WeatherView::setCity", snapshot.city);
            }
        });
        
        EventBus.on("WeatherService::dataReceived", (weatherData) => {
            this.#handleWeatherData(weatherData);
        });
        
        EventBus.on("WeatherService::error", (error) => {
            EventBus.emit("WeatherModel::setError", error.message || 'Ошибка загрузки погоды');
            EventBus.emit("WeatherView::setLoading", false);
        });
        
        EventBus.on("WeatherService::historyDataReceived", (city, weatherData) => {
            EventBus.emit("WeatherView::historyWeatherReceived", city, weatherData);
        });
        
        EventBus.on("LocationService::cityDetected", (city) => {
            this.#updateCity(city);
        });
        
        EventBus.on("LocationService::error", (error) => {
            console.error('Location error:', error);
            EventBus.emit("WeatherModel::setError", 'Не удалось определить местоположение');
            EventBus.emit("WeatherView::setLoading", false);
        });
        
        EventBus.on("LocationService::userLocationReceived", (position) => {
            EventBus.emit("WeatherService::fetchByLocation", 
                position.coords.latitude,
                position.coords.longitude
            );
        });
        
        EventBus.on("StorageService::historyUpdated", (history) => {
            this.#loadHistoryWeather(history);
        });
    }

    #updateCity(city) {
        if (!city || city.trim() === '') return;
                
        EventBus.emit("StorageService::saveCity", city);
        EventBus.emit("WeatherView::setCity", city);
        EventBus.emit("WeatherService::fetchByCity", city);
    }

    #onCityInputWithDebounce(event) {
        if (this.#debounceTimer) {
            clearTimeout(this.#debounceTimer);
        }
        
        this.#debounceTimer = setTimeout(() => {
            this.#onCityInput(event);
        }, 500);
    }

    #onCityInput(event) {
        const city = event.target.value;
        
        if (!city || city.trim() === '') {
            return;
        }

        this.#updateCity(city);
    }

    #onFindMeClick() {
        EventBus.emit("WeatherModel::getSnapshot", (snapshot) => {
            if (snapshot.loading) return;
            
            EventBus.emit("WeatherModel::setLoading", true);
            EventBus.emit("WeatherView::setLoading", true);
            EventBus.emit("LocationService::getUserLocation");
        });
    }

    #loadWeatherByIp() {
        EventBus.emit("WeatherModel::setLoading", true);
        EventBus.emit("WeatherView::setLoading", true);
        EventBus.emit("LocationService::getCityByIp");
    }

    #handleWeatherData(weatherData) {
        if (weatherData && weatherData.city) {
            const cityName = weatherData.city.name;
                        
            EventBus.emit("StorageService::saveCity", cityName);
            EventBus.emit("StorageService::addToHistory", cityName);
            EventBus.emit("WeatherView::setCity", cityName);
            EventBus.emit("WeatherModel::setWeatherData", weatherData);
        } else if (weatherData && weatherData.list && weatherData.list.length > 0) {
            EventBus.emit("WeatherModel::setWeatherData", weatherData);
        } else {
            EventBus.emit("WeatherModel::setError", 'Не удалось получить данные о погоде');
        }
        
        EventBus.emit("WeatherView::setLoading", false);
    }

    #loadHistoryWeather(history) {
        if (!history || history.length === 0) return;
        
        history.forEach(item => {
            EventBus.emit("WeatherService::fetchHistoryWeather", item.city);
        });
    }
}