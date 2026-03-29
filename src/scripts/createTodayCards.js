import { translateWeatherDesc } from "./translateWeatherDesc";
import { formatDate } from "./formatDate";
export function createTodayCards(mainElement, data) {

    const firstDay = data[0].dt_txt.split(' ')[0];

    const todayForecast = document.createElement("div");
    todayForecast.className = "today-forecast";
    mainElement.appendChild(todayForecast);

    const todayTitle = document.createElement("div");
    todayTitle.className = "today-title";
    todayTitle.innerText = `Сегодня, ${formatDate(firstDay)}`;
    todayForecast.appendChild(todayTitle);

    const todayContainer = document.createElement("div");
    todayContainer.className = "today-container";
    todayForecast.appendChild(todayContainer);

    data.forEach(element => {
        if (element.dt_txt.split(' ')[0] === firstDay) {
            const div = createCard(element);
            todayContainer.appendChild(div);
        }
    });
}

function createCard(data) {
    const todayItem = document.createElement("div");
    todayItem.className = "today-item";

    const todayTime = document.createElement("div");
    todayTime.className = "today-time";
    todayTime.innerText = data.dt_txt.split(' ')[1].slice(0, 5);
    todayItem.appendChild(todayTime);

    const todayTemp = document.createElement("div");
    todayTemp.className = "today-temp";
    const temp = Math.round(data.main.temp);
    todayTemp.innerText = temp > 0 ? `+${temp}°` : `${temp}°`;
    todayItem.appendChild(todayTemp);


    const todayIcon = document.createElement("img");
    todayIcon.className = "today-icon";
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
    todayIcon.src = iconUrl;
    todayIcon.alt = data.weather[0].description;
    todayItem.appendChild(todayIcon);

    const todayDesc = document.createElement("div");
    todayDesc.className = "today-desc";
    todayDesc.innerText = translateWeatherDesc(data.weather[0].description);
    todayItem.appendChild(todayDesc);
    return todayItem;
}