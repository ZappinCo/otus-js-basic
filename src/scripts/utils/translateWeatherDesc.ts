export function translateWeatherDesc(desc: string) {
    const translations: Record<string, string> = {
        'clear sky': 'ясно',
        'few clouds': 'малооблачно',
        'scattered clouds': 'облачно',
        'broken clouds': 'пасмурно',
        'overcast clouds': 'пасмурно',
        'light rain': 'небольшой дождь',
        'moderate rain': 'дождь',
        'heavy rain': 'сильный дождь',
        'shower rain': 'ливень',
        'rain': 'дождь',
        'thunderstorm': 'гроза',
        'snow': 'снег',
        'light snow': 'небольшой снег',
        'heavy snow': 'сильный снег',
        'mist': 'туман',
        'fog': 'туман',
        'haze': 'дымка'
    };

    return translations[desc] || desc;
}