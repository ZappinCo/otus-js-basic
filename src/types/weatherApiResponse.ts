export interface WeatherApiResponse {
    cod: string;
    message: number;
    cnt: number;
    list: WeatherApiItem[];
    city: WeatherApiCity;
}

export interface WeatherApiItem {
    dt: number;
    dt_txt: string;
    main: {
        temp: number;
        temp_min: number;
        feels_like: number;
        pressure: number;
        humidity: number;
    };
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
    wind: {
        speed: number;
        deg: number;
        gust: number;
    };
    clouds: {
        all: number;
    };
    visibility: number;
    pop: number;
    sys: {
        pod: string;
    };
    rain?: {
        '3h': number;
    };
}

export interface WeatherApiCity {
    id: number;
    name: string;
    coord: {
        lat: number;
        lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
}

export function isWeatherApiResponse(data: unknown): data is WeatherApiResponse {
    if (!data || typeof data !== 'object') return false;
    
    const response = data as Record<string, unknown>;
    
    if (!Array.isArray(response.list)) return false;
    if (!response.city || typeof response.city !== 'object') return false;
    
    const city = response.city as Record<string, unknown>;
    if (typeof city.name !== 'string') return false;
    
    if (response.list.length > 0) {
        const item = response.list[0] as Record<string, unknown>;
        if (typeof item.dt_txt !== 'string') return false;
        if (!item.main || typeof item.main !== 'object') return false;
        if (!Array.isArray(item.weather)) return false;
        if (!item.wind || typeof item.wind !== 'object') return false;
    }
    
    return true;
}