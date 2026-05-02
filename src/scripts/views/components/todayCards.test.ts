import { TodayCards } from './todayCards';
import { formatDate } from '../../utils/formatDate';
import { translateWeatherDesc } from '../../utils/translateWeatherDesc';
import { ForecastData } from '../../../types/forecast';

jest.mock('../../utils/formatDate');
jest.mock('../../utils/translateWeatherDesc');

describe('TodayCards', () => {
    let todayCards: TodayCards;
    let container: HTMLDivElement;

    const createMockForecast = (time: string, temp: number, icon: string = '02d', description: string = 'few clouds'): ForecastData => ({
        city: 'Moscow',
        dt: `2026-03-15 ${time}`,
        description: description,
        icon: icon,
        temp: temp,
        temp_min: temp - 3,
        speed: 5,
        pressure: 1013,
        humidity: 65
    });

    beforeEach(() => {
        todayCards = new TodayCards();
        container = document.createElement('div');
        (formatDate as jest.Mock).mockReturnValue('15 марта');
        (translateWeatherDesc as jest.Mock).mockReturnValue('малооблачно');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should not render when no data', () => {
        todayCards.render(container, null as unknown as ForecastData[]);
        expect(container.children).toHaveLength(0);

        todayCards.render(container, []);
        expect(container.children).toHaveLength(0);
    });

    test('should render title with formatted date', () => {
        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', 7)
        ];

        todayCards.render(container, mockData);

        const title = container.querySelector('.today-title') as HTMLElement;
        expect(title.innerText).toBe('Сегодня, 15 марта');
        expect(formatDate).toHaveBeenCalledWith('2026-03-15');
    });

    test('should render card for each data item', () => {
        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', 7),
            createMockForecast('12:00:00', 10),
            createMockForecast('15:00:00', 12)
        ];

        todayCards.render(container, mockData);

        const cards = container.querySelectorAll('.today-item');
        expect(cards).toHaveLength(3);
    });

    test('should render time correctly', () => {
        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', 7)
        ];

        todayCards.render(container, mockData);

        const timeElement = container.querySelector('.today-time') as HTMLElement;
        expect(timeElement.innerText).toBe('09:00');
    });

    test('should render time with different hours', () => {
        const mockData: ForecastData[] = [
            createMockForecast('14:30:00', 7)
        ];

        todayCards.render(container, mockData);

        const timeElement = container.querySelector('.today-time') as HTMLElement;
        expect(timeElement.innerText).toBe('14:30');
    });

    test('should render positive temperature with plus', () => {
        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', 7.24)
        ];

        todayCards.render(container, mockData);

        const tempElement = container.querySelector('.today-temp') as HTMLElement;
        expect(tempElement.innerText).toBe('+7°');
    });

    test('should render positive temperature rounding', () => {
        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', 7.8)
        ];

        todayCards.render(container, mockData);

        const tempElement = container.querySelector('.today-temp') as HTMLElement;
        expect(tempElement.innerText).toBe('+8°');
    });

    test('should render negative temperature without plus', () => {
        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', -5.4)
        ];

        todayCards.render(container, mockData);

        const tempElement = container.querySelector('.today-temp') as HTMLElement;
        expect(tempElement.innerText).toBe('-5°');
    });

    test('should render negative temperature rounding', () => {
        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', -5.8)
        ];

        todayCards.render(container, mockData);

        const tempElement = container.querySelector('.today-temp') as HTMLElement;
        expect(tempElement.innerText).toBe('-6°');
    });

    test('should render zero temperature', () => {
        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', 0)
        ];

        todayCards.render(container, mockData);

        const tempElement = container.querySelector('.today-temp') as HTMLElement;
        expect(tempElement.innerText).toBe('0°');
    });

    test('should render icon with correct URL', () => {
        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', 7, '10d', 'rain')
        ];

        todayCards.render(container, mockData);

        const icon = container.querySelector('.today-icon') as HTMLImageElement;
        expect(icon.src).toBe('https://openweathermap.org/img/wn/10d.png');
        expect(icon.alt).toBe('rain');
    });

    test('should render translated description', () => {
        (translateWeatherDesc as jest.Mock).mockReturnValue('небольшой дождь');

        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', 7, '10d', 'light rain')
        ];

        todayCards.render(container, mockData);

        const descElement = container.querySelector('.today-desc') as HTMLElement;
        expect(descElement.innerText).toBe('небольшой дождь');
        expect(translateWeatherDesc).toHaveBeenCalledWith('light rain');
    });

    test('should create container with correct classes', () => {
        const mockData: ForecastData[] = [
            createMockForecast('09:00:00', 7)
        ];

        todayCards.render(container, mockData);

        expect(container.querySelector('.today-forecast')).not.toBeNull();
        expect(container.querySelector('.today-container')).not.toBeNull();
        expect(container.querySelector('.today-item')).not.toBeNull();
    });
});