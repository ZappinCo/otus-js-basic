import { DetailInfo } from './detailInfo';
import { ForecastData } from '../../../types/forecast';

describe('DetailInfo', () => {
    let detailInfo: DetailInfo;
    let container: HTMLDivElement;

    beforeEach(() => {
        detailInfo = new DetailInfo();
        container = document.createElement('div');
    });

    test('should not render when data is null', () => {
        detailInfo.render(container, null as unknown as ForecastData);
        expect(container.children).toHaveLength(0);
    });

    test('should render 4 detail items', () => {
        const mockData: ForecastData = {
            city: 'Moscow',
            dt: '2024-01-01 12:00:00',
            description: 'clear',
            icon: '01d',
            temp: 7.24,
            temp_min: 5,
            speed: 3.08,
            pressure: 1030,
            humidity: 70
        };

        detailInfo.render(container, mockData);

        const items = container.querySelectorAll('.detail-item');
        expect(items).toHaveLength(4);
    });

    test('should render temperature correctly', () => {
        const mockData: ForecastData = {
            city: 'Moscow',
            dt: '2024-01-01 12:00:00',
            description: 'clear',
            icon: '01d',
            temp: 7.24,
            temp_min: 5,
            speed: 3.08,
            pressure: 1030,
            humidity: 70
        };

        detailInfo.render(container, mockData);

        const labels = container.querySelectorAll('.detail-label');
        const values = container.querySelectorAll('.detail-value');

        expect((labels[0] as HTMLElement).innerText).toBe('Температура');
        expect((values[0] as HTMLElement).innerText).toBe('7.24 °C');
    });

    test('should render all labels correctly', () => {
        const mockData: ForecastData = {
            city: 'Moscow',
            dt: '2024-01-01 12:00:00',
            description: 'clear',
            icon: '01d',
            temp: 7.24,
            temp_min: 5,
            speed: 3.08,
            pressure: 1030,
            humidity: 70
        };

        detailInfo.render(container, mockData);

        const labels = Array.from(container.querySelectorAll('.detail-label'));
        const expectedLabels = ['Температура', 'Давление', 'Влажность', 'Ветер'];

        expect(labels.map(l => (l as HTMLElement).innerText)).toEqual(expectedLabels);
    });

    test('should render all values correctly', () => {
        const mockData: ForecastData = {
            city: 'Moscow',
            dt: '2024-01-01 12:00:00',
            description: 'clear',
            icon: '01d',
            temp: 7.24,
            temp_min: 5,
            speed: 3.08,
            pressure: 1030,
            humidity: 70
        };

        detailInfo.render(container, mockData);

        const values = Array.from(container.querySelectorAll('.detail-value'));
        const expectedValues = ['7.24 °C', '1030 гПа', '70 %', '3.08 м/с'];

        expect(values.map(v => (v as HTMLElement).innerText)).toEqual(expectedValues);
    });

    test('should have correct CSS classes', () => {
        const mockData: ForecastData = {
            city: 'Moscow',
            dt: '2024-01-01 12:00:00',
            description: 'clear',
            icon: '01d',
            temp: 7.24,
            temp_min: 5,
            speed: 3.08,
            pressure: 1030,
            humidity: 70
        };

        detailInfo.render(container, mockData);

        expect(container.querySelector('.details-container')).not.toBeNull();
        expect(container.querySelector('.detail-item')).not.toBeNull();
        expect(container.querySelector('.detail-label')).not.toBeNull();
        expect(container.querySelector('.detail-value')).not.toBeNull();
    });

    test('should handle different temperature values', () => {
        const mockData: ForecastData = {
            city: 'Moscow',
            dt: '2024-01-01 12:00:00',
            description: 'clear',
            icon: '01d',
            temp: -5.5,
            temp_min: -10,
            speed: 10.5,
            pressure: 1000,
            humidity: 85
        };

        detailInfo.render(container, mockData);

        const values = Array.from(container.querySelectorAll('.detail-value'));
        expect((values[0] as HTMLElement).innerText).toBe('-5.5 °C');
        expect((values[1] as HTMLElement).innerText).toBe('1000 гПа');
        expect((values[2] as HTMLElement).innerText).toBe('85 %');
        expect((values[3] as HTMLElement).innerText).toBe('10.5 м/с');
    });
});