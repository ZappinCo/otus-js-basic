import { ForecastData } from '../../../types/forecast';
import { formatDate } from '../../utils/formatDate';
import { translateWeatherDesc } from '../../utils/translateWeatherDesc';

export class TodayCards {
    render(container: HTMLElement, data: ForecastData[]) {
        if (!data || !data.length) return;

        const todayForecast = this.#createTodayForecastContainer(data);
        container.appendChild(todayForecast);
    }

    #createTodayForecastContainer(data: ForecastData[]) {
        const todayForecast = document.createElement("div");
        todayForecast.className = "today-forecast";

        const firstDay = data[0].dt.split(' ')[0];
        const todayTitle = this.#createTitle(firstDay);
        todayForecast.appendChild(todayTitle);

        const todayContainer = this.#createTodayContainer(data);
        todayForecast.appendChild(todayContainer);

        return todayForecast;
    }

    #createTitle(date: string) {
        const todayTitle = document.createElement("div");
        todayTitle.className = "today-title";
        todayTitle.innerText = `Сегодня, ${formatDate(date)}`;
        return todayTitle;
    }

    #createTodayContainer(data: ForecastData[]) {
        const todayContainer = document.createElement("div");
        todayContainer.className = "today-container";

        data.forEach(item => {
            const card = this.#createCard(item);
            todayContainer.appendChild(card);
        });

        return todayContainer;
    }

    #createCard(data: ForecastData) {
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

    #createTimeElement(data: ForecastData) {
        const todayTime = document.createElement("div");
        todayTime.className = "today-time";
        todayTime.innerText = data.dt.split(' ')[1].slice(0, 5);
        return todayTime;
    }

    #createTemperatureElement(data: ForecastData) {
        const todayTemp = document.createElement("div");
        todayTemp.className = "today-temp";
        const temp = Math.round(data.temp);
        todayTemp.innerText = temp > 0 ? `+${temp}°` : `${temp}°`;
        return todayTemp;
    }

    #createIconElement(data: ForecastData) {
        const todayIcon = document.createElement("img");
        todayIcon.className = "today-icon";
        todayIcon.src = `https://openweathermap.org/img/wn/${data.icon}.png`;
        todayIcon.alt = data.description;
        return todayIcon;
    }

    #createDescriptionElement(data: ForecastData) {
        const todayDesc = document.createElement("div");
        todayDesc.className = "today-desc";
        todayDesc.innerText = translateWeatherDesc(data.description);
        return todayDesc;
    }
}