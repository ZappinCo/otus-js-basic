export type ForecastData = {
    city: string;
    dt: string;
    description: string;
    icon: string;
    temp: number;
    temp_min: number;
    speed: number;
    pressure: number;     
    humidity: number;      
};

export function isForecastData(data: unknown): data is ForecastData {
    if (!data || typeof data !== 'object') return false;
    
    const f = data as Record<string, unknown>;
    
    return (
        typeof f.city === 'string' &&
        typeof f.dt === 'string' &&
        typeof f.description === 'string' &&
        typeof f.icon === 'string' &&
        typeof f.temp === 'number' &&
        typeof f.temp_min === 'number' &&
        typeof f.speed === 'number' &&
        typeof f.pressure === 'number' &&
        typeof f.humidity === 'number'
    );
}

export function isForecastDataArray(data: unknown): data is ForecastData[] {
    if (!Array.isArray(data)) {
        return false;
    }
    
    return data.every(item => isForecastData(item));
}