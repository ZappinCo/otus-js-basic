import { translateWeatherDesc } from '../../utils/translateWeatherDesc.js';
import eventBus from "../../utils/eventBus";

export class HistoryWeatherItem {
    #city;
    #weatherData;
    #container;
    #weatherContainer;

    constructor(historyItem) {
        this.#city = historyItem.city;
        this.#weatherData = null;
    }

    render() {
        this.#container = document.createElement('div');
        this.#container.className = 'history-city-card';
        
        const cityName = document.createElement('div');
        cityName.className = 'history-city-name';
        cityName.textContent = this.#city;
        this.#container.appendChild(cityName);
        
        this.#weatherContainer = document.createElement('div');
        this.#weatherContainer.className = 'history-weather-container';
        
        const loadingElement = document.createElement('div');
        loadingElement.className = 'history-weather-loading';
        loadingElement.textContent = 'Загрузка погоды...';
        this.#weatherContainer.appendChild(loadingElement);
        
        this.#container.appendChild(this.#weatherContainer);
        
        this.#container.addEventListener('click', (e) => {
            e.stopPropagation();
            eventBus.emit("HistoryWeather::citySelected", this.#city);
        });
        
        return this.#container;
    }

    updateWeather(weatherData) {
        this.#weatherData = weatherData;
        
        if (!this.#weatherData?.list?.length) {
            this.hide();
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const todayForecast = this.#weatherData.list.filter(item => 
            item.dt_txt.split(' ')[0] === today
        );
        
        if (!todayForecast.length) {
            this.hide();
            return;
        }
        
        this.#clearWeatherContainer();
        
        const mainForecast = todayForecast[Math.floor(todayForecast.length / 2)] || todayForecast[0];
        
        const container = document.createElement('div');
        container.className = 'history-today-weather';
        
        const temp = Math.round(mainForecast.main.temp);
        const tempElement = document.createElement('div');
        tempElement.className = 'history-temp';
        tempElement.textContent = temp > 0 ? `+${temp}°` : `${temp}°`;
        container.appendChild(tempElement);
        
        const icon = document.createElement('img');
        icon.className = 'history-icon';
        icon.src = `https://openweathermap.org/img/wn/${mainForecast.weather[0].icon}.png`;
        icon.alt = mainForecast.weather[0].description;
        container.appendChild(icon);
        
        const desc = document.createElement('div');
        desc.className = 'history-desc';
        desc.textContent = translateWeatherDesc(mainForecast.weather[0].description);
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