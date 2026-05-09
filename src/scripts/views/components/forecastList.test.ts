import { ForecastList } from './forecastList';
import { formatDate } from '../../utils/formatDate';
import { translateWeatherDesc } from '../../utils/translateWeatherDesc';
import { ForecastData } from '../../../types/forecast';

jest.mock('../../utils/formatDate');
jest.mock('../../utils/translateWeatherDesc');

describe('ForecastList', () => {
    let forecastList: ForecastList;
    let container: HTMLDivElement;

    const createMockForecast = (dt: string, temp: number, temp_min: number, icon: string, description: string): ForecastData => ({
        city: 'Moscow',
        dt: dt,
        description: description,
        icon: icon,
        temp: temp,
        temp_min: temp_min,
        speed: 5,
        pressure: 1013,
        humidity: 65
    });

    beforeEach(() => {
        forecastList = new ForecastList();
        container = document.createElement('div');
        (formatDate as jest.Mock).mockReturnValue('15 марта');
        (translateWeatherDesc as jest.Mock).mockReturnValue('облачно');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should not render when no data', () => {
        forecastList.render(container, null as unknown as ForecastData[]);
        expect(container.children).toHaveLength(0);

        forecastList.render(container, []);
        expect(container.children).toHaveLength(0);
    });

    test('should render title with days count', () => {
        const mockData: ForecastData[] = [
            createMockForecast('2026-03-15 15:00:00', 7, 2, '03d', 'clouds'),
            createMockForecast('2026-03-16 15:00:00', 6, 2, '04n', 'clouds')
        ];

        forecastList.render(container, mockData);

        const title = container.querySelector('.forecast-title') as HTMLElement;
        expect(title.innerText).toBe('Прогноз на следующие 2 дня');
    });

    test('should render forecast items', () => {
        const mockData: ForecastData[] = [
            createMockForecast('2026-03-15 15:00:00', 7, 2, '03d', 'clouds')
        ];

        forecastList.render(container, mockData);

        expect(container.querySelector('.forecast-day')).toBeTruthy();
        expect(container.querySelector('.forecast-icon')).toBeTruthy();
        expect(container.querySelector('.forecast-temp')).toBeTruthy();
        expect(container.querySelector('.forecast-desc')).toBeTruthy();
    });

    test('should render positive temperature with plus', () => {
        const mockData: ForecastData[] = [
            createMockForecast('2026-03-15 15:00:00', 7, 2, '03d', 'clouds')
        ];

        forecastList.render(container, mockData);

        const tempElement = container.querySelector('.forecast-temp') as HTMLElement;
        expect(tempElement.innerText).toBe('+7° / +2°');
    });

    test('should render negative temperature without plus', () => {
        const mockData: ForecastData[] = [
            createMockForecast('2026-03-15 15:00:00', -5, -8, '03d', 'clouds')
        ];

        forecastList.render(container, mockData);

        const tempElement = container.querySelector('.forecast-temp') as HTMLElement;
        expect(tempElement.innerText).toBe('-5° / -8°');
    });

    test('should render mixed temperatures (positive and negative)', () => {
        const mockData: ForecastData[] = [
            createMockForecast('2026-03-15 15:00:00', 5, -2, '03d', 'clouds')
        ];

        forecastList.render(container, mockData);

        const tempElement = container.querySelector('.forecast-temp') as HTMLElement;
        expect(tempElement.innerText).toBe('+5° / -2°');
    });

    test('should render zero temperature', () => {
        const mockData: ForecastData[] = [
            createMockForecast('2026-03-15 15:00:00', 0, 0, '03d', 'clouds')
        ];

        forecastList.render(container, mockData);

        const tempElement = container.querySelector('.forecast-temp') as HTMLElement;
        expect(tempElement.innerText).toBe('0° / 0°');
    });

    test('should call formatDate with correct date', () => {
        const mockData: ForecastData[] = [
            createMockForecast('2026-03-15 15:00:00', 7, 2, '03d', 'clouds')
        ];

        forecastList.render(container, mockData);

        expect(formatDate).toHaveBeenCalledWith('2026-03-15');
    });

    test('should call translateWeatherDesc with description', () => {
        const mockData: ForecastData[] = [
            createMockForecast('2026-03-15 15:00:00', 7, 2, '03d', 'cloudy sky')
        ];

        forecastList.render(container, mockData);

        expect(translateWeatherDesc).toHaveBeenCalledWith('cloudy sky');
    });

    test('should render correct icon URL', () => {
        const mockData: ForecastData[] = [
            createMockForecast('2026-03-15 15:00:00', 7, 2, '10d', 'rain')
        ];

        forecastList.render(container, mockData);

        const iconImg = container.querySelector('.forecast-icon img') as HTMLImageElement;
        expect(iconImg.src).toBe('https://openweathermap.org/img/wn/10d.png');
    });

    test('should render multiple forecast items', () => {
        const mockData: ForecastData[] = [
            createMockForecast('2026-03-15 15:00:00', 7, 2, '03d', 'clouds'),
            createMockForecast('2026-03-16 15:00:00', 6, 1, '04d', 'clouds'),
            createMockForecast('2026-03-17 15:00:00', 8, 3, '01d', 'clear')
        ];

        forecastList.render(container, mockData);

        const items = container.querySelectorAll('.forecast-item');
        expect(items).toHaveLength(3);
    });
});