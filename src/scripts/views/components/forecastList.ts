import { formatDate } from '../../utils/formatDate';
import { translateWeatherDesc } from '../../utils/translateWeatherDesc';
import { ForecastData } from '../../../types/forecast';

export class ForecastList {
    render(container: HTMLElement, data: ForecastData[]) {
        if (!data || !data.length) return;

        const forecastContainer = this.#createForecastContainer(data);
        container.appendChild(forecastContainer);
    }

    #createForecastContainer(data: ForecastData[]) {
        const wrapper = document.createElement("div");

        const title = this.#createTitle(data.length);
        wrapper.appendChild(title);

        const forecastList = this.#createForecastList(data);
        wrapper.appendChild(forecastList);

        return wrapper;
    }

    #createTitle(daysCount: number) {
        const forecastTitle = document.createElement("div");
        forecastTitle.className = "forecast-title";
        forecastTitle.innerText = `Прогноз на следующие ${daysCount} дня`;
        return forecastTitle;
    }

    #createForecastList(data: ForecastData[]) {
        const forecastList = document.createElement("div");
        forecastList.className = "forecast-list";

        data.forEach(item => {
            const forecastItem = this.#createForecastItem(item);
            forecastList.appendChild(forecastItem);
        });

        return forecastList;
    }

    #createForecastItem(data: ForecastData) {
        const forecastItem = document.createElement("div");
        forecastItem.className = "forecast-item";

        const day = this.#createDayElement(data);
        forecastItem.appendChild(day);

        const icon = this.#createIconElement(data);
        forecastItem.appendChild(icon);

        const temp = this.#createTemperatureElement(data);
        forecastItem.appendChild(temp);

        const desc = this.#createDescriptionElement(data);
        forecastItem.appendChild(desc);

        return forecastItem;
    }

    #createDayElement(data: ForecastData) {
        const forecastDay = document.createElement("div");
        forecastDay.className = "forecast-day";
        forecastDay.innerText = formatDate(data.dt.split(' ')[0]);
        return forecastDay;
    }

    #createIconElement(data: ForecastData) {
        const forecastIcon = document.createElement("div");
        forecastIcon.className = "forecast-icon";

        const iconImg = document.createElement("img");
        iconImg.src = `https://openweathermap.org/img/wn/${data.icon}.png`;
        iconImg.alt = data.description;
        forecastIcon.appendChild(iconImg);

        return forecastIcon;
    }

    #createTemperatureElement(data: ForecastData) {
        const forecastTemp = document.createElement("div");
        forecastTemp.className = "forecast-temp";

        const tempDay = Math.round(data.temp);
        const tempNight = Math.round(data.temp_min);
        const tempDayStr = tempDay > 0 ? `+${tempDay}°` : `${tempDay}°`;
        const tempNightStr = tempNight > 0 ? `+${tempNight}°` : `${tempNight}°`;

        forecastTemp.innerText = `${tempDayStr} / ${tempNightStr}`;
        return forecastTemp;
    }

    #createDescriptionElement(data: ForecastData) {
        const forecastDesc = document.createElement("div");
        forecastDesc.className = "forecast-desc";
        forecastDesc.innerText = translateWeatherDesc(data.description);
        return forecastDesc;
    }
}