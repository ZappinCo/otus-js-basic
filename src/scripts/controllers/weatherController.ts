import { ForecastData, isForecastDataArray } from "../../types/forecast";
import eventBus from "../utils/eventBus";
import router from "../utils/router";
import { WeatherView } from "../views/weatherView";
import { isWeatherModelSnapshot } from "../../types/weathermodelsnapshot";
import { isStorageData, StorageData } from "../../types/storagedata";

export class WeatherController {
    #weatherView: WeatherView;
    #debounceTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(weatherView: WeatherView) {
        this.#weatherView = weatherView;
        this.#bindEvents();
    }

    async initialize() {
        eventBus.emit("StorageService::getCity");
        eventBus.emit("StorageService::getHistory");
    }

    #bindEvents() {
        this.#weatherView.bindCityInput((event: Event) => this.#onCityInputWithDebounce(event));
        this.#weatherView.bindFindMeButton(() => this.#onFindMeClick());
        this.#weatherView.bindAboutButton(() => this.#onAboutPageClick());

        eventBus.on("WeatherController::cityChanged", (city) => {
            if (typeof (city) != "string")
                return;

            this.#updateCity(city);
        });

        eventBus.on("WeatherModel::modelChanged", (snapshot) => {
            if (!isWeatherModelSnapshot(snapshot))
                return;

            eventBus.emit("WeatherView::updateWeather", snapshot);

            if (!snapshot.loading && !snapshot.hasError && snapshot.city) {
                eventBus.emit("WeatherView::setCity", snapshot.city);
            }
        });

        eventBus.on("WeatherService::dataReceived", (weatherData) => {
            if (!isForecastDataArray(weatherData))
                return;
            this.#handleWeatherData(weatherData);
        });

        eventBus.on("WeatherService::error", (error) => {
            if (!(error instanceof Error))
                return;

            eventBus.emit("WeatherModel::setError", error.message || 'Ошибка загрузки погоды');
            eventBus.emit("WeatherView::setLoading", false);
        });

        eventBus.on("WeatherService::historyDataReceived", (weatherData) => {
            eventBus.emit("WeatherView::historyWeatherReceived", weatherData);
        });

        eventBus.on("LocationService::cityDetected", (city) => {
            if (typeof (city) != "string")
                return;
            this.#updateCity(city);
        });

        eventBus.on("StorageService::setCity", (savedCity) => {
            if (typeof (savedCity) === "string") {
                this.#updateCity(savedCity);
            } else {
                this.#loadWeatherByIp();
            }
        });

        eventBus.on("LocationService::error", (error) => {
            console.error('Location error:', error);
            eventBus.emit("WeatherModel::setError", 'Не удалось определить местоположение');
            eventBus.emit("WeatherView::setLoading", false);
        });

        eventBus.on("LocationService::userLocationReceived", (position) => {
            eventBus.emit("WeatherService::fetchByLocation", position);
        });

        eventBus.on("StorageService::historyUpdated", (history) => {
            if (!isStorageData(history))
                return;
            this.#loadHistoryWeather(history);
        });
        eventBus.on("WeatherModel::setSnapshot", (snapshot) => {
            if (!isWeatherModelSnapshot(snapshot))
                return;
            if (snapshot.loading) return;

            eventBus.emit("WeatherModel::setLoading", true);
            eventBus.emit("WeatherView::setLoading", true);
            eventBus.emit("LocationService::getUserLocation");
        });

    }

    #updateCity(city: string) {
        if (!city || city.trim() === '') return;
        eventBus.emit("StorageService::saveCity", city);
        eventBus.emit("WeatherView::setCity", city);
        eventBus.emit("WeatherService::fetchByCity", city);
        router.navigateTo('/city/' + city, false);
    }

    #onCityInputWithDebounce(event: Event) {
        if (this.#debounceTimer) {
            clearTimeout(this.#debounceTimer);
        }

        this.#debounceTimer = setTimeout(() => {
            this.#onCityInput(event);
        }, 500);
    }

    #onCityInput(event: Event) {
        if (!event.target || !(event.target instanceof HTMLInputElement)) {
            return;
        }

        const city: string = event.target.value;

        if (!city || city.trim() === '') {
            return;
        }

        this.#updateCity(city);
    }

    #onAboutPageClick() {
        router.navigateTo('/about');
    }

    #onFindMeClick() {
        eventBus.emit("WeatherModel::getSnapshot");
    }

    #loadWeatherByIp() {
        eventBus.emit("WeatherModel::setLoading", true);
        eventBus.emit("WeatherView::setLoading", true);
        eventBus.emit("LocationService::getCityByIp");
    }

    #handleWeatherData(weatherData: ForecastData[]) {
        if (weatherData.length > 0) {
            const cityName = weatherData[0].city;

            eventBus.emit("StorageService::saveCity", cityName);
            eventBus.emit("StorageService::addToHistory", cityName);
            eventBus.emit("WeatherView::setCity", cityName);
            eventBus.emit("WeatherModel::setWeatherData", weatherData);

        } else {
            eventBus.emit("WeatherModel::setError", 'Не удалось получить данные о погоде');
        }

        eventBus.emit("WeatherView::setLoading", false);
    }

    #loadHistoryWeather(history: StorageData) {
        if (!history || history.searchHistory.length === 0) return;

        history.searchHistory.forEach(item => {
            eventBus.emit("WeatherService::fetchHistoryWeather", item);
        });
    }
}