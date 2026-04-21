import { formatDate } from '../../utils/formatDate.js';
import { translateWeatherDesc } from '../../utils/translateWeatherDesc.js';

export class TodayCards {
    render(container, data) {
        if (!data || !data.length) return;
        
        const todayForecast = this.#createTodayForecastContainer(data);
        container.appendChild(todayForecast);
    }

    #createTodayForecastContainer(data) {
        const todayForecast = document.createElement("div");
        todayForecast.className = "today-forecast";
        
        const firstDay = data[0].dt_txt.split(' ')[0];
        const todayTitle = this.#createTitle(firstDay);
        todayForecast.appendChild(todayTitle);
        
        const todayContainer = this.#createTodayContainer(data);
        todayForecast.appendChild(todayContainer);
        
        return todayForecast;
    }

    #createTitle(date) {
        const todayTitle = document.createElement("div");
        todayTitle.className = "today-title";
        todayTitle.innerText = `Сегодня, ${formatDate(date)}`;
        return todayTitle;
    }

    #createTodayContainer(data) {
        const todayContainer = document.createElement("div");
        todayContainer.className = "today-container";
        
        data.forEach(item => {
            const card = this.#createCard(item);
            todayContainer.appendChild(card);
        });
        
        return todayContainer;
    }

    #createCard(data) {
        const todayItem = document.createElement("div");
        todayItem.className = "today-item";
        
        const time = this.#createTimeElement(data);
        todayItem.appendChild(time);
        
        const temp = this.#createTemperatureElement(data);
        todayItem.appendChild(temp);
        
        const icon = this.#createIconElement(data);
        todayItem.appendChild(icon);
        
        const desc = this.#createDescriptionElement(data);
        todayItem.appendChild(desc);
        
        return todayItem;
    }

    #createTimeElement(data) {
        const todayTime = document.createElement("div");
        todayTime.className = "today-time";
        todayTime.innerText = data.dt_txt.split(' ')[1].slice(0, 5);
        return todayTime;
    }

    #createTemperatureElement(data) {
        const todayTemp = document.createElement("div");
        todayTemp.className = "today-temp";
        const temp = Math.round(data.main.temp);
        todayTemp.innerText = temp > 0 ? `+${temp}°` : `${temp}°`;
        return todayTemp;
    }

    #createIconElement(data) {
        const todayIcon = document.createElement("img");
        todayIcon.className = "today-icon";
        todayIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        todayIcon.alt = data.weather[0].description;
        return todayIcon;
    }

    #createDescriptionElement(data) {
        const todayDesc = document.createElement("div");
        todayDesc.className = "today-desc";
        todayDesc.innerText = translateWeatherDesc(data.weather[0].description);
        return todayDesc;
    }
}