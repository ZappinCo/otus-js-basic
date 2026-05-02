import eventBus from "../utils/eventBus";
import { PromiseResult } from "../utils/eventBus";
import { HttpService } from './httpService';
import { parseWeatherApiResponse } from "../utils/parseWeatherApiResponse";
const API_KEY = "7881bfb7be02c74633e5fdee4ff41329";
const DAYS = 70;
const BASE_URL = "https://api.openweathermap.org/data/2.5";


export class WeatherService {
    httpService: HttpService | null;

    constructor(httpService: HttpService | null = null) {
        this.httpService = httpService || new HttpService(BASE_URL);
        this.#bindEvents();
    }

    #bindEvents() {
        eventBus.on("WeatherService::fetchByCity", async (city) => {
            if (typeof (city) != "string")
                return;

            const result = await this.#fetchWeatherData(city);

            if (result.success) {
                const data = parseWeatherApiResponse(result);
                eventBus.emit("WeatherService::dataReceived", data);
            } else {
                if (result.error instanceof Error)
                    eventBus.emit("WeatherService::error", result.error);
            }
        });

        eventBus.on("WeatherService::fetchByLocation", async (coords) => {
            if (!coords || typeof coords !== 'object') return;

            const { lat, lon } = coords as { lat: number; lon: number };
            await this.#fetchWeatherByLocation(lat, lon);
        });

        eventBus.on("WeatherService::fetchHistoryWeather", async (city) => {
            if (typeof (city) != "string")
                return;
            const result = await this.#fetchWeatherData(city, 1);
            if (result.success) {
                const data = parseWeatherApiResponse(result);
                eventBus.emit("WeatherService::historyDataReceived", data);
            } else {
                if (result.error instanceof Error)
                    eventBus.emit("WeatherService::historyError", result.error);
            }
        });
    }

    async #fetchWeatherData(city: string, days: number = DAYS): Promise<PromiseResult> {
        try {
            const url = `/forecast?q=${city}&units=metric&cnt=${days}&appid=${API_KEY}`;
            const weatherData = await this.httpService?.get(url);

            if (weatherData && weatherData.list && weatherData.list.length > 0) {
                return { success: true, data: weatherData, error: null };
            } else {
                return { success: false, error: new Error(`Нет данных о погоде для города ${city}`), data: null };
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            const errorObj = error instanceof Error ? error : new Error(String(error));
            return { success: false, error: errorObj, data: null };
        }
    }

    async #fetchWeatherByLocation(lat: number, lon: number) {
        try {
            const url = `/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=${DAYS}&appid=${API_KEY}`;
            const weatherData = await this.httpService?.get(url);
            if (weatherData && weatherData.list && weatherData.list.length > 0) {
                const data = parseWeatherApiResponse({ success: true, data: weatherData, error: null });
                eventBus.emit("WeatherService::dataReceived", data);
            } else {
                eventBus.emit("WeatherService::error", new Error('Нет данных о погоде по координатам'));
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            if (error instanceof Error)
                eventBus.emit("WeatherService::error", error);
        }
    }
}