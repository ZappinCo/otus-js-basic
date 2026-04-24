// runApp.test.js
import { runApp } from './runApp.js';
import { WeatherModel } from './models/weatherModel.js';
import { WeatherView } from './views/weatherView.js';
import { WeatherController } from './controllers/weatherController.js';
import { WeatherService } from './services/weatherService.js';
import { LocationService } from './services/locationService.js';
import { StorageService } from './services/storageService.js';

jest.mock('./models/weatherModel.js');
jest.mock('./views/weatherView.js');
jest.mock('./controllers/weatherController.js');
jest.mock('./services/weatherService.js');
jest.mock('./services/locationService.js');
jest.mock('./services/storageService.js');

describe('runApp', () => {
    let mockElement;

    beforeEach(() => {
        jest.clearAllMocks();
        mockElement = document.createElement('div');
    });

    test('should create all services and components', async () => {
        await runApp(mockElement);

        expect(WeatherService).toHaveBeenCalled();
        expect(LocationService).toHaveBeenCalled();
        expect(StorageService).toHaveBeenCalled();
        expect(WeatherModel).toHaveBeenCalled();
        expect(WeatherView).toHaveBeenCalled();
        expect(WeatherController).toHaveBeenCalled();
    });

    test('should render view with element', async () => {
        const mockRender = jest.fn();
        WeatherView.mockImplementation(() => ({ render: mockRender }));

        await runApp(mockElement);

        expect(mockRender).toHaveBeenCalledWith(mockElement);
    });

    test('should pass view to controller', async () => {
        const mockView = { render: jest.fn() };
        WeatherView.mockImplementation(() => mockView);

        await runApp(mockElement);

        expect(WeatherController).toHaveBeenCalledWith(mockView);
    });
});