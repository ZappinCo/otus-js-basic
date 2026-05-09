import { parseWeatherApiResponse } from "./parseWeatherApiResponse";
import { PromiseResult } from "./eventBus";

describe('parseWeatherApiResponse', () => {
    test('should return empty array on error', () => {
        const result: PromiseResult = {
            success: false,
            error: new Error('Fail'),
            data: null
        };

        expect(parseWeatherApiResponse(result)).toEqual([]);
    });

    test('should return empty array on null data', () => {
        const result: PromiseResult = {
            success: true,
            error: null,
            data: null
        };

        expect(parseWeatherApiResponse(result)).toEqual([]);
    });

    test('should parse valid data correctly', () => {
        const mockData = {
            list: [{
                dt_txt: '2024-01-01 12:00:00',
                main: { temp: 20, temp_min: 15, pressure: 1013, humidity: 65 },
                weather: [{ description: 'clear', icon: '01d' }],
                wind: { speed: 5 }
            }],
            city: { name: 'Moscow' }
        };

        const result: PromiseResult = {
            success: true,
            error: null,
            data: mockData
        };

        const output = parseWeatherApiResponse(result);

        expect(output[0]).toMatchObject({
            city: 'Moscow',
            temp: 20,
            description: 'clear'
        });
    });
});