import { ForecastData } from "../../types/forecast";
import { isWeatherApiResponse, WeatherApiResponse } from "../../types/weatherApiResponse";
import { PromiseResult } from "./eventBus";

export function parseWeatherApiResponse(result: PromiseResult): ForecastData[] {
    if (!result.success || !result.data) {
        return [];
    }

    if (!isWeatherApiResponse(result.data)) {
        console.error('Invalid API response');
        return [];
    }

    const data = result.data as WeatherApiResponse;

    return data.list.map((item) => ({
        city: data.city.name,
        dt: item.dt_txt,
        description: item.weather[0]?.description ?? '',
        icon: item.weather[0]?.icon ?? '',
        temp: item.main.temp,
        temp_min: item.main.temp_min,
        speed: item.wind.speed,
        pressure: item.main.pressure,
        humidity: item.main.humidity
    }));
}