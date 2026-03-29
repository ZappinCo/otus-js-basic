import { runApp } from './runApp.js';
import { WeatherController } from './controllers/weatherController.js';

jest.mock('./models/weatherModel.js');
jest.mock('./views/weatherView.js');
jest.mock('./controllers/weatherController.js');
jest.mock('./services/weatherService.js');
jest.mock('./services/locationService.js');
jest.mock('./services/storageService.js');

describe('runApp', () => {
    test('should initialize app correctly', async () => {
        const element = document.createElement('div');
        const mockInitialize = jest.fn().mockResolvedValue();
        WeatherController.mockImplementation(() => ({ initialize: mockInitialize }));

        await runApp(element);

        expect(WeatherController).toHaveBeenCalled();
        expect(mockInitialize).toHaveBeenCalled();
    });

    test('should render view with element', async () => {
        const element = document.createElement('div');
        const mockRender = jest.fn();
        const { WeatherView } = await import('./views/weatherView.js');
        WeatherView.mockImplementation(() => ({ render: mockRender }));

        await runApp(element);

        expect(mockRender).toHaveBeenCalledWith(element);
    });
});