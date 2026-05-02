import eventBus from "../utils/eventBus";
import router from "../utils/router";
export class WeatherController {
    #weatherView;
    #debounceTimer = null;

    constructor(weatherView) {
        this.#weatherView = weatherView;
        this.#bindEvents();
    }

    async initialize() {
        eventBus.emit("StorageService::getCity", null, (savedCity) => {
            if (savedCity) {
                this.#updateCity(savedCity);
            } else {
                this.#loadWeatherByIp();
            }
        });
        
        eventBus.emit("StorageService::getHistory", (history) => {
            if (history && history.length > 0) {
                this.#loadHistoryWeather(history);
            }
        });
    }

    #bindEvents() {
        this.#weatherView.bindCityInput((event) => this.#onCityInputWithDebounce(event));
        this.#weatherView.bindFindMeButton(() => this.#onFindMeClick());
        this.#weatherView.bindAboutButton(() => this.#onAboutPageClick());
        
        eventBus.on("WeatherController::cityChanged", (city) => {
            this.#updateCity(city);
        });
        
        eventBus.on("WeatherModel::modelChanged", (snapshot) => {
            eventBus.emit("WeatherView::updateWeather", snapshot);
            
            if (!snapshot.loading && !snapshot.hasError && snapshot.city) {
                eventBus.emit("WeatherView::setCity", snapshot.city);
            }
        });
        
        eventBus.on("WeatherService::dataReceived", (weatherData) => {
            this.#handleWeatherData(weatherData);
        });
        
        eventBus.on("WeatherService::error", (error) => {
            eventBus.emit("WeatherModel::setError", error.message || 'Ошибка загрузки погоды');
            eventBus.emit("WeatherView::setLoading", false);
        });
        
        eventBus.on("WeatherService::historyDataReceived", (city, weatherData) => {
            eventBus.emit("WeatherView::historyWeatherReceived", city, weatherData);
        });
        
        eventBus.on("LocationService::cityDetected", (city) => {
            this.#updateCity(city);
        });
        
        eventBus.on("LocationService::error", (error) => {
            console.error('Location error:', error);
            eventBus.emit("WeatherModel::setError", 'Не удалось определить местоположение');
            eventBus.emit("WeatherView::setLoading", false);
        });
        
        eventBus.on("LocationService::userLocationReceived", (position) => {
            eventBus.emit("WeatherService::fetchByLocation", 
                position.coords.latitude,
                position.coords.longitude
            );
        });
        
        eventBus.on("StorageService::historyUpdated", (history) => {
            this.#loadHistoryWeather(history);
        });
    }

    #updateCity(city) {
        if (!city || city.trim() === '') return;
        eventBus.emit("StorageService::saveCity", city);
        eventBus.emit("WeatherView::setCity", city);
        eventBus.emit("WeatherService::fetchByCity", city);
        router.navigateTo('/city/'+city,false);
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

    #onAboutPageClick(){
        router.navigateTo('/about');
    }

    #onFindMeClick() {
        eventBus.emit("WeatherModel::getSnapshot", (snapshot) => {
            if (snapshot.loading) return;
            
            eventBus.emit("WeatherModel::setLoading", true);
            eventBus.emit("WeatherView::setLoading", true);
            eventBus.emit("LocationService::getUserLocation");
        });
    }

    #loadWeatherByIp() {
        eventBus.emit("WeatherModel::setLoading", true);
        eventBus.emit("WeatherView::setLoading", true);
        eventBus.emit("LocationService::getCityByIp");
    }

    #handleWeatherData(weatherData) {
        if (weatherData && weatherData.city) {
            const cityName = weatherData.city.name;
                        
            eventBus.emit("StorageService::saveCity", cityName);
            eventBus.emit("StorageService::addToHistory", cityName);
            eventBus.emit("WeatherView::setCity", cityName);
            eventBus.emit("WeatherModel::setWeatherData", weatherData);
        } else if (weatherData && weatherData.list && weatherData.list.length > 0) {
            eventBus.emit("WeatherModel::setWeatherData", weatherData);
        } else {
            eventBus.emit("WeatherModel::setError", 'Не удалось получить данные о погоде');
        }
        
        eventBus.emit("WeatherView::setLoading", false);
    }

    #loadHistoryWeather(history) {
        if (!history || history.length === 0) return;
        
        history.forEach(item => {
            eventBus.emit("WeatherService::fetchHistoryWeather", item.city);
        });
    }
}