import EventBus from "../utils/eventBus";
import { HttpService } from './httpService';

const API_KEY = "7881bfb7be02c74633e5fdee4ff41329";
const DAYS = 70;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export class WeatherService {
    constructor(httpService = null) {
        this.httpService = httpService || new HttpService(BASE_URL);
        this.#bindEvents();
    }

    #bindEvents() {
        EventBus.on("WeatherService::fetchByCity", async (city) => {
            const result = await this.#fetchWeatherData(city);
            if (result.success) {
                EventBus.emit("WeatherService::dataReceived", result.data);
            } else {
                EventBus.emit("WeatherService::error", result.error);
            }
        });

        EventBus.on("WeatherService::fetchByLocation", async (lat, lon) => {
            await this.#fetchWeatherByLocation(lat, lon);
        });

        EventBus.on("WeatherService::fetchHistoryWeather", async (city) => {
            const result = await this.#fetchWeatherData(city);
            if (result.success) {
                EventBus.emit("WeatherService::historyDataReceived", city, result.data);
            } else {
                EventBus.emit("WeatherService::historyError", city, result.error);
            }
        });
    }

    async #fetchWeatherData(city) {
        try {
            const url = `/forecast?q=${city}&units=metric&cnt=${DAYS}&appid=${API_KEY}`;
            const weatherData = await this.httpService.get(url);
            
            if (weatherData && weatherData.list && weatherData.list.length > 0) {
                return { success: true, data: weatherData };
            } else {
                return { success: false, error: new Error(`Нет данных о погоде для города ${city}`) };
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            return { success: false, error };
        }
    }

    async #fetchWeatherByLocation(lat, lon) {
        try {
            const url = `/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=${DAYS}&appid=${API_KEY}`;
            const weatherData = await this.httpService.get(url);
            
            if (weatherData && weatherData.list && weatherData.list.length > 0) {
                EventBus.emit("WeatherService::dataReceived", weatherData);
            } else {
                EventBus.emit("WeatherService::error", new Error('Нет данных о погоде по координатам'));
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            EventBus.emit("WeatherService::error", error);
        }
    }
}