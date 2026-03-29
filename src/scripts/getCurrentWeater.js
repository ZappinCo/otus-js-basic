const apiKey = "7881bfb7be02c74633e5fdee4ff41329";
export async function getCurrentWeather(city, days) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=${days}&appid=${apiKey}`;
    try {
        const result = await fetch(url);
        if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`);
        }
        return result.json();
    } catch (error) {
        console.error('getCurrentWeather:', error);
        return { list: [] };
    }

}