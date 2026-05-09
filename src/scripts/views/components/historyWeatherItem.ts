import { translateWeatherDesc } from '../../utils/translateWeatherDesc';
import router from '../../utils/router';
import { ForecastData } from '../../../types/forecast';

export class HistoryWeatherItem {
    #city: string;
    #weatherData: ForecastData | null;
    #container: HTMLDivElement;
    #weatherContainer: HTMLDivElement;

    constructor(historyItem: string) {
        this.#city = historyItem;
        this.#weatherData = null;
        this.#container = document.createElement('div');
        this.#weatherContainer = document.createElement('div');
    }

    render() {

        this.#container.className = 'history-city-card';

        const cityName = document.createElement('div');
        cityName.className = 'history-city-name';
        cityName.textContent = this.#city;
        this.#container.appendChild(cityName);


        this.#weatherContainer.className = 'history-weather-container';

        const loadingElement = document.createElement('div');
        loadingElement.className = 'history-weather-loading';
        loadingElement.textContent = 'Загрузка погоды...';
        this.#weatherContainer.appendChild(loadingElement);

        this.#container.appendChild(this.#weatherContainer);

        this.#container.addEventListener('click', () => {
            router.navigateTo('/city/' + this.#city);
        });

        return this.#container;
    }

    updateWeather(weatherData: ForecastData[]) {

        if (!weatherData.length) {
            this.hide();
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const todayForecast = weatherData.filter(item =>
            item.dt.split(' ')[0] === today
        );

        if (!todayForecast.length) {
            this.hide();
            return;
        }

        this.#clearWeatherContainer();

        this.#weatherData = todayForecast[Math.floor(todayForecast.length / 2)] || todayForecast[0];

        const container = document.createElement('div');
        container.className = 'history-today-weather';

        const temp = Math.round(this.#weatherData.temp);
        const tempElement = document.createElement('div');
        tempElement.className = 'history-temp';
        tempElement.textContent = temp > 0 ? `+${temp}°` : `${temp}°`;
        container.appendChild(tempElement);

        const icon = document.createElement('img');
        icon.className = 'history-icon';
        icon.src = `https://openweathermap.org/img/wn/${this.#weatherData.icon}.png`;
        icon.alt = this.#weatherData.description;
        container.appendChild(icon);

        const desc = document.createElement('div');
        desc.className = 'history-desc';
        desc.textContent = translateWeatherDesc(this.#weatherData.description);
        container.appendChild(desc);

        this.#weatherContainer.appendChild(container);
    }

    #clearWeatherContainer() {
        while (this.#weatherContainer.firstChild) {
            this.#weatherContainer.removeChild(this.#weatherContainer.firstChild);
        }
    }

    hide() {
        this.#container?.parentNode?.removeChild(this.#container);
    }

    getCity() {
        return this.#city;
    }

    getContainer() {
        return this.#container;
    }
}