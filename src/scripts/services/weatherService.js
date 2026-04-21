import { HttpService } from './httpService';

const API_KEY = "7881bfb7be02c74633e5fdee4ff41329";
const DAYS = 70;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export class WeatherService {
    constructor(httpService = null) {
        this.httpService = httpService || new HttpService(BASE_URL);
    }

    async getWeatherByCity(city) {
        try {
            const url = `/forecast?q=${city}&units=metric&cnt=${DAYS}&appid=${API_KEY}`;
            return await this.httpService.get(url);
        } catch (error) {
            console.error('Weather fetch error:', error);
            return null;
        }
    }

    async getWeatherByLocation(lat, lon) {
        try {
            const url = `/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=${DAYS}&appid=${API_KEY}`;
            return await this.httpService.get(url);
        } catch (error) {
            console.error('Weather fetch error:', error);
            return null;
        }
    }
}