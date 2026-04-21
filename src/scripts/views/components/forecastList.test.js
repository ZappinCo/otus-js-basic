import { ForecastList } from './forecastList.js';
import { formatDate } from '../../utils/formatDate.js';
import { translateWeatherDesc } from '../../utils/translateWeatherDesc.js';

jest.mock('../../utils/formatDate.js');
jest.mock('../../utils/translateWeatherDesc.js');

describe('ForecastList', () => {
    let forecastList;
    let container;

    beforeEach(() => {
        forecastList = new ForecastList();
        container = document.createElement('div');
        formatDate.mockReturnValue('15 марта');
        translateWeatherDesc.mockReturnValue('облачно');
    });

    test('should not render when no data', () => {
        forecastList.render(container, null);
        forecastList.render(container, []);
        expect(container.children.length).toBe(0);
    });

    test('should render title with days count', () => {
        const mockData = [
            { dt_txt: "2026-03-15 15:00:00", main: { temp: 7, temp_min: 2 }, weather: [{ icon: "03d", description: "clouds" }] },
            { dt_txt: "2026-03-16 15:00:00", main: { temp: 6, temp_min: 2 }, weather: [{ icon: "04n", description: "clouds" }] }
        ];

        forecastList.render(container, mockData);

        expect(container.querySelector('.forecast-title').innerText).toBe('Прогноз на следующие 2 дня');
    });

    test('should render forecast items', () => {
        const mockData = [
            { dt_txt: "2026-03-15 15:00:00", main: { temp: 7, temp_min: 2 }, weather: [{ icon: "03d", description: "clouds" }] }
        ];

        forecastList.render(container, mockData);

        expect(container.querySelector('.forecast-day')).toBeTruthy();
        expect(container.querySelector('.forecast-icon')).toBeTruthy();
        expect(container.querySelector('.forecast-temp')).toBeTruthy();
        expect(container.querySelector('.forecast-desc')).toBeTruthy();
    });

    test('should render positive temperature with plus', () => {
        const mockData = [
            { dt_txt: "2026-03-15 15:00:00", main: { temp: 7, temp_min: 2 }, weather: [{ icon: "03d", description: "clouds" }] }
        ];

        forecastList.render(container, mockData);
        expect(container.querySelector('.forecast-temp').innerText).toBe('+7° / +2°');
    });

    test('should render negative temperature without plus', () => {
        const mockData = [
            { dt_txt: "2026-03-15 15:00:00", main: { temp: -5, temp_min: -8 }, weather: [{ icon: "03d", description: "clouds" }] }
        ];

        forecastList.render(container, mockData);
        expect(container.querySelector('.forecast-temp').innerText).toBe('-5° / -8°');
    });
});