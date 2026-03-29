const apiKey = "7881bfb7be02c74633e5fdee4ff41329";
const days = 70;

export async function getCurrentWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=${days}&appid=${apiKey}`;
    return getCurrentWeatherByUrl(url);
}

export async function getCurrentWeatherByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=${days}&appid=${apiKey}`;
    return getCurrentWeatherByUrl(url);
}


export async function getCurrentWeatherByIp() {
    try {
        const url = 'https://ip-api.com/json/?fields=status,city';
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'success') {
            return getCurrentWeatherByCity(data.city);
        }
        return null;
    } catch (error) {
        console.warn('Ошибка определения города по IP:', error);
        return null;
    }
}


async function getCurrentWeatherByUrl(url) {
    try {
        const result = await fetch(url);
        if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`);
        }
        return result.json();
    } catch (error) {
        console.error('getCurrentWeather:', error);
        return null;
    }
}