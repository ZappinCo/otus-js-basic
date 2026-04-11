import { createMainWindow } from "./createMainWindow";
import { createTodayCards } from "./createTodayCards";
import { createDetailInfo } from "./createDetailInfo";
import { createForecatList } from "./createForecatList";
import { getCurrentWeatherByIp, getCurrentWeatherByCity, getCurrentWeatherByLocation } from "./getCurrentWeater";
import { showErrorMessage } from "./showErrorMessage";

export async function runApp(element) {
  createMainWindow(element);

  await updateWeather();
  const input = document.querySelector(".city-name");
  input.addEventListener("input", updateWeather);

  const button = document.querySelector(".find-me-button");
  button.addEventListener("click", updatePlace);
}


async function updateWeather() {
  const input = document.querySelector(".city-name");
  const city = input.value;
  localStorage.setItem("city", city);
  let result;
  console.log(city);
  result = await getCurrentWeatherByCity(city);
  updateCards(result);
}

async function updateCards(result) {
  const mainCard = document.querySelector(".weather-container");
  mainCard.replaceChildren();

  if (!result || !result.list || result.list.length === 0) {
    const city = document.querySelector(".city-name").value;
    console.warn('Нет данных о погоде');
    showErrorMessage('Нет данных о погоде для города ' + city);
    return;
  }

  createTodayCards(mainCard, result.list);
  createDetailInfo(mainCard, result.list[0]);
  createForecatList(mainCard, result.list);
}

async function updatePlace() {
  const button = document.querySelector(".find-me-button");

  async function updateData(result) {
    button.classList.remove('loading');
    console.log(result);
    if (!result)
      return;

    const cityName = document.querySelector(".city-name");
    cityName.value = result.city.name;
    localStorage.setItem("city", cityName.value);
    updateCards(result);
  }

  async function success(position) {
    let result = await getCurrentWeatherByLocation(position.coords.latitude, position.coords.longitude);
    updateData(result);
  }

  async function error() {
    let result = await getCurrentWeatherByIp();
    updateData(result);
  }

  if (!navigator.geolocation) {
    showErrorMessage('Геолокация не поддерживается вашим браузером');
  } else {
    button.classList.add('loading');
    navigator.geolocation.getCurrentPosition(success, error);
  }
}