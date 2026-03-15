import { createMainWindow } from "./createMainWindow";
import { createTodayCards } from "./createTodayCards";
import { createDetailInfo } from "./createDetailInfo";
import { createForecatList } from "./createForecatList";
import { getCurrentWeather } from "./getCurrentWeater";
import { showErrorMessage } from "./showErrorMessage";
const days = 70;

export async function runApp(element) {
  const city = "Moscow";
  createMainWindow(element);
  await updatePlace(city);
  const input = document.querySelector(".city-name");
  input.addEventListener("input", updatePlace);
}


async function updatePlace() {
  const input = document.querySelector(".city-name");
  const city = input.value;

  const mainCard = document.querySelector(".weather-container");
  mainCard.replaceChildren();
  
  let result;
  console.log(city);
  result = await getCurrentWeather(city, days);
  console.log(result);

  if (!result || !result.list || result.list.length === 0) {
    console.warn('Нет данных о погоде');
    showErrorMessage('Нет данных о погоде для города ' + city);
    return;
  }

  createTodayCards(mainCard, result.list);
  createDetailInfo(mainCard, result.list[0]);
  createForecatList(mainCard, result.list);
}