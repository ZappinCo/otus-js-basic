import { DetailInfo } from './detailInfo.js';

describe('DetailInfo', () => {
    let detailInfo;
    let container;

    beforeEach(() => {
        detailInfo = new DetailInfo();
        container = document.createElement('div');
    });

    test('should not render when data is null', () => {
        detailInfo.render(container, null);
        expect(container.children.length).toBe(0);
    });

    test('should render 4 detail items', () => {
        const mockData = {
            main: { temp: 7.24, pressure: 1030, humidity: 70 },
            wind: { speed: 3.08 }
        };

        detailInfo.render(container, mockData);

        const items = container.querySelectorAll('.detail-item');
        expect(items.length).toBe(4);
    });

    test('should render temperature correctly', () => {
        const mockData = {
            main: { temp: 7.24, pressure: 1030, humidity: 70 },
            wind: { speed: 3.08 }
        };

        detailInfo.render(container, mockData);

        const label = container.querySelector('.detail-label');
        const value = container.querySelector('.detail-value');
        
        expect(label.innerText).toBe('Температура');
        expect(value.innerText).toBe('7.24 °C');
    });

    test('should render all labels correctly', () => {
        const mockData = {
            main: { temp: 7.24, pressure: 1030, humidity: 70 },
            wind: { speed: 3.08 }
        };

        detailInfo.render(container, mockData);

        const labels = Array.from(container.querySelectorAll('.detail-label'));
        const expectedLabels = ['Температура', 'Давление', 'Влажность', 'Ветер'];
        
        expect(labels.map(l => l.innerText)).toEqual(expectedLabels);
    });

    test('should render all values correctly', () => {
        const mockData = {
            main: { temp: 7.24, pressure: 1030, humidity: 70 },
            wind: { speed: 3.08 }
        };

        detailInfo.render(container, mockData);

        const values = Array.from(container.querySelectorAll('.detail-value'));
        const expectedValues = ['7.24 °C', '1030 гПа', '70 %', '3.08 м/с'];
        
        expect(values.map(v => v.innerText)).toEqual(expectedValues);
    });

    test('should have correct CSS classes', () => {
        const mockData = {
            main: { temp: 7.24, pressure: 1030, humidity: 70 },
            wind: { speed: 3.08 }
        };

        detailInfo.render(container, mockData);

        expect(container.querySelector('.details-container')).not.toBeNull();
        expect(container.querySelector('.detail-item')).not.toBeNull();
        expect(container.querySelector('.detail-label')).not.toBeNull();
        expect(container.querySelector('.detail-value')).not.toBeNull();
    });
});