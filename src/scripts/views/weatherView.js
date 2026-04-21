import { MainWindow } from './components/mainWindow.js';
import { TodayCards } from './components/todayCards.js';
import { ForecastList } from './components/forecastList.js';
import { DetailInfo } from './components/detailInfo.js';

export class WeatherView {
    #mainWindow;
    #todayCards;
    #forecastList;
    #detailInfo;
    #container;

    constructor() {
        this.#mainWindow = new MainWindow();
        this.#todayCards = new TodayCards();
        this.#forecastList = new ForecastList();
        this.#detailInfo = new DetailInfo();
        this.#container = null;
    }

    render(parentElement) {
        this.#container = this.#mainWindow.render(parentElement);
    }

    #clearContainer() {
        if (this.#container) {
            this.#container.replaceChildren();
        }
    }

    #showLoading() {
        if (this.#container) {
            this.#container.innerHTML = '<div class="loading-indicator">Загрузка...</div>';
        }
    }


    updateWeather(model) {
        if (!this.#container) return;

        this.#clearContainer();

        if (model.isLoading()) {
            this.#showLoading();
            return;
        }

        if (model.hasError()) {
            this.#mainWindow.showError(model.getError());
            return;
        }

        this.#renderTodayForecast(model);
        this.#renderCurrentWeather(model);
        this.#renderNextDaysForecast(model);
    }

    #renderTodayForecast(model) {
        const todayData = model.getTodayForecast();
        if (todayData.length > 0) {
            this.#todayCards.render(this.#container, todayData);
        }
    }

    #renderCurrentWeather(model) {
        const currentWeather = model.getCurrentWeather();
        if (currentWeather) {
            this.#detailInfo.render(this.#container, currentWeather);
        }
    }

    #renderNextDaysForecast(model) {
        const forecastData = model.getNextDaysForecast();
        if (forecastData.length > 0) {
            this.#forecastList.render(this.#container, forecastData);
        }
    }

    setPageTitle(city) {
        if (!city) {
            document.title = "Прогноз погоды";
        }
        else {

            document.title = `Погода в ${city}`;
        }
    }

    setCity(city) {
        this.setPageTitle(city);
        this.#mainWindow.setCityValue(city);
    }

    getCity() {
        return this.#mainWindow.getCityValue();
    }


    showError(message) {
        this.#mainWindow.showError(message);
    }

    setLoading(isLoading) {
        this.#mainWindow.setLoading(isLoading);
    }

    bindCityInput(handler) {
        this.#mainWindow.bindCityInput(handler);
    }

    bindFindMeButton(handler) {
        this.#mainWindow.bindFindMeButton(handler);
    }
}