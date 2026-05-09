import { ForecastData } from "./forecast";
export interface WeatherModelSnapshot {
    currentWeather: ForecastData|null ;
    forecastList: ForecastData[];
    loading: boolean;
    error: string | null;
    city: string | null;
    hasData: boolean;
    hasError: boolean;
    todayForecast: ForecastData[];
    nextDaysForecast: ForecastData[];
}

export function isWeatherModelSnapshot(data: unknown): data is WeatherModelSnapshot {
    if (!data || typeof data !== 'object') return false;
    
    const s = data as Record<string, unknown>;;
    
    return (
        'loading' in s && typeof s.loading === 'boolean' &&
        'hasData' in s && typeof s.hasData === 'boolean' &&
        'hasError' in s && typeof s.hasError === 'boolean' &&
        Array.isArray(s.forecastList) &&
        Array.isArray(s.todayForecast) &&
        Array.isArray(s.nextDaysForecast) &&
        (s.city === null || typeof s.city === 'string') &&
        (s.error === null || typeof s.error === 'string')
    );
}