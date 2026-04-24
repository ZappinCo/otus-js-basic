import EventBus from "../utils/eventBus";
import { TodayCards } from './components/todayCards.js';
import { ForecastList } from './components/forecastList.js';
import { DetailInfo } from './components/detailInfo.js';
import { HistoryWeather } from './components/historyWeather.js';

export class WeatherView {
    #todayCards;
    #forecastList;
    #detailInfo;
    #historyWeather;
    #container;
    #contentWrapper;
    #mainContainer;
    #sidebarContainer;
    #weatherContainer;
    #cityInput;
    #findMeButton;
    #errorMessage;

    constructor() {
        this.#todayCards = new TodayCards();
        this.#forecastList = new ForecastList();
        this.#detailInfo = new DetailInfo();
        this.#historyWeather = new HistoryWeather();
        this.#container = null;
        this.#contentWrapper = null;
        this.#mainContainer = null;
        this.#sidebarContainer = null;
        this.#weatherContainer = null;
        this.#cityInput = null;
        this.#findMeButton = null;
        this.#errorMessage = null;
        this.#bindEvents();
    }

    #bindEvents() {
        EventBus.on("WeatherView::setCity", (city) => {
            this.setCity(city);
        });

        EventBus.on("WeatherView::setLoading", (isLoading) => {
            this.setLoading(isLoading);
        });

        EventBus.on("WeatherView::updateWeather", (snapshot) => {
            this.updateWeatherFromSnapshot(snapshot);
        });

        EventBus.on("WeatherView::showError", (error) => {
            this.showError(error);
        });
        
        EventBus.on("StorageService::historyUpdated", (history) => {
            this.#historyWeather.updateHistory(history);
        });
        
        EventBus.on("WeatherView::historyWeatherReceived", (city, weatherData) => {
            this.#historyWeather.updateCityWeather(city, weatherData);
        });
    }

    render(parentElement) {
        this.#container = document.createElement('div');
        this.#container.className = 'weather-card';
        
        const cityHeader = document.createElement('div');
        cityHeader.className = 'city-header';
        
        this.#cityInput = document.createElement('input');
        this.#cityInput.className = 'city-input';
        this.#cityInput.placeholder = 'Введите город...';
        
        this.#findMeButton = document.createElement('button');
        this.#findMeButton.className = 'find-me-button';
        this.#findMeButton.title = 'Определить мое местоположение';
        this.#findMeButton.textContent = '📍';
        
        cityHeader.appendChild(this.#cityInput);
        cityHeader.appendChild(this.#findMeButton);
        this.#container.appendChild(cityHeader);
        
        this.#errorMessage = document.createElement('div');
        this.#errorMessage.className = 'error-message';
        this.#container.appendChild(this.#errorMessage);
        
        this.#contentWrapper = document.createElement('div');
        this.#contentWrapper.className = 'content-wrapper';
        
        this.#mainContainer = document.createElement('div');
        this.#mainContainer.className = 'weather-main';
        
        this.#sidebarContainer = document.createElement('div');
        this.#sidebarContainer.className = 'weather-sidebar';
        
        this.#weatherContainer = document.createElement('div');
        this.#weatherContainer.className = 'main-content';
        this.#mainContainer.appendChild(this.#weatherContainer);
        
        this.#historyWeather.render(this.#sidebarContainer);
        
        this.#contentWrapper.appendChild(this.#mainContainer);
        this.#contentWrapper.appendChild(this.#sidebarContainer);
        this.#container.appendChild(this.#contentWrapper);
        
        parentElement.appendChild(this.#container);
        
        EventBus.emit("StorageService::getHistory", (history) => {
            this.#historyWeather.updateHistory(history);
            if (history && history.length > 0) {
                history.forEach(item => {
                    EventBus.emit("WeatherService::fetchHistoryWeather", item.city);
                });
            }
        });
    }

    updateWeatherFromSnapshot(snapshot) {
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
        this.#renderCurrentWeather(snapshot.currentWeather);
        this.#renderNextDaysForecast(snapshot.nextDaysForecast);
    }

    #renderTodayForecast(todayForecast) {
        if (todayForecast && todayForecast.length > 0) {
            this.#todayCards.render(this.#weatherContainer, todayForecast);
        }
    }

    #renderCurrentWeather(currentWeather) {
        if (currentWeather) {
            this.#detailInfo.render(this.#weatherContainer, currentWeather);
        }
    }

    #renderNextDaysForecast(nextDaysForecast) {
        if (nextDaysForecast && nextDaysForecast.length > 0) {
            this.#forecastList.render(this.#weatherContainer, nextDaysForecast);
        }
    }

    setCity(city) {
        if (this.#cityInput) {
            this.#cityInput.value = city || '';
        }
        this.setPageTitle(city);
    }

    setPageTitle(city) {
    if (city && city.trim() !== '') {
        document.title = `Погода в ${city.trim()}`;
    } else {
        document.title = 'Прогноз погоды';
    }
}

    getCity() {
        return this.#cityInput ? this.#cityInput.value : '';
    }

    setLoading(isLoading) {
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

    showError(message) {
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

    bindCityInput(handler) {
        if (this.#cityInput) {
            this.#cityInput.addEventListener('input', handler);
        }
    }

    bindFindMeButton(handler) {
        if (this.#findMeButton) {
            this.#findMeButton.addEventListener('click', handler);
        }
    }

    getWeatherContainer() {
        return this.#weatherContainer;
    }
}