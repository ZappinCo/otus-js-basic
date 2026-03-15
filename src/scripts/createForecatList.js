import { translateWeatherDesc } from "./translateWeatherDesc";
import { formatDate } from "./formatDate";

export function createForecatList(mainElement, data) {
    let previosDate = data[0].dt_txt.split(' ')[0];

    const forecastTitle = document.createElement("div");
    forecastTitle.className = "forecast-title";
    mainElement.appendChild(forecastTitle);

    const forecastList = document.createElement("div");
    forecastList.className = "forecast-list";
    mainElement.appendChild(forecastList);

    let counter = 0;
    data.forEach(element => {
        if (element.dt_txt.split(' ')[0] != previosDate) {
            if(element.dt_txt.split(' ')[1] === "15:00:00"){
                previosDate = element.dt_txt.split(' ')[0];
                const div = createForecastElement(element);
                forecastList.appendChild(div);
                counter++;
            }
        }
    });

    forecastTitle.innerText = `Прогноз на следующие ${counter} дня`;
}


function createForecastElement(data) {
    const forecastItem = document.createElement("div");
    forecastItem.className = "forecast-item";

    const forecastDay = document.createElement("div");
    forecastDay.className = "forecast-day";
    forecastDay.innerText = formatDate(data.dt_txt.split(' ')[0]);
    forecastItem.appendChild(forecastDay);

    const forecastIcon = document.createElement("div");
    forecastIcon.className = "forecast-icon";

    const iconImg = document.createElement("img");
    const iconCode = data.weather[0].icon;
    iconImg.src = `https://openweathermap.org/img/wn/${iconCode}.png`;
    iconImg.alt = data.weather[0].description;
    forecastIcon.appendChild(iconImg);
    forecastItem.appendChild(forecastIcon);

    const forecastTemp = document.createElement("div");
    forecastTemp.className = "forecast-temp";


    const tempDay = Math.round(data.main.temp);
    const tempNight = Math.round(data.main.temp_min);

    const tempDayStr = tempDay > 0 ? `+${tempDay}°` : `${tempDay}°`;
    const tempNightStr = tempNight > 0 ? `+${tempNight}°` : `${tempNight}°`;

    forecastTemp.innerText = `${tempDayStr} / ${tempNightStr}`;
    forecastItem.appendChild(forecastTemp);

    const forecastDesc = document.createElement("div");
    forecastDesc.className = "forecast-desc";

    forecastDesc.innerText = translateWeatherDesc(data.weather[0].description);
    forecastItem.appendChild(forecastDesc);

    return forecastItem;
}