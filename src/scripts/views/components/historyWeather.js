import { HistoryWeatherItem } from './historyWeatherItem.js';
import eventBus from "../../utils/eventBus";

export class HistoryWeather {
    #container;
    #historyContainer;
    #historyItems = [];

    constructor() {
        this.#historyItems = [];
        this.#bindEvents();
    }

    #bindEvents() {
        eventBus.on("HistoryWeather::citySelected", (city) => {
            this.#onCitySelected(city);
        });
    }

    #onCitySelected(city) {
        eventBus.emit("WeatherController::cityChanged", city);
        this.#highlightSelectedCity(city);
    }

    #highlightSelectedCity(selectedCity) {
        this.#historyItems.forEach(item => {
            const card = item.getContainer();
            if (card) {
                if (item.getCity() === selectedCity) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            }
        });
    }

    render(parentElement) {
        this.#container = document.createElement('div');
        this.#container.className = 'history-weather';
        
        const title = document.createElement('h2');
        title.className = 'history-title';
        title.textContent = 'История поиска';
        this.#container.appendChild(title);
        
        this.#historyContainer = document.createElement('div');
        this.#historyContainer.className = 'history-cities-list';
        this.#container.appendChild(this.#historyContainer);
        
        parentElement.appendChild(this.#container);
    }

    updateHistory(history) {
        this.#clearHistoryContainer();
        
        if (!history || history.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-history-message';
            emptyMessage.textContent = 'История поиска пуста';
            this.#historyContainer.appendChild(emptyMessage);
            return;
        }
        
        history.forEach(item => {
            const historyItem = new HistoryWeatherItem(item);
            const itemElement = historyItem.render();
            this.#historyContainer.appendChild(itemElement);
            this.#historyItems.push(historyItem);
            this.#fetchWeatherForCity(item.city, historyItem);
        });
    }

    #clearHistoryContainer() {
        this.#historyItems = [];
        while (this.#historyContainer.firstChild) {
            this.#historyContainer.removeChild(this.#historyContainer.firstChild);
        }
    }

    async #fetchWeatherForCity(city, historyItem) {
        const handler = (receivedCity, weatherData) => {
            if (receivedCity === city) {
                if (weatherData && weatherData.list && weatherData.list.length > 0) {
                    historyItem.updateWeather(weatherData);
                } else {
                    historyItem.hide();
                }
                eventBus.off("WeatherService::historyDataReceived", handler);
            }
        };
        
        const errorHandler = (errorCity) => {
            if (errorCity === city) {
                historyItem.hide();
                eventBus.off("WeatherService::historyError", errorHandler);
            }
        };
        
        eventBus.on("WeatherService::historyDataReceived", handler);
        eventBus.on("WeatherService::historyError", errorHandler);
        eventBus.emit("WeatherService::fetchHistoryWeather", city);
        
        setTimeout(() => {
            eventBus.off("WeatherService::historyDataReceived", handler);
            eventBus.off("WeatherService::historyError", errorHandler);
        }, 10000);
    }

    updateCityWeather(city, weatherData) {
        const historyItem = this.#historyItems.find(item => item.getCity() === city);
        if (historyItem) {
            historyItem.updateWeather(weatherData);
        }
    }
}