import { createDetailInfo } from './createDetailInfo';

describe('createDetailInfo', () => {
    test('should create detail', () => {
        const element = document.createElement('div');
        const mockData = {
            main: {
                temp: 7.24,
                pressure: 1030,
                humidity: 70
            },
            wind: {
                speed: 3.08
            }
        };

        createDetailInfo(element, mockData);

        const detailContainer = element.querySelector('.details-container');
        expect(detailContainer).not.toBeNull();
        
        const detailItems = detailContainer.querySelectorAll('.detail-item');
        expect(detailItems.length).toBe(4);
        
        const tempItem = detailItems[0];
        expect(tempItem.querySelector('.detail-label').innerText).toBe('Температура');
        expect(tempItem.querySelector('.detail-value').innerText).toBe('7.24 °C');
        
        const pressureItem = detailItems[1];
        expect(pressureItem.querySelector('.detail-label').innerText).toBe('Давление');
        expect(pressureItem.querySelector('.detail-value').innerText).toBe('1030 гПа');
        
        const humidityItem = detailItems[2];
        expect(humidityItem.querySelector('.detail-label').innerText).toBe('Влажность');
        expect(humidityItem.querySelector('.detail-value').innerText).toBe('70 %');
        
        const windItem = detailItems[3];
        expect(windItem.querySelector('.detail-label').innerText).toBe('Ветер');
        expect(windItem.querySelector('.detail-value').innerText).toBe('3.08 м/с');
    });
});