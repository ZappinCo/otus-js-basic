import { HistoryWeatherItem } from './historyWeatherItem';
import eventBus from "../../utils/eventBus";
import { ForecastData, isForecastDataArray } from '../../../types/forecast';
import { StorageData } from '../../../types/storagedata';
import { EventBusHandlerTypes } from '../../utils/eventBus';

export class HistoryWeather {
    #historyContainer: HTMLDivElement;
    #historyItems: HistoryWeatherItem[] = [];

    constructor() {
        this.#historyContainer = document.createElement('div');
        this.#historyContainer.className = 'history-cities-list';

        this.#historyItems = [];
        this.#bindEvents();
    }

    #bindEvents() {
        eventBus.on("HistoryWeather::citySelected", (city) => {
            if (typeof city != 'string')
                return;
            this.#onCitySelected(city);
        });
    }

    #onCitySelected(city: string) {
        eventBus.emit("WeatherController::cityChanged", city);
        this.#highlightSelectedCity(city);
    }

    #highlightSelectedCity(selectedCity: string) {
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

    render(parentElement: HTMLElement) {
        const container = document.createElement('div');
        container.className = 'history-weather';

        const title = document.createElement('h2');
        title.className = 'history-title';
        title.textContent = 'История поиска';
        container.appendChild(title);

        container.appendChild(this.#historyContainer);

        parentElement.appendChild(container);
    }

    updateHistory(history: StorageData) {
        this.#clearHistoryContainer();

        if (!history || history.searchHistory.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-history-message';
            emptyMessage.textContent = 'История поиска пуста';
            this.#historyContainer.appendChild(emptyMessage);
            return;
        }

        history.searchHistory.forEach(item => {
            const historyItem = new HistoryWeatherItem(item);
            const itemElement = historyItem.render();
            this.#historyContainer.appendChild(itemElement);
            this.#historyItems.push(historyItem);
            this.#fetchWeatherForCity(item, historyItem);
        });
    }

    #clearHistoryContainer() {
        this.#historyItems = [];
        while (this.#historyContainer.firstChild) {
            this.#historyContainer.removeChild(this.#historyContainer.firstChild);
        }
    }

    async #fetchWeatherForCity(city: string, historyItem: HistoryWeatherItem) {
        const handler = (weatherData?: EventBusHandlerTypes): void => {
            if (!isForecastDataArray(weatherData))
                return;
            if (weatherData.length == 0) {
                historyItem.hide();
                return;
            }

            if (weatherData[0].city === city) {
                historyItem.updateWeather(weatherData);
                eventBus.off("WeatherService::historyDataReceived", handler);
            }

        };


        eventBus.on("WeatherService::historyDataReceived", handler);
        eventBus.emit("WeatherService::fetchHistoryWeather", city);

        setTimeout(() => {
            eventBus.off("WeatherService::historyDataReceived", handler);
        }, 10000);
    }

    updateCityWeather(weatherData: ForecastData[]) {
        if (weatherData.length == 0)
            return;

        const historyItem = this.#historyItems.find(item => item.getCity() === weatherData[0].city);
        if (historyItem) {
            historyItem.updateWeather(weatherData);
        }
    }
}