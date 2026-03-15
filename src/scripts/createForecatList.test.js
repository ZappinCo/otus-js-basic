import { createForecatList } from "./createForecatList";
import { translateWeatherDesc } from "./translateWeatherDesc";
import { formatDate } from "./formatDate";

jest.mock("./translateWeatherDesc");
jest.mock("./formatDate");

describe('createForecatList', () => {
    let mainElement;
    const mockData = [
        { dt_txt: "2026-03-15 09:00:00", main: { temp: 7.24, temp_min: 7.24 }, weather: [{ icon: "02d", description: "few clouds" }] },
        { dt_txt: "2026-03-15 15:00:00", main: { temp: 7.37, temp_min: 7.37 }, weather: [{ icon: "03d", description: "scattered clouds" }] },
        { dt_txt: "2026-03-16 15:00:00", main: { temp: 6.08, temp_min: 2.48 }, weather: [{ icon: "04n", description: "broken clouds" }] },
        { dt_txt: "2026-03-17 15:00:00", main: { temp: 6.08, temp_min: 2.48 }, weather: [{ icon: "04n", description: "broken clouds" }] },
        { dt_txt: "2026-03-17 21:00:00", main: { temp: -5.4, temp_min: -8.2 }, weather: [{ icon: "04n", description: "broken clouds" }] }
    ];

    beforeEach(() => {
        mainElement = document.createElement('div');
        formatDate.mockReturnValue('15 марта');
        translateWeatherDesc.mockReturnValue('облачно');
    });

    test('should create item', () => {
        createForecatList(mainElement, mockData);
        expect(mainElement.querySelector('.forecast-title')).toBeTruthy();
        expect(mainElement.querySelector('.forecast-list')).toBeTruthy();
    });


    test('Counter', () => {
        createForecatList(mainElement, mockData);
        expect(mainElement.querySelector('.forecast-title').innerText).toBe('Прогноз на следующие 2 дня');
    });
});