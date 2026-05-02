import eventBus from "../utils/eventBus";
import { TodayCards } from './components/todayCards';
import { ForecastList } from './components/forecastList';
import { DetailInfo } from './components/detailInfo';
import { HistoryWeather } from './components/historyWeather';
import { ForecastData, isForecastDataArray } from "../../types/forecast";
import { isWeatherModelSnapshot, WeatherModelSnapshot } from "../../types/weathermodelsnapshot";
import { isStorageData } from "../../types/storagedata";

export class WeatherView {
    #todayCards;
    #forecastList;
    #detailInfo;
    #historyWeather;
    #cityInput: HTMLInputElement;
    #findMeButton: HTMLButtonElement;
    #aboutButton: HTMLButtonElement;
    #errorMessage: HTMLDivElement;
    #weatherContainer: HTMLDivElement;

    constructor() {
        this.#todayCards = new TodayCards();
        this.#forecastList = new ForecastList();
        this.#detailInfo = new DetailInfo();
        this.#historyWeather = new HistoryWeather();
        this.#cityInput = document.createElement('input');
        this.#findMeButton = document.createElement('button');
        this.#aboutButton = document.createElement('button');
        this.#errorMessage = document.createElement('div');
        this.#weatherContainer = document.createElement('div');

        this.#bindEvents();
    }

    #bindEvents() {
        eventBus.on("WeatherView::setCity", (city) => {
            if (typeof city != 'string')
                return;

            this.setCity(city);
        });

        eventBus.on("WeatherView::setLoading", (isLoading) => {
            if (typeof isLoading != 'boolean')
                return;
            this.setLoading(isLoading);
        });

        eventBus.on("WeatherView::updateWeather", (snapshot) => {
            if (!isWeatherModelSnapshot(snapshot))
                return;

            this.updateWeatherFromSnapshot(snapshot);
        });

        eventBus.on("WeatherView::showError", (error) => {
            if (typeof (error) != "string")
                return;
            this.showError(error);
        });

        eventBus.on("StorageService::historyUpdated", (history) => {
            if (!isStorageData(history))
                return;
            this.#historyWeather.updateHistory(history);
        });

        eventBus.on("WeatherView::historyWeatherReceived", (weatherData) => {
            if (!isForecastDataArray(weatherData))
                return;
            this.#historyWeather.updateCityWeather(weatherData);
        });
    }

    render(parentElement: HTMLElement) {
        const container = document.createElement('div');
        container.className = 'weather-card';

        const cityHeader = document.createElement('div');
        cityHeader.className = 'city-header';


        this.#cityInput.className = 'city-input';
        this.#cityInput.placeholder = 'Введите город...';

        this.#findMeButton.className = 'find-me-button';
        this.#findMeButton.title = 'Определить мое местоположение';
        this.#findMeButton.textContent = '📍';

        this.#aboutButton.className = 'find-me-button';
        this.#aboutButton.title = 'О приложении';
        this.#aboutButton.textContent = 'ℹ️';

        cityHeader.appendChild(this.#cityInput);
        cityHeader.appendChild(this.#findMeButton);
        cityHeader.appendChild(this.#aboutButton);
        container.appendChild(cityHeader);


        this.#errorMessage.className = 'error-message';
        container.appendChild(this.#errorMessage);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper';

        const mainContainer = document.createElement('div');
        mainContainer.className = 'weather-main';

        const sidebarContainer = document.createElement('div');
        sidebarContainer.className = 'weather-sidebar';

        this.#weatherContainer.className = 'main-content';
        mainContainer.appendChild(this.#weatherContainer);

        this.#historyWeather.render(sidebarContainer);

        contentWrapper.appendChild(mainContainer);
        contentWrapper.appendChild(sidebarContainer);
        container.appendChild(contentWrapper);

        parentElement.replaceChildren(container);
        return container;
    }

    updateWeatherFromSnapshot(snapshot: WeatherModelSnapshot) {
        if (!this.#weatherContainer) return;

        this.#weatherContainer.replaceChildren();

        if (snapshot.loading) {
            const loadingElement = document.createElement('div');
            loadingElement.className = 'loading-indicator';
            loadingElement.textContent = 'Загрузка...';
            this.#weatherContainer.appendChild(loadingElement);
            return;
        }

        if (snapshot.hasError) {
            this.showError(snapshot.error);
            return;
        }

        this.#renderTodayForecast(snapshot.todayForecast);
        if (snapshot.currentWeather != null)
            this.#renderCurrentWeather(snapshot.currentWeather);
        this.#renderNextDaysForecast(snapshot.nextDaysForecast);
    }

    #renderTodayForecast(todayForecast: ForecastData[]) {
        if (todayForecast && todayForecast.length > 0) {
            this.#todayCards.render(this.#weatherContainer, todayForecast);
        }
    }

    #renderCurrentWeather(currentWeather: ForecastData) {
        if (currentWeather) {
            this.#detailInfo.render(this.#weatherContainer, currentWeather);
        }
    }

    #renderNextDaysForecast(nextDaysForecast: ForecastData[]) {
        if (nextDaysForecast && nextDaysForecast.length > 0) {
            this.#forecastList.render(this.#weatherContainer, nextDaysForecast);
        }
    }

    setCity(city: string) {
        if (this.#cityInput) {
            this.#cityInput.value = city || '';
        }
        this.setPageTitle(city);
    }

    setPageTitle(city: string) {
        if (city && city.trim() !== '') {
            document.title = `Погода в ${city.trim()}`;
        } else {
            document.title = 'Прогноз погоды';
        }
    }

    getCity() {
        return this.#cityInput ? this.#cityInput.value : '';
    }

    setLoading(isLoading: boolean) {
        if (this.#findMeButton) {
            if (isLoading) {
                this.#findMeButton.classList.add('loading');
                this.#findMeButton.disabled = true;
                this.#findMeButton.textContent = '⏳';
            } else {
                this.#findMeButton.classList.remove('loading');
                this.#findMeButton.disabled = false;
                this.#findMeButton.textContent = '📍';
            }
        }
    }

    showError(message: string | null) {
        if (this.#errorMessage) {
            this.#errorMessage.textContent = message;
            this.#errorMessage.style.display = 'block';

            setTimeout(() => {
                if (this.#errorMessage) {
                    this.#errorMessage.style.display = 'none';
                }
            }, 5000);
        }
    }

    bindCityInput(handler: (event: Event) => void) {
        if (this.#cityInput) {
            this.#cityInput.addEventListener('input', handler);
        }
    }

    bindFindMeButton(handler: () => void) {
        if (this.#findMeButton) {
            this.#findMeButton.addEventListener('click', handler);
        }
    }

    bindAboutButton(handler: () => void) {
        if (this.#aboutButton) {
            this.#aboutButton.addEventListener('click', handler);
        }
    }

    getWeatherContainer() {
        return this.#weatherContainer;
    }
}