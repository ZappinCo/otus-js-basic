import { TodayCards } from './todayCards.js';
import { formatDate } from '../../utils/formatDate.js';
import { translateWeatherDesc } from '../../utils/translateWeatherDesc.js';

jest.mock('../../utils/formatDate.js');
jest.mock('../../utils/translateWeatherDesc.js');

describe('TodayCards', () => {
    let todayCards;
    let container;

    beforeEach(() => {
        todayCards = new TodayCards();
        container = document.createElement('div');
        formatDate.mockReturnValue('15 марта');
        translateWeatherDesc.mockReturnValue('малооблачно');
    });

    test('should not render when no data', () => {
        todayCards.render(container, null);
        todayCards.render(container, []);
        expect(container.children.length).toBe(0);
    });

    test('should render title with formatted date', () => {
        const mockData = [
            { dt_txt: "2026-03-15 09:00:00", main: { temp: 7 }, weather: [{ icon: "02d", description: "few clouds" }] }
        ];

        todayCards.render(container, mockData);
        
        expect(container.querySelector('.today-title').innerText).toBe('Сегодня, 15 марта');
    });

    test('should render card for each data item', () => {
        const mockData = [
            { dt_txt: "2026-03-15 09:00:00", main: { temp: 7 }, weather: [{ icon: "02d", description: "few clouds" }] },
            { dt_txt: "2026-03-15 12:00:00", main: { temp: 10 }, weather: [{ icon: "02d", description: "few clouds" }] }
        ];

        todayCards.render(container, mockData);
        
        expect(container.querySelectorAll('.today-item').length).toBe(2);
    });

    test('should render time', () => {
        const mockData = [
            { dt_txt: "2026-03-15 09:00:00", main: { temp: 7 }, weather: [{ icon: "02d", description: "few clouds" }] }
        ];

        todayCards.render(container, mockData);
        
        expect(container.querySelector('.today-time').innerText).toBe('09:00');
    });

    test('should render positive temperature with plus', () => {
        const mockData = [
            { dt_txt: "2026-03-15 09:00:00", main: { temp: 7.24 }, weather: [{ icon: "02d", description: "few clouds" }] }
        ];

        todayCards.render(container, mockData);
        
        expect(container.querySelector('.today-temp').innerText).toBe('+7°');
    });

    test('should render negative temperature without plus', () => {
        const mockData = [
            { dt_txt: "2026-03-15 09:00:00", main: { temp: -5.4 }, weather: [{ icon: "02d", description: "few clouds" }] }
        ];

        todayCards.render(container, mockData);
        
        expect(container.querySelector('.today-temp').innerText).toBe('-5°');
    });

    test('should render icon', () => {
        const mockData = [
            { dt_txt: "2026-03-15 09:00:00", main: { temp: 7 }, weather: [{ icon: "02d", description: "few clouds" }] }
        ];

        todayCards.render(container, mockData);
        
        const icon = container.querySelector('.today-icon');
        expect(icon.src).toContain('02d.png');
        expect(icon.alt).toBe('few clouds');
    });

    test('should render translated description', () => {
        const mockData = [
            { dt_txt: "2026-03-15 09:00:00", main: { temp: 7 }, weather: [{ icon: "02d", description: "few clouds" }] }
        ];

        todayCards.render(container, mockData);
        
        expect(container.querySelector('.today-desc').innerText).toBe('малооблачно');
    });
});